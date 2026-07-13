export type OracleExtensionResolutionStatus =
  | "enabled"
  | "disabled"
  | "missing_dependencies"
  | "conflict";

export type OracleResolvedExtension = {
  extensionId: string;
  status: OracleExtensionResolutionStatus;
  reason: string | null;
};

export type OracleExtensionResolverResult = {
  valid: boolean;

  enabled: OracleResolvedExtension[];

  disabled: OracleResolvedExtension[];

  errors: string[];

  warnings: string[];
};