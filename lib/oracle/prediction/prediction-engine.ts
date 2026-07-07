import type {
  PredictedSkill,
  PredictionProfile,
  PredictionRisk,
} from "./prediction-types";
import type { TrendProfile } from "@/lib/oracle/trend/trend-types";

type PredictionInput = {
  currentCombatRating: number;
  currentWinChance: number;
  totalSessions: number;
  trend: TrendProfile;
};

export function generatePrediction(
  input: PredictionInput
): PredictionProfile {
  const predictionConfidence = calculatePredictionConfidence(
    input.totalSessions,
    input.trend.sampleSize,
    input.trend.momentumScore
  );

  const projectedCombatRating = clampScore(
    Math.round(input.currentCombatRating + calculateProjectedRatingChange(input.trend))
  );

  const projectedWinChance = clampScore(
    Math.round(input.currentWinChance + calculateProjectedWinChange(input.trend))
  );

  const predictedSkills = buildPredictedSkills(input.trend);

  const strongestFutureSkill = predictedSkills
    .filter((skill) => skill.expectedChange > 0)
    .sort((a, b) => b.expectedChange - a.expectedChange)[0] ?? null;

  const weakestFutureSkill = predictedSkills
    .filter((skill) => skill.expectedChange < 0)
    .sort((a, b) => a.expectedChange - b.expectedChange)[0] ?? null;

  return {
    projectedCombatRating,
    projectedWinChance,
    projectedSessionsToNextTier: calculateSessionsToNextTier(
      input.currentCombatRating,
      input.trend.momentumScore
    ),
    confidence: predictionConfidence,
    strongestFutureSkill,
    weakestFutureSkill,
    burnoutRisk: calculateBurnoutRisk(input.trend),
    plateauRisk: calculatePlateauRisk(input.trend),
    summary: buildPredictionSummary({
      projectedCombatRating,
      projectedWinChance,
      predictionConfidence,
      strongestFutureSkill,
      weakestFutureSkill,
      momentumScore: input.trend.momentumScore,
      sampleSize: input.trend.sampleSize,
    }),
  };
}

function calculatePredictionConfidence(
  totalSessions: number,
  trendSampleSize: number,
  momentumScore: number
): number {
  let confidence = 0.25;

  if (totalSessions >= 2) confidence += 0.15;
  if (totalSessions >= 5) confidence += 0.15;
  if (trendSampleSize >= 2) confidence += 0.15;
  if (trendSampleSize >= 5) confidence += 0.15;
  if (Math.abs(momentumScore) >= 5) confidence += 0.1;

  return Math.min(confidence, 0.92);
}

function calculateProjectedRatingChange(trend: TrendProfile): number {
  if (trend.sampleSize < 2) return 0;

  const momentumWeight = trend.momentumScore * 0.6;

  const skillWeight =
    trend.skillTrends.length > 0
      ? average(trend.skillTrends.map((skill) => skill.change)) * 0.4
      : 0;

  return momentumWeight + skillWeight;
}

function calculateProjectedWinChange(trend: TrendProfile): number {
  if (trend.sampleSize < 2) return 0;

  return trend.momentumScore * 0.35;
}

function buildPredictedSkills(trend: TrendProfile): PredictedSkill[] {
  return trend.skillTrends.map((skill) => {
    const expectedChange = Math.round(skill.change * 0.75);
    const predicted = clampScore(skill.latestValue + expectedChange);

    return {
      skill: skill.skill,
      current: skill.latestValue,
      predicted,
      expectedChange,
      confidence: trend.sampleSize >= 5 ? 0.82 : 0.62,
    };
  });
}

function calculateSessionsToNextTier(
  currentCombatRating: number,
  momentumScore: number
): number | null {
  const nextTier = getNextTier(currentCombatRating);

  if (!nextTier || momentumScore <= 0) {
    return null;
  }

  const remaining = nextTier - currentCombatRating;
  const expectedGainPerSession = Math.max(1, momentumScore / 3);

  return Math.ceil(remaining / expectedGainPerSession);
}

function getNextTier(score: number): number | null {
  if (score < 30) return 30;
  if (score < 40) return 40;
  if (score < 50) return 50;
  if (score < 60) return 60;
  if (score < 70) return 70;
  if (score < 80) return 80;
  if (score < 90) return 90;

  return null;
}

function calculateBurnoutRisk(trend: TrendProfile): PredictionRisk {
  if (trend.sampleSize < 3) return "moderate";

  if (
    trend.momentumScore <= -12 &&
    trend.confidenceTrend === "declining" &&
    trend.consistencyTrend === "declining"
  ) {
    return "high";
  }

  if (trend.momentumScore <= -5) return "moderate";
  if (trend.momentumScore >= 8) return "very_low";

  return "low";
}

function calculatePlateauRisk(trend: TrendProfile): PredictionRisk {
  if (trend.sampleSize < 3) return "moderate";

  const allStable = trend.skillTrends.every(
    (skill) => skill.direction === "stable"
  );

  if (allStable && trend.performanceTrend === "stable") return "high";
  if (trend.momentum === "neutral") return "moderate";
  if (trend.momentum === "positive" || trend.momentum === "strong_positive") {
    return "low";
  }

  return "moderate";
}

function buildPredictionSummary(input: {
  projectedCombatRating: number;
  projectedWinChance: number;
  predictionConfidence: number;
  strongestFutureSkill: PredictedSkill | null;
  weakestFutureSkill: PredictedSkill | null;
  momentumScore: number;
  sampleSize: number;
}): string {
  if (input.sampleSize < 2) {
    return "Analysis requires more session history before Oracle can generate reliable predictions.";
  }

  if (input.momentumScore > 0 && input.strongestFutureSkill) {
    return `Prediction indicates upward momentum. ${input.strongestFutureSkill.skill} is the most likely skill to improve next.`;
  }

  if (input.momentumScore < 0 && input.weakestFutureSkill) {
    return `Prediction indicates negative drift. ${input.weakestFutureSkill.skill} is at the highest risk of further decline.`;
  }

  return `Prediction indicates stable near-term performance with projected combat rating ${input.projectedCombatRating}.`;
}

function average(values: number[]): number {
  if (values.length === 0) return 0;

  return values.reduce((sum, value) => sum + value, 0) / values.length;
}

function clampScore(value: number): number {
  return Math.max(0, Math.min(100, value));
}