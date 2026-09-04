type Props = {
  label: string;
  value: number;
};

function getStatus(value: number) {
  if (value >= 90) return "Exceptional";
  if (value >= 75) return "Operational";
  if (value >= 60) return "Effective";
  if (value >= 40) return "Emerging";
  return "Critical";
}

function getBarColour(value: number) {
  if (value >= 75) return "from-teal-400 to-teal-300";
  if (value >= 50) return "from-sky-400 to-teal-400";
  if (value >= 40) return "from-amber-300 to-orange-400";
  return "from-amber-400 to-orange-500";
}

export default function SkillBar({ label, value }: Props) {
  return (
    <div className="rounded-2xl border border-slate-800 bg-slate-950/70 p-4 transition-all duration-300 hover:border-teal-400/20 hover:bg-slate-950">
      <div className="flex items-center justify-between gap-6">
        <div>
          <p className="text-[11px] font-bold uppercase tracking-[0.32em] text-slate-400">
            {label}
          </p>

          <p className="mt-1 text-sm font-semibold text-teal-300">
            {getStatus(value)}
          </p>
        </div>

        <div className="text-right">
          <div className="text-4xl font-black leading-none text-white">
            {value}
          </div>

          <div className="mt-1 text-[10px] uppercase tracking-[0.25em] text-slate-400">
            Operational Rating
          </div>
        </div>
      </div>

      <div className="mt-4 h-2.5 overflow-hidden rounded-full bg-slate-800">
        <div
          className={`h-full rounded-full bg-gradient-to-r ${getBarColour(
            value
          )} shadow-[0_0_8px_rgba(64,174,174,0.2)] transition-all duration-700`}
          style={{ width: `${value}%` }}
        />
      </div>
    </div>
  );
}