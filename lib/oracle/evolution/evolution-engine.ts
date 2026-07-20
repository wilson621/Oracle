import type { OracleContext } from "@/lib/oracle/context";
import type { OracleEngine } from "@/lib/oracle/engines";
import { buildEngineResult } from "@/lib/oracle/engines/build-engine-result";
import { generateOracleDecision } from "@/lib/oracle/intelligence/decision-engine";
import { calculateEvolutionConfidence } from "./evolution-confidence";
import {
  detectBehaviourEvolutionPatterns,
  findSharpestDecline,
  findStrongestImprovement,
} from "./evolution-patterns";
import { buildBehaviourEvolutionSignals } from "./evolution-signals";
import type {
  BehaviourEvolutionProfile,
  BehaviourEvolutionResult,
} from "./evolution-types";

export const behaviourEvolutionEngine: OracleEngine<BehaviourEvolutionResult> = {
  metadata: {
    id: "behaviour-evolution-engine",
    name: "Behaviour Evolution Engine",
    version: "1.0.0",
    description:
      "Detects operator improvement, decline and behavioural trajectory over time.",
    priority: 30,
    capabilities: ["behaviour", "memory", "signal", "prediction"],
    supportedGames: ["*"],
    dependencies: ["memory-engine"],
    producesSignals: true,
    producesDecisions: true,
  },

  async execute(context: OracleContext) {
    const sessionCount = context.session.recentSessions.length;
    const confidence = calculateEvolutionConfidence(sessionCount);

    const patterns = detectBehaviourEvolutionPatterns(context, confidence);
    const strongestImprovement = findStrongestImprovement(patterns);
    const sharpestDecline = findSharpestDecline(patterns);

    const profile: BehaviourEvolutionProfile = {
      operatorId: context.operator.operatorId,
      sessionCount,
      patterns,
      strongestImprovement,
      sharpestDecline,
      confidence,
      generatedAt: new Date().toISOString(),
    };

    const signals = buildBehaviourEvolutionSignals({ profile });

    const decision = generateOracleDecision({
      category: "strategy",
      title: sharpestDecline
        ? `Recover ${sharpestDecline.label}`
        : strongestImprovement
          ? `Protect ${strongestImprovement.label} Momentum`
          : "Stabilise Behaviour Trajectory",
      recommendation: sharpestDecline
        ? `Prioritise ${sharpestDecline.label} in the next training cycle because Oracle detected the sharpest negative movement there.`
        : strongestImprovement
          ? `Protect the current improvement in ${strongestImprovement.label} while continuing to build a larger session sample.`
          : "Maintain consistent review cycles until Oracle detects a clearer improvement or decline pattern.",
      summary: sharpestDecline
        ? `${sharpestDecline.label} is currently the clearest behavioural risk.`
        : strongestImprovement
          ? `${strongestImprovement.label} is currently the strongest positive behavioural trend.`
          : "Behaviour evolution is currently stable with no dominant improvement or decline.",
      expectedOutcome: sharpestDecline
        ? `Focused correction should reduce further decline in ${sharpestDecline.label}.`
        : strongestImprovement
          ? `Protecting this pattern should preserve current improvement momentum in ${strongestImprovement.label}.`
          : "Consistent review should improve Oracle's ability to detect stronger behavioural trends.",
      reassessmentTrigger:
        "Reassess after the next analysed session or when Oracle detects a new strongest improvement or sharpest decline.",
      sessionsAnalysed: sessionCount,
      sampleSize: patterns.length,
      consistency: Math.round(confidence * 100),
      trendStability: sharpestDecline ? 45 : strongestImprovement ? 75 : 60,
    });

    return buildEngineResult(behaviourEvolutionEngine, {
      profile: {
        profile,
        signals,
      },
      graph: [
        {
          key: "evolution",
          engineId: behaviourEvolutionEngine.metadata.id,
          profile,
          generatedAt: new Date().toISOString(),
        },
      ],
      signals,
      decisions: [decision],
      diagnostics: {
        sessionCount,
        confidence,
        strongestImprovement,
        sharpestDecline,
        decisions: 1,
      },
    });
  },
};
