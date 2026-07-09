import type { OracleExplanationStrength } from "./explainability-types";

export function confidenceToExplanationStrength(
  confidence: number
): OracleExplanationStrength {
  if (confidence >= 0.75) return "strong";
  if (confidence >= 0.5) return "moderate";
  return "weak";
}