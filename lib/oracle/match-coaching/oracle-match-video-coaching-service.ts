import { randomUUID } from "node:crypto";
import { GoogleGenAI } from "@google/genai";
import type { SupabaseClient } from "@supabase/supabase-js";
import {
  GEMINI_MATCH_COACHING_MODEL,
  GEMINI_MATCH_COACHING_RESPONSE_SCHEMA,
  type OracleMatchCoachingReport,
  type OracleMatchCoachingReportRow,
} from "./oracle-match-coaching-report";
import { persistMatchCoachingReport } from "./persist-match-coaching-report";
import {
  describeGeminiFailure,
  withGeminiRetry,
} from "../gemini/gemini-retry";

export type GenerateMatchVideoCoachingReportInput = Readonly<{
  supabase: SupabaseClient;
  operatorId: string;
  clientSessionId: string;
  game: string;
  startedAt: string;
  endedAt: string;
  /**
   * Local path to the video file already written to disk on this server
   * (the API route streams the uploaded body there before calling this
   * function) -- never held fully in memory here, and never touched by
   * this function beyond reading it for the Gemini upload. The caller owns
   * deleting it once this returns.
   */
  videoPath: string;
  /** e.g. "video/webm" -- any ";codecs=..." suffix is stripped before use. */
  mimeType: string;
  durationMs: number;
  /**
   * Best-effort local motion-sampling estimate of how far into the video
   * the match actually starts (see match-video-recording-coordinator.ts).
   * When present, this is used to clip Gemini's analysis window via the
   * video part's own startOffset -- not just a prompt hint -- so lobby/
   * loadout/deploy-screen time never dilutes the analysis. null is always
   * safe: it just means the whole video is analysed from the start.
   */
  matchStartOffsetMs: number | null;
}>;

// Gemini's video understanding samples at 1fps by default regardless of the
// source framerate. The recorded video was already captured at a bounded
// low framerate for exactly this reason (see
// match-video-recording-coordinator.ts) -- 1fps here is treated as roughly
// "one sampled frame per second of match", which is what frame_count below
// approximates for a video-based report. There are no discrete captured
// frames in this pipeline, so it's an honest analogue rather than a literal
// count, kept so the column still means something comparable to what it
// would for any other report in the same table.
const APPROX_GEMINI_SAMPLES_PER_SECOND = 1;

// How long to wait for Gemini's Files API to finish processing an uploaded
// video (PROCESSING -> ACTIVE) before giving up. Processing time scales
// with video length/size; this comfortably covers even a full 45-minute
// recording without leaving a request hanging indefinitely if something on
// Google's side genuinely stalls.
const FILE_ACTIVE_POLL_INTERVAL_MS = 3_000;
const FILE_ACTIVE_TIMEOUT_MS = 10 * 60 * 1_000;

const VIDEO_SYSTEM_PROMPT = `
You are Oracle, an elite Call of Duty coaching analyst reviewing a full,
continuous recording of one Operator's own match -- video and audio both --
captured locally on their own PC. This is a real advantage over reviewing
screenshots or a written recap: you can watch the match play out and hear
it too, so use both. Audio matters -- footsteps, gunfire, and the apparent
direction/distance of sound are exactly the kind of concrete, groundable
detail that makes coaching sharper ("footsteps are audible behind you a
couple of seconds before you turn" is a real, checkable observation, not a
guess). If the audio track is silent or unhelpful for a stretch, just work
from the video for that part instead of inventing sounds.

Reference real mm:ss timestamps from the video whenever you describe a
specific moment -- this is the biggest single advantage this format has
over a handful of screenshots, so use it throughout, especially for every
death you cover.

Write the way the sharpest, most honest human coach in the world would if
they had frame-perfect recall and unlimited time to rewatch every
engagement: specific, concrete, and grounded only in what the footage
actually shows or the audio actually suggests. For every death, reconstruct
what happened using the killcam if the game shows one (it's the closest
thing to ground truth about what the killer actually saw), or the last
several seconds of first-person footage before it when there's no killcam.

Never state something as certain that the footage doesn't actually support.
Prefer "likely", "the killcam shows", "the audio suggests" over flat
assertions, and say plainly when a moment is inconclusive rather than
inventing certainty you don't have. A wrong confident guess is worse
coaching than an honest "unclear from this footage."

Alongside the coaching report itself, also record structured playstyle
observations (the playstyle field) purely from what this match's footage
shows: preferred engagement range, aggression level, movement habits, the
actual weapons visible in the HUD/killfeed/loadout, and any other specific
tendencies worth noting. This feeds a separate personalised loadout feature,
so it matters that these stay grounded in this footage rather than becoming
a generic character sketch -- use null/empty values rather than guessing
when the footage genuinely doesn't show enough to judge something.
`.trim();

/**
 * Calls Gemini to turn a full local screen recording of a match (video +
 * system audio) into a structured coaching report, then saves it (success
 * or failure) to the oracle_match_coaching_reports table.
 *
 * Always returns a report row rather than throwing, so a failed Gemini call
 * still leaves the Operator with a saved, visible "this didn't work" record
 * instead of the request just disappearing.
 */
