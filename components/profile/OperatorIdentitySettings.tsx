"use client";

import { useActionState } from "react";
import {
  changeCallsign,
  updateDisplayName,
} from "@/app/profile/actions";

const initialState = { error: null, message: null };

export default function OperatorIdentitySettings({
  displayName,
  callsign,
  tokens,
}: {
  displayName: string | null;
  callsign: string;
  tokens: number;
}) {
  const [displayState, displayAction, displayPending] = useActionState(
    updateDisplayName,
    initialState
  );
  const [callsignState, callsignAction, callsignPending] = useActionState(
    changeCallsign,
    initialState
  );

  return (
    <div className="mt-8 grid gap-6 lg:grid-cols-2">
      <form action={displayAction} className="rounded-2xl border border-slate-800 bg-black/20 p-6">
        <p className="text-xs font-bold uppercase tracking-[0.25em] text-cyan-300">
          Profile identity
        </p>
        <h2 className="mt-3 text-2xl font-bold">Display Name</h2>
        <p className="mt-2 text-sm leading-6 text-slate-400">
          Not unique. Change it freely without changing your Operator.
        </p>
        <input
          name="displayName"
          defaultValue={displayName ?? ""}
          maxLength={80}
          autoComplete="name"
          className="mt-5 w-full rounded-xl border border-slate-700 bg-black/30 px-4 py-3 outline-none focus:border-cyan-300"
        />
        <ActionMessage state={displayState} />
        <button
          disabled={displayPending}
          className="mt-5 rounded-xl bg-cyan-300 px-5 py-3 font-bold text-slate-950 disabled:opacity-50"
        >
          Save Display Name
        </button>
      </form>

      <form action={callsignAction} className="rounded-2xl border border-slate-800 bg-black/20 p-6">
        <div className="flex items-start justify-between gap-4">
          <div>
            <p className="text-xs font-bold uppercase tracking-[0.25em] text-cyan-300">
              Global identity
            </p>
            <h2 className="mt-3 text-2xl font-bold">Callsign</h2>
          </div>
          <span className="rounded-full border border-cyan-300/20 px-3 py-1 text-xs text-cyan-200">
            {tokens} / 3 tokens
          </span>
        </div>
        <p className="mt-2 text-sm leading-6 text-slate-400">
          Changes consume one token. One consumed token returns every six
          months. Your previous Callsign is quarantined for 12 months.
        </p>
        <input
          name="callsign"
          defaultValue={callsign}
          minLength={3}
          maxLength={32}
          pattern="[A-Za-z0-9](?:[A-Za-z0-9 _-]*[A-Za-z0-9])?"
          className="mt-5 w-full rounded-xl border border-slate-700 bg-black/30 px-4 py-3 outline-none focus:border-cyan-300"
        />
        <ActionMessage state={callsignState} />
        <div className="mt-5 flex flex-wrap gap-3">
          <button
            name="intent"
            value="choose"
            disabled={callsignPending || tokens < 1}
            className="rounded-xl bg-cyan-300 px-5 py-3 font-bold text-slate-950 disabled:opacity-50"
          >
            Change Callsign
          </button>
          <button
            name="intent"
            value="generate"
            formNoValidate
            disabled={callsignPending || tokens < 1}
            className="rounded-xl border border-cyan-300/25 px-5 py-3 font-semibold text-cyan-200 disabled:opacity-50"
          >
            Generate and Apply
          </button>
        </div>
      </form>
    </div>
  );
}

function ActionMessage({
  state,
}: {
  state: { error: string | null; message: string | null };
}) {
  const text = state.error ?? state.message;
  if (!text) return null;
  return (
    <p
      role="status"
      className={`mt-4 text-sm ${state.error ? "text-red-200" : "text-cyan-200"}`}
    >
      {text}
    </p>
  );
}
