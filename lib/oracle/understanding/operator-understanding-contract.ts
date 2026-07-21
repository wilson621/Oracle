import {
  OPERATOR_EVIDENCE_REFERENCE_CONTRACT,
  OPERATOR_DATA_POLICY_REFERENCE_CONTRACT,
  OPERATOR_DECLARATION_REVISION_CONTRACT,
  OPERATOR_INTELLIGENCE_CLAIM_CONTRACT,
  OPERATOR_UNDERSTANDING_CONTRACT_VERSION,
  OPERATOR_UNDERSTANDING_EXPLANATION_CONTRACT,
  type OperatorClaimConfidence,
  type OperatorClaimEvidenceLink,
  type OperatorClaimLifecycleStatus,
  type OperatorDeclaredItem,
  type OperatorDataPolicyReference,
  type OperatorDeclarationRevision,
  type OperatorDeclarationTombstone,
  type OperatorEvidenceReference,
  type OperatorEvidenceSourceType,
  type OperatorIntelligenceClaimRevision,
  type OperatorIntelligenceClaimTombstone,
  type OperatorKnownItem,
  type OperatorNativeConfidence,
  type OperatorObservedItem,
  type OperatorStateUnderstandingItem,
  type OperatorUnderstandingEligibility,
  type OperatorUnderstandingEligibilityReason,
  type OperatorUnderstandingExplanation,
  type OperatorUnderstandingProvenance,
  type OperatorUnderstandingScope,
  type OperatorUnderstandingTemporalValidity,
  type OperatorUnknownItem,
} from "./operator-understanding-types";
import {
  assertNoRawEvidencePayload,
  assertUniqueUnderstandingIds,
  assertUnderstandingSerializable,
  cloneUnderstandingValue,
  deepFreezeUnderstanding,
  requireNullableUnderstandingString,
  requireNullableUnderstandingTimestamp,
  requireUnderstandingArray,
  requireUnderstandingInteger,
  requireUnderstandingNumber,
  requireUnderstandingRecord,
  requireUnderstandingSemanticVersion,
  requireUnderstandingString,
  requireUnderstandingStringArray,
  requireUnderstandingTimestamp,
} from "./operator-understanding-validation";

const SOURCE_TYPES: readonly OperatorEvidenceSourceType[] = [
  "session",
  "operator-declaration",
  "application-event",
  "game-integration-observation",
];

const ELIGIBILITY_REASONS:
  readonly OperatorUnderstandingEligibilityReason[] = [
    "candidate",
    "consent-absent",
    "consent-revoked",
    "disputed",
    "expired",
    "superseded",
    "deleted",
    "outside-purpose",
    "outside-scope",
    "insufficient-evidence",
  ];

const CLAIM_STATUSES: readonly Exclude<
  OperatorClaimLifecycleStatus,
  "deleted"
>[] = [
  "candidate",
  "active",
  "disputed",
  "superseded",
  "expired",
];

const DECLARATION_STATUSES = [
  "active",
  "corrected",
  "superseded",
  "withdrawn",
] as const;

const PROHIBITED_INFERENCE_TERMS = [
  "addiction",
  "behavioral-dna",
  "behavioural-dna",
  "burnout",
  "clinical-mental-state",
  "disability",
  "ethnicity",
  "frustration",
  "gender",
  "health",
  "learning-style",
  "motivation",
  "personality",
  "political-belief",
  "protected-characteristic",
  "psychological-conclusion",
  "race",
  "religious-belief",
  "religion",
  "sexuality",
];

export function createOperatorEvidenceReference(
  value: unknown
): OperatorEvidenceReference {
  assertUnderstandingSerializable(value, "evidence");
  assertNoRawEvidencePayload(value, "evidence");

  const input = requireUnderstandingRecord(value, "evidence");
  const observedAt = requireUnderstandingTimestamp(
    input.observedAt,
    "evidence.observedAt"
  );
  const capturedAt = requireUnderstandingTimestamp(
    input.capturedAt,
    "evidence.capturedAt"
  );

  if (Date.parse(capturedAt) < Date.parse(observedAt)) {
    throw new Error(
      "Operator Understanding evidence cannot be captured before it was observed."
    );
  }

  const evidence: OperatorEvidenceReference = {
    contract: createContract(
      input.contract,
      OPERATOR_EVIDENCE_REFERENCE_CONTRACT,
      "evidence.contract"
    ),
    id: requireUnderstandingString(input.id, "evidence.id"),
    operatorId: requireUnderstandingString(
      input.operatorId,
      "evidence.operatorId"
    ),
    sourceType: requireEnum(
      input.sourceType,
      SOURCE_TYPES,
      "evidence.sourceType"
    ),
    sourceOwnerId: requireUnderstandingString(
      input.sourceOwnerId,
      "evidence.sourceOwnerId"
    ),
    sourceRecordId: requireUnderstandingString(
      input.sourceRecordId,
      "evidence.sourceRecordId"
    ),
    observedAt,
    capturedAt,
    purpose: requireUnderstandingString(
      input.purpose,
      "evidence.purpose"
    ),
    scope: createScope(input.scope, "evidence.scope"),
    producer: createProducer(input.producer, "evidence.producer"),
    quality:
      input.quality === null
        ? null
        : createEvidenceQuality(input.quality, "evidence.quality"),
    summary: requireUnderstandingString(input.summary, "evidence.summary"),
    contentDigest: requireUnderstandingString(
      input.contentDigest,
      "evidence.contentDigest"
    ),
    retentionClass: requireUnderstandingString(
      input.retentionClass,
      "evidence.retentionClass"
    ),
    policyId: requireUnderstandingString(input.policyId, "evidence.policyId"),
    policyVersion: requireUnderstandingSemanticVersion(
      input.policyVersion,
      "evidence.policyVersion"
    ),
  };

  return deepFreezeUnderstanding(evidence);
}

