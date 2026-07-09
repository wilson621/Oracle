import type { OracleBrainGraphReport } from "@/lib/oracle/brain";
import type { OracleDecisionProfile } from "@/lib/oracle/intelligence/decision-profile";
import type { PlannerProfile } from "@/lib/oracle/planner";
import type { OracleSignal } from "@/lib/oracle/signals/signal-types";
import type { OracleTimeline } from "@/lib/oracle/timeline";
import { confidenceToExplanationStrength } from "./explainability-strength";
import { buildExplanationConclusion } from "./explainability-summary";
import type {
  OracleExplanation,
  OracleExplanationEvidence,
} from "./explainability-types";

function normaliseDecisionConfidence(confidence: number): number {
  return confidence > 1 ? confidence / 100 : confidence;
}

function brainEvidence(brain: OracleBrainGraphReport): OracleExplanationEvidence[] {
  return brain.findings.map((finding) => ({
    source: "brain",
    title: finding.title,
    summary: finding.summary,
    strength: confidenceToExplanationStrength(finding.confidence),
    confidence: finding.confidence,
  }));
}

function timelineEvidence(
  timeline: OracleTimeline
): OracleExplanationEvidence[] {
  return timeline.events.map((event) => ({
    source: "timeline",
    title: event.title,
    summary: event.summary,
    strength: confidenceToExplanationStrength(event.confidence),
    confidence: event.confidence,
  }));
}

function signalEvidence(signals: OracleSignal[]): OracleExplanationEvidence[] {
  return signals.map((signal) => ({
    source: "signals",
    title: signal.title,
    summary: signal.summary,
    strength: confidenceToExplanationStrength(signal.confidence),
    confidence: signal.confidence,
  }));
}

function plannerEvidence(planner: PlannerProfile): OracleExplanationEvidence[] {
  return planner.recommendation.evidence.map((evidence) => ({
    source: "planner",
    title: `Planner evidence: ${evidence.priority}`,
    summary: evidence.reason,
    strength: confidenceToExplanationStrength(evidence.weight / 3),
    confidence: Math.min(evidence.weight / 3, 1),
  }));
}

function decisionEvidence(
  decisionProfile: OracleDecisionProfile
): OracleExplanationEvidence[] {
  const evidence: OracleExplanationEvidence[] = [];

  if (decisionProfile.primaryDecision) {
    const confidence = normaliseDecisionConfidence(
      decisionProfile.primaryDecision.confidence
    );

    evidence.push({
      source: "decision",
      title: `Primary decision: ${decisionProfile.primaryDecision.title}`,
      summary: decisionProfile.rationale,
      strength: confidenceToExplanationStrength(confidence),
      confidence,
    });
  }

  decisionProfile.supportingDecisions.forEach((decision) => {
    const confidence = normaliseDecisionConfidence(decision.confidence);

    evidence.push({
      source: "decision",
      title: `Considered decision: ${decision.title}`,
      summary: `${decision.title} was considered but ranked below the primary decision. ${decision.summary}`,
      strength: confidenceToExplanationStrength(confidence),
      confidence,
    });
  });

  return evidence;
}

function calculateExplanationConfidence(
  evidence: OracleExplanationEvidence[]
): number {
  if (evidence.length === 0) return 0.25;

  const average =
    evidence.reduce((total, item) => total + item.confidence, 0) /
    evidence.length;

  return Math.round(average * 100) / 100;
}

export function buildPlannerExplanation(input: {
  planner: PlannerProfile;
  brain: OracleBrainGraphReport;
  timeline: OracleTimeline;
  signals: OracleSignal[];
  decisionProfile: OracleDecisionProfile;
}): OracleExplanation {
  const evidence = [
    ...decisionEvidence(input.decisionProfile),
    ...plannerEvidence(input.planner),
    ...brainEvidence(input.brain),
    ...timelineEvidence(input.timeline),
    ...signalEvidence(input.signals),
  ];

  const title = input.decisionProfile.primaryDecision
    ? `Why Oracle selected ${input.decisionProfile.primaryDecision.title}`
    : `Why Oracle selected ${input.planner.recommendation.priority}`;

  const confidence = calculateExplanationConfidence(evidence);

  return {
    id: "planner-explanation",
    title,
    conclusion: buildExplanationConclusion({
      title,
      evidence,
    }),
    confidence,
    evidence,
    generatedAt: new Date().toISOString(),
  };
}