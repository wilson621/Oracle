import {
  OPERATOR_DATA_POLICY_REFERENCE_CONTRACT,
  OPERATOR_EVIDENCE_REFERENCE_CONTRACT,
  OPERATOR_INTELLIGENCE_CLAIM_CONTRACT,
  OPERATOR_UNDERSTANDING_EXPLANATION_CONTRACT,
  OPERATOR_UNDERSTANDING_SNAPSHOT_CONTRACT,
} from "../lib/oracle/understanding";

export const verifiedAt = "2026-07-21T12:00:00.000Z";
export const expiresAt = "2026-08-21T12:00:00.000Z";

export const dataPolicyInput = {
  contract: {
    name: OPERATOR_DATA_POLICY_REFERENCE_CONTRACT,
    version: 1,
  },
  id: "operator-understanding-test-policy",
  policyVersion: "1.0.0",
  purpose: "operator-coaching",
  retentionClass: "accepted-game-intelligence",
};

export const evidenceInput = {
  contract: {
    name: OPERATOR_EVIDENCE_REFERENCE_CONTRACT,
    version: 1,
  },
  id: "evidence-session-1",
  operatorId: "operator-1",
  sourceType: "session",
  sourceOwnerId: "oracle-session-repository",
  sourceRecordId: "session-1",
  observedAt: verifiedAt,
  capturedAt: verifiedAt,
  purpose: "operator-coaching",
  scope: {
    type: "game-integration",
    integrationId: "example-game",
    integrationVersion: "1.0.0",
  },
  producer: {
    id: "oracle.memory-engine",
    version: "1.0.0",
    method: "deterministic-transformation",
  },
  quality: null,
  summary: "The same game-scoped strength recurred in permitted Sessions.",
  contentDigest: "sha256:example-evidence-digest",
  retentionClass: "derived-session-reference",
  policyId: "operator-evidence-test-policy",
  policyVersion: "1.0.0",
};

export const evidenceLinkInput = {
  claimId: "claim-1",
  claimRevisionId: "claim-1-revision-1",
  evidenceReferenceId: "evidence-session-1",
  relationship: "support",
  rationale: "The observation supports the recurring strength candidate.",
  linkedAt: verifiedAt,
};

export const activeClaimInput = {
  contract: {
    name: OPERATOR_INTELLIGENCE_CLAIM_CONTRACT,
    version: 1,
  },
  id: "claim-1-revision-1",
  claimId: "claim-1",
  operatorId: "operator-1",
  revision: 1,
  type: "recurring-game-strength",
  status: "active",
  epistemic: "inferred",
  value: {
    capability: "positioning",
  },
  confidence: {
    score: 0.8,
    rationale: "One permitted evidence reference satisfies this test policy.",
    supportingEvidenceCount: 1,
    contradictingEvidenceCount: 0,
    policyId: "operator-intelligence-test-policy",
    policyVersion: "1.0.0",
    assessedAt: verifiedAt,
    producerNative: {
      value: 80,
      scale: {
        minimum: 0,
        maximum: 100,
      },
      label: "high",
      rationale: "Native Memory Engine confidence retained without rescaling.",
    },
  },
  explanation: {
    contract: {
      name: OPERATOR_UNDERSTANDING_EXPLANATION_CONTRACT,
      version: 1,
    },
    summary: "Positioning is understood as a recurring game-specific strength because the linked permitted observation supports it.",
    reasonCodes: ["recurring-game-strength-supported"],
    evidenceReferenceIds: ["evidence-session-1"],
    method: {
      kind: "deterministic-template",
      id: "recurring-game-pattern-explanation",
      version: "1.0.0",
    },
    policyVersion: "1.0.0",
    generatedAt: verifiedAt,
  },
  evidence: [evidenceLinkInput],
  provenance: {
    sourceOwnerType: "oracle-engine",
    sourceOwnerId: "oracle.memory-engine",
    method: "deterministic-engine",
    producerId: "operator-intelligence-memory-adapter",
    producerVersion: "1.0.0",
    generatedAt: verifiedAt,
  },
  scope: {
    type: "game-integration",
    integrationId: "example-game",
    integrationVersion: "1.0.0",
  },
  temporalValidity: {
    effectiveFrom: verifiedAt,
    validUntil: expiresAt,
    lastAssessedAt: verifiedAt,
    reassessAfter: expiresAt,
    reassessmentTrigger: "Reassess when linked Session evidence changes.",
  },
  eligibility: {
    eligible: true,
    reasons: [],
    purpose: "operator-coaching",
    policyId: "operator-understanding-test-eligibility",
    policyVersion: "1.0.0",
    assessedAt: verifiedAt,
  },
  policyId: "operator-intelligence-test-policy",
  policyVersion: "1.0.0",
  supersedesRevisionId: null,
};

export const declaredIdentityInput = {
  id: "identity-callsign",
  operatorId: "operator-1",
  key: "callsign",
  epistemic: "declared",
  value: "Sentinel",
  confidence: null,
  provenance: {
    sourceOwnerType: "operator-service",
    sourceOwnerId: "operator-service",
    method: "operator-declaration",
    producerId: "operator-declaration",
    producerVersion: "1.0.0",
    generatedAt: verifiedAt,
  },
  scope: {
    type: "operator",
  },
  temporalValidity: {
    effectiveFrom: verifiedAt,
    validUntil: null,
    lastAssessedAt: null,
    reassessAfter: null,
    reassessmentTrigger: null,
  },
  revisionId: "identity-callsign-revision-1",
};

export const unknownInput = {
  id: "unknown-current-goal",
  operatorId: "operator-1",
  key: "current-goal",
  epistemic: "unknown",
  value: null,
  confidence: null,
  reason: "No current goal has been declared.",
  requiredEvidence: ["operator-goal-declaration"],
  scope: {
    type: "operator",
  },
};

export const snapshotInput = {
  contract: {
    name: OPERATOR_UNDERSTANDING_SNAPSHOT_CONTRACT,
    version: 1,
  },
  operatorId: "operator-1",
  generatedAt: verifiedAt,
  asOf: verifiedAt,
  purpose: "operator-coaching",
  policySetVersion: "1.0.0",
  identity: [declaredIdentityInput],
  preferences: [],
  goals: [],
  state: [],
  memory: [
    {
      understandingItemId: "claim-1-revision-1",
      epistemic: "inferred",
      retainedAt: verifiedAt,
      retentionClass: "accepted-game-intelligence",
      policyId: "operator-memory-test-policy",
      policyVersion: "1.0.0",
      reassessAfter: expiresAt,
    },
  ],
  intelligence: [activeClaimInput],
  unknowns: [unknownInput],
};
