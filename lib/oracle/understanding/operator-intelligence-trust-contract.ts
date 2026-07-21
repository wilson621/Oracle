import {
  createOperatorEvidenceReference,
} from "./operator-understanding-contract";
import {
  OPERATOR_UNDERSTANDING_CONTRACT_VERSION,
  type OperatorUnderstandingContract,
  type OperatorUnderstandingProvenance,
} from "./operator-understanding-types";
import {
  OPERATOR_CONSENT_DECISION_CONTRACT,
  OPERATOR_DATA_POLICY_DEFINITION_CONTRACT,
  OPERATOR_EVIDENCE_DISPOSITION_CONTRACT,
  OPERATOR_GAME_PATTERN_INTELLIGENCE_PURPOSE,
  OPERATOR_GAME_SESSION_EVIDENCE_ADMISSION_CONTRACT,
  type OperatorConsentDecision,
  type OperatorDataPolicyDefinition,
  type OperatorEvidenceDisposition,
  type OperatorEvidenceDispositionType,
  type OperatorEvidenceSourceClassification,
  type OperatorGamePatternClaimType,
  type OperatorGameSessionEvidenceAdmission,
  type OperatorGameSessionEvidenceAdmissionContext,
  type OperatorGameSessionEvidenceAdmissionInput,
} from "./operator-intelligence-trust-types";
import {
  assertUniqueUnderstandingIds,
  assertUnderstandingSerializable,
  deepFreezeUnderstanding,
  requireNullableUnderstandingTimestamp,
  requireUnderstandingArray,
  requireUnderstandingInteger,
  requireUnderstandingNumber,
  requireUnderstandingRecord,
  requireUnderstandingSemanticVersion,
  requireUnderstandingString,
  requireUnderstandingTimestamp,
} from "./operator-understanding-validation";

const GAME_PATTERN_CLAIM_TYPES: readonly OperatorGamePatternClaimType[] = [
  "recurring-game-strength",
  "recurring-game-weakness",
];

const SOURCE_CLASSIFICATIONS:
  readonly OperatorEvidenceSourceClassification[] = [
    "game-integration-direct-observation",
    "game-integration-deterministic-transformation",
  ];

const EVIDENCE_DISPOSITIONS: readonly OperatorEvidenceDispositionType[] = [
  "available",
  "withdrawn",
  "source-deleted",
  "retention-expired",
];

const SHA_256_DIGEST_PATTERN = /^sha256:[0-9a-f]{64}$/;

