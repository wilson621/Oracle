import type { OracleSignal } from "@/lib/oracle/signals/signal-types";

export type OracleMemoryStatus = "empty" | "forming" | "active" | "strong";

export type OracleMemorySkill =
  | "positioning"
  | "aim"
  | "movement"
  | "decisionMaking"
  | "gameSense";

export type OracleMemoryPattern = {
  skill: OracleMemorySkill;
  label: string;
  occurrences: number;
  averageScore: number;
  confidence: number;
};

export type OracleMemoryProfile = {
  operatorId: string;
  status: OracleMemoryStatus;
  sessionCount: number;
  behaviouralPatterns: string[];
  recurringWeaknesses: OracleMemoryPattern[];
  recurringStrengths: OracleMemoryPattern[];
  confidence: number;
  generatedAt: string;
};

export type OracleMemoryResult = {
  profile: OracleMemoryProfile;
  signals: OracleSignal[];
};