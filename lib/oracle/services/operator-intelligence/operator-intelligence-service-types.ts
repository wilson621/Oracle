import type {
  OperatorEvidenceReference,
  OperatorIntelligenceClaimRevision,
  OperatorIntelligenceClaimTombstone,
  OperatorIntelligencePageRequest,
  OperatorIntelligencePageResult,
  OperatorUnderstandingEligibility,
  OperatorUnderstandingPurpose,
  OperatorUnderstandingScope,
} from "../../understanding";

export type OperatorIntelligenceClaimQuery = Readonly<{
  purpose: OperatorUnderstandingPurpose;
  asOf: string;
  scope: OperatorUnderstandingScope | null;
  page: OperatorIntelligencePageRequest;
}>;

export type OperatorIntelligenceLifecycleQuery = Readonly<{
  claimId: string;
  purpose: OperatorUnderstandingPurpose;
  asOf: string;
  scope: OperatorUnderstandingScope | null;
  page: OperatorIntelligencePageRequest;
}>;

export type OperatorIntelligenceEligibilityHistoryQuery = Readonly<{
  claimId: string;
  claimRevisionId: string;
  purpose: OperatorUnderstandingPurpose;
  asOf: string;
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
  evidenceReferences: readonly Omit<OperatorEvidenceReference, "operatorId">[];
  previous: Omit<OperatorIntelligenceClaimRevision, "operatorId">;
  next: Omit<OperatorIntelligenceClaimRevision, "operatorId"> &
    Readonly<{
      status: "active" | "expired" | "superseded";
    }>;
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
  listClaimLifecycle(
    query: OperatorIntelligenceLifecycleQuery
  ): Promise<OperatorIntelligencePageResult<
    OperatorIntelligenceClaimRevision | OperatorIntelligenceClaimTombstone
  >>;
  listEligibilityHistory(
    query: OperatorIntelligenceEligibilityHistoryQuery
  ): Promise<OperatorIntelligencePageResult<
    OperatorUnderstandingEligibility
  >>;
  submitCandidate(
    submission: OperatorIntelligenceCandidateSubmission
  ): Promise<OperatorIntelligenceClaimRevision>;
  transitionClaim(
    request: OperatorIntelligenceTransitionRequest
  ): Promise<
    OperatorIntelligenceClaimRevision | OperatorIntelligenceClaimTombstone
  >;
}>;
