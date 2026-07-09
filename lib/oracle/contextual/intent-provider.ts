import type { OracleContext } from "@/lib/oracle/context";
import type { ContextualIntentConfidence } from "./intent-resolver";

export type OperatorIntentCandidate = {
  intent: OracleContext["contextual"]["intent"];
  confidence: number;
  confidenceLabel: ContextualIntentConfidence;
  reasoning: string;
  source: string;
};

export type OperatorIntentProvider = {
  id: string;
  priority: number;
  resolve(context: OracleContext): OperatorIntentCandidate | null;
};