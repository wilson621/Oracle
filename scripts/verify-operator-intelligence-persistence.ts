import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";
import type { SupabaseClient } from "@supabase/supabase-js";
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
  createOperatorIntelligenceClaimRevision,
  createOperatorIntelligencePageRequest,
} from "../lib/oracle/understanding";
import { SupabaseOperatorIntelligenceRepository } from "../lib/oracle/repositories/operator-intelligence-repository";
import {
  activeClaimInput,
} from "./operator-understanding-verification-fixtures";

const operatorId = "11111111-1111-4111-8111-111111111111";
const sessionId = "aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa";
const policyId = "operator-game-pattern-intelligence";
const policyVersion = "1.0.0";
const assessedAt = "2026-07-21T12:00:00.000Z";

async function main() {
  verifyMigrationContract();
  await verifyRepositoryWriteBoundary();
  await verifyBoundedReadBoundary();
  await verifyCrossOperatorRejection();
  verifyRepositoryOwnershipBoundary();
  process.stdout.write(
    "Operator Intelligence persistence verification passed.\n"
  );
}

function verifyMigrationContract() {
  const migration = fs.readFileSync(
    path.join(
      process.cwd(),
      "database",
      "009_operator_intelligence_persistence.sql"
    ),
    "utf8"
  );
  const tables = [
    "operator_data_policy_versions",
    "operator_consent_decisions",
    "operator_intelligence_evidence",
    "operator_intelligence_evidence_dispositions",
    "operator_intelligence_evidence_admissions",
    "operator_intelligence_claims",
    "operator_intelligence_claim_revisions",
    "operator_intelligence_claim_evidence",
    "operator_intelligence_eligibility_assessments",
  ];

  assert.match(migration, /^begin;/i);
  assert.match(migration, /commit;\s*$/i);

  for (const table of tables) {
    assert.match(
      migration,
      new RegExp(`create table public\\.${table} \\(`, "i")
    );
    assert.match(
      migration,
      new RegExp(
        `alter table public\\.${table}\\s+enable row level security`,
        "i"
      )
    );
    assert.match(
      migration,
      new RegExp(`revoke all privileges on table public\\.${table}`, "i")
    );
  }

  assert.match(
    migration,
    /foreign key \(operator_id, evidence_reference_id\)[\s\S]+references public\.operator_intelligence_evidence/i
  );
  assert.match(
    migration,
    /foreign key \(operator_id, claim_id, claim_revision_id\)[\s\S]+references public\.operator_intelligence_claim_revisions/i
  );
  assert.match(migration, /deferrable initially deferred/i);
  assert.match(
    migration,
    /claim_revision_contract -> 'explanation'/i
  );
  assert.match(migration, /sensitive_type_check/i);
  assert.match(
    migration,
    /grant execute on function public\.persist_operator_intelligence_claim_revision[\s\S]+to service_role/i
  );
  assert.match(migration, /Trusted Operator Intelligence authority is required/g);
  assert.match(migration, /Durable intelligence requires admitted evidence/i);
  assert.match(migration, /oracle_sessions_id_operator_unique/i);
  assert.match(migration, /operator_data_policy_versions_select_authenticated/i);
  assert.match(migration, /read_operator_intelligence_eligible_claim_page/i);
  assert.match(migration, /p_scope is null[\s\S]+claim_revision_contract -> 'scope' = p_scope/i);
  assert.match(migration, /recorded_at <= effective_watermark/i);
  assert.match(migration, /limit p_page_size \+ 1/i);
  assert.match(migration, /order by head\.effective_from desc, head\.claim_revision_id asc/i);
  assert.doesNotMatch(
    migration,
    /grant execute on function public\.[^;]+\s+to authenticated/i
  );
  assert.doesNotMatch(migration, /grant (insert|update|delete)[^;]+authenticated/i);
  assert.doesNotMatch(migration, /grant (insert|update|delete)[^;]+service_role/i);
  assert.doesNotMatch(
    migration,
    /(insert into|update) public\.(operators|oracle_sessions|operator_account_bindings)/i
  );
}

