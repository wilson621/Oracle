import type { OracleContext } from "@/lib/oracle/context";
import type { OracleSignal } from "@/lib/oracle/signals/signal-types";
import type { OracleDecision } from "@/lib/oracle/intelligence/decision-types";
import type { IntelligenceBusResult } from "@/lib/oracle/bus";
import type { OracleBrainGraphReport } from "@/lib/oracle/brain";
import type { OracleTimeline } from "@/lib/oracle/timeline";

export type IntelligencePipelineInput = OracleContext;

export type IntelligencePipelineResult = {
  operatorId: string;
  callsign: string;
  generatedAt: string;
  signals: OracleSignal[];
  decisions: OracleDecision[];
  summary: string;
  bus: IntelligenceBusResult;
  brain: OracleBrainGraphReport;
  timeline: OracleTimeline;
};