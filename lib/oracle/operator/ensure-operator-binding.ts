import "server-only";
import type { SupabaseClient, User } from "@supabase/supabase-js";
import { getTrustedSupabaseClient } from "@/lib/supabase-trusted-server";

/**
 * Looks up the Operator bound to this Account, provisioning one on the fly
 * if none exists yet.
 *
 * The codebase has a fancier provision_operator_for_account trusted RPC
 * (database/011_operator_account_provisioning.sql) built for exactly this,
 * but that migration -- and everything after it -- has not actually been
 * deployed to this environment's real Supabase project (confirmed: calling
 * it returns "Could not find the function ... in the schema cache"). Rather
 * than depend on migrations that may or may not be applied, this does the
 * same two inserts directly with the trusted (service_role) client, which
 * only depends on migrations 001 and 008 -- both confirmed live.
 */
export async function ensureOperatorBinding(
  supabase: SupabaseClient,
  user: User
): Promise<string> {
  const { data: existing } = await supabase
    .from("operator_account_bindings")
    .select("operator_id")
    .eq("account_id", user.id)
    .maybeSingle();

  if (existing?.operator_id) {
    return existing.operator_id as string;
  }

  const trusted = getTrustedSupabaseClient();
  const callsign = deriveCallsign(user);

  const { data: operator, error: operatorError } = await trusted
    .from("operators")
    .insert({ callsign })
    .select("id")
    .single();

  if (operatorError || !operator) {
    // Someone else may have provisioned it a moment ago -- check again
    // before giving up.
    const { data: retry } = await supabase
      .from("operator_account_bindings")
      .select("operator_id")
      .eq("account_id", user.id)
      .maybeSingle();
    if (retry?.operator_id) {
      return retry.operator_id as string;
    }
    throw new Error(
      `Could not create an Operator profile: ${operatorError?.message ?? "unknown error"}`
    );
  }

  const { error: bindingError } = await trusted
    .from("operator_account_bindings")
    .insert({ account_id: user.id, operator_id: operator.id });

  if (bindingError) {
    throw new Error(
      `Could not bind the new Operator profile to this account: ${bindingError.message}`
    );
  }

  return operator.id as string;
}

function deriveCallsign(user: User): string {
  const fromEmail = user.email?.split("@")[0]?.trim();
  const cleaned = (fromEmail ?? "").replace(/[^a-zA-Z0-9_-]/g, "");
  return cleaned.length > 0 ? cleaned : `Operator-${user.id.slice(0, 8)}`;
}
