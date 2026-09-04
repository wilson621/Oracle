"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import AppLayout from "@/components/layout/AppLayout";
import { createBrowserAuthService } from "@/lib/oracle/services/auth/browser-auth-service";

export default function AccountSecurityPage() {
  const router = useRouter();
  const auth = useMemo(() => createBrowserAuthService(), []);
  const [message, setMessage] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  async function registerPasskey() {
    setBusy(true);
    setMessage(null);
    try {
      const { error } = await auth.registerPasskey();
      if (error) throw error;
      setMessage("Passkey registered for this verified Account.");
    } catch {
      setMessage(
        "Passkey registration is unavailable or was cancelled. Email + Password remains active."
      );
    } finally {
      setBusy(false);
    }
  }

  async function signOut() {
    setBusy(true);
    const { error } = await auth.signOutAll();
    if (error) {
      setMessage("Oracle could not complete sign-out.");
      setBusy(false);
      return;
    }
    router.replace("/auth");
    router.refresh();
  }

  return (
    <AppLayout>
      <p className="text-xs font-bold uppercase tracking-[0.35em] text-teal-300">
        Account security
      </p>
      <h1 className="mt-4 text-4xl font-black">Authentication methods</h1>
      <p className="mt-4 max-w-2xl leading-7 text-slate-400">
        Email + Password is your canonical Oracle credential. Optional methods
        supplement it; they never replace your permanent Operator identity.
      </p>

      <div className="mt-8 grid gap-4 md:grid-cols-3">
        <SecurityMethod
          title="Email + Password"
          status="Canonical"
          body="Primary identity credential. Sensitive changes require recent authentication."
        />
        <SecurityMethod
          title="Magic Link"
          status="Available"
          body="Request a single-use sign-in link from the Oracle sign-in screen."
        />
        <SecurityMethod
          title="Passkey"
          status="Optional"
          body="Register a device-bound WebAuthn credential after verification."
          action={
            <button
              type="button"
              disabled={busy}
              onClick={registerPasskey}
              className="mt-5 rounded-lg bg-teal-300 px-4 py-2 text-sm font-bold text-slate-950 disabled:opacity-50"
            >
              Register Passkey
            </button>
          }
        />
      </div>

      {message && (
        <p role="status" className="mt-6 rounded-xl border border-teal-300/15 bg-teal-300/5 p-4 text-sm text-teal-100">
          {message}
        </p>
      )}

      <div className="mt-10 border-t border-slate-800 pt-8">
        <button
          type="button"
          disabled={busy}
          onClick={signOut}
          className="rounded-xl border border-red-300/25 px-5 py-3 font-semibold text-red-200 transition hover:bg-red-300/10 disabled:opacity-50"
        >
          Sign out all sessions
        </button>
      </div>
    </AppLayout>
  );
}

function SecurityMethod({
  title,
  status,
  body,
  action,
}: {
  title: string;
  status: string;
  body: string;
  action?: React.ReactNode;
}) {
  return (
    <section className="rounded-2xl border border-slate-800 bg-black/20 p-5">
      <p className="text-xs font-semibold uppercase tracking-[0.25em] text-teal-300">
        {status}
      </p>
      <h2 className="mt-3 text-xl font-bold">{title}</h2>
      <p className="mt-3 text-sm leading-6 text-slate-400">{body}</p>
      {action}
    </section>
  );
}
