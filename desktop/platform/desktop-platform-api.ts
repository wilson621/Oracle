import {
  ORACLE_DESKTOP_DIAGNOSTIC_CONTRACT,
  ORACLE_DESKTOP_DIAGNOSTIC_CONTRACT_VERSION,
} from "./desktop-diagnostic.js";
import {
  ORACLE_DESKTOP_HOST_EVENT_CONTRACT,
  ORACLE_DESKTOP_HOST_EVENT_CONTRACT_VERSION,
} from "./desktop-host-event.js";
import {
  ORACLE_DESKTOP_HOST_SNAPSHOT_CONTRACT,
  ORACLE_DESKTOP_HOST_SNAPSHOT_CONTRACT_VERSION,
} from "./desktop-host-snapshot.js";
import {
  ORACLE_DESKTOP_RECOVERY_CONTRACT,
  ORACLE_DESKTOP_RECOVERY_CONTRACT_VERSION,
} from "./desktop-recovery.js";
import {
  ORACLE_DESKTOP_TELEMETRY_SNAPSHOT_CONTRACT,
  ORACLE_DESKTOP_TELEMETRY_SNAPSHOT_CONTRACT_VERSION,
} from "./desktop-telemetry.js";
import {
  ORACLE_DESKTOP_TIMELINE_ENTRY_CONTRACT,
  ORACLE_DESKTOP_TIMELINE_ENTRY_CONTRACT_VERSION,
} from "./desktop-timeline.js";

export const ORACLE_DESKTOP_PLATFORM_API =
  "oracle.desktop-platform-api" as const;

export const ORACLE_DESKTOP_PLATFORM_API_VERSION =
  1 as const;

/**
 * Machine-readable description of the frozen Oracle Desktop Platform API.
 *
 * External consumers must import the approved contracts from
 * `desktop/platform/index.js`. Implementations, services and Electron objects
 * are intentionally excluded from this manifest and public surface.
 */
export const ORACLE_DESKTOP_PLATFORM_API_MANIFEST = Object.freeze({
  name:
    ORACLE_DESKTOP_PLATFORM_API,

  version:
    ORACLE_DESKTOP_PLATFORM_API_VERSION,

  publicImport:
    "desktop/platform/index.js",

  contracts: Object.freeze({
    hostSnapshot:
      createContractReference(
        ORACLE_DESKTOP_HOST_SNAPSHOT_CONTRACT,
        ORACLE_DESKTOP_HOST_SNAPSHOT_CONTRACT_VERSION
      ),

    hostEvent:
      createContractReference(
        ORACLE_DESKTOP_HOST_EVENT_CONTRACT,
        ORACLE_DESKTOP_HOST_EVENT_CONTRACT_VERSION
      ),

    diagnostic:
      createContractReference(
        ORACLE_DESKTOP_DIAGNOSTIC_CONTRACT,
        ORACLE_DESKTOP_DIAGNOSTIC_CONTRACT_VERSION
      ),

    recovery:
      createContractReference(
        ORACLE_DESKTOP_RECOVERY_CONTRACT,
        ORACLE_DESKTOP_RECOVERY_CONTRACT_VERSION
      ),

    timelineEntry:
      createContractReference(
        ORACLE_DESKTOP_TIMELINE_ENTRY_CONTRACT,
        ORACLE_DESKTOP_TIMELINE_ENTRY_CONTRACT_VERSION
      ),

    telemetrySnapshot:
      createContractReference(
        ORACLE_DESKTOP_TELEMETRY_SNAPSHOT_CONTRACT,
        ORACLE_DESKTOP_TELEMETRY_SNAPSHOT_CONTRACT_VERSION
      ),
  }),
});

export type OracleDesktopPlatformApiManifest =
  typeof ORACLE_DESKTOP_PLATFORM_API_MANIFEST;

function createContractReference<
  Name extends string,
  Version extends number,
>(
  name: Name,
  version: Version
) {
  return Object.freeze({
    name,
    version,
  });
}
