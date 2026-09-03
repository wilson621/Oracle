export type OracleMatchCoachingDeathBreakdown = Readonly<{
  whenInMatch: string;
  whatHappened: string;
  enemySightlineAssessment: string;
  couldHaveActedSooner: boolean;
  whatToDoDifferently: string;
  confidence: "low" | "medium" | "high";
}>;

export type OracleMatchCoachingScores = Readonly<{
  positioning: number;
  aim: number;
  movement: number;
  decisionMaking: number;
  gameSense: number;
}>;

export type OracleMatchCoachingReport = Readonly<{
  id: string;
  operatorId: string;
  game: string;
  clientSessionId: string;
  startedAt: string;
  endedAt: string;
  generatedAt: string;
  status: "complete" | "degraded" | "failed";
  model: string | null;
  frameCount: number;
  summary: string | null;
  verdict: string | null;
  scores: OracleMatchCoachingScores | null;
  deaths: readonly OracleMatchCoachingDeathBreakdown[];
  rawError: string | null;
}>;

// Full Match Analysis (video+audio, via Gemini's Files API) -- see
// oracle-match-video-coaching-service.ts. Flash rather than a heavier tier:
// for this task (grounded description + structured extraction from a video
// that's already been reduced to a few fps) Flash matches Pro's quality at
// a fraction of the cost, so there's no accuracy left on the table by not
// using the larger model here.
export const GEMINI_MATCH_COACHING_MODEL = "gemini-3.8-flash";

/**
 * The report shape Gemini is asked to produce, matching
 * OracleMatchCoachingReport's fields exactly (so it maps straight onto the
 * oracle_match_coaching_reports table via persist-match-coaching-report.ts)
 * -- with descriptions written for a continuous video+audio recording, most
 * importantly pointing the model at real mm:ss timestamps and audio cues,
 * which is the biggest single accuracy advantage this format has. Passed as
 * Gemini's `responseJsonSchema` (a plain JSON Schema), so this is the bare
 * schema object.
 */
export const GEMINI_MATCH_COACHING_RESPONSE_SCHEMA = {
  type: "object",
  additionalProperties: false,
  properties: {
    summary: {
      type: "string",
      description:
        "A few paragraphs of plain-language, in-depth coaching covering how the whole match went, drawing on both what's visible and what's audible throughout.",
    },
    verdict: {
      type: "string",
      description: "One or two sentence bottom-line verdict on the match.",
    },
    scores: {
      type: "object",
      additionalProperties: false,
      properties: {
        positioning: { type: "integer", minimum: 0, maximum: 100 },
        aim: { type: "integer", minimum: 0, maximum: 100 },
        movement: { type: "integer", minimum: 0, maximum: 100 },
        decisionMaking: { type: "integer", minimum: 0, maximum: 100 },
        gameSense: { type: "integer", minimum: 0, maximum: 100 },
      },
      required: [
        "positioning",
        "aim",
        "movement",
        "decisionMaking",
        "gameSense",
      ],
    },
    deaths: {
      type: "array",
      items: {
        type: "object",
        additionalProperties: false,
        properties: {
          whenInMatch: {
            type: "string",
            description:
              "The mm:ss timestamp in the video when this death occurred (e.g. '14:32'). Use the actual video timeline, not a vague description.",
          },
          whatHappened: {
            type: "string",
            description:
              "What actually happened leading up to and including this death, drawing on both the footage and the audio (footsteps, gunfire, direction/distance of sound) and, if the game shows one, the killcam.",
          },
          enemySightlineAssessment: {
            type: "string",
            description:
              "Best-effort, evidence-graded reasoning about when the enemy likely first had the operator in view or in earshot. Must be phrased as an inference from what's actually visible/audible ('likely', 'the killcam shows', 'the audio suggests'), never asserted as certain fact unless the footage itself makes it directly clear.",
          },
          couldHaveActedSooner: {
            type: "boolean",
            description:
              "Whether the footage and audio suggest the operator could reasonably have reacted, repositioned, or engaged sooner to avoid or win this fight.",
          },
          whatToDoDifferently: {
            type: "string",
            description: "Concrete, specific coaching for next time.",
          },
          confidence: {
            type: "string",
            enum: ["low", "medium", "high"],
            description:
              "How confident this specific breakdown is, given what was actually visible/audible in the footage.",
          },
        },
        required: [
          "whenInMatch",
          "whatHappened",
          "enemySightlineAssessment",
          "couldHaveActedSooner",
          "whatToDoDifferently",
          "confidence",
        ],
      },
    },
  },
  required: ["summary", "verdict", "scores", "deaths"],
} as const;
