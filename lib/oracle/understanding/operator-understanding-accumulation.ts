import { createHash } from "node:crypto";

import type { OracleMemoryPattern, OracleMemoryProfile } from "../memory";
import type { OracleSession } from "../sessions";
import {
  createOperatorEvidenceReference,
  createOperatorIntelligenceClaimRevision,
  createOperatorIntelligenceClaimTombstone,
} from "./operator-understanding-contract";
import { assertOperatorClaimRevisionTransition } from "./operator-understanding-lifecycle";
import type {
  OperatorDataPolicyDefinition,
  OperatorGamePatternClaimType,
  OperatorGameSessionEvidenceAdmission,
} from "./operator-intelligence-trust-types";
import {
  OPERATOR_INTELLIGENCE_CLAIM_CONTRACT,
  OPERATOR_UNDERSTANDING_CONTRACT_VERSION,
  OPERATOR_UNDERSTANDING_EXPLANATION_CONTRACT,
  type OperatorClaimEvidenceRelationship,
  type OperatorEvidenceReference,
  type OperatorIntelligenceClaimRevision,
  type OperatorIntelligenceClaimTombstone,
  type OperatorUnderstandingEligibilityReason,
} from "./operator-understanding-types";

const DAY_MS = 86_400_000;
const APPROVED_CLAIM_TYPES: readonly OperatorGamePatternClaimType[] = [
  "recurring-game-strength",
  "recurring-game-weakness",
];

export type OperatorUnderstandingAccumulationPolicy = Readonly<{
  dataPolicy: OperatorDataPolicyDefinition;
  minimumSupportingEvidence: number;
  minimumAcceptedConfidence: number;
  eligibilityPolicyId: string;
  eligibilityPolicyVersion: string;
  producerId: "operator-intelligence-memory-adapter";
  producerVersion: string;
  explanationTemplateVersion: string;
}>;

export type AdmittedSessionEvidence = Readonly<{
  admission: OperatorGameSessionEvidenceAdmission;
  evidence: OperatorEvidenceReference;
}>;

export type RecurringMemoryAccumulationInput = Readonly<{
  session: OracleSession;
  memory: OracleMemoryProfile;
  evidence: readonly AdmittedSessionEvidence[];
  policy: OperatorUnderstandingAccumulationPolicy;
  assessedAt: string;
}>;

export type RecurringMemoryCandidate = Readonly<{
  claim: OperatorIntelligenceClaimRevision;
  evidenceReferences: readonly OperatorEvidenceReference[];
  naturalIdentity: string;
}>;

export type OperatorUnderstandingContextProjection = Readonly<{
  contract: "oracle.operator-understanding-context";
  contractVersion: 1;
  operatorId: string;
  purpose: string;
  asOf: string;
  intelligence: readonly Readonly<{
    claimId: string;
    type: string;
    value: OperatorIntelligenceClaimRevision["value"];
    confidence: number;
    explanation: string;
    scope: OperatorIntelligenceClaimRevision["scope"];
  }>[];
  unknowns: readonly Readonly<{
    key: string;
    reason: string;
  }>[];
}>;

export function createRecurringMemoryCandidates(
  input: RecurringMemoryAccumulationInput
): readonly RecurringMemoryCandidate[] {
  assertAccumulationInput(input);
  const candidates = [
    ...input.memory.recurringStrengths.map((pattern) => ({
      pattern,
      type: "recurring-game-strength" as const,
    })),
    ...input.memory.recurringWeaknesses.map((pattern) => ({
      pattern,
      type: "recurring-game-weakness" as const,
    })),
  ];

  return Object.freeze(
    candidates.map(({ pattern, type }) =>
      createCandidate(input, pattern, type)
    )
  );
}