export function createOperatorDataPolicyDefinition(
  value: unknown
): OperatorDataPolicyDefinition {
  assertUnderstandingSerializable(value, "policy");
  const input = requireUnderstandingRecord(value, "policy");
  rejectField(input, "operatorId", "policy");

  const effectiveFrom = requireUnderstandingTimestamp(
    input.effectiveFrom,
    "policy.effectiveFrom"
  );
  const effectiveUntil = requireNullableUnderstandingTimestamp(
    input.effectiveUntil,
    "policy.effectiveUntil"
  );
  assertOrderedInterval(effectiveFrom, effectiveUntil, "policy");

  const allowedClaimTypes = createEnumArray(
    input.allowedClaimTypes,
    GAME_PATTERN_CLAIM_TYPES,
    "policy.allowedClaimTypes"
  );
  const evidenceAdmission = requireUnderstandingRecord(
    input.evidenceAdmission,
    "policy.evidenceAdmission"
  );
  const minimumQualityScore = requireUnderstandingNumber(
    evidenceAdmission.minimumQualityScore,
    "policy.evidenceAdmission.minimumQualityScore"
  );

  if (minimumQualityScore < 0 || minimumQualityScore > 1) {
    throw new Error(
      "Operator Intelligence policy minimum evidence quality must be between 0 and 1."
    );
  }

  const allowedSourceClassifications = createEnumArray(
    evidenceAdmission.allowedSourceClassifications,
    SOURCE_CLASSIFICATIONS,
    "policy.evidenceAdmission.allowedSourceClassifications"
  );
  const retention = requireUnderstandingRecord(
    input.retention,
    "policy.retention"
  );
  const claimLifecycle = requireUnderstandingRecord(
    input.claimLifecycle,
    "policy.claimLifecycle"
  );
  const maximumValidityDays = requirePositiveInteger(
    claimLifecycle.maximumValidityDays,
    "policy.claimLifecycle.maximumValidityDays"
  );
  const reassessAfterDays = requirePositiveInteger(
    claimLifecycle.reassessAfterDays,
    "policy.claimLifecycle.reassessAfterDays"
  );

  if (reassessAfterDays > maximumValidityDays) {
    throw new Error(
      "Operator Intelligence policy reassessment cannot occur after maximum claim validity."
    );
  }

  return deepFreezeUnderstanding({
    contract: createContract(
      input.contract,
      OPERATOR_DATA_POLICY_DEFINITION_CONTRACT,
      "policy.contract"
    ),
    id: requireUnderstandingString(input.id, "policy.id"),
    policyVersion: requireUnderstandingSemanticVersion(
      input.policyVersion,
      "policy.policyVersion"
    ),
    purpose: requireUnderstandingString(input.purpose, "policy.purpose"),
    retentionClass: requireUnderstandingString(
      input.retentionClass,
      "policy.retentionClass"
    ),
    effectiveFrom,
    effectiveUntil,
    allowedClaimTypes,
    evidenceAdmission: {
      minimumQualityScore,
      allowedSourceClassifications,
    },
    retention: {
      evidenceReferenceDays: requirePositiveInteger(
        retention.evidenceReferenceDays,
        "policy.retention.evidenceReferenceDays"
      ),
      supersededClaimRevisionDays: requirePositiveInteger(
        retention.supersededClaimRevisionDays,
        "policy.retention.supersededClaimRevisionDays"
      ),
    },
    claimLifecycle: {
      maximumValidityDays,
      reassessAfterDays,
    },
  });
}

export function createOperatorConsentDecision(
  value: unknown
): OperatorConsentDecision {
  assertUnderstandingSerializable(value, "consent");
  const input = requireUnderstandingRecord(value, "consent");
  rejectField(input, "confidence", "consent");
  const effectiveAt = requireUnderstandingTimestamp(
    input.effectiveAt,
    "consent.effectiveAt"
  );
  const recordedAt = requireUnderstandingTimestamp(
    input.recordedAt,
    "consent.recordedAt"
  );
  assertRecordedAfterEffective(effectiveAt, recordedAt, "consent");
  const provenance = createProvenance(input.provenance, "consent.provenance");

  if (
    provenance.sourceOwnerType !== "operator-service" ||
    provenance.method !== "operator-declaration"
  ) {
    throw new Error(
      "Operator consent must be an Operator declaration owned by Operator Service."
    );
  }

  return deepFreezeUnderstanding({
    contract: createContract(
      input.contract,
      OPERATOR_CONSENT_DECISION_CONTRACT,
      "consent.contract"
    ),
    id: requireUnderstandingString(input.id, "consent.id"),
    operatorId: requireUnderstandingString(
      input.operatorId,
      "consent.operatorId"
    ),
    purpose: requireUnderstandingString(input.purpose, "consent.purpose"),
    policyId: requireUnderstandingString(input.policyId, "consent.policyId"),
    policyVersion: requireUnderstandingSemanticVersion(
      input.policyVersion,
      "consent.policyVersion"
    ),
    decision: requireEnum(
      input.decision,
      ["granted", "revoked"] as const,
      "consent.decision"
    ),
    effectiveAt,
    recordedAt,
    supersedesDecisionId: requireNullableString(
      input.supersedesDecisionId,
      "consent.supersedesDecisionId"
    ),
    provenance,
  });
}

export function validateOperatorConsentHistory(
  history: readonly OperatorConsentDecision[]
): readonly OperatorConsentDecision[] {
  const validated = history.map(createOperatorConsentDecision);

  return validateAppendOnlyHistory(
    validated,
    "consentHistory",
    (entry) => entry.id,
    (entry) => entry.supersedesDecisionId,
    (entry) => `${entry.operatorId}|${entry.purpose}`
  );
}

