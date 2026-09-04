import "server-only";
import { randomUUID } from "node:crypto";
import { mkdir, writeFile } from "node:fs/promises";
import { homedir } from "node:os";
import { join } from "node:path";
import { GoogleGenAI } from "@google/genai";
import type { SupabaseClient } from "@supabase/supabase-js";
import {
  GEMINI_CONTENT_CLIPS_MODEL,
  GEMINI_CONTENT_CLIPS_RESPONSE_SCHEMA,
  MAX_CLIPS_PER_REQUEST,
  MAX_CLIP_DURATION_MS,
  MIN_CLIP_DURATION_MS,
  type OracleClipDetectionResult,
  type OracleContentClipCandidate,
} from "./oracle-clip-detection-report";
import { cutContentClip } from "./local-clip-cutter";
import { describeGeminiFailure, withGeminiRetry } from "../gemini/gemini-retry";
import { recordGeminiUsage } from "../gemini/gemini-usage-log";

export type GenerateContentClipsInput = Readonly<{
  supabase: SupabaseClient;
  operatorId: string;
  game: string;
  /** Local path to the source recording already written to disk. */
  videoPath: string;
  /** e.g. "video/webm" -- any ";codecs=..." suffix is stripped before use. */
  mimeType: string;
  matchStartOffsetMs: number | null;
  /**
   * Where to write finished clips -- the renderer resolves this via
   * Electron's getClipsOutputRoot() (see desktop/overlay-window.ts) so it
   * lands in the Operator's real Documents folder even when that's been
   * redirected (e.g. OneDrive), and passes it along with the request.
   * Falls back to a plain home-directory join if genuinely not given,
   * rather than failing outright.
   */
  outputRoot?: string | null;
}>;

export type GeneratedContentClip = Readonly<{
  title: string;
  hook: string;
  caption: string;
  reason: string;
  momentType: OracleContentClipCandidate["momentType"];
  confidence: OracleContentClipCandidate["confidence"];
  startOffsetMs: number;
  endOffsetMs: number;
  /** Local path to the finished vertical .mp4 clip. */
  filePath: string;
}>;

export type GenerateContentClipsResult =
  | Readonly<{ status: "complete"; clips: readonly GeneratedContentClip[]; outputFolder: string }>
  | Readonly<{ status: "failed"; error: string }>;

// Same polling approach as Full Match Analysis's video coaching service --
// see oracle-match-video-coaching-service.ts for why these values were
// chosen.
const FILE_ACTIVE_POLL_INTERVAL_MS = 3_000;
const FILE_ACTIVE_TIMEOUT_MS = 10 * 60 * 1_000;

