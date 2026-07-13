export type OracleServiceId =
  | "ai-coach"
  | "oracle-brain"
  | "loadouts"
  | "reports"
  | "sessions"
  | "progression"
  | "missions"
  | "memory"
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

  requiredCapabilities: string[];

  status: OracleServiceStatus;
};