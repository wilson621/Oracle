import type { BehaviourProfile } from "@/lib/oracle/behaviour/behaviour-types";

type BehaviourPanelProps = {
  behaviour: BehaviourProfile;
};

function percent(value: number) {
  return `${Math.round(value)}%`;
}

function getBehaviourStatus(confidence: number) {
  const percentage = Math.round(confidence * 100);

  if (percentage >= 80) return "High reliability";
  if (percentage >= 60) return "Stable reliability";
  if (percentage >= 40) return "Developing profile";
  return "Limited sample";
}

export default function BehaviourPanel({ behaviour }: BehaviourPanelProps) {
  const confidence = Math.round(behaviour.overallBehaviourConfidence * 100);

  const traits = [
    behaviour.discipline,
    behaviour.mechanicalConfidence,
    behaviour.decisionConfidence,
    behaviour.adaptability,
    behaviour.consistency,
  ];

  return (
    <div className="rounded-3xl border border-white/10 bg-white/[0.03] p-6">
      <div className="flex flex-col gap-5 md:flex-row md:items-start md:justify-between">
        <div>
          <p className="text-xs font-bold uppercase tracking-[0.35em] text-teal-300">
            Behaviour Assessment
          </p>

          <h3 className="mt-4 text-4xl font-black text-white">
            {behaviour.playstyle}
          </h3>

          <p className="mt-3 max-w-md text-sm leading-6 text-slate-400">
            Oracle has classified the current operator behaviour profile from
            discipline, confidence, adaptability and consistency signals.
          </p>
        </div>

        <div className="rounded-2xl border border-teal-400/20 bg-teal-400/5 px-5 py-4 text-right">
          <p className="text-[10px] font-bold uppercase tracking-[0.28em] text-slate-400">
            Behaviour Confidence
          </p>

          <div className="mt-2 text-3xl font-black text-teal-300">
            {confidence}%
          </div>

          <p className="mt-1 text-xs font-semibold text-teal-200">
            {getBehaviourStatus(behaviour.overallBehaviourConfidence)}
          </p>
        </div>
      </div>

      <div className="mt-7 space-y-3">
        {traits.map((trait) => (
          <div
            key={trait.label}
            className="rounded-2xl border border-slate-800 bg-slate-950/60 p-4"
          >
            <div className="flex items-center justify-between gap-4">
              <p className="text-xs font-bold uppercase tracking-[0.24em] text-slate-400">
                {trait.label}
              </p>

              <p className="text-lg font-black text-white">
                {percent(trait.score)}
              </p>
            </div>

            <div className="mt-3 h-2 overflow-hidden rounded-full bg-slate-800">
              <div
                className="h-full rounded-full bg-teal-400 shadow-[0_0_8px_rgba(64,174,174,0.25)] transition-all duration-700"
                style={{ width: `${trait.score}%` }}
              />
            </div>
          </div>
        ))}
      </div>

      <div className="mt-5 grid gap-3 md:grid-cols-2">
        <div className="rounded-2xl border border-emerald-500/20 bg-emerald-500/5 p-4">
          <p className="text-xs font-bold uppercase tracking-[0.24em] text-emerald-300">
            Strength Signals
          </p>

          <div className="mt-3 space-y-2">
            {behaviour.strengths.length > 0 ? (
              behaviour.strengths.map((strength) => (
                <p key={strength} className="text-sm text-slate-300">
                  ✓ {strength}
                </p>
              ))
            ) : (
              <p className="text-sm text-slate-400">
                No dominant strength signal detected yet.
              </p>
            )}
          </div>
        </div>

        <div className="rounded-2xl border border-amber-500/20 bg-amber-500/5 p-4">
          <p className="text-xs font-bold uppercase tracking-[0.24em] text-amber-300">
            Watchlist Signals
          </p>

          <div className="mt-3 space-y-2">
            {behaviour.weaknesses.length > 0 ? (
              behaviour.weaknesses.map((weakness) => (
                <p key={weakness} className="text-sm text-slate-300">
                  ⚠ {weakness}
                </p>
              ))
            ) : (
              <p className="text-sm text-slate-400">
                No major watchlist signal detected yet.
              </p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}