async function verifyRepositoryWriteBoundary() {
  const client = new RecordingSupabaseClient();
  const repository = new SupabaseOperatorIntelligenceRepository(
    client as unknown as SupabaseClient
  );
  const fixture = createTrustFixture();
  const persistedPolicy = await repository.registerPolicyDefinition(
    fixture.policy
  );

  assert.deepEqual(persistedPolicy, fixture.policy);
  await repository.appendConsentDecision(operatorId, fixture.consent);
  await repository.admitGameSessionEvidence(
    operatorId,
    fixture.evidence,
    fixture.disposition,
    fixture.admission
  );

  const candidate = createOperatorIntelligenceClaimRevision(
    createCandidateInput(operatorId, fixture.evidence),
    [fixture.evidence]
  );
  const persisted = await repository.persistClaimRevision(
    operatorId,
    [fixture.evidence],
    candidate
  );

  assert.deepEqual(persisted, candidate);
  assert.deepEqual(
    client.calls.map((call) => call.functionName),
    [
      "register_operator_data_policy_version",
      "append_operator_consent_decision",
      "admit_operator_game_session_evidence",
      "persist_operator_intelligence_claim_revision",
    ]
  );
  assert.equal("p_operator_id" in client.calls[0].arguments, false);
  assert.equal(client.calls[1]?.arguments.p_operator_id, operatorId);
  assert.equal(client.calls[2]?.arguments.p_operator_id, operatorId);
  assert.equal(client.calls[3]?.arguments.p_operator_id, operatorId);
}

async function verifyCrossOperatorRejection() {
  const client = new RecordingSupabaseClient();
  const repository = new SupabaseOperatorIntelligenceRepository(
    client as unknown as SupabaseClient
  );
  const { evidence } = createTrustFixture();
  const candidate = createOperatorIntelligenceClaimRevision(
    createCandidateInput(operatorId, evidence),
    [evidence]
  );

  await assert.rejects(
    repository.persistClaimRevision(
      "22222222-2222-4222-8222-222222222222",
      [evidence],
      candidate
    ),
    /cannot cross Operator ownership/
  );
  assert.equal(client.calls.length, 0);
}

async function verifyBoundedReadBoundary() {
  const fixture = createTrustFixture();
  const activeClaim = createOperatorIntelligenceClaimRevision(
    {
      ...activeClaimInput,
      operatorId,
      evidence: [{
        ...activeClaimInput.evidence[0],
        evidenceReferenceId: fixture.evidence.id,
      }],
      scope: fixture.evidence.scope,
      policyId,
      policyVersion,
      confidence: {
        ...activeClaimInput.confidence,
        policyId,
        policyVersion,
      },
      eligibility: {
        ...activeClaimInput.eligibility,
        purpose: OPERATOR_GAME_PATTERN_INTELLIGENCE_PURPOSE,
        policyId,
        policyVersion,
        assessedAt,
      },
    },
    [fixture.evidence]
  );
  const { evidence, eligibility, ...claimRevisionContract } = activeClaim;
  const client = new RecordingSupabaseClient();
  client.readPageData = {
    readWatermark: "2026-07-21T12:01:00.000Z",
    hasMore: true,
    rows: [{
      claimRevisionId: activeClaim.id,
      effectiveFrom: activeClaim.temporalValidity.effectiveFrom,
      claimRevisionContract,
      eligibilityContract: eligibility,
      evidenceLinks: evidence,
      evidenceContracts: [fixture.evidence],
    }],
  };
  const repository = new SupabaseOperatorIntelligenceRepository(
    client as unknown as SupabaseClient
  );
  const query = {
    operatorId,
    purpose: OPERATOR_GAME_PATTERN_INTELLIGENCE_PURPOSE,
    asOf: assessedAt,
    scope: fixture.evidence.scope,
    page: createOperatorIntelligencePageRequest({ pageSize: 1 }),
  };
  const firstPage = await repository.listEligibleClaimRevisions(query);

  assert.deepEqual(firstPage.items, [activeClaim]);
  assert.equal(firstPage.hasMore, true);
  assert.ok(firstPage.nextCursor);
  assert.equal(client.calls.at(-1)?.functionName,
    "read_operator_intelligence_eligible_claim_page");
  assert.equal(client.calls.at(-1)?.arguments.p_operator_id, operatorId);
  assert.equal(client.calls.at(-1)?.arguments.p_purpose,
    OPERATOR_GAME_PATTERN_INTELLIGENCE_PURPOSE);
  assert.deepEqual(client.calls.at(-1)?.arguments.p_scope, fixture.evidence.scope);
  assert.equal(client.calls.at(-1)?.arguments.p_page_size, 1);

  client.readPageData = {
    readWatermark: "2026-07-21T12:01:00.000Z",
    hasMore: false,
    rows: [],
  };
  const secondPage = await repository.listEligibleClaimRevisions({
    ...query,
    page: createOperatorIntelligencePageRequest({
      pageSize: 1,
      cursor: firstPage.nextCursor,
    }),
  });

  assert.equal(secondPage.items.length, 0);
  assert.equal(
    client.calls.at(-1)?.arguments.p_read_watermark,
    "2026-07-21T12:01:00.000Z"
  );
  assert.equal(
    client.calls.at(-1)?.arguments.p_after_revision_id,
    activeClaim.id
  );
}

