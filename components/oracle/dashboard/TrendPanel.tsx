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
  const signalItems = [
    { label: "Performance", value: trend.performanceTrend },
    { label: "Confidence", value: trend.confidenceTrend },
    { label: "Consistency", value: trend.consistencyTrend },
  ];

  return (
    <div className="rounded-3xl border border-white/10 bg-white/[0.03] p-6">
      <div className="flex flex-col gap-5 md:flex-row md:items-start md:justify-between">
        <div>
          <p className="text-xs font-bold uppercase tracking-[0.35em] text-cyan-300">
            Trend Engine
          </p>

          <h3 className="mt-4 text-4xl font-black text-white">
            {formatLabel(trend.momentum)}
          </h3>

          <p className="mt-3 max-w-md text-sm leading-6 text-slate-400">
            {trend.summary}
          </p>
        </div>

        <div className="rounded-2xl border border-cyan-400/20 bg-cyan-400/5 px-5 py-4 text-right">
          <p className="text-[10px] font-bold uppercase tracking-[0.28em] text-slate-500">
            Momentum Score
          </p>

          <div className="mt-2 text-3xl font-black text-cyan-300">
            {formatChange(trend.momentumScore)}
          </div>

          <p className="mt-1 text-xs font-semibold text-cyan-200">
            {trend.sampleSize} sessions
          </p>
        </div>
      </div>

      <div className="mt-7 space-y-3">
  {signalItems.map((item) => (
    <div
      key={item.label}
      className="flex items-center justify-between rounded-2xl border border-white/10 bg-black/30 px-4 py-3"
    >
      <p className="text-xs font-bold uppercase tracking-[0.24em] text-slate-500">
        {item.label}
      </p>

      <p
        className={`text-sm font-black ${directionColour(item.value)}`}
      >
        {directionSymbol(item.value)} {formatLabel(item.value)}
      </p>
    </div>
  ))}
</div>

      <div className="mt-5 grid gap-3 md:grid-cols-2">
        <div className="rounded-2xl border border-emerald-500/20 bg-emerald-500/5 p-4">
          <p className="text-xs font-bold uppercase tracking-[0.24em] text-emerald-300">
            Improvement Signal
          </p>

          {trend.strongestImprovement ? (
            <>
              <p className="mt-3 text-lg font-black text-white">
                {trend.strongestImprovement.skill}
              </p>

              <p className="mt-1 text-sm font-bold text-emerald-300">
                {formatChange(trend.strongestImprovement.change)} points
              </p>
            </>
          ) : (
            <p className="mt-3 text-sm leading-6 text-slate-500">
              No improvement signal detected yet.
            </p>
          )}
        </div>

        <div className="rounded-2xl border border-amber-500/20 bg-amber-500/5 p-4">
          <p className="text-xs font-bold uppercase tracking-[0.24em] text-amber-300">
            Decline Signal
          </p>

          {trend.sharpestDecline ? (
            <>
              <p className="mt-3 text-lg font-black text-white">
                {trend.sharpestDecline.skill}
              </p>

              <p className="mt-1 text-sm font-bold text-amber-300">
                {formatChange(trend.sharpestDecline.change)} points
              </p>
            </>
          ) : (
            <p className="mt-3 text-sm leading-6 text-slate-500">
              No decline signal detected yet.
            </p>
          )}
        </div>
      </div>

      <div className="mt-5">
        <p className="text-xs font-bold uppercase tracking-[0.28em] text-slate-500">
          Skill Movement
        </p>

        <div className="mt-3 grid gap-2">
          {trend.skillTrends.length > 0 ? (
            trend.skillTrends.map((skillTrend) => (
              <div
                key={skillTrend.skill}
                className="flex items-center justify-between rounded-xl border border-white/10 bg-black/30 px-4 py-3"
              >
                <p className="text-sm font-medium text-slate-300">
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
                Complete at least two Oracle Sessions to unlock trend
                intelligence.
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
