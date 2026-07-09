import type { OracleExplanationEvidence } from "./explainability-types";

export function buildExplanationConclusion(input: {
  title: string;
  evidence: OracleExplanationEvidence[];
}): string {
  if (input.evidence.length === 0) {
    return `${input.title} is based on insufficient evidence.`;
  }

  const strongestEvidence = [...input.evidence].sort(
    (a, b) => b.confidence - a.confidence
  )[0];

  return `${input.title} is supported most strongly by ${strongestEvidence.source}: ${strongestEvidence.summary}`;
}