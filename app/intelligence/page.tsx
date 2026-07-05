"use client";

import { useEffect, useState } from "react";
import AppLayout from "@/components/layout/AppLayout";
import {
  Brain,
  Target,
  AlertTriangle,
  Shield,
  TrendingUp,
  Crosshair,
} from "lucide-react";
import { getOracleIntelligence } from "@/lib/getOracleIntelligence";

type Intelligence = {
  totalSessions: number;
  strongestSkill: { name: string; value: number };
  weakestSkill: { name: string; value: number };
  prediction: string;
  recommendation: string;
  intelligenceSummary: string;
};

export default function IntelligencePage() {
  const [intel, setIntel] = useState<Intelligence | null>(null);

  useEffect(() => {
    async function loadIntel() {
      const data = await getOracleIntelligence();
      setIntel(data);
    }

    loadIntel();
  }, []);

  return (
    <AppLayout>
      <p className="text-sm font-semibold tracking-[0.35em] text-cyan-300">
        ORACLE INTELLIGENCE
      </p>

      <h1 className="mt-3 text-4xl font-bold">Intelligence Report</h1>

      <p className="mt-4 max-w-3xl text-slate-400">
        Oracle analyses your saved sessions to identify patterns, predict your
        trajectory and recommend your next training focus.
      </p>

      {!intel ? (
        <div className="mt-10 rounded-3xl border border-slate-800 bg-slate-950 p-10 text-center">
          <Brain className="mx-auto text-cyan-300" size={44} />

          <h2 className="mt-6 text-3xl font-bold">No intelligence yet.</h2>

          <p className="mx-auto mt-3 max-w-xl text-slate-400">
            Complete more Oracle Sessions and Oracle will begin building your
            long-term intelligence profile.
          </p>
        </div>
      ) : (
        <div className="mt-10 grid gap-6">
          <div className="rounded-3xl border border-cyan-400/20 bg-cyan-400/5 p-8">
            <Brain className="text-cyan-300" size={40} />

            <h2 className="mt-5 text-3xl font-bold">
              Oracle has profiled your playstyle.
            </h2>

            <p className="mt-4 max-w-3xl text-slate-300">
              {intel.intelligenceSummary}
            </p>
          </div>

          <div className="grid gap-5 md:grid-cols-3">
            <div className="rounded-3xl border border-slate-800 bg-slate-950 p-6">
              <Shield className="text-cyan-300" />
              <p className="mt-5 text-sm text-slate-400">Predicted Rank</p>
              <h3 className="mt-2 text-3xl font-bold">{intel.prediction}</h3>
            </div>

            <div className="rounded-3xl border border-slate-800 bg-slate-950 p-6">
              <Target className="text-cyan-300" />
              <p className="mt-5 text-sm text-slate-400">Strongest Skill</p>
              <h3 className="mt-2 text-3xl font-bold">
                {intel.strongestSkill.name}
              </h3>
              <p className="mt-2 text-slate-400">
                {intel.strongestSkill.value}/100
              </p>
            </div>

            <div className="rounded-3xl border border-slate-800 bg-slate-950 p-6">
              <AlertTriangle className="text-amber-300" />
              <p className="mt-5 text-sm text-slate-400">Priority Weakness</p>
              <h3 className="mt-2 text-3xl font-bold">
                {intel.weakestSkill.name}
              </h3>
              <p className="mt-2 text-slate-400">
                {intel.weakestSkill.value}/100
              </p>
            </div>
          </div>

          <div className="rounded-3xl border border-slate-800 bg-slate-950 p-8">
            <div className="flex items-center gap-3">
              <Crosshair className="text-cyan-300" />
              <h2 className="text-2xl font-bold">Tactical Recommendation</h2>
            </div>

            <p className="mt-5 text-lg leading-8 text-slate-300">
              {intel.recommendation}
            </p>
          </div>

          <div className="rounded-3xl border border-slate-800 bg-slate-950 p-8">
            <div className="flex items-center gap-3">
              <TrendingUp className="text-cyan-300" />
              <h2 className="text-2xl font-bold">Oracle Trajectory</h2>
            </div>

            <p className="mt-5 text-slate-400">
              Based on your current profile, Oracle predicts your next meaningful
              improvement will come from focusing on{" "}
              <span className="font-bold text-cyan-300">
                {intel.weakestSkill.name}
              </span>
              .
            </p>
          </div>
        </div>
      )}
    </AppLayout>
  );
}