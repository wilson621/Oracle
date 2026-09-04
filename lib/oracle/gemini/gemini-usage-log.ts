import type { SupabaseClient } from "@supabase/supabase-js";

// Real per-call cost tracking for every Gemini-backed Oracle feature, so
// the business has actual spend numbers to price subscriptions against
// instead of estimates. Writes to oracle_ai_usage_log (see migration 017),
// a table with no select policy for customers -- this is internal-only
// data, never surfaced anywhere in the app.

export type OracleAiFeature =
  | "full-match-analysis"
  | "loadout-intelligence"
  | "oracle-chat";

// $ per 1M tokens, current as of the pricing researched 2026-09-03 (Gemini
// 3.8 Flash, standard tier, through 2026-12-31 -- these rates double on
// 2027-01-01, so revisit this table then). Keyed by model id rather than
// hardcoded to one model so a future model swap doesn't silently mis-price
// everything logged under it.
const GEMINI_PRICE_PER_MILLION_TOKENS_USD: Record<
  string,
  { input: number; output: number }
> = {
  "gemini-3.8-flash": { input: 0.75, output: 3.75 },
};

function estimateTokenCostUsd(
  model: string,
  inputTokens: number,
  outputTokens: number
): number {
  const rate = GEMINI_PRICE_PER_MILLION_TOKENS_USD[model];
  if (!rate) return 0; // Unknown model -- log 0 rather than a fabricated guess.
  return (
    (inputTokens / 1_000_000) * rate.input +
    (outputTokens / 1_000_000) * rate.output
  );
}

/**
 * The subset of @google/genai's GenerateContentResponse this cares about --
 * accepted structurally so callers don't need to import the SDK's full
 * response type just to call this.
 */
export type GeminiUsageSource = Readonly<{
  usageMetadata?: Readonly<{
    promptTokenCount?: number;
    candidatesTokenCount?: number;
    totalTokenCount?: number;
  }>;
  candidates?: readonly Readonly<{
    groundingMetadata?: Readonly<{
      webSearchQueries?: readonly string[];
    }>;
  }>[];
}>;

/**
 * Records one Gemini call's real token usage (and, if the call used Google
 * Search grounding, how many search requests it made) against the
 * Operator/feature it was for. Best-effort and silent on failure, same as
 * every other non-critical write in this codebase (memory, cleanup) --
 * a logging failure must never break the actual feature the customer is
 * waiting on.
 */
export async function recordGeminiUsage(
  supabase: SupabaseClient,
  input: Readonly<{
    operatorId: string | null;
    feature: OracleAiFeature;
    model: string;
    response: GeminiUsageSource;
  }>
): Promise<void> {
  try {
    const usage = input.response.usageMetadata;
    const inputTokens = usage?.promptTokenCount ?? 0;
    const outputTokens = usage?.candidatesTokenCount ?? 0;
    const totalTokens =
      usage?.totalTokenCount ?? inputTokens + outputTokens;
    const groundingRequests =
      input.response.candidates?.[0]?.groundingMetadata?.webSearchQueries
        ?.length ?? 0;

    await supabase.from("oracle_ai_usage_log").insert({
      operator_id: input.operatorId,
      feature: input.feature,
      model: input.model,
      input_tokens: inputTokens,
      output_tokens: outputTokens,
      total_tokens: totalTokens,
      grounding_requests: groundingRequests,
      estimated_cost_usd: estimateTokenCostUsd(
        input.model,
        inputTokens,
        outputTokens
      ),
    });
  } catch (error) {
    console.warn("[gemini-usage-log] failed to record usage:", error);
  }
}
