export type OracleExplanationSource =
  | "brain"
  | "timeline"
  | "graph"
  | "signals"
  | "planner"
  | "decision"
  | "memory"
  | "evolution"
  | "coaching"
  | "mission";

export type OracleExplanationStrength = "weak" | "moderate" | "strong";

export type OracleExplanationEvidence = {
  source: OracleExplanationSource;
  title: string;
  summary: string;
  strength: OracleExplanationStrength;
  confidence: number;
};

export type OracleExplanation = {
  id: string;
  title: string;
  conclusion: string;
  confidence: number;
  evidence: OracleExplanationEvidence[];
  generatedAt: string;
};