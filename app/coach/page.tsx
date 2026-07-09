"use client";

import { useEffect, useState } from "react";
import AppLayout from "@/components/layout/AppLayout";
import PageHeader from "@/components/ui/PageHeader";
import EmptyState from "@/components/ui/EmptyState";
import PredictionCard from "@/components/coach/PredictionCard";
import MissionReadiness from "@/components/coach/MissionReadiness";
import { Brain, Target } from "lucide-react";
import { getCoachReport } from "@/lib/coach/getCoachReport";

type CoachReport = Awaited<ReturnType<typeof getCoachReport>>;

export default function CoachPage() {
  const [report, setReport] = useState<CoachReport>(null);

  useEffect(() => {
    async function load() {
      setReport(await getCoachReport());
    }

    load();
  }, []);

  return (
    <AppLayout>
      <PageHeader
        eyebrow="AI COACH"
        title="Oracle Coach"
        description="Personalised missions, predictions and coaching based on how you actually play."
      />

      {!report ? (
        <EmptyState
          icon={<Brain size={42} />}
          title="No coaching profile yet"
          description="Complete Oracle Sessions and Oracle will generate a personal coaching plan."
        />
      ) : (
        <div className="grid gap-6">
          <section className="rounded-3xl border border-cyan-500/20 bg-black/40 p-6 shadow-lg shadow-cyan-500/10">
            <div className="flex flex-col gap-8 lg:flex-row lg:items-start lg:justify-between">
              <div className="max-w-3xl">
                <Brain size={36} className="text-cyan-300" />

                <p className="mt-6 text-xs font-bold uppercase tracking-[0.35em] text-cyan-300">
                  Oracle Coach Command Briefing
                </p>

                <h2 className="mt-4 text-4xl font-black text-white">
                  Good morning, Operator.
                </h2>

                <p className="mt-4 max-w-2xl text-sm leading-7 text-slate-300">
                  Oracle has analysed your latest {report.sessionsAnalysed}{" "}
                  combat sessions. Your current improvement priority is{" "}
                  <span className="font-bold text-cyan-300">
                    {report.weakestSkill.label}
                  </span>
                  . Complete today&apos;s mission to give Oracle a clearer
                  signal for your next performance assessment.
                </p>

                <div className="mt-6 rounded-2xl border border-cyan-500/20 bg-cyan-500/5 p-5">
                  <p className="text-xs font-bold uppercase tracking-[0.3em] text-cyan-300">
                    Current Mission
                  </p>

                  <h3 className="mt-3 text-3xl font-black text-white">
                    {report.dailyMission.title}
                  </h3>

                  <p className="mt-3 text-sm leading-6 text-slate-300">
                    {report.dailyMission.description}
                  </p>
                </div>
              </div>

              <div className="grid min-w-[260px] gap-3">
                <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-4">
                  <p className="text-[11px] font-bold uppercase tracking-[0.25em] text-slate-500">
                    Sessions Analysed
                  </p>

                  <p className="mt-2 text-3xl font-black text-cyan-300">
                    {report.sessionsAnalysed}
                  </p>
                </div>

                <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-4">
                  <p className="text-[11px] font-bold uppercase tracking-[0.25em] text-slate-500">
                    Mission Reward
                  </p>

                  <p className="mt-2 text-3xl font-black text-cyan-300">
                    +{report.dailyMission.rewardXp} XP
                  </p>
                </div>

                <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-4">
                  <p className="text-[11px] font-bold uppercase tracking-[0.25em] text-slate-500">
                    Mission Type
                  </p>

                  <p className="mt-2 text-sm font-bold text-slate-200">
                    Daily Operational Focus
                  </p>
                </div>
              </div>
            </div>

            <div className="mt-7 rounded-2xl border border-slate-800 bg-slate-950/70 p-5">
              <div className="flex items-center gap-3">
                <Target size={20} className="text-cyan-300" />

                <p className="text-xs font-bold uppercase tracking-[0.3em] text-cyan-300">
                  Mission Objective
                </p>
              </div>

              <div className="mt-4 grid gap-3 md:grid-cols-3">
                <div className="rounded-xl border border-white/10 bg-black/30 px-4 py-3">
                  <p className="text-xs font-bold uppercase tracking-[0.22em] text-slate-500">
                    Focus
                  </p>

                  <p className="mt-2 text-sm font-bold text-white">
                    {report.weakestSkill.label}
                  </p>
                </div>

                <div className="rounded-xl border border-white/10 bg-black/30 px-4 py-3">
                  <p className="text-xs font-bold uppercase tracking-[0.22em] text-slate-500">
                    Target
                  </p>

                  <p className="mt-2 text-sm font-bold text-white">
                    Complete mission before next Oracle Session
                  </p>
                </div>

                <div className="rounded-xl border border-white/10 bg-black/30 px-4 py-3">
                  <p className="text-xs font-bold uppercase tracking-[0.22em] text-slate-500">
                    Reward
                  </p>

                  <p className="mt-2 text-sm font-bold text-cyan-300">
                    +{report.dailyMission.rewardXp} XP
                  </p>
                </div>
              </div>
            </div>
          </section>

          <MissionReadiness
            mission={report.mission}
            readiness={report.readiness}
          />

          <PredictionCard
            skill={report.prediction.skill}
            current={report.prediction.current}
            projected={report.prediction.projected}
            sessions={report.prediction.sessions}
          />
        </div>
      )}
    </AppLayout>
  );
}