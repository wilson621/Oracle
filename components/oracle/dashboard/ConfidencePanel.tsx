import ConfidenceRing from "@/components/ui/ConfidenceRing";

type ConfidencePanelProps = {
  confidence: number;
};

function getConfidenceStatus(percentage: number) {
  if (percentage >= 75) return "High Confidence";
  if (percentage >= 50) return "Moderate Confidence";
  return "Low Confidence";
}

function getConfidenceSummary(percentage: number) {
  if (percentage >= 75) {
    return "Oracle has high confidence in the current behavioural, trend and predictive assessment.";
  }

  if (percentage >= 50) {
    return "Oracle has moderate confidence in the current assessment. Additional Oracle Sessions will improve reliability.";
  }

  return "Oracle confidence is limited. Additional intelligence samples are required before conclusions become reliable.";
}

export default function ConfidencePanel({
  confidence,
}: ConfidencePanelProps) {
  const percentage = Math.round(confidence * 100);
  const status = getConfidenceStatus(percentage);

  return (
    <section className="rounded-3xl border border-cyan-500/20 bg-black/40 p-6 shadow-lg shadow-cyan-500/10">
      <div className="flex flex-col gap-8 lg:flex-row lg:items-center lg:justify-between">
        <div className="max-w-2xl">
          <p className="text-xs font-bold uppercase tracking-[0.35em] text-cyan-300">
            Oracle Intelligence
          </p>

          <h3 className="mt-4 text-4xl font-black text-white">
            Confidence Assessment
          </h3>

          <div className="mt-5 inline-flex rounded-full border border-cyan-400/20 bg-cyan-400/10 px-4 py-2 text-sm font-bold text-cyan-300">
            {status}
          </div>

          <p className="mt-5 max-w-xl text-sm leading-7 text-slate-400">
            {getConfidenceSummary(percentage)}
          </p>

          <div className="mt-6 grid gap-3 sm:grid-cols-2">
            <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-4">
              <p className="text-[11px] font-bold uppercase tracking-[0.28em] text-slate-500">
                Assessment Scope
              </p>

              <p className="mt-2 text-sm font-semibold text-slate-200">
                Behaviour · Trend · Prediction
              </p>
            </div>

            <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-4">
              <p className="text-[11px] font-bold uppercase tracking-[0.28em] text-slate-500">
                Intelligence State
              </p>

              <p className="mt-2 text-sm font-semibold text-cyan-300">
                Active Analysis
              </p>
            </div>
          </div>
        </div>

        <div className="flex justify-center lg:justify-end">
          <ConfidenceRing value={percentage} />
        </div>
      </div>
    </section>
  );
}