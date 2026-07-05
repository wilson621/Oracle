"use client";

import { useEffect, useState } from "react";
import AppLayout from "@/components/layout/AppLayout";
import { getOracleDNA } from "@/lib/oracle/getOracleDNA";
import { Dna, Shield, AlertTriangle, Activity } from "lucide-react";

type Trait = {
  label: string;
  value: number;
};

type OracleDNA = {
  sessionsAnalysed: number;
  playstyle: string;
  strongestTrait: Trait;
  weakestTrait: Trait;
  traits: Trait[];
  assessment: string;
};

function TraitBar({ label, value }: Trait) {
  return (
    <div>
      <div className="mb-2 flex justify-between text-sm">
        <span className="text-slate-300">{label}</span>
        <span className="font-bold text-cyan-300">{value}%</span>
      </div>

      <div className="h-3 overflow-hidden rounded-full bg-slate-800">
        <div
          className="h-full rounded-full bg-cyan-400 transition-all duration-700"
          style={{ width: `${value}%` }}
        />
      </div>
    </div>
  );
}

export default function DNAPage() {
  const [dna, setDna] = useState<OracleDNA | null>(null);

  useEffect(() => {
    async function loadDNA() {
      const data = await getOracleDNA();
      setDna(data);
    }

    loadDNA();
  }, []);

  return (
    <AppLayout>
      <p className="text-sm font-semibold tracking-[0.35em] text-cyan-300">
        ORACLE DNA
      </p>

      <h1 className="mt-3 text-4xl font-bold">Player DNA</h1>

      <p className="mt-4 max-w-3xl text-slate-400">
        Oracle builds a behavioural profile from your saved sessions to
        understand how you naturally play.
      </p>

      {!dna ? (
        <div className="mt-10 rounded-3xl border border-slate-800 bg-slate-950 p-10 text-center">
          <Dna className="mx-auto text-cyan-300" size={44} />

          <h2 className="mt-6 text-3xl font-bold">No DNA profile yet.</h2>

          <p className="mx-auto mt-3 max-w-xl text-slate-400">
            Complete more Oracle Sessions and Oracle will begin identifying your
            playstyle, strengths and weaknesses.
          </p>
        </div>
      ) : (
        <div className="mt-10 grid gap-6">
          <div className="rounded-3xl border border-cyan-400/20 bg-cyan-400/5 p-8">
            <Dna className="text-cyan-300" size={42} />

            <p className="mt-6 text-sm font-bold tracking-[0.3em] text-slate-500">
              PLAYSTYLE
            </p>

            <h2 className="mt-2 text-4xl font-black">{dna.playstyle}</h2>

            <p className="mt-4 max-w-3xl text-slate-300">
              {dna.assessment}
            </p>

            <p className="mt-4 text-sm text-slate-500">
              Based on {dna.sessionsAnalysed} recent Oracle Sessions.
            </p>
          </div>

          <div className="grid gap-5 md:grid-cols-2">
            <div className="rounded-3xl border border-slate-800 bg-slate-950 p-6">
              <Shield className="text-cyan-300" />

              <p className="mt-5 text-sm text-slate-400">
                Dominant Trait
              </p>

              <h3 className="mt-2 text-3xl font-bold">
                {dna.strongestTrait.label}
              </h3>

              <p className="mt-2 text-slate-400">
                {dna.strongestTrait.value}%
              </p>
            </div>

            <div className="rounded-3xl border border-slate-800 bg-slate-950 p-6">
              <AlertTriangle className="text-amber-300" />

              <p className="mt-5 text-sm text-slate-400">
                Development Area
              </p>

              <h3 className="mt-2 text-3xl font-bold">
                {dna.weakestTrait.label}
              </h3>

              <p className="mt-2 text-slate-400">
                {dna.weakestTrait.value}%
              </p>
            </div>
          </div>

          <div className="rounded-3xl border border-slate-800 bg-slate-950 p-8">
            <div className="flex items-center gap-3">
              <Activity className="text-cyan-300" />
              <h2 className="text-2xl font-bold">DNA Trait Matrix</h2>
            </div>

            <div className="mt-8 grid gap-6">
              {dna.traits.map((trait) => (
                <TraitBar
                  key={trait.label}
                  label={trait.label}
                  value={trait.value}
                />
              ))}
            </div>
          </div>
        </div>
      )}
    </AppLayout>
  );
}