export function acceptRecurringMemoryCandidate(
  candidate: RecurringMemoryCandidate,
  policy: OperatorUnderstandingAccumulationPolicy,
  assessedAt: string
): OperatorIntelligenceClaimRevision {
  assertPolicy(policy);
  assertTimestamp(assessedAt, "assessedAt");
  if (candidate.claim.status !== "candidate") {
    throw new Error("Only suspected candidates can be accepted.");
  }
  if (
    candidate.claim.type !== "recurring-game-strength" &&
    candidate.claim.type !== "recurring-game-weakness"
  ) {
    throw new Error("Only the approved recurring game-pattern family can be accepted.");
  }
  const support = candidate.claim.evidence.filter(
    ({ relationship }) => relationship === "support"
  );
  if (
    support.length < policy.minimumSupportingEvidence ||
    candidate.claim.confidence.score < policy.minimumAcceptedConfidence
  ) {
    throw new Error(
      "Recurring game-pattern candidate does not satisfy the injected acceptance policy."
    );
  }

  const revisionId = revisionIdentity(candidate.claim.claimId, 2);
  const evidence = relinkEvidence(
    candidate.claim.evidence,
    revisionId,
    assessedAt
  );
  const next = createOperatorIntelligenceClaimRevision(
    {
      ...candidate.claim,
      id: revisionId,
      revision: 2,
      status: "active",
      epistemic: "inferred",
      explanation: {
        contract: {
          name: OPERATOR_UNDERSTANDING_EXPLANATION_CONTRACT,
          version: OPERATOR_UNDERSTANDING_CONTRACT_VERSION,
        },
        summary:
          `${claimLabel(candidate.claim)} is an accepted ` +
          `${candidate.claim.type === "recurring-game-strength" ? "strength" : "weakness"} ` +
          "for this Game Integration because permitted recurring evidence satisfies the active policy.",
        reasonCodes: [`${candidate.claim.type}-supported`],
        evidenceReferenceIds: support.map(({ evidenceReferenceId }) =>
          evidenceReferenceId
        ),
        method: {
          kind: "deterministic-template",
          id: "recurring-game-pattern-explanation",
          version: policy.explanationTemplateVersion,
        },
        policyVersion: policy.dataPolicy.policyVersion,
        generatedAt: assessedAt,
      },
      evidence,
      confidence: {
        ...candidate.claim.confidence,
        rationale:
          `Producer-native confidence ${candidate.claim.confidence.score} and ` +
          `${support.length} supporting Evidence reference(s) satisfy policy ` +
          `${policy.dataPolicy.id}@${policy.dataPolicy.policyVersion}.`,
        assessedAt,
      },
      temporalValidity: policyTemporalValidity(policy, assessedAt),
      eligibility: {
        eligible: true,
        reasons: [],
        purpose: policy.dataPolicy.purpose,
        policyId: policy.eligibilityPolicyId,
        policyVersion: policy.eligibilityPolicyVersion,
        assessedAt,
      },
      supersedesRevisionId: candidate.claim.id,
    },
    candidate.evidenceReferences
  );
  assertOperatorClaimRevisionTransition(candidate.claim, next);
  return next;
}

