export type OracleServiceId =
  | "ai-coach"
  | "oracle-brain"
  | "loadouts"
  | "reports"
  | "sessions"
  | "progression"
  | "planner"
  | "missions"
  | "memory"
  | "operator-understanding"
  | "operator"
  | "companion";

export type OracleServiceStatus =
  | "available"
  | "unavailable"
  | "disabled";

export type OracleService = {
  id: OracleServiceId;

  name: string;

  description: string;

  requiredCapabilities: readonly string[];

  status: OracleServiceStatus;
};
