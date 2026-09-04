import StatusCard from "@/components/ui/StatusCard";
import type { OracleBrainReport } from "@/lib/oracle/oracle-brain-types";
import { AlertTriangle, ShieldAlert, Target, Activity } from "lucide-react";

type RiskPanelProps = {
  report: OracleBrainReport;
};

function confidenceLabel(confidence: number) {
  const percentage = Math.round(confidence * 100);

  if (percentage >= 75) return "Reliable Assessment";
  if (percentage >= 50) return "Developing Assessment";
  return "Low Sample Confidence";
}

function getPrimaryRisk(report: OracleBrainReport) {
  if (report.prediction.plateauRisk === "high") {
    return {
      title: "Performance Plateau Detected",
      severity: "High",
      description:
        "Prediction Engine indicates elevated plateau risk. Oracle recommends immediate training adjustment before performance momentum stalls.",
    };
  }

  if (report.trend.sharpestDecline) {
    return {
      title: `${report.trend.sharpestDecline.skill} Decline Detected`,
      severity: "Moderate",
      description:
        "Trend Engine has detected negative movement in this skill across recent Oracle Sessions.",
    };
  }

  if (report.prediction.weakestFutureSkill) {
    return {
      title: `${report.prediction.weakestFutureSkill.skill} Exposure`,
      severity: "Moderate",
      description:
        "Prediction Engine identifies this as the weakest projected future skill based on current intelligence.",
    };
  }

  if (report.behaviour.weaknesses.length > 0) {
    return {
      title: `${report.behaviour.weaknesses[0]} Weakness`,
      severity: "Moderate",
      description:
        "Behaviour Engine has detected this as the clearest current vulnerability in the operator profile.",
    };
  }

  return {
    title: "Risk Profile Stable",
    severity: "Low",
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
        <div className="rounded-2xl border border-rose-500/20 bg-rose-500/10 p-3 shadow-lg shadow-rose-500/10">
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
            Oracle has identified the most significant threats to future
            operator performance based on behavioural, trend and prediction
            intelligence.
          </p>
        </div>
      </div>

      <div className="mt-8 rounded-2xl border border-amber-500/20 bg-amber-500/5 p-5">
        <div className="flex items-start gap-4">
          <div className="rounded-xl border border-amber-500/20 bg-amber-500/10 p-3">
            <AlertTriangle className="text-amber-300" size={24} />
          </div>

          <div className="flex-1">
            <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
              <p className="text-xs uppercase tracking-wide text-slate-400">
                Primary Threat
              </p>

              <span className="w-fit rounded-full border border-amber-500/20 bg-amber-500/10 px-3 py-1 text-xs font-bold uppercase tracking-wide text-amber-300">
                Severity: {primaryRisk.severity}
              </span>
            </div>

            <h4 className="mt-3 text-2xl font-black text-white">
              {primaryRisk.title}
            </h4>

            <p className="mt-3 text-sm leading-6 text-slate-400">
              {primaryRisk.description}
            </p>
          </div>
        </div>
      </div>

      <div className="mt-6 grid gap-4 md:grid-cols-3">
        <StatusCard
  label="Plateau Risk"
  risk={report.prediction.plateauRisk}
/>

        <StatusCard
  label="Burnout Risk"
  risk={report.prediction.burnoutRisk}
/>

        <div className="rounded-2xl border border-teal-500/20 bg-teal-500/5 p-4">
          <p className="text-xs uppercase tracking-wide text-slate-400">
            Assessment Confidence
          </p>

          <p className="mt-3 text-2xl font-black text-teal-300">
            {confidence}%
          </p>

          <p className="mt-1 text-xs font-semibold uppercase tracking-wide text-teal-200/80">
            {confidenceLabel(report.confidence)}
          </p>
        </div>
      </div>

      <div className="mt-6 grid gap-4 md:grid-cols-2">
        <div className="rounded-2xl border border-white/10 bg-black/30 p-4">
          <div className="flex items-center gap-3">
            <Target className="text-amber-300" size={20} />

            <p className="text-xs uppercase tracking-wide text-slate-400">
              Skill Exposure
            </p>
          </div>

          <p className="mt-4 text-lg font-bold text-white">
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
            <Activity className="text-teal-300" size={20} />

            <p className="text-xs uppercase tracking-wide text-slate-400">
              Recommended Response
            </p>
          </div>

          <p className="mt-4 text-lg font-bold text-white">
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