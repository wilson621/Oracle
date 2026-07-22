import type { OperatorIntelligenceRepository } from "../../repositories/operator-intelligence-repository";
import {
  createOperatorEvidenceReference,
  createOperatorIntelligenceClaimRevision,
  createOperatorIntelligencePageRequest,
} from "../../understanding";
import type { OperatorService } from "../operator";
import type {
  OperatorIntelligenceCandidateSubmission,
  OperatorIntelligenceClaimQuery,
  OperatorIntelligenceService,
  OperatorIntelligenceTransitionRequest,
} from "./operator-intelligence-service-types";

export class OperatorIntelligenceTransitionUnavailableError extends Error {
  readonly code = "OPERATOR_INTELLIGENCE_TRANSITION_UNAVAILABLE";

  constructor() {
    super(
      "Operator Intelligence lifecycle transitions are not active before the approved control phase."
    );
    this.name = "OperatorIntelligenceTransitionUnavailableError";
  }
}

export function createOperatorIntelligenceService(
  operatorService: OperatorService,
  repository: OperatorIntelligenceRepository
): OperatorIntelligenceService {
  async function listEligibleClaims(query: OperatorIntelligenceClaimQuery) {
    const operator = await operatorService.getCurrentOperator();

    return repository.listEligibleClaimRevisions({
      ...query,
      operatorId: operator.id,
      page: createOperatorIntelligencePageRequest(query.page),
    });
  }

  async function submitCandidate(
    submission: OperatorIntelligenceCandidateSubmission
  ) {
    assertNoCallerSelectedOperator(submission);

    const operator = await operatorService.getCurrentOperator();
    const evidenceReferences = submission.evidenceReferences.map((evidence) =>
      createOperatorEvidenceReference({
        ...evidence,
        operatorId: operator.id,
      })
    );
    const claim = createOperatorIntelligenceClaimRevision(
      {
        ...submission.claim,
        operatorId: operator.id,
      },
      evidenceReferences
    );

    const persisted = await repository.persistClaimRevision(
      operator.id,
      evidenceReferences,
      claim
    );

    if (persisted.status === "deleted") {
      throw new Error(
        "Candidate persistence returned an invalid deletion tombstone."
      );
    }

    return persisted;
  }

  async function transitionClaim(
    request: OperatorIntelligenceTransitionRequest
  ): Promise<never> {
    void request;
    throw new OperatorIntelligenceTransitionUnavailableError();
  }

  return Object.freeze({
    listEligibleClaims,
    submitCandidate,
    transitionClaim,
  });
}

function assertNoCallerSelectedOperator(
  submission: OperatorIntelligenceCandidateSubmission
): void {
  if (Object.hasOwn(submission.claim, "operatorId")) {
    throw new Error(
      "Operator Intelligence candidate callers cannot select an Operator."
    );
  }

  if (
    submission.evidenceReferences.some((evidence) =>
      Object.hasOwn(evidence, "operatorId")
    )
  ) {
    throw new Error(
      "Operator Intelligence evidence callers cannot select an Operator."
    );
  }
}
