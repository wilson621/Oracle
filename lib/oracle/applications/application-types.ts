import type { OracleServiceId } from "../services";

export type OracleApplicationId =
  | "ai-coach"
  | "oracle-brain"
  | "loadouts"
  | "reports"
  | "career"
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
