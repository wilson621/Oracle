import {
  assertUnderstandingSerializable,
  deepFreezeUnderstanding,
  requireNullableUnderstandingTimestamp,
  requireUnderstandingArray,
  requireUnderstandingInteger,
  requireUnderstandingRecord,
  requireUnderstandingSemanticVersion,
  requireUnderstandingString,
  requireUnderstandingStringArray,
  requireUnderstandingTimestamp,
} from "../understanding/operator-understanding-validation";
import type {
  OperatorControlPolicySet,
  OperatorControlPurposePolicy,
  OperatorControlRetentionRule,
  OperatorGovernanceValue,
} from "./operator-control-types";
import {
  OPERATOR_CONTROL_CONTRACT_VERSION,
  OPERATOR_CONTROL_POLICY_SET_CONTRACT,
  OperatorControlFailure,
} from "./operator-control-types";

const DECLARATION_DOMAINS = ["identity", "preference", "goal"] as const;
const DELETION_SCOPES = [
  "item",
  "purpose",
  "game-integration",
  "understanding-domain",
  "complete-operator",
] as const;
const AUDIT_FIELDS = [
  "operation-id",
  "actor-class",
  "scope-identifier",
  "action-type",
  "policy-identity",
  "request-time",
  "transition-time",
  "completion-time",
  "outcome",
  "recovery-state",
  "affected-record-counts",
  "non-content-integrity-evidence",
] as const;
const TOMBSTONE_JUSTIFICATIONS = [
  "prevent-unsafe-replay",
  "preserve-monotonic-revision-integrity",
  "prove-deletion-transition",
  "coordinate-deletion-recovery",
] as const;
const TOMBSTONE_FIELDS = [
  "tombstone-id",
  "operation-id",
  "subject-type",
  "non-content-subject-identity",
  "policy-identity",
  "deleted-at",
  "predecessor-identity",
  "integrity-digest",
] as const;

