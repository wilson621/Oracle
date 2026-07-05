type ProgressBarProps = {
  value: number;
  max?: number;
  label?: string;
  showPercentage?: boolean;
};

export default function ProgressBar({
  value,
  max = 100,
  label,
  showPercentage = true,
}: ProgressBarProps) {
  const percentage = Math.min(
    100,
    Math.round((value / max) * 100)
  );

  return (
    <div>

      {label && (
        <div className="mb-3 flex justify-between">

          <span className="text-sm text-slate-400">
            {label}
          </span>

          {showPercentage && (
            <span className="text-sm font-bold text-cyan-300">
              {percentage}%
            </span>
          )}

        </div>
      )}

      <div className="h-4 overflow-hidden rounded-full bg-slate-800">

        <div
          className="h-full rounded-full bg-cyan-400 shadow-[0_0_20px_rgba(34,211,238,.7)] transition-all duration-1000"
          style={{
            width: `${percentage}%`,
          }}
        />

      </div>

    </div>
  );
}