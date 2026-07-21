import type {
  OperatorClaimLifecycleStatus,
  OperatorEvidenceReference,
  OperatorIntelligenceClaimRevision,
  OperatorIntelligenceClaimTombstone,
  OperatorUnderstandingPurpose,
  OperatorUnderstandingScope,
} from "../../understanding";

export type OperatorIntelligenceClaimQuery = Readonly<{
  operatorId: string;
  purpose: OperatorUnderstandingPurpose;
  asOf: string;
  scope: OperatorUnderstandingScope | null;
}>;

export type OperatorIntelligenceCandidateSubmission = Readonly<{
  operatorId: string;
  evidenceReferences: readonly OperatorEvidenceReference[];
  claim: OperatorIntelligenceClaimRevision &
    Readonly<{
      status: "candidate";
      epistemic: "suspected";
      explanation: null;
    }>;
}>;

export type OperatorIntelligenceTransitionRequest = Readonly<{
  operatorId: string;
  claimId: string;
  fromRevisionId: string;
  fromStatus: OperatorClaimLifecycleStatus;
  toStatus: OperatorClaimLifecycleStatus;
  policyVersion: string;
}>;

/**
 * Service-owned claim and evidence lifecycle contract. Persistence remains a
 * future Repository responsibility; engines never implement this interface.
 */
export type OperatorIntelligenceService = Readonly<{
  listEligibleClaims(
    query: OperatorIntelligenceClaimQuery
  ): Promise<readonly OperatorIntelligenceClaimRevision[]>;
  submitCandidate(
    submission: OperatorIntelligenceCandidateSubmission
  ): Promise<OperatorIntelligenceClaimRevision>;
  transitionClaim(
    request: OperatorIntelligenceTransitionRequest
  ): Promise<
    OperatorIntelligenceClaimRevision | OperatorIntelligenceClaimTombstone
  >;
}>;
