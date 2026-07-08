import type { OracleSignal } from "@/lib/oracle/signals/signal-types";
import type { PlannerProfile } from "./planner-types";

export function plannerSignals(
  profile: PlannerProfile
): OracleSignal[] {
  return [
    {
      id: "planner-priority",
      category: "coach",
      title: "Planner Recommendation",
      summary: profile.recommendation.reason,
      severity: "medium",
      direction: "positive",
      confidence:
        profile.recommendation.confidence === "high"
          ? 0.9
          : profile.recommendation.confidence === "medium"
            ? 0.7
            : 0.5,
      createdAt: new Date().toISOString(),
    },
  ];
}