// Deliberately genre-general: Content Clips is meant to work for every
// game Oracle eventually covers, not just Call of Duty (the caller tells
// Gemini what game this footage is from, but the reasoning below never
// names a CoD-specific mechanic) -- same split between a general reasoning
// core and a game-specific caller that oracle-loadout-recommendation-
// service.ts already uses for weapon pairing.
const CLIP_DETECTION_SYSTEM_PROMPT = `
You are Oracle, reviewing a full local recording of one player's own match
-- video and audio both -- to find the handful of moments genuinely worth
cutting into short clips for that player's social media (TikTok, YouTube
Shorts, Instagram Reels). You are not writing a coaching report here --
you're a sharp, honest short-form video editor picking out what an
audience of strangers would actually stop scrolling for.

Look for real standout moments: outstanding skill or precision, a dramatic
clutch or reversal, something genuinely funny (including the player's own
mistakes), a chaotic or exciting sequence, or a rare/milestone achievement.
This reasoning applies regardless of what specific game the footage is
from -- these are the same qualities that make any gameplay moment
shareable, not something specific to one genre.

Be honest and selective. Most of a match is not clip-worthy, and a handful
of strong moments beats a full list of mediocre ones -- return fewer (even
zero) rather than padding this out. For each moment you do pick, give
precise start/end offsets (a couple of seconds before the key action so it
has room to build, a beat after it resolves so it isn't cut off), a short
punchy on-screen hook line, and a separate ready-to-post caption.

Write the hook and caption like an actual creator posting this clip, not
like a video file name or a match-report headline. Bland, purely
descriptive labels ("Clearing the tennis courts cleanly") are exactly what
to avoid -- they don't earn a scroll-stopping thumbnail moment. Instead:
- Pull a real, specific detail out of THIS moment (a kill count, a weapon,
  a place name, how close it was, how fast it happened) rather than a
  generic label -- specifics are what make a clip feel real instead of
  templated.
- Hook lines should read like something a creator would actually type in
  6 words or fewer while hyped. Punctuation, ALL CAPS, or a number up
  front are all fair game if they fit the moment.
- Captions should have a real hook of their own (the first few words are
  what shows before "...more" on most platforms) -- lead with the payoff
  or the stakes, not a flat description. 1-2 relevant hashtags at the end
  (not more), matched to the actual game/moment rather than a stock set.
- Never invent a stat or detail that isn't actually visible in the
  footage -- specific and honest beats generic every time, but a made-up
  number is worse than a plain one.

Vary the shape of the hook to match what actually happened -- don't reach
for the same "[NOUN] PERMITTED" / "CALL IN THE [NOUN]" template every time,
even though those are fine occasionally. Some real examples of the
difference (never reuse these verbatim -- they're here to show the level
of specificity and variety to aim for, not phrases to copy):
- Weak: "No Parachute Permitted" / "Thought he was gliding to safety."
  Strong (same kind of moment, more specific): "SNIPED HIM MID-AIR" /
  "Full send off the tower and he never even landed."
- Weak: "Does Not Miss" / "Two completely different directions deleted
  back-to-back."
- Strong (same kind of moment, more specific): "180 NO SCOPE, BOTH GUYS
  GONE" / "Spun a full 180 and cleaned up two guys who thought they had
  him."
- Weak: "Call In The Airstrike" / "Precision strike inbound and a clean
  spray to finish the contract."
- Strong (same kind of moment, more specific): "KILLSTREAK ENDS THE
  CONTRACT" / "Called it in with 3 seconds left on the timer and it
  couldn't have landed better."
`.trim();

