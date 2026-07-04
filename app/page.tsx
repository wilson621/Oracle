"use client";

import { useState } from "react";
import Image from "next/image";
import OracleCard from "@/components/OracleCard";
import StatCard from "@/components/StatCard";
import ScoreBar from "@/components/ScoreBar";

const quickActions = [
  "I lost a fight I should have won",
  "Review my positioning",
  "Build me a low recoil loadout",
  "Explain today’s meta",
];

type OracleReport = {
  winChance: number;
  confidence: number;
  verdict: string;
  mainMistake: string;
  whatYouDidWell: string;
  recommendation: string;
  drill: string;
  scores: {
    positioning: number;
    aim: number;
    movement: number;
    decisionMaking: number;
    gameSense: number;
  };
};

export default function Home() {
  const [showReport, setShowReport] = useState(false);
  const [isAnalysing, setIsAnalysing] = useState(false);
  const [report, setReport] = useState<OracleReport | null>(null);

  async function handleAskOracle() {
    const textarea = document.querySelector("textarea");
    if (!textarea) return;

    const prompt = textarea.value.trim();

    if (!prompt) {
      alert("Tell Oracle what happened first.");
      return;
    }

    setIsAnalysing(true);
    setShowReport(false);
    setReport(null);

    try {
      const response = await fetch("/api/oracle/analyze", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ prompt }),
      });

      const data = await response.json();

      if (!response.ok) {
        alert(data.error || "Oracle returned an error.");
        return;
      }

      setReport(data.report);
      setShowReport(true);
    } catch (err) {
      console.error(err);
      alert("Oracle could not analyse the fight.");
    }

    setIsAnalysing(false);
  }

  return (
    <main className="min-h-screen bg-[#070A10] text-white">
      <div className="mx-auto grid min-h-screen max-w-7xl grid-cols-1 gap-6 px-6 py-6 lg:grid-cols-[260px_1fr]">
        <aside className="rounded-3xl border border-slate-800 bg-slate-950/80 p-6">
          <p className="text-xs font-bold tracking-[0.35em] text-cyan-300">
            PROJECT META
          </p>

          <div className="mt-10 space-y-3">
            {["Oracle", "Reports", "Loadouts", "Weapons", "Settings"].map(
              (item) => (
                <button
                  key={item}
                  className={`w-full rounded-2xl px-4 py-3 text-left text-sm font-semibold ${
                    item === "Oracle"
                      ? "bg-cyan-400 text-slate-950"
                      : "text-slate-400 hover:bg-slate-900 hover:text-white"
                  }`}
                >
                  {item}
                </button>
              )
            )}
          </div>
        </aside>

        <section className="rounded-3xl border border-slate-800 bg-slate-950/60 p-8">
          <header className="flex items-center justify-between border-b border-slate-800 pb-6">
            <div>
              <p className="text-sm text-slate-400">
                See what everyone else missed.
              </p>
              <h1 className="mt-1 text-3xl font-bold">Oracle</h1>
            </div>

            <button className="rounded-full border border-slate-700 px-5 py-2 text-sm font-semibold text-slate-300 hover:border-cyan-400 hover:text-cyan-300">
              Sign in
            </button>
          </header>

          <div className="mx-auto max-w-4xl pt-10">
            <div className="rounded-[2rem] border border-slate-800 bg-[#090E17] p-8">
              <div className="flex flex-col items-center text-center">
                <Image
                  src="/images/oracle-eye.png"
                  alt="Oracle Eye"
                  width={500}
                  height={250}
                  priority
                  className={`mb-8 h-auto transition-all duration-700 ${
                    isAnalysing
                      ? "scale-105 drop-shadow-[0_0_35px_rgba(34,211,238,0.9)]"
                      : "drop-shadow-[0_0_20px_rgba(34,211,238,0.45)]"
                  }`}
                />

                <h2 className="text-5xl font-bold tracking-tight">
                  Tell Oracle what happened.
                </h2>

                <p className="mt-4 max-w-2xl text-slate-400">
                  Describe the fight. Oracle will break down what cost you the
                  engagement and what to do differently next time.
                </p>
              </div>

              <div className="mx-auto mt-10 max-w-3xl rounded-3xl border border-slate-800 bg-slate-950 p-4">
                <textarea
                  className="min-h-44 w-full resize-none rounded-2xl bg-slate-900 p-5 text-white outline-none placeholder:text-slate-500"
                  placeholder="Tell Oracle what happened..."
                />

                <div className="mt-4 flex flex-col gap-3 sm:flex-row">
                  <button className="flex-1 rounded-2xl border border-slate-700 px-5 py-4 font-bold text-slate-300 hover:border-cyan-400 hover:text-cyan-300">
                    Upload Clip
                  </button>

                  <button
                    onClick={handleAskOracle}
                    className="flex-1 rounded-2xl bg-cyan-400 px-5 py-4 font-bold text-slate-950 hover:bg-cyan-300"
                  >
                    {isAnalysing ? "Analysing..." : "Ask Oracle"}
                  </button>
                </div>
              </div>

              {isAnalysing && (
                <div className="mx-auto mt-6 max-w-3xl rounded-3xl border border-cyan-400/30 bg-cyan-400/10 p-6 text-cyan-300">
                  Oracle is reviewing your engagement...
                </div>
              )}

              {showReport && report && (
                <div className="mx-auto mt-6 grid max-w-3xl gap-4">
                  <div className="grid gap-4 md:grid-cols-2">
                    <StatCard
                      label="Win Chance"
                      value={`${report.winChance}%`}
                    />

                    <StatCard
                      label="Confidence"
                      value={`${Math.round(report.confidence)}%`}
                    />
                  </div>

                  <OracleCard title="Oracle Verdict">
                    <p className="text-lg leading-8 text-slate-200">
                      {report.verdict}
                    </p>
                  </OracleCard>

                  <OracleCard title="Skill Breakdown">
                    <div className="space-y-5">
                      <ScoreBar
                        label="Positioning"
                        score={report.scores.positioning}
                      />
                      <ScoreBar label="Aim" score={report.scores.aim} />
                      <ScoreBar
                        label="Movement"
                        score={report.scores.movement}
                      />
                      <ScoreBar
                        label="Decision Making"
                        score={report.scores.decisionMaking}
                      />
                      <ScoreBar
                        label="Game Sense"
                        score={report.scores.gameSense}
                      />
                    </div>
                  </OracleCard>

                  <OracleCard title="Main Mistake">
                    <p className="text-slate-300">{report.mainMistake}</p>
                  </OracleCard>

                  <OracleCard title="What You Did Well">
                    <p className="text-slate-300">{report.whatYouDidWell}</p>
                  </OracleCard>

                  <OracleCard title="Recommendation">
                    <p className="text-slate-300">{report.recommendation}</p>
                  </OracleCard>

                  <OracleCard title="Training Drill">
                    <p className="text-slate-300">{report.drill}</p>
                  </OracleCard>
                </div>
              )}

              <div className="mx-auto mt-8 grid max-w-3xl gap-3 md:grid-cols-2">
                {quickActions.map((action) => (
                  <button
                    key={action}
                    className="rounded-2xl border border-slate-800 bg-slate-900/70 p-4 text-left text-sm font-semibold text-slate-300 hover:border-cyan-400 hover:text-cyan-300"
                  >
                    {action}
                  </button>
                ))}
              </div>
            </div>
          </div>
        </section>
      </div>
    </main>
  );
}