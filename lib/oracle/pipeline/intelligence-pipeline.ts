import type {
  IntelligencePipelineInput,
  IntelligencePipelineResult,
} from "./pipeline-types";

import { summarizeSignals } from "@/lib/oracle/signals/signal-summary";

export function runIntelligencePipeline(
  context: IntelligencePipelineInput
): IntelligencePipelineResult {
  const signals = context.intelligence.signals;
  const decisions = context.intelligence.decisions;

  return {
    operatorId: context.operator.operatorId,
    callsign: context.operator.callsign,
    generatedAt: context.generatedAt,
    signals,
    decisions,
    summary: summarizeSignals(signals),
  };
}