function verifyRepositoryOwnershipBoundary() {
  const sourceFiles = collectTypeScriptFiles(path.join(process.cwd(), "lib"));
  const intelligenceTableReads = sourceFiles
    .filter((file) =>
      /\.from\("operator_intelligence_|read_operator_intelligence_eligible_claim_page/.test(
        fs.readFileSync(file, "utf8")
      )
    )
    .map((file) => path.relative(process.cwd(), file).replaceAll("\\", "/"));

  assert.deepEqual(intelligenceTableReads, [
    "lib/oracle/repositories/operator-intelligence-repository.ts",
  ]);
}

function createCandidateInput(
  candidateOperatorId: string,
  evidence: ReturnType<typeof createOperatorEvidenceReference>
) {
  return {
    ...activeClaimInput,
    operatorId: candidateOperatorId,
    type: "recurring-game-strength",
    evidence: [{
      ...activeClaimInput.evidence[0],
      evidenceReferenceId: evidence.id,
    }],
    scope: evidence.scope,
    policyId,
    policyVersion,
    confidence: {
      ...activeClaimInput.confidence,
      policyId,
      policyVersion,
    },
    status: "candidate",
    epistemic: "suspected",
    explanation: null,
    eligibility: {
      ...activeClaimInput.eligibility,
      eligible: false,
      reasons: ["candidate"],
      purpose: OPERATOR_GAME_PATTERN_INTELLIGENCE_PURPOSE,
      policyId,
      policyVersion,
      assessedAt,
    },
  };
}

function createTrustFixture() {
  const policy = createOperatorDataPolicyDefinition({
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
  });
  const consent = createOperatorConsentDecision({
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
  });
  const evidence = createOperatorEvidenceReference({
    contract: {
      name: "oracle.operator-evidence-reference",
      version: 1,
    },
    id: "evidence-session-1",
    operatorId,
    sourceType: "game-integration-observation",
    sourceOwnerId: "call-of-duty",
    sourceRecordId: "game-observation-1",
    observedAt: "2026-07-21T10:00:00.000Z",
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
  });
  const disposition = createOperatorEvidenceDisposition({
    contract: {
      name: OPERATOR_EVIDENCE_DISPOSITION_CONTRACT,
      version: 1,
    },
    id: "disposition-1",
    operatorId,
    evidenceReferenceId: evidence.id,
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
  });
  const admission = admitOperatorGameSessionEvidence(
    {
      id: "admission-1",
      evidence,
      sessionId,
      sourceRecordId: evidence.sourceRecordId,
      integrationId: "call-of-duty",
      integrationVersion: "1.0.0",
      purpose: OPERATOR_GAME_PATTERN_INTELLIGENCE_PURPOSE,
      intendedClaimType: "recurring-game-strength",
      sourceClassification: "game-integration-direct-observation",
      admittedAt: assessedAt,
    },
    {
      authenticatedOperatorId: operatorId,
      policy,
      consentHistory: [consent],
      evidenceDispositionHistory: [disposition],
      gameIntegrations: {
        recognizes(integrationId, integrationVersion) {
          return integrationId === "call-of-duty" &&
            integrationVersion === "1.0.0";
        },
      },
    }
  );

  return { policy, consent, evidence, disposition, admission };
}

class RecordingSupabaseClient {
  readPageData: unknown = null;
  readonly calls: Array<{
    functionName: string;
    arguments: Record<string, unknown>;
  }> = [];

  async rpc(functionName: string, args: Record<string, unknown>) {
    this.calls.push({ functionName, arguments: args });

    if (functionName === "register_operator_data_policy_version") {
      return { data: args.p_policy, error: null };
    }

    if (functionName === "append_operator_consent_decision") {
      return { data: args.p_consent, error: null };
    }

    if (functionName === "admit_operator_game_session_evidence") {
      return { data: args.p_admission, error: null };
    }

    if (functionName === "append_operator_evidence_disposition") {
      return { data: args.p_disposition, error: null };
    }

    if (functionName === "persist_operator_intelligence_claim_revision") {
      return { data: args.p_claim_revision, error: null };
    }

    if (functionName === "read_operator_intelligence_eligible_claim_page") {
      return { data: this.readPageData, error: null };
    }

    return { data: args.p_eligibility, error: null };
  }
}

function collectTypeScriptFiles(directory: string): string[] {
  return fs.readdirSync(directory, { withFileTypes: true }).flatMap((entry) => {
    const entryPath = path.join(directory, entry.name);

    if (entry.isDirectory()) {
      return collectTypeScriptFiles(entryPath);
    }

    return /\.tsx?$/.test(entry.name) ? [entryPath] : [];
  });
}

void main().catch((error: unknown) => {
  console.error(error);
  process.exitCode = 1;
});
