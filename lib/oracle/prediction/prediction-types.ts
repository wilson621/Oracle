export type PredictedSkill = {
  skill: string;
  current: number;
  predicted: number;
  expectedChange: number;
  confidence: number;
};

export type PredictionRisk =
  | "very_low"
  | "low"
  | "moderate"
  | "high";

export type PredictionProfile = {
  projectedCombatRating: number;
  projectedWinChance: number;
  projectedSessionsToNextTier: number | null;
  confidence: number;

  strongestFutureSkill: PredictedSkill | null;
  weakestFutureSkill: PredictedSkill | null;

  burnoutRisk: PredictionRisk;
  plateauRisk: PredictionRisk;

  summary: string;
};