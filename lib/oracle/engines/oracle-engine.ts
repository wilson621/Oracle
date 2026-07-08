import type { OracleContext } from "@/lib/oracle/context";
import type { OracleSignal } from "@/lib/oracle/signals/signal-types";
import type { OracleDecision } from "@/lib/oracle/intelligence/decision-types";
import type { OracleIntelligenceGraphEntry } from "@/lib/oracle/graph";

export type OracleEngineCapability =
  | "context"
  | "operator"
  | "behaviour"
  | "trend"
  | "prediction"
  | "weapon"
  | "memory"
  | "strategy"
  | "map"
  | "coach"
  | "signal"
  | "decision";

export type OracleEngineMetadata = {
  id: string;
  name: string;
  version: string;
  description: string;
  priority: number;
  capabilities: OracleEngineCapability[];
  supportedGames: string[];
  dependencies: string[];
  producesSignals: boolean;
  producesDecisions: boolean;
};

export type OracleEngineResult<TOutput> = {
  engineId: string;
  generatedAt: string;
  output: TOutput;
  graph: OracleIntelligenceGraphEntry[];
  signals: OracleSignal[];
  decisions: OracleDecision[];
  diagnostics?: Record<string, unknown>;
};

export interface OracleEngine<TOutput> {
  metadata: OracleEngineMetadata;
  execute(context: OracleContext): Promise<OracleEngineResult<TOutput>>;
}