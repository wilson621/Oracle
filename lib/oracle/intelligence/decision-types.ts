export type OracleDecisionCategory =
  | "coach"
  | "weapon"
  | "loadout"
  | "strategy"
  | "memory"
  | "report";

export type OracleDecisionPriority =
  | "low"
  | "medium"
  | "high"
  | "critical";

export type OracleDecisionEvidence = {
  label: string;
  value?: string | number;
  detail?: string;
};

export type OracleDecision = {
  category: OracleDecisionCategory;
  title: string;
  recommendation: string;
  summary: string;
  confidence: number;
  priority: OracleDecisionPriority;
  evidence: OracleDecisionEvidence[];
  expectedOutcome: string;
  reassessmentTrigger: string;
};