export function reviseRecurringMemoryClaim(
  previous: OperatorIntelligenceClaimRevision,
  evidenceReferences: readonly OperatorEvidenceReference[],
  input: Readonly<{
    status: "active" | "candidate" | "disputed" | "superseded" | "expired";
    assessedAt: string;
    policy: OperatorUnderstandingAccumulationPolicy;
    evidenceRelationships?: Readonly<
      Record<string, OperatorClaimEvidenceRelationship>
    >;
    supersedingValue?: OperatorIntelligenceClaimRevision["value"];
  }>
): OperatorIntelligenceClaimRevision {
  assertPolicy(input.policy);
  assertTimestamp(input.assessedAt, "assessedAt");
  const revision = previous.revision + 1;
  const revisionId = revisionIdentity(previous.claimId, revision);
  const evidence = previous.evidence.map((link) => ({
    ...link,
    claimRevisionId: revisionId,
    relationship:
      input.evidenceRelationships?.[link.evidenceReferenceId] ??
      link.relationship,
    linkedAt: input.assessedAt,
  }));
  const supportIds = evidence
    .filter(({ relationship }) => relationship === "support")
    .map(({ evidenceReferenceId }) => evidenceReferenceId);
  const contradictionCount = evidence.length - supportIds.length;
  const active = input.status === "active";
  const candidate = input.status === "candidate";
  const reasons: OperatorUnderstandingEligibilityReason[] = active
    ? []
    : [candidate ? "candidate" : input.status];
  const explanation = candidate
    ? null
    : {
        contract: {
          name: OPERATOR_UNDERSTANDING_EXPLANATION_CONTRACT,
          version: OPERATOR_UNDERSTANDING_CONTRACT_VERSION,
        },
        summary:
          contradictionCount > 0
            ? `${claimLabel(previous)} was reassessed with explicit contradicting Evidence.`
            : `${claimLabel(previous)} was reassessed under the active lifecycle policy.`,
        reasonCodes: [
          contradictionCount > 0
            ? "recurring-game-pattern-contradicted"
            : `recurring-game-pattern-${input.status}`,
        ],
        evidenceReferenceIds: supportIds,
        method: {
          kind: "deterministic-template" as const,
          id: "recurring-game-pattern-explanation",
          version: input.policy.explanationTemplateVersion,
        },
        policyVersion: input.policy.dataPolicy.policyVersion,
        generatedAt: input.assessedAt,
      };

  if (!candidate && supportIds.length === 0) {
    throw new Error(
      "Accepted or historical recurring game-pattern revisions require supporting Evidence."
    );
  }

  const next = createOperatorIntelligenceClaimRevision(
    {
      ...previous,
      id: revisionId,
      revision,
      status: input.status,
      epistemic: candidate ? "suspected" : "inferred",
      value: input.supersedingValue ?? previous.value,
      evidence,
      confidence: {
        ...previous.confidence,
        rationale:
          `${supportIds.length} supporting and ${contradictionCount} ` +
          `contradicting Evidence reference(s) were assessed under ` +
          `${input.policy.dataPolicy.id}@${input.policy.dataPolicy.policyVersion}.`,
        supportingEvidenceCount: supportIds.length,
        contradictingEvidenceCount: contradictionCount,
        assessedAt: input.assessedAt,
      },
      explanation,
      temporalValidity: policyTemporalValidity(
        input.policy,
        input.assessedAt
      ),
      eligibility: {
        eligible: active,
        reasons,
        purpose: input.policy.dataPolicy.purpose,
        policyId: input.policy.eligibilityPolicyId,
        policyVersion: input.policy.eligibilityPolicyVersion,
        assessedAt: input.assessedAt,
      },
      policyId: input.policy.dataPolicy.id,
      policyVersion: input.policy.dataPolicy.policyVersion,
      supersedesRevisionId: previous.id,
    },
    evidenceReferences
  );
  assertOperatorClaimRevisionTransition(previous, next);
  return next;
}

export function deleteRecurringMemoryClaim(
  previous: OperatorIntelligenceClaimRevision,
  policy: OperatorUnderstandingAccumulationPolicy,
  deletedAt: string
): OperatorIntelligenceClaimTombstone {
  assertPolicy(policy);
  assertTimestamp(deletedAt, "deletedAt");
  const tombstone = createOperatorIntelligenceClaimTombstone({
    contract: {
      name: OPERATOR_INTELLIGENCE_CLAIM_CONTRACT,
      version: OPERATOR_UNDERSTANDING_CONTRACT_VERSION,
    },
    id: revisionIdentity(previous.claimId, previous.revision + 1),
    claimId: previous.claimId,
    operatorId: previous.operatorId,
    revision: previous.revision + 1,
    status: "deleted",
    deletedAt,
    policyId: policy.dataPolicy.id,
    policyVersion: policy.dataPolicy.policyVersion,
    supersedesRevisionId: previous.id,
  });
  assertOperatorClaimRevisionTransition(previous, tombstone);
  return tombstone;
}

export function projectUnderstandingForOracleContext(
  snapshot: import("./operator-understanding-types").OperatorUnderstandingSnapshot,
  gate: Readonly<{
    purpose: string;
    asOf: string;
    maximumAgeSeconds: number;
  }>
): OperatorUnderstandingContextProjection {
  assertTimestamp(gate.asOf, "gate.asOf");
  if (
    !Number.isInteger(gate.maximumAgeSeconds) ||
    gate.maximumAgeSeconds < 1
  ) {
    throw new Error("Oracle Context Understanding freshness must be positive.");
  }
  if (snapshot.purpose !== gate.purpose) {
    throw new Error("Oracle Context cannot consume Understanding for another purpose.");
  }
  const age = Date.parse(gate.asOf) - Date.parse(snapshot.generatedAt);
  if (age < 0 || age > gate.maximumAgeSeconds * 1_000) {
    throw new Error("Oracle Context cannot consume a stale Understanding Snapshot.");
  }

  return Object.freeze({
    contract: "oracle.operator-understanding-context",
    contractVersion: 1,
    operatorId: snapshot.operatorId,
    purpose: snapshot.purpose,
    asOf: snapshot.asOf,
    intelligence: Object.freeze(
      snapshot.intelligence.map((claim) =>
        Object.freeze({
          claimId: claim.claimId,
          type: claim.type,
          value: claim.value,
          confidence: claim.confidence.score,
          explanation: claim.explanation?.summary ?? "",
          scope: claim.scope,
        })
      )
    ),
    unknowns: Object.freeze(
      snapshot.unknowns.map((unknown) =>
        Object.freeze({ key: unknown.key, reason: unknown.reason })
      )
    ),
  });
}

