export type BehaviourInput = {
  totalSessions: number;
  combatRating: number;
  positioning: number;
  aim: number;
  movement: number;
  decisionMaking: number;
  gameSense: number;
};

export type BehaviourTrait = {
  label: string;
  score: number;
  confidence: number;
};

export type BehaviourProfile = {
  playstyle: "Aggressive" | "Balanced" | "Passive" | "Unclassified";
  discipline: BehaviourTrait;
  mechanicalConfidence: BehaviourTrait;
  decisionConfidence: BehaviourTrait;
  adaptability: BehaviourTrait;
  consistency: BehaviourTrait;
  overallBehaviourConfidence: number;
  strengths: string[];
  weaknesses: string[];
};