export type OracleSignalCategory =
  | "behaviour"
  | "coach"
  | "weapon"
  | "operator"
  | "prediction"
  | "memory"
  | "report";

export type OracleSignalSeverity =
  | "low"
  | "medium"
  | "high"
  | "critical";

export type OracleSignalDirection =
  | "positive"
  | "negative"
  | "neutral";

export type OracleSignal = {
  id: string;
  category: OracleSignalCategory;
  title: string;
  summary: string;
  severity: OracleSignalSeverity;
  direction: OracleSignalDirection;
  confidence: number;
  createdAt: string;
};