import { createCoreOraclePlatformComposition } from "../../lib/oracle/composition/core-platform-composition.js";
import {
  createOracleRuntimeCompositionManifest,
  type OracleRuntimeSubsystemDeclaration,
} from "../../lib/oracle/platform/platform-composition.js";
import { OraclePlatformCompositionRoot } from "../../lib/oracle/platform/platform-composition-root.js";
import type {
  OracleGameIntegrationRegistryContract,
} from "../../lib/oracle/game-integrations/game-integration-registry.js";

export const ORACLE_PLATFORM_DESKTOP_COMPANION_LIFECYCLE =
  Object.freeze({
    contract: "oracle.platform-desktop-companion-lifecycle",
    version: 1,
    platformOwner: "platform-companion-capability-readiness",
    desktopOwner: "desktop-companion-session-and-context",
    authorityMerged: false,
  });

const ELECTRON_SUBSYSTEMS: readonly OracleRuntimeSubsystemDeclaration[] =
  Object.freeze([
    Object.freeze({ id: "composition", required: true }),
    Object.freeze({ id: "services", required: true }),
    Object.freeze({ id: "session-lifecycle", required: true }),
    Object.freeze({ id: "applications", required: true }),
    Object.freeze({ id: "game-integrations", required: true }),
    Object.freeze({ id: "guidance", required: true }),
    Object.freeze({ id: "extensions", required: false }),
    Object.freeze({ id: "companion", required: true }),
  ]);

export const ORACLE_ELECTRON_COMPOSITION_MANIFEST =
  createOracleRuntimeCompositionManifest({
    contract: "oracle.runtime-composition",
    contractVersion: 1,
    manifestVersion: "1.3.0",
    target: "electron",
    subsystems: ELECTRON_SUBSYSTEMS,
    services: [
      "operator",
      "sessions",
      "missions",
      "memory",
      "operator-understanding",
      "progression",
      "planner",
      "reports",
      "ai-coach",
      "oracle-brain",
      "loadouts",
      "companion",
    ],
    sessionLifecycle: {
      contract: "oracle.session-lifecycle",
      contractVersion: 1,
      authority: "session-service",
      persistence: "disabled",
    },
    applications: [
      "ai-coach",
      "oracle-brain",
      "loadouts",
      "reports",
      "sessions",
      "career",
      "planner",
      "progress",
      "achievements",
      "companion",
    ],
    gameIntegrations: ["call-of-duty"],
    guidanceProviders: [
      "game-integrations.call-of-duty.curated-guidance",
    ],
  });

const desktopRoot = new OraclePlatformCompositionRoot(() =>
  createCoreOraclePlatformComposition(ORACLE_ELECTRON_COMPOSITION_MANIFEST)
);

export function startOracleDesktopPlatform() {
  return desktopRoot.start();
}

export function recoverOracleDesktopPlatform() {
  return desktopRoot.recover();
}

export function stopOracleDesktopPlatform() {
  return desktopRoot.stop();
}

export function getOracleDesktopPlatformHealth() {
  return desktopRoot.getHealth();
}

export function getOracleDesktopGameIntegrationRegistry():
  OracleGameIntegrationRegistryContract {
  return desktopRoot.getGameIntegrationRegistry() as
    OracleGameIntegrationRegistryContract;
}
