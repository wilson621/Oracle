"use client";

import { useState } from "react";

type CommissioningWizardProps = {
  operatorId: string;
  onComplete: (callsign: string) => Promise<void>;
};

export default function CommissioningWizard({
  operatorId,
  onComplete,
}: CommissioningWizardProps) {
  const [callsign, setCallsign] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();

    if (!callsign.trim()) return;

    setLoading(true);

    try {
      await onComplete(callsign.trim());
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="mx-auto max-w-3xl rounded-3xl border border-cyan-500/20 bg-slate-950/90 p-10 shadow-2xl">
      <p className="text-sm font-semibold uppercase tracking-[0.45em] text-cyan-300">
        Oracle Initialisation
      </p>

      <h1 className="mt-6 text-5xl font-black text-white">
        Operator Commissioning
      </h1>

      <p className="mt-6 max-w-2xl text-lg leading-8 text-slate-400">
        Welcome, Operator.
        <br />
        <br />
        Before Oracle can begin intelligence analysis, your permanent identity
        must be registered.
      </p>

      <form
        onSubmit={handleSubmit}
        className="mt-12 space-y-8"
      >
        <div>
          <label className="block text-sm font-semibold uppercase tracking-[0.3em] text-cyan-300">
            Choose Your Callsign
          </label>

          <input
            value={callsign}
            onChange={(e) => setCallsign(e.target.value)}
            maxLength={24}
            autoFocus
            className="mt-4 w-full rounded-2xl border border-cyan-500/20 bg-black/40 px-6 py-5 text-2xl font-bold text-white outline-none transition focus:border-cyan-400"
            placeholder="GhostHunter"
          />

          <p className="mt-4 text-sm text-slate-500">
            Your callsign becomes your permanent Oracle identity.
          </p>
        </div>

        <button
          disabled={!callsign.trim() || loading}
          className="rounded-2xl bg-cyan-400 px-8 py-4 text-lg font-bold text-slate-950 transition hover:bg-cyan-300 disabled:cursor-not-allowed disabled:opacity-50"
        >
          {loading
            ? "Commissioning..."
            : "Complete Commissioning"}
        </button>
      </form>
    </div>
  );
}