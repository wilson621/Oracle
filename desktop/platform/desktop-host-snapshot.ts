import type {
  OracleDesktopHostState,
} from "../host-state.js";

/**
 * Stable identifier for the Oracle Desktop Host Snapshot contract.
 *
 * Consumers should validate both the contract name and version before
 * interpreting snapshots received across process or service boundaries.
 */
export const ORACLE_DESKTOP_HOST_SNAPSHOT_CONTRACT =
  "oracle.desktop-host-snapshot" as const;

/**
 * Current schema version for the Oracle Desktop Host Snapshot contract.
 *
 * Increment this value only when the serialized contract changes in a way
 * that requires consumers to handle a new schema.
 */
export const ORACLE_DESKTOP_HOST_SNAPSHOT_CONTRACT_VERSION =
  1 as const;

export type OracleDeepReadonly<T> =
  T extends (...args: never[]) => unknown
    ? T
    : T extends readonly (infer Item)[]
      ? readonly OracleDeepReadonly<Item>[]
      : T extends object
        ? {
            readonly [Key in keyof T]:
              OracleDeepReadonly<T[Key]>;
          }
        : T;

export type OracleDesktopHostSnapshotContract = {
  readonly name:
    typeof ORACLE_DESKTOP_HOST_SNAPSHOT_CONTRACT;

  readonly version:
    typeof ORACLE_DESKTOP_HOST_SNAPSHOT_CONTRACT_VERSION;
};

/**
 * Canonical, serializable representation of the Oracle desktop host at one
 * point in time.
 *
 * The contract contains plain data only. Electron objects, controllers,
 * services and callbacks must never be added to this boundary.
 */
export type OracleDesktopHostSnapshot = {
  readonly contract:
    OracleDesktopHostSnapshotContract;

  readonly capturedAt: string;

  readonly state:
    OracleDeepReadonly<OracleDesktopHostState>;
};
