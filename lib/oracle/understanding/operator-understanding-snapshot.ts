import {
  createOperatorDeclaredItem,
  createOperatorIntelligenceClaimRevision,
  createOperatorKnownItem,
  createOperatorStateUnderstandingItem,
  createOperatorUnknownItem,
} from "./operator-understanding-contract";
import {
  OPERATOR_UNDERSTANDING_CONTRACT_VERSION,
  OPERATOR_UNDERSTANDING_SNAPSHOT_CONTRACT,
  type OperatorEvidenceReference,
  type OperatorExplicitUnderstandingItem,
  type OperatorIntelligenceClaimRevision,
  type OperatorMemoryProjectionItem,
  type OperatorUnderstandingEpistemicClass,
  type OperatorUnderstandingSnapshot,
} from "./operator-understanding-types";
import {
  assertUniqueUnderstandingIds,
  assertUnderstandingSerializable,
  deepFreezeUnderstanding,
  requireNullableUnderstandingTimestamp,
  requireUnderstandingArray,
  requireUnderstandingRecord,
  requireUnderstandingSemanticVersion,
  requireUnderstandingString,
  requireUnderstandingTimestamp,
} from "./operator-understanding-validation";

const EPISTEMIC_CLASSES: readonly OperatorUnderstandingEpistemicClass[] = [
  "known",
  "declared",
  "observed",
  "inferred",
  "suspected",
  "unknown",
];

export const OPERATOR_UNDERSTANDING_MAX_INTELLIGENCE_ITEMS = 100;
export const OPERATOR_UNDERSTANDING_MAX_SNAPSHOT_ITEMS = 250;
export const OPERATOR_UNDERSTANDING_MAX_SNAPSHOT_BYTES = 512 * 1024;
export const OPERATOR_UNDERSTANDING_MAX_EVIDENCE_PER_CLAIM = 32;

export class OperatorUnderstandingSnapshotBudgetError extends Error {
  readonly code = "OPERATOR_UNDERSTANDING_SNAPSHOT_BUDGET_EXCEEDED";

  constructor(
    readonly budget:
      | "intelligence-items"
      | "total-items"
      | "serialized-payload"
      | "evidence-fan-out"
  ) {
    super(`Operator Understanding Snapshot ${budget} budget was exceeded.`);
    this.name = "OperatorUnderstandingSnapshotBudgetError";
  }
}

export function createOperatorUnderstandingSnapshot(
  value: unknown,
  evidenceReferences: readonly OperatorEvidenceReference[] = []
): OperatorUnderstandingSnapshot {
  assertUnderstandingSerializable(value, "snapshot");
  const input = requireUnderstandingRecord(value, "snapshot");
  const contract = requireUnderstandingRecord(input.contract, "snapshot.contract");

  if (
    contract.name !== OPERATOR_UNDERSTANDING_SNAPSHOT_CONTRACT ||
    contract.version !== OPERATOR_UNDERSTANDING_CONTRACT_VERSION
  ) {
    throw new Error(
      "Operator Understanding Snapshot contract identity or version is unsupported."
    );
  }

  const operatorId = requireUnderstandingString(
    input.operatorId,
    "snapshot.operatorId"
  );
  const generatedAt = requireUnderstandingTimestamp(
    input.generatedAt,
    "snapshot.generatedAt"
  );
  const asOf = requireUnderstandingTimestamp(input.asOf, "snapshot.asOf");
  const purpose = requireUnderstandingString(input.purpose, "snapshot.purpose");

  if (Date.parse(generatedAt) < Date.parse(asOf)) {
    throw new Error(
      "Operator Understanding Snapshot cannot be generated before its asOf time."
    );
  }

  const identity = createExplicitItems(input.identity, "snapshot.identity");
  const preferences = requireUnderstandingArray(
    input.preferences,
    "snapshot.preferences"
  ).map(createOperatorDeclaredItem);
  const goals = requireUnderstandingArray(input.goals, "snapshot.goals").map(
    createOperatorDeclaredItem
  );
  const state = requireUnderstandingArray(input.state, "snapshot.state").map(
    createOperatorStateUnderstandingItem
  );
  const intelligence = requireUnderstandingArray(
    input.intelligence,
    "snapshot.intelligence"
  ).map((claim) =>
    createOperatorIntelligenceClaimRevision(claim, evidenceReferences)
  );
  const unknowns = requireUnderstandingArray(
    input.unknowns,
    "snapshot.unknowns"
  ).map(createOperatorUnknownItem);
  const memory = createMemoryItems(input.memory, "snapshot.memory");

  if (intelligence.length > OPERATOR_UNDERSTANDING_MAX_INTELLIGENCE_ITEMS) {
    throw new OperatorUnderstandingSnapshotBudgetError("intelligence-items");
  }

  if (
    intelligence.some(
      (claim) =>
        claim.evidence.length > OPERATOR_UNDERSTANDING_MAX_EVIDENCE_PER_CLAIM
    )
  ) {
    throw new OperatorUnderstandingSnapshotBudgetError("evidence-fan-out");
  }

  const totalItems = identity.length + preferences.length + goals.length +
    state.length + memory.length + intelligence.length + unknowns.length;

  if (totalItems > OPERATOR_UNDERSTANDING_MAX_SNAPSHOT_ITEMS) {
    throw new OperatorUnderstandingSnapshotBudgetError("total-items");
  }

  const understoodItems = [
    ...identity,
    ...preferences,
    ...goals,
    ...state,
    ...intelligence,
    ...unknowns,
  ];

  assertUniqueUnderstandingIds(
    understoodItems.map((item) => item.id),
    "snapshot.items"
  );

  for (const item of understoodItems) {
    if (item.operatorId !== operatorId) {
      throw new Error(
        "Operator Understanding Snapshot cannot contain another Operator's understanding."
      );
    }
  }

  for (const item of [...identity, ...preferences, ...goals, ...state]) {
    if ("temporalValidity" in item) {
      assertCurrentAt(item.temporalValidity, asOf, item.id);
    }
  }

  for (const claim of intelligence) {
    assertConsumableClaim(claim, purpose, asOf);
  }

  const itemsById = new Map(understoodItems.map((item) => [item.id, item]));

  for (const retained of memory) {
    const retainedItem = itemsById.get(retained.understandingItemId);

    if (!retainedItem) {
      throw new Error(
        `Operator Understanding memory references unknown item '${retained.understandingItemId}'.`
      );
    }

    if (retainedItem.epistemic !== retained.epistemic) {
      throw new Error(
        `Operator Understanding memory must preserve the epistemic class of '${retained.understandingItemId}'.`
      );
    }
  }

  const snapshot: OperatorUnderstandingSnapshot = {
    contract: {
      name: OPERATOR_UNDERSTANDING_SNAPSHOT_CONTRACT,
      version: OPERATOR_UNDERSTANDING_CONTRACT_VERSION,
    },
    operatorId,
    generatedAt,
    asOf,
    purpose,
    policySetVersion: requireUnderstandingSemanticVersion(
      input.policySetVersion,
      "snapshot.policySetVersion"
    ),
    identity,
    preferences,
    goals,
    state,
    memory,
    intelligence,
    unknowns,
  };

  if (
    new TextEncoder().encode(JSON.stringify(snapshot)).byteLength >
      OPERATOR_UNDERSTANDING_MAX_SNAPSHOT_BYTES
  ) {
    throw new OperatorUnderstandingSnapshotBudgetError("serialized-payload");
  }

  return deepFreezeUnderstanding(snapshot);
}

