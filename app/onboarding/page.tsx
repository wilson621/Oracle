import { randomUUID } from "node:crypto";
import { redirect } from "next/navigation";
import CommissioningWizard from "@/components/onboarding/CommissioningWizard";
import {
  ORACLE_AUTH_ROUTES,
} from "@/lib/oracle/services/auth/auth-policy";
import { getOperatorOnboardingState } from "@/lib/oracle/services/operator/server-operator-identity-service";

export default async function OnboardingPage() {
  const state = await getOperatorOnboardingState();
  if (state.status === "unauthenticated") {
    redirect(ORACLE_AUTH_ROUTES.signIn);
  }
  if (state.status === "unverified") {
    redirect(ORACLE_AUTH_ROUTES.verifyEmail);
  }
  if (state.status === "commissioned") {
    redirect("/operator");
  }

  return (
    <main className="grid min-h-screen place-items-center bg-[#070A10] px-6 py-12 text-white">
      <CommissioningWizard commandId={randomUUID()} />
    </main>
  );
}
