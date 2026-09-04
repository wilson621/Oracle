import type { PredictionRisk } from "@/lib/oracle/prediction/prediction-types";

type RiskBadgeProps = {
  label: string;
  risk: PredictionRisk;
};

function formatRisk(risk: PredictionRisk) {
  return risk
    .split("_")
    .map((word) => word[0].toUpperCase() + word.slice(1))
    .join(" ");
}

function riskStyles(risk: PredictionRisk) {
  switch (risk) {
    case "very_low":
      return {
        dot: "bg-emerald-300",
        text: "text-emerald-300",
        border: "border-emerald-500/25 bg-emerald-500/5",
      };
    case "low":
      return {
        dot: "bg-teal-300",
        text: "text-teal-300",
        border: "border-teal-500/25 bg-teal-500/5",
      };
    case "moderate":
      return {
        dot: "bg-amber-300",
        text: "text-amber-300",
        border: "border-amber-500/25 bg-amber-500/5",
      };
    case "high":
      return {
        dot: "bg-rose-300",
        text: "text-rose-300",
        border: "border-rose-500/25 bg-rose-500/5",
      };
  }
}

export default function RiskBadge({ label, risk }: RiskBadgeProps) {
  const styles = riskStyles(risk);

  return (
    <div className={`rounded-2xl border p-4 ${styles.border}`}>
      <div className="flex items-center gap-2">
        <span className={`h-2.5 w-2.5 rounded-full ${styles.dot}`} />

        <p className="text-xs uppercase tracking-wide text-slate-400">
          {label}
        </p>
      </div>

      <p className={`mt-3 text-2xl font-black ${styles.text}`}>
        {formatRisk(risk)}
      </p>
    </div>
  );
}