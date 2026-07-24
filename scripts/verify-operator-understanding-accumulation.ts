import assert from "node:assert/strict";
import fs from "node:fs";

import type { OracleMemoryProfile } from "../lib/oracle/memory";
import type { OracleSession } from "../lib/oracle/sessions";
import {
  acceptRecurringMemoryCandidate,
  createRecurringMemoryCandidates,
  deleteRecurringMemoryClaim,
  projectUnderstandingForOracleContext,
  reviseRecurringMemoryClaim,
  type AdmittedSessionEvidence,
  type OperatorUnderstandingAccumulationPolicy,
} from "../lib/oracle/understanding/operator-understanding-accumulation";
import {
  OPERATOR_DATA_POLICY_DEFINITION_CONTRACT,
  OPERATOR_EVIDENCE_REFERENCE_CONTRACT,
  OPERATOR_GAME_SESSION_EVIDENCE_ADMISSION_CONTRACT,
  OPERATOR_UNDERSTANDING_SNAPSHOT_CONTRACT,
  createOperatorDataPolicyDefinition,
  createOperatorUnderstandingSnapshot,
  type OperatorEvidenceReference,
  type OperatorGameSessionEvidenceAdmission,
} from "../lib/oracle/understanding";

const firstAt = "2026-07-24T10:00:00.000Z";
const secondAt = "2026-07-24T10:01:00.000Z";
const thirdAt = "2026-07-24T10:02:00.000Z";
const fourthAt = "2026-07-24T10:03:00.000Z";
const fifthAt = "2026-07-24T10:04:00.000Z";
const sixthAt = "2026-07-24T10:05:00.000Z";
const digestOne = `sha256:${"1".repeat(64)}`;
const digestTwo = `sha256:${"2".repeat(64)}`;

const dataPolicy = createOperatorDataPolicyDefinition({
  contract: {
    name: OPERATOR_DATA_POLICY_DEFINITION_CONTRACT,
    version: 1,
  },
  id: "sprint-22-certification-policy",
  policyVersion: "1.0.0",
  purpose: "operator-intelligence.game-patterns",
  retentionClass: "certification-only",
  effectiveFrom: "2026-07-24T00:00:00.000Z",
  effectiveUntil: null,
  allowedClaimTypes: [
    "recurring-game-strength",
    "recurring-game-weakness",
  ],
  evidenceAdmission: {
    minimumQualityScore: 0.7,
    allowedSourceClassifications: [
      "game-integration-deterministic-transformation",
    ],
  },
  retention: {
    evidenceReferenceDays: 30,
    supersededClaimRevisionDays: 30,
  },
  claimLifecycle: {
    maximumValidityDays: 30,
    reassessAfterDays: 7,
  },
});

const policy: OperatorUnderstandingAccumulationPolicy = {
  dataPolicy,
  minimumSupportingEvidence: 2,
  minimumAcceptedConfidence: 0.8,
  eligibilityPolicyId: "sprint-22-certification-eligibility",
  eligibilityPolicyVersion: "1.0.0",
  producerId: "operator-intelligence-memory-adapter",
  producerVersion: "1.0.0",
  explanationTemplateVersion: "1.0.0",
};

const session: OracleSession = {
  contract: "oracle.session",
  contractVersion: 1,
  id: "session-22",
  operatorId: "operator-22",
  status: "completed",
  version: 4,
  startedAt: "2026-07-24T09:00:00.000Z",
  updatedAt: firstAt,
  endedAt: firstAt,
  context: {
    applicationId: "oracle-desktop",
    deviceId: "device-22",
    integrationId: "call-of-duty",
    integrationVersion: "1.0.0",
  },
  evidence: [
    sessionEvidence("session-evidence-1", "source-1", digestOne),
    sessionEvidence("session-evidence-2", "source-2", digestTwo),
  ],
  deletionOperationId: null,
};

const memory: OracleMemoryProfile = {
  operatorId: session.operatorId,
  status: "active",
  sessionCount: 12,
  behaviouralPatterns: ["Positioning is a recurring strength."],
  recurringWeaknesses: [],
  recurringStrengths: [
    {
      skill: "positioning",
      label: "Positioning",
      occurrences: 5,
      averageScore: 84,
      confidence: 0.85,
    },
  ],
  confidence: 0.85,
  generatedAt: firstAt,
};

const admittedEvidence = [
  admittedBundle("1", digestOne),
  admittedBundle("2", digestTwo),
] satisfies readonly AdmittedSessionEvidence[];

const candidates = createRecurringMemoryCandidates({
  session,
  memory,
  evidence: admittedEvidence,
  policy,
  assessedAt: firstAt,
});
const replay = createRecurringMemoryCandidates({
  session,
  memory,
  evidence: admittedEvidence,
  policy,
  assessedAt: firstAt,
});
assert.equal(candidates.length, 1);
assert.equal(candidates[0]?.claim.status, "candidate");
assert.equal(candidates[0]?.claim.epistemic, "suspected");
assert.equal(candidates[0]?.claim.eligibility.eligible, false);
assert.equal(candidates[0]?.claim.scope.type, "game-integration");
assert.equal(candidates[0]?.claim.claimId, replay[0]?.claim.claimId);
assert.equal(candidates[0]?.claim.id, replay[0]?.claim.id);
assert.deepEqual(candidates[0], replay[0]);

