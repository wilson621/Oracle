import type { OracleContext } from "@/lib/oracle/context";
import type {
  OperatorIntentCandidate,
  OperatorIntentProvider,
} from "./intent-provider";
import {
  activeGameIntentProvider,
  explicitContextIntentProvider,
  opportunityIntentProvider,
  recentSessionIntentProvider,
} from "./providers";

export type ContextualIntentConfidence =
  | "low"
  | "medium"
  | "high";

export type ResolvedOperatorIntent = {
  intent: OracleContext["contextual"]["intent"];
  confidence: number;
  confidenceLabel: ContextualIntentConfidence;
  reasoning: string;
  source: string;
};

const defaultIntentProviders: OperatorIntentProvider[] = [
  explicitContextIntentProvider,
  opportunityIntentProvider,
  recentSessionIntentProvider,
  activeGameIntentProvider,
];

function rankIntentCandidates(
  candidates: OperatorIntentCandidate[]
): OperatorIntentCandidate[] {
  return [...candidates].sort((a, b) => b.confidence - a.confidence);
}

export function resolveOperatorIntent(
  context: OracleContext,
  providers: OperatorIntentProvider[] = defaultIntentProviders
): ResolvedOperatorIntent {
  const candidates = [...providers]
    .sort((a, b) => b.priority - a.priority)
    .map((provider) => provider.resolve(context))
    .filter((candidate): candidate is OperatorIntentCandidate => candidate !== null);

  const selectedCandidate = rankIntentCandidates(candidates)[0];

  if (selectedCandidate) {
    return selectedCandidate;
  }

  return {
    intent: "unknown",
    confidence: 0.35,
    confidenceLabel: "low",
    reasoning:
      'Oracle could not infer a strong intent signal, so intent remains "unknown".',
    source: "fallback-intent-provider",
  };
}