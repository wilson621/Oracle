import type {
  OracleDecision,
  OracleDecisionEvidence,
} from "@/lib/oracle/intelligence/decision-types";
import {
  BrainCircuit,
  CheckCircle2,
  ListChecks,
  Target,
  TimerReset,
} from "lucide-react";

type OracleDecisionCardProps = {
  decision: OracleDecision | null;
  isLoading?: boolean;
};

function formatConfidence(confidence: number): string {
  return `${Math.round(confidence)}%`;
}

function formatPriority(priority: string): string {
  return priority
    .split("_")
    .map((word) => word[0]?.toUpperCase() + word.slice(1))
    .join(" ");
}

function formatEvidenceValue(evidence: OracleDecisionEvidence): string {
  if (evidence.value !== undefined) {
    return String(evidence.value);
  }

  return evidence.detail ?? "Available";
}

export default function OracleDecisionCard({
  decision,
  isLoading = false,
}: OracleDecisionCardProps) {
  if (isLoading) {
    return (
      <section className="mt-10 rounded-3xl border border-cyan-400/20 bg-cyan-400/5 p-8">
        <p className="text-xs font-semibold uppercase tracking-[0.35em] text-cyan-300">
          Oracle Decision
        </p>
        <h2 className="mt-4 text-3xl font-black text-white">
          Oracle is forming the next best action
        </h2>
        <p className="mt-3 text-sm text-slate-400">
          Decision intelligence will appear once the runtime state has loaded.
        </p>
      </section>
    );
  }

  if (!decision) {
    return (
      <section className="mt-10 rounded-3xl border border-white/10 bg-slate-950/70 p-8">
        <p className="text-xs font-semibold uppercase tracking-[0.35em] text-slate-400">
          Oracle Decision
        </p>
        <h2 className="mt-4 text-3xl font-black text-white">
          No decision available yet
        </h2>
        <p className="mt-3 text-sm text-slate-400">
          Oracle has not produced a decision from the current intelligence
          state.
        </p>
      </section>
    );
  }

  const primaryEvidence = decision.evidence[0];

  return (
    <section className="mt-10 rounded-3xl border border-cyan-400/30 bg-cyan-400/10 p-8 shadow-[0_0_45px_rgba(34,211,238,0.08)]">
      <div className="flex flex-col gap-6 xl:flex-row xl:items-start xl:justify-between">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.35em] text-cyan-300">
            Oracle Decision
          </p>

          <h2 className="mt-4 text-4xl font-black text-white">
            {decision.title}
          </h2>

          <p className="mt-4 max-w-3xl text-lg text-slate-300">
            {decision.recommendation}
          </p>

          <p className="mt-4 max-w-3xl text-sm text-slate-400">
            {decision.summary}
          </p>
        </div>

        <div className="rounded-2xl border border-cyan-400/20 bg-slate-950/70 px-5 py-4">
          <p className="text-xs uppercase tracking-[0.25em] text-slate-400">
            Priority
          </p>
          <p className="mt-2 text-2xl font-black text-cyan-300">
            {formatPriority(decision.priority)}
          </p>
        </div>
      </div>

      <div className="mt-8 grid gap-4 md:grid-cols-3">
        <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-5">
          <div className="flex items-center gap-3">
            <BrainCircuit className="text-cyan-300" size={20} />
            <p className="text-xs uppercase tracking-[0.25em] text-slate-400">
              Confidence
            </p>
          </div>
          <p className="mt-3 text-2xl font-black text-white">
            {formatConfidence(decision.confidence)}
          </p>
        </div>

        <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-5">
          <div className="flex items-center gap-3">
            <Target className="text-cyan-300" size={20} />
            <p className="text-xs uppercase tracking-[0.25em] text-slate-400">
              Expected Outcome
            </p>
          </div>
          <p className="mt-3 text-sm text-slate-300">
            {decision.expectedOutcome}
          </p>
        </div>

        <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-5">
          <div className="flex items-center gap-3">
            <TimerReset className="text-cyan-300" size={20} />
            <p className="text-xs uppercase tracking-[0.25em] text-slate-400">
              Reassessment
            </p>
          </div>
          <p className="mt-3 text-sm text-slate-300">
            {decision.reassessmentTrigger}
          </p>
        </div>
      </div>

      <div className="mt-6 grid gap-4 xl:grid-cols-2">
        <div className="rounded-2xl border border-white/10 bg-slate-950/60 p-5">
          <div className="flex items-center gap-3">
            <CheckCircle2 className="text-cyan-300" size={20} />
            <p className="text-xs uppercase tracking-[0.25em] text-slate-400">
              Why Oracle chose this
            </p>
          </div>

          <p className="mt-3 text-sm text-slate-300">
            {primaryEvidence
              ? `${primaryEvidence.label}: ${formatEvidenceValue(
                  primaryEvidence
                )}`
              : decision.summary}
          </p>
        </div>

        <div className="rounded-2xl border border-white/10 bg-slate-950/60 p-5">
          <div className="flex items-center gap-3">
            <ListChecks className="text-cyan-300" size={20} />
            <p className="text-xs uppercase tracking-[0.25em] text-slate-400">
              Evidence Considered
            </p>
          </div>

          <div className="mt-4 space-y-3">
            {decision.evidence.length > 0 ? (
              decision.evidence.map((evidence) => (
                <div
                  key={`${evidence.label}-${formatEvidenceValue(evidence)}`}
                  className="rounded-xl border border-white/10 bg-white/[0.03] px-4 py-3"
                >
                  <p className="text-sm font-semibold text-white">
                    {evidence.label}
                  </p>
                  <p className="mt-1 text-xs text-slate-400">
                    {formatEvidenceValue(evidence)}
                  </p>
                  {evidence.detail ? (
                    <p className="mt-1 text-xs text-slate-400">
                      {evidence.detail}
                    </p>
                  ) : null}
                </div>
              ))
            ) : (
              <p className="text-sm text-slate-400">
                Oracle did not attach detailed evidence to this decision.
              </p>
            )}
          </div>
        </div>
      </div>
    </section>
  );
}