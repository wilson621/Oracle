import type { OracleContext } from "@/lib/oracle/context";
import {
  addOracleIntelligenceGraphEntries,
  createEmptyOracleIntelligenceGraph,
} from "@/lib/oracle/graph";
import type { OracleIntelligenceGraph } from "@/lib/oracle/graph";
import type { OracleDecision } from "@/lib/oracle/intelligence/decision-types";
import type { OracleSignal } from "@/lib/oracle/signals/signal-types";
import type { OracleEngineResult } from "./oracle-engine";

export type OracleEngineRuntime = OracleContext & {
  context: OracleContext;
  completedResults: Map<string, OracleEngineResult<unknown>>;
  graph: OracleIntelligenceGraph;
  signals: OracleSignal[];
  decisions: OracleDecision[];

  getResult<TProfile>(
    engineId: string
  ): OracleEngineResult<TProfile> | undefined;

  completeEngineResult(
    result: OracleEngineResult<unknown>
  ): void;
};

export function createOracleEngineRuntime(
  context: OracleContext
): OracleEngineRuntime {
  const runtime: OracleEngineRuntime = {
    ...context,

    context,

    completedResults: new Map<string, OracleEngineResult<unknown>>(),

    graph: createEmptyOracleIntelligenceGraph(),

    signals: [...context.intelligence.signals],

    decisions: [...context.intelligence.decisions],

    getResult<TProfile>(
      engineId: string
    ): OracleEngineResult<TProfile> | undefined {
      return runtime.completedResults.get(engineId) as
        | OracleEngineResult<TProfile>
        | undefined;
    },

    completeEngineResult(
      result: OracleEngineResult<unknown>
    ): void {
      runtime.completedResults.set(result.engineId, result);

      runtime.signals.push(...result.signals);
      runtime.decisions.push(...result.decisions);

      runtime.graph = addOracleIntelligenceGraphEntries(
        runtime.graph,
        result.graph
      );
    },
  };

  return runtime;
}