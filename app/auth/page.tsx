"use client";

import {
  Suspense,
  useMemo,
  useState,
  type FormEvent,
} from "react";
import { useSearchParams } from "next/navigation";
import {
  ORACLE_AUTH_ROUTES,
  safeRelativeReturnPath,
} from "@/lib/oracle/services/auth/auth-policy";
import { createBrowserAuthService } from "@/lib/oracle/services/auth/browser-auth-service";

type Mode = "sign-in" | "create-account";

export default function AuthPage() {
  return (
    <Suspense fallback={<AuthLoading />}>
      <AuthForm />
    </Suspense>
  );
}

function AuthForm() {
  const searchParams = useSearchParams();
  const auth = useMemo(() => createBrowserAuthService(), []);
  const [mode, setMode] = useState<Mode>("sign-in");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [displayName, setDisplayName] = useState("");
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState<string | null>(
    authErrorMessage(searchParams.get("error"))
  );

  const next = safeRelativeReturnPath(
    searchParams.get("next"),
    ORACLE_AUTH_ROUTES.onboarding
  );

  async function submitPassword(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setBusy(true);
    setMessage(null);

    try {
      if (mode === "create-account") {
        const callback = new URL(ORACLE_AUTH_ROUTES.callback, window.location.origin);
        callback.searchParams.set("next", ORACLE_AUTH_ROUTES.onboarding);
        const { data, error } = await auth.signUp({
          email,
          password,
          options: {
            emailRedirectTo: callback.toString(),
            data: {
              display_name: displayName.trim() || null,
            },
          },
        });
        if (error) throw error;

        if (!data.session) {
          window.location.assign(ORACLE_AUTH_ROUTES.verifyEmail);
          return;
        }
      } else {
        const { data, error } = await auth.signInWithPassword({
          email,
          password,
        });
        if (error) throw error;
        if (!data.user.email_confirmed_at) {
          await auth.signOutLocal();
          setMessage("Verify your email before commissioning your Operator.");
          return;
        }
      }

      window.location.assign(next);
    } catch {
      setMessage(
        mode === "sign-in"
          ? "Oracle could not authenticate those credentials."
          : "Oracle could not create the Account. Check the details and try again."
      );
    } finally {
      setBusy(false);
    }
  }

  async function sendMagicLink() {
    if (!email) {
      setMessage("Enter your verified email address first.");
      return;
    }

    setBusy(true);
    setMessage(null);
    const callback = new URL(ORACLE_AUTH_ROUTES.callback, window.location.origin);
    callback.searchParams.set("next", next);
    const { error } = await auth.sendMagicLink({
      email,
      options: {
        shouldCreateUser: false,
        emailRedirectTo: callback.toString(),
      },
    });
    setBusy(false);
    setMessage(
      error
        ? "Oracle could not send a sign-in link."
        : "If that verified Account exists, Oracle has sent a sign-in link."
    );
  }

  async function signInWithPasskey() {
    setBusy(true);
    setMessage(null);
    try {
      const { error } = await auth.signInWithPasskey();
      if (error) throw error;
      window.location.assign(next);
    } catch {
      setMessage("Passkey sign-in is unavailable or was cancelled.");
    } finally {
      setBusy(false);
    }
  }

  return (
    <main className="grid min-h-screen place-items-center bg-[#070A10] px-6 py-12 text-white">
      <section className="grid w-full max-w-5xl overflow-hidden rounded-[2rem] border border-teal-400/15 bg-slate-950 shadow-2xl lg:grid-cols-[0.9fr_1.1fr]">
        <div className="border-b border-teal-400/10 bg-gradient-to-br from-teal-400/15 via-slate-950 to-blue-500/10 p-10 lg:border-b-0 lg:border-r">
          <p className="text-xs font-bold uppercase tracking-[0.45em] text-teal-300">
            Oracle
          </p>
          <h1 className="mt-8 text-5xl font-black leading-tight">
            One identity.
            <br />
            Years of intelligence.
          </h1>
          <p className="mt-6 max-w-md leading-7 text-slate-300">
            Your Operator is permanent. Email, credentials, Display Name and
            Callsign may evolve; your progression, achievements and coaching
            history remain yours.
          </p>
        </div>

        <div className="p-8 sm:p-10">
          <div className="flex rounded-xl bg-black/30 p-1">
            {(["sign-in", "create-account"] as const).map((value) => (
              <button
                key={value}
                type="button"
                onClick={() => {
                  setMode(value);
                  setMessage(null);
                }}
                className={`flex-1 rounded-lg px-4 py-3 text-sm font-semibold transition ${
                  mode === value
                    ? "bg-teal-300 text-slate-950"
                    : "text-slate-400 hover:text-white"
                }`}
              >
                {value === "sign-in" ? "Sign in" : "Create Account"}
              </button>
            ))}
          </div>

          <form onSubmit={submitPassword} className="mt-8 space-y-5">
            {mode === "create-account" && (
              <AuthField
                label="Display Name"
                value={displayName}
                onChange={setDisplayName}
                autoComplete="name"
                helper="Your profile name. It is not unique and can be changed freely."
              />
            )}
            <AuthField
              label="Email"
              value={email}
              onChange={setEmail}
              type="email"
              autoComplete="email"
            />
            <AuthField
              label="Password"
              value={password}
              onChange={setPassword}
              type="password"
              autoComplete={mode === "sign-in" ? "current-password" : "new-password"}
              minimumLength={8}
            />

            {mode === "sign-in" && (
              <p className="text-sm text-slate-400">
                Remember Me is enabled by default. Web sessions have a
                30-day idle timeout.
              </p>
            )}

            {message && (
              <p role="status" className="rounded-xl border border-teal-300/15 bg-teal-300/5 p-3 text-sm text-teal-100">
                {message}
              </p>
            )}

            <button
              disabled={busy || !email || !password}
              className="w-full rounded-xl bg-teal-300 px-5 py-4 font-bold text-slate-950 transition hover:bg-teal-200 disabled:cursor-not-allowed disabled:opacity-50"
            >
              {busy
                ? "Authenticating..."
                : mode === "sign-in"
                  ? "Sign in with Email + Password"
                  : "Create Account"}
            </button>
          </form>

          {mode === "sign-in" && (
            <div className="mt-6 grid gap-3 sm:grid-cols-2">
              <button
                type="button"
                disabled={busy}
                onClick={sendMagicLink}
                className="rounded-xl border border-slate-700 px-4 py-3 text-sm font-semibold text-slate-200 transition hover:border-teal-300/40"
              >
                Email a Magic Link
              </button>
              <button
                type="button"
                disabled={busy}
                onClick={signInWithPasskey}
                className="rounded-xl border border-slate-700 px-4 py-3 text-sm font-semibold text-slate-200 transition hover:border-teal-300/40"
              >
                Use a Passkey
              </button>
            </div>
          )}

          <p className="mt-6 text-xs leading-5 text-slate-400">
            Email + Password is Oracle&apos;s canonical authentication method.
            Magic Links and Passkeys are optional methods for verified Accounts.
          </p>
        </div>
      </section>
    </main>
  );
}

