import type { OracleSignal } from "@/lib/oracle/signals/signal-types";

export type CoachingPriority =
  | "low"
  | "medium"
  | "high"
  | "critical";

export type CoachingFocusArea = {
  title: string;
  reason: string;
  expectedImprovement: number;
};

export type AdaptiveCoachingProfile = {
  operatorId: string;
  priority: CoachingPriority;
  focusAreas: CoachingFocusArea[];
  summary: string;
  confidence: number;
  generatedAt: string;
};

export type AdaptiveCoachingResult = {
  profile: AdaptiveCoachingProfile;
  signals: OracleSignal[];
};