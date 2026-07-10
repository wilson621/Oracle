import type { BehaviourProfile } from "@/lib/oracle/behaviour/behaviour-types";
import type { OracleEngine } from "@/lib/oracle/engines";
import { buildEngineResult } from "@/lib/oracle/engines";
import { generateOracleDecision } from "@/lib/oracle/intelligence/decision-engine";
import type { PredictionProfile } from "@/lib/oracle/prediction/prediction-types";
import { calculateCombatRatingFromSession } from "@/lib/oracle/repositories/session-repository";
import { generateMissionReport } from "./mission-analysis";
import type {
  MissionDifficulty,
  MissionReport,
} from "./mission-types";

export { generateMissionReport } from "./mission-analysis";

function getMissionSeverity(
  difficulty: MissionDifficulty
): "low" | "medium" | "high" {
  switch (difficulty) {
    case "Hard":
      return "high";
    case "Moderate":
      return "medium";
    case "Easy":
      return "low";
  }
}

function getDecisionPriority(
  difficulty: MissionDifficulty
): "low" | "medium" | "high" {
  switch (difficulty) {
    case "Hard":
      return "high";
    case "Moderate":
      return "medium";
    case "Easy":
      return "low";
  }
}

function calculateTrendStability(
  prediction: PredictionProfile
): number {
  if (
    prediction.plateauRisk === "high" ||
    prediction.burnoutRisk === "high"
  ) {
    return 40;
  }

  if (
    prediction.plateauRisk === "moderate" ||
    prediction.burnoutRisk === "moderate"
  ) {
    return 60;
  }

  return 80;
}

export const missionEngine: OracleEngine<MissionReport> = {
  metadata: {
    id: "mission-engine",
    name: "Mission Engine",
    version: "1.0.0",
    description:
      "Generates an actionable Operator mission from completed behaviour and prediction intelligence.",
    priority: 28,
    capabilities: [
      "coach",
      "strategy",
      "prediction",
      "signal",
      "decision",
    ],
    supportedGames: ["*"],
    dependencies: [
      "behaviour-engine",
      "prediction-engine",
    ],
    producesSignals: true,
    producesDecisions: true,
  },

  async execute(runtime) {
    const behaviourResult =
      runtime.getResult<BehaviourProfile>("behaviour-engine");

    const predictionResult =
      runtime.getResult<PredictionProfile>("prediction-engine");

    if (!behaviourResult) {
      throw new Error(
        "Mission Engine requires a completed Behaviour Engine result."
      );
    }

    if (!predictionResult) {
      throw new Error(
        "Mission Engine requires a completed Prediction Engine result."
      );
    }

    const behaviour = behaviourResult.profile;
    const prediction = predictionResult.profile;
    const latestSession = runtime.context.session.latestSession;

    const weakestSkill =
      prediction.weakestFutureSkill?.skill ??
      behaviour.weaknesses[0] ??
      "Consistency";

    const strongestSkill =
      prediction.strongestFutureSkill?.skill ??
      behaviour.strengths[0] ??
      "Adaptability";

    const currentCombatRating = latestSession
      ? calculateCombatRatingFromSession(latestSession)
      : 0;

    const profile = generateMissionReport({
      sessionsAnalysed:
        runtime.context.profile.sessionsAnalysed,
      weakestSkill,
      strongestSkill,
      currentCombatRating,
      projectedCombatRating:
        prediction.projectedCombatRating,
      predictionConfidence: prediction.confidence,
      source: "brain",
    });

    const signals = [
      {
        id: "operator-mission-generated",
        category: "coach" as const,
        title: "Operator Mission Generated",
        summary: profile.summary,
        severity: getMissionSeverity(
          profile.mission.difficulty
        ),
        direction: "neutral" as const,
        confidence: prediction.confidence,
        createdAt: new Date().toISOString(),
      },
    ];

    const decision = generateOracleDecision({
      category: "strategy",
      title: profile.mission.title,
      recommendation: profile.mission.summary,
      summary: `Oracle generated a ${profile.mission.difficulty.toLowerCase()} mission focused on ${profile.mission.focusArea}.`,
      expectedOutcome: `Completing this mission is expected to produce approximately ${profile.mission.estimatedCombatGain} points of combat-rating improvement.`,
      reassessmentTrigger:
        "Reassess after the mission is completed, after the next analysed Oracle Session, or when Prediction Engine produces a different weakest future skill.",
      priority: getDecisionPriority(
        profile.mission.difficulty
      ),
      sessionsAnalysed: profile.sessionsAnalysed,
      sampleSize: runtime.context.session.recentSessions.length,
      consistency: behaviour.consistency.score,
      trendStability:
        calculateTrendStability(prediction),
    });

    return buildEngineResult(missionEngine, {
      profile,
      graph: [
        {
          key: "mission",
          engineId: missionEngine.metadata.id,
          profile,
          generatedAt: new Date().toISOString(),
        },
      ],
      signals,
      decisions: [decision],
      diagnostics: {
        behaviourEngineId: behaviourResult.engineId,
        predictionEngineId: predictionResult.engineId,
        sessionsAnalysed: profile.sessionsAnalysed,
        weakestSkill,
        strongestSkill,
        currentCombatRating,
        projectedCombatRating:
          prediction.projectedCombatRating,
        predictionConfidence:
          prediction.confidence,
        missionDifficulty:
          profile.mission.difficulty,
        estimatedSessions:
          profile.mission.estimatedSessions,
        rewardXp: profile.mission.rewardXp,
      },
    });
  },
};