import type { OracleSignal } from "./signal-types";
import { sortSignals } from "./signal-priority";

export function summarizeSignals(signals: OracleSignal[]): string {
  if (signals.length === 0) {
    return "Oracle has not detected any active intelligence signals yet.";
  }

  const [topSignal] = sortSignals(signals);

  return `${topSignal.title}: ${topSignal.summary}`;
}

export function getTopSignals(
  signals: OracleSignal[],
  limit = 3
): OracleSignal[] {
  return sortSignals(signals).slice(0, limit);
}