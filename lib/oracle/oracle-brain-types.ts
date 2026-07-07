import type { BehaviourProfile } from "./behaviour/behaviour-types";
import type { TrendProfile, TrendSession } from "./trend/trend-types";
import type { PredictionProfile } from "./prediction/prediction-types";

export type OracleBrainInput = {
  operatorId: string;
  callsign?: string | null;
  primaryGame?: string | null;
  combatRating?: number | null;
  winChance?: number | null;
  level?: number | null;
  xp?: number | null;
  totalSessions?: number | null;
  positioning?: number | null;
  aim?: number | null;
  movement?: number | null;
  decisionMaking?: number | null;
  gameSense?: number | null;
  trendSessions?: TrendSession[];
};

export type OracleBrainSignal = {
  label: string;
  value: string;
  confidence: number;
};

export type OracleBrainRecommendation = {
  title: string;
  reason: string;
  priority: "low" | "medium" | "high";
};

export type OracleBrainReport = {
  operatorId: string;
  summary: string;
  confidence: number;
  signals: OracleBrainSignal[];
  behaviour: BehaviourProfile;
  trend: TrendProfile;
  prediction: PredictionProfile;
  recommendations: OracleBrainRecommendation[];
  nextFocus: string;
};