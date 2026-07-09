import type { OracleSignal } from "@/lib/oracle/signals/signal-types";

export type OperatorCombatIdentity =
  | "emerging_operator"
  | "balanced_operator"
  | "mechanical_operator"
  | "tactical_operator"
  | "adaptive_operator";

export type OperatorLearningStyle =
  | "visual"
  | "repetition"
  | "analysis"
  | "mission_driven";

export type OperatorProfile = {
  operatorId: string;
  callsign: string;
  combatIdentity: OperatorCombatIdentity;
  learningStyle: OperatorLearningStyle;
  mechanicalConfidence: number;
  tacticalConfidence: number;
  adaptability: number;
  consistency: number;
  pressureRating: number;
  summary: string;
  confidence: number;
  generatedAt: string;
};

export type OperatorProfileResult = {
  profile: OperatorProfile;
  signals: OracleSignal[];
};