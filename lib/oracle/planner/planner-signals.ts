import type { OracleSignal } from "@/lib/oracle/signals/signal-types";
import type { PlannerProfile } from "./planner-types";

function plannerConfidenceToNumber(confidence: PlannerProfile["recommendation"]["confidence"]) {
  if (confidence === "high") return 0.9;
  if (confidence === "medium") return 0.7;
  return 0.5;
}

export function plannerSignals(profile: PlannerProfile): OracleSignal[] {
  return [
    {
      id: "planner-priority",
      category: "coach",
      title: "Planner Recommendation",
      summary: profile.recommendation.reason,
      severity: "medium",
      direction: "positive",
      confidence: plannerConfidenceToNumber(profile.recommendation.confidence),
      createdAt: new Date().toISOString(),
    },
  ];
}