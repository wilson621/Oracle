import type {
  OperatorClaimLifecycleStatus,
  OperatorEvidenceReference,
  OperatorIntelligenceClaimRevision,
  OperatorIntelligenceClaimTombstone,
  OperatorIntelligencePageRequest,
  OperatorIntelligencePageResult,
  OperatorUnderstandingPurpose,
  OperatorUnderstandingScope,
} from "../../understanding";

export type OperatorIntelligenceClaimQuery = Readonly<{
  purpose: OperatorUnderstandingPurpose;
  asOf: string;
  scope: OperatorUnderstandingScope | null;
  page: OperatorIntelligencePageRequest;
}>;

export type OperatorIntelligenceCandidateSubmission = Readonly<{
  evidenceReferences: readonly Omit<OperatorEvidenceReference, "operatorId">[];
  claim: Omit<OperatorIntelligenceClaimRevision, "operatorId"> &
    Readonly<{
      status: "candidate";
      epistemic: "suspected";
      explanation: null;
    }>;
}>;

export type OperatorIntelligenceTransitionRequest = Readonly<{
  claimId: string;
  fromRevisionId: string;
  fromStatus: OperatorClaimLifecycleStatus;
  toStatus: OperatorClaimLifecycleStatus;
  policyVersion: string;
}>;

/**
 * Exclusive durable Operator Intelligence authority. Implementations resolve
 * the current authenticated Operator through Operator Service; Applications
 * and producers cannot select an Operator or access persistence directly.
 */
export type OperatorIntelligenceService = Readonly<{
  listEligibleClaims(
    query: OperatorIntelligenceClaimQuery
  ): Promise<OperatorIntelligencePageResult<OperatorIntelligenceClaimRevision>>;
  submitCandidate(
    submission: OperatorIntelligenceCandidateSubmission
  ): Promise<OperatorIntelligenceClaimRevision>;
  transitionClaim(
    request: OperatorIntelligenceTransitionRequest
  ): Promise<
    OperatorIntelligenceClaimRevision | OperatorIntelligenceClaimTombstone
  >;
}>;
