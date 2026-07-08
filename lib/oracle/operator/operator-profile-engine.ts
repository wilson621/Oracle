import type {
  OperatorConfidenceLevel,
  OperatorLearningStyle,
  OperatorProfile,
} from "./operator-profile-types";

type OperatorProfileEngineInput = {
  callsign: string;
  positioning: number;
  aim: number;
  movement: number;
  decisionMaking: number;
  gameSense: number;
};

function getConfidenceLevel(score: number): OperatorConfidenceLevel {
  if (score >= 85) return "elite";
  if (score >= 70) return "high";
  if (score >= 45) return "moderate";
  return "low";
}

function getLearningStyle({
  movement,
  decisionMaking,
  gameSense,
}: Pick<
  OperatorProfileEngineInput,
  "movement" | "decisionMaking" | "gameSense"
>): OperatorLearningStyle {
  if (gameSense >= 70 && decisionMaking >= 70) return "analytical";
  if (decisionMaking >= movement) return "methodical";
  if (movement >= 70) return "aggressive";
  return "adaptive";
}

function getBehaviouralDNA({
  positioning,
  movement,
  decisionMaking,
}: Pick<
  OperatorProfileEngineInput,
  "positioning" | "movement" | "decisionMaking"
>) {
  if (positioning < 45) {
    return "Positioning remains the dominant behavioural constraint.";
  }

  if (decisionMaking < 45) {
    return "Decision timing is currently limiting combat conversion.";
  }

  if (movement < 45) {
    return "Movement efficiency requires operational reinforcement.";
  }

  return "Operator behaviour is stabilising across core combat disciplines.";
}

function getStrengths(input: OperatorProfileEngineInput) {
  const scores = [
    { label: "Positioning", value: input.positioning },
    { label: "Aim", value: input.aim },
    { label: "Movement", value: input.movement },
    { label: "Decision Making", value: input.decisionMaking },
    { label: "Game Sense", value: input.gameSense },
  ];

  return scores
    .sort((a, b) => b.value - a.value)
    .slice(0, 2)
    .map((score) => score.label);
}

function getWeaknesses(input: OperatorProfileEngineInput) {
  const scores = [
    { label: "Positioning", value: input.positioning },
    { label: "Aim", value: input.aim },
    { label: "Movement", value: input.movement },
    { label: "Decision Making", value: input.decisionMaking },
    { label: "Game Sense", value: input.gameSense },
  ];

  return scores
    .sort((a, b) => a.value - b.value)
    .slice(0, 2)
    .map((score) => score.label);
}

export function generateOperatorProfile(
  input: OperatorProfileEngineInput
): OperatorProfile {
  const averageScore = Math.round(
    (input.positioning +
      input.aim +
      input.movement +
      input.decisionMaking +
      input.gameSense) /
      5
  );

  return {
    callsign: input.callsign,
    learningStyle: getLearningStyle(input),
    confidenceLevel: getConfidenceLevel(averageScore),
    behaviouralDNA: getBehaviouralDNA(input),

    weaponProfile: {
      preferredWeaponClass: "Adaptive",
      recoilControl: input.aim,
      accuracy: input.aim,
      confidence: averageScore,
    },

    decisionProfile: {
      aggression: input.movement,
      patience: input.positioning,
      adaptability: input.gameSense,
      discipline: input.decisionMaking,
    },

    behaviourProfile: {
      positioning: input.positioning,
      movement: input.movement,
      awareness: input.gameSense,
      consistency: averageScore,
    },

    strengths: getStrengths(input),
    weaknesses: getWeaknesses(input),

    generatedAt: new Date().toISOString(),
  };
}