export function createOperatorDataPolicyReference(
  value: unknown
): OperatorDataPolicyReference {
  assertUnderstandingSerializable(value, "dataPolicy");
  const input = requireUnderstandingRecord(value, "dataPolicy");

  return deepFreezeUnderstanding({
    contract: createContract(
      input.contract,
      OPERATOR_DATA_POLICY_REFERENCE_CONTRACT,
      "dataPolicy.contract"
    ),
    id: requireUnderstandingString(input.id, "dataPolicy.id"),
    policyVersion: requireUnderstandingSemanticVersion(
      input.policyVersion,
      "dataPolicy.policyVersion"
    ),
    purpose: requireUnderstandingString(input.purpose, "dataPolicy.purpose"),
    retentionClass: requireUnderstandingString(
      input.retentionClass,
      "dataPolicy.retentionClass"
    ),
  });
}

export function createOperatorIntelligenceClaimRevision(
  value: unknown,
  evidenceReferences: readonly OperatorEvidenceReference[]
): OperatorIntelligenceClaimRevision {
  assertUnderstandingSerializable(value, "claim");
  assertNoRawEvidencePayload(value, "claim");

  const input = requireUnderstandingRecord(value, "claim");
  const type = requireUnderstandingString(input.type, "claim.type");

  if (
    PROHIBITED_INFERENCE_TERMS.some((term) =>
      type.toLowerCase().includes(term)
    )
  ) {
    throw new Error(
      `Operator Understanding claim type '${type}' is prohibited for automated inference.`
    );
  }

  const status = requireEnum(
    input.status,
    CLAIM_STATUSES,
    "claim.status"
  );
  const epistemic = requireEnum(
    input.epistemic,
    ["suspected", "inferred"] as const,
    "claim.epistemic"
  );
  const operatorId = requireUnderstandingString(
    input.operatorId,
    "claim.operatorId"
  );
  const claimId = requireUnderstandingString(input.claimId, "claim.claimId");
  const revisionId = requireUnderstandingString(input.id, "claim.id");
  const links = createEvidenceLinks(
    input.evidence,
    claimId,
    revisionId,
    "claim.evidence"
  );
  const confidence = createConfidence(input.confidence, "claim.confidence");
  const explanation =
    input.explanation === null
      ? null
      : createExplanation(input.explanation, "claim.explanation");
  const eligibility = createEligibility(
    input.eligibility,
    "claim.eligibility"
  );
  const temporalValidity = createTemporalValidity(
    input.temporalValidity,
    "claim.temporalValidity"
  );
  const scope = createScope(input.scope, "claim.scope");
  const provenance = createProvenance(input.provenance, "claim.provenance");

  if (provenance.method !== "deterministic-engine") {
    throw new Error(
      "Operator Intelligence claims require deterministic engine provenance."
    );
  }

  if (
    temporalValidity.validUntil === null &&
    temporalValidity.reassessAfter === null &&
    temporalValidity.reassessmentTrigger === null
  ) {
    throw new Error(
      "Operator Intelligence requires an explicit expiry or reassessment rule."
    );
  }

  assertClaimState(status, epistemic, explanation, eligibility);
  assertClaimEvidence(
    operatorId,
    links,
    evidenceReferences,
    confidence,
    explanation,
    scope
  );

  const claim: OperatorIntelligenceClaimRevision = {
    contract: createContract(
      input.contract,
      OPERATOR_INTELLIGENCE_CLAIM_CONTRACT,
      "claim.contract"
    ),
    id: revisionId,
    claimId,
    operatorId,
    revision: requirePositiveInteger(input.revision, "claim.revision"),
    type,
    status,
    epistemic,
    value: cloneUnderstandingValue(input.value, "claim.value"),
    confidence,
    explanation,
    evidence: links,
    provenance,
    scope,
    temporalValidity,
    eligibility,
    policyId: requireUnderstandingString(input.policyId, "claim.policyId"),
    policyVersion: requireUnderstandingSemanticVersion(
      input.policyVersion,
      "claim.policyVersion"
    ),
    supersedesRevisionId: requireNullableUnderstandingString(
      input.supersedesRevisionId,
      "claim.supersedesRevisionId"
    ),
  };

  return deepFreezeUnderstanding(claim);
}

