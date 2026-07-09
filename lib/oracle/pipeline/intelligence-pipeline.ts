import type {
  IntelligencePipelineInput,
  IntelligencePipelineResult,
} from "./pipeline-types";

import { registerCoreOracleEngines } from "@/lib/oracle/engines";
import { runIntelligenceBus } from "@/lib/oracle/bus";
import { summarizeSignals } from "@/lib/oracle/signals/signal-summary";
import { generateOracleBrainGraphReport } from "@/lib/oracle/brain";
import { buildOracleTimelineFromSignals } from "@/lib/oracle/timeline";
import { runPlannerIntelligenceRuntime } from "@/lib/oracle/planner";

export async function runIntelligencePipeline(
  context: IntelligencePipelineInput
): Promise<IntelligencePipelineResult> {
  registerCoreOracleEngines();

  const bus = await runIntelligenceBus(context);
  const brain = generateOracleBrainGraphReport(bus.graph);
  const timeline = buildOracleTimelineFromSignals(bus.signals);

  const planner = runPlannerIntelligenceRuntime({
    operatorId: context.operator.operatorId,
    brain,
    timeline,
    graphEntries: bus.graph.entries,
    signals: bus.signals,
  });

  const signals = [...bus.signals, ...planner.signals];

  return {
    operatorId: context.operator.operatorId,
    callsign: context.operator.callsign,
    generatedAt: context.generatedAt,
    signals,
    decisions: bus.decisions,
    summary: summarizeSignals(signals),
    bus,
    brain,
    timeline,
    planner,
  };
}