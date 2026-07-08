import type {
  OracleSignal,
  OracleSignalSeverity,
} from "./signal-types";

export function getSignalSeverity(
  confidence: number
): OracleSignalSeverity {
  if (confidence >= 90) return "critical";
  if (confidence >= 75) return "high";
  if (confidence >= 50) return "medium";
  return "low";
}

export function sortSignals(
  signals: OracleSignal[]
): OracleSignal[] {
  const order: Record<OracleSignalSeverity, number> = {
    critical: 4,
    high: 3,
    medium: 2,
    low: 1,
  };

  return [...signals].sort(
    (a, b) =>
      order[b.severity] - order[a.severity] ||
      b.confidence - a.confidence
  );
}