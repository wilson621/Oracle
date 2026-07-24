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
  assertOperatorClaimRevisionTransition,
  type OperatorIntelligenceClaimRevision,
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
    assertApprovedAutomatedClaimFamily(submission.claim.type);

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
      if (error instanceof OperatorIntelligenceRepositoryDuplicateError) {
        const replay = await findIdempotentCandidateReplay(
          repository,
          claim
        );
        if (replay) return replay;
      }
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
  ) {
    assertNoCallerSelectedOperator(request);
    assertApprovedAutomatedClaimFamily(request.previous.type);
    assertApprovedAutomatedClaimFamily(request.next.type);
    if (
      request.previous.type !== request.next.type ||
      !["active", "expired", "superseded"].includes(request.next.status)
    ) {
      throw new Error(
        "System claim transitions cannot change claim family or bypass Trust & Control."
      );
    }
    const operator = await operatorService.getCurrentOperator();
    const evidenceReferences = request.evidenceReferences.map((evidence) =>
      createOperatorEvidenceReference({
        ...evidence,
        operatorId: operator.id,
      })
    );
    const previous = createOperatorIntelligenceClaimRevision(
      { ...request.previous, operatorId: operator.id },
      evidenceReferences
    );
    const next = createOperatorIntelligenceClaimRevision(
      { ...request.next, operatorId: operator.id },
      evidenceReferences
    );
    assertOperatorClaimRevisionTransition(previous, next);

    try {
      const persisted = await repository.persistClaimRevision(
        operator.id,
        evidenceReferences,
        next
      );
      if (persisted.status === "deleted") {
        throw new Error(
          "System claim transition returned an invalid deletion tombstone."
        );
      }
      return persisted;
    } catch (error) {
      throw translateRepositoryConflict(error);
    }
  }

  return Object.freeze({
    listEligibleClaims,
    listClaimLifecycle,
    listEligibilityHistory,
    submitCandidate,
    transitionClaim,
  });
}

function assertApprovedAutomatedClaimFamily(type: string): void {
  if (
    type !== "recurring-game-strength" &&
    type !== "recurring-game-weakness"
  ) {
    throw new Error(
      "Automated Operator Intelligence is limited to the approved recurring game-pattern family."
    );
  }
}

async function findIdempotentCandidateReplay(
  repository: OperatorIntelligenceRepository,
  claim: OperatorIntelligenceClaimRevision
): Promise<OperatorIntelligenceClaimRevision | null> {
  const lifecycle = await repository.listClaimLifecycle({
    operatorId: claim.operatorId,
    claimId: claim.claimId,
    purpose: claim.eligibility.purpose,
    asOf: claim.confidence.assessedAt,
    scope: claim.scope,
    page: createOperatorIntelligencePageRequest({ pageSize: 20, cursor: null }),
  });
  const replay = lifecycle.items.find(
    (item): item is OperatorIntelligenceClaimRevision =>
      item.status !== "deleted" && item.id === claim.id
  );
  return replay && JSON.stringify(replay) === JSON.stringify(claim)
    ? replay
    : null;
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
  submission:
    | OperatorIntelligenceCandidateSubmission
    | OperatorIntelligenceTransitionRequest
): void {
  const claims = "claim" in submission
    ? [submission.claim]
    : [submission.previous, submission.next];
  if (claims.some((claim) => Object.hasOwn(claim, "operatorId"))) {
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
