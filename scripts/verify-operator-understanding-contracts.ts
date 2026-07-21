import assert from "node:assert/strict";
import {
  createOperatorDeclaredItem,
  createOperatorDataPolicyReference,
  createOperatorEvidenceReference,
  createOperatorIntelligenceClaimRevision,
  createOperatorKnownItem,
  createOperatorObservedItem,
  createOperatorUnknownItem,
} from "../lib/oracle/understanding";
import {
  activeClaimInput,
  dataPolicyInput,
  declaredIdentityInput,
  evidenceInput,
  unknownInput,
} from "./operator-understanding-verification-fixtures";

const evidence = createOperatorEvidenceReference(evidenceInput);
const dataPolicy = createOperatorDataPolicyReference(dataPolicyInput);
const claim = createOperatorIntelligenceClaimRevision(activeClaimInput, [
  evidence,
]);
const declaration = createOperatorDeclaredItem(declaredIdentityInput);
const unknown = createOperatorUnknownItem(unknownInput);
const known = createOperatorKnownItem({
  ...declaredIdentityInput,
  id: "identity-operator-id",
  key: "operator-id",
  epistemic: "known",
  value: "operator-1",
  provenance: {
    ...declaredIdentityInput.provenance,
    method: "authoritative-source",
  },
  revisionId: "identity-operator-id-revision-1",
});
const observed = createOperatorObservedItem({
  id: "observed-session-completion",
  operatorId: "operator-1",
  key: "session-completed",
  epistemic: "observed",
  value: true,
  confidence: null,
  evidenceReferenceId: evidence.id,
  provenance: {
    sourceOwnerType: "session",
    sourceOwnerId: "oracle-session-repository",
    method: "direct-observation",
    producerId: "oracle-session-observation",
    producerVersion: "1.0.0",
    generatedAt: evidence.observedAt,
  },
  scope: evidence.scope,
  temporalValidity: {
    effectiveFrom: evidence.observedAt,
    validUntil: null,
    lastAssessedAt: null,
    reassessAfter: null,
    reassessmentTrigger: null,
  },
});

assert.equal(claim.epistemic, "inferred");
assert.equal(dataPolicy.contract.version, 1);
assert.equal(claim.confidence.score, 0.8);
assert.equal(claim.confidence.producerNative?.value, 80);
assert.equal(claim.explanation?.method.version, "1.0.0");
assert.deepEqual(claim.explanation?.evidenceReferenceIds, [
  evidence.id,
]);
assert.equal(declaration.confidence, null);
assert.equal(known.epistemic, "known");
assert.equal(known.confidence, null);
assert.equal(observed.epistemic, "observed");
assert.equal(observed.confidence, null);
assert.equal(unknown.value, null);
assert.equal(unknown.confidence, null);
assert.equal(Object.isFrozen(claim), true);
assert.equal(Object.isFrozen(claim.explanation), true);
assert.equal(Object.isFrozen(claim.evidence), true);
assert.equal(Object.isFrozen(evidence.scope), true);
assert.doesNotThrow(() => JSON.stringify(claim));

assert.throws(
  () =>
    createOperatorEvidenceReference({
      ...evidenceInput,
      rawPrompt: "Raw Session prompt must never enter understanding evidence.",
    }),
  /must not contain raw prompt evidence/
);

assert.throws(
  () =>
    createOperatorEvidenceReference({
      ...evidenceInput,
      contract: {
        ...evidenceInput.contract,
        version: 2,
      },
    }),
  /identity or version is unsupported/
);

assert.throws(
  () =>
    createOperatorEvidenceReference({
      ...evidenceInput,
      executableExtension: () => "not serializable",
    }),
  /non-serializable function data/
);

assert.throws(
  () =>
    createOperatorIntelligenceClaimRevision(
      {
        ...activeClaimInput,
        confidence: {
          ...activeClaimInput.confidence,
          score: 80,
        },
      },
      [evidence]
    ),
  /must be between 0 and 1/
);

assert.throws(
  () =>
    createOperatorIntelligenceClaimRevision(
      {
        ...activeClaimInput,
        temporalValidity: {
          ...activeClaimInput.temporalValidity,
          validUntil: null,
          reassessAfter: null,
          reassessmentTrigger: null,
        },
      },
      [evidence]
    ),
  /requires an explicit expiry or reassessment rule/
);

assert.throws(
  () =>
    createOperatorIntelligenceClaimRevision(
      {
        ...activeClaimInput,
        scope: {
          type: "operator",
        },
      },
      [evidence]
    ),
  /cannot be promoted to Operator-wide understanding/
);

assert.throws(
  () =>
    createOperatorIntelligenceClaimRevision(
      {
        ...activeClaimInput,
        explanation: null,
      },
      [evidence]
    ),
  /must be inferred and carry a durable explanation/
);

assert.throws(
  () =>
    createOperatorIntelligenceClaimRevision(
      {
        ...activeClaimInput,
        type: "personality",
      },
      [evidence]
    ),
  /prohibited for automated inference/
);

assert.throws(
  () =>
    createOperatorIntelligenceClaimRevision(
      {
        ...activeClaimInput,
        provenance: {
          ...activeClaimInput.provenance,
          method: "ai-generated",
        },
      },
      [evidence]
    ),
  /claim.provenance.method.*unsupported/
);

assert.throws(
  () =>
    createOperatorIntelligenceClaimRevision(
      activeClaimInput,
      [
        createOperatorEvidenceReference({
          ...evidenceInput,
          operatorId: "operator-2",
        }),
      ]
    ),
  /evidence owned by another Operator/
);

assert.throws(
  () =>
    createOperatorIntelligenceClaimRevision(
      {
        ...activeClaimInput,
        explanation: {
          ...activeClaimInput.explanation,
          evidenceReferenceIds: ["evidence-not-linked"],
        },
      },
      [evidence]
    ),
  /references unsupported evidence/
);

assert.throws(
  () =>
    createOperatorIntelligenceClaimRevision(
      {
        ...activeClaimInput,
        explanation: {
          ...activeClaimInput.explanation,
          method: {
            ...activeClaimInput.explanation.method,
            kind: "ai-generated",
          },
        },
      },
      [evidence]
    ),
  /must use deterministic templates/
);

assert.throws(
  () =>
    createOperatorDeclaredItem({
      ...declaredIdentityInput,
      confidence: {
        score: 1,
      },
    }),
  /cannot carry inference confidence/
);

assert.throws(
  () =>
    createOperatorUnknownItem({
      ...unknownInput,
      value: "fabricated",
    }),
  /must have a null value/
);

const candidate = createOperatorIntelligenceClaimRevision(
  {
    ...activeClaimInput,
    status: "candidate",
    epistemic: "suspected",
    explanation: null,
    eligibility: {
      ...activeClaimInput.eligibility,
      eligible: false,
      reasons: ["candidate"],
    },
  },
  [evidence]
);

assert.equal(candidate.status, "candidate");
assert.equal(candidate.epistemic, "suspected");
assert.equal(candidate.eligibility.eligible, false);

const sparseValue = new Array(1);

assert.throws(
  () =>
    createOperatorDeclaredItem({
      ...declaredIdentityInput,
      value: sparseValue,
    }),
  /contains a sparse array/
);

process.stdout.write("Operator Understanding contract verification passed.\n");