export function createOperatorControlPolicySet(
  value: unknown
): OperatorControlPolicySet {
  assertUnderstandingSerializable(value, "operatorControlPolicySet");
  const input = requireUnderstandingRecord(value, "operatorControlPolicySet");
  rejectCallerOperator(input, "operatorControlPolicySet");
  const contract = requireUnderstandingRecord(
    input.contract,
    "operatorControlPolicySet.contract"
  );

  if (
    contract.name !== OPERATOR_CONTROL_POLICY_SET_CONTRACT ||
    contract.version !== OPERATOR_CONTROL_CONTRACT_VERSION
  ) {
    throw new Error(
      "Operator control policy contract identity or version is unsupported."
    );
  }

  const effectiveFrom = requireUnderstandingTimestamp(
    input.effectiveFrom,
    "operatorControlPolicySet.effectiveFrom"
  );
  const effectiveUntil = requireNullableUnderstandingTimestamp(
    input.effectiveUntil,
    "operatorControlPolicySet.effectiveUntil"
  );

  if (
    effectiveUntil !== null &&
    Date.parse(effectiveUntil) <= Date.parse(effectiveFrom)
  ) {
    throw new Error(
      "Operator control policy effectiveUntil must follow effectiveFrom."
    );
  }

  const purposes = requireUnderstandingArray(
    input.purposes,
    "operatorControlPolicySet.purposes"
  ).map(createPurposePolicy);
  assertNonEmptyUnique(purposes.map((purpose) => purpose.id), "purposes");
  const declarationLifecycleInput = requireUnderstandingRecord(
    input.declarationLifecycle,
    "operatorControlPolicySet.declarationLifecycle"
  );
  const allowedDomains = createEnumArray(
    declarationLifecycleInput.allowedDomains,
    DECLARATION_DOMAINS,
    "operatorControlPolicySet.declarationLifecycle.allowedDomains"
  );
  const expiryRequiredDomains = createEnumArray(
    declarationLifecycleInput.expiryRequiredDomains,
    DECLARATION_DOMAINS,
    "operatorControlPolicySet.declarationLifecycle.expiryRequiredDomains"
  );

  if (
    expiryRequiredDomains.some((domain) => !allowedDomains.includes(domain))
  ) {
    throw new Error(
      "Operator control policy cannot require expiry for a disallowed declaration domain."
    );
  }

  const retentionRules = requireUnderstandingArray(
    input.retentionRules,
    "operatorControlPolicySet.retentionRules"
  ).map(createRetentionRule);
  assertUnique(retentionRules.map((rule) => rule.id), "retentionRules");
  const retentionIds = new Set(retentionRules.map((rule) => rule.id));

  const policy: OperatorControlPolicySet = {
    contract: {
      name: OPERATOR_CONTROL_POLICY_SET_CONTRACT,
      version: OPERATOR_CONTROL_CONTRACT_VERSION,
    },
    id: requireUnderstandingString(input.id, "operatorControlPolicySet.id"),
    policyVersion: requireUnderstandingSemanticVersion(
      input.policyVersion,
      "operatorControlPolicySet.policyVersion"
    ),
    effectiveFrom,
    effectiveUntil,
    purposes,
    declarationLifecycle: {
      allowedDomains,
      expiryRequiredDomains,
    },
    retentionRules,
    deletion: createGovernanceValue(input.deletion, "deletion", (configured) => {
      const allowedScopes = createEnumArray(
        configured.allowedScopes,
        DELETION_SCOPES,
        "operatorControlPolicySet.deletion.value.allowedScopes"
      );
      assertLiteralTrue(
        configured.eligibilityRemovalRequired,
        "deletion.eligibilityRemovalRequired"
      );
      assertLiteralTrue(
        configured.liveCompletionRequired,
        "deletion.liveCompletionRequired"
      );
      return {
        allowedScopes,
        eligibilityRemovalRequired: true,
        liveCompletionRequired: true,
      };
    }),
    audit: createGovernanceValue(input.audit, "audit", (configured) => {
      const retentionRuleId = requireUnderstandingString(
        configured.retentionRuleId,
        "operatorControlPolicySet.audit.value.retentionRuleId"
      );
      assertRetentionRule(retentionRuleId, retentionIds, "audit");
      return {
        permittedFields: createEnumArray(
          configured.permittedFields,
          AUDIT_FIELDS,
          "operatorControlPolicySet.audit.value.permittedFields"
        ),
        retentionRuleId,
      };
    }),
    tombstone: createGovernanceValue(
      input.tombstone,
      "tombstone",
      (configured) => {
        const retentionRuleId = requireUnderstandingString(
          configured.retentionRuleId,
          "operatorControlPolicySet.tombstone.value.retentionRuleId"
        );
        assertRetentionRule(retentionRuleId, retentionIds, "tombstone");
        return {
          justifications: createEnumArray(
            configured.justifications,
            TOMBSTONE_JUSTIFICATIONS,
            "operatorControlPolicySet.tombstone.value.justifications"
          ),
          permittedFields: createEnumArray(
            configured.permittedFields,
            TOMBSTONE_FIELDS,
            "operatorControlPolicySet.tombstone.value.permittedFields"
          ),
          retentionRuleId,
        };
      }
    ),
    backup: createGovernanceValue(input.backup, "backup", (configured) => {
      assertLiteralTrue(
        configured.restoreReapplicationRequired,
        "backup.restoreReapplicationRequired"
      );
      assertLiteralTrue(
        configured.expiryEvidenceRequired,
        "backup.expiryEvidenceRequired"
      );
      return {
        retentionDays: requirePositiveInteger(
          configured.retentionDays,
          "operatorControlPolicySet.backup.value.retentionDays"
        ),
        restoreReapplicationRequired: true,
        expiryEvidenceRequired: true,
      };
    }),
    externalProcessors: createGovernanceArrayValue(
      input.externalProcessors,
      "externalProcessors",
      (processor, index) => ({
        id: requireUnderstandingString(
          processor.id,
          `operatorControlPolicySet.externalProcessors.value[${index}].id`
        ),
        purpose: requireUnderstandingString(
          processor.purpose,
          `operatorControlPolicySet.externalProcessors.value[${index}].purpose`
        ),
        deletionMechanism: requireUnderstandingString(
          processor.deletionMechanism,
          `operatorControlPolicySet.externalProcessors.value[${index}].deletionMechanism`
        ),
        confirmationRequired: requireBoolean(
          processor.confirmationRequired,
          `operatorControlPolicySet.externalProcessors.value[${index}].confirmationRequired`
        ),
        retryLimit: requirePositiveInteger(
          processor.retryLimit,
          `operatorControlPolicySet.externalProcessors.value[${index}].retryLimit`
        ),
      })
    ),
    export: createGovernanceValue(input.export, "export", (configured) => {
      if (
        configured.schemaVersion !== OPERATOR_CONTROL_CONTRACT_VERSION ||
        configured.rawSourceContentPermitted !== false ||
        configured.artifactHandling !== "none"
      ) {
        throw new Error(
          "Operator control export policy must use schema version 1, exclude raw source content, and create no durable artifact."
        );
      }
      return {
        schemaVersion: OPERATOR_CONTROL_CONTRACT_VERSION,
        maxItems: requirePositiveInteger(
          configured.maxItems,
          "operatorControlPolicySet.export.value.maxItems"
        ),
        maxBytes: requirePositiveInteger(
          configured.maxBytes,
          "operatorControlPolicySet.export.value.maxBytes"
        ),
        rawSourceContentPermitted: false,
        artifactHandling: "none",
      };
    }),
    bounds: createGovernanceValue(input.bounds, "bounds", (configured) => ({
      inspectionPageSize: requireBoundedPositiveInteger(
        configured.inspectionPageSize,
        100,
        "operatorControlPolicySet.bounds.value.inspectionPageSize"
      ),
      declarationHistoryPageSize: requireBoundedPositiveInteger(
        configured.declarationHistoryPageSize,
        100,
        "operatorControlPolicySet.bounds.value.declarationHistoryPageSize"
      ),
      deletionBatchSize: requirePositiveInteger(
        configured.deletionBatchSize,
        "operatorControlPolicySet.bounds.value.deletionBatchSize"
      ),
      operationMaxAttempts: requirePositiveInteger(
        configured.operationMaxAttempts,
        "operatorControlPolicySet.bounds.value.operationMaxAttempts"
      ),
    })),
    recovery: createGovernanceValue(input.recovery, "recovery", (configured) => {
      assertLiteralTrue(configured.resumable, "recovery.resumable");
      assertLiteralTrue(
        configured.exactRetryRequired,
        "recovery.exactRetryRequired"
      );
      assertLiteralTrue(
        configured.completionVerificationRequired,
        "recovery.completionVerificationRequired"
      );
      return {
        resumable: true,
        exactRetryRequired: true,
        completionVerificationRequired: true,
      };
    }),
    approvedBy: requireUnderstandingString(
      input.approvedBy,
      "operatorControlPolicySet.approvedBy"
    ),
    approvedAt: requireUnderstandingTimestamp(
      input.approvedAt,
      "operatorControlPolicySet.approvedAt"
    ),
  };

  return deepFreezeUnderstanding(policy);
}

