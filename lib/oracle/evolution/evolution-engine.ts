import type { OracleContext } from "@/lib/oracle/context";
import type { OracleEngine, OracleEngineResult } from "@/lib/oracle/engines";
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
    producesDecisions: false,
  },

  async execute(
    context: OracleContext
  ): Promise<OracleEngineResult<BehaviourEvolutionResult>> {
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

    return {
      engineId: this.metadata.id,
      generatedAt: new Date().toISOString(),
      output: {
        profile,
        signals,
      },
      graph: [
        {
          key: "evolution",
          engineId: this.metadata.id,
          profile,
          generatedAt: new Date().toISOString(),
        },
      ],
      signals,
      decisions: [],
      diagnostics: {
        sessionCount,
        confidence,
        strongestImprovement,
        sharpestDecline,
      },
    };
  },
};