import type { OracleEngine } from "@/lib/oracle/engines";
import { buildEngineResult } from "@/lib/oracle/engines";
import { calculateCombatRatingFromSession } from "@/lib/oracle/repositories/session-repository";
import type { TrendProfile } from "@/lib/oracle/trend/trend-types";
import { generatePrediction } from "./prediction-analysis";
import type { PredictionProfile } from "./prediction-types";

export { generatePrediction } from "./prediction-analysis";

function getSignalDirection(
  profile: PredictionProfile
): "positive" | "negative" | "neutral" {
  if (
    profile.plateauRisk === "high" ||
    profile.burnoutRisk === "high" ||
    profile.weakestFutureSkill
  ) {
    return "negative";
  }

  if (profile.strongestFutureSkill) {
    return "positive";
  }

  return "neutral";
}

function getSignalSeverity(
  profile: PredictionProfile
): "low" | "medium" | "high" {
  if (profile.plateauRisk === "high" || profile.burnoutRisk === "high") {
    return "high";
  }

  if (
    profile.plateauRisk === "moderate" ||
    profile.burnoutRisk === "moderate"
  ) {
    return "medium";
  }

  return "low";
}

export const predictionEngine: OracleEngine<PredictionProfile> = {
  metadata: {
    id: "prediction-engine",
    name: "Prediction Engine",
    version: "1.0.0",
    description:
      "Projects near-term Operator performance using the completed Trend Engine profile.",
    priority: 27,
    capabilities: ["prediction", "trend", "signal"],
    supportedGames: ["*"],
    dependencies: ["trend-engine"],
    producesSignals: true,
    producesDecisions: false,
  },

  async execute(runtime) {
    const trendResult =
      runtime.getResult<TrendProfile>("trend-engine");

    if (!trendResult) {
      throw new Error(
        "Prediction Engine requires a completed Trend Engine result."
      );
    }

    const latestSession = runtime.context.session.latestSession;

    const profile = generatePrediction({
      currentCombatRating: latestSession
        ? calculateCombatRatingFromSession(latestSession)
        : 0,
      currentWinChance: latestSession?.win_chance ?? 0,
      totalSessions: runtime.context.profile.sessionsAnalysed,
      trend: trendResult.profile,
    });

    const signals = [
      {
        id: "prediction-profile-generated",
        category: "prediction" as const,
        title: "Performance Prediction Generated",
        summary: profile.summary,
        severity: getSignalSeverity(profile),
        direction: getSignalDirection(profile),
        confidence: profile.confidence,
        createdAt: new Date().toISOString(),
      },
    ];

    return buildEngineResult(predictionEngine, {
      profile,
      graph: [
        {
          key: "prediction",
          engineId: predictionEngine.metadata.id,
          profile,
          generatedAt: new Date().toISOString(),
        },
      ],
      signals,
      diagnostics: {
        trendEngineId: trendResult.engineId,
        trendSampleSize: trendResult.profile.sampleSize,
        projectedCombatRating: profile.projectedCombatRating,
        projectedWinChance: profile.projectedWinChance,
        projectedSessionsToNextTier:
          profile.projectedSessionsToNextTier,
        plateauRisk: profile.plateauRisk,
        burnoutRisk: profile.burnoutRisk,
        confidence: profile.confidence,
      },
    });
  },
};