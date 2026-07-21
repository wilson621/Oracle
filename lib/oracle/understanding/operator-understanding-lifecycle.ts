import type {
  OperatorClaimLifecycleStatus,
  OperatorDeclarationRevision,
  OperatorDeclarationTombstone,
  OperatorDeclarationLifecycleStatus,
  OperatorIntelligenceClaimRevision,
  OperatorIntelligenceClaimTombstone,
} from "./operator-understanding-types";

const CLAIM_TRANSITIONS = {
  candidate: ["active", "expired", "deleted"],
  active: [
    "active",
    "disputed",
    "superseded",
    "expired",
    "deleted",
  ],
  disputed: [
    "active",
    "superseded",
    "expired",
    "deleted",
  ],
  superseded: ["deleted"],
  expired: ["candidate", "deleted"],
  deleted: [],
} as const satisfies Readonly<
  Record<OperatorClaimLifecycleStatus, readonly OperatorClaimLifecycleStatus[]>
>;

const DECLARATION_TRANSITIONS = {
  active: [
    "corrected",
    "superseded",
    "withdrawn",
    "deleted",
  ],
  corrected: [
    "active",
    "superseded",
    "withdrawn",
    "deleted",
  ],
  superseded: ["deleted"],
  withdrawn: ["deleted"],
  deleted: [],
} as const satisfies Readonly<
  Record<
    OperatorDeclarationLifecycleStatus,
    readonly OperatorDeclarationLifecycleStatus[]
  >
>;

export function assertOperatorClaimLifecycleTransition(
  from: OperatorClaimLifecycleStatus,
  to: OperatorClaimLifecycleStatus
): void {
  const allowed: readonly OperatorClaimLifecycleStatus[] =
    CLAIM_TRANSITIONS[from];

  if (!allowed.includes(to)) {
    throw new Error(
      `Operator Intelligence lifecycle transition '${from}' to '${to}' is invalid.`
    );
  }
}

export function isOperatorClaimLifecycleTransition(
  from: OperatorClaimLifecycleStatus,
  to: OperatorClaimLifecycleStatus
): boolean {
  const allowed: readonly OperatorClaimLifecycleStatus[] =
    CLAIM_TRANSITIONS[from];

  return allowed.includes(to);
}

export function assertOperatorDeclarationLifecycleTransition(
  from: OperatorDeclarationLifecycleStatus,
  to: OperatorDeclarationLifecycleStatus
): void {
  const allowed: readonly OperatorDeclarationLifecycleStatus[] =
    DECLARATION_TRANSITIONS[from];

  if (!allowed.includes(to)) {
    throw new Error(
      `Operator declaration lifecycle transition '${from}' to '${to}' is invalid.`
    );
  }
}

export function isOperatorDeclarationLifecycleTransition(
  from: OperatorDeclarationLifecycleStatus,
  to: OperatorDeclarationLifecycleStatus
): boolean {
  const allowed: readonly OperatorDeclarationLifecycleStatus[] =
    DECLARATION_TRANSITIONS[from];

  return allowed.includes(to);
}

export function assertOperatorClaimRevisionTransition(
  previous:
    | OperatorIntelligenceClaimRevision
    | OperatorIntelligenceClaimTombstone,
  next:
    | OperatorIntelligenceClaimRevision
    | OperatorIntelligenceClaimTombstone
): void {
  if (
    previous.claimId !== next.claimId ||
    previous.operatorId !== next.operatorId
  ) {
    throw new Error(
      "Operator Intelligence revisions must retain claim and Operator ownership."
    );
  }

  assertMonotonicRevision(
    previous.id,
    previous.revision,
    next.id,
    next.revision,
    next.supersedesRevisionId,
    "Operator Intelligence"
  );
  assertOperatorClaimLifecycleTransition(previous.status, next.status);
}

export function assertOperatorDeclarationRevisionTransition(
  previous: OperatorDeclarationRevision | OperatorDeclarationTombstone,
  next: OperatorDeclarationRevision | OperatorDeclarationTombstone
): void {
  if (
    previous.declarationId !== next.declarationId ||
    previous.operatorId !== next.operatorId
  ) {
    throw new Error(
      "Operator declaration revisions must retain declaration and Operator ownership."
    );
  }

  assertMonotonicRevision(
    previous.id,
    previous.revision,
    next.id,
    next.revision,
    next.supersedesRevisionId,
    "Operator declaration"
  );
  assertOperatorDeclarationLifecycleTransition(previous.status, next.status);
}

function assertMonotonicRevision(
  previousId: string,
  previousRevision: number,
  nextId: string,
  nextRevision: number,
  supersedesRevisionId: string | null,
  label: string
): void {
  if (
    nextId === previousId ||
    nextRevision !== previousRevision + 1 ||
    supersedesRevisionId !== previousId
  ) {
    throw new Error(
      `${label} revisions must be monotonic and explicitly supersede the prior revision.`
    );
  }
}
