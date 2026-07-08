import type { PlannerProfile } from "./planner-types";
import { determinePlannerPriority } from "./planner-priority";
import { plannerSummary } from "./planner-summary";

type PlannerInput = {
  operatorId?: string;
  positioning: number;
  aim: number;
  movement: number;
  decisionMaking: number;
  gameSense: number;
};

export function generatePlannerProfile(input: PlannerInput): PlannerProfile {
  const priority = determinePlannerPriority(
    input.positioning,
    input.aim,
    input.movement,
    input.decisionMaking,
    input.gameSense
  );

  return {
    operatorId: input.operatorId,
    generatedAt: new Date().toISOString(),
    recommendation: {
      priority,
      confidence: "high",
      reason: plannerSummary(priority),
    },
  };
}