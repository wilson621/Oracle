import type { OracleBrainGraphReport } from "@/lib/oracle/brain";
import type { OracleIntelligenceGraphEntry } from "@/lib/oracle/graph";
import type { OracleSignal } from "@/lib/oracle/signals/signal-types";
import type { OracleTimeline } from "@/lib/oracle/timeline";
import { generatePlannerProfileFromIntelligence } from "./planner-profile";
import { plannerSignals } from "./planner-signals";
import type { PlannerResult } from "./planner-types";

export function runPlannerIntelligenceRuntime(input: {
  operatorId: string;
  brain: OracleBrainGraphReport;
  timeline: OracleTimeline;
  graphEntries: OracleIntelligenceGraphEntry[];
  signals: OracleSignal[];
}): PlannerResult & {
  graph: OracleIntelligenceGraphEntry[];
} {
  const profile = generatePlannerProfileFromIntelligence(
    {
      brain: input.brain,
      timeline: input.timeline,
      graph: {
        entries: input.graphEntries,
      },
      signals: input.signals,
    },
    input.operatorId
  );

  const signals = plannerSignals(profile);

  return {
    profile,
    signals,
    graph: [
      {
        key: "planner",
        engineId: "planner-intelligence-runtime",
        profile,
        generatedAt: new Date().toISOString(),
      },
    ],
  };
}