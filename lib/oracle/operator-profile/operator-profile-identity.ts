import type { OperatorCombatIdentity } from "./operator-profile-types";

export function classifyOperatorCombatIdentity(input: {
  aim: number;
  movement: number;
  positioning: number;
  decisionMaking: number;
  gameSense: number;
}): OperatorCombatIdentity {
  const mechanicalAverage = Math.round((input.aim + input.movement) / 2);

  const tacticalAverage = Math.round(
    (input.positioning + input.decisionMaking + input.gameSense) / 3
  );

  if (mechanicalAverage >= 75 && tacticalAverage >= 75) {
    return "adaptive_operator";
  }

  if (mechanicalAverage >= tacticalAverage + 8) {
    return "mechanical_operator";
  }

  if (tacticalAverage >= mechanicalAverage + 8) {
    return "tactical_operator";
  }

  if (mechanicalAverage >= 55 || tacticalAverage >= 55) {
    return "balanced_operator";
  }

  return "emerging_operator";
}