export function assertOperatorControlPolicyEffective(
  policy: OperatorControlPolicySet,
  asOf: string
): void {
  const timestamp = requireUnderstandingTimestamp(asOf, "policyAsOf");
  const time = Date.parse(timestamp);

  if (
    time < Date.parse(policy.effectiveFrom) ||
    (policy.effectiveUntil !== null &&
      time >= Date.parse(policy.effectiveUntil))
  ) {
    throw new OperatorControlFailure(
      "policy-not-effective",
      false,
      "The Operator control policy is not effective at the requested time."
    );
  }
}

export function requireConfiguredGovernanceValue<Value>(
  value: OperatorGovernanceValue<Value>,
  field: string
): Value {
  if (value.state === "unconfigured") {
    throw new OperatorControlFailure(
      "policy-unconfigured",
      false,
      `Operator control policy '${field}' is unconfigured and fails closed.`
    );
  }

  return value.value;
}

export function resolveOperatorControlPurpose(
  policy: OperatorControlPolicySet,
  purposeId: string
): OperatorControlPurposePolicy {
  const purpose = policy.purposes.find((candidate) => candidate.id === purposeId);

  if (!purpose) {
    throw new OperatorControlFailure(
      "purpose-not-permitted",
      false,
      "The requested purpose is not permitted by the Operator control policy."
    );
  }

  return purpose;
}

