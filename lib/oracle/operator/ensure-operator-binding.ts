import "server-only";
import { randomUUID } from "node:crypto";
import type { SupabaseClient, User } from "@supabase/supabase-js";
import { getTrustedSupabaseClient } from "@/lib/supabase-trusted-server";

/**
 * Looks up the Operator bound to this Account, provisioning one on the fly
 * via the existing (already built, but never wired into sign-up)
 * provision_operator_for_account trusted RPC if none exists yet.
 *
 * That RPC is security definer and only callable as service_role, so this
 * uses the trusted server client -- never exposed to the browser -- rather
 * than the caller's own request-scoped client.
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

  const { data, error } = await trusted.rpc("provision_operator_for_account", {
    p_account_id: user.id,
    p_command: {
      contract: {
        name: "oracle.operator-provisioning-command",
        version: 1,
      },
      commandId: randomUUID(),
      callsign,
      policyId: "oracle.watch-and-coach.auto-provision",
      policyVersion: "1",
    },
  });

  if (error) {
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
    throw new Error(`Could not create an Operator profile: ${error.message}`);
  }

  const operatorId = (data as { operator?: { id?: string } })?.operator?.id;
  if (!operatorId) {
    throw new Error("Operator provisioning did not return an Operator id.");
  }
  return operatorId;
}

function deriveCallsign(user: User): string {
  const fromEmail = user.email?.split("@")[0]?.trim();
  const cleaned = (fromEmail ?? "").replace(/[^a-zA-Z0-9_-]/g, "");
  return cleaned.length > 0 ? cleaned : `Operator-${user.id.slice(0, 8)}`;
}
