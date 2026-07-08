import type { OracleContext } from "@/lib/oracle/context";
import type { OracleEngine, OracleEngineResult } from "@/lib/oracle/engines";
import type { OracleMemoryProfile, OracleMemoryResult } from "./memory-types";

function calculateMemoryStatus(sessionCount: number): OracleMemoryProfile["status"] {
  if (sessionCount === 0) return "empty";
  if (sessionCount < 3) return "forming";
  if (sessionCount < 10) return "active";
  return "strong";
}

function calculateMemoryConfidence(sessionCount: number): number {
  if (sessionCount === 0) return 0.2;
  if (sessionCount < 3) return 0.4;
  if (sessionCount < 10) return 0.65;
  return 0.85;
}

export const memoryEngine: OracleEngine<OracleMemoryResult> = {
  metadata: {
    id: "memory-engine",
    name: "Memory Engine",
    version: "1.0.0",
    description:
      "Builds the first persistent intelligence profile from historical Oracle Sessions.",
    priority: 20,
    capabilities: ["memory", "operator", "signal"],
    supportedGames: ["*"],
    dependencies: ["context-summary-engine"],
    producesSignals: true,
    producesDecisions: false,
  },

  async execute(
    context: OracleContext
  ): Promise<OracleEngineResult<OracleMemoryResult>> {
    const sessionCount = context.session.recentSessions.length;
    const status = calculateMemoryStatus(sessionCount);
    const confidence = calculateMemoryConfidence(sessionCount);

    const profile: OracleMemoryProfile = {
      operatorId: context.operator.operatorId,
      status,
      sessionCount,
      behaviouralPatterns: [],
      recurringWeaknesses: [],
      recurringStrengths: [],
      confidence,
      generatedAt: new Date().toISOString(),
    };

    return {
      engineId: this.metadata.id,
      generatedAt: new Date().toISOString(),
      output: {
        profile,
        signals: [
          {
            id: "memory-profile-generated",
            category: "memory",
            title: "Oracle Memory Profile Generated",
            summary: `Oracle Memory is ${status} with ${sessionCount} recent sessions available.`,
            severity: sessionCount >= 3 ? "medium" : "low",
            direction: sessionCount >= 3 ? "positive" : "neutral",
            confidence,
            createdAt: new Date().toISOString(),
          },
        ],
      },
      signals: [
        {
          id: "memory-profile-generated",
          category: "memory",
          title: "Oracle Memory Profile Generated",
          summary: `Oracle Memory is ${status} with ${sessionCount} recent sessions available.`,
          severity: sessionCount >= 3 ? "medium" : "low",
          direction: sessionCount >= 3 ? "positive" : "neutral",
          confidence,
          createdAt: new Date().toISOString(),
        },
      ],
      decisions: [],
      diagnostics: {
        status,
        sessionCount,
        confidence,
      },
    };
  },
};