function createPurposePolicy(
  value: unknown,
  index: number
): OperatorControlPurposePolicy {
  const path = `operatorControlPolicySet.purposes[${index}]`;
  const input = requireUnderstandingRecord(value, path);
  const admissionPolicy =
    input.admissionPolicy === null
      ? null
      : createAdmissionPolicyReference(input.admissionPolicy, path);
  const optional = requireBoolean(input.optional, `${path}.optional`);
  const consentRequired = requireBoolean(
    input.consentRequired,
    `${path}.consentRequired`
  );

  if (optional && !consentRequired) {
    throw new Error(
      "Optional Operator control purposes must require explicit consent."
    );
  }

  const revocationEffect = requireEnum(
    input.revocationEffect,
    ["future-processing", "future-processing-and-eligibility-removal"] as const,
    `${path}.revocationEffect`
  );

  if (
    optional &&
    revocationEffect !== "future-processing-and-eligibility-removal"
  ) {
    throw new Error(
      "Optional Operator control purposes must remove future eligibility on revocation."
    );
  }

  return {
    id: requireUnderstandingString(input.id, `${path}.id`),
    optional,
    consentRequired,
    revocationEffect,
    observationCategories: uniqueStrings(
      requireUnderstandingStringArray(
        input.observationCategories,
        `${path}.observationCategories`
      ),
      `${path}.observationCategories`
    ),
    declarationDomains: createEnumArray(
      input.declarationDomains,
      DECLARATION_DOMAINS,
      `${path}.declarationDomains`
    ),
    admissionPolicy,
  };
}

function createAdmissionPolicyReference(value: unknown, path: string) {
  const input = requireUnderstandingRecord(value, `${path}.admissionPolicy`);
  return {
    policyId: requireUnderstandingString(
      input.policyId,
      `${path}.admissionPolicy.policyId`
    ),
    policyVersion: requireUnderstandingSemanticVersion(
      input.policyVersion,
      `${path}.admissionPolicy.policyVersion`
    ),
  };
}

function createRetentionRule(
  value: unknown,
  index: number
): OperatorControlRetentionRule {
  const path = `operatorControlPolicySet.retentionRules[${index}]`;
  const input = requireUnderstandingRecord(value, path);
  return {
    id: requireUnderstandingString(input.id, `${path}.id`),
    informationCategory: requireUnderstandingString(
      input.informationCategory,
      `${path}.informationCategory`
    ),
    authoritativeOwner: requireEnum(
      input.authoritativeOwner,
      [
        "operator-service",
        "operator-intelligence-service",
        "memory-service",
        "session-service",
        "progression-service",
      ] as const,
      `${path}.authoritativeOwner`
    ),
    purpose: requireUnderstandingString(input.purpose, `${path}.purpose`),
    retentionClass: requireUnderstandingString(
      input.retentionClass,
      `${path}.retentionClass`
    ),
    startEvent: requireUnderstandingString(input.startEvent, `${path}.startEvent`),
    durationDays: createScalarGovernanceValue(
      input.durationDays,
      `${path}.durationDays`,
      requirePositiveInteger
    ),
    expiryEvent: createScalarGovernanceValue(
      input.expiryEvent,
      `${path}.expiryEvent`,
      requireUnderstandingString
    ),
    reassessmentDays: createScalarGovernanceValue(
      input.reassessmentDays,
      `${path}.reassessmentDays`,
      requirePositiveInteger
    ),
    consentDependent: requireBoolean(
      input.consentDependent,
      `${path}.consentDependent`
    ),
    legalAuthority: createScalarGovernanceValue(
      input.legalAuthority,
      `${path}.legalAuthority`,
      requireUnderstandingString
    ),
    disposition: requireEnum(
      input.disposition,
      [
        "physical-delete",
        "irreversible-deidentify",
        "source-owner-disposition",
      ] as const,
      `${path}.disposition`
    ),
    auditTreatment: requireUnderstandingString(
      input.auditTreatment,
      `${path}.auditTreatment`
    ),
    backupTreatment: requireUnderstandingString(
      input.backupTreatment,
      `${path}.backupTreatment`
    ),
    externalProcessorTreatment: requireUnderstandingString(
      input.externalProcessorTreatment,
      `${path}.externalProcessorTreatment`
    ),
    deletionInteraction: requireUnderstandingString(
      input.deletionInteraction,
      `${path}.deletionInteraction`
    ),
    approvingAuthority: requireUnderstandingString(
      input.approvingAuthority,
      `${path}.approvingAuthority`
    ),
  };
}

function createGovernanceValue<Value>(
  value: unknown,
  field: string,
  createConfigured: (value: Record<string, unknown>) => Value
): OperatorGovernanceValue<Value> {
  const path = `operatorControlPolicySet.${field}`;
  const input = requireUnderstandingRecord(value, path);
  const state = requireEnum(
    input.state,
    ["configured", "unconfigured"] as const,
    `${path}.state`
  );

  if (state === "unconfigured") {
    if (Object.hasOwn(input, "value")) {
      throw new Error(
        `Operator control policy '${field}' cannot carry a value while unconfigured.`
      );
    }
    return { state };
  }

  return {
    state,
    value: createConfigured(requireUnderstandingRecord(input.value, `${path}.value`)),
  };
}

