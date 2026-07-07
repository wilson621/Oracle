import type { OracleBrainReport } from "@/lib/oracle/oracle-brain-types";
import type { PredictionRisk } from "@/lib/oracle/prediction/prediction-types";
import { AlertTriangle, ShieldAlert, Target, Activity } from "lucide-react";

type RiskPanelProps = {
  report: OracleBrainReport;
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

function riskBorder(risk: PredictionRisk) {
  switch (risk) {
    case "very_low":
      return "border-emerald-500/20 bg-emerald-500/5";
    case "low":
      return "border-cyan-500/20 bg-cyan-500/5";
    case "moderate":
      return "border-amber-500/20 bg-amber-500/5";
    case "high":
      return "border-rose-500/20 bg-rose-500/5";
  }
}

function getPrimaryRisk(report: OracleBrainReport) {
  if (report.prediction.plateauRisk === "high") {
    return {
      title: "Performance Plateau Detected",
      description:
        "Prediction Engine indicates the operator is at elevated risk of stalling without a focused training adjustment.",
    };
  }

  if (report.trend.sharpestDecline) {
    return {
      title: `${report.trend.sharpestDecline.skill} Decline Detected`,
      description:
        "Trend Engine has detected negative movement in this skill across recent Oracle Sessions.",
    };
  }

  if (report.prediction.weakestFutureSkill) {
    return {
      title: `${report.prediction.weakestFutureSkill.skill} Exposure`,
      description:
        "Prediction Engine identifies this as the weakest projected future skill based on current intelligence.",
    };
  }

  if (report.behaviour.weaknesses.length > 0) {
    return {
      title: `${report.behaviour.weaknesses[0]} Weakness`,
      description:
        "Behaviour Engine has detected this as the clearest current vulnerability in the operator profile.",
    };
  }

  return {
    title: "Risk Profile Stable",
    description:
      "Oracle has not detected a dominant performance threat. Continue building session history to increase precision.",
  };
}

export default function RiskPanel({ report }: RiskPanelProps) {
  const primaryRisk = getPrimaryRisk(report);
  const confidence = Math.round(report.confidence * 100);

  return (
    <div className="rounded-3xl border border-rose-500/20 bg-black/40 p-6 shadow-lg shadow-rose-500/10">
      <div className="flex items-start gap-4">
        <div className="rounded-2xl border border-rose-500/20 bg-rose-500/10 p-3">
          <ShieldAlert className="text-rose-300" size={24} />
        </div>

        <div>
          <p className="text-xs uppercase tracking-[0.3em] text-rose-300">
            Risk Intelligence
          </p>

          <h3 className="mt-3 text-3xl font-black text-white">
            Threat Assessment
          </h3>

          <p className="mt-3 max-w-3xl text-sm leading-6 text-slate-400">
            Oracle has analysed behavioural signals, trend movement and future
            projections to identify the most important performance risks.
          </p>
        </div>
      </div>

      <div className="mt-6 rounded-2xl border border-white/10 bg-white/[0.03] p-5">
        <div className="flex items-start gap-4">
          <AlertTriangle className="mt-1 text-amber-300" size={22} />

          <div>
            <p className="text-xs uppercase tracking-wide text-slate-500">
              Primary Threat
            </p>

            <h4 className="mt-2 text-xl font-black text-white">
              {primaryRisk.title}
            </h4>

            <p className="mt-2 text-sm leading-6 text-slate-400">
              {primaryRisk.description}
            </p>
          </div>
        </div>
      </div>

      <div className="mt-6 grid gap-4 md:grid-cols-3">
        <div
          className={`rounded-2xl border p-4 ${riskBorder(
            report.prediction.plateauRisk
          )}`}
        >
          <p className="text-xs uppercase tracking-wide text-slate-500">
            Plateau Risk
          </p>

          <p
            className={`mt-2 text-2xl font-black ${riskColour(
              report.prediction.plateauRisk
            )}`}
          >
            {formatRisk(report.prediction.plateauRisk)}
          </p>
        </div>

        <div
          className={`rounded-2xl border p-4 ${riskBorder(
            report.prediction.burnoutRisk
          )}`}
        >
          <p className="text-xs uppercase tracking-wide text-slate-500">
            Burnout Risk
          </p>

          <p
            className={`mt-2 text-2xl font-black ${riskColour(
              report.prediction.burnoutRisk
            )}`}
          >
            {formatRisk(report.prediction.burnoutRisk)}
          </p>
        </div>

        <div className="rounded-2xl border border-cyan-500/20 bg-cyan-500/5 p-4">
          <p className="text-xs uppercase tracking-wide text-slate-500">
            Assessment Confidence
          </p>

          <p className="mt-2 text-2xl font-black text-cyan-300">
            {confidence}%
          </p>
        </div>
      </div>

      <div className="mt-6 grid gap-4 md:grid-cols-2">
        <div className="rounded-2xl border border-white/10 bg-black/30 p-4">
          <div className="flex items-center gap-3">
            <Target className="text-amber-300" size={20} />

            <p className="text-xs uppercase tracking-wide text-slate-500">
              Skill Exposure
            </p>
          </div>

          <p className="mt-3 text-lg font-bold text-white">
            {report.prediction.weakestFutureSkill?.skill ??
              report.trend.sharpestDecline?.skill ??
              "No critical exposure"}
          </p>

          <p className="mt-2 text-sm leading-6 text-slate-400">
            {report.prediction.weakestFutureSkill
              ? "Prediction Engine expects this skill to create the largest future performance drag."
              : report.trend.sharpestDecline
                ? "Trend Engine detected this as the sharpest recent decline."
                : "No dominant skill risk has been detected yet."}
          </p>
        </div>

        <div className="rounded-2xl border border-white/10 bg-black/30 p-4">
          <div className="flex items-center gap-3">
            <Activity className="text-cyan-300" size={20} />

            <p className="text-xs uppercase tracking-wide text-slate-500">
              Recommended Response
            </p>
          </div>

          <p className="mt-3 text-lg font-bold text-white">
            {report.nextFocus}
          </p>

          <p className="mt-2 text-sm leading-6 text-slate-400">
            Oracle recommends focusing the next review cycle on the highest
            value correction point.
          </p>
        </div>
      </div>
    </div>
  );
}