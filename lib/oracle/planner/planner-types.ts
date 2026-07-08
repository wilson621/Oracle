import type { OracleSignal } from "@/lib/oracle/signals/signal-types";

export type PlannerPriority =
  | "positioning"
  | "aim"
  | "movement"
  | "decision"
  | "gamesense";

export type PlannerConfidence = "low" | "medium" | "high";

export type PlannerRecommendation = {
  priority: PlannerPriority;
  confidence: PlannerConfidence;
  reason: string;
};

export type PlannerProfile = {
  operatorId?: string;
  generatedAt: string;
  recommendation: PlannerRecommendation;
};

export type PlannerResult = {
  profile: PlannerProfile;
  signals: OracleSignal[];
};