import type { OracleContext } from "@/lib/oracle/context";
import type { OracleEngine } from "@/lib/oracle/engines";
import { buildEngineResult } from "@/lib/oracle/engines/build-engine-result";
import { generateOracleDecision } from "@/lib/oracle/intelligence/decision-engine";

import {
  buildAdaptiveCoachingPlan,
} from "./adaptive-coaching-plan";
import {
  calculateCoachingPriority,
} from "./adaptive-coaching-priority";
import {
  buildAdaptiveCoachingSignals,
} from "./adaptive-coaching-signals";
import {
  buildAdaptiveCoachingSummary,
} from "./adaptive-coaching-summary";

import type {
  AdaptiveCoachingProfile,
  AdaptiveCoachingResult,
} from "./adaptive-coaching-types";

export const adaptiveCoachingEngine: OracleEngine<AdaptiveCoachingResult> = {
  metadata: {
    id: "adaptive-coaching-engine",
    name: "Adaptive Coaching Engine",
    version: "1.0.0",
    description: "Builds personalised coaching plans from Oracle intelligence.",
    priority: 40,
    capabilities: ["coach", "signal"],
    supportedGames: ["*"],
    dependencies: ["memory-engine", "behaviour-evolution-engine"],
    producesSignals: true,
    producesDecisions: true,
  },

  async execute(context: OracleContext) {
    const sessionsAnalysed = context.session.recentSessions.length;
    const confidence = sessionsAnalysed >= 5 ? 0.8 : 0.45;

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

    const decision = generateOracleDecision({
      category: "coach",
      title: "Follow Adaptive Coaching Plan",
      recommendation: summary,
      summary,
      expectedOutcome:
        "Following this coaching plan should improve the operator's weakest recurring performance patterns.",
      reassessmentTrigger:
        "Reassess after the next analysed session or when Oracle detects a change in coaching priority.",
      sessionsAnalysed,
      sampleSize: sessionsAnalysed,
      consistency: Math.round(confidence * 100),
      trendStability: Math.round(confidence * 100),
    });

    return buildEngineResult(adaptiveCoachingEngine, {
      profile: {
        profile,
        signals,
      },
      graph: [
        {
          key: "coaching",
          engineId: adaptiveCoachingEngine.metadata.id,
          profile,
          generatedAt: new Date().toISOString(),
        },
      ],
      signals,
      decisions: [decision],
      diagnostics: {
        priority,
        confidence,
        focusAreas: focusAreas.length,
        decisions: 1,
      },
    });
  },
};
