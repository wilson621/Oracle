import type { OracleContext } from "@/lib/oracle/context";
import type { OracleEngine, OracleEngineResult } from "@/lib/oracle/engines";
import type { OracleMemoryProfile, OracleMemoryResult } from "./memory-types";
import { calculateMemoryStatus } from "./memory-status";
import { calculateMemoryConfidence } from "./memory-confidence";
import { detectRecurringWeaknesses } from "./memory-weaknesses";
import { detectRecurringStrengths } from "./memory-strengths";
import { buildBehaviouralPatterns } from "./memory-patterns";
import { buildMemorySignals } from "./memory-signals";

export const memoryEngine: OracleEngine<OracleMemoryResult> = {
  metadata: {
    id: "memory-engine",
    name: "Memory Engine",
    version: "1.2.0",
    description:
      "Builds evolving operator memory from historical Oracle Sessions.",
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

    const recurringWeaknesses = detectRecurringWeaknesses(context);
    const recurringStrengths = detectRecurringStrengths(context);
    const behaviouralPatterns = buildBehaviouralPatterns(
      recurringWeaknesses,
      recurringStrengths
    );

    const profile: OracleMemoryProfile = {
      operatorId: context.operator.operatorId,
      status,
      sessionCount,
      behaviouralPatterns,
      recurringWeaknesses,
      recurringStrengths,
      confidence,
      generatedAt: new Date().toISOString(),
    };

    const signals = buildMemorySignals({
      status,
      sessionCount,
      confidence,
      recurringWeaknesses,
      recurringStrengths,
    });

    return {
      engineId: this.metadata.id,
      generatedAt: new Date().toISOString(),
      output: {
        profile,
        signals,
      },
      signals,
      decisions: [],
      diagnostics: {
        status,
        sessionCount,
        confidence,
        recurringWeaknesses,
        recurringStrengths,
      },
    };
  },
};