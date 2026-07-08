import type { OracleSignal } from "@/lib/oracle/signals/signal-types";

export type OracleMemoryStatus =
  | "empty"
  | "forming"
  | "active"
  | "strong";

export type OracleMemoryProfile = {
  operatorId: string;
  status: OracleMemoryStatus;
  sessionCount: number;
  behaviouralPatterns: string[];
  recurringWeaknesses: string[];
  recurringStrengths: string[];
  confidence: number;
  generatedAt: string;
};

export type OracleMemoryResult = {
  profile: OracleMemoryProfile;
  signals: OracleSignal[];
};