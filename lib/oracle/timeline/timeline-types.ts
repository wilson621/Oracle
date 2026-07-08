export type OracleTimelineEventCategory =
  | "memory"
  | "evolution"
  | "coaching"
  | "mission"
  | "brain"
  | "prediction"
  | "weapon"
  | "operator";

export type OracleTimelineEventSeverity =
  | "low"
  | "medium"
  | "high"
  | "critical";

export type OracleTimelineEvent = {
  id: string;
  category: OracleTimelineEventCategory;
  title: string;
  summary: string;
  severity: OracleTimelineEventSeverity;
  confidence: number;
  occurredAt: string;
};

export type OracleTimeline = {
  generatedAt: string;
  eventCount: number;
  events: OracleTimelineEvent[];
};