function createCandidate(
  input: RecurringMemoryAccumulationInput,
  pattern: OracleMemoryPattern,
  type: OperatorGamePatternClaimType
): RecurringMemoryCandidate {
  if (!input.policy.dataPolicy.allowedClaimTypes.includes(type)) {
    throw new Error(`Accumulation policy does not allow '${type}'.`);
  }
  const bundles = input.evidence.filter(
    ({ admission }) => admission.intendedClaimType === type
  );
  if (bundles.length === 0) {
    throw new Error(`Recurring pattern '${type}' has no admitted Evidence.`);
  }
  const naturalIdentity = [
    "recurring-game-pattern",
    input.session.operatorId,
    input.session.context.integrationId,
    input.session.context.integrationVersion,
    type,
    pattern.skill,
  ].join("\u001f");
  const claimId = stableUuid(naturalIdentity);
  const revisionId = revisionIdentity(claimId, 1);
  const evidenceReferences = bundles.map(({ evidence }) =>
    createOperatorEvidenceReference(evidence)
  );
  const evidence = evidenceReferences.map((reference) => ({
    claimId,
    claimRevisionId: revisionId,
    evidenceReferenceId: reference.id,
    relationship: "support" as const,
    rationale: `Admitted completed-Session Evidence supports ${type}.`,
    linkedAt: input.assessedAt,
  }));
  const claim = createOperatorIntelligenceClaimRevision(
    {
      contract: {
        name: OPERATOR_INTELLIGENCE_CLAIM_CONTRACT,
        version: OPERATOR_UNDERSTANDING_CONTRACT_VERSION,
      },
      id: revisionId,
      claimId,
      operatorId: input.session.operatorId,
      revision: 1,
      type,
      status: "candidate",
      epistemic: "suspected",
      value: { skill: pattern.skill, label: pattern.label },
      confidence: {
        score: pattern.confidence,
        rationale:
          "Candidate retains producer-native Memory confidence; acceptance is not implied.",
        supportingEvidenceCount: evidence.length,
        contradictingEvidenceCount: 0,
        policyId: input.policy.dataPolicy.id,
        policyVersion: input.policy.dataPolicy.policyVersion,
        assessedAt: input.assessedAt,
        producerNative: {
          value: pattern.confidence,
          scale: { minimum: 0, maximum: 1 },
          label: null,
          rationale: "Native Memory pattern confidence retained without rescaling.",
        },
      },
      explanation: null,
      evidence,
      provenance: {
        sourceOwnerType: "oracle-engine",
        sourceOwnerId: "oracle.memory-engine",
        method: "deterministic-engine",
        producerId: input.policy.producerId,
        producerVersion: input.policy.producerVersion,
        generatedAt: input.assessedAt,
      },
      scope: {
        type: "game-integration",
        integrationId: input.session.context.integrationId,
        integrationVersion: input.session.context.integrationVersion,
      },
      temporalValidity: policyTemporalValidity(input.policy, input.assessedAt),
      eligibility: {
        eligible: false,
        reasons: ["candidate"],
        purpose: input.policy.dataPolicy.purpose,
        policyId: input.policy.eligibilityPolicyId,
        policyVersion: input.policy.eligibilityPolicyVersion,
        assessedAt: input.assessedAt,
      },
      policyId: input.policy.dataPolicy.id,
      policyVersion: input.policy.dataPolicy.policyVersion,
      supersedesRevisionId: null,
    },
    evidenceReferences
  );

  return Object.freeze({
    claim,
    evidenceReferences: Object.freeze(evidenceReferences),
    naturalIdentity,
  });
}

