import {
  OperatorIntelligenceRepositoryDuplicateError,
  OperatorIntelligenceRepositoryImmutableConflictError,
  OperatorIntelligenceRepositoryStaleConflictError,
  type OperatorIntelligenceRepository,
} from "../../repositories/operator-intelligence-repository";
import {
  createOperatorEvidenceReference,
  createOperatorIntelligenceClaimRevision,
  createOperatorIntelligencePageRequest,
} from "../../understanding";
import type { OperatorService } from "../operator";
import type {
  OperatorIntelligenceCandidateSubmission,
  OperatorIntelligenceClaimQuery,
  OperatorIntelligenceEligibilityHistoryQuery,
  OperatorIntelligenceLifecycleQuery,
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

export class OperatorIntelligenceImmutableConflictError extends Error {
  readonly code = "OPERATOR_INTELLIGENCE_IMMUTABLE_CONFLICT";
  constructor() {
    super("Operator Intelligence immutable content conflicts with the original.");
    this.name = "OperatorIntelligenceImmutableConflictError";
  }
}

export class OperatorIntelligenceDuplicateError extends Error {
  readonly code = "OPERATOR_INTELLIGENCE_DUPLICATE";
  constructor() {
    super("Operator Intelligence natural identity is already admitted.");
    this.name = "OperatorIntelligenceDuplicateError";
  }
}

export class OperatorIntelligenceStaleConcurrencyError extends Error {
  readonly code = "OPERATOR_INTELLIGENCE_STALE_CONCURRENCY";
  constructor() {
    super("Operator Intelligence revision is stale after a competing write.");
    this.name = "OperatorIntelligenceStaleConcurrencyError";
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

    let persisted;

    try {
      persisted = await repository.persistClaimRevision(
        operator.id,
        evidenceReferences,
        claim
      );
    } catch (error) {
      throw translateRepositoryConflict(error);
    }

    if (persisted.status === "deleted") {
      throw new Error(
        "Candidate persistence returned an invalid deletion tombstone."
      );
    }

    return persisted;
  }

  async function listClaimLifecycle(query: OperatorIntelligenceLifecycleQuery) {
    const operator = await operatorService.getCurrentOperator();

    return repository.listClaimLifecycle({
      ...query,
      operatorId: operator.id,
      page: createOperatorIntelligencePageRequest(query.page),
    });
  }

  async function listEligibilityHistory(
    query: OperatorIntelligenceEligibilityHistoryQuery
  ) {
    const operator = await operatorService.getCurrentOperator();

    return repository.listEligibilityHistory({
      ...query,
      operatorId: operator.id,
      page: createOperatorIntelligencePageRequest(query.page),
    });
  }

  async function transitionClaim(
    request: OperatorIntelligenceTransitionRequest
  ): Promise<never> {
    void request;
    throw new OperatorIntelligenceTransitionUnavailableError();
  }

  return Object.freeze({
    listEligibleClaims,
    listClaimLifecycle,
    listEligibilityHistory,
    submitCandidate,
    transitionClaim,
  });
}

function translateRepositoryConflict(error: unknown): unknown {
  if (error instanceof OperatorIntelligenceRepositoryImmutableConflictError) {
    return new OperatorIntelligenceImmutableConflictError();
  }

  if (error instanceof OperatorIntelligenceRepositoryDuplicateError) {
    return new OperatorIntelligenceDuplicateError();
  }

  if (error instanceof OperatorIntelligenceRepositoryStaleConflictError) {
    return new OperatorIntelligenceStaleConcurrencyError();
  }

  return error;
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
