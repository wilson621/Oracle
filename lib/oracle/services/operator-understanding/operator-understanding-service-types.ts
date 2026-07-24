import type {
  OperatorDeclaredItem,
  OperatorEvidenceReference,
  OperatorExplicitUnderstandingItem,
  OperatorIntelligenceClaimRevision,
  OperatorMemoryProjectionItem,
  OperatorStateUnderstandingItem,
  OperatorUnknownItem,
  OperatorUnderstandingPurpose,
  OperatorUnderstandingSnapshot,
} from "../../understanding";

export type CurrentOperatorUnderstandingRequest = Readonly<{
  purpose: OperatorUnderstandingPurpose;
  asOf: string;
  applicationId: string | null;
  gameIntegration: Readonly<{
    id: string;
    version: string;
  }> | null;
}>;

/**
 * Authenticated read-projection boundary. Implementations must resolve the
 * current Operator through Operator Service and must not accept an arbitrary
 * Operator identifier from an Application.
 */
export type OperatorUnderstandingService = Readonly<{
  getCurrentSnapshot(
    request: CurrentOperatorUnderstandingRequest
  ): Promise<OperatorUnderstandingSnapshot>;
}>;

export type OperatorUnderstandingProjectionSourceResult = Readonly<{
  operatorId: string;
  sourceUpdatedAt: string;
  policySetVersion: string;
  identity: readonly OperatorExplicitUnderstandingItem[];
  preferences: readonly OperatorDeclaredItem[];
  goals: readonly OperatorDeclaredItem[];
  state: readonly OperatorStateUnderstandingItem[];
  memory: readonly OperatorMemoryProjectionItem[];
  intelligence: readonly OperatorIntelligenceClaimRevision[];
  unknowns: readonly OperatorUnknownItem[];
  evidenceReferences: readonly OperatorEvidenceReference[];
}>;

/**
 * Internal Repository projection boundary. Applications never receive this
 * contract and cannot select an Operator.
 */
export type OperatorUnderstandingProjectionSource = Readonly<{
  load(
    operatorId: string,
    request: CurrentOperatorUnderstandingRequest
  ): Promise<OperatorUnderstandingProjectionSourceResult>;
}>;
