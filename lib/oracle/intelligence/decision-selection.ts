import type {
  OracleDecision,
  OracleDecisionPriority,
} from "./decision-types";

export type OracleDecisionSelection = {
  primaryDecision: OracleDecision | null;
  supportingDecisions: OracleDecision[];
  decisionCount: number;
  rationale: string;
  generatedAt: string;
};

function priorityScore(priority: OracleDecisionPriority): number {
  switch (priority) {
    case "critical":
      return 400;
    case "high":
      return 300;
    case "medium":
      return 200;
    case "low":
      return 100;
  }
}

function scoreDecision(decision: OracleDecision): number {
  return priorityScore(decision.priority) + decision.confidence;
}

function buildSelectionRationale(
  primaryDecision: OracleDecision | null,
  supportingDecisions: OracleDecision[]
): string {
  if (!primaryDecision) {
    return "Oracle did not receive enough decision intelligence to select a primary recommendation.";
  }

  if (supportingDecisions.length === 0) {
    return `${primaryDecision.title} was selected as the primary decision because it is the only available Oracle decision.`;
  }

  return `${primaryDecision.title} was selected as the primary decision because it has the strongest combined priority and confidence score across ${supportingDecisions.length + 1} available decisions.`;
}

export function selectPrimaryOracleDecision(
  decisions: OracleDecision[]
): OracleDecisionSelection {
  const rankedDecisions = [...decisions].sort(
    (a, b) => scoreDecision(b) - scoreDecision(a)
  );

  const primaryDecision = rankedDecisions[0] ?? null;
  const supportingDecisions = rankedDecisions.slice(1);

  return {
    primaryDecision,
    supportingDecisions,
    decisionCount: decisions.length,
    rationale: buildSelectionRationale(primaryDecision, supportingDecisions),
    generatedAt: new Date().toISOString(),
  };
}