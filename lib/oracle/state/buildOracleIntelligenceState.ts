import type { OracleContext } from "@/lib/oracle/context";
import type { IntelligenceBusResult } from "@/lib/oracle/bus";
import type { OracleBrainGraphReport } from "@/lib/oracle/brain";
import type { OracleTimeline } from "@/lib/oracle/timeline";
import type { PlannerResult } from "@/lib/oracle/planner";
import type { OracleExplanation } from "@/lib/oracle/explainability";
import type { OracleSignal } from "@/lib/oracle/signals/signal-types";
import type { OracleDecision } from "@/lib/oracle/intelligence/decision-types";
import { getOracleLifecycle } from "@/lib/oracle/lifecycle";
import type { OracleIntelligenceState } from "./oracle-intelligence-state-types";

export function buildOracleIntelligenceState(input: {
  context: OracleContext;
  bus: IntelligenceBusResult;
  brain: OracleBrainGraphReport;
  timeline: OracleTimeline;
  planner: PlannerResult;
  explanations: OracleExplanation[];
  signals: OracleSignal[];
  decisions: OracleDecision[];
}): OracleIntelligenceState {
  return {
    metadata: {
      generatedAt: new Date().toISOString(),
      operatorId: input.context.operator.operatorId,
      callsign: input.context.operator.callsign,
      version: "1.0.0",
    },

    lifecycle: getOracleLifecycle(),

    context: input.context,
    bus: input.bus,
    brain: input.brain,
    timeline: input.timeline,
    planner: input.planner,
    explanations: input.explanations,
    signals: input.signals,
    decisions: input.decisions,
  };
}