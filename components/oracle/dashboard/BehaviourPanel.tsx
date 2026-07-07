import type { BehaviourProfile } from "@/lib/oracle/behaviour/behaviour-types";

type BehaviourPanelProps = {
  behaviour: BehaviourProfile;
};

function percent(value: number) {
  return `${Math.round(value)}%`;
}

export default function BehaviourPanel({ behaviour }: BehaviourPanelProps) {
  const traits = [
    behaviour.discipline,
    behaviour.mechanicalConfidence,
    behaviour.decisionConfidence,
    behaviour.adaptability,
    behaviour.consistency,
  ];

  return (
    <div className="rounded-3xl border border-white/10 bg-white/[0.03] p-6">
      <p className="text-xs uppercase tracking-[0.3em] text-cyan-300">
        Behaviour
      </p>

      <div className="mt-4 flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
        <div>
          <h3 className="text-3xl font-black text-white">
            {behaviour.playstyle}
          </h3>

          <p className="mt-2 text-sm text-slate-400">
            Behaviour Confidence:{" "}
            <span className="text-cyan-300">
              {percent(behaviour.overallBehaviourConfidence * 100)}
            </span>
          </p>
        </div>

        <div className="rounded-2xl border border-cyan-500/20 bg-cyan-500/5 px-4 py-3 text-sm text-cyan-100">
          Operator Profile
        </div>
      </div>

      <div className="mt-6 space-y-4">
        {traits.map((trait) => (
          <div key={trait.label}>
            <div className="flex items-center justify-between text-sm">
              <p className="text-slate-300">{trait.label}</p>
              <p className="font-semibold text-white">
                {percent(trait.score)}
              </p>
            </div>

            <div className="mt-2 h-2 overflow-hidden rounded-full bg-slate-800">
              <div
                className="h-full rounded-full bg-cyan-400 transition-all duration-700"
                style={{ width: `${trait.score}%` }}
              />
            </div>
          </div>
        ))}
      </div>

      <div className="mt-6 grid gap-3 md:grid-cols-2">
        <div className="rounded-2xl border border-emerald-500/20 bg-emerald-500/5 p-4">
          <p className="text-xs uppercase tracking-wide text-emerald-300">
            Strengths
          </p>

          <div className="mt-3 space-y-2">
            {behaviour.strengths.length > 0 ? (
              behaviour.strengths.map((strength) => (
                <p key={strength} className="text-sm text-slate-300">
                  ✓ {strength}
                </p>
              ))
            ) : (
              <p className="text-sm text-slate-500">
                No dominant strengths detected yet.
              </p>
            )}
          </div>
        </div>

        <div className="rounded-2xl border border-amber-500/20 bg-amber-500/5 p-4">
          <p className="text-xs uppercase tracking-wide text-amber-300">
            Watchlist
          </p>

          <div className="mt-3 space-y-2">
            {behaviour.weaknesses.length > 0 ? (
              behaviour.weaknesses.map((weakness) => (
                <p key={weakness} className="text-sm text-slate-300">
                  ⚠ {weakness}
                </p>
              ))
            ) : (
              <p className="text-sm text-slate-500">
                No major weaknesses detected yet.
              </p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}