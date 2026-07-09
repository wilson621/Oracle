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
import { buildPlannerExplanation } from "@/lib/oracle/explainability";
import { buildOracleDecisionProfile } from "@/lib/oracle/intelligence/decision-profile";
import { buildOracleIntelligenceState } from "@/lib/oracle/state";

export async function runIntelligencePipeline(
  context: IntelligencePipelineInput
): Promise<IntelligencePipelineResult> {
  registerCoreOracleEngines();

  const bus = await runIntelligenceBus(context);
  const brain = generateOracleBrainGraphReport(bus.graph);

  const initialTimeline = buildOracleTimelineFromSignals(bus.signals);

  const planner = runPlannerIntelligenceRuntime({
    operatorId: context.operator.operatorId,
    brain,
    timeline: initialTimeline,
    graphEntries: bus.graph.entries,
    signals: bus.signals,
  });

  const signals = [...bus.signals, ...planner.signals];
  const decisions = bus.decisions;
  const decisionProfile = buildOracleDecisionProfile(decisions);
  const timeline = buildOracleTimelineFromSignals(signals);

  const explanations = [
    buildPlannerExplanation({
      planner: planner.profile,
      brain,
      timeline,
      signals,
      decisionProfile,
    }),
  ];

  const state = buildOracleIntelligenceState({
    context,
    bus,
    brain,
    timeline,
    planner,
    explanations,
    signals,
    decisions,
    decisionProfile,
  });

  return {
    operatorId: context.operator.operatorId,
    callsign: context.operator.callsign,
    generatedAt: context.generatedAt,
    signals,
    decisions,
    summary: summarizeSignals(signals),
    bus,
    brain,
    timeline,
    planner,
    explanations,
    state,
  };
}