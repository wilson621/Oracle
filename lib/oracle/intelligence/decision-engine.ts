import type {
  OracleDecision,
  OracleDecisionCategory,
  OracleDecisionPriority,
} from "./decision-types";
import { calculateOracleConfidence } from "./confidence-engine";
import { generateDecisionEvidence } from "./evidence-engine";

type GenerateOracleDecisionInput = {
  category: OracleDecisionCategory;
  title: string;
  recommendation: string;
  summary: string;
  expectedOutcome: string;
  reassessmentTrigger: string;
  priority?: OracleDecisionPriority;
  sessionsAnalysed: number;
  sampleSize: number;
  consistency: number;
  trendStability: number;
};

function getPriority(confidence: number): OracleDecisionPriority {
  if (confidence >= 85) return "high";
  if (confidence >= 65) return "medium";
  return "low";
}

export function generateOracleDecision({
  category,
  title,
  recommendation,
  summary,
  expectedOutcome,
  reassessmentTrigger,
  priority,
  sessionsAnalysed,
  sampleSize,
  consistency,
  trendStability,
}: GenerateOracleDecisionInput): OracleDecision {
  const confidence = calculateOracleConfidence({
    sessionsAnalysed,
    sampleSize,
    consistency,
    trendStability,
  });

  return {
    category,
    title,
    recommendation,
    summary,
    confidence,
    priority: priority ?? getPriority(confidence),
    evidence: generateDecisionEvidence({
      sessionsAnalysed,
      sampleSize,
      consistency,
      trendStability,
    }),
    expectedOutcome,
    reassessmentTrigger,
  };
}