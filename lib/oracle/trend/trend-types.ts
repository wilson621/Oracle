export type TrendDirection = "improving" | "stable" | "declining" | "unknown";

export type TrendMomentum =
  | "strong_positive"
  | "positive"
  | "neutral"
  | "negative"
  | "strong_negative"
  | "unknown";

export type TrendSession = {
  createdAt: string;
  combatRating: number;
  winChance: number;
  confidence: number;
  positioning: number;
  aim: number;
  movement: number;
  decisionMaking: number;
  gameSense: number;
};

export type SkillTrend = {
  skill: string;
  firstValue: number;
  latestValue: number;
  change: number;
  direction: TrendDirection;
};

export type TrendProfile = {
  sampleSize: number;
  performanceTrend: TrendDirection;
  confidenceTrend: TrendDirection;
  consistencyTrend: TrendDirection;
  momentum: TrendMomentum;
  momentumScore: number;
  strongestImprovement: SkillTrend | null;
  sharpestDecline: SkillTrend | null;
  skillTrends: SkillTrend[];
  summary: string;
};