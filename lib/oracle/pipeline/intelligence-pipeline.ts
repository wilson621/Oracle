import type {
  IntelligencePipelineInput,
  IntelligencePipelineResult,
} from "./pipeline-types";

import type { OracleSignal } from "@/lib/oracle/signals/signal-types";
import type { OracleDecision } from "@/lib/oracle/intelligence/decision-types";

import { summarizeSignals } from "@/lib/oracle/signals/signal-summary";

export function runIntelligencePipeline({
  operatorId,
  callsign,
  sessionsAnalysed,
}: IntelligencePipelineInput): IntelligencePipelineResult {
  const signals: OracleSignal[] = [];

  const decisions: OracleDecision[] = [];

  return {
    operatorId,
    callsign,
    generatedAt: new Date().toISOString(),
    signals,
    decisions,
    summary: summarizeSignals(signals),
  };
}