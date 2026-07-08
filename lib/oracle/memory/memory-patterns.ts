import type { OracleMemoryPattern } from "./memory-types";

export function buildBehaviouralPatterns(
  weaknesses: OracleMemoryPattern[],
  strengths: OracleMemoryPattern[]
): string[] {
  const patterns: string[] = [];

  if (weaknesses.length > 0) {
    patterns.push(
      `${weaknesses[0].label} is currently the clearest recurring weakness.`
    );
  }

  if (strengths.length > 0) {
    patterns.push(
      `${strengths[0].label} is currently the clearest recurring strength.`
    );
  }

  if (weaknesses.length === 0 && strengths.length === 0) {
    patterns.push(
      "Oracle Memory requires more consistent session data before detecting behavioural patterns."
    );
  }

  return patterns;
}