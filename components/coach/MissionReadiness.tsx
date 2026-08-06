import type {
  MissionReadiness as MissionReadinessType,
  OracleMission,
} from "@/lib/oracle/missions";
import {
  getMissionStatusBorder,
  getMissionStatusColour,
  getMissionStatusLabel,
  type MissionStatus,
} from "@/lib/oracle/missions";
import {
  classifyMission,
  getMissionClassificationColour,
  getMissionClassificationLabel,
} from "@/lib/oracle/missions";

type MissionReadinessProps = {
  mission: OracleMission;
  readiness: MissionReadinessType;
  progress?: number;
  status?: MissionStatus;
};

export default function MissionReadiness({
  mission,
  readiness,
  progress = 0,
  status = "active",
}: MissionReadinessProps) {
  const combatGain =
    readiness.projectedCombatRating - readiness.currentCombatRating;

  const classification = classifyMission(readiness.currentCombatRating);

  return (
    <section className="rounded-3xl border border-white/10 bg-white/[0.03] p-6">
      <div className="flex flex-col gap-6 lg:flex-row lg:items-start lg:justify-between">
        <div>
          <p className="text-xs font-bold uppercase tracking-[0.35em] text-cyan-300">
            Mission Control
          </p>

          <h3 className="mt-4 text-4xl font-black text-white">
            {mission.title}
          </h3>

          <p className="mt-4 max-w-2xl text-sm leading-7 text-slate-400">
            {mission.summary}
          </p>
        </div>

        <div
          className={`rounded-2xl border bg-cyan-400/5 px-5 py-4 text-right ${getMissionStatusBorder(
            status
          )}`}
        >
          <p className="text-[10px] font-bold uppercase tracking-[0.28em] text-slate-400">
            Mission Status
          </p>

          <p
            className={`mt-2 text-3xl font-black uppercase ${getMissionStatusColour(
              status
            )}`}
          >
            {getMissionStatusLabel(status)}
          </p>

          <div className="mx-auto mt-4 h-px w-20 bg-white/10" />

          <p className="mt-4 text-[10px] font-bold uppercase tracking-[0.28em] leading-5 text-slate-400">
            Mission
            <br />
            Classification
          </p>

          <p
            className={`mt-2 text-lg font-black uppercase tracking-wide ${getMissionClassificationColour(
              classification
            )}`}
          >
            {getMissionClassificationLabel(classification)}
          </p>
        </div>
      </div>

      <div className="mt-5 grid gap-4 md:grid-cols-2">
        <div className="rounded-2xl border border-cyan-500/20 bg-cyan-500/5 p-5">
          <p className="text-xs font-bold uppercase tracking-[0.28em] text-cyan-300">
            Mission Source
          </p>

          <p className="mt-3 text-xl font-black uppercase text-white">
            {mission.source}
          </p>

          <p className="mt-2 text-sm text-slate-400">
            Confidence: {Math.round(mission.confidence * 100)}%
          </p>
        </div>

        <div className="rounded-2xl border border-white/10 bg-black/30 p-5">
          <p className="text-xs font-bold uppercase tracking-[0.28em] text-slate-400">
            Difficulty
          </p>

          <p className="mt-3 text-xl font-black text-white">
            {mission.difficulty}
          </p>
        </div>
      </div>

      <div className="mt-7 grid gap-4 md:grid-cols-2">
        <div className="rounded-2xl border border-white/10 bg-black/30 p-5">
          <p className="text-xs font-bold uppercase tracking-[0.28em] text-slate-400">
            Primary Focus
          </p>

          <p className="mt-3 text-3xl font-black text-white">
            {readiness.focus}
          </p>
        </div>

        <div className="rounded-2xl border border-white/10 bg-black/30 p-5">
          <p className="text-xs font-bold uppercase tracking-[0.28em] text-slate-400">
            Current Strength
          </p>

          <p className="mt-3 text-3xl font-black text-white">
            {readiness.strength}
          </p>
        </div>
      </div>

      <div className="mt-4 grid gap-4 md:grid-cols-3">
        <div className="rounded-2xl border border-white/10 bg-black/30 p-5">
          <p className="text-xs font-bold uppercase tracking-[0.28em] text-slate-400">
            Combat Rating
          </p>

          <p className="mt-3 text-3xl font-black text-cyan-300">
            {readiness.currentCombatRating} → {readiness.projectedCombatRating}
          </p>

          <p className="mt-2 text-sm font-bold text-emerald-300">
            +{combatGain} projected
          </p>
        </div>

        <div className="rounded-2xl border border-white/10 bg-black/30 p-5">
          <p className="text-xs font-bold uppercase tracking-[0.28em] text-slate-400">
            Prediction Confidence
          </p>

          <p className="mt-3 text-3xl font-black text-cyan-300">
            {readiness.confidence}%
          </p>
        </div>

        <div className="rounded-2xl border border-white/10 bg-black/30 p-5">
          <p className="text-xs font-bold uppercase tracking-[0.28em] text-slate-400">
            Estimated Sessions
          </p>

          <p className="mt-3 text-3xl font-black text-cyan-300">
            {readiness.estimatedSessions}
          </p>
        </div>
      </div>

      <div className="mt-6 rounded-2xl border border-slate-800 bg-slate-950/70 p-5">
        <div className="flex items-center justify-between gap-4">
          <div>
            <p className="text-xs font-bold uppercase tracking-[0.28em] text-cyan-300">
              Mission Completion
            </p>

            <p className="mt-1 text-xs font-semibold uppercase tracking-[0.22em] text-slate-400">
              Objectives Complete
            </p>
          </div>

          <p className="text-3xl font-black text-cyan-300">{progress}%</p>
        </div>

        <div className="mt-4 h-3 overflow-hidden rounded-full bg-slate-800">
          <div
            className="h-full rounded-full bg-cyan-400 shadow-[0_0_12px_rgba(34,211,238,0.45)] transition-all duration-700"
            style={{ width: `${progress}%` }}
          />
        </div>

        <div className="mt-5 grid gap-3">
          {mission.objectives.map((objective) => (
            <div
              key={objective.label}
              className="flex items-center gap-3 rounded-xl border border-white/10 bg-black/30 px-4 py-3"
            >
              <span className="h-3 w-3 rounded-sm border border-cyan-400/50 bg-cyan-400/5" />

              <p className="text-sm font-medium text-slate-300">
                {objective.label}
              </p>
            </div>
          ))}
        </div>
      </div>

      <div className="mt-5 grid gap-4 md:grid-cols-2">
        <div className="rounded-2xl border border-white/10 bg-black/30 p-5">
          <p className="text-xs font-bold uppercase tracking-[0.28em] text-slate-400">
            Mission Reward
          </p>

          <p className="mt-3 text-3xl font-black text-cyan-300">
            +{mission.rewardXp} XP
          </p>
        </div>

        <div className="rounded-2xl border border-cyan-500/20 bg-cyan-500/5 p-5">
          <p className="text-xs font-bold uppercase tracking-[0.28em] text-cyan-300">
            Oracle Assessment
          </p>

          <p className="mt-3 text-sm font-semibold leading-7 text-slate-200">
            Oracle predicts this operation will increase combat efficiency by
            approximately {combatGain} points if all mission objectives are
            completed before the next assessment cycle.
          </p>
        </div>
      </div>
    </section>
  );
}