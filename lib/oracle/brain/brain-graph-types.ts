import type { OracleIntelligenceGraphKey } from "@/lib/oracle/graph";

export type OracleBrainGraphFinding = {
  source: OracleIntelligenceGraphKey;
  title: string;
  summary: string;
  confidence: number;
};

export type OracleBrainGraphReport = {
  generatedAt: string;
  findingCount: number;
  confidence: number;
  summary: string;
  findings: OracleBrainGraphFinding[];
};