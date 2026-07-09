import type { OracleSignal } from "@/lib/oracle/signals/signal-types";
import type {
  OracleTimeline,
  OracleTimelineEvent,
  OracleTimelineEventCategory,
  OracleTimelineEventSeverity,
} from "./timeline-types";

function mapSignalCategoryToTimelineCategory(
  category: OracleSignal["category"]
): OracleTimelineEventCategory {
  switch (category) {
    case "behaviour":
      return "evolution";
    case "coach":
      return "coaching";
    case "weapon":
      return "weapon";
    case "operator":
      return "operator";
    case "prediction":
      return "prediction";
    case "memory":
      return "memory";
    case "report":
      return "brain";
    case "context":
      return "context";
    case "opportunity":
      return "opportunity";
  }
}

function mapSignalSeverityToTimelineSeverity(
  severity: OracleSignal["severity"]
): OracleTimelineEventSeverity {
  return severity;
}

export function buildTimelineEventFromSignal(
  signal: OracleSignal
): OracleTimelineEvent {
  return {
    id: `timeline-${signal.id}`,
    category: mapSignalCategoryToTimelineCategory(signal.category),
    title: signal.title,
    summary: signal.summary,
    severity: mapSignalSeverityToTimelineSeverity(signal.severity),
    confidence: signal.confidence,
    occurredAt: signal.createdAt,
  };
}

export function buildOracleTimelineFromSignals(
  signals: OracleSignal[]
): OracleTimeline {
  const events = signals.map(buildTimelineEventFromSignal);

  return {
    generatedAt: new Date().toISOString(),
    eventCount: events.length,
    events,
  };
}