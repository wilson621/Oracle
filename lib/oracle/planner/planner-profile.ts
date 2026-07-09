import type {
  PlannerIntelligenceInput,
  PlannerProfile,
} from "./planner-types";
import { determinePlannerPriority } from "./planner-priority";
import { plannerSummary } from "./planner-summary";
import { buildPlannerDecision } from "./planner-intelligence";

type PlannerScoreInput = {
  operatorId?: string;
  positioning: number;
  aim: number;
  movement: number;
  decisionMaking: number;
  gameSense: number;
};

export function generatePlannerProfile(
  input: PlannerScoreInput
): PlannerProfile {
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
      source: "scores",
      evidence: [],
    },
  };
}

export function generatePlannerProfileFromIntelligence(
  input: PlannerIntelligenceInput,
  operatorId?: string
): PlannerProfile {
  const decision = buildPlannerDecision(input);

  return {
    operatorId,
    generatedAt: new Date().toISOString(),
    recommendation: {
      priority: decision.priority,
      confidence: decision.confidence,
      reason: decision.reason,
      source: decision.source,
      evidence: decision.evidence,
    },
  };
}