import type {
  OracleDesktopHostState,
} from "../host-state.js";
import {
  ORACLE_DESKTOP_HOST_SNAPSHOT_CONTRACT,
  ORACLE_DESKTOP_HOST_SNAPSHOT_CONTRACT_VERSION,
  type OracleDeepReadonly,
  type OracleDesktopHostSnapshot,
} from "./desktop-host-snapshot.js";

export type CreateOracleDesktopHostSnapshotInput = {
  hostState: OracleDesktopHostState;
  capturedAt?: string;
};

/**
 * Builds the canonical immutable Oracle desktop-host snapshot.
 *
 * This builder deliberately accepts plain host state rather than Electron
 * objects or desktop controllers. It is therefore safe to reuse from future
 * diagnostics, telemetry, Companion and game-integration boundaries.
 */
export function createOracleDesktopHostSnapshot(
  input: CreateOracleDesktopHostSnapshotInput
): OracleDesktopHostSnapshot {
  const snapshot: OracleDesktopHostSnapshot = {
    contract: {
      name:
        ORACLE_DESKTOP_HOST_SNAPSHOT_CONTRACT,

      version:
        ORACLE_DESKTOP_HOST_SNAPSHOT_CONTRACT_VERSION,
    },

    capturedAt:
      input.capturedAt ??
      new Date().toISOString(),

    state:
      structuredClone(
        input.hostState
      ),
  };

  return deepFreeze(snapshot);
}

function deepFreeze<T>(
  value: T
): OracleDeepReadonly<T> {
  if (
    value === null ||
    typeof value !== "object"
  ) {
    return value as OracleDeepReadonly<T>;
  }

  for (
    const nestedValue of
      Object.values(value)
  ) {
    deepFreeze(nestedValue);
  }

  return Object.freeze(
    value
  ) as OracleDeepReadonly<T>;
}
