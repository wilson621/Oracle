import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";
import {
  createOracleGameIntegrationRegistry,
} from "../lib/oracle/game-integrations";
import {
  OPERATOR_CONSENT_DECISION_CONTRACT,
  OPERATOR_DATA_POLICY_DEFINITION_CONTRACT,
  OPERATOR_EVIDENCE_DISPOSITION_CONTRACT,
  OPERATOR_GAME_PATTERN_INTELLIGENCE_PURPOSE,
  admitOperatorGameSessionEvidence,
  createOperatorConsentDecision,
  createOperatorDataPolicyDefinition,
  createOperatorEvidenceDisposition,
  createOperatorEvidenceReference,
  resolveOperatorConsentDecision,
  validateOperatorConsentHistory,
  validateOperatorEvidenceDispositionHistory,
  type OperatorConsentDecision,
  type OperatorDataPolicyDefinition,
  type OperatorEvidenceDisposition,
  type OperatorEvidenceReference,
  type OperatorGameSessionEvidenceAdmissionContext,
  type OperatorGameSessionEvidenceAdmissionInput,
} from "../lib/oracle/understanding";

const operatorId = "11111111-1111-4111-8111-111111111111";
const sessionId = "aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa";
const policyId = "operator-game-pattern-intelligence";
const policyVersion = "1.0.0";
const observedAt = "2026-07-21T10:00:00.000Z";
const admittedAt = "2026-07-21T12:00:00.000Z";

function main() {
  verifyPolicyCatalogueSeparation();
  verifyConsentLifecycle();
  verifyEvidenceDispositionLifecycle();
  verifyDirectObservationAdmission();
  verifyDeterministicSessionAdmission();
  verifyConsentRejections();
  verifyEvidenceIdentityRejections();
  verifySourceTrustRejections();
  verifyQualityAndRetentionRejections();
  verifyContractBoundary();
  process.stdout.write(
    "Operator Intelligence trust contract verification passed.\n"
  );
}

function verifyPolicyCatalogueSeparation() {
  const policy = createPolicy();

  assert.equal("operatorId" in policy, false);
  assert.equal(policy.purpose, OPERATOR_GAME_PATTERN_INTELLIGENCE_PURPOSE);
  assert.equal(Object.isFrozen(policy), true);
  assert.equal(Object.isFrozen(policy.evidenceAdmission), true);

  assert.throws(
    () => createOperatorDataPolicyDefinition({ ...policyInput(), operatorId }),
    /operatorId.*not permitted/
  );
  assert.throws(
    () =>
      createOperatorDataPolicyDefinition({
        ...policyInput(),
        allowedClaimTypes: ["recurring-game-strength", "learning-style"],
      }),
    /approved value/
  );
  assert.throws(
    () =>
      createOperatorDataPolicyDefinition({
        ...policyInput(),
        claimLifecycle: {
          maximumValidityDays: 30,
          reassessAfterDays: 31,
        },
      }),
    /reassessment cannot occur after/
  );
}

function verifyConsentLifecycle() {
  const grant = createConsent();
  const revocation = createConsent({
    id: "consent-2",
    decision: "revoked",
    effectiveAt: "2026-07-22T10:00:00.000Z",
    recordedAt: "2026-07-22T10:00:00.000Z",
    supersedesDecisionId: grant.id,
  });
  const history = validateOperatorConsentHistory([grant, revocation]);

  assert.equal(resolveOperatorConsentDecision(history, admittedAt)?.decision, "granted");
  assert.equal(
    resolveOperatorConsentDecision(history, "2026-07-22T12:00:00.000Z")?.decision,
    "revoked"
  );
  assert.equal(Object.isFrozen(history), true);

  assert.throws(
    () => validateOperatorConsentHistory([grant, { ...revocation, supersedesDecisionId: null }]),
    /append-only revision chain/
  );
  assert.throws(
    () => createOperatorConsentDecision({ ...consentInput(), confidence: 1 }),
    /confidence.*not permitted/
  );
  assert.throws(
    () =>
      createOperatorConsentDecision({
        ...consentInput(),
        provenance: {
          ...consentInput().provenance,
          sourceOwnerType: "application",
        },
      }),
    /owned by Operator Service/
  );
}

