import type { CompanionRuntimeState } from "@/lib/companion/companion-state";
import type { OracleApplication } from "../applications";
import type { OracleService } from "../services";

export type OraclePlatformStatus =
  | "idle"
  | "booting"
  | "ready"
  | "degraded"
  | "failed"
  | "stopping"
  | "stopped";

export type OraclePlatformBootPhase =
  | "idle"
  | "registering-services"
  | "registering-applications"
  | "initialising-extensions"
  | "starting-companion"
  | "validating"
  | "complete"
  | "stopping"
  | "stopped"
  | "failed";

export type OraclePlatformSubsystemId =
  | "services"
  | "applications"
  | "extensions"
  | "companion";

export type OraclePlatformSubsystemStatus =
  | "pending"
  | "ready"
  | "unavailable"
  | "failed"
  | "stopped";

export type OraclePlatformDiagnosticLevel =
  | "info"
  | "warning"
  | "error";

export type OraclePlatformSubsystem = {
  id: OraclePlatformSubsystemId;
  name: string;
  status: OraclePlatformSubsystemStatus;
  message: string;
  updatedAt: string;
};

export type OraclePlatformDiagnostic = {
  code: string;
  level: OraclePlatformDiagnosticLevel;
  message: string;
  phase: OraclePlatformBootPhase;
  subsystemId: OraclePlatformSubsystemId | null;
  timestamp: string;
};

export type OraclePlatformState = {
  status: OraclePlatformStatus;
  phase: OraclePlatformBootPhase;

  startedAt: string | null;
  readyAt: string | null;
  stoppedAt: string | null;
  updatedAt: string;

  services: OracleService[];
  applications: OracleApplication[];
  companion: CompanionRuntimeState;

  subsystems: OraclePlatformSubsystem[];
  diagnostics: OraclePlatformDiagnostic[];
  errors: string[];
};