import type { OracleIntelligenceGraph } from "@/lib/oracle/graph";
import { buildOracleBrainGraphFindings } from "./brain-graph-reasoning";
import type { OracleBrainGraphReport } from "./brain-graph-types";

function calculateGraphConfidence(findings: { confidence: number }[]): number {
  if (findings.length === 0) return 0.25;

  const average =
    findings.reduce((total, finding) => total + finding.confidence, 0) /
    findings.length;

  return Math.round(average * 100) / 100;
}

function buildGraphSummary(findingCount: number): string {
  if (findingCount === 0) {
    return "Oracle Brain has not received enough Intelligence Graph data to produce a graph-based assessment.";
  }

  return `Oracle Brain has synthesised ${findingCount} intelligence findings from the Oracle Intelligence Graph.`;
}

export function generateOracleBrainGraphReport(
  graph: OracleIntelligenceGraph
): OracleBrainGraphReport {
  const findings = buildOracleBrainGraphFindings(graph);
  const confidence = calculateGraphConfidence(findings);

  return {
    generatedAt: new Date().toISOString(),
    findingCount: findings.length,
    confidence,
    summary: buildGraphSummary(findings.length),
    findings,
  };
}