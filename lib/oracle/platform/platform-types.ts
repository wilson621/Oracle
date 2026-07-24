import type { CompanionRuntimeState } from "../../companion/companion-state";
import type {
  OracleComposedApplication,
  OracleComposedService,
  OraclePlatformSubsystemId,
  OracleRuntimeCompositionManifest,
} from "./platform-composition";

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
  | "validating-composition"
  | "registering-services"
  | "starting-session-lifecycle"
  | "registering-applications"
  | "registering-game-integrations"
  | "registering-guidance"
  | "initialising-extensions"
  | "starting-companion"
  | "validating"
  | "complete"
  | "stopping"
  | "stopped"
  | "failed";

export type OraclePlatformSubsystemStatus =
  | "pending"
  | "ready"
  | "unavailable"
  | "failed"
  | "stopped";

export type OraclePlatformDiagnosticLevel = "info" | "warning" | "error";

export type OraclePlatformSubsystem = Readonly<{
  id: OraclePlatformSubsystemId;
  name: string;
  required: boolean;
  status: OraclePlatformSubsystemStatus;
  message: string;
  updatedAt: string;
}>;

export type OraclePlatformDiagnostic = Readonly<{
  code: string;
  level: OraclePlatformDiagnosticLevel;
  message: string;
  phase: OraclePlatformBootPhase;
  subsystemId: OraclePlatformSubsystemId | null;
  timestamp: string;
}>;

export type OraclePlatformState = Readonly<{
  status: OraclePlatformStatus;
  phase: OraclePlatformBootPhase;
  startedAt: string | null;
  readyAt: string | null;
  stoppedAt: string | null;
  updatedAt: string;
  manifest: OracleRuntimeCompositionManifest;
  manifestVerified: boolean;
  services: readonly OracleComposedService[];
  applications: readonly OracleComposedApplication[];
  gameIntegrations: readonly string[];
  guidanceProviders: readonly string[];
  companion: CompanionRuntimeState;
  subsystems: readonly OraclePlatformSubsystem[];
  diagnostics: readonly OraclePlatformDiagnostic[];
  errors: readonly string[];
}>;
