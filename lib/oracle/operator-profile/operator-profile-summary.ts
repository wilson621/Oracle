import type {
  OperatorCombatIdentity,
  OperatorLearningStyle,
} from "./operator-profile-types";

function formatIdentity(identity: OperatorCombatIdentity): string {
  return identity
    .split("_")
    .map((word) => word[0].toUpperCase() + word.slice(1))
    .join(" ");
}

function formatLearningStyle(style: OperatorLearningStyle): string {
  return style
    .split("_")
    .map((word) => word[0].toUpperCase() + word.slice(1))
    .join(" ");
}

export function buildOperatorProfileSummary(input: {
  combatIdentity: OperatorCombatIdentity;
  learningStyle: OperatorLearningStyle;
  confidence: number;
}): string {
  return `Oracle currently identifies this operator as a ${formatIdentity(
    input.combatIdentity
  )} with a ${formatLearningStyle(
    input.learningStyle
  )} learning style. Profile confidence is ${Math.round(
    input.confidence * 100
  )}%.`;
}