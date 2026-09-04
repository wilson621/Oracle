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
      return "text-teal-300";
    case "moderate":
      return "text-amber-300";
    case "high":
      return "text-rose-300";
  }
}

function change(value: number) {
  return value >= 0 ? `+${value}` : `${value}`;
}

function getProjectionStatus(confidence: number) {
  const percentage = Math.round(confidence * 100);

  if (percentage >= 75) return "Reliable projection";
  if (percentage >= 50) return "Developing projection";
  return "Limited projection";
}

function getOperatorPriority(prediction: PredictionProfile) {
  if (prediction.weakestFutureSkill) {
    return `Prioritise ${prediction.weakestFutureSkill.skill} before pushing for higher-risk engagements.`;
  }

  return "Complete additional Oracle Sessions to improve prediction accuracy.";
}

export default function PredictionPanel({
  prediction,
}: PredictionPanelProps) {
  const confidence = Math.round(prediction.confidence * 100);

  return (
    <div className="rounded-3xl border border-white/10 bg-white/[0.03] p-6">
      <div className="flex flex-col gap-5 md:flex-row md:items-start md:justify-between">
        <div>
          <p className="text-xs font-bold uppercase tracking-[0.35em] text-teal-300">
            Prediction Engine
          </p>

          <h3 className="mt-4 text-4xl font-black text-white">
            Future Projection
          </h3>

          <p className="mt-3 max-w-2xl text-sm leading-7 text-slate-400">
            {prediction.summary}
          </p>
        </div>

        <div className="rounded-2xl border border-teal-400/20 bg-teal-400/5 px-5 py-4 text-right">
          <p className="text-[10px] font-bold uppercase tracking-[0.28em] text-slate-400">
            Prediction Confidence
          </p>

          <div className="mt-2 text-3xl font-black text-teal-300">
            {confidence}%
          </div>

          <p className="mt-1 text-xs font-semibold text-teal-200">
            {getProjectionStatus(prediction.confidence)}
          </p>
        </div>
      </div>

      <div className="mt-7 grid gap-4 md:grid-cols-3">
        <div className="rounded-2xl border border-white/10 bg-black/30 p-4">
          <p className="text-xs font-bold uppercase tracking-[0.24em] text-slate-400">
            Projected Combat Rating
          </p>

          <p className="mt-3 text-4xl font-black text-teal-300">
            {prediction.projectedCombatRating}
          </p>
        </div>

        <div className="rounded-2xl border border-white/10 bg-black/30 p-4">
          <p className="text-xs font-bold uppercase tracking-[0.24em] text-slate-400">
            Projected Success Rate
          </p>

          <p className="mt-3 text-4xl font-black text-teal-300">
            {prediction.projectedWinChance}%
          </p>
        </div>

        <div className="rounded-2xl border border-white/10 bg-black/30 p-4">
          <p className="text-xs font-bold uppercase tracking-[0.24em] text-slate-400">
            Sessions To Next Tier
          </p>

          <p className="mt-3 text-4xl font-black text-teal-300">
            {prediction.projectedSessionsToNextTier ?? "--"}
          </p>
        </div>
      </div>

      <div className="mt-5 grid gap-4 md:grid-cols-2">
        <div className="rounded-2xl border border-emerald-500/20 bg-emerald-500/5 p-4">
          <p className="text-xs font-bold uppercase tracking-[0.24em] text-emerald-300">
            Positive Projection
          </p>

          {prediction.strongestFutureSkill ? (
            <>
              <p className="mt-3 text-xl font-black text-white">
                {prediction.strongestFutureSkill.skill}
              </p>

              <p className="mt-2 text-sm text-slate-400">
                {prediction.strongestFutureSkill.current}
                {" → "}
                {prediction.strongestFutureSkill.predicted}
              </p>

              <p className="mt-2 text-sm font-bold text-emerald-300">
                {change(prediction.strongestFutureSkill.expectedChange)} points
              </p>
            </>
          ) : (
            <p className="mt-3 text-sm text-slate-400">
              Insufficient prediction history.
            </p>
          )}
        </div>

        <div className="rounded-2xl border border-amber-500/20 bg-amber-500/5 p-4">
          <p className="text-xs font-bold uppercase tracking-[0.24em] text-amber-300">
            Priority Projection
          </p>

          {prediction.weakestFutureSkill ? (
            <>
              <p className="mt-3 text-xl font-black text-white">
                {prediction.weakestFutureSkill.skill}
              </p>

              <p className="mt-2 text-sm text-slate-400">
                {prediction.weakestFutureSkill.current}
                {" → "}
                {prediction.weakestFutureSkill.predicted}
              </p>

              <p className="mt-2 text-sm font-bold text-amber-300">
                {change(prediction.weakestFutureSkill.expectedChange)} points
              </p>
            </>
          ) : (
            <p className="mt-3 text-sm text-slate-400">
              Insufficient prediction history.
            </p>
          )}
        </div>
      </div>

      <div className="mt-5 grid gap-4 md:grid-cols-2">
        <div className="rounded-2xl border border-white/10 bg-black/30 p-4">
          <p className="text-xs font-bold uppercase tracking-[0.24em] text-slate-400">
            Burnout Risk
          </p>

          <p
            className={`mt-2 text-xl font-black ${riskColour(
              prediction.burnoutRisk
            )}`}
          >
            {formatRisk(prediction.burnoutRisk)}
          </p>
        </div>

        <div className="rounded-2xl border border-white/10 bg-black/30 p-4">
          <p className="text-xs font-bold uppercase tracking-[0.24em] text-slate-400">
            Plateau Risk
          </p>

          <p
            className={`mt-2 text-xl font-black ${riskColour(
              prediction.plateauRisk
            )}`}
          >
            {formatRisk(prediction.plateauRisk)}
          </p>
        </div>
      </div>

      <div className="mt-5 rounded-2xl border border-teal-500/20 bg-teal-500/5 p-5">
        <p className="text-xs font-bold uppercase tracking-[0.28em] text-teal-300">
          Operator Priority
        </p>

        <p className="mt-3 text-sm font-semibold leading-7 text-slate-200">
          {getOperatorPriority(prediction)}
        </p>
      </div>
    </div>
  );
}