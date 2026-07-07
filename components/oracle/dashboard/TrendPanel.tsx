import type { TrendProfile } from "@/lib/oracle/trend/trend-types";

type TrendPanelProps = {
  trend: TrendProfile;
};

function formatLabel(value: string) {
  return value
    .split("_")
    .map((word) => word[0].toUpperCase() + word.slice(1))
    .join(" ");
}

function formatChange(value: number) {
  if (value > 0) return `+${value}`;
  return String(value);
}

function directionSymbol(value: string) {
  if (value === "improving") return "↑";
  if (value === "declining") return "↓";
  if (value === "stable") return "→";
  return "•";
}

function directionColour(value: string) {
  if (value === "improving") return "text-emerald-300";
  if (value === "declining") return "text-amber-300";
  if (value === "stable") return "text-slate-300";
  return "text-cyan-300";
}

export default function TrendPanel({ trend }: TrendPanelProps) {
  return (
    <div className="rounded-3xl border border-white/10 bg-white/[0.03] p-6">
      <div className="flex items-start justify-between gap-4">
        <div>
          <p className="text-xs uppercase tracking-[0.3em] text-cyan-300">
            Trend Engine
          </p>

          <h3 className="mt-4 text-3xl font-black text-white">
            {formatLabel(trend.momentum)}
          </h3>

          <p className="mt-2 text-sm text-slate-400">
            Momentum Score:{" "}
            <span className="text-cyan-300">{trend.momentumScore}</span>
          </p>
        </div>

        <div className="rounded-xl border border-cyan-500/20 bg-cyan-500/5 px-4 py-2 text-sm font-semibold text-cyan-300">
          {trend.sampleSize} sessions
        </div>
      </div>

      <p className="mt-5 text-sm leading-6 text-slate-400">
        {trend.summary}
      </p>

      <div className="mt-6 space-y-3">
        {[
          { label: "Performance", value: trend.performanceTrend },
          { label: "Confidence", value: trend.confidenceTrend },
          { label: "Consistency", value: trend.consistencyTrend },
        ].map((item) => (
          <div
            key={item.label}
            className="flex items-center justify-between rounded-2xl border border-white/10 bg-black/30 px-4 py-3"
          >
            <p className="text-xs uppercase tracking-wide text-slate-500">
              {item.label}
            </p>

            <p
              className={`text-sm font-bold ${directionColour(
                item.value
              )}`}
            >
              {directionSymbol(item.value)} {formatLabel(item.value)}
            </p>
          </div>
        ))}
      </div>

      <div className="mt-6 grid gap-3 md:grid-cols-2">
        <div className="rounded-2xl border border-emerald-500/20 bg-emerald-500/5 p-4">
          <p className="text-xs uppercase tracking-wide text-emerald-300">
            Best Trend
          </p>

          {trend.strongestImprovement ? (
            <>
              <p className="mt-3 text-lg font-bold text-white">
                {trend.strongestImprovement.skill}
              </p>
              <p className="mt-1 text-sm font-semibold text-emerald-300">
                {formatChange(trend.strongestImprovement.change)} points
              </p>
            </>
          ) : (
            <p className="mt-3 text-sm text-slate-500">
              No improvement trend detected yet.
            </p>
          )}
        </div>

        <div className="rounded-2xl border border-amber-500/20 bg-amber-500/5 p-4">
          <p className="text-xs uppercase tracking-wide text-amber-300">
            Largest Decline
          </p>

          {trend.sharpestDecline ? (
            <>
              <p className="mt-3 text-lg font-bold text-white">
                {trend.sharpestDecline.skill}
              </p>
              <p className="mt-1 text-sm font-semibold text-amber-300">
                {formatChange(trend.sharpestDecline.change)} points
              </p>
            </>
          ) : (
            <p className="mt-3 text-sm text-slate-500">
              No decline trend detected yet.
            </p>
          )}
        </div>
      </div>

      <div className="mt-6">
        <p className="text-xs uppercase tracking-wide text-slate-500">
          Skill Movement
        </p>

        <div className="mt-3 space-y-2">
          {trend.skillTrends.length > 0 ? (
            trend.skillTrends.map((skillTrend) => (
              <div
                key={skillTrend.skill}
                className="flex items-center justify-between rounded-xl border border-white/10 bg-black/30 px-4 py-3"
              >
                <p className="text-sm text-slate-400">
                  {skillTrend.skill}
                </p>

                <p
                  className={`text-lg font-black ${directionColour(
                    skillTrend.direction
                  )}`}
                >
                  {directionSymbol(skillTrend.direction)}{" "}
                  {formatChange(skillTrend.change)}
                </p>
              </div>
            ))
          ) : (
            <div className="rounded-xl border border-white/10 bg-black/30 px-4 py-3">
              <p className="text-sm text-slate-500">
                Complete at least two Oracle Sessions to unlock trend intelligence.
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}