export function createOperatorIntelligenceClaimTombstone(
  value: unknown
): OperatorIntelligenceClaimTombstone {
  assertUnderstandingSerializable(value, "claimTombstone");
  const input = requireUnderstandingRecord(value, "claimTombstone");

  assertContentFreeTombstone(input, "claimTombstone");

  if (input.status !== "deleted") {
    throw new Error(
      "Operator Intelligence tombstones must have deleted lifecycle status."
    );
  }

  return deepFreezeUnderstanding({
    contract: createContract(
      input.contract,
      OPERATOR_INTELLIGENCE_CLAIM_CONTRACT,
      "claimTombstone.contract"
    ),
    id: requireUnderstandingString(input.id, "claimTombstone.id"),
    claimId: requireUnderstandingString(
      input.claimId,
      "claimTombstone.claimId"
    ),
    operatorId: requireUnderstandingString(
      input.operatorId,
      "claimTombstone.operatorId"
    ),
    revision: requirePositiveInteger(
      input.revision,
      "claimTombstone.revision"
    ),
    status: "deleted",
    deletedAt: requireUnderstandingTimestamp(
      input.deletedAt,
      "claimTombstone.deletedAt"
    ),
    policyId: requireUnderstandingString(
      input.policyId,
      "claimTombstone.policyId"
    ),
    policyVersion: requireUnderstandingSemanticVersion(
      input.policyVersion,
      "claimTombstone.policyVersion"
    ),
    supersedesRevisionId: requireUnderstandingString(
      input.supersedesRevisionId,
      "claimTombstone.supersedesRevisionId"
    ),
  });
}

export function createOperatorDeclarationRevision(
  value: unknown
): OperatorDeclarationRevision {
  assertUnderstandingSerializable(value, "declaration");
  assertNoRawEvidencePayload(value, "declaration");
  const input = requireUnderstandingRecord(value, "declaration");

  if (
    input.epistemic !== "known" &&
    input.epistemic !== "declared"
  ) {
    throw new Error(
      "Operator declarations must remain structurally known or declared."
    );
  }

  if (input.confidence !== null) {
    throw new Error(
      "Operator declarations cannot carry inference confidence."
    );
  }

  return deepFreezeUnderstanding({
    contract: createContract(
      input.contract,
      OPERATOR_DECLARATION_REVISION_CONTRACT,
      "declaration.contract"
    ),
    id: requireUnderstandingString(input.id, "declaration.id"),
    declarationId: requireUnderstandingString(
      input.declarationId,
      "declaration.declarationId"
    ),
    operatorId: requireUnderstandingString(
      input.operatorId,
      "declaration.operatorId"
    ),
    revision: requirePositiveInteger(input.revision, "declaration.revision"),
    domain: requireEnum(
      input.domain,
      ["identity", "preference", "goal"] as const,
      "declaration.domain"
    ),
    key: requireUnderstandingString(input.key, "declaration.key"),
    status: requireEnum(
      input.status,
      DECLARATION_STATUSES,
      "declaration.status"
    ),
    epistemic: input.epistemic,
    value: cloneUnderstandingValue(input.value, "declaration.value"),
    confidence: null,
    provenance: createProvenance(
      input.provenance,
      "declaration.provenance"
    ),
    scope: createScope(input.scope, "declaration.scope"),
    temporalValidity: createTemporalValidity(
      input.temporalValidity,
      "declaration.temporalValidity"
    ),
    policyId: requireUnderstandingString(input.policyId, "declaration.policyId"),
    policyVersion: requireUnderstandingSemanticVersion(
      input.policyVersion,
      "declaration.policyVersion"
    ),
    supersedesRevisionId: requireNullableUnderstandingString(
      input.supersedesRevisionId,
      "declaration.supersedesRevisionId"
    ),
  });
}

