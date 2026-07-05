type Props = {
  label: string;
  value: number;
};

export default function SkillBar({ label, value }: Props) {
  return (
    <div className="space-y-2">
      <div className="flex justify-between text-sm">
        <span className="text-slate-300">{label}</span>
        <span className="font-semibold text-cyan-300">{value}/100</span>
      </div>

      <div className="h-3 overflow-hidden rounded-full bg-slate-800">
        <div
          className="h-full rounded-full bg-cyan-400 transition-all duration-700"
          style={{ width: `${value}%` }}
        />
      </div>
    </div>
  );
}