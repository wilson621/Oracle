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

/**
 * Structured playstyle signals pulled from the same video/audio Full Match
 * Analysis already reviews for the coaching report -- no extra recording or
 * API call, just more of what's already being asked for. This is the raw
 * material Oracle Loadout Intelligence aggregates across an Operator's
 * matches to personalise a loadout recommendation to how they actually
 * play, rather than a generic build (see
 * lib/oracle/loadout/oracle-loadout-recommendation-service.ts). Nullable at
 * the report level because a report from before this field existed, or one
 * where the footage genuinely doesn't show enough to judge, has none.
 */
export type OracleMatchCoachingPlaystyle = Readonly<{
  engagementRange: "close" | "mid" | "long" | "mixed" | null;
  aggressionStyle: "aggressive" | "balanced" | "passive" | null;
  movementStyle: "highly-mobile" | "moderate" | "static" | null;
  /** Weapon names as they actually appeared in the footage/HUD/killfeed. */
  weaponsObserved: readonly string[];
  /** Short, specific observations, e.g. "third-parties active fights". */
  notableTendencies: readonly string[];
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
  playstyle: OracleMatchCoachingPlaystyle | null;
  rawError: string | null;
}>;

/**
 * The shape a row actually has in oracle_match_coaching_reports (snake_case
 * column names, scores flattened to top-level columns) -- what
 * persistMatchCoachingReport hands back after inserting, and therefore what
 * both API routes (coach-report's GET history and coach-report-video's
 * POST) put on the wire. The desktop UI (report-types.ts's CoachingReport)
 * is written against this same shape, not the camelCase
 * OracleMatchCoachingReport above -- keep them in sync if either changes.
 */
export type OracleMatchCoachingReportRow = Readonly<{
  id: string;
  operator_id: string;
  game: string;
  client_session_id: string;
  started_at: string;
  ended_at: string;
  generated_at: string;
  status: "complete" | "degraded" | "failed";
  model: string | null;
  frame_count: number;
  summary: string | null;
  verdict: string | null;
  positioning: number | null;
  aim: number | null;
  movement: number | null;
  decision_making: number | null;
  game_sense: number | null;
  deaths: readonly OracleMatchCoachingDeathBreakdown[];
  engagement_range: OracleMatchCoachingPlaystyle["engagementRange"];
  aggression_style: OracleMatchCoachingPlaystyle["aggressionStyle"];
  movement_style: OracleMatchCoachingPlaystyle["movementStyle"];
  weapons_observed: readonly string[];
  notable_tendencies: readonly string[];
  raw_error: string | null;
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
    playstyle: {
      type: "object",
      additionalProperties: false,
      description:
        "Structured observations about how this Operator actually plays, drawn only from what this footage shows -- feeds Oracle's personalised loadout recommendations, so keep every field grounded in this match specifically rather than a generic impression.",
      properties: {
        engagementRange: {
          type: ["string", "null"],
          enum: ["close", "mid", "long", "mixed", null],
          description:
            "The distance this Operator most often actually engaged at in this match. 'mixed' if there's no clear dominant range. null only if the footage genuinely doesn't show enough engagements to judge.",
        },
        aggressionStyle: {
          type: ["string", "null"],
          enum: ["aggressive", "balanced", "passive", null],
          description:
            "Whether this Operator tends to push/hunt fights, play a balanced/reactive game, or hold back and let fights come to them, based on what this match actually shows.",
        },
        movementStyle: {
          type: ["string", "null"],
          enum: ["highly-mobile", "moderate", "static", null],
          description:
            "How much this Operator moves during engagements and rotations -- e.g. frequent slide-cancelling/repositioning versus mostly holding one position.",
        },
        weaponsObserved: {
          type: "array",
          items: { type: "string" },
          description:
            "Weapon names as they actually appear on screen (HUD, killfeed, loadout menu) in this footage. Empty array if none are legible.",
        },
        notableTendencies: {
          type: "array",
          items: { type: "string" },
          description:
            "Short, specific, evidence-grounded observations about this Operator's habits this match (e.g. 'frequently third-parties active fights', 'rotates late off contested zones'). Empty array if nothing stands out.",
        },
      },
      required: [
        "engagementRange",
        "aggressionStyle",
        "movementStyle",
        "weaponsObserved",
        "notableTendencies",
      ],
    },
  },
  required: ["summary", "verdict", "scores", "deaths", "playstyle"],
} as const;
