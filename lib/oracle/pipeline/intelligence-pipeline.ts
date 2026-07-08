import type {
  IntelligencePipelineInput,
  IntelligencePipelineResult,
} from "./pipeline-types";

import { registerCoreOracleEngines } from "@/lib/oracle/engines";
import { runIntelligenceBus } from "@/lib/oracle/bus";
import { summarizeSignals } from "@/lib/oracle/signals/signal-summary";
import { generateOracleBrainGraphReport } from "@/lib/oracle/brain";

export async function runIntelligencePipeline(
  context: IntelligencePipelineInput
): Promise<IntelligencePipelineResult> {
  registerCoreOracleEngines();

  const bus = await runIntelligenceBus(context);
  const brain = generateOracleBrainGraphReport(bus.graph);

  return {
    operatorId: context.operator.operatorId,
    callsign: context.operator.callsign,
    generatedAt: context.generatedAt,
    signals: bus.signals,
    decisions: bus.decisions,
    summary: summarizeSignals(bus.signals),
    bus,
    brain,
  };
}