export function createOperatorDeclarationTombstone(
  value: unknown
): OperatorDeclarationTombstone {
  assertUnderstandingSerializable(value, "declarationTombstone");
  const input = requireUnderstandingRecord(value, "declarationTombstone");

  assertContentFreeTombstone(input, "declarationTombstone");

  if (input.status !== "deleted") {
    throw new Error(
      "Operator declaration tombstones must have deleted lifecycle status."
    );
  }

  return deepFreezeUnderstanding({
    contract: createContract(
      input.contract,
      OPERATOR_DECLARATION_REVISION_CONTRACT,
      "declarationTombstone.contract"
    ),
    id: requireUnderstandingString(input.id, "declarationTombstone.id"),
    declarationId: requireUnderstandingString(
      input.declarationId,
      "declarationTombstone.declarationId"
    ),
    operatorId: requireUnderstandingString(
      input.operatorId,
      "declarationTombstone.operatorId"
    ),
    revision: requirePositiveInteger(
      input.revision,
      "declarationTombstone.revision"
    ),
    status: "deleted",
    deletedAt: requireUnderstandingTimestamp(
      input.deletedAt,
      "declarationTombstone.deletedAt"
    ),
    policyId: requireUnderstandingString(
      input.policyId,
      "declarationTombstone.policyId"
    ),
    policyVersion: requireUnderstandingSemanticVersion(
      input.policyVersion,
      "declarationTombstone.policyVersion"
    ),
    supersedesRevisionId: requireUnderstandingString(
      input.supersedesRevisionId,
      "declarationTombstone.supersedesRevisionId"
    ),
  });
}

export function createOperatorKnownItem(value: unknown): OperatorKnownItem {
  const input = createExplicitBase(value, "known", "knownItem");

  return deepFreezeUnderstanding({
    ...input,
    epistemic: "known" as const,
    confidence: null,
  });
}

export function createOperatorDeclaredItem(
  value: unknown
): OperatorDeclaredItem {
  const input = createExplicitBase(value, "declared", "declaredItem");

  return deepFreezeUnderstanding({
    ...input,
    epistemic: "declared" as const,
    confidence: null,
  });
}

export function createOperatorObservedItem(
  value: unknown
): OperatorObservedItem {
  assertUnderstandingSerializable(value, "observedItem");
  const input = requireUnderstandingRecord(value, "observedItem");

  if (input.epistemic !== "observed" || input.confidence !== null) {
    throw new Error(
      "Observed Operator Understanding must be structurally observed and cannot carry claim confidence."
    );
  }

  const provenance = createProvenance(
    input.provenance,
    "observedItem.provenance"
  );

  if (provenance.method !== "direct-observation") {
    throw new Error(
      "Observed Operator Understanding requires direct-observation provenance."
    );
  }

  return deepFreezeUnderstanding({
    id: requireUnderstandingString(input.id, "observedItem.id"),
    operatorId: requireUnderstandingString(
      input.operatorId,
      "observedItem.operatorId"
    ),
    key: requireUnderstandingString(input.key, "observedItem.key"),
    epistemic: "observed" as const,
    value: cloneUnderstandingValue(input.value, "observedItem.value"),
    confidence: null,
    evidenceReferenceId: requireUnderstandingString(
      input.evidenceReferenceId,
      "observedItem.evidenceReferenceId"
    ),
    provenance,
    scope: createScope(input.scope, "observedItem.scope"),
    temporalValidity: createTemporalValidity(
      input.temporalValidity,
      "observedItem.temporalValidity"
    ),
  });
}

export function createOperatorUnknownItem(value: unknown): OperatorUnknownItem {
  assertUnderstandingSerializable(value, "unknownItem");
  const input = requireUnderstandingRecord(value, "unknownItem");

  if (
    input.epistemic !== "unknown" ||
    input.value !== null ||
    input.confidence !== null
  ) {
    throw new Error(
      "Unknown Operator Understanding must have a null value and no confidence."
    );
  }

  return deepFreezeUnderstanding({
    id: requireUnderstandingString(input.id, "unknownItem.id"),
    operatorId: requireUnderstandingString(
      input.operatorId,
      "unknownItem.operatorId"
    ),
    key: requireUnderstandingString(input.key, "unknownItem.key"),
    epistemic: "unknown" as const,
    value: null,
    confidence: null,
    reason: requireUnderstandingString(input.reason, "unknownItem.reason"),
    requiredEvidence: requireUnderstandingStringArray(
      input.requiredEvidence,
      "unknownItem.requiredEvidence"
    ),
    scope: createScope(input.scope, "unknownItem.scope"),
  });
}

export function createOperatorStateUnderstandingItem(
  value: unknown
): OperatorStateUnderstandingItem {
  const input = requireUnderstandingRecord(value, "stateItem");

  switch (input.epistemic) {
    case "known":
      return createOperatorKnownItem(value);
    case "declared":
      return createOperatorDeclaredItem(value);
    case "observed":
      return createOperatorObservedItem(value);
    case "unknown":
      return createOperatorUnknownItem(value);
    default:
      throw new Error(
        "Temporary Operator State supports known, declared, observed or unknown items only in Phase 2."
      );
  }
}

