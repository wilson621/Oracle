import type { OracleServiceId } from "../services";

export type OracleApplicationId =
  | "ai-coach"
  | "oracle-brain"
  | "loadouts"
  | "reports"
  | "sessions"
  | "career"
  | "planner"
  | "progress"
  | "achievements"
  | "companion";

export type OracleApplicationStatus =
  | "available"
  | "unavailable"
  | "disabled";

export type OracleApplication = {
  id: OracleApplicationId;
  name: string;
  description: string;
  route: string;
  requiredServices: readonly OracleServiceId[];
  status: OracleApplicationStatus;
};
