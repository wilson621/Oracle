"use client";

import { useActionState } from "react";
import { commissionOperator } from "@/app/onboarding/actions";
import {
  INITIAL_RESERVED_CALLSIGNS,
} from "@/lib/oracle/services/operator/operator-identity-policy";

const initialState = { error: null };

export default function CommissioningWizard({
  commandId,
}: {
  commandId: string;
}) {
  const [state, formAction, pending] = useActionState(
    commissionOperator,
    initialState
  );

  return (
    <section className="w-full max-w-3xl rounded-3xl border border-cyan-500/20 bg-slate-950/90 p-8 shadow-2xl sm:p-10">
      <p className="text-sm font-semibold uppercase tracking-[0.45em] text-cyan-300">
        Oracle Initialisation
      </p>

      <h1 className="mt-6 text-5xl font-black text-white">
        Operator Commissioning
      </h1>

      <p className="mt-6 max-w-2xl text-lg leading-8 text-slate-400">
        Your permanent Operator identity is ready. Choose the Callsign Oracle
        will display with it.
      </p>

      <form action={formAction} className="mt-10 space-y-7">
        <input type="hidden" name="commandId" value={commandId} />
        <div>
          <label
            htmlFor="callsign"
            className="block text-sm font-semibold uppercase tracking-[0.3em] text-cyan-300"
          >
            Callsign
          </label>
          <input
            id="callsign"
            name="callsign"
            required
            minLength={3}
            maxLength={32}
            pattern="[A-Za-z0-9](?:[A-Za-z0-9 _-]*[A-Za-z0-9])?"
            autoComplete="nickname"
            autoFocus
            className="mt-4 w-full rounded-2xl border border-cyan-500/20 bg-black/40 px-6 py-5 text-2xl font-bold text-white outline-none transition focus:border-cyan-400"
            placeholder="Ghost Hunter"
          />
          <p className="mt-4 text-sm leading-6 text-slate-500">
            3–32 ASCII letters or numbers, with spaces, hyphens and
            underscores inside. Callsigns are globally unique without regard
            to capitalisation. Oracle preserves your selected capitalisation.
          </p>
          <p className="mt-2 text-xs leading-5 text-slate-600">
            Reserved names include {INITIAL_RESERVED_CALLSIGNS.join(", ")}.
            Profanity and Unicode homoglyphs are prohibited.
          </p>
        </div>

        {state.error && (
          <p role="alert" className="rounded-xl border border-red-400/20 bg-red-400/5 p-4 text-sm text-red-200">
            {state.error}
          </p>
        )}

        <div className="rounded-xl border border-slate-800 bg-black/20 p-4 text-sm leading-6 text-slate-400">
          Your Operator remains the same if you later change email, password,
          Display Name or Callsign. Callsign changes use one of three renewable
          tokens; previous Callsigns enter a 12-month quarantine.
        </div>

        <div className="flex flex-wrap gap-3">
          <button
            name="intent"
            value="choose"
            disabled={pending}
            className="rounded-2xl bg-cyan-400 px-8 py-4 text-lg font-bold text-slate-950 transition hover:bg-cyan-300 disabled:cursor-not-allowed disabled:opacity-50"
          >
            {pending ? "Commissioning..." : "Use This Callsign"}
          </button>
          <button
            name="intent"
            value="generate"
            formNoValidate
            disabled={pending}
            className="rounded-2xl border border-cyan-300/25 px-8 py-4 text-lg font-bold text-cyan-200 transition hover:bg-cyan-300/10 disabled:opacity-50"
          >
            Ask Oracle to Generate One
          </button>
        </div>
      </form>
    </section>
  );
}
