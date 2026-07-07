import ConfidenceRing from "@/components/ui/ConfidenceRing";

type ConfidencePanelProps = {
  confidence: number;
};

export default function ConfidencePanel({
  confidence,
}: ConfidencePanelProps) {
  const percentage = Math.round(confidence * 100);

  return (
    <div className="rounded-3xl border border-cyan-500/20 bg-black/40 p-6 shadow-lg shadow-cyan-500/10">
      <div className="flex flex-col gap-8 lg:flex-row lg:items-center lg:justify-between">
        <div>
          <p className="text-xs uppercase tracking-[0.3em] text-cyan-300">
            Intelligence
          </p>

          <h3 className="mt-3 text-3xl font-black text-white">
            Overall Confidence
          </h3>

          <p className="mt-4 max-w-xl text-sm leading-6 text-slate-400">
            Oracle confidence in the current behavioural, trend and prediction
            analysis.
          </p>

          <div className="mt-6 rounded-2xl border border-cyan-500/20 bg-cyan-500/5 p-4">
            <p className="text-xs uppercase tracking-wide text-slate-500">
              Intelligence Status
            </p>

            <p className="mt-2 text-lg font-bold text-cyan-300">
              {percentage >= 75
                ? "High Confidence"
                : percentage >= 50
                  ? "Moderate Confidence"
                  : "Low Confidence"}
            </p>
          </div>
        </div>

        <div className="flex justify-center lg:justify-end">
          <ConfidenceRing value={percentage} />
        </div>
      </div>
    </div>
  );
}