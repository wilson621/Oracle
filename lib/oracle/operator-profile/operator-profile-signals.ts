import type { OracleSignal } from "@/lib/oracle/signals/signal-types";
import type { OperatorProfile } from "./operator-profile-types";

export function buildOperatorProfileSignals(
  profile: OperatorProfile
): OracleSignal[] {
  return [
    {
      id: "operator-profile-generated",
      category: "operator",
      title: "Operator Profile Generated",
      summary: profile.summary,
      severity: "medium",
      direction: "positive",
      confidence: profile.confidence,
      createdAt: new Date().toISOString(),
    },
  ];
}