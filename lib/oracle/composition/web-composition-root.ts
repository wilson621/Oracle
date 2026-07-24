import { createCoreOraclePlatformComposition } from "./core-platform-composition";
import {
  createOracleRuntimeCompositionManifest,
  type OracleRuntimeSubsystemDeclaration,
} from "../platform/platform-composition";
import { OraclePlatformCompositionRoot } from "../platform/platform-composition-root";

const WEB_SUBSYSTEMS: readonly OracleRuntimeSubsystemDeclaration[] =
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

export const ORACLE_WEB_COMPOSITION_MANIFEST =
  createOracleRuntimeCompositionManifest({
    contract: "oracle.runtime-composition",
    contractVersion: 1,
    manifestVersion: "1.3.0",
    target: "web",
    subsystems: WEB_SUBSYSTEMS,
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

const webRoot = new OraclePlatformCompositionRoot(() =>
  createCoreOraclePlatformComposition(ORACLE_WEB_COMPOSITION_MANIFEST)
);

export function startOracleWebPlatform() {
  return webRoot.start();
}

export function recoverOracleWebPlatform() {
  return webRoot.recover();
}

export function getOracleWebPlatformHealth() {
  return webRoot.getHealth();
}
