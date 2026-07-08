export type PlannerPriority =
  | "positioning"
  | "aim"
  | "movement"
  | "decision"
  | "gamesense";

export type PlannerConfidence =
  | "low"
  | "medium"
  | "high";

export type PlannerRecommendation = {
  priority: PlannerPriority;
  confidence: PlannerConfidence;
  reason: string;
};

export type PlannerProfile = {
  generatedAt: string;
  recommendation: PlannerRecommendation;
};