import "server-only";

import {
  RecentAuthenticationRequiredError,
  requireRecentAuthentication,
} from "../auth/auth-policy";
import { createClient } from "@/lib/supabase-server";
import { getTrustedSupabaseClient } from "@/lib/supabase-trusted-server";
import { OPERATOR_PROVISIONING_CONTRACT } from "./operator-provisioning-types";
import { ORACLE_COMMISSIONING_POLICY } from "./operator-identity-policy";
import { createServerOperatorService } from "./server-operator-service";

export type OperatorAccountAuthority =
  | Readonly<{ status: "unauthenticated" | "unverified" }>
  | Readonly<{
      status: "verified";
      accountId: string;
      lastSignInAt: string | null;
      displayName: string;
    }>;

export async function getOperatorAccountAuthority(): Promise<OperatorAccountAuthority> {
  const supabase = await createClient();
  const { data, error } = await supabase.auth.getUser();
  if (error || !data.user) return { status: "unauthenticated" };
  if (!data.user.email_confirmed_at) return { status: "unverified" };
  return {
    status: "verified",
    accountId: data.user.id,
    lastSignInAt: data.user.last_sign_in_at ?? null,
    displayName:
      typeof data.user.user_metadata.display_name === "string"
        ? data.user.user_metadata.display_name
        : "",
  };
}

export async function getOperatorOnboardingState() {
  const authority = await getOperatorAccountAuthority();
  if (authority.status !== "verified") return authority;

  const supabase = await createClient();
  const { data, error } = await supabase
    .from("operator_account_bindings")
    .select("operator_id")
    .eq("account_id", authority.accountId)
    .maybeSingle();
  if (error) throw error;
  return {
    ...authority,
    status: data ? "commissioned" as const : "uncommissioned" as const,
  };
}

export async function commissionVerifiedOperator(input: {
  callsign: unknown;
  commandId: unknown;
  generate: boolean;
}): Promise<void> {
  const authority = await requireVerifiedAuthority();
  let callsign = input.callsign;
  const trusted = getTrustedSupabaseClient();

  if (input.generate) {
    const { data, error } = await trusted.rpc(
      "generate_available_operator_callsign"
    );
    if (error || typeof data !== "string") {
      throw error ?? new Error("Generated Callsign is invalid.");
    }
    callsign = data;
  }

  const service = await createServerOperatorService();
  await service.provisionCurrentOperator(
    {
      contract: OPERATOR_PROVISIONING_CONTRACT,
      commandId: input.commandId,
      callsign,
      policyId: ORACLE_COMMISSIONING_POLICY.id,
      policyVersion: ORACLE_COMMISSIONING_POLICY.policyVersion,
    },
    ORACLE_COMMISSIONING_POLICY
  );

  const { error: displayNameError } = await trusted.rpc(
    "update_operator_display_name",
    {
      p_account_id: authority.accountId,
      p_display_name: authority.displayName,
    }
  );
  if (displayNameError) {
    console.error(
      "Operator commissioned; optional Display Name projection is pending.",
      displayNameError
    );
  }
}

export async function getOperatorIdentitySettings() {
  const authority = await getOperatorAccountAuthority();
  if (authority.status !== "verified") return authority;

  const supabase = await createClient();
  const { data: binding, error: bindingError } = await supabase
    .from("operator_account_bindings")
    .select("operator_id")
    .eq("account_id", authority.accountId)
    .maybeSingle();
  if (bindingError) throw bindingError;
  if (!binding) return { status: "uncommissioned" as const };

  const { data, error } = await supabase
    .from("operators")
    .select("display_name,callsign,callsign_change_tokens")
    .eq("id", binding.operator_id)
    .single();
  if (error || !data) throw error ?? new Error("Operator identity is unavailable.");
  return {
    status: "available" as const,
    displayName: data.display_name as string | null,
    callsign: data.callsign as string,
    tokens: data.callsign_change_tokens as number,
  };
}

export async function updateVerifiedOperatorDisplayName(
  displayName: unknown
): Promise<void> {
  const authority = await requireVerifiedAuthority();
  if (typeof displayName !== "string" || displayName.trim().length > 80) {
    throw new Error("Display Name must be 80 characters or fewer.");
  }
  const { error } = await getTrustedSupabaseClient().rpc(
    "update_operator_display_name",
    {
      p_account_id: authority.accountId,
      p_display_name: displayName,
    }
  );
  if (error) throw error;
}

export async function changeVerifiedOperatorCallsign(input: {
  callsign: unknown;
  generate: boolean;
}): Promise<string> {
  const authority = await requireVerifiedAuthority();
  requireRecentAuthentication(authority.lastSignInAt);
  const trusted = getTrustedSupabaseClient();

  let callsign = input.callsign;
  if (input.generate) {
    const { data, error } = await trusted.rpc(
      "generate_available_operator_callsign"
    );
    if (error || typeof data !== "string") {
      throw error ?? new Error("Generated Callsign is invalid.");
    }
    callsign = data;
  }
  if (typeof callsign !== "string") throw new Error("Callsign is required.");

  const { data, error } = await trusted.rpc("change_operator_callsign", {
    p_account_id: authority.accountId,
    p_callsign: callsign,
  });
  if (error) throw error;
  if (typeof data === "object" && data !== null && "callsign" in data) {
    return String(data.callsign);
  }
  return callsign;
}

async function requireVerifiedAuthority() {
  const authority = await getOperatorAccountAuthority();
  if (authority.status !== "verified") {
    throw new OperatorAccountAuthorityError(authority.status);
  }
  return authority;
}

export class OperatorAccountAuthorityError extends Error {
  constructor(readonly status: "unauthenticated" | "unverified") {
    super(`Operator Account authority is ${status}.`);
    this.name = "OperatorAccountAuthorityError";
  }
}

export { RecentAuthenticationRequiredError };