export async function generateMatchVideoCoachingReport(
  input: GenerateMatchVideoCoachingReportInput
): Promise<OracleMatchCoachingReportRow> {
  const id = randomUUID();
  const approxSampleCount = Math.max(
    1,
    Math.round(
      (input.durationMs / 1_000) * APPROX_GEMINI_SAMPLES_PER_SECOND
    )
  );
  const base = {
    id,
    operatorId: input.operatorId,
    game: input.game,
    clientSessionId: input.clientSessionId,
    startedAt: input.startedAt,
    endedAt: input.endedAt,
    generatedAt: new Date().toISOString(),
    frameCount: approxSampleCount,
  } as const;

  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    return persistMatchCoachingReport(input.supabase, {
      ...base,
      status: "failed",
      model: null,
      summary: null,
      verdict: null,
      scores: null,
      deaths: [],
      playstyle: null,
      rawError: "GEMINI_API_KEY is not configured on this server.",
    });
  }

  try {
    const ai = new GoogleGenAI({ apiKey });
    const mimeType = input.mimeType.split(";")[0].trim() || "video/webm";

    const uploaded = await withGeminiRetry("video upload", () =>
      ai.files.upload({
        file: input.videoPath,
        config: { mimeType },
      })
    );
    if (!uploaded.name) {
      throw new Error("Gemini did not return a file name for the upload.");
    }

    const active = await waitForFileActive(ai, uploaded.name);
    const fileUri = active.uri ?? uploaded.uri;
    if (!fileUri) {
      throw new Error("Gemini did not return a URI for the uploaded video.");
    }

    try {
      const clipNote =
        input.matchStartOffsetMs && input.matchStartOffsetMs > 0
          ? "The video below has been trimmed to start at (or very close " +
            "to) the moment the Operator actually dropped into the match " +
            "-- an automatic estimate already removed most of the " +
            "lobby/loadout/deploy-screen time beforehand, so don't expect " +
            "to see the main menu."
          : "The video below starts from the very beginning of the " +
            "recording, so it may include a short stretch of " +
            "lobby/loadout/deploy-screen footage before the match itself " +
            "starts -- skip past that in your analysis.";

      const response = await withGeminiRetry("report generation", () =>
        ai.models.generateContent({
          model: GEMINI_MATCH_COACHING_MODEL,
          contents: [
            {
              role: "user",
              parts: [
                {
                  text:
                    `This is a full local recording of one Operator's own ` +
                    `${input.game} match, from ${input.startedAt} to ` +
                    `${input.endedAt}. ${clipNote} Produce the full coaching ` +
                    "report, using real mm:ss timestamps from the video for " +
                    "every death.",
                },
                {
                  fileData: { fileUri, mimeType },
                  ...(input.matchStartOffsetMs && input.matchStartOffsetMs > 0
                    ? {
                        videoMetadata: {
                          startOffset: `${(
                            input.matchStartOffsetMs / 1_000
                          ).toFixed(2)}s`,
                        },
                      }
                    : {}),
                },
              ],
            },
          ],
          config: {
            systemInstruction: VIDEO_SYSTEM_PROMPT,
            responseMimeType: "application/json",
            responseJsonSchema: GEMINI_MATCH_COACHING_RESPONSE_SCHEMA,
          },
        })
      );

      const text = response.text;
      if (!text) {
        throw new Error("Gemini returned an empty response.");
      }
      const parsed = JSON.parse(text) as {
        summary: string;
        verdict: string;
        scores: NonNullable<OracleMatchCoachingReport["scores"]>;
        deaths: OracleMatchCoachingReport["deaths"];
        playstyle: OracleMatchCoachingReport["playstyle"];
      };

      return await persistMatchCoachingReport(input.supabase, {
        ...base,
        status: "complete",
        model: GEMINI_MATCH_COACHING_MODEL,
        summary: parsed.summary,
        verdict: parsed.verdict,
        scores: parsed.scores,
        deaths: parsed.deaths,
        playstyle: parsed.playstyle,
        rawError: null,
      });
    } finally {
      // Don't leave the video sitting in Gemini's file storage indefinitely
      // once we're done with it -- best-effort, never lets cleanup failure
      // mask (or block returning) the actual report result.
      await ai.files.delete({ name: uploaded.name }).catch(() => undefined);
    }
  } catch (error) {
    return persistMatchCoachingReport(input.supabase, {
      ...base,
      status: "failed",
      model: GEMINI_MATCH_COACHING_MODEL,
      summary: null,
      verdict: null,
      scores: null,
      deaths: [],
      playstyle: null,
      rawError: describeGeminiFailure(error),
    });
  }
}

async function waitForFileActive(
  ai: GoogleGenAI,
  name: string
): Promise<{ uri?: string }> {
  const deadline = Date.now() + FILE_ACTIVE_TIMEOUT_MS;
  for (;;) {
    const file = await ai.files.get({ name });
    if (file.state === "ACTIVE") {
      return { uri: file.uri };
    }
    if (file.state === "FAILED") {
      const message = file.error?.message ?? "Gemini file processing failed.";
      throw new Error(message);
    }
    if (Date.now() >= deadline) {
      throw new Error(
        "Timed out waiting for Gemini to finish processing the uploaded video."
      );
    }
    await sleep(FILE_ACTIVE_POLL_INTERVAL_MS);
  }
}

function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}
