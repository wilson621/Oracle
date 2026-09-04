import { GoogleGenAI } from "@google/genai";
import type { OracleMatchCoachingReportRow } from "../match-coaching/oracle-match-coaching-report";
import { describeGeminiFailure, withGeminiRetry } from "../gemini/gemini-retry";
import { recordGeminiUsage } from "../gemini/gemini-usage-log";
import {
  GEMINI_REPORT_CHAT_MODEL,
  MAX_HISTORY_MESSAGES_FOR_PROMPT,
  type OracleReportChatMessageRow,
} from "./oracle-report-chat-types";
import type { SupabaseClient } from "@supabase/supabase-js";

const REPORT_CHAT_SYSTEM_PROMPT = `
You are Oracle, an AI Call of Duty coach. The Operator already has a full
match report from you (given below) and is now asking follow-up questions
about that specific match -- like a player asking their coach to expand on
something after reviewing game tape together.

Answer using only the report content given below, plus the conversation so
far. Never invent a detail -- a death, a timestamp, a score, a weapon --
that isn't actually in the report. If the Operator asks something this
report genuinely doesn't cover (a different match, something the footage
never showed), say so plainly rather than guessing or making something up.

Keep answers conversational and specific, the way a real coach talks
through a match with a player: reference concrete details already in the
report (an exact score, a specific death's timestamp, a playstyle
observation) rather than vague generalities. Keep it reasonably short
unless the question genuinely calls for a longer answer.
`.trim();

export type AskAboutReportInput = Readonly<{
  operatorId: string;
  report: OracleMatchCoachingReportRow;
  /** Prior messages for this report, oldest first. */
  history: readonly Pick<OracleReportChatMessageRow, "role" | "content">[];
  question: string;
}>;

export type AskAboutReportResult =
  | Readonly<{ status: "answered"; answer: string }>
  | Readonly<{ status: "failed"; answer: string }>;

/**
 * Calls Gemini (plain text, no video/grounding -- the report itself is all
 * the context needed) to answer one follow-up question about a specific
 * match report. Never throws: a failure is returned as status "failed"
 * with a customer-readable explanation as its `answer`, so the caller can
 * still save a real message into the thread instead of the question just
 * silently going nowhere (same reasoning as generateMatchVideoCoachingReport
 * always returning a row rather than throwing).
 */
export async function askOracleAboutReport(
  supabase: SupabaseClient,
  input: AskAboutReportInput
): Promise<AskAboutReportResult> {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    return {
      status: "failed",
      answer: "Oracle chat isn't configured on this server yet.",
    };
  }

  try {
    const ai = new GoogleGenAI({ apiKey });
    const recentHistory = input.history.slice(
      -MAX_HISTORY_MESSAGES_FOR_PROMPT
    );

    const response = await withGeminiRetry("report chat", () =>
      ai.models.generateContent({
        model: GEMINI_REPORT_CHAT_MODEL,
        contents: [
          ...recentHistory.map((message) => ({
            role: message.role === "operator" ? "user" : "model",
            parts: [{ text: message.content }],
          })),
          {
            role: "user",
            parts: [{ text: input.question }],
          },
        ],
        config: {
          systemInstruction:
            `${REPORT_CHAT_SYSTEM_PROMPT}\n\n` +
            `--- MATCH REPORT ---\n${formatReportForPrompt(input.report)}`,
        },
      })
    );

    const text = response.text;
    if (!text || !text.trim()) {
      throw new Error("Gemini returned an empty response.");
    }

    await recordGeminiUsage(supabase, {
      operatorId: input.operatorId,
      feature: "oracle-chat",
      model: GEMINI_REPORT_CHAT_MODEL,
      response,
    });

    return { status: "answered", answer: text.trim() };
  } catch (error) {
    return { status: "failed", answer: describeGeminiFailure(error) };
  }
}

/**
 * A compact, readable text block of everything Full Match Analysis captured
 * for this report -- text rather than raw JSON both because it's more
 * token-efficient (no key-name/null repetition) and because Gemini reads
 * plain prose more reliably than a schema-shaped blob it has to parse back
 * out itself.
 */
function formatReportForPrompt(
  report: OracleMatchCoachingReportRow
): string {
  const lines: string[] = [
    `Game: ${report.game}`,
    `Match window: ${report.started_at} to ${report.ended_at}`,
  ];

  if (report.status !== "complete") {
    lines.push(
      `Report status: ${report.status}` +
        (report.raw_error ? ` (${report.raw_error})` : "")
    );
  }
  if (report.verdict) lines.push(`Verdict: ${report.verdict}`);
  if (report.summary) lines.push(`Summary: ${report.summary}`);

  if (report.positioning !== null) {
    lines.push(
      "Scores (0-100): " +
        `positioning ${report.positioning}, aim ${report.aim}, ` +
        `movement ${report.movement}, decision making ${report.decision_making}, ` +
        `game sense ${report.game_sense}`
    );
  }

  if (report.deaths.length > 0) {
    lines.push("Death by death:");
    for (const death of report.deaths) {
      lines.push(
        `- [${death.whenInMatch}] ${death.whatHappened} ` +
          `Sightline: ${death.enemySightlineAssessment} ` +
          `${death.couldHaveActedSooner ? "Could have acted sooner." : "Reaction time looked reasonable."} ` +
          `What to do differently: ${death.whatToDoDifferently} ` +
          `(confidence: ${death.confidence})`
      );
    }
  }

  const playstyleParts: string[] = [];
  if (report.engagement_range) {
    playstyleParts.push(`engagement range: ${report.engagement_range}`);
  }
  if (report.aggression_style) {
    playstyleParts.push(`aggression style: ${report.aggression_style}`);
  }
  if (report.movement_style) {
    playstyleParts.push(`movement style: ${report.movement_style}`);
  }
  if (report.weapons_observed.length > 0) {
    playstyleParts.push(
      `weapons observed: ${report.weapons_observed.join(", ")}`
    );
  }
  if (report.notable_tendencies.length > 0) {
    playstyleParts.push(
      `notable tendencies: ${report.notable_tendencies.join("; ")}`
    );
  }
  if (playstyleParts.length > 0) {
    lines.push(`Playstyle: ${playstyleParts.join("; ")}`);
  }

  return lines.join("\n");
}