export function resolveOperatorConsentDecision(
  history: readonly OperatorConsentDecision[],
  asOf: string
): OperatorConsentDecision | null {
  const validated = validateOperatorConsentHistory(history);
  const timestamp = requireUnderstandingTimestamp(asOf, "consentAsOf");

  return resolveEffectiveEntry(validated, timestamp);
}

export function createOperatorEvidenceDisposition(
  value: unknown
): OperatorEvidenceDisposition {
  assertUnderstandingSerializable(value, "evidenceDisposition");
  const input = requireUnderstandingRecord(value, "evidenceDisposition");
  const effectiveAt = requireUnderstandingTimestamp(
    input.effectiveAt,
    "evidenceDisposition.effectiveAt"
  );
  const recordedAt = requireUnderstandingTimestamp(
    input.recordedAt,
    "evidenceDisposition.recordedAt"
  );
  assertRecordedAfterEffective(
    effectiveAt,
    recordedAt,
    "evidenceDisposition"
  );

  return deepFreezeUnderstanding({
    contract: createContract(
      input.contract,
      OPERATOR_EVIDENCE_DISPOSITION_CONTRACT,
      "evidenceDisposition.contract"
    ),
    id: requireUnderstandingString(input.id, "evidenceDisposition.id"),
    operatorId: requireUnderstandingString(
      input.operatorId,
      "evidenceDisposition.operatorId"
    ),
    evidenceReferenceId: requireUnderstandingString(
      input.evidenceReferenceId,
      "evidenceDisposition.evidenceReferenceId"
    ),
    disposition: requireEnum(
      input.disposition,
      EVIDENCE_DISPOSITIONS,
      "evidenceDisposition.disposition"
    ),
    reason: requireUnderstandingString(input.reason, "evidenceDisposition.reason"),
    effectiveAt,
    recordedAt,
    supersedesDispositionId: requireNullableString(
      input.supersedesDispositionId,
      "evidenceDisposition.supersedesDispositionId"
    ),
    provenance: createProvenance(
      input.provenance,
      "evidenceDisposition.provenance"
    ),
  });
}

export function validateOperatorEvidenceDispositionHistory(
  history: readonly OperatorEvidenceDisposition[]
): readonly OperatorEvidenceDisposition[] {
  const validated = history.map(createOperatorEvidenceDisposition);

  return validateAppendOnlyHistory(
    validated,
    "evidenceDispositionHistory",
    (entry) => entry.id,
    (entry) => entry.supersedesDispositionId,
    (entry) => `${entry.operatorId}|${entry.evidenceReferenceId}`
  );
}

export function resolveOperatorEvidenceDisposition(
  history: readonly OperatorEvidenceDisposition[],
  asOf: string
): OperatorEvidenceDisposition | null {
  const validated = validateOperatorEvidenceDispositionHistory(history);
  const timestamp = requireUnderstandingTimestamp(asOf, "dispositionAsOf");

  return resolveEffectiveEntry(validated, timestamp);
}

