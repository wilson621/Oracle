import type { OracleSignal } from "@/lib/oracle/signals/signal-types";
import type { OracleDecision } from "@/lib/oracle/intelligence/decision-types";

export type IntelligencePipelineInput = {
  operatorId: string;
  callsign: string;
  sessionsAnalysed: number;
};

export type IntelligencePipelineResult = {
  operatorId: string;
  callsign: string;
  generatedAt: string;
  signals: OracleSignal[];
  decisions: OracleDecision[];
  summary: string;
};