const candidate = candidates[0];
assert.ok(candidate);
const active = acceptRecurringMemoryCandidate(candidate, policy, secondAt);
assert.equal(active.status, "active");
assert.equal(active.epistemic, "inferred");
assert.equal(active.eligibility.eligible, true);
assert.equal(active.confidence.producerNative?.value, 0.85);
assert.match(active.confidence.rationale, /2 supporting Evidence/);
assert.deepEqual(
  active.explanation?.evidenceReferenceIds,
  admittedEvidence.map(({ evidence }) => evidence.id)
);

const contradicted = reviseRecurringMemoryClaim(
  active,
  candidate.evidenceReferences,
  {
    status: "active",
    assessedAt: thirdAt,
    policy,
    evidenceRelationships: {
      "session-evidence-2": "contradict",
    },
  }
);
assert.equal(contradicted.confidence.supportingEvidenceCount, 1);
assert.equal(contradicted.confidence.contradictingEvidenceCount, 1);
assert.match(
  contradicted.explanation?.summary ?? "",
  /contradicting Evidence/
);

const disputed = reviseRecurringMemoryClaim(
  contradicted,
  candidate.evidenceReferences,
  { status: "disputed", assessedAt: fourthAt, policy }
);
assert.equal(disputed.eligibility.eligible, false);
assert.deepEqual(disputed.eligibility.reasons, ["disputed"]);

const restored = reviseRecurringMemoryClaim(
  disputed,
  candidate.evidenceReferences,
  { status: "active", assessedAt: fifthAt, policy }
);
assert.equal(restored.eligibility.eligible, true);

const superseded = reviseRecurringMemoryClaim(
  restored,
  candidate.evidenceReferences,
  {
    status: "superseded",
    assessedAt: sixthAt,
    policy,
    supersedingValue: { skill: "positioning", label: "Positioning (revised)" },
  }
);
assert.deepEqual(superseded.eligibility.reasons, ["superseded"]);
const deleted = deleteRecurringMemoryClaim(
  superseded,
  policy,
  "2026-07-24T10:06:00.000Z"
);
assert.equal(deleted.status, "deleted");
assert.equal("value" in deleted, false);

const expired = reviseRecurringMemoryClaim(
  active,
  candidate.evidenceReferences,
  { status: "expired", assessedAt: thirdAt, policy }
);
assert.deepEqual(expired.eligibility.reasons, ["expired"]);

const snapshot = createOperatorUnderstandingSnapshot(
  {
    contract: {
      name: OPERATOR_UNDERSTANDING_SNAPSHOT_CONTRACT,
      version: 1,
    },
    operatorId: session.operatorId,
    generatedAt: fifthAt,
    asOf: fifthAt,
    purpose: dataPolicy.purpose,
    policySetVersion: "1.0.0",
    identity: [],
    preferences: [],
    goals: [],
    state: [],
    memory: [
      {
        understandingItemId: restored.id,
        epistemic: "inferred",
        retainedAt: fifthAt,
        retentionClass: dataPolicy.retentionClass,
        policyId: dataPolicy.id,
        policyVersion: dataPolicy.policyVersion,
        reassessAfter: restored.temporalValidity.reassessAfter,
      },
    ],
    intelligence: [restored],
    unknowns: [
      {
        id: "unknown-current-goal",
        operatorId: session.operatorId,
        key: "current-goal",
        epistemic: "unknown",
        value: null,
        confidence: null,
        reason: "No current goal has been declared.",
        requiredEvidence: ["operator-goal-declaration"],
        scope: { type: "operator" },
      },
    ],
  },
  candidate.evidenceReferences
);
const context = projectUnderstandingForOracleContext(snapshot, {
  purpose: dataPolicy.purpose,
  asOf: "2026-07-24T10:05:30.000Z",
  maximumAgeSeconds: 120,
});
assert.equal(context.intelligence.length, 1);
assert.equal(context.unknowns[0]?.key, "current-goal");
assert.equal(
  "evidence" in (context.intelligence[0] ?? {}),
  false,
  "Context projection must not expose Evidence links"
);

