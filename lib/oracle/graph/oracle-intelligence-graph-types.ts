export type OracleIntelligenceGraphKey =
  | "memory"
  | "evolution"
  | "coaching"
  | "planner"
  | "operatorProfile"
  | "prediction"
  | "weapon"
  | "strategy"
  | "map"
  | "contextual";

export type OracleIntelligenceGraphEntry<TProfile = unknown> = {
  key: OracleIntelligenceGraphKey;
  engineId: string;
  profile: TProfile;
  generatedAt: string;
};

export type OracleIntelligenceGraph = {
  entries: OracleIntelligenceGraphEntry[];
};