function createExplicitBase(
  value: unknown,
  epistemic: "known" | "declared",
  path: string
) {
  assertUnderstandingSerializable(value, path);
  const input = requireUnderstandingRecord(value, path);

  if (input.epistemic !== epistemic || input.confidence !== null) {
    throw new Error(
      `${epistemic} Operator Understanding cannot carry inference confidence.`
    );
  }

  const provenance = createProvenance(input.provenance, `${path}.provenance`);
  const requiredMethod =
    epistemic === "known"
      ? "authoritative-source"
      : "operator-declaration";

  if (provenance.method !== requiredMethod) {
    throw new Error(
      `${epistemic} Operator Understanding requires ${requiredMethod} provenance.`
    );
  }

  return {
    id: requireUnderstandingString(input.id, `${path}.id`),
    operatorId: requireUnderstandingString(
      input.operatorId,
      `${path}.operatorId`
    ),
    key: requireUnderstandingString(input.key, `${path}.key`),
    value: cloneUnderstandingValue(input.value, `${path}.value`),
    provenance,
    scope: createScope(input.scope, `${path}.scope`),
    temporalValidity: createTemporalValidity(
      input.temporalValidity,
      `${path}.temporalValidity`
    ),
    revisionId: requireUnderstandingString(
      input.revisionId,
      `${path}.revisionId`
    ),
  };
}

function createContract<Name extends string>(
  value: unknown,
  name: Name,
  path: string
) {
  const contract = requireUnderstandingRecord(value, path);

  if (
    contract.name !== name ||
    contract.version !== OPERATOR_UNDERSTANDING_CONTRACT_VERSION
  ) {
    throw new Error(
      `Operator Understanding '${path}' identity or version is unsupported.`
    );
  }

  return {
    name,
    version: OPERATOR_UNDERSTANDING_CONTRACT_VERSION,
  } as const;
}

function createScope(value: unknown, path: string): OperatorUnderstandingScope {
  const scope = requireUnderstandingRecord(value, path);

  switch (scope.type) {
    case "operator":
      return { type: "operator" };
    case "application":
      return {
        type: "application",
        applicationId: requireUnderstandingString(
          scope.applicationId,
          `${path}.applicationId`
        ),
      };
    case "game-integration":
      return {
        type: "game-integration",
        integrationId: requireUnderstandingString(
          scope.integrationId,
          `${path}.integrationId`
        ),
        integrationVersion: requireUnderstandingSemanticVersion(
          scope.integrationVersion,
          `${path}.integrationVersion`
        ),
      };
    case "session":
      return {
        type: "session",
        sessionId: requireUnderstandingString(
          scope.sessionId,
          `${path}.sessionId`
        ),
        integrationId: requireUnderstandingString(
          scope.integrationId,
          `${path}.integrationId`
        ),
        integrationVersion: requireUnderstandingSemanticVersion(
          scope.integrationVersion,
          `${path}.integrationVersion`
        ),
      };
    default:
      throw new Error(`Operator Understanding '${path}.type' is unsupported.`);
  }
}

function createProducer(value: unknown, path: string) {
  const producer = requireUnderstandingRecord(value, path);

  return {
    id: requireUnderstandingString(producer.id, `${path}.id`),
    version: requireUnderstandingSemanticVersion(
      producer.version,
      `${path}.version`
    ),
    method: requireEnum(
      producer.method,
      [
        "direct-observation",
        "operator-declaration",
        "deterministic-transformation",
      ] as const,
      `${path}.method`
    ),
  };
}

function createProvenance(
  value: unknown,
  path: string
): OperatorUnderstandingProvenance {
  const provenance = requireUnderstandingRecord(value, path);

  return {
    sourceOwnerType: requireEnum(
      provenance.sourceOwnerType,
      [
        "operator-service",
        "session",
        "application",
        "game-integration",
        "oracle-engine",
      ] as const,
      `${path}.sourceOwnerType`
    ),
    sourceOwnerId: requireUnderstandingString(
      provenance.sourceOwnerId,
      `${path}.sourceOwnerId`
    ),
    method: requireEnum(
      provenance.method,
      [
        "authoritative-source",
        "operator-declaration",
        "direct-observation",
        "deterministic-engine",
      ] as const,
      `${path}.method`
    ),
    producerId: requireUnderstandingString(
      provenance.producerId,
      `${path}.producerId`
    ),
    producerVersion: requireUnderstandingSemanticVersion(
      provenance.producerVersion,
      `${path}.producerVersion`
    ),
    generatedAt: requireUnderstandingTimestamp(
      provenance.generatedAt,
      `${path}.generatedAt`
    ),
  };
}

