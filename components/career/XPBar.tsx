"use client";

type XPBarProps = {
  current: number;
  required: number;
  progress: number;
};

export default function XPBar({ current, required, progress }: XPBarProps) {
  return (
    <div>
      <div className="mb-3 flex justify-between text-sm">
        <span className="text-slate-300">XP Progress</span>

        <span className="font-bold text-cyan-300">
          {current} / {required}
        </span>
      </div>

      <div className="h-4 overflow-hidden rounded-full bg-slate-800">
        <div
          className="h-full rounded-full bg-cyan-400 shadow-[0_0_22px_rgba(34,211,238,0.7)] transition-all duration-1000"
          style={{ width: `${progress}%` }}
        />
      </div>
    </div>
  );
}