import type { OracleExtensionManifest } from "./extension-types";

export type OracleExtensionStatus =
  | "registered"
  | "enabled"
  | "disabled"
  | "failed";

export type OracleExtension = {
  manifest: OracleExtensionManifest;
  status: OracleExtensionStatus;

  enable(): Promise<void>;
  disable(): Promise<void>;
};