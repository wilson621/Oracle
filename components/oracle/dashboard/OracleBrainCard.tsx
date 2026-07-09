import type { OracleBrainGraphReport } from "@/lib/oracle/brain";
import { GitBranch } from "lucide-react";

type OracleBrainCardProps = {
  brain: OracleBrainGraphReport | null;
};

function formatConfidence(confidence: number): string {
  return `${Math.round(confidence * 100)}%`;
}

export default function OracleBrainCard({ brain }: OracleBrainCardProps) {
  return (
    <section className="rounded-3xl border border-white/10 bg-slate-950/70 p-6">
      <div className="flex items-center gap-3">
        <GitBranch className="text-cyan-300" size={22} />
        <p className="text-xs font-semibold uppercase tracking-[0.25em] text-slate-500">
          Brain Graph
        </p>
      </div>

      <h3 className="mt-5 text-2xl font-black text-white">
        {brain?.findingCount ?? 0} Findings
      </h3>

      <p className="mt-3 text-sm text-slate-400">
        {brain?.summary ?? "Oracle Brain is waiting for graph intelligence."}
      </p>

      <p className="mt-5 text-sm text-cyan-300">
        Confidence: {brain ? formatConfidence(brain.confidence) : "Loading"}
      </p>
    </section>
  );
}