import type { OracleContext } from "@/lib/oracle/context";
import type { OracleEngine } from "@/lib/oracle/engines";
import { buildEngineResult } from "@/lib/oracle/engines";
import { calculateOperatorProfileConfidence } from "./operator-profile-confidence";
import { classifyOperatorCombatIdentity } from "./operator-profile-identity";
import { determineOperatorLearningStyle } from "./operator-profile-learning-style";
import { buildOperatorProfileSignals } from "./operator-profile-signals";
import { buildOperatorProfileSummary } from "./operator-profile-summary";
import { averageSessionScore } from "./operator-profile-utils";
import type {
  OperatorProfile,
  OperatorProfileResult,
} from "./operator-profile-types";

export const operatorProfileEngine: OracleEngine<OperatorProfileResult> = {
  metadata: {
    id: "operator-profile-engine",
    name: "Operator Profile Engine",
    version: "1.0.0",
    description:
      "Builds a living intelligence profile of the Operator across sessions.",
    priority: 50,
    capabilities: ["operator", "signal"],
    supportedGames: ["*"],
    dependencies: ["planner-engine"],
    producesSignals: true,
    producesDecisions: false,
  },

  async execute(context: OracleContext) {
    const sessions = context.session.recentSessions;
    const sessionCount = sessions.length;

    const positioning = averageSessionScore(sessions, "positioning");
    const aim = averageSessionScore(sessions, "aim");
    const movement = averageSessionScore(sessions, "movement");
    const decisionMaking = averageSessionScore(sessions, "decision_making");
    const gameSense = averageSessionScore(sessions, "game_sense");

    const mechanicalConfidence = Math.round((aim + movement) / 2);
    const tacticalConfidence = Math.round(
      (positioning + decisionMaking + gameSense) / 3
    );

    const adaptability = Math.round((movement + gameSense) / 2);
    const consistency = Math.round((positioning + decisionMaking) / 2);
    const pressureRating = Math.round((decisionMaking + aim) / 2);

    const confidence = calculateOperatorProfileConfidence(sessionCount);

    const combatIdentity = classifyOperatorCombatIdentity({
      aim,
      movement,
      positioning,
      decisionMaking,
      gameSense,
    });

    const learningStyle = determineOperatorLearningStyle({
      sessionCount,
      consistency,
      adaptability,
    });

    const summary = buildOperatorProfileSummary({
      combatIdentity,
      learningStyle,
      confidence,
    });

    const profile: OperatorProfile = {
      operatorId: context.operator.operatorId,
      callsign: context.operator.callsign,
      combatIdentity,
      learningStyle,
      mechanicalConfidence,
      tacticalConfidence,
      adaptability,
      consistency,
      pressureRating,
      summary,
      confidence,
      generatedAt: new Date().toISOString(),
    };

    const signals = buildOperatorProfileSignals(profile);

    return buildEngineResult(operatorProfileEngine, {
      profile: {
        profile,
        signals,
      },
      graph: [
        {
          key: "operatorProfile",
          engineId: operatorProfileEngine.metadata.id,
          profile,
          generatedAt: new Date().toISOString(),
        },
      ],
      signals,
      diagnostics: {
        combatIdentity,
        learningStyle,
        mechanicalConfidence,
        tacticalConfidence,
        adaptability,
        consistency,
        pressureRating,
        confidence,
      },
    });
  },
};