export function admitOperatorGameSessionEvidence(
  value: OperatorGameSessionEvidenceAdmissionInput,
  context: OperatorGameSessionEvidenceAdmissionContext
): OperatorGameSessionEvidenceAdmission {
  assertUnderstandingSerializable(value, "evidenceAdmission");
  const input = requireUnderstandingRecord(value, "evidenceAdmission");
  rejectField(input, "gameName", "evidenceAdmission");
  const admittedAt = requireUnderstandingTimestamp(
    input.admittedAt,
    "evidenceAdmission.admittedAt"
  );
  const evidence = createOperatorEvidenceReference(input.evidence);
  const policy = createOperatorDataPolicyDefinition(context.policy);
  const authenticatedOperatorId = requireUnderstandingString(
    context.authenticatedOperatorId,
    "evidenceAdmission.authenticatedOperatorId"
  );
  const sessionId = requireUnderstandingString(
    input.sessionId,
    "evidenceAdmission.sessionId"
  );
  const sourceRecordId = requireUnderstandingString(
    input.sourceRecordId,
    "evidenceAdmission.sourceRecordId"
  );
  const integrationId = requireUnderstandingString(
    input.integrationId,
    "evidenceAdmission.integrationId"
  );
  const integrationVersion = requireUnderstandingSemanticVersion(
    input.integrationVersion,
    "evidenceAdmission.integrationVersion"
  );
  const purpose = requireUnderstandingString(
    input.purpose,
    "evidenceAdmission.purpose"
  );
  const intendedClaimType = requireEnum(
    input.intendedClaimType,
    GAME_PATTERN_CLAIM_TYPES,
    "evidenceAdmission.intendedClaimType"
  );
  const sourceClassification = requireEnum(
    input.sourceClassification,
    SOURCE_CLASSIFICATIONS,
    "evidenceAdmission.sourceClassification"
  );

  assertPolicyEffective(policy, admittedAt);

  if (evidence.operatorId !== authenticatedOperatorId) {
    throw new Error(
      "Game Session evidence must belong to the currently authenticated Operator."
    );
  }

  if (
    purpose !== OPERATOR_GAME_PATTERN_INTELLIGENCE_PURPOSE ||
    policy.purpose !== purpose ||
    !policy.allowedClaimTypes.includes(intendedClaimType) ||
    !policy.evidenceAdmission.allowedSourceClassifications.includes(
      sourceClassification
    )
  ) {
    throw new Error(
      "Game Session evidence is outside the approved policy purpose, claim family, or source classification."
    );
  }

  if (!context.gameIntegrations.recognizes(integrationId, integrationVersion)) {
    throw new Error(
      "Game Session evidence requires a stable, currently recognized Game Integration identity and version."
    );
  }

  assertEvidenceIdentity(
    evidence,
    sessionId,
    sourceRecordId,
    integrationId,
    integrationVersion,
    purpose,
    policy,
    sourceClassification,
    admittedAt
  );

  const consent = resolveOperatorConsentDecision(
    context.consentHistory,
    admittedAt
  );

  if (
    consent === null ||
    consent.operatorId !== evidence.operatorId ||
    consent.purpose !== purpose ||
    consent.policyId !== policy.id ||
    consent.policyVersion !== policy.policyVersion ||
    consent.decision !== "granted"
  ) {
    throw new Error(
      "Game Session evidence requires current, purpose-specific Operator consent for the exact policy version."
    );
  }

  const disposition = resolveOperatorEvidenceDisposition(
    context.evidenceDispositionHistory,
    admittedAt
  );

  if (
    disposition === null ||
    disposition.operatorId !== evidence.operatorId ||
    disposition.evidenceReferenceId !== evidence.id ||
    disposition.disposition !== "available"
  ) {
    throw new Error(
      "Game Session evidence must have a current available disposition."
    );
  }

  return deepFreezeUnderstanding({
    contract: {
      name: OPERATOR_GAME_SESSION_EVIDENCE_ADMISSION_CONTRACT,
      version: OPERATOR_UNDERSTANDING_CONTRACT_VERSION,
    },
    id: requireUnderstandingString(input.id, "evidenceAdmission.id"),
    operatorId: evidence.operatorId,
    evidenceReferenceId: evidence.id,
    evidenceDispositionId: disposition.id,
    sessionId,
    sourceRecordId,
    integrationId,
    integrationVersion,
    purpose,
    intendedClaimType,
    sourceClassification,
    policyId: policy.id,
    policyVersion: policy.policyVersion,
    consentDecisionId: consent.id,
    admittedAt,
  });
}

