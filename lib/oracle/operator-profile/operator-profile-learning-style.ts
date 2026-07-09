import type { OperatorLearningStyle } from "./operator-profile-types";

export function determineOperatorLearningStyle(input: {
  sessionCount: number;
  consistency: number;
  adaptability: number;
}): OperatorLearningStyle {
  if (input.sessionCount < 3) return "visual";

  if (input.adaptability >= 75) return "mission_driven";

  if (input.consistency >= 75) return "repetition";

  return "analysis";
}