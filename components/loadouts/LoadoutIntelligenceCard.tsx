import type { LoadoutIntelligenceReport } from "@/lib/oracle/loadouts/loadout-types";

type Props = {
  report: LoadoutIntelligenceReport;
};

function formatRole(role: string) {
  return role
    .split("_")
    .map((word) => word[0].toUpperCase() + word.slice(1))
    .join(" ");
}

export default function LoadoutIntelligenceCard({ report }: Props) {
  const { primaryRecommendation, oracleDecision } = report;
  const simulation = oracleDecision.simulatedOutcome;

  return (
    <section className="rounded-3xl border border-cyan-500/20 bg-black/40 p-6 shadow-lg shadow-cyan-500/10">
      <p className="text-xs font-bold uppercase tracking-[0.35em] text-cyan-300">
        Weapon Intelligence
      </p>

      <div className="mt-5 flex flex-col gap-8 lg:flex-row lg:items-start lg:justify-between">
        <div className="max-w-3xl">
          <p className="text-xs font-bold uppercase tracking-[0.28em] text-slate-400">
            Oracle Decision
          </p>

          <h2 className="mt-3 text-5xl font-black text-white">
            {oracleDecision.decision}
          </h2>

          <p className="mt-5 max-w-2xl text-sm leading-7 text-slate-300">
            {oracleDecision.summary}
          </p>
        </div>

        <div className="grid min-w-[260px] gap-3">
          <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-4">
            <p className="text-[11px] font-bold uppercase tracking-[0.25em] text-slate-400">
              Decision Confidence
            </p>

            <p className="mt-2 text-4xl font-black text-cyan-300">
              {oracleDecision.confidence}%
            </p>
          </div>

          <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-4">
            <p className="text-[11px] font-bold uppercase tracking-[0.25em] text-slate-400">
              Operator Compatibility
            </p>

            <p className="mt-2 text-4xl font-black text-cyan-300">
              {primaryRecommendation.operatorCompatibility}%
            </p>
          </div>

          <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-4">
            <p className="text-[11px] font-bold uppercase tracking-[0.25em] text-slate-400">
              Weapon Role
            </p>

            <p className="mt-2 text-sm font-bold text-slate-200">
              {formatRole(primaryRecommendation.role)}
            </p>
          </div>
        </div>
      </div>

      <div className="mt-7 grid gap-4 md:grid-cols-2">
        <div className="rounded-2xl border border-white/10 bg-black/30 p-5">
          <p className="text-xs font-bold uppercase tracking-[0.28em] text-slate-400">
            Public Meta
          </p>

          <p className="mt-3 text-3xl font-black text-white">
            {primaryRecommendation.currentMetaWeapon}
          </p>
        </div>

        <div className="rounded-2xl border border-cyan-500/20 bg-cyan-500/5 p-5">
          <p className="text-xs font-bold uppercase tracking-[0.28em] text-cyan-300">
            Oracle Recommendation
          </p>

          <p className="mt-3 text-3xl font-black text-white">
            {primaryRecommendation.recommendedWeapon}
          </p>
        </div>
      </div>

      <div className="mt-6 rounded-2xl border border-slate-800 bg-slate-950/70 p-5">
        <p className="text-xs font-bold uppercase tracking-[0.28em] text-cyan-300">
          Oracle&apos;s Reasoning
        </p>

        <div className="mt-4 grid gap-3">
          {oracleDecision.reasoning.map((item) => (
            <div
              key={item}
              className="rounded-xl border border-white/10 bg-black/30 px-4 py-3"
            >
              <p className="text-sm font-medium text-slate-300">{item}</p>
            </div>
          ))}
        </div>
      </div>

      <div className="mt-6 rounded-2xl border border-cyan-500/20 bg-cyan-500/5 p-5">
        <p className="text-xs font-bold uppercase tracking-[0.28em] text-cyan-300">
          Simulated Outcome
        </p>

        <div className="mt-5 grid gap-4 md:grid-cols-3">
          <div className="rounded-2xl border border-white/10 bg-black/30 p-5">
            <p className="text-xs font-bold uppercase tracking-[0.24em] text-slate-400">
              Follow Oracle
            </p>

            <p className="mt-3 text-3xl font-black text-cyan-300">
              {simulation.oracleWeapon}
            </p>

            <p className="mt-2 text-sm font-bold text-emerald-300">
              {simulation.oracleWinProbability}% win probability
            </p>
          </div>

          <div className="rounded-2xl border border-white/10 bg-black/30 p-5">
            <p className="text-xs font-bold uppercase tracking-[0.24em] text-slate-400">
              Follow Meta
            </p>

            <p className="mt-3 text-3xl font-black text-white">
              {simulation.metaWeapon}
            </p>

            <p className="mt-2 text-sm font-bold text-amber-300">
              {simulation.metaWinProbability}% win probability
            </p>
          </div>

          <div className="rounded-2xl border border-emerald-500/20 bg-emerald-500/5 p-5">
            <p className="text-xs font-bold uppercase tracking-[0.24em] text-emerald-300">
              Oracle Advantage
            </p>

            <p className="mt-3 text-3xl font-black text-emerald-300">
              +{simulation.advantage}%
            </p>
          </div>
        </div>
      </div>

      <div className="mt-6 grid gap-4 md:grid-cols-2">
        <div className="rounded-2xl border border-emerald-500/20 bg-emerald-500/5 p-5">
          <p className="text-xs font-bold uppercase tracking-[0.28em] text-emerald-300">
            Expected Outcome
          </p>

          <p className="mt-3 text-sm font-semibold leading-7 text-slate-200">
            {oracleDecision.expectedOutcome}
          </p>
        </div>

        <div className="rounded-2xl border border-amber-500/20 bg-amber-500/5 p-5">
          <p className="text-xs font-bold uppercase tracking-[0.28em] text-amber-300">
            Reassessment Trigger
          </p>

          <p className="mt-3 text-sm font-semibold leading-7 text-slate-200">
            {oracleDecision.reassessmentTrigger}
          </p>
        </div>
      </div>
    </section>
  );
}