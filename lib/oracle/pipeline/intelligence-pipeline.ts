import type {
  IntelligencePipelineInput,
  IntelligencePipelineResult,
} from "./pipeline-types";

import { registerCoreOracleEngines } from "@/lib/oracle/engines";
import { runIntelligenceBus } from "@/lib/oracle/bus";
import { summarizeSignals } from "@/lib/oracle/signals/signal-summary";

export async function runIntelligencePipeline(
  context: IntelligencePipelineInput
): Promise<IntelligencePipelineResult> {
  registerCoreOracleEngines();

  const bus = await runIntelligenceBus(context);

  const signals = context.intelligence.signals;
  const decisions = context.intelligence.decisions;

  return {
    operatorId: context.operator.operatorId,
    callsign: context.operator.callsign,
    generatedAt: context.generatedAt,
    signals,
    decisions,
    summary: summarizeSignals(signals),
    bus,
  };
}