function assertEvidenceIdentity(
  evidence: ReturnType<typeof createOperatorEvidenceReference>,
  sessionId: string,
  sourceRecordId: string,
  integrationId: string,
  integrationVersion: string,
  purpose: string,
  policy: OperatorDataPolicyDefinition,
  sourceClassification: OperatorEvidenceSourceClassification,
  admittedAt: string
): void {
  if (
    evidence.scope.type !== "session" ||
    evidence.scope.sessionId !== sessionId ||
    evidence.scope.integrationId !== integrationId ||
    evidence.scope.integrationVersion !== integrationVersion ||
    evidence.sourceRecordId !== sourceRecordId
  ) {
    throw new Error(
      "Game Session evidence scope and authoritative source record identity must match the admission request."
    );
  }

  if (
    evidence.purpose !== purpose ||
    evidence.policyId !== policy.id ||
    evidence.policyVersion !== policy.policyVersion ||
    evidence.retentionClass !== policy.retentionClass
  ) {
    throw new Error(
      "Game Session evidence must use the admission purpose, policy version, and retention class."
    );
  }

  if (
    evidence.quality === null ||
    evidence.quality.policyId !== policy.id ||
    evidence.quality.policyVersion !== policy.policyVersion ||
    evidence.quality.score < policy.evidenceAdmission.minimumQualityScore
  ) {
    throw new Error(
      "Game Session evidence must carry sufficient policy-assessed evidence quality."
    );
  }

  if (
    Date.parse(evidence.capturedAt) > Date.parse(admittedAt) ||
    Date.parse(evidence.quality.assessedAt) > Date.parse(admittedAt)
  ) {
    throw new Error(
      "Game Session evidence cannot be admitted before capture and quality assessment."
    );
  }

  if (!SHA_256_DIGEST_PATTERN.test(evidence.contentDigest)) {
    throw new Error(
      "Game Session evidence contentDigest must be a lowercase SHA-256 digest."
    );
  }

  if (sourceClassification === "game-integration-direct-observation") {
    if (
      evidence.sourceType !== "game-integration-observation" ||
      evidence.sourceOwnerId !== integrationId ||
      evidence.producer.method !== "direct-observation" ||
      evidence.producer.id !== integrationId ||
      evidence.producer.version !== integrationVersion
    ) {
      throw new Error(
        "Direct observation evidence must be owned and directly observed by the identified Game Integration."
      );
    }
    return;
  }

  if (
    evidence.sourceType !== "session" ||
    evidence.producer.method !== "deterministic-transformation"
  ) {
    throw new Error(
      "Deterministic Session evidence must reference Session truth and a deterministic transformation."
    );
  }
}

function assertPolicyEffective(
  policy: OperatorDataPolicyDefinition,
  asOf: string
): void {
  const time = Date.parse(asOf);

  if (
    time < Date.parse(policy.effectiveFrom) ||
    (policy.effectiveUntil !== null && time >= Date.parse(policy.effectiveUntil))
  ) {
    throw new Error("Operator Intelligence policy is not effective at admission time.");
  }
}

function validateAppendOnlyHistory<T extends Readonly<{
  effectiveAt: string;
  recordedAt: string;
}>>(
  history: readonly T[],
  path: string,
  idOf: (entry: T) => string,
  supersedesOf: (entry: T) => string | null,
  aggregateOf: (entry: T) => string
): readonly T[] {
  if (history.length === 0) {
    return Object.freeze([]);
  }

  assertUniqueUnderstandingIds(history.map(idOf), `${path}.ids`);
  const aggregate = aggregateOf(history[0]);

  for (let index = 0; index < history.length; index += 1) {
    const entry = history[index];
    const previous = history[index - 1];

    if (aggregateOf(entry) !== aggregate) {
      throw new Error(`Operator Intelligence '${path}' mixes ownership aggregates.`);
    }

    if (
      (index === 0 && supersedesOf(entry) !== null) ||
      (index > 0 && supersedesOf(entry) !== idOf(previous))
    ) {
      throw new Error(`Operator Intelligence '${path}' is not an append-only revision chain.`);
    }

    if (
      previous &&
      (Date.parse(entry.effectiveAt) < Date.parse(previous.effectiveAt) ||
        Date.parse(entry.recordedAt) < Date.parse(previous.recordedAt))
    ) {
      throw new Error(`Operator Intelligence '${path}' timestamps must be monotonic.`);
    }
  }

  return Object.freeze([...history]);
}

