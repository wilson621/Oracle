import type { OracleSignal } from "@/lib/oracle/signals/signal-types";
import { Activity } from "lucide-react";

type OracleSignalFeedProps = {
  signals: OracleSignal[];
  isLoading?: boolean;
};

export default function OracleSignalFeed({
  signals,
  isLoading = false,
}: OracleSignalFeedProps) {
  const highPrioritySignals = signals.filter(
    (signal) =>
      signal.severity === "high" || signal.severity === "critical"
  );

  return (
    <section className="rounded-3xl border border-white/10 bg-slate-950/70 p-6">
      <div className="flex items-center gap-3">
        <Activity className="text-teal-300" size={22} />
        <p className="text-xs font-semibold uppercase tracking-[0.25em] text-slate-400">
          Signal Feed
        </p>
      </div>

      <h3 className="mt-5 text-2xl font-black text-white">
        {highPrioritySignals.length} High Priority Signals
      </h3>

      <div className="mt-5 space-y-4">
        {signals.slice(0, 4).map((signal) => (
          <div
            key={signal.id}
            className="rounded-2xl border border-white/10 bg-white/[0.03] p-4"
          >
            <div className="flex items-center justify-between gap-4">
              <p className="font-semibold text-white">{signal.title}</p>

              <span className="rounded-full border border-teal-400/20 px-3 py-1 text-xs uppercase tracking-[0.2em] text-teal-300">
                {signal.severity}
              </span>
            </div>

            <p className="mt-2 text-sm text-slate-400">
              {signal.summary}
            </p>
          </div>
        ))}

        {!isLoading && signals.length === 0 ? (
          <p className="text-sm text-slate-400">
            Oracle has not emitted any intelligence signals yet.
          </p>
        ) : null}

        {isLoading ? (
          <p className="text-sm text-slate-400">
            Oracle is building the intelligence signal feed.
          </p>
        ) : null}
      </div>
    </section>
  );
}