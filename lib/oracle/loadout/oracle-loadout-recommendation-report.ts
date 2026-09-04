export type OracleLoadoutWeapon = Readonly<{
  name: string;
  attachments: readonly string[];
}>;

export type OracleLoadoutBuild = Readonly<{
  primaryWeapon: OracleLoadoutWeapon;
  secondaryWeapon: OracleLoadoutWeapon | null;
  perks: readonly string[];
  lethalEquipment: string | null;
  tacticalEquipment: string | null;
}>;

export type OracleLoadoutSource = Readonly<{
  title: string;
  url: string;
}>;

export type OracleLoadoutRecommendation = Readonly<{
  id: string;
  operatorId: string;
  game: string;
  requestedGoal: string;
  generatedAt: string;
  status: "complete" | "failed";
  model: string | null;
  /**
   * 'personalized' when at least one past Full Match Analysis report with
   * playstyle data existed and was used; 'generic' when the Operator has no
   * match history yet, so the build is based only on their stated goal and
   * current meta. Always shown honestly to the Operator rather than
   * presenting a generic build as if it were tailored to them.
   */
  personalizationLevel: "personalized" | "generic" | null;
  matchesConsidered: number;
  loadout: OracleLoadoutBuild | null;
  summary: string | null;
  sources: readonly OracleLoadoutSource[];
  rawError: string | null;
}>;

/**
 * The shape a row actually has in oracle_loadout_recommendations
 * (snake_case column names) -- what persistLoadoutRecommendation hands
 * back after inserting, and therefore what the API route puts on the wire.
 * Mirrors the same camelCase-service/snake_case-row split used for match
 * coaching reports (see oracle-match-coaching-report.ts's
 * OracleMatchCoachingReportRow) for the same reason: the UI reads real
 * database rows, not an echo of whatever was passed in to persist.
 */
export type OracleLoadoutRecommendationRow = Readonly<{
  id: string;
  operator_id: string;
  game: string;
  requested_goal: string;
  generated_at: string;
  status: "complete" | "failed";
  model: string | null;
  personalization_level: "personalized" | "generic" | null;
  matches_considered: number;
  loadout: OracleLoadoutBuild | Record<string, never>;
  summary: string | null;
  sources: readonly OracleLoadoutSource[];
  raw_error: string | null;
}>;

// Same model as Full Match Analysis (see oracle-match-coaching-report.ts) --
// Flash is more than sufficient for a grounded-search-plus-reasoning task
// like this one, and keeping one model across the app means one set of
// pricing/behaviour characteristics to reason about.
export const GEMINI_LOADOUT_MODEL = "gemini-3.8-flash";

/**
 * The loadout shape Gemini is asked to produce. Passed as Gemini's
 * `responseJsonSchema` alongside the googleSearch tool in the same call --
 * Gemini 3 models support combining Structured Outputs with built-in tools
 * including Grounding with Google Search (confirmed against Google's own
 * docs before relying on it here), so this doesn't need a separate
 * "search first, then format" round trip.
 */
export const GEMINI_LOADOUT_RESPONSE_SCHEMA = {
  type: "object",
  additionalProperties: false,
  properties: {
    loadout: {
      type: "object",
      additionalProperties: false,
      properties: {
        primaryWeapon: {
          type: "object",
          additionalProperties: false,
          properties: {
            name: {
              type: "string",
              description:
                "The exact in-game weapon name, using current, real weapon data found via search -- never a weapon that isn't actually in the current game, and never a Melee weapon (Melee is its own equip slot, not Primary).",
            },
            attachments: {
              type: "array",
              items: { type: "string" },
              description:
                "This weapon's real current attachment options (found via search) chosen to serve whatever this weapon is specifically meant to optimise for in this build (e.g. recoil control, mobility, range) -- not just a generic 'good' set.",
            },
          },
          required: ["name", "attachments"],
        },
        secondaryWeapon: {
          type: ["object", "null"],
          additionalProperties: false,
          properties: {
            name: { type: "string" },
            attachments: {
              type: "array",
              items: { type: "string" },
              description:
                "This weapon's real current attachment options (found via search) chosen to serve whatever this weapon is specifically meant to optimise for in this build -- when the Operator's goal names a different priority per weapon, this should reflect its own priority, not the primary weapon's.",
            },
          },
          required: ["name", "attachments"],
          description:
            "A secondary (backup) weapon and its attachments, deliberately chosen to cover a different engagement range/role than the primary (e.g. a mid-range primary paired with a close-range secondary for an aggressive Operator) rather than picked as an afterthought. Restricted to the current game's actual Secondary Weapon category -- Pistols and Launchers -- never a full-size Primary-category weapon and never a Melee weapon (Melee is its own equip slot, not Secondary). null only when the goal is genuinely single-weapon-focused or a second weapon wouldn't meaningfully help.",
        },
        perks: {
          type: "array",
          items: { type: "string" },
          description: "Real current perk names that fit this build.",
        },
        lethalEquipment: { type: ["string", "null"] },
        tacticalEquipment: { type: ["string", "null"] },
      },
      required: [
        "primaryWeapon",
        "secondaryWeapon",
        "perks",
        "lethalEquipment",
        "tacticalEquipment",
      ],
    },
    summary: {
      type: "string",
      description:
        "A few sentences explaining *why* this build fits this Operator: tie it explicitly to their stated goal and, when a playstyle profile was provided, to their actual observed playstyle (engagement range, aggression, movement, past weapons) rather than generic meta-build boilerplate. If no playstyle profile was provided, say so plainly and explain the build is based on their stated goal and current meta only.",
    },
  },
  required: ["loadout", "summary"],
} as const;
