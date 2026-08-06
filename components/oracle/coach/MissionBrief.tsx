type MissionObjective = {
  label: string;
};

type MissionBriefProps = {
  title?: string;
  focusArea?: string;
  summary?: string;
  estimatedCombatGain?: number;
  difficulty?: "Easy" | "Moderate" | "Hard";
  estimatedSessions?: number;
  objectives?: MissionObjective[];
};

export default function MissionBrief({
  title = "Current Mission",
  focusArea = "Improve Positioning",
  summary = "Oracle has identified positioning as the highest-impact improvement area for the next operational cycle.",
  estimatedCombatGain = 4,
  difficulty = "Easy",
  estimatedSessions = 3,
  objectives = [
    { label: "Win 3 gunfights from cover." },
    { label: "Reduce open-area deaths." },
    { label: "Maintain high ground before late rotations." },
  ],
}: MissionBriefProps) {
  return (
    <section className="rounded-3xl border border-cyan-500/20 bg-black/40 p-6 shadow-lg shadow-cyan-500/10">
      <p className="text-xs font-bold uppercase tracking-[0.35em] text-cyan-300">
        Oracle Coach
      </p>

      <div className="mt-5 flex flex-col gap-6 lg:flex-row lg:items-start lg:justify-between">
        <div>
          <p className="text-xs font-bold uppercase tracking-[0.28em] text-slate-400">
            {title}
          </p>

          <h3 className="mt-3 text-4xl font-black text-white">
            {focusArea}
          </h3>

          <p className="mt-4 max-w-2xl text-sm leading-7 text-slate-400">
            {summary}
          </p>
        </div>

        <div className="grid min-w-[280px] gap-3">
          <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-4">
            <p className="text-[11px] font-bold uppercase tracking-[0.25em] text-slate-400">
              Estimated Combat Gain
            </p>

            <p className="mt-2 text-3xl font-black text-cyan-300">
              +{estimatedCombatGain}
            </p>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-4">
              <p className="text-[11px] font-bold uppercase tracking-[0.25em] text-slate-400">
                Difficulty
              </p>

              <p className="mt-2 text-sm font-bold text-slate-200">
                {difficulty}
              </p>
            </div>

            <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-4">
              <p className="text-[11px] font-bold uppercase tracking-[0.25em] text-slate-400">
                Sessions
              </p>

              <p className="mt-2 text-sm font-bold text-slate-200">
                {estimatedSessions}
              </p>
            </div>
          </div>
        </div>
      </div>

      <div className="mt-7 rounded-2xl border border-slate-800 bg-slate-950/70 p-5">
        <p className="text-xs font-bold uppercase tracking-[0.3em] text-cyan-300">
          Mission Objectives
        </p>

        <div className="mt-4 space-y-3">
          {objectives.map((objective) => (
            <div
              key={objective.label}
              className="flex items-center gap-3 rounded-xl border border-white/10 bg-black/30 px-4 py-3"
            >
              <span className="h-3 w-3 rounded-sm border border-cyan-400/60 bg-cyan-400/5" />

              <p className="text-sm font-medium text-slate-300">
                {objective.label}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}