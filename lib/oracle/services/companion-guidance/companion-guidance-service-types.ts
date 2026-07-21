import type {
  OracleCompanionGuidance,
  OracleCompanionGuidancePackageManifest,
} from "../../../companion/guidance";

export type OracleCompanionGuidanceProviderEligibilityReason =
  | "integration-not-active"
  | "integration-not-supported"
  | "category-not-supported"
  | "type-not-supported";

export type OracleCompanionGuidanceProviderExecutionStatus =
  | "ineligible"
  | "completed"
  | "completed-with-failures"
  | "failed";

export type OracleCompanionGuidanceProviderFailureStage =
  | "execution"
  | "output-validation";

export type OracleCompanionGuidanceProviderFailure =
  Readonly<{
    providerId: string;
    providerVersion: string;
    stage:
      OracleCompanionGuidanceProviderFailureStage;
    code: string;
    message: string;
    outputIndex: number | null;
  }>;

export type OracleCompanionGuidanceProviderExecution =
  Readonly<{
    providerId: string;
    providerVersion: string;
    status:
      OracleCompanionGuidanceProviderExecutionStatus;
    eligibilityReason:
      OracleCompanionGuidanceProviderEligibilityReason | null;
    acceptedCount: number;
    filteredCount: number;
    failureCount: number;
  }>;

export type OracleCompanionGuidanceServiceResult =
  Readonly<{
    guidance:
      readonly OracleCompanionGuidance[];
    failures:
      readonly OracleCompanionGuidanceProviderFailure[];
    providers:
      readonly OracleCompanionGuidanceProviderExecution[];
  }>;

export type OracleCompanionGuidanceProviderManifestSnapshot =
  OracleCompanionGuidancePackageManifest;
