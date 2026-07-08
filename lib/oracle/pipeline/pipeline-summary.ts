import type { IntelligencePipelineResult } from "./pipeline-types";
import { getTopSignals } from "@/lib/oracle/signals/signal-summary";

export function generatePipelineSummary(
  result: IntelligencePipelineResult
): string {
  const topSignals = getTopSignals(result.signals, 3);

  if (topSignals.length === 0) {
    return `Oracle pipeline completed for ${result.callsign}. No active intelligence signals detected yet.`;
  }

  return `Oracle pipeline completed for ${result.callsign}. Top intelligence signal: ${topSignals[0].title}.`;
}