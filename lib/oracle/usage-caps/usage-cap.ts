import "server-only";
import { getTrustedSupabaseClient } from "@/lib/supabase-trusted-server";
import {
  CONTENT_CLIPS_MONTHLY_CAP,
  FULL_MATCH_ANALYSIS_MONTHLY_CAP,
} from "./usage-cap-constants";

export { CONTENT_CLIPS_MONTHLY_CAP, FULL_MATCH_ANALYSIS_MONTHLY_CAP };

// Usage caps for Oracle's two Gemini-backed generation features that are
// actually capped -- Full Match Analysis and Content Clips, 45/month each
// (see usage-cap-constants.ts; Loadout Intelligence is deliberately
// uncapped -- see there for why).
//
// "Month" here means each Operator's own billing cycle, not a shared
// calendar month -- someone who signs up on the 17th gets their pool back
// on the 17th of each following month, matching when they're actually
// charged, rather than everyone resetting on the 1st. PROVISIONAL: there's
// no real subscription/billing data yet (Stripe integration still in
// progress, see oracle-project notes), so the cycle is anchored on
// operators.created_at (account creation date) as a stand-in. Once real
// subscription start dates exist, point resolveCurrentCycleStart() at that
// instead -- if a subscription starts same-day as signup this will already
// match, but don't assume that holds once trials/plan-switches/upgrades
// exist.
//
// This is a soft usage guardrail, not a security boundary -- it exists so
// usage stays inside what a subscription tier was actually priced against,
// not to police the customer. Every read/write here goes through the
// trusted (service_role) client, called only from server route code that
// has already resolved operator_id from the signed-in Account.

export type OracleMonthlyUsageFeature = "full-match-analysis" | "content-clips";

const FEATURE_LABEL: Record<OracleMonthlyUsageFeature, string> = {
  "full-match-analysis": "Full Match Analysis report",
  "content-clips": "Content Clips",
};

function pluralize(count: number, label: string): string {
  return `${count} ${label}${count === 1 ? "" : "s"}`;
}

/**
 * The UTC calendar date (YYYY-MM-DD) this Operator's current billing cycle
 * started on, given their anchor date (the day-of-month they signed up
 * on). Clamps to the last real day of a shorter month -- e.g. an anchor of
 * the 31st uses the 30th in a 30-day month -- rather than overflowing into
 * the next month.
 */
function billingCycleStart(anchorIso: string, now: Date): string {
  const anchor = new Date(anchorIso);
  const anchorDay = anchor.getUTCDate();

  function candidateFor(year: number, monthIndex: number): Date {
    const lastDayOfMonth = new Date(
      Date.UTC(year, monthIndex + 1, 0)
    ).getUTCDate();
    const day = Math.min(anchorDay, lastDayOfMonth);
    return new Date(Date.UTC(year, monthIndex, day));
  }

  const candidate = candidateFor(now.getUTCFullYear(), now.getUTCMonth());
  const cycleStart =
    candidate.getTime() <= now.getTime()
      ? candidate
      : candidateFor(now.getUTCFullYear(), now.getUTCMonth() - 1);

  return cycleStart.toISOString().slice(0, 10);
}

/**
 * Looks up this Operator's billing-cycle anchor (their account creation
 * date -- see the PROVISIONAL note above) and returns today's cycle-start
 * date for them. Fails open to today's UTC date (effectively a one-day
 * cycle) on any read error, same fail-open philosophy as the rest of this
 * file -- worst case a read hiccup shortens one Operator's cycle window
 * rather than blocking them.
 */
async function resolveCurrentCycleStart(operatorId: string): Promise<string> {
  try {
    const trusted = getTrustedSupabaseClient();
    const { data, error } = await trusted
      .from("operators")
      .select("created_at")
      .eq("id", operatorId)
      .single();

    if (error || !data?.created_at) {
      throw error ?? new Error("operator has no created_at");
    }
    return billingCycleStart(data.created_at, new Date());
  } catch (error) {
    console.warn(
      `[usage-cap] failed to resolve billing cycle for operator ${operatorId}, falling back to today:`,
      error
    );
    return new Date().toISOString().slice(0, 10);
  }
}

/**
 * How many more of this feature the Operator can use in their current
 * billing cycle, clamped to [0, cap]. Reads best-effort: if the usage row
 * can't be read for some reason, this fails OPEN (returns the full cap)
 * rather than blocking a paying customer over an internal read hiccup --
 * the cap is a usage guardrail, not a security boundary.
 */
export async function getRemainingMonthlyAllowance(
  operatorId: string,
  feature: OracleMonthlyUsageFeature,
  cap: number
): Promise<number> {
  try {
    const cycleStart = await resolveCurrentCycleStart(operatorId);
    const trusted = getTrustedSupabaseClient();
    const { data, error } = await trusted
      .from("oracle_monthly_usage")
      .select("units_used")
      .eq("operator_id", operatorId)
      .eq("feature", feature)
      .eq("cycle_start", cycleStart)
      .maybeSingle();

    if (error) {
      throw error;
    }
    const used = data?.units_used ?? 0;
    return Math.max(0, cap - used);
  } catch (error) {
    console.warn(`[usage-cap] failed to read ${feature} usage, allowing:`, error);
    return cap;
  }
}

/**
 * Records `units` of real usage against the Operator's current billing
 * cycle. Call this only for usage that actually happened (a real report,
 * real clips cut) -- never for a request that was rejected by the cap or
 * that failed before producing anything. Best-effort and silent on
 * failure, same as every other non-critical write in this codebase
 * (memory, cleanup, cost logging) -- a logging failure must never undo
 * work already done for the customer.
 */
export async function recordMonthlyUsage(
  operatorId: string,
  feature: OracleMonthlyUsageFeature,
  units: number
): Promise<void> {
  if (!Number.isFinite(units) || units <= 0) {
    return;
  }
  try {
    const cycleStart = await resolveCurrentCycleStart(operatorId);
    const trusted = getTrustedSupabaseClient();
    const { error } = await trusted.rpc("increment_oracle_monthly_usage", {
      p_operator_id: operatorId,
      p_feature: feature,
      p_cycle_start: cycleStart,
      p_units: Math.round(units),
    });
    if (error) {
      throw error;
    }
  } catch (error) {
    console.warn(`[usage-cap] failed to record ${feature} usage:`, error);
  }
}

/** Friendly, non-technical message for when this cycle's allowance is used up. */
export function monthlyCapReachedMessage(
  feature: OracleMonthlyUsageFeature,
  cap: number
): string {
  return (
    `You've used this month's ${pluralize(cap, FEATURE_LABEL[feature])} -- ` +
    "this resets on your next billing date."
  );
}
