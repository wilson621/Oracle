import "server-only";
import { getTrustedSupabaseClient } from "@/lib/supabase-trusted-server";
import {
  CONTENT_CLIPS_DAILY_CAP,
  FULL_MATCH_ANALYSIS_DAILY_CAP,
} from "./daily-usage-cap-constants";

export { CONTENT_CLIPS_DAILY_CAP, FULL_MATCH_ANALYSIS_DAILY_CAP };

// Daily usage caps for Oracle's two Gemini-backed generation features --
// Lee's decision (2026-09-04, alongside the 77%-margin pricing model): 2
// Full Match Analysis reports/day and 2 Content Clips/day per Operator,
// resetting at midnight UTC. See database/020_daily_usage_caps.sql for the
// table + the atomic increment function this calls into.
//
// This is a soft usage guardrail, not a security boundary -- it exists so
// usage stays inside what a subscription tier was actually priced against,
// not to police the customer. Every read/write here goes through the
// trusted (service_role) client, called only from server route code that
// has already resolved operator_id from the signed-in Account.

export type OracleDailyUsageFeature = "full-match-analysis" | "content-clips";

const FEATURE_LABEL: Record<OracleDailyUsageFeature, string> = {
  "full-match-analysis": "Full Match Analysis report",
  "content-clips": "Content Clips",
};

function todayUtc(): string {
  return new Date().toISOString().slice(0, 10);
}

function pluralize(count: number, label: string): string {
  return `${count} ${label}${count === 1 ? "" : "s"}`;
}

/**
 * How many more of this feature the Operator can use today, clamped to
 * [0, cap]. Reads best-effort: if the usage row can't be read for some
 * reason, this fails OPEN (returns the full cap) rather than blocking a
 * paying customer over an internal read hiccup -- the cap is a usage
 * guardrail, not a security boundary.
 */
export async function getRemainingDailyAllowance(
  operatorId: string,
  feature: OracleDailyUsageFeature,
  cap: number
): Promise<number> {
  try {
    const trusted = getTrustedSupabaseClient();
    const { data, error } = await trusted
      .from("oracle_daily_usage")
      .select("units_used")
      .eq("operator_id", operatorId)
      .eq("feature", feature)
      .eq("usage_date", todayUtc())
      .maybeSingle();

    if (error) {
      throw error;
    }
    const used = data?.units_used ?? 0;
    return Math.max(0, cap - used);
  } catch (error) {
    console.warn(
      `[daily-usage-cap] failed to read ${feature} usage, allowing:`,
      error
    );
    return cap;
  }
}

/**
 * Records `units` of real usage against today's allowance. Call this only
 * for usage that actually happened (a real report, real clips cut) --
 * never for a request that was rejected by the cap or that failed before
 * producing anything. Best-effort and silent on failure, same as every
 * other non-critical write in this codebase (memory, cleanup, cost
 * logging) -- a logging failure must never undo work already done for the
 * customer.
 */
export async function recordDailyUsage(
  operatorId: string,
  feature: OracleDailyUsageFeature,
  units: number
): Promise<void> {
  if (!Number.isFinite(units) || units <= 0) {
    return;
  }
  try {
    const trusted = getTrustedSupabaseClient();
    const { error } = await trusted.rpc("increment_oracle_daily_usage", {
      p_operator_id: operatorId,
      p_feature: feature,
      p_usage_date: todayUtc(),
      p_units: Math.round(units),
    });
    if (error) {
      throw error;
    }
  } catch (error) {
    console.warn(`[daily-usage-cap] failed to record ${feature} usage:`, error);
  }
}

/** Friendly, non-technical message for when today's allowance is used up. */
export function dailyCapReachedMessage(
  feature: OracleDailyUsageFeature,
  cap: number
): string {
  return (
    `You've used today's ${pluralize(cap, FEATURE_LABEL[feature])} -- ` +
    "this resets at midnight UTC."
  );
}