function createExplicitItems(
  value: unknown,
  path: string
): OperatorExplicitUnderstandingItem[] {
  return requireUnderstandingArray(value, path).map((item, index) => {
    const input = requireUnderstandingRecord(item, `${path}[${index}]`);

    if (input.epistemic === "known") {
      return createOperatorKnownItem(item);
    }

    if (input.epistemic === "declared") {
      return createOperatorDeclaredItem(item);
    }

    throw new Error(
      "Operator identity supports known or declared understanding only."
    );
  });
}

function createMemoryItems(
  value: unknown,
  path: string
): OperatorMemoryProjectionItem[] {
  const items = requireUnderstandingArray(value, path).map((entry, index) => {
    const itemPath = `${path}[${index}]`;
    const item = requireUnderstandingRecord(entry, itemPath);
    const epistemic = item.epistemic;

    if (
      typeof epistemic !== "string" ||
      !EPISTEMIC_CLASSES.includes(
        epistemic as OperatorUnderstandingEpistemicClass
      )
    ) {
      throw new Error(
        `Operator Understanding '${itemPath}.epistemic' is unsupported.`
      );
    }

    return {
      understandingItemId: requireUnderstandingString(
        item.understandingItemId,
        `${itemPath}.understandingItemId`
      ),
      epistemic: epistemic as OperatorUnderstandingEpistemicClass,
      retainedAt: requireUnderstandingTimestamp(
        item.retainedAt,
        `${itemPath}.retainedAt`
      ),
      retentionClass: requireUnderstandingString(
        item.retentionClass,
        `${itemPath}.retentionClass`
      ),
      policyId: requireUnderstandingString(
        item.policyId,
        `${itemPath}.policyId`
      ),
      policyVersion: requireUnderstandingSemanticVersion(
        item.policyVersion,
        `${itemPath}.policyVersion`
      ),
      reassessAfter: requireNullableUnderstandingTimestamp(
        item.reassessAfter,
        `${itemPath}.reassessAfter`
      ),
    };
  });

  assertUniqueUnderstandingIds(
    items.map((item) => item.understandingItemId),
    path
  );

  return items;
}

function assertConsumableClaim(
  claim: OperatorIntelligenceClaimRevision,
  purpose: string,
  asOf: string
): void {
  if (
    claim.status !== "active" ||
    claim.epistemic !== "inferred" ||
    !claim.eligibility.eligible
  ) {
    throw new Error(
      "Operator Understanding Snapshot can contain only active, eligible inferred claims."
    );
  }

  if (claim.eligibility.purpose !== purpose) {
    throw new Error(
      "Operator Understanding claim eligibility purpose does not match its Snapshot purpose."
    );
  }

  assertCurrentAt(claim.temporalValidity, asOf, claim.id);
}

function assertCurrentAt(
  temporalValidity: Readonly<{
    effectiveFrom: string;
    validUntil: string | null;
  }>,
  asOf: string,
  itemId: string
): void {
  const instant = Date.parse(asOf);

  if (
    instant < Date.parse(temporalValidity.effectiveFrom) ||
    (temporalValidity.validUntil !== null &&
      instant >= Date.parse(temporalValidity.validUntil))
  ) {
    throw new Error(
      `Operator Understanding item '${itemId}' is not current at the Snapshot asOf time.`
    );
  }
}
