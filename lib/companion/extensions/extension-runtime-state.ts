export type OracleExtensionRuntimeStatus =
  | "discovered"
  | "validated"
  | "resolved"
  | "loaded"
  | "initialised"
  | "running"
  | "paused"
  | "stopped"
  | "failed";

export type OracleExtensionRuntimeState = {
  extensionId: string;
  status: OracleExtensionRuntimeStatus;

  startedAt: string | null;
  updatedAt: string;
  error: string | null;
};

export function createExtensionRuntimeState(
  extensionId: string
): OracleExtensionRuntimeState {
  return {
    extensionId,

    status: "discovered",

    startedAt: null,

    updatedAt: new Date().toISOString(),

    error: null,
  };
}