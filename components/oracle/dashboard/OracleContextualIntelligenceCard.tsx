import type { OracleIntelligenceState } from "@/lib/oracle/state";
import { Compass, Layers3, Lightbulb, Radar } from "lucide-react";

type OracleContextualIntelligenceCardProps = {
  state: OracleIntelligenceState | null;
  isLoading?: boolean;
};

function formatIntent(intent: string): string {
  return intent
    .split("_")
    .map((word) => word[0]?.toUpperCase() + word.slice(1))
    .join(" ");
}

function formatConfidence(confidence: number): string {
  return `${Math.round(confidence * 100)}%`;
}

export default function OracleContextualIntelligenceCard({
  state,
  isLoading = false,
}: OracleContextualIntelligenceCardProps) {
  if (isLoading) {
    return (
      <section className="rounded-3xl border border-teal-400/20 bg-teal-400/5 p-6">
        <p className="text-xs font-semibold uppercase tracking-[0.3em] text-teal-300">
          Contextual Intelligence
        </p>
        <h2 className="mt-3 text-2xl font-black text-white">
          Oracle is resolving Operator context
        </h2>
        <p className="mt-3 text-sm text-slate-400">
          Contextual insight will appear once the intelligence state has loaded.
        </p>
      </section>
    );
  }

  if (!state) {
    return (
      <section className="rounded-3xl border border-white/10 bg-slate-950/70 p-6">
        <p className="text-xs font-semibold uppercase tracking-[0.3em] text-slate-400">
          Contextual Intelligence
        </p>
        <h2 className="mt-3 text-2xl font-black text-white">
          No contextual state available
        </h2>
        <p className="mt-3 text-sm text-slate-400">
          Oracle has not received enough runtime state to display contextual
          intelligence.
        </p>
      </section>
    );
  }

  const contextualSignal = state.signals.find(
    (signal) => signal.category === "context"
  );

  const contextualDecision = state.decisions.find(
    (decision) => decision.category === "context"
  );

  const intent = state.context.contextual.intent;
  const opportunityCount = state.context.contextual.opportunities.length;
  const priorityCount = state.context.contextual.priorities.length;

  return (
    <section className="rounded-3xl border border-teal-400/20 bg-slate-950/70 p-6">
      <div className="flex items-start justify-between gap-4">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.3em] text-teal-300">
            Contextual Intelligence
          </p>

          <h2 className="mt-3 text-2xl font-black text-white">
            {formatIntent(intent)} Intent
          </h2>

          <p className="mt-3 text-sm text-slate-400">
            {contextualSignal?.summary ??
              "Oracle is monitoring Operator context for stronger intent signals."}
          </p>
        </div>

        <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl border border-teal-400/30 bg-teal-400/10">
          <Compass className="text-teal-300" size={24} />
        </div>
      </div>

      <div className="mt-6 grid gap-4 md:grid-cols-3">
        <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-4">
          <div className="flex items-center gap-3">
            <Radar className="text-teal-300" size={18} />
            <p className="text-xs uppercase tracking-[0.25em] text-slate-400">
              Confidence
            </p>
          </div>
          <p className="mt-3 text-xl font-black text-white">
            {contextualSignal
              ? formatConfidence(contextualSignal.confidence)
              : "Pending"}
          </p>
        </div>

        <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-4">
          <div className="flex items-center gap-3">
            <Lightbulb className="text-teal-300" size={18} />
            <p className="text-xs uppercase tracking-[0.25em] text-slate-400">
              Opportunities
            </p>
          </div>
          <p className="mt-3 text-xl font-black text-white">
            {opportunityCount}
          </p>
        </div>

        <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-4">
          <div className="flex items-center gap-3">
            <Layers3 className="text-teal-300" size={18} />
            <p className="text-xs uppercase tracking-[0.25em] text-slate-400">
              Priorities
            </p>
          </div>
          <p className="mt-3 text-xl font-black text-white">
            {priorityCount}
          </p>
        </div>
      </div>

      <div className="mt-5 rounded-2xl border border-white/10 bg-white/[0.03] p-4">
        <p className="text-xs uppercase tracking-[0.25em] text-slate-400">
          Contextual Recommendation
        </p>

        <p className="mt-3 text-sm text-slate-300">
          {contextualDecision?.recommendation ??
            "Oracle has not produced a contextual recommendation yet."}
        </p>
      </div>
    </section>
  );
}