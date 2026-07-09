import type { OracleExplanation } from "@/lib/oracle/explainability";
import type { OracleIntelligenceGraphEntry } from "@/lib/oracle/graph";
import type { OracleDecision } from "@/lib/oracle/intelligence/decision-types";
import type {
  OracleEngine,
  OracleEngineDiagnostics,
  OracleEngineResult,
} from "./oracle-engine";
import type { OracleSignal } from "@/lib/oracle/signals/signal-types";

export function buildEngineResult<TProfile>(
  engine: OracleEngine<TProfile>,
  input: {
    profile: TProfile;
    graph?: OracleIntelligenceGraphEntry[];
    signals?: OracleSignal[];
    decisions?: OracleDecision[];
    explanations?: OracleExplanation[];
    diagnostics?: OracleEngineDiagnostics;
  }
): OracleEngineResult<TProfile> {
  return {
    engineId: engine.metadata.id,

    generatedAt: new Date().toISOString(),

    profile: input.profile,

    graph: input.graph ?? [],

    signals: input.signals ?? [],

    decisions: input.decisions ?? [],

    explanations: input.explanations ?? [],

    diagnostics: input.diagnostics ?? {},

    metadata: engine.metadata,
  };
}