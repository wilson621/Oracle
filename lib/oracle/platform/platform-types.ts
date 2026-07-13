import type { CompanionRuntimeState } from "@/lib/companion/companion-state";
import type { OracleApplication } from "../applications";
import type { OracleService } from "../services";

export type OraclePlatformStatus =
  | "starting"
  | "ready"
  | "failed";

export type OraclePlatformSubsystemStatus =
  | "ready"
  | "unavailable"
  | "failed";

export type OraclePlatformSubsystem = {
  id:
    | "services"
    | "applications"
    | "extensions"
    | "companion";
  name: string;
  status: OraclePlatformSubsystemStatus;
  message: string;
};

export type OraclePlatformState = {
  status: OraclePlatformStatus;
  startedAt: string;
  readyAt: string | null;

  services: OracleService[];
  applications: OracleApplication[];
  companion: CompanionRuntimeState;

  subsystems: OraclePlatformSubsystem[];
  errors: string[];
};