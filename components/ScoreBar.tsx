type ScoreBarProps = {
  label: string;
  score: number;
};

export default function ScoreBar({ label, score }: ScoreBarProps) {
  return (
    <div>
      <div className="mb-2 flex items-center justify-between">
        <p className="text-sm font-semibold text-slate-300">{label}</p>
        <p className="text-sm font-bold text-cyan-300">{score}</p>
      </div>

      <div className="h-3 rounded-full bg-slate-800">
        <div
          className="h-3 rounded-full bg-cyan-400"
          style={{ width: `${score}%` }}
        />
      </div>
    </div>
  );
}