import type { OracleTimeline } from "@/lib/oracle/timeline";
import { CalendarClock } from "lucide-react";

type OracleTimelineCardProps = {
  timeline: OracleTimeline | null;
  signalCount?: number;
};

export default function OracleTimelineCard({
  timeline,
  signalCount = 0,
}: OracleTimelineCardProps) {
  const highPriorityEvents =
    timeline?.events.filter(
      (event) => event.severity === "high" || event.severity === "critical"
    ) ?? [];

  return (
    <section className="rounded-3xl border border-white/10 bg-slate-950/70 p-6">
      <div className="flex items-center gap-3">
        <CalendarClock className="text-teal-300" size={22} />
        <p className="text-xs font-semibold uppercase tracking-[0.25em] text-slate-400">
          Timeline
        </p>
      </div>

      <h3 className="mt-5 text-2xl font-black text-white">
        {timeline?.eventCount ?? 0} Events
      </h3>

      <p className="mt-3 text-sm text-slate-400">
        {highPriorityEvents.length > 0
          ? `${highPriorityEvents.length} high-priority developments require attention.`
          : "No high-priority timeline events currently detected."}
      </p>

      <p className="mt-5 text-sm text-teal-300">
        Signals included: {signalCount}
      </p>
    </section>
  );
}