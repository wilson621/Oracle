import type { OracleContext } from "@/lib/oracle/context";
import type { OracleEngine } from "@/lib/oracle/engines";
import { buildEngineResult } from "@/lib/oracle/engines";
import {
  resolveOperatorIntent,
  type ContextualIntentConfidence,
} from "@/lib/oracle/contextual/intent-resolver";

export type ContextualIntelligenceProfile = {
  inferredIntent: OracleContext["contextual"]["intent"];
  confidence: number;
  confidenceLabel: ContextualIntentConfidence;
  priorities: string[];
  opportunityCount: number;
  reasoning: string;
};

export const contextualIntelligenceEngine: OracleEngine<ContextualIntelligenceProfile> = {
  metadata: {
    id: "contextual-intelligence-engine",
    name: "Contextual Intelligence Engine",
    version: "1.0.0",
    description:
      "Infers Operator intent and produces contextual observations for Oracle intelligence systems.",
    priority: 20,
    capabilities: ["context", "contextual", "signal", "decision"],
    supportedGames: ["*"],
    dependencies: [],
    producesSignals: true,
    producesDecisions: true,
  },

  async execute(context: OracleContext) {
    const resolvedIntent = resolveOperatorIntent(context);
    const decisionConfidence = Math.round(resolvedIntent.confidence * 100);

    const profile: ContextualIntelligenceProfile = {
      inferredIntent: resolvedIntent.intent,
      confidence: resolvedIntent.confidence,
      confidenceLabel: resolvedIntent.confidenceLabel,
      priorities: context.contextual.priorities,
      opportunityCount: context.contextual.opportunities.length,
      reasoning: resolvedIntent.reasoning,
    };

    const signals = [
      {
        id: "contextual-intent-inferred",
        category: "context" as const,
        title: "Operator Intent Inferred",
        summary: `Oracle inferred the Operator's current intent as "${resolvedIntent.intent}" with ${resolvedIntent.confidenceLabel} confidence.`,
        severity:
          resolvedIntent.confidence >= 0.55
            ? ("medium" as const)
            : ("low" as const),
        direction: "neutral" as const,
        confidence: resolvedIntent.confidence,
        createdAt: new Date().toISOString(),
      },
    ];

    const decisions = [
      {
        category: "context" as const,
        title: "Prioritise Current Operator Intent",
        recommendation:
          resolvedIntent.intent === "unknown"
            ? "Continue gathering Operator context before making a strong contextual recommendation."
            : `Prioritise intelligence that supports the Operator's current "${resolvedIntent.intent}" intent.`,
        summary: `Oracle inferred the current Operator intent as "${resolvedIntent.intent}".`,
        confidence: decisionConfidence,
        priority:
          decisionConfidence >= 80
            ? ("high" as const)
            : decisionConfidence >= 55
              ? ("medium" as const)
              : ("low" as const),
        evidence: [
          {
            label: "Inferred Intent",
            value: resolvedIntent.intent,
            detail: resolvedIntent.reasoning,
          },
          {
            label: "Contextual Opportunities",
            value: context.contextual.opportunities.length,
            detail:
              "Number of contextual opportunities available in Oracle Context.",
          },
          {
            label: "Recent Sessions",
            value: context.session.recentSessions.length,
            detail:
              "Recent sessions available to Oracle Context during intent inference.",
          },
        ],
        expectedOutcome:
          resolvedIntent.intent === "unknown"
            ? "Oracle will avoid overconfident contextual recommendations until stronger evidence is available."
            : "Oracle recommendations will better align with what the Operator is currently trying to accomplish.",
        reassessmentTrigger:
          "Reassess when Operator intent, contextual opportunities, current game, or recent session evidence changes.",
      },
    ];

    return buildEngineResult(contextualIntelligenceEngine, {
      profile,
      signals,
      decisions,
      diagnostics: profile,
    });
  },
};