function AuthLoading() {
  return (
    <main className="grid min-h-screen place-items-center bg-[#070A10] px-6 text-white">
      <p className="text-sm uppercase tracking-[0.35em] text-teal-300">
        Initialising identity…
      </p>
    </main>
  );
}

function AuthField({
  label,
  value,
  onChange,
  type = "text",
  autoComplete,
  helper,
  minimumLength,
}: {
  label: string;
  value: string;
  onChange(value: string): void;
  type?: string;
  autoComplete: string;
  helper?: string;
  minimumLength?: number;
}) {
  return (
    <label className="block">
      <span className="text-sm font-semibold text-slate-200">{label}</span>
      <input
        required
        type={type}
        value={value}
        onChange={(event) => onChange(event.target.value)}
        autoComplete={autoComplete}
        minLength={minimumLength}
        className="mt-2 w-full rounded-xl border border-slate-700 bg-black/30 px-4 py-3 text-white outline-none transition focus:border-teal-300"
      />
      {helper && <span className="mt-2 block text-xs text-slate-400">{helper}</span>}
    </label>
  );
}

function authErrorMessage(value: string | null): string | null {
  if (value === "invalid_callback") {
    return "The authentication callback was incomplete.";
  }
  if (value === "callback_failed") {
    return "The authentication link is invalid, expired or already used.";
  }
  return null;
}
