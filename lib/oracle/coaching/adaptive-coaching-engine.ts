import type { OracleContext } from "@/lib/oracle/context";
import type {
  OracleEngine,
  OracleEngineResult,
} from "@/lib/oracle/engines";

import {
  buildAdaptiveCoachingPlan,
  buildAdaptiveCoachingSignals,
  buildAdaptiveCoachingSummary,
  calculateCoachingPriority,
} from "@/lib/oracle/coaching";

import type {
  AdaptiveCoachingProfile,
  AdaptiveCoachingResult,
} from "./adaptive-coaching-types";

export const adaptiveCoachingEngine: OracleEngine<AdaptiveCoachingResult> = {
  metadata: {
    id: "adaptive-coaching-engine",
    name: "Adaptive Coaching Engine",
    version: "1.0.0",
    description:
      "Builds personalised coaching plans from Oracle intelligence.",
    priority: 40,
    capabilities: ["coach", "signal"],
    supportedGames: ["*"],
    dependencies: ["memory-engine", "behaviour-evolution-engine"],
    producesSignals: true,
    producesDecisions: false,
  },

  async execute(
    context: OracleContext
  ): Promise<OracleEngineResult<AdaptiveCoachingResult>> {
    const confidence = context.session.recentSessions.length >= 5 ? 0.8 : 0.45;

    const priority = calculateCoachingPriority(confidence);
    const focusAreas = buildAdaptiveCoachingPlan(priority);
    const summary = buildAdaptiveCoachingSummary(focusAreas);

    const profile: AdaptiveCoachingProfile = {
      operatorId: context.operator.operatorId,
      priority,
      focusAreas,
      summary,
      confidence,
      generatedAt: new Date().toISOString(),
    };

    const signals = buildAdaptiveCoachingSignals(profile);

    return {
      engineId: this.metadata.id,
      generatedAt: new Date().toISOString(),
      output: {
        profile,
        signals,
      },
      graph: [
        {
          key: "coaching",
          engineId: this.metadata.id,
          profile,
          generatedAt: new Date().toISOString(),
        },
      ],
      signals,
      decisions: [],
      diagnostics: {
        priority,
        confidence,
        focusAreas: focusAreas.length,
      },
    };
  },
};