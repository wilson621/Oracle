import type { OracleBrainReport } from "@/lib/oracle/oracle-brain-types";

type OracleBrainCardProps = {
  report: OracleBrainReport;
};

function formatLabel(value: string) {
  return value
    .split("_")
    .map((word) => word[0].toUpperCase() + word.slice(1))
    .join(" ");
}

function confidencePercent(value: number) {
  return `${Math.round(value * 100)}%`;
}

export function OracleBrainCard({ report }: OracleBrainCardProps) {
  const behaviour = report.behaviour;
  const trend = report.trend;

  return (
    <section className="rounded-3xl border border-cyan-500/20 bg-black/50 p-6 shadow-lg shadow-cyan-500/10">
      <div className="mb-6">
        <p className="text-xs uppercase tracking-[0.3em] text-cyan-300">
          OracleBrain
        </p>

        <h2 className="mt-2 text-3xl font-bold text-white">
          Operator Intelligence
        </h2>

        <p className="mt-3 max-w-4xl text-sm leading-6 text-slate-400">
          {report.summary}
        </p>
      </div>

      <div className="grid gap-4 lg:grid-cols-3">
        <div className="rounded-2xl border border-cyan-500/20 bg-cyan-500/10 p-5">
          <p className="text-xs uppercase tracking-wide text-slate-400">
            Intelligence Confidence
          </p>
          <p className="mt-2 text-4xl font-black text-cyan-300">
            {confidencePercent(report.confidence)}
          </p>
        </div>

        <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-5">
          <p className="text-xs uppercase tracking-wide text-slate-400">
            Behaviour Profile
          </p>
          <p className="mt-2 text-3xl font-black text-white">
            {behaviour.playstyle}
          </p>
          <p className="mt-2 text-sm text-slate-400">
            Confidence: {confidencePercent(behaviour.overallBehaviourConfidence)}
          </p>
        </div>

        <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-5">
          <p className="text-xs uppercase tracking-wide text-slate-400">
            Trend Momentum
          </p>
          <p className="mt-2 text-3xl font-black text-white">
            {formatLabel(trend.momentum)}
          </p>
          <p className="mt-2 text-sm text-slate-400">
            Momentum Score: {trend.momentumScore}
          </p>
        </div>
      </div>

      <div className="mt-6 grid gap-4 lg:grid-cols-2">
        <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-5">
          <h3 className="text-sm font-semibold uppercase tracking-wide text-cyan-300">
            Behaviour Traits
          </h3>

          <div className="mt-5 space-y-4">
            {[
              behaviour.discipline,
              behaviour.mechanicalConfidence,
              behaviour.decisionConfidence,
              behaviour.adaptability,
              behaviour.consistency,
            ].map((trait) => (
              <div key={trait.label}>
                <div className="flex items-center justify-between text-sm">
                  <p className="text-slate-300">{trait.label}</p>
                  <p className="font-semibold text-white">{trait.score}%</p>
                </div>

                <div className="mt-2 h-2 rounded-full bg-slate-800">
                  <div
                    className="h-2 rounded-full bg-cyan-300"
                    style={{ width: `${trait.score}%` }}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-5">
          <h3 className="text-sm font-semibold uppercase tracking-wide text-cyan-300">
            Trend Intelligence
          </h3>

          <div className="mt-5 grid gap-3">
            <div className="rounded-xl border border-white/10 bg-black/30 p-4">
              <p className="text-xs text-slate-500">Performance Trend</p>
              <p className="mt-1 font-semibold text-white">
                {formatLabel(trend.performanceTrend)}
              </p>
            </div>

            <div className="rounded-xl border border-white/10 bg-black/30 p-4">
              <p className="text-xs text-slate-500">Confidence Trend</p>
              <p className="mt-1 font-semibold text-white">
                {formatLabel(trend.confidenceTrend)}
              </p>
            </div>

            <div className="rounded-xl border border-white/10 bg-black/30 p-4">
              <p className="text-xs text-slate-500">Consistency Trend</p>
              <p className="mt-1 font-semibold text-white">
                {formatLabel(trend.consistencyTrend)}
              </p>
            </div>

            <div className="rounded-xl border border-white/10 bg-black/30 p-4">
              <p className="text-xs text-slate-500">Trend Sample</p>
              <p className="mt-1 font-semibold text-white">
                {trend.sampleSize} sessions
              </p>
            </div>
          </div>
        </div>
      </div>

      <div className="mt-6 grid gap-4 lg:grid-cols-2">
        <div className="rounded-2xl border border-emerald-500/20 bg-emerald-500/5 p-5">
          <h3 className="text-sm font-semibold uppercase tracking-wide text-emerald-300">
            Strengths
          </h3>

          <div className="mt-4 space-y-2">
            {behaviour.strengths.length > 0 ? (
              behaviour.strengths.map((strength) => (
                <p key={strength} className="text-sm text-slate-300">
                  ✓ {strength}
                </p>
              ))
            ) : (
              <p className="text-sm text-slate-500">
                No dominant strengths detected yet.
              </p>
            )}
          </div>
        </div>

        <div className="rounded-2xl border border-amber-500/20 bg-amber-500/5 p-5">
          <h3 className="text-sm font-semibold uppercase tracking-wide text-amber-300">
            Weaknesses
          </h3>

          <div className="mt-4 space-y-2">
            {behaviour.weaknesses.length > 0 ? (
              behaviour.weaknesses.map((weakness) => (
                <p key={weakness} className="text-sm text-slate-300">
                  ⚠ {weakness}
                </p>
              ))
            ) : (
              <p className="text-sm text-slate-500">
                No major weaknesses detected yet.
              </p>
            )}
          </div>
        </div>
      </div>

      <div className="mt-6 rounded-2xl border border-white/10 bg-white/[0.03] p-5">
        <h3 className="text-sm font-semibold uppercase tracking-wide text-cyan-300">
          Skill Trends
        </h3>

        <div className="mt-4 grid gap-3 md:grid-cols-2 xl:grid-cols-5">
          {trend.skillTrends.length > 0 ? (
            trend.skillTrends.map((skillTrend) => (
              <div
                key={skillTrend.skill}
                className="rounded-xl border border-white/10 bg-black/30 p-4"
              >
                <p className="text-xs text-slate-500">{skillTrend.skill}</p>
                <p className="mt-1 text-lg font-bold text-white">
                  {skillTrend.change > 0 ? "+" : ""}
                  {skillTrend.change}
                </p>
                <p className="mt-1 text-xs text-slate-400">
                  {formatLabel(skillTrend.direction)}
                </p>
              </div>
            ))
          ) : (
            <p className="text-sm text-slate-500">
              Complete at least two Oracle Sessions to unlock skill trend intelligence.
            </p>
          )}
        </div>
      </div>

      <div className="mt-6 space-y-3">
        <h3 className="text-sm font-semibold uppercase tracking-wide text-cyan-300">
          Recommendations
        </h3>

        {report.recommendations.map((recommendation) => (
          <div
            key={recommendation.title}
            className="rounded-2xl border border-white/10 bg-white/[0.03] p-5"
          >
            <div className="flex items-center justify-between gap-4">
              <p className="font-semibold text-white">{recommendation.title}</p>

              <span className="rounded-full bg-cyan-500/10 px-3 py-1 text-xs uppercase tracking-wide text-cyan-300">
                {recommendation.priority}
              </span>
            </div>

            <p className="mt-2 text-sm leading-6 text-slate-400">
              {recommendation.reason}
            </p>
          </div>
        ))}
      </div>

      <div className="mt-6 rounded-2xl border border-cyan-500/20 bg-cyan-500/5 p-5">
        <p className="text-xs uppercase tracking-wide text-slate-500">
          Next Focus
        </p>
        <p className="mt-2 text-base font-semibold text-cyan-100">
          {report.nextFocus}
        </p>
      </div>
    </section>
  );
}