import type {
  PlannerEvidence,
  PlannerIntelligenceInput,
  PlannerPriority,
  PlannerSource,
} from "./planner-types";

type PlannerDecision = {
  priority: PlannerPriority;
  source: PlannerSource;
  confidence: "low" | "medium" | "high";
  reason: string;
  evidence: PlannerEvidence[];
};

function textToPriority(text: string): PlannerPriority {
  const normalisedText = text.toLowerCase();

  if (normalisedText.includes("movement")) return "movement";
  if (normalisedText.includes("aim")) return "aim";
  if (normalisedText.includes("decision")) return "decision";
  if (normalisedText.includes("sense")) return "gamesense";
  if (normalisedText.includes("position")) return "positioning";

  return "positioning";
}

function confidenceToPlannerConfidence(
  confidence: number
): PlannerDecision["confidence"] {
  if (confidence >= 0.75) return "high";
  if (confidence >= 0.5) return "medium";
  return "low";
}

function addBrainEvidence(input: PlannerIntelligenceInput): PlannerEvidence[] {
  return input.brain.findings.map((finding) => ({
    source: "brain",
    priority: textToPriority(`${finding.title} ${finding.summary}`),
    weight: finding.confidence * 3,
    reason: finding.summary,
  }));
}

function addTimelineEvidence(input: PlannerIntelligenceInput): PlannerEvidence[] {
  return input.timeline.events.map((event) => ({
    source: "timeline",
    priority: textToPriority(`${event.title} ${event.summary}`),
    weight: event.confidence * 2,
    reason: event.summary,
  }));
}

function addSignalEvidence(input: PlannerIntelligenceInput): PlannerEvidence[] {
  return input.signals.map((signal) => ({
    source: "signals",
    priority: textToPriority(`${signal.title} ${signal.summary}`),
    weight: signal.confidence,
    reason: signal.summary,
  }));
}

function calculatePriorityScores(
  evidence: PlannerEvidence[]
): Record<PlannerPriority, number> {
  return evidence.reduce<Record<PlannerPriority, number>>(
    (scores, item) => ({
      ...scores,
      [item.priority]: scores[item.priority] + item.weight,
    }),
    {
      positioning: 0,
      aim: 0,
      movement: 0,
      decision: 0,
      gamesense: 0,
    }
  );
}

function selectWinningPriority(
  scores: Record<PlannerPriority, number>
): PlannerPriority {
  return (Object.entries(scores) as [PlannerPriority, number][]).sort(
    (a, b) => b[1] - a[1]
  )[0][0];
}

function buildReason(priority: PlannerPriority, evidence: PlannerEvidence[]) {
  const strongestEvidence = evidence
    .filter((item) => item.priority === priority)
    .sort((a, b) => b.weight - a.weight)[0];

  return (
    strongestEvidence?.reason ??
    "Oracle selected this priority from combined Planner evidence."
  );
}

function buildConfidence(
  priority: PlannerPriority,
  scores: Record<PlannerPriority, number>
): PlannerDecision["confidence"] {
  const score = scores[priority];

  if (score >= 4) return "high";
  if (score >= 2) return "medium";
  return "low";
}

export function buildPlannerDecision(
  input: PlannerIntelligenceInput
): PlannerDecision {
  const evidence = [
    ...addBrainEvidence(input),
    ...addTimelineEvidence(input),
    ...addSignalEvidence(input),
  ];

  if (evidence.length === 0) {
    return {
      priority: "positioning",
      source: "evidence",
      confidence: "low",
      reason:
        "Oracle has insufficient Planner evidence. Defaulting to positioning training.",
      evidence: [],
    };
  }

  const scores = calculatePriorityScores(evidence);
  const priority = selectWinningPriority(scores);

  return {
    priority,
    source: "evidence",
    confidence: buildConfidence(priority, scores),
    reason: buildReason(priority, evidence),
    evidence,
  };
}