import type { OracleExplanation } from "@/lib/oracle/explainability";
import { HelpCircle } from "lucide-react";

type OracleExplainabilityCardProps = {
  explanation: OracleExplanation | null;
};

export default function OracleExplainabilityCard({
  explanation,
}: OracleExplainabilityCardProps) {
  return (
    <section className="rounded-3xl border border-white/10 bg-slate-950/70 p-6">
      <div className="flex items-center gap-3">
        <HelpCircle className="text-cyan-300" size={22} />
        <p className="text-xs font-semibold uppercase tracking-[0.25em] text-slate-400">
          Explainability
        </p>
      </div>

      <h3 className="mt-5 text-2xl font-black text-white">
        {explanation?.title ?? "Explanation forming"}
      </h3>

      <p className="mt-3 text-sm text-slate-400">
        {explanation?.conclusion ??
          "Oracle has not produced an explanation yet."}
      </p>

      <p className="mt-5 text-sm text-cyan-300">
        Evidence items: {explanation?.evidence.length ?? 0}
      </p>
    </section>
  );
}