import type { OracleDecisionEvidence } from "./decision-types";

type EvidenceInput = {
  sessionsAnalysed: number;
  sampleSize: number;
  consistency: number;
  trendStability: number;
};

export function generateDecisionEvidence({
  sessionsAnalysed,
  sampleSize,
  consistency,
  trendStability,
}: EvidenceInput): OracleDecisionEvidence[] {
  return [
    {
      label: "Oracle Sessions Analysed",
      value: sessionsAnalysed,
    },
    {
      label: "Analysed Engagements",
      value: sampleSize,
    },
    {
      label: "Performance Consistency",
      value: `${consistency}%`,
    },
    {
      label: "Trend Stability",
      value: `${trendStability}%`,
    },
  ];
}