function verifyEvidenceDispositionLifecycle() {
  const available = createDisposition();
  const deleted = createDisposition({
    id: "disposition-2",
    disposition: "source-deleted",
    reason: "The authoritative Session source was deleted.",
    effectiveAt: "2026-07-22T10:00:00.000Z",
    recordedAt: "2026-07-22T10:00:00.000Z",
    supersedesDispositionId: available.id,
  });

  validateOperatorEvidenceDispositionHistory([available, deleted]);
  assert.throws(
    () =>
      validateOperatorEvidenceDispositionHistory([
        available,
        { ...deleted, operatorId: "another-operator" },
      ]),
    /mixes ownership aggregates/
  );
}

function verifyDirectObservationAdmission() {
  const admission = admitOperatorGameSessionEvidence(
    admissionInput(),
    admissionContext()
  );

  assert.equal(admission.operatorId, operatorId);
  assert.equal(admission.integrationId, "call-of-duty");
  assert.equal(admission.integrationVersion, "1.0.0");
  assert.equal(admission.consentDecisionId, "consent-1");
  assert.equal(admission.evidenceDispositionId, "disposition-1");
  assert.equal(Object.isFrozen(admission), true);
  assert.equal(JSON.parse(JSON.stringify(admission)).operatorId, operatorId);
}

function verifyDeterministicSessionAdmission() {
  const evidence = createEvidence({
    sourceType: "session",
    sourceOwnerId: "oracle-session-repository",
    producer: {
      id: "oracle.memory-engine",
      version: "1.0.0",
      method: "deterministic-transformation",
    },
  });
  const admission = admitOperatorGameSessionEvidence(
    admissionInput({
      evidence,
      sourceClassification: "game-integration-deterministic-transformation",
      intendedClaimType: "recurring-game-weakness",
    }),
    admissionContext()
  );

  assert.equal(admission.intendedClaimType, "recurring-game-weakness");
}

function verifyConsentRejections() {
  assert.throws(
    () =>
      admitOperatorGameSessionEvidence(
        admissionInput(),
        admissionContext({ consentHistory: [] })
      ),
    /requires current.*consent/
  );

  const grant = createConsent();
  const revoked = createConsent({
    id: "consent-2",
    decision: "revoked",
    effectiveAt: "2026-07-21T11:00:00.000Z",
    recordedAt: "2026-07-21T11:00:00.000Z",
    supersedesDecisionId: grant.id,
  });
  assert.throws(
    () =>
      admitOperatorGameSessionEvidence(
        admissionInput(),
        admissionContext({ consentHistory: [grant, revoked] })
      ),
    /requires current.*consent/
  );

  assert.throws(
    () =>
      admitOperatorGameSessionEvidence(
        admissionInput(),
        admissionContext({
          consentHistory: [createConsent({ policyVersion: "2.0.0" })],
        })
      ),
    /exact policy version/
  );
}

function verifyEvidenceIdentityRejections() {
  assert.throws(
    () =>
      admitOperatorGameSessionEvidence(
        { ...admissionInput(), integrationId: "Call of Duty" },
        admissionContext()
      ),
    /stable, currently recognized/
  );
  assert.throws(
    () =>
      admitOperatorGameSessionEvidence(
        { ...admissionInput(), integrationVersion: "2.0.0" },
        admissionContext()
      ),
    /stable, currently recognized/
  );
  assert.throws(
    () =>
      admitOperatorGameSessionEvidence(
        { ...admissionInput(), gameName: "Call of Duty" } as never,
        admissionContext()
      ),
    /gameName.*not permitted/
  );
  assert.throws(
    () =>
      admitOperatorGameSessionEvidence(
        admissionInput({ sessionId: "different-session" }),
        admissionContext()
      ),
    /scope and authoritative source record identity/
  );
  assert.throws(
    () =>
      admitOperatorGameSessionEvidence(
        admissionInput(),
        admissionContext({ authenticatedOperatorId: "another-operator" })
      ),
    /currently authenticated Operator/
  );
}

