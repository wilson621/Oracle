import { redirect } from "next/navigation";
import AppLayout from "@/components/layout/AppLayout";
import OperatorIdentitySettings from "@/components/profile/OperatorIdentitySettings";
import { ORACLE_AUTH_ROUTES } from "@/lib/oracle/services/auth/auth-policy";
import { getOperatorIdentitySettings } from "@/lib/oracle/services/operator/server-operator-identity-service";

export default async function ProfilePage() {
  const state = await getOperatorIdentitySettings();
  if (state.status === "unauthenticated") {
    redirect(ORACLE_AUTH_ROUTES.signIn);
  }
  if (state.status === "unverified") {
    redirect(ORACLE_AUTH_ROUTES.verifyEmail);
  }
  if (state.status === "uncommissioned") {
    redirect(ORACLE_AUTH_ROUTES.onboarding);
  }
  if (state.status !== "available") {
    throw new Error("Operator identity state is unavailable.");
  }

  return (
    <AppLayout>
      <p className="text-xs font-bold uppercase tracking-[0.35em] text-teal-300">
        Permanent Operator
      </p>
      <h1 className="mt-4 text-4xl font-black">Identity settings</h1>
      <p className="mt-4 max-w-3xl leading-7 text-slate-400">
        Credentials and presentation can evolve without replacing the
        Operator that owns your Oracle Intelligence, progression,
        achievements and coaching history.
      </p>
      <OperatorIdentitySettings
        displayName={state.displayName}
        callsign={state.callsign}
        tokens={state.tokens}
      />
    </AppLayout>
  );
}
