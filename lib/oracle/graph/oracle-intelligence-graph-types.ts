export type OracleIntelligenceGraphKey =
  | "behaviour"
  | "trend"
  | "prediction"
  | "mission"
  | "memory"
  | "evolution"
  | "coaching"
  | "planner"
  | "operatorProfile"
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