function createTemporalValidity(
  value: unknown,
  path: string
): OperatorUnderstandingTemporalValidity {
  const temporal = requireUnderstandingRecord(value, path);
  const effectiveFrom = requireUnderstandingTimestamp(
    temporal.effectiveFrom,
    `${path}.effectiveFrom`
  );
  const validUntil = requireNullableUnderstandingTimestamp(
    temporal.validUntil,
    `${path}.validUntil`
  );

  if (
    validUntil !== null &&
    Date.parse(validUntil) < Date.parse(effectiveFrom)
  ) {
    throw new Error(
      `Operator Understanding '${path}.validUntil' cannot precede effectiveFrom.`
    );
  }

  return {
    effectiveFrom,
    validUntil,
    lastAssessedAt: requireNullableUnderstandingTimestamp(
      temporal.lastAssessedAt,
      `${path}.lastAssessedAt`
    ),
    reassessAfter: requireNullableUnderstandingTimestamp(
      temporal.reassessAfter,
      `${path}.reassessAfter`
    ),
    reassessmentTrigger: requireNullableUnderstandingString(
      temporal.reassessmentTrigger,
      `${path}.reassessmentTrigger`
    ),
  };
}

function createConfidence(value: unknown, path: string): OperatorClaimConfidence {
  const confidence = requireUnderstandingRecord(value, path);
  const score = requireUnderstandingNumber(confidence.score, `${path}.score`);

  if (score < 0 || score > 1) {
    throw new Error(
      `Operator Understanding '${path}.score' must be between 0 and 1.`
    );
  }

  return {
    score,
    rationale: requireUnderstandingString(
      confidence.rationale,
      `${path}.rationale`
    ),
    supportingEvidenceCount: requireUnderstandingInteger(
      confidence.supportingEvidenceCount,
      `${path}.supportingEvidenceCount`
    ),
    contradictingEvidenceCount: requireUnderstandingInteger(
      confidence.contradictingEvidenceCount,
      `${path}.contradictingEvidenceCount`
    ),
    policyId: requireUnderstandingString(
      confidence.policyId,
      `${path}.policyId`
    ),
    policyVersion: requireUnderstandingSemanticVersion(
      confidence.policyVersion,
      `${path}.policyVersion`
    ),
    assessedAt: requireUnderstandingTimestamp(
      confidence.assessedAt,
      `${path}.assessedAt`
    ),
    producerNative:
      confidence.producerNative === null
        ? null
        : createNativeConfidence(
            confidence.producerNative,
            `${path}.producerNative`
          ),
  };
}

function createEvidenceQuality(value: unknown, path: string) {
  const quality = requireUnderstandingRecord(value, path);
  const score = requireUnderstandingNumber(quality.score, `${path}.score`);

  if (score < 0 || score > 1) {
    throw new Error(
      `Operator Understanding '${path}.score' must be between 0 and 1.`
    );
  }

  return {
    score,
    rationale: requireUnderstandingString(
      quality.rationale,
      `${path}.rationale`
    ),
    policyId: requireUnderstandingString(quality.policyId, `${path}.policyId`),
    policyVersion: requireUnderstandingSemanticVersion(
      quality.policyVersion,
      `${path}.policyVersion`
    ),
    assessedAt: requireUnderstandingTimestamp(
      quality.assessedAt,
      `${path}.assessedAt`
    ),
  };
}

function createNativeConfidence(
  value: unknown,
  path: string
): OperatorNativeConfidence {
  const confidence = requireUnderstandingRecord(value, path);
  const scale = requireUnderstandingRecord(confidence.scale, `${path}.scale`);
  const minimum = requireUnderstandingNumber(
    scale.minimum,
    `${path}.scale.minimum`
  );
  const maximum = requireUnderstandingNumber(
    scale.maximum,
    `${path}.scale.maximum`
  );
  const nativeValue = requireUnderstandingNumber(
    confidence.value,
    `${path}.value`
  );

  if (minimum >= maximum || nativeValue < minimum || nativeValue > maximum) {
    throw new Error(
      `Operator Understanding '${path}' has an invalid native confidence scale.`
    );
  }

  return {
    value: nativeValue,
    scale: { minimum, maximum },
    label: requireNullableUnderstandingString(
      confidence.label,
      `${path}.label`
    ),
    rationale: requireNullableUnderstandingString(
      confidence.rationale,
      `${path}.rationale`
    ),
  };
}

