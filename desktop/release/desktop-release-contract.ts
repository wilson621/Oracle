export const ORACLE_DESKTOP_RELEASE_CONTRACT =
  Object.freeze({
    name: "oracle.desktop-release",
    version: 1,
  } as const);

export type OracleDesktopReleaseStatus =
  | "inactive"
  | "checking"
  | "available"
  | "ready"
  | "failed";

export type OracleDesktopReleaseState = Readonly<{
  contract:
    typeof ORACLE_DESKTOP_RELEASE_CONTRACT;
  status: OracleDesktopReleaseStatus;
  channel: "beta";
  currentVersion: string;
  availableVersion: string | null;
  trust: "local-test-only";
  publication: "not-authorised";
  externalDistribution: "not-authorised";
  productionTrusted: false;
  checkedAt: string | null;
  limitation: string;
  errorCode: string | null;
}>;

export type OracleDesktopReleaseBridge = Readonly<{
  getState: () =>
    Promise<OracleDesktopReleaseState>;
  checkForUpdates: () =>
    Promise<OracleDesktopReleaseState>;
  onStateChanged: (
    listener: (
      state: OracleDesktopReleaseState
    ) => void
  ) => () => void;
}>;

export const ORACLE_DESKTOP_RELEASE_CHANNELS =
  Object.freeze({
    getState:
      "oracle-desktop-release:get-state",
    check:
      "oracle-desktop-release:check",
    stateChanged:
      "oracle-desktop-release:state-changed",
  } as const);

export function isOracleDesktopReleaseState(
  value: unknown
): value is OracleDesktopReleaseState {
  if (
    typeof value !== "object" ||
    value === null ||
    Array.isArray(value)
  ) {
    return false;
  }

  const state = value as Record<
    string,
    unknown
  >;
  const contract = state.contract;

  return (
    typeof contract === "object" &&
    contract !== null &&
    !Array.isArray(contract) &&
    (contract as Record<string, unknown>)
      .name ===
      ORACLE_DESKTOP_RELEASE_CONTRACT.name &&
    (contract as Record<string, unknown>)
      .version ===
      ORACLE_DESKTOP_RELEASE_CONTRACT.version &&
    (
      state.status === "inactive" ||
      state.status === "checking" ||
      state.status === "available" ||
      state.status === "ready" ||
      state.status === "failed"
    ) &&
    state.channel === "beta" &&
    typeof state.currentVersion ===
      "string" &&
    (
      state.availableVersion === null ||
      typeof state.availableVersion ===
        "string"
    ) &&
    state.trust === "local-test-only" &&
    state.publication ===
      "not-authorised" &&
    state.externalDistribution ===
      "not-authorised" &&
    state.productionTrusted === false &&
    (
      state.checkedAt === null ||
      typeof state.checkedAt === "string"
    ) &&
    typeof state.limitation === "string" &&
    (
      state.errorCode === null ||
      typeof state.errorCode === "string"
    )
  );
}
