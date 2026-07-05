"use client";

import { useEffect, useState } from "react";
import AppLayout from "@/components/layout/AppLayout";
import { Brain, AlertTriangle, CheckCircle, Target } from "lucide-react";
import { getOracleMemory } from "@/lib/oracle/getOracleMemory";

type OracleMemory = {
  totalSessions: number;
  weakestSkill: { label: string; value: number };
  strongestSkill: { label: string; value: number };
  recentDiagnoses: (string | null)[];
  commonCorrections: (string | null)[];
};

export default function MemoryPage() {
  const [memory, setMemory] = useState<OracleMemory | null>(null);

  useEffect(() => {
    async function loadMemory() {
      const data = await getOracleMemory();
      setMemory(data);
    }

    loadMemory();
  }, []);

  return (
    <AppLayout>
      <p className="text-sm font-semibold tracking-[0.35em] text-cyan-300">
        ORACLE MEMORY
      </p>

      <h1 className="mt-3 text-4xl font-bold">AI Memory</h1>

      <p className="mt-4 max-w-3xl text-slate-400">
        Oracle studies your previous sessions to identify recurring mistakes,
        strengths, weaknesses and improvement patterns.
      </p>

      {!memory ? (
        <div className="mt-10 rounded-3xl border border-slate-800 bg-slate-950 p-10 text-center">
          <Brain className="mx-auto text-cyan-300" size={42} />

          <h2 className="mt-6 text-3xl font-bold">No memory yet.</h2>

          <p className="mx-auto mt-3 max-w-xl text-slate-400">
            Complete a few Oracle Sessions and Oracle will begin learning your
            playstyle.
          </p>
        </div>
      ) : (
        <div className="mt-10 grid gap-6">
          <div className="rounded-3xl border border-cyan-400/20 bg-cyan-400/5 p-8">
            <Brain className="text-cyan-300" size={36} />

            <h2 className="mt-5 text-3xl font-bold">
              Oracle has analysed {memory.totalSessions} recent sessions.
            </h2>

            <p className="mt-3 text-slate-400">
              These patterns are based on your saved Oracle Sessions.
            </p>
          </div>

          <div className="grid gap-5 md:grid-cols-2">
            <div className="rounded-3xl border border-slate-800 bg-slate-950 p-6">
              <AlertTriangle className="text-amber-300" />

              <p className="mt-5 text-sm text-slate-400">Weakest Skill</p>

              <h3 className="mt-2 text-3xl font-bold">
                {memory.weakestSkill.label}
              </h3>

              <p className="mt-2 text-slate-400">
                Current average: {memory.weakestSkill.value}/100
              </p>
            </div>

            <div className="rounded-3xl border border-slate-800 bg-slate-950 p-6">
              <CheckCircle className="text-cyan-300" />

              <p className="mt-5 text-sm text-slate-400">Strongest Skill</p>

              <h3 className="mt-2 text-3xl font-bold">
                {memory.strongestSkill.label}
              </h3>

              <p className="mt-2 text-slate-400">
                Current average: {memory.strongestSkill.value}/100
              </p>
            </div>
          </div>

          <div className="rounded-3xl border border-slate-800 bg-slate-950 p-8">
            <div className="flex items-center gap-3">
              <Target className="text-cyan-300" />
              <h2 className="text-2xl font-bold">Recurring Corrections</h2>
            </div>

            <div className="mt-6 space-y-4">
              {memory.commonCorrections.map((correction, index) => (
                <div
                  key={index}
                  className="rounded-2xl border border-slate-800 bg-slate-900/60 p-5 text-slate-300"
                >
                  {correction}
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </AppLayout>
  );
}