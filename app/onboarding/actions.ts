"use server";

import { redirect } from "next/navigation";
import { ORACLE_AUTH_ROUTES } from "@/lib/oracle/services/auth/auth-policy";
import {
  commissionVerifiedOperator,
  OperatorAccountAuthorityError,
} from "@/lib/oracle/services/operator/server-operator-identity-service";

export type CommissioningState = Readonly<{
  error: string | null;
}>;

export async function commissionOperator(
  _previousState: CommissioningState,
  formData: FormData
): Promise<CommissioningState> {
  try {
    await commissionVerifiedOperator({
      callsign: formData.get("callsign"),
      commandId: formData.get("commandId"),
      generate: formData.get("intent") === "generate",
    });
  } catch (provisioningError) {
    if (provisioningError instanceof OperatorAccountAuthorityError) {
      redirect(
        provisioningError.status === "unverified"
          ? ORACLE_AUTH_ROUTES.verifyEmail
          : ORACLE_AUTH_ROUTES.signIn
      );
    }
    console.error("Operator commissioning failed.", provisioningError);
    return {
      error:
        "Oracle could not commission that Callsign. It may be unavailable or outside the approved identity policy.",
    };
  }

  redirect("/operator");
}
