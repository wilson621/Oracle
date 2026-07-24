"use server";

import { revalidatePath } from "next/cache";
import {
  RecentAuthenticationRequiredError,
} from "@/lib/oracle/services/auth/auth-policy";
import {
  changeVerifiedOperatorCallsign,
  updateVerifiedOperatorDisplayName,
} from "@/lib/oracle/services/operator/server-operator-identity-service";

export type ProfileActionState = Readonly<{
  error: string | null;
  message: string | null;
}>;

export async function updateDisplayName(
  _state: ProfileActionState,
  formData: FormData
): Promise<ProfileActionState> {
  const displayName = formData.get("displayName");
  if (typeof displayName !== "string" || displayName.trim().length > 80) {
    return { error: "Display Name must be 80 characters or fewer.", message: null };
  }

  try {
    await updateVerifiedOperatorDisplayName(displayName);
  } catch {
    return { error: "Oracle could not update the Display Name.", message: null };
  }

  revalidatePath("/profile");
  return { error: null, message: "Display Name updated." };
}

export async function changeCallsign(
  _state: ProfileActionState,
  formData: FormData
): Promise<ProfileActionState> {
  try {
    const callsign = await changeVerifiedOperatorCallsign({
      callsign: formData.get("callsign"),
      generate: formData.get("intent") === "generate",
    });
    revalidatePath("/profile");
    return {
      error: null,
      message: `Callsign changed to ${callsign}.`,
    };
  } catch (error) {
    if (error instanceof RecentAuthenticationRequiredError) {
      return {
        error: "Sign in again before changing your Callsign.",
        message: null,
      };
    }
    return {
      error:
        "Oracle could not change that Callsign. Check availability, policy and token balance.",
      message: null,
    };
  }
}