function assertAccumulationInput(
  input: RecurringMemoryAccumulationInput
): void {
  assertPolicy(input.policy);
  assertTimestamp(input.assessedAt, "assessedAt");
  if (input.session.status !== "completed" || input.session.endedAt === null) {
    throw new Error("Operator Understanding accepts only completed Sessions.");
  }
  if (input.memory.operatorId !== input.session.operatorId) {
    throw new Error("Memory and Session must belong to the same Operator.");
  }
  for (const { admission, evidence } of input.evidence) {
    const sessionEvidence = input.session.evidence.find(
      ({ id }) => id === evidence.id
    );
    if (
      admission.operatorId !== input.session.operatorId ||
      evidence.operatorId !== input.session.operatorId ||
      admission.sessionId !== input.session.id ||
      admission.evidenceReferenceId !== evidence.id ||
      !sessionEvidence ||
      sessionEvidence.contentDigest !== evidence.contentDigest ||
      evidence.scope.type !== "session" ||
      evidence.scope.sessionId !== input.session.id ||
      evidence.scope.integrationId !== input.session.context.integrationId ||
      evidence.scope.integrationVersion !==
        input.session.context.integrationVersion ||
      admission.integrationId !== input.session.context.integrationId ||
      admission.integrationVersion !==
        input.session.context.integrationVersion
    ) {
      throw new Error(
        "Accumulation Evidence must be admitted by and scoped to the completed Session."
      );
    }
  }
}

function assertPolicy(policy: OperatorUnderstandingAccumulationPolicy): void {
  if (
    !Number.isInteger(policy.minimumSupportingEvidence) ||
    policy.minimumSupportingEvidence < 1 ||
    policy.minimumAcceptedConfidence < 0 ||
    policy.minimumAcceptedConfidence > 1 ||
    policy.producerId !== "operator-intelligence-memory-adapter" ||
    policy.dataPolicy.allowedClaimTypes.some(
      (type) => !APPROVED_CLAIM_TYPES.includes(type)
    )
  ) {
    throw new Error("Operator Understanding accumulation policy is invalid.");
  }
}

function policyTemporalValidity(
  policy: OperatorUnderstandingAccumulationPolicy,
  assessedAt: string
) {
  const assessed = Date.parse(assessedAt);
  return {
    effectiveFrom: assessedAt,
    validUntil: new Date(
      assessed + policy.dataPolicy.claimLifecycle.maximumValidityDays * DAY_MS
    ).toISOString(),
    lastAssessedAt: assessedAt,
    reassessAfter: new Date(
      assessed + policy.dataPolicy.claimLifecycle.reassessAfterDays * DAY_MS
    ).toISOString(),
    reassessmentTrigger:
      "Reassess when linked Session Evidence, consent or policy changes.",
  };
}

function relinkEvidence(
  evidence: OperatorIntelligenceClaimRevision["evidence"],
  revisionId: string,
  linkedAt: string
) {
  return evidence.map((link) => ({
    ...link,
    claimRevisionId: revisionId,
    linkedAt,
  }));
}

function stableUuid(value: string): string {
  const digest = createHash("sha256").update(value).digest("hex");
  return [
    digest.slice(0, 8),
    digest.slice(8, 12),
    `5${digest.slice(13, 16)}`,
    `8${digest.slice(17, 20)}`,
    digest.slice(20, 32),
  ].join("-");
}

function revisionIdentity(claimId: string, revision: number): string {
  return stableUuid(`${claimId}\u001frevision\u001f${revision}`);
}

function claimLabel(claim: OperatorIntelligenceClaimRevision): string {
  const value = claim.value;
  if (
    typeof value === "object" &&
    value !== null &&
    !Array.isArray(value)
  ) {
    const record = value as Readonly<Record<string, unknown>>;
    if (typeof record.label === "string") return record.label;
  }
  return claim.type;
}

function assertTimestamp(value: string, path: string): void {
  if (!Number.isFinite(Date.parse(value))) {
    throw new Error(`Operator Understanding '${path}' must be a timestamp.`);
  }
}
