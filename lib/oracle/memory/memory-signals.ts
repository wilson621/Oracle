import type { OracleSignal } from "@/lib/oracle/signals/signal-types";
import type {
  OracleMemoryPattern,
  OracleMemoryProfile,
} from "./memory-types";

export function buildMemorySignals(input: {
  status: OracleMemoryProfile["status"];
  sessionCount: number;
  confidence: number;
  recurringWeaknesses: OracleMemoryPattern[];
  recurringStrengths: OracleMemoryPattern[];
}): OracleSignal[] {
  return [
    {
      id: "memory-profile-generated",
      category: "memory",
      title: "Oracle Memory Profile Generated",
      summary: `Oracle Memory is ${input.status} with ${input.sessionCount} recent sessions available.`,
      severity: input.sessionCount >= 3 ? "medium" : "low",
      direction: input.sessionCount >= 3 ? "positive" : "neutral",
      confidence: input.confidence,
      createdAt: new Date().toISOString(),
    },
    ...input.recurringWeaknesses.map((weakness) => ({
      id: `recurring-weakness-${weakness.skill}`,
      category: "memory" as const,
      title: "Recurring Weakness Detected",
      summary: `${weakness.label} has appeared as a weakness in ${weakness.occurrences} recent sessions.`,
      severity: "high" as const,
      direction: "negative" as const,
      confidence: weakness.confidence,
      createdAt: new Date().toISOString(),
    })),
    ...input.recurringStrengths.map((strength) => ({
      id: `recurring-strength-${strength.skill}`,
      category: "memory" as const,
      title: "Recurring Strength Detected",
      summary: `${strength.label} has appeared as a strength in ${strength.occurrences} recent sessions.`,
      severity: "medium" as const,
      direction: "positive" as const,
      confidence: strength.confidence,
      createdAt: new Date().toISOString(),
    })),
  ];
}