function createGovernanceArrayValue<Value>(
  value: unknown,
  field: string,
  createEntry: (value: Record<string, unknown>, index: number) => Value
): OperatorGovernanceValue<readonly Value[]> {
  const path = `operatorControlPolicySet.${field}`;
  const input = requireUnderstandingRecord(value, path);
  const state = requireEnum(
    input.state,
    ["configured", "unconfigured"] as const,
    `${path}.state`
  );

  if (state === "unconfigured") {
    if (Object.hasOwn(input, "value")) {
      throw new Error(
        `Operator control policy '${field}' cannot carry a value while unconfigured.`
      );
    }
    return { state };
  }

  const entries = requireUnderstandingArray(input.value, `${path}.value`).map(
    (entry, index) =>
      createEntry(
        requireUnderstandingRecord(entry, `${path}.value[${index}]`),
        index
      )
  );
  assertUnique(
    entries
      .map((entry) =>
        typeof entry === "object" && entry !== null && "id" in entry
          ? String(entry.id)
          : ""
      )
      .filter(Boolean),
    field
  );
  return { state, value: entries };
}

function createScalarGovernanceValue<Value>(
  value: unknown,
  path: string,
  createValue: (value: unknown, path: string) => Value
): OperatorGovernanceValue<Value> {
  const input = requireUnderstandingRecord(value, path);
  const state = requireEnum(
    input.state,
    ["configured", "unconfigured"] as const,
    `${path}.state`
  );

  if (state === "unconfigured") {
    if (Object.hasOwn(input, "value")) {
      throw new Error(`${path} cannot carry a value while unconfigured.`);
    }
    return { state };
  }

  return { state, value: createValue(input.value, `${path}.value`) };
}

function createEnumArray<const Values extends readonly string[]>(
  value: unknown,
  allowed: Values,
  path: string
): Values[number][] {
  const result = requireUnderstandingArray(value, path).map((entry, index) =>
    requireEnum(entry, allowed, `${path}[${index}]`)
  );
  return uniqueStrings(result, path) as Values[number][];
}

function requireEnum<const Values extends readonly string[]>(
  value: unknown,
  allowed: Values,
  path: string
): Values[number] {
  const candidate = requireUnderstandingString(value, path);
  if (!allowed.includes(candidate)) {
    throw new Error(`${path} is unsupported.`);
  }
  return candidate as Values[number];
}

function requireBoolean(value: unknown, path: string): boolean {
  if (typeof value !== "boolean") {
    throw new Error(`${path} must be boolean.`);
  }
  return value;
}

function assertLiteralTrue(value: unknown, path: string): asserts value is true {
  if (value !== true) {
    throw new Error(`${path} must remain enabled.`);
  }
}

function requirePositiveInteger(value: unknown, path: string): number {
  const integer = requireUnderstandingInteger(value, path);
  if (integer < 1) {
    throw new Error(`${path} must be a positive integer.`);
  }
  return integer;
}

function requireBoundedPositiveInteger(
  value: unknown,
  maximum: number,
  path: string
): number {
  const integer = requirePositiveInteger(value, path);
  if (integer > maximum) {
    throw new Error(`${path} exceeds the engineering ceiling of ${maximum}.`);
  }
  return integer;
}

function uniqueStrings<Value extends string>(
  values: readonly Value[],
  path: string
): Value[] {
  assertUnique(values, path);
  return [...values];
}

function assertNonEmptyUnique(values: readonly string[], path: string): void {
  if (values.length === 0) {
    throw new Error(`Operator control policy '${path}' must not be empty.`);
  }
  assertUnique(values, path);
}

function assertUnique(values: readonly string[], path: string): void {
  if (new Set(values).size !== values.length) {
    throw new Error(`Operator control policy '${path}' contains duplicates.`);
  }
}

function assertRetentionRule(
  id: string,
  retentionIds: ReadonlySet<string>,
  path: string
): void {
  if (!retentionIds.has(id)) {
    throw new Error(
      `Operator control policy '${path}' references an unknown retention rule.`
    );
  }
}

function rejectCallerOperator(
  input: Record<string, unknown>,
  path: string
): void {
  if (Object.hasOwn(input, "operatorId")) {
    throw new Error(`${path} cannot select an Operator.`);
  }
}
