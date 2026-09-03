import { randomUUID } from "node:crypto";
import OpenAI from "openai";
import type { SupabaseClient } from "@supabase/supabase-js";
import {
  MATCH_COACHING_JSON_SCHEMA,
  OPENAI_MATCH_COACHING_MODEL,
  type OracleMatchCoachingReport,
} from "./oracle-match-coaching-report";
import { type SelectableFrame } from "./select-report-frames";
import { persistMatchCoachingReport } from "./persist-match-coaching-report";

export type GenerateMatchCoachingReportInput = Readonly<{
  supabase: SupabaseClient;
  operatorId: string;
  clientSessionId: string;
  game: string;
  startedAt: string;
  endedAt: string;
  frames: readonly SelectableFrame[];
}>;

const SYSTEM_PROMPT = `
You are Oracle, an in-depth Call of Duty coaching analyst. You are shown a
bounded set of screenshots captured locally from one Operator's own play
session: a spread of frames across the whole session for overall context,
plus short bursts of frames around the moments where the screen changed the
most (usually deaths and killcams).

Write coaching the way a sharp, honest human coach reviewing this footage
would: specific, concrete, and grounded only in what is actually visible.
For every death you can identify from the frames, reconstruct what
happened and, where a killcam frame is present, use it -- it is the closest
thing to ground truth about what the killer actually saw. When no killcam
is visible for a death, say so plainly and reason only from what led up to
it (exposure time, movement, positioning) rather than inventing certainty
you don't have.

Never state something as certain that the frames don't actually show.
Prefer "likely", "the killcam suggests", "based on how long you were
exposed" over flat assertions. If the frames are too sparse to say anything
useful about a moment, say that instead of guessing.
`.trim();

/**
 * Calls OpenAI to turn a bounded set of locally captured match screenshots
 * into a structured coaching report, then saves the result (success or
 * failure) to oracle_match_coaching_reports.
 *
 * Always returns a report row rather than throwing, so a failed OpenAI call
 * still leaves the Operator with a saved, visible "this didn't work"
 * record instead of the request just disappearing.
 */
export async function generateMatchCoachingReport(
  input: GenerateMatchCoachingReportInput
): Promise<OracleMatchCoachingReport> {
  const id = randomUUID();
  const base = {
    id,
    operatorId: input.operatorId,
    game: input.game,
    clientSessionId: input.clientSessionId,
    startedAt: input.startedAt,
    endedAt: input.endedAt,
    generatedAt: new Date().toISOString(),
    frameCount: input.frames.length,
  } as const;

  // Frame selection already happened on-device (see
  // desktop/companion/match-recording-coordinator.ts) before this ever left
  // the Operator's PC, so `input.frames` is already the bounded, curated
  // set in chronological order. Re-running selectReportFrames here used to
  // apply the same "evenly spaced overview + biggest diff spikes" logic a
  // *second* time on top of an already-reduced, non-uniformly-spaced set --
  // which could silently drop frames the first pass deliberately kept
  // (e.g. killcam context) in favor of re-picking its own "overview" from
  // what was left. Trust the already-selected set instead.
  const selected = input.frames;
  if (selected.length === 0) {
    return persistMatchCoachingReport(input.supabase, {
      ...base,
      status: "failed",
      model: null,
      summary: null,
      verdict: null,
      scores: null,
      deaths: [],
      rawError: "No frames were captured during this watch session.",
    });
  }

  const apiKey = process.env.OPENAI_API_KEY;
  if (!apiKey) {
    return persistMatchCoachingReport(input.supabase, {
      ...base,
      status: "failed",
      model: null,
      summary: null,
      verdict: null,
      scores: null,
      deaths: [],
      rawError: "OPENAI_API_KEY is not configured on this server.",
    });
  }

  try {
    const client = new OpenAI({ apiKey });
    const response = await client.responses.create({
      model: OPENAI_MATCH_COACHING_MODEL,
      input: [
        {
          role: "system",
          content: SYSTEM_PROMPT,
        },
        {
          role: "user",
          content: [
            {
              type: "input_text",
              text:
                `This watch session ran from ${input.startedAt} to ` +
                `${input.endedAt} (${input.game}). ${selected.length} ` +
                "frames are attached in chronological order. At most one " +
                "early frame may show pre-match loadout/lobby for context " +
                "-- the rest are concentrated on the part of the session " +
                "after the Operator likely dropped into the match, either " +
                "as a spread across it or in a burst around a large " +
                "visual change. Produce the full coaching report.",
            },
            ...selected.map((frame) => ({
              type: "input_image" as const,
              image_url: `data:image/jpeg;base64,${frame.jpegBase64}`,
              detail: "auto" as const,
            })),
          ],
        },
      ],
      text: {
        format: {
          type: "json_schema",
          ...MATCH_COACHING_JSON_SCHEMA,
        },
      },
    });

    const parsed = JSON.parse(response.output_text) as {
      summary: string;
      verdict: string;
      scores: NonNullable<OracleMatchCoachingReport["scores"]>;
      deaths: OracleMatchCoachingReport["deaths"];
    };

    return persistMatchCoachingReport(input.supabase, {
      ...base,
      status: "complete",
      model: OPENAI_MATCH_COACHING_MODEL,
      summary: parsed.summary,
      verdict: parsed.verdict,
      scores: parsed.scores,
      deaths: parsed.deaths,
      rawError: null,
    });
  } catch (error) {
    return persistMatchCoachingReport(input.supabase, {
      ...base,
      status: "failed",
      model: OPENAI_MATCH_COACHING_MODEL,
      summary: null,
      verdict: null,
      scores: null,
      deaths: [],
      rawError: error instanceof Error ? error.message : String(error),
    });
  }
}
