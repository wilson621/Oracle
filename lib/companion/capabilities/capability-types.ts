export type OracleCapabilityId = string;

export type OracleCapabilityRequirement = {
  capabilityId: OracleCapabilityId;
  optional: boolean;
};

export type OracleCapabilityProvider = {
  capabilityId: OracleCapabilityId;
  extensionId: string;
};

export type OracleCapabilityConflict = {
  capabilityId: OracleCapabilityId;
  conflictingCapabilityId: OracleCapabilityId;
  reason: string;
};

export type OracleCapabilityResolutionStatus =
  | "resolved"
  | "missing"
  | "conflicted";

export type OracleCapabilityResolution = {
  capabilityId: OracleCapabilityId;
  status: OracleCapabilityResolutionStatus;
  providers: OracleCapabilityProvider[];
  requiredBy: string[];
  conflicts: OracleCapabilityConflict[];
};

export type OracleCapabilityGraphNode = {
  extensionId: string;
  provides: OracleCapabilityId[];
  requires: OracleCapabilityRequirement[];
  conflictsWith: OracleCapabilityId[];
};

export type OracleCapabilityGraph = {
  nodes: OracleCapabilityGraphNode[];
  resolutions: OracleCapabilityResolution[];
  valid: boolean;
  errors: string[];
  warnings: string[];
};