function createExplanation(
  value: unknown,
  path: string
): OperatorUnderstandingExplanation {
  const explanation = requireUnderstandingRecord(value, path);
  const method = requireUnderstandingRecord(
    explanation.method,
    `${path}.method`
  );
  const reasonCodes = requireUnderstandingStringArray(
    explanation.reasonCodes,
    `${path}.reasonCodes`
  );
  const evidenceReferenceIds = requireUnderstandingStringArray(
    explanation.evidenceReferenceIds,
    `${path}.evidenceReferenceIds`
  );

  if (reasonCodes.length === 0 || evidenceReferenceIds.length === 0) {
    throw new Error(
      "Accepted Operator Understanding explanations require reason codes and evidence references."
    );
  }

  const summary = requireUnderstandingString(
    explanation.summary,
    `${path}.summary`
  );

  if (summary.length > 500) {
    throw new Error(
      "Operator Understanding explanation summaries must remain concise."
    );
  }

  if (method.kind !== "deterministic-template") {
    throw new Error(
      "Operator Understanding explanations must use deterministic templates."
    );
  }

  assertUniqueUnderstandingIds(reasonCodes, `${path}.reasonCodes`);
  assertUniqueUnderstandingIds(
    evidenceReferenceIds,
    `${path}.evidenceReferenceIds`
  );

  return {
    contract: createContract(
      explanation.contract,
      OPERATOR_UNDERSTANDING_EXPLANATION_CONTRACT,
      `${path}.contract`
    ),
    summary,
    reasonCodes,
    evidenceReferenceIds,
    method: {
      kind: "deterministic-template",
      id: requireUnderstandingString(method.id, `${path}.method.id`),
      version: requireUnderstandingSemanticVersion(
        method.version,
        `${path}.method.version`
      ),
    },
    policyVersion: requireUnderstandingSemanticVersion(
      explanation.policyVersion,
      `${path}.policyVersion`
    ),
    generatedAt: requireUnderstandingTimestamp(
      explanation.generatedAt,
      `${path}.generatedAt`
    ),
  };
}

function createEligibility(
  value: unknown,
  path: string
): OperatorUnderstandingEligibility {
  const eligibility = requireUnderstandingRecord(value, path);

  if (typeof eligibility.eligible !== "boolean") {
    throw new Error(`Operator Understanding '${path}.eligible' must be boolean.`);
  }

  const reasons = requireUnderstandingArray(
    eligibility.reasons,
    `${path}.reasons`
  ).map((reason, index) =>
    requireEnum(reason, ELIGIBILITY_REASONS, `${path}.reasons[${index}]`)
  );

  if (eligibility.eligible === (reasons.length > 0)) {
    throw new Error(
      `Operator Understanding '${path}' eligibility and reasons disagree.`
    );
  }

  return {
    eligible: eligibility.eligible,
    reasons,
    purpose: requireUnderstandingString(eligibility.purpose, `${path}.purpose`),
    policyId: requireUnderstandingString(
      eligibility.policyId,
      `${path}.policyId`
    ),
    policyVersion: requireUnderstandingSemanticVersion(
      eligibility.policyVersion,
      `${path}.policyVersion`
    ),
    assessedAt: requireUnderstandingTimestamp(
      eligibility.assessedAt,
      `${path}.assessedAt`
    ),
  };
}

function createEvidenceLinks(
  value: unknown,
  claimId: string,
  revisionId: string,
  path: string
): OperatorClaimEvidenceLink[] {
  const links = requireUnderstandingArray(value, path).map((entry, index) => {
    const linkPath = `${path}[${index}]`;
    const link = requireUnderstandingRecord(entry, linkPath);
    const linkedClaimId = requireUnderstandingString(
      link.claimId,
      `${linkPath}.claimId`
    );
    const linkedRevisionId = requireUnderstandingString(
      link.claimRevisionId,
      `${linkPath}.claimRevisionId`
    );

    if (linkedClaimId !== claimId || linkedRevisionId !== revisionId) {
      throw new Error(
        `Operator Understanding '${linkPath}' must reference its owning claim revision.`
      );
    }

    return {
      claimId: linkedClaimId,
      claimRevisionId: linkedRevisionId,
      evidenceReferenceId: requireUnderstandingString(
        link.evidenceReferenceId,
        `${linkPath}.evidenceReferenceId`
      ),
      relationship: requireEnum(
        link.relationship,
        ["support", "contradict"] as const,
        `${linkPath}.relationship`
      ),
      rationale: requireUnderstandingString(
        link.rationale,
        `${linkPath}.rationale`
      ),
      linkedAt: requireUnderstandingTimestamp(
        link.linkedAt,
        `${linkPath}.linkedAt`
      ),
    };
  });

  assertUniqueUnderstandingIds(
    links.map((link) => link.evidenceReferenceId),
    path
  );

  return links;
}

function assertClaimState(
  status: Exclude<OperatorClaimLifecycleStatus, "deleted">,
  epistemic: "suspected" | "inferred",
  explanation: OperatorUnderstandingExplanation | null,
  eligibility: OperatorUnderstandingEligibility
): void {
  if (status === "candidate") {
    if (
      epistemic !== "suspected" ||
      eligibility.eligible ||
      !eligibility.reasons.includes("candidate")
    ) {
      throw new Error(
        "Candidate Operator Intelligence must be suspected and ineligible."
      );
    }
    return;
  }

  if (epistemic !== "inferred" || explanation === null) {
    throw new Error(
      "Accepted Operator Intelligence must be inferred and carry a durable explanation."
    );
  }

  if (status === "active" && !eligibility.eligible) {
    throw new Error(
      "Active Operator Intelligence must be eligible for its assessed purpose."
    );
  }

  if (status !== "active" && eligibility.eligible) {
    throw new Error(
      "Non-active Operator Intelligence cannot be eligible for consumption."
    );
  }

  if (status !== "active" && !eligibility.reasons.includes(status)) {
    throw new Error(
      `Ineligible ${status} Operator Intelligence must record its lifecycle reason.`
    );
  }
}

