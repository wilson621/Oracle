import type { OracleTimeline } from "./timeline-types";

export function summarizeOracleTimeline(timeline: OracleTimeline): string {
  if (timeline.eventCount === 0) {
    return "Oracle has not detected enough intelligence events to build an Operator Timeline.";
  }

  const highPriorityEvents = timeline.events.filter(
    (event) => event.severity === "high" || event.severity === "critical"
  );

  if (highPriorityEvents.length > 0) {
    return `Oracle Timeline contains ${timeline.eventCount} events, including ${highPriorityEvents.length} high-priority developments.`;
  }

  return `Oracle Timeline contains ${timeline.eventCount} intelligence events.`;
}