function verifySourceTrustRejections() {
  assert.throws(
    () =>
      admitOperatorGameSessionEvidence(
        {
          ...admissionInput(),
          sourceClassification: "browser-supplied-score",
        } as never,
        admissionContext()
      ),
    /approved value/
  );
  assert.throws(
    () =>
      admitOperatorGameSessionEvidence(
        {
          ...admissionInput(),
          sourceClassification: "model-derived-observation",
        } as never,
        admissionContext()
      ),
    /approved value/
  );
  assert.throws(
    () =>
      admitOperatorGameSessionEvidence(
        admissionInput({
          evidence: createEvidence({
            producer: {
              id: "browser-analysis",
              version: "1.0.0",
              method: "deterministic-transformation",
            },
          }),
        }),
        admissionContext()
      ),
    /directly observed by the identified Game Integration/
  );
}

function verifyQualityAndRetentionRejections() {
  assert.throws(
    () =>
      admitOperatorGameSessionEvidence(
        admissionInput({ evidence: createEvidence({ quality: null }) }),
        admissionContext()
      ),
    /sufficient policy-assessed evidence quality/
  );
  assert.throws(
    () =>
      admitOperatorGameSessionEvidence(
        admissionInput({
          evidence: createEvidence({
            quality: {
              score: 0.69,
              rationale: "Below the policy threshold.",
              policyId,
              policyVersion,
              assessedAt: admittedAt,
            },
          }),
        }),
        admissionContext()
      ),
    /sufficient policy-assessed evidence quality/
  );
  assert.throws(
    () =>
      admitOperatorGameSessionEvidence(
        admissionInput(),
        admissionContext({
          evidenceDispositionHistory: [
            createDisposition({
              disposition: "retention-expired",
              reason: "The reference reached its retention limit.",
            }),
          ],
        })
      ),
    /current available disposition/
  );
  assert.throws(
    () =>
      admitOperatorGameSessionEvidence(
        admissionInput({
          evidence: createEvidence({ contentDigest: "sha256:not-a-digest" }),
        }),
        admissionContext()
      ),
    /lowercase SHA-256 digest/
  );
  assert.throws(
    () =>
      admitOperatorGameSessionEvidence(
        admissionInput({
          evidence: createEvidence({
            summary: "Permitted summary",
            metadata: { rawPrompt: "must not persist" },
          } as never),
        }),
        admissionContext()
      ),
    /raw prompt evidence/
  );
}

