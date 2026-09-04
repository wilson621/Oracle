/**
 * The shape Gemini is asked to produce when reviewing a full match
 * recording for Content Clips: a short list of specific, shareworthy
 * moments (with real timestamps) plus ready-to-use social copy for each.
 *
 * Deliberately genre-general rather than Call of Duty-specific -- Oracle's
 * Content Clips feature is meant to work for every game Oracle eventually
 * covers, not just CoD/Warzone (this is the CoD-specific caller of a
 * genre-agnostic reasoning core, same split as
 * oracle-loadout-recommendation-service.ts keeps between its CoD prompt and
 * its general weapon-pairing logic). Nothing here -- the schema, the
 * prompt, or momentType's enum -- names a CoD-specific mechanic; the only
 * CoD-specific thing is the caller telling Gemini what game this footage is
 * from.
 */

export type OracleContentClipMomentType =
  | "skill-highlight"
  | "clutch-moment"
  | "funny-fail"
  | "big-play"
  | "milestone"
  | "other";

export type OracleContentClipCandidate = Readonly<{
  /** Short, punchy title -- for Oracle's own UI, not necessarily posted. */
  title: string;
  /**
   * A short (under ~8 words), on-screen-ready hook line for the first
   * second of the clip -- the thing that stops someone scrolling. Burned
   * directly onto the vertical clip as text (see local-clip-cutter.ts).
   */
  hook: string;
  /**
   * A ready-to-post social caption (a sentence or two, may include a
   * couple of relevant hashtags) -- separate from the on-screen hook, this
   * is copy-paste text for the post itself.
   */
  caption: string;
  /** Why this moment is actually shareworthy, grounded in the footage. */
  reason: string;
  momentType: OracleContentClipMomentType;
  /** Milliseconds from the start of the analysed video. */
  startOffsetMs: number;
  endOffsetMs: number;
  confidence: "low" | "medium" | "high";
}>;

export type OracleClipDetectionResult = Readonly<{
  clips: readonly OracleContentClipCandidate[];
}>;

// Same model as the other Gemini-backed Oracle features -- see the pricing
// note in gemini-usage-log.ts. Structured extraction + grounded reasoning
// from an already-reduced-fps video is exactly Flash's strength, same
// reasoning as GEMINI_MATCH_COACHING_MODEL.
export const GEMINI_CONTENT_CLIPS_MODEL = "gemini-3.8-flash";

// Upper bound on how many clips a single request will actually cut --
// keeps local ffmpeg processing time and disk usage per request bounded no
// matter how many moments Gemini flags. Gemini is told this limit too (see
// the prompt), so it prioritises rather than being truncated arbitrarily.
export const MAX_CLIPS_PER_REQUEST = 5;

// Bounds a single clip is clamped into after Gemini responds -- never
// trust a model's numbers blindly. Long enough to have a real beginning/
// middle/end, short enough to stay squarely in short-form territory.
export const MIN_CLIP_DURATION_MS = 6_000;
export const MAX_CLIP_DURATION_MS = 45_000;

export const GEMINI_CONTENT_CLIPS_RESPONSE_SCHEMA = {
  type: "object",
  additionalProperties: false,
  properties: {
    clips: {
      type: "array",
      description:
        `Up to ${MAX_CLIPS_PER_REQUEST} of the most genuinely shareworthy, ` +
        "self-contained moments in this footage, ordered best first. " +
        "Fewer (even zero) is correct if the footage doesn't have that " +
        "many real standout moments -- never pad this out with mundane " +
        "footage just to fill it.",
      items: {
        type: "object",
        additionalProperties: false,
        properties: {
          title: { type: "string" },
          hook: {
            type: "string",
            description:
              "Under 8 words, on-screen-ready. The line that makes someone stop scrolling in the first second.",
          },
          caption: {
            type: "string",
            description:
              "A ready-to-post caption for the social post itself (a sentence or two, may include a couple of relevant hashtags).",
          },
          reason: {
            type: "string",
            description:
              "Why this specific moment is shareworthy, grounded in what the footage actually shows/shows happening.",
          },
          momentType: {
            type: "string",
            enum: [
              "skill-highlight",
              "clutch-moment",
              "funny-fail",
              "big-play",
              "milestone",
              "other",
            ],
          },
          startOffsetMs: {
            type: "integer",
            minimum: 0,
            description:
              "Milliseconds from the start of the video where this clip should begin -- a couple of seconds before the key action, so it has room to build.",
          },
          endOffsetMs: {
            type: "integer",
            minimum: 0,
            description:
              "Milliseconds from the start of the video where this clip should end -- a beat after the key action resolves, not cut off mid-moment.",
          },
          confidence: {
            type: "string",
            enum: ["low", "medium", "high"],
          },
        },
        required: [
          "title",
          "hook",
          "caption",
          "reason",
          "momentType",
          "startOffsetMs",
          "endOffsetMs",
          "confidence",
        ],
      },
    },
  },
  required: ["clips"],
} as const;