function assertClaimEvidence(
  operatorId: string,
  links: readonly OperatorClaimEvidenceLink[],
  evidenceReferences: readonly OperatorEvidenceReference[],
  confidence: OperatorClaimConfidence,
  explanation: OperatorUnderstandingExplanation | null,
  claimScope: OperatorUnderstandingScope
): void {
  const references = new Map(
    evidenceReferences.map((evidence) => [evidence.id, evidence])
  );

  for (const link of links) {
    const evidence = references.get(link.evidenceReferenceId);

    if (!evidence) {
      throw new Error(
        `Operator Intelligence references unknown evidence '${link.evidenceReferenceId}'.`
      );
    }

    if (evidence.operatorId !== operatorId) {
      throw new Error(
        "Operator Intelligence cannot use evidence owned by another Operator."
      );
    }


    assertEvidenceScopeSupportsClaim(evidence.scope, claimScope);
  }

  const supportIds = links
    .filter((link) => link.relationship === "support")
    .map((link) => link.evidenceReferenceId);
  const contradictionCount = links.filter(
    (link) => link.relationship === "contradict"
  ).length;

  if (
    confidence.supportingEvidenceCount !== supportIds.length ||
    confidence.contradictingEvidenceCount !== contradictionCount
  ) {
    throw new Error(
      "Operator Intelligence confidence evidence counts must match its evidence relationships."
    );
  }

  if (explanation !== null) {
    for (const evidenceId of explanation.evidenceReferenceIds) {
      if (!supportIds.includes(evidenceId)) {
        throw new Error(
          `Operator Understanding explanation references unsupported evidence '${evidenceId}'.`
        );
      }
    }
  }
}

function assertEvidenceScopeSupportsClaim(
  evidenceScope: OperatorUnderstandingScope,
  claimScope: OperatorUnderstandingScope
): void {
  if (claimScope.type === "operator") {
    if (evidenceScope.type !== "operator") {
      throw new Error(
        "Game-, Application- or Session-scoped evidence cannot be promoted to Operator-wide understanding without an approved portability policy."
      );
    }
    return;
  }

  if (claimScope.type === "application") {
    if (
      evidenceScope.type !== "application" ||
      evidenceScope.applicationId !== claimScope.applicationId
    ) {
      throw new Error(
        "Operator Intelligence evidence cannot cross Application scope."
      );
    }
    return;
  }

  if (claimScope.type === "game-integration") {
    const sameIntegration =
      (evidenceScope.type === "game-integration" ||
        evidenceScope.type === "session") &&
      evidenceScope.integrationId === claimScope.integrationId &&
      evidenceScope.integrationVersion === claimScope.integrationVersion;

    if (!sameIntegration) {
      throw new Error(
        "Operator Intelligence evidence cannot cross Game Integration scope."
      );
    }
    return;
  }

  if (
    evidenceScope.type !== "session" ||
    evidenceScope.sessionId !== claimScope.sessionId ||
    evidenceScope.integrationId !== claimScope.integrationId ||
    evidenceScope.integrationVersion !== claimScope.integrationVersion
  ) {
    throw new Error(
      "Session-specific Operator Intelligence requires evidence from the same Session and Game Integration."
    );
  }
}

function requirePositiveInteger(value: unknown, path: string): number {
  const integer = requireUnderstandingInteger(value, path);

  if (integer === 0) {
    throw new Error(`Operator Understanding '${path}' must be greater than zero.`);
  }

  return integer;
}

function assertContentFreeTombstone(
  input: Record<string, unknown>,
  path: string
): void {
  const allowed = path === "claimTombstone"
    ? new Set([
        "contract",
        "id",
        "claimId",
        "operatorId",
        "revision",
        "status",
        "deletedAt",
        "policyId",
        "policyVersion",
        "supersedesRevisionId",
      ])
    : new Set([
        "contract",
        "id",
        "declarationId",
        "operatorId",
        "revision",
        "status",
        "deletedAt",
        "policyId",
        "policyVersion",
        "supersedesRevisionId",
      ]);

  for (const key of Object.keys(input)) {
    if (!allowed.has(key)) {
      throw new Error(
        `Operator Understanding '${path}' tombstones must not retain '${key}' content.`
      );
    }
  }
}

function requireEnum<const Values extends readonly string[]>(
  value: unknown,
  values: Values,
  path: string
): Values[number] {
  if (typeof value === "string" && values.includes(value)) {
    return value as Values[number];
  }

  throw new Error(`Operator Understanding '${path}' is unsupported.`);
}
