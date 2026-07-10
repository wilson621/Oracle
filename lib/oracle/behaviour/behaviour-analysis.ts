import type {
  BehaviourInput,
  BehaviourProfile,
  BehaviourTrait,
} from "./behaviour-types";

export function analyseBehaviour(input: BehaviourInput): BehaviourProfile {
  const {
    totalSessions,
    combatRating,
    positioning,
    aim,
    movement,
    decisionMaking,
    gameSense,
  } = input;

  const mechanicalScore = average([aim, movement]);
  const decisionScore = average([positioning, decisionMaking, gameSense]);
  const adaptabilityScore = average([movement, decisionMaking, gameSense]);
  const consistencyScore = calculateConsistency([
    positioning,
    aim,
    movement,
    decisionMaking,
    gameSense,
  ]);

  const confidence = calculateBehaviourConfidence(
    totalSessions,
    combatRating
  );

  return {
    playstyle: classifyPlaystyle({
      positioning,
      movement,
      aim,
      decisionMaking,
    }),
    discipline: createTrait("Discipline", positioning, confidence),
    mechanicalConfidence: createTrait(
      "Mechanical Confidence",
      mechanicalScore,
      confidence
    ),
    decisionConfidence: createTrait(
      "Decision Confidence",
      decisionScore,
      confidence
    ),
    adaptability: createTrait("Adaptability", adaptabilityScore, confidence),
    consistency: createTrait("Consistency", consistencyScore, confidence),
    overallBehaviourConfidence: confidence,
    strengths: detectStrengths({
      positioning,
      aim,
      movement,
      decisionMaking,
      gameSense,
    }),
    weaknesses: detectWeaknesses({
      positioning,
      aim,
      movement,
      decisionMaking,
      gameSense,
    }),
  };
}

function average(values: number[]): number {
  if (values.length === 0) return 0;

  return Math.round(
    values.reduce((sum, value) => sum + value, 0) / values.length
  );
}

function createTrait(
  label: string,
  score: number,
  confidence: number
): BehaviourTrait {
  return {
    label,
    score,
    confidence,
  };
}

function calculateBehaviourConfidence(
  totalSessions: number,
  combatRating: number
): number {
  let confidence = 0.25;

  if (totalSessions >= 1) confidence += 0.2;
  if (totalSessions >= 3) confidence += 0.2;
  if (totalSessions >= 8) confidence += 0.2;
  if (combatRating > 0) confidence += 0.15;

  return Math.min(confidence, 0.95);
}

function calculateConsistency(values: number[]): number {
  const validValues = values.filter((value) => value > 0);

  if (validValues.length === 0) return 0;

  const max = Math.max(...validValues);
  const min = Math.min(...validValues);
  const spread = max - min;

  return Math.max(0, Math.round(100 - spread));
}

function classifyPlaystyle(input: {
  positioning: number;
  movement: number;
  aim: number;
  decisionMaking: number;
}): BehaviourProfile["playstyle"] {
  const { positioning, movement, aim, decisionMaking } = input;

  if (positioning === 0 && movement === 0 && aim === 0) {
    return "Unclassified";
  }

  const aggressionScore = average([movement, aim]);
  const controlScore = average([positioning, decisionMaking]);

  if (aggressionScore >= controlScore + 12) return "Aggressive";
  if (controlScore >= aggressionScore + 12) return "Passive";

  return "Balanced";
}

function detectStrengths(input: {
  positioning: number;
  aim: number;
  movement: number;
  decisionMaking: number;
  gameSense: number;
}): string[] {
  return Object.entries(input)
    .filter(([, value]) => value >= 70)
    .map(([key]) => formatSkillName(key));
}

function detectWeaknesses(input: {
  positioning: number;
  aim: number;
  movement: number;
  decisionMaking: number;
  gameSense: number;
}): string[] {
  return Object.entries(input)
    .filter(([, value]) => value > 0 && value < 50)
    .map(([key]) => formatSkillName(key));
}

function formatSkillName(skill: string): string {
  return skill
    .replace(/([A-Z])/g, " $1")
    .replace(/^./, (char) => char.toUpperCase());
}