export async function generateContentClips(
  input: GenerateContentClipsInput
): Promise<GenerateContentClipsResult> {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    return { status: "failed", error: "GEMINI_API_KEY is not configured on this server." };
  }

  const ai = new GoogleGenAI({ apiKey });
  const mimeType = input.mimeType.split(";")[0].trim() || "video/webm";

  try {
    const uploaded = await withGeminiRetry("clip detection upload", () =>
      ai.files.upload({ file: input.videoPath, config: { mimeType } })
    );
    if (!uploaded.name) {
      throw new Error("Gemini did not return a file name for the upload.");
    }

    let detection: OracleClipDetectionResult;
    try {
      const active = await waitForFileActive(ai, uploaded.name);
      const fileUri = active.uri ?? uploaded.uri;
      if (!fileUri) {
        throw new Error("Gemini did not return a URI for the uploaded video.");
      }

      const clipNote =
        input.matchStartOffsetMs && input.matchStartOffsetMs > 0
          ? "The video below has been trimmed to start at (or very close " +
            "to) the moment the player actually dropped into the match."
          : "The video below starts from the very beginning of the " +
            "recording, so it may include a short stretch of lobby/" +
            "loadout/deploy-screen footage before the match itself starts.";

      const response = await withGeminiRetry("clip detection", () =>
        ai.models.generateContent({
          model: GEMINI_CONTENT_CLIPS_MODEL,
          contents: [
            {
              role: "user",
              parts: [
                {
                  text:
                    `This is a full local recording of one player's own ` +
                    `${input.game} match. ${clipNote} Find up to ` +
                    `${MAX_CLIPS_PER_REQUEST} genuinely shareworthy ` +
                    "moments, with real millisecond offsets into this " +
                    "video for each.",
                },
                {
                  fileData: { fileUri, mimeType },
                  ...(input.matchStartOffsetMs && input.matchStartOffsetMs > 0
                    ? {
                        videoMetadata: {
                          startOffset: `${(input.matchStartOffsetMs / 1_000).toFixed(2)}s`,
                        },
                      }
                    : {}),
                },
              ],
            },
          ],
          config: {
            systemInstruction: CLIP_DETECTION_SYSTEM_PROMPT,
            responseMimeType: "application/json",
            responseJsonSchema: GEMINI_CONTENT_CLIPS_RESPONSE_SCHEMA,
          },
        })
      );

      const text = response.text;
      if (!text) {
        throw new Error("Gemini returned an empty response.");
      }
      detection = JSON.parse(text) as OracleClipDetectionResult;

      await recordGeminiUsage(input.supabase, {
        operatorId: input.operatorId,
        feature: "content-clips",
        model: GEMINI_CONTENT_CLIPS_MODEL,
        response,
      });
    } finally {
      await ai.files.delete({ name: uploaded.name }).catch(() => undefined);
    }

    const candidates = clampAndCap(detection.clips ?? []);
    if (candidates.length === 0) {
      return { status: "complete", clips: [], outputFolder: "" };
    }

    const outputRoot =
      input.outputRoot && input.outputRoot.trim()
        ? input.outputRoot
        : join(homedir(), "Documents", "Oracle Clips");
    const outputFolder = join(outputRoot, buildMatchFolderName());
    await mkdir(outputFolder, { recursive: true });

    const clips: GeneratedContentClip[] = [];
    for (const [index, candidate] of candidates.entries()) {
      const filePath = join(outputFolder, `clip-${index + 1}.mp4`);
      try {
        await cutContentClip({
          sourceVideoPath: input.videoPath,
          outputPath: filePath,
          startOffsetMs: candidate.startOffsetMs,
          endOffsetMs: candidate.endOffsetMs,
          hookText: candidate.hook,
        });
        clips.push({ ...candidate, filePath });
      } catch (error) {
        // One clip failing to cut shouldn't take the rest down with it --
        // log it and move on, same "never let one bad part sink the whole
        // result" approach as everywhere else in this codebase.
        console.warn(
          `[content-clips] failed to cut clip ${index + 1}:`,
          error
        );
      }
    }

    if (clips.length > 0) {
      await writeFile(
        join(outputFolder, "manifest.json"),
        JSON.stringify(
          { game: input.game, generatedAt: new Date().toISOString(), clips },
          null,
          2
        ),
        "utf8"
      ).catch(() => undefined);
    }

    return { status: "complete", clips, outputFolder };
  } catch (error) {
    return { status: "failed", error: describeGeminiFailure(error) };
  }
}

function clampAndCap(
  candidates: readonly OracleContentClipCandidate[]
): OracleContentClipCandidate[] {
  const clamped: OracleContentClipCandidate[] = [];
  for (const candidate of candidates) {
    if (
      !Number.isFinite(candidate.startOffsetMs) ||
      !Number.isFinite(candidate.endOffsetMs) ||
      candidate.startOffsetMs < 0
    ) {
      continue;
    }
    const start = Math.max(0, Math.round(candidate.startOffsetMs));
    let duration = Math.round(candidate.endOffsetMs) - start;
    if (duration <= 0) continue;
    duration = Math.min(
      MAX_CLIP_DURATION_MS,
      Math.max(MIN_CLIP_DURATION_MS, duration)
    );
    clamped.push({ ...candidate, startOffsetMs: start, endOffsetMs: start + duration });
  }
  return clamped.slice(0, MAX_CLIPS_PER_REQUEST);
}

function buildMatchFolderName(): string {
  const now = new Date();
  const dateStamp = now.toISOString().slice(0, 10);
  return `${dateStamp}-${randomUUID().slice(0, 8)}`;
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
