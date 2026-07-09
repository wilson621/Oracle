import type { PlannerResult } from "@/lib/oracle/planner";
import { Target } from "lucide-react";

type OraclePlannerCardProps = {
  planner: PlannerResult | null;
};

function formatPriority(priority: string): string {
  return priority
    .split("_")
    .map((word) => word[0]?.toUpperCase() + word.slice(1))
    .join(" ");
}

export default function OraclePlannerCard({
  planner,
}: OraclePlannerCardProps) {
  const recommendation = planner?.profile.recommendation;

  return (
    <section className="rounded-3xl border border-white/10 bg-slate-950/70 p-6">
      <div className="flex items-center gap-3">
        <Target className="text-cyan-300" size={22} />
        <p className="text-xs font-semibold uppercase tracking-[0.25em] text-slate-500">
          Planner
        </p>
      </div>

      <h3 className="mt-5 text-2xl font-black text-white">
        {recommendation
          ? formatPriority(recommendation.priority)
          : "Forming"}
      </h3>

      <p className="mt-3 text-sm text-slate-400">
        {recommendation?.reason ??
          "Oracle Planner is forming the next priority."}
      </p>

      <p className="mt-5 text-sm text-cyan-300">
        Confidence: {recommendation?.confidence ?? "Loading"}
      </p>
    </section>
  );
}