function resolveEffectiveEntry<T extends Readonly<{
  effectiveAt: string;
}>>(
  history: readonly T[],
  asOf: string
): T | null {
  const timestamp = Date.parse(asOf);

  return history.reduce<T | null>(
    (current, entry) =>
      Date.parse(entry.effectiveAt) <= timestamp ? entry : current,
    null
  );
}

function createProvenance(
  value: unknown,
  path: string
): OperatorUnderstandingProvenance {
  const input = requireUnderstandingRecord(value, path);

  return {
    sourceOwnerType: requireEnum(
      input.sourceOwnerType,
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
      input.sourceOwnerId,
      `${path}.sourceOwnerId`
    ),
    method: requireEnum(
      input.method,
      [
        "authoritative-source",
        "operator-declaration",
        "direct-observation",
        "deterministic-engine",
      ] as const,
      `${path}.method`
    ),
    producerId: requireUnderstandingString(input.producerId, `${path}.producerId`),
    producerVersion: requireUnderstandingSemanticVersion(
      input.producerVersion,
      `${path}.producerVersion`
    ),
    generatedAt: requireUnderstandingTimestamp(
      input.generatedAt,
      `${path}.generatedAt`
    ),
  };
}

function createContract<Name extends string>(
  value: unknown,
  expectedName: Name,
  path: string
): OperatorUnderstandingContract<Name> {
  const input = requireUnderstandingRecord(value, path);

  if (
    input.name !== expectedName ||
    input.version !== OPERATOR_UNDERSTANDING_CONTRACT_VERSION
  ) {
    throw new Error(
      `Operator Intelligence '${path}' must be ${expectedName} v${OPERATOR_UNDERSTANDING_CONTRACT_VERSION}.`
    );
  }

  return {
    name: expectedName,
    version: OPERATOR_UNDERSTANDING_CONTRACT_VERSION,
  };
}

function createEnumArray<Value extends string>(
  value: unknown,
  allowed: readonly Value[],
  path: string
): readonly Value[] {
  const values = requireUnderstandingArray(value, path).map((entry, index) =>
    requireEnum(entry, allowed, `${path}[${index}]`)
  );

  if (values.length === 0) {
    throw new Error(`Operator Intelligence '${path}' must not be empty.`);
  }

  assertUniqueUnderstandingIds(values, path);
  return Object.freeze(values);
}

function requireEnum<Value extends string>(
  value: unknown,
  allowed: readonly Value[],
  path: string
): Value {
  const candidate = requireUnderstandingString(value, path);

  if (!allowed.includes(candidate as Value)) {
    throw new Error(`Operator Intelligence '${path}' is not an approved value.`);
  }

  return candidate as Value;
}

function requirePositiveInteger(value: unknown, path: string): number {
  const integer = requireUnderstandingInteger(value, path);

  if (integer === 0) {
    throw new Error(`Operator Intelligence '${path}' must be greater than zero.`);
  }

  return integer;
}

function requireNullableString(value: unknown, path: string): string | null {
  return value === null ? null : requireUnderstandingString(value, path);
}

function assertOrderedInterval(
  start: string,
  end: string | null,
  path: string
): void {
  if (end !== null && Date.parse(end) <= Date.parse(start)) {
    throw new Error(`Operator Intelligence '${path}' effective interval is invalid.`);
  }
}

function assertRecordedAfterEffective(
  effectiveAt: string,
  recordedAt: string,
  path: string
): void {
  if (Date.parse(recordedAt) < Date.parse(effectiveAt)) {
    throw new Error(
      `Operator Intelligence '${path}' cannot be recorded before it is effective.`
    );
  }
}

function rejectField(
  input: Record<string, unknown>,
  field: string,
  path: string
): void {
  if (Object.prototype.hasOwnProperty.call(input, field)) {
    throw new Error(`Operator Intelligence '${path}.${field}' is not permitted.`);
  }
}
