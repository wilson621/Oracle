import type {
  PredictionProfile,
  PredictionRisk,
} from "@/lib/oracle/prediction/prediction-types";

type PredictionPanelProps = {
  prediction: PredictionProfile;
};

function formatRisk(risk: PredictionRisk) {
  return risk
    .split("_")
    .map((word) => word[0].toUpperCase() + word.slice(1))
    .join(" ");
}

function riskColour(risk: PredictionRisk) {
  switch (risk) {
    case "very_low":
      return "text-emerald-300";
    case "low":
      return "text-cyan-300";
    case "moderate":
      return "text-amber-300";
    case "high":
      return "text-rose-300";
  }
}

function change(value: number) {
  return value >= 0 ? `+${value}` : `${value}`;
}

export default function PredictionPanel({
  prediction,
}: PredictionPanelProps) {
  return (
    <div className="rounded-3xl border border-white/10 bg-white/[0.03] p-6">
      <p className="text-xs uppercase tracking-[0.3em] text-cyan-300">
        Prediction Engine
      </p>

      <div className="mt-4">
        <h3 className="text-3xl font-black text-white">
          Future Projection
        </h3>

        <p className="mt-2 text-sm text-slate-400">
          Prediction Confidence{" "}
          <span className="text-cyan-300">
            {Math.round(prediction.confidence * 100)}%
          </span>
        </p>
      </div>

      <div className="mt-6 grid gap-4 md:grid-cols-3">
        <div className="rounded-2xl border border-white/10 bg-black/30 p-4">
          <p className="text-xs uppercase tracking-wide text-slate-500">
            Combat Rating
          </p>

          <p className="mt-2 text-3xl font-black text-cyan-300">
            {prediction.projectedCombatRating}
          </p>
        </div>

        <div className="rounded-2xl border border-white/10 bg-black/30 p-4">
          <p className="text-xs uppercase tracking-wide text-slate-500">
            Win Chance
          </p>

          <p className="mt-2 text-3xl font-black text-cyan-300">
            {prediction.projectedWinChance}%
          </p>
        </div>

        <div className="rounded-2xl border border-white/10 bg-black/30 p-4">
          <p className="text-xs uppercase tracking-wide text-slate-500">
            Next Tier
          </p>

          <p className="mt-2 text-3xl font-black text-cyan-300">
            {prediction.projectedSessionsToNextTier ?? "--"}
          </p>

          <p className="mt-1 text-xs text-slate-500">
            Sessions
          </p>
        </div>
      </div>

      <div className="mt-6 grid gap-4 md:grid-cols-2">
        <div className="rounded-2xl border border-emerald-500/20 bg-emerald-500/5 p-4">
          <p className="text-xs uppercase tracking-wide text-emerald-300">
            Strongest Future Skill
          </p>

          {prediction.strongestFutureSkill ? (
            <>
              <p className="mt-3 text-lg font-bold text-white">
                {prediction.strongestFutureSkill.skill}
              </p>

              <p className="mt-1 text-sm text-slate-400">
                {prediction.strongestFutureSkill.current}
                {" → "}
                {prediction.strongestFutureSkill.predicted}
              </p>

              <p className="mt-2 text-sm text-emerald-300">
                {change(
                  prediction.strongestFutureSkill.expectedChange
                )}
              </p>
            </>
          ) : (
            <p className="mt-3 text-sm text-slate-500">
              Insufficient prediction history.
            </p>
          )}
        </div>

        <div className="rounded-2xl border border-amber-500/20 bg-amber-500/5 p-4">
          <p className="text-xs uppercase tracking-wide text-amber-300">
            Weakest Future Skill
          </p>

          {prediction.weakestFutureSkill ? (
            <>
              <p className="mt-3 text-lg font-bold text-white">
                {prediction.weakestFutureSkill.skill}
              </p>

              <p className="mt-1 text-sm text-slate-400">
                {prediction.weakestFutureSkill.current}
                {" → "}
                {prediction.weakestFutureSkill.predicted}
              </p>

              <p className="mt-2 text-sm text-amber-300">
                {change(
                  prediction.weakestFutureSkill.expectedChange
                )}
              </p>
            </>
          ) : (
            <p className="mt-3 text-sm text-slate-500">
              Insufficient prediction history.
            </p>
          )}
        </div>
      </div>

      <div className="mt-6 rounded-2xl border border-cyan-500/20 bg-cyan-500/5 p-4">
        <p className="text-xs uppercase tracking-wide text-slate-500">
          Oracle Projection
        </p>

        <p className="mt-3 text-sm leading-6 text-slate-300">
          {prediction.summary}
        </p>
      </div>

      <div className="mt-6 grid gap-4 md:grid-cols-2">
        <div className="rounded-2xl border border-white/10 bg-black/30 p-4">
          <p className="text-xs uppercase tracking-wide text-slate-500">
            Burnout Risk
          </p>

          <p className={`mt-2 text-xl font-bold ${riskColour(prediction.burnoutRisk)}`}>
            {formatRisk(prediction.burnoutRisk)}
          </p>
        </div>

        <div className="rounded-2xl border border-white/10 bg-black/30 p-4">
          <p className="text-xs uppercase tracking-wide text-slate-500">
            Plateau Risk
          </p>

          <p className={`mt-2 text-xl font-bold ${riskColour(prediction.plateauRisk)}`}>
            {formatRisk(prediction.plateauRisk)}
          </p>
        </div>
      </div>
    </div>
  );
}