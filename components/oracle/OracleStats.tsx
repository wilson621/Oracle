type OracleStatsProps = {
  winChance: number;
  confidence: number;
};

function StatCard({
  label,
  value,
}: {
  label: string;
  value: string;
}) {
  return (
    <div className="rounded-3xl border border-slate-800 bg-slate-900 p-6">
      <p className="text-xs uppercase tracking-[0.3em] text-slate-400">
        {label}
      </p>

      <p className="mt-3 text-5xl font-bold text-teal-300">
        {value}
      </p>
    </div>
  );
}

export default function OracleStats({
  winChance,
  confidence,
}: OracleStatsProps) {
  return (
    <div className="mt-8 grid gap-4 md:grid-cols-2">
      <StatCard
        label="Win Chance"
        value={`${Math.round(winChance)}%`}
      />

      <StatCard
        label="Confidence"
        value={`${Math.round(confidence)}%`}
      />
    </div>
  );
}