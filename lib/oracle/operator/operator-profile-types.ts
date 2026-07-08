export type OperatorLearningStyle =
  | "adaptive"
  | "methodical"
  | "aggressive"
  | "analytical";

export type OperatorConfidenceLevel =
  | "low"
  | "moderate"
  | "high"
  | "elite";

export type OperatorWeaponProfile = {
  preferredWeaponClass: string;
  recoilControl: number;
  accuracy: number;
  confidence: number;
};

export type OperatorDecisionProfile = {
  aggression: number;
  patience: number;
  adaptability: number;
  discipline: number;
};

export type OperatorBehaviourProfile = {
  positioning: number;
  movement: number;
  awareness: number;
  consistency: number;
};

export type OperatorProfile = {
  callsign: string;

  learningStyle: OperatorLearningStyle;

  confidenceLevel: OperatorConfidenceLevel;

  behaviouralDNA: string;

  weaponProfile: OperatorWeaponProfile;

  decisionProfile: OperatorDecisionProfile;

  behaviourProfile: OperatorBehaviourProfile;

  strengths: string[];

  weaknesses: string[];

  generatedAt: string;
};