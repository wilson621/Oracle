// Mirrors OracleLoadoutRecommendationRow
// (lib/oracle/loadout/oracle-loadout-recommendation-report.ts) -- the API
// route returns real database rows (snake_case), same pattern as
// report-types.ts does for Full Match Analysis.

export type LoadoutWeapon = {
  name: string;
  attachments: string[];
};

export type LoadoutBuild = {
  primaryWeapon: LoadoutWeapon;
  secondaryWeapon: LoadoutWeapon | null;
  perks: string[];
  lethalEquipment: string | null;
  tacticalEquipment: string | null;
};

export type LoadoutSource = {
  title: string;
  url: string;
};

export type LoadoutRecommendation = {
  id: string;
  game: string;
  requested_goal: string;
  generated_at: string;
  status: "complete" | "failed";
  model: string | null;
  personalization_level: "personalized" | "generic" | null;
  matches_considered: number;
  loadout: LoadoutBuild | Record<string, never>;
  summary: string | null;
  sources: LoadoutSource[];
  raw_error: string | null;
};