assert.throws(
  () =>
    projectUnderstandingForOracleContext(snapshot, {
      purpose: dataPolicy.purpose,
      asOf: "2026-07-24T10:07:00.000Z",
      maximumAgeSeconds: 60,
    }),
  /stale/
);
assert.throws(
  () =>
    createOperatorUnderstandingSnapshot(
      {
        ...snapshot,
        intelligence: [candidate.claim],
        memory: [],
      },
      candidate.evidenceReferences
    ),
  /only active, eligible inferred claims/
);
assert.throws(
  () =>
    createRecurringMemoryCandidates({
      session: { ...session, status: "active", endedAt: null },
      memory,
      evidence: admittedEvidence,
      policy,
      assessedAt: firstAt,
    }),
  /only completed Sessions/
);
assert.throws(
  () =>
    createRecurringMemoryCandidates({
      session,
      memory,
      evidence: admittedEvidence.map((bundle) => ({
        ...bundle,
        evidence: {
          ...bundle.evidence,
          scope: { type: "operator" as const },
        },
      })),
      policy,
      assessedAt: firstAt,
    }),
  /scoped to the completed Session/
);
assert.throws(
  () =>
    createRecurringMemoryCandidates({
      session,
      memory,
      evidence: admittedEvidence,
      policy: {
        ...policy,
        dataPolicy: {
          ...dataPolicy,
          allowedClaimTypes: ["learning-style" as never],
        },
      },
      assessedAt: firstAt,
    }),
  /policy is invalid/
);

process.stdout.write(
  "Operator Understanding accumulation certification passed.\n"
);
fs.mkdirSync("docs/sprints/evidence/sprint-22/generated", {
  recursive: true,
});
fs.writeFileSync(
  "docs/sprints/evidence/sprint-22/generated/operator-understanding-accumulation-certification.json",
  `${JSON.stringify({
    schemaVersion: 1,
    verifiedAt: new Date().toISOString(),
    sprint: 22,
    contract: "oracle.operator-understanding-accumulation",
    contractVersion: 1,
    candidateIdentity: candidate.claim.claimId,
    claimType: candidate.claim.type,
    scope: candidate.claim.scope,
    transitions: [
      candidate.claim.status,
      active.status,
      contradicted.status,
      disputed.status,
      restored.status,
      superseded.status,
      deleted.status,
    ],
    evidence: {
      admitted: admittedEvidence.length,
      supportingAtAcceptance:
        active.confidence.supportingEvidenceCount,
      contradictingAtReassessment:
        contradicted.confidence.contradictingEvidenceCount,
      rawObservationRetained: false,
    },
    idempotency: "pass-stable-exact-replay",
    snapshot: "pass-purpose-freshness-and-budget-gated",
    context: "pass-renderer-safe",
    crossGamePromotion: false,
    sensitiveInference: false,
    aiGeneratedInference: false,
    persistence: "disabled",
    deployment: "not-authorised",
    migrationIntroduced: false,
    result: "pass",
  }, null, 2)}\n`,
  "utf8"
);

function sessionEvidence(id: string, sourceRecordId: string, contentDigest: string) {
  return {
    id,
    sourceType: "game-integration-deterministic-transformation" as const,
    sourceOwnerId: "call-of-duty.integration",
    sourceRecordId,
    purpose: dataPolicy.purpose,
    policyId: dataPolicy.id,
    policyVersion: dataPolicy.policyVersion,
    contentDigest,
    observedAt: firstAt,
    admittedAt: firstAt,
  };
}

function admittedBundle(
  suffix: string,
  contentDigest: string
): AdmittedSessionEvidence {
  const evidenceId = `session-evidence-${suffix}`;
  const sourceRecordId = `source-${suffix}`;
  const evidence: OperatorEvidenceReference = {
    contract: {
      name: OPERATOR_EVIDENCE_REFERENCE_CONTRACT,
      version: 1,
    },
    id: evidenceId,
    operatorId: session.operatorId,
    sourceType: "session",
    sourceOwnerId: "oracle-session-service",
    sourceRecordId,
    observedAt: firstAt,
    capturedAt: firstAt,
    purpose: dataPolicy.purpose,
    scope: {
      type: "session",
      sessionId: session.id,
      integrationId: session.context.integrationId,
      integrationVersion: session.context.integrationVersion,
    },
    producer: {
      id: "oracle.memory-engine",
      version: "1.2.0",
      method: "deterministic-transformation",
    },
    quality: {
      score: 0.9,
      rationale: "Certification Evidence passed deterministic admission.",
      policyId: dataPolicy.id,
      policyVersion: dataPolicy.policyVersion,
      assessedAt: firstAt,
    },
    summary: "Minimised recurring game-pattern Evidence.",
    contentDigest,
    retentionClass: dataPolicy.retentionClass,
    policyId: dataPolicy.id,
    policyVersion: dataPolicy.policyVersion,
  };
  const admission: OperatorGameSessionEvidenceAdmission = {
    contract: {
      name: OPERATOR_GAME_SESSION_EVIDENCE_ADMISSION_CONTRACT,
      version: 1,
    },
    id: `admission-${suffix}`,
    operatorId: session.operatorId,
    evidenceReferenceId: evidence.id,
    evidenceDispositionId: `disposition-${suffix}`,
    sessionId: session.id,
    sourceRecordId,
    integrationId: session.context.integrationId,
    integrationVersion: session.context.integrationVersion,
    purpose: dataPolicy.purpose,
    intendedClaimType: "recurring-game-strength",
    sourceClassification:
      "game-integration-deterministic-transformation",
    policyId: dataPolicy.id,
    policyVersion: dataPolicy.policyVersion,
    consentDecisionId: "consent-1",
    admittedAt: firstAt,
  };
  return { admission, evidence };
}