function verifyContractBoundary() {
  const contractPath = path.join(
    process.cwd(),
    "lib/oracle/understanding/operator-intelligence-trust-contract.ts"
  );
  const source = fs.readFileSync(contractPath, "utf8");

  assert.doesNotMatch(source, /repositories\//);
  assert.doesNotMatch(source, /supabase/i);
  assert.doesNotMatch(source, /submitCandidate|persistClaim|createClaim/);
  assert.doesNotMatch(source, /learning-style|motivation|personality|cross-game/);
}

function policyInput() {
  return {
    contract: {
      name: OPERATOR_DATA_POLICY_DEFINITION_CONTRACT,
      version: 1,
    },
    id: policyId,
    policyVersion,
    purpose: OPERATOR_GAME_PATTERN_INTELLIGENCE_PURPOSE,
    retentionClass: "game-session-derived-intelligence",
    effectiveFrom: "2026-07-01T00:00:00.000Z",
    effectiveUntil: null,
    allowedClaimTypes: [
      "recurring-game-strength",
      "recurring-game-weakness",
    ],
    evidenceAdmission: {
      minimumQualityScore: 0.7,
      allowedSourceClassifications: [
        "game-integration-direct-observation",
        "game-integration-deterministic-transformation",
      ],
    },
    retention: {
      evidenceReferenceDays: 180,
      supersededClaimRevisionDays: 365,
    },
    claimLifecycle: {
      maximumValidityDays: 90,
      reassessAfterDays: 30,
    },
  };
}

function createPolicy(): OperatorDataPolicyDefinition {
  return createOperatorDataPolicyDefinition(policyInput());
}

function consentInput(overrides: Record<string, unknown> = {}) {
  return {
    contract: {
      name: OPERATOR_CONSENT_DECISION_CONTRACT,
      version: 1,
    },
    id: "consent-1",
    operatorId,
    purpose: OPERATOR_GAME_PATTERN_INTELLIGENCE_PURPOSE,
    policyId,
    policyVersion,
    decision: "granted",
    effectiveAt: "2026-07-21T09:00:00.000Z",
    recordedAt: "2026-07-21T09:00:00.000Z",
    supersedesDecisionId: null,
    provenance: {
      sourceOwnerType: "operator-service",
      sourceOwnerId: "operator-service",
      method: "operator-declaration",
      producerId: "operator-consent-service",
      producerVersion: "1.0.0",
      generatedAt: "2026-07-21T09:00:00.000Z",
    },
    ...overrides,
  };
}

function createConsent(
  overrides: Record<string, unknown> = {}
): OperatorConsentDecision {
  return createOperatorConsentDecision(consentInput(overrides));
}

function dispositionInput(overrides: Record<string, unknown> = {}) {
  return {
    contract: {
      name: OPERATOR_EVIDENCE_DISPOSITION_CONTRACT,
      version: 1,
    },
    id: "disposition-1",
    operatorId,
    evidenceReferenceId: "evidence-1",
    disposition: "available",
    reason: "The authoritative source is present and within retention.",
    effectiveAt: "2026-07-21T10:00:00.000Z",
    recordedAt: "2026-07-21T10:00:00.000Z",
    supersedesDispositionId: null,
    provenance: {
      sourceOwnerType: "session",
      sourceOwnerId: "oracle-session-repository",
      method: "authoritative-source",
      producerId: "operator-evidence-admission",
      producerVersion: "1.0.0",
      generatedAt: "2026-07-21T10:00:00.000Z",
    },
    ...overrides,
  };
}

function createDisposition(
  overrides: Record<string, unknown> = {}
): OperatorEvidenceDisposition {
  return createOperatorEvidenceDisposition(dispositionInput(overrides));
}

function evidenceInput(overrides: Record<string, unknown> = {}) {
  return {
    contract: {
      name: "oracle.operator-evidence-reference",
      version: 1,
    },
    id: "evidence-1",
    operatorId,
    sourceType: "game-integration-observation",
    sourceOwnerId: "call-of-duty",
    sourceRecordId: "game-observation-1",
    observedAt,
    capturedAt: "2026-07-21T10:01:00.000Z",
    purpose: OPERATOR_GAME_PATTERN_INTELLIGENCE_PURPOSE,
    scope: {
      type: "session",
      sessionId,
      integrationId: "call-of-duty",
      integrationVersion: "1.0.0",
    },
    producer: {
      id: "call-of-duty",
      version: "1.0.0",
      method: "direct-observation",
    },
    quality: {
      score: 0.8,
      rationale: "The registered Game Integration directly observed the event.",
      policyId,
      policyVersion,
      assessedAt: "2026-07-21T10:02:00.000Z",
    },
    summary: "A permitted game-scoped Session observation.",
    contentDigest: `sha256:${"a".repeat(64)}`,
    retentionClass: "game-session-derived-intelligence",
    policyId,
    policyVersion,
    ...overrides,
  };
}

function createEvidence(
  overrides: Record<string, unknown> = {}
): OperatorEvidenceReference {
  return createOperatorEvidenceReference(evidenceInput(overrides));
}

function admissionInput(
  overrides: Partial<OperatorGameSessionEvidenceAdmissionInput> = {}
): OperatorGameSessionEvidenceAdmissionInput {
  return {
    id: "admission-1",
    evidence: createEvidence(),
    sessionId,
    sourceRecordId: "game-observation-1",
    integrationId: "call-of-duty",
    integrationVersion: "1.0.0",
    purpose: OPERATOR_GAME_PATTERN_INTELLIGENCE_PURPOSE,
    intendedClaimType: "recurring-game-strength",
    sourceClassification: "game-integration-direct-observation",
    admittedAt,
    ...overrides,
  };
}

function admissionContext(
  overrides: Partial<OperatorGameSessionEvidenceAdmissionContext> = {}
): OperatorGameSessionEvidenceAdmissionContext {
  const registry = createOracleGameIntegrationRegistry();

  return {
    authenticatedOperatorId: operatorId,
    policy: createPolicy(),
    consentHistory: [createConsent()],
    evidenceDispositionHistory: [createDisposition()],
    gameIntegrations: {
      recognizes(integrationId, integrationVersion) {
        return registry.getById(integrationId)?.version === integrationVersion;
      },
    },
    ...overrides,
  };
}

main();
