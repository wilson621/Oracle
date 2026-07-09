import type { OracleContext } from "@/lib/oracle/context";
import type { OracleSignal } from "@/lib/oracle/signals/signal-types";
import type { OracleDecision } from "@/lib/oracle/intelligence/decision-types";
import type { OracleExplanation } from "@/lib/oracle/explainability";
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
  | "planner"
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

export type OracleEngineDiagnostics = Record<string, unknown>;

export type OracleEngineResult<TProfile> = {
  engineId: string;

  generatedAt: string;

  profile: TProfile;

  graph: OracleIntelligenceGraphEntry[];

  signals: OracleSignal[];

  decisions: OracleDecision[];

  explanations: OracleExplanation[];

  diagnostics: OracleEngineDiagnostics;

  metadata: OracleEngineMetadata;
};

export interface OracleEngine<TProfile> {
  metadata: OracleEngineMetadata;

  execute(
    context: OracleContext
  ): Promise<OracleEngineResult<TProfile>>;
}