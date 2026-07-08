import type { OracleSignal } from "@/lib/oracle/signals/signal-types";
import type { OracleMemorySkill } from "@/lib/oracle/memory";

export type BehaviourEvolutionDirection =
  | "improving"
  | "declining"
  | "stable"
  | "insufficient_data";

export type BehaviourEvolutionPattern = {
  skill: OracleMemorySkill;
  label: string;
  direction: BehaviourEvolutionDirection;
  firstScore: number;
  latestScore: number;
  change: number;
  confidence: number;
};

export type BehaviourEvolutionProfile = {
  operatorId: string;
  sessionCount: number;
  patterns: BehaviourEvolutionPattern[];
  strongestImprovement: BehaviourEvolutionPattern | null;
  sharpestDecline: BehaviourEvolutionPattern | null;
  confidence: number;
  generatedAt: string;
};

export type BehaviourEvolutionResult = {
  profile: BehaviourEvolutionProfile;
  signals: OracleSignal[];
};