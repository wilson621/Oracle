import assert from "node:assert/strict";
import { spawn } from "node:child_process";
import {
  createOperatorConsentDecision,
  createOperatorEvidenceDisposition,
  createOperatorIntelligenceClaimRevision,
} from "../lib/oracle/understanding";
import {
  activeClaimInput,
} from "./operator-understanding-verification-fixtures";
import {
  assessedAt,
  createCandidateInput,
  createTrustFixture,
  operatorId,
} from "./verify-operator-intelligence-persistence";

const psql = process.env.SPRINT17_PSQL;
const databaseUrl = process.env.SPRINT17_DATABASE_URL;

if (!psql || !databaseUrl) {
  throw new Error(
    "SPRINT17_PSQL and SPRINT17_DATABASE_URL are required for real PostgreSQL verification."
  );
}

type SqlResult = Readonly<{
  code: number;
  stdout: string;
  stderr: string;
}>;

async function main() {
  const fixture = createTrustFixture();
  await seedOwnership();
  await callTrusted(
    "select public.register_operator_data_policy_version(:'policy'::jsonb);",
    { policy: fixture.policy }
  );
  await callTrusted(
    "select public.append_operator_consent_decision(:'operator_id'::uuid, :'consent'::jsonb);",
    { operator_id: operatorId, consent: fixture.consent }
  );

  const admissionSql = `select public.admit_operator_game_session_evidence(
    :'operator_id'::uuid,
    :'evidence'::jsonb,
    :'disposition'::jsonb,
    :'admission'::jsonb
  );`;
  const admissionVariables = {
    operator_id: operatorId,
    evidence: fixture.evidence,
    disposition: fixture.disposition,
    admission: fixture.admission,
  };
  assertAllSucceeded(await runConcurrent(32, admissionSql, admissionVariables));
  assert.equal(await scalar("select count(*) from public.operator_intelligence_evidence;"), 1);
  assert.equal(await scalar("select count(*) from public.operator_intelligence_evidence_dispositions;"), 1);
  assert.equal(await scalar("select count(*) from public.operator_intelligence_evidence_admissions;"), 1);

  const candidate = createOperatorIntelligenceClaimRevision(
    createCandidateInput(operatorId, fixture.evidence),
    [fixture.evidence]
  );
  const claimSql = `select public.persist_operator_intelligence_claim_revision(
    :'operator_id'::uuid,
    array[:'evidence'::jsonb],
    :'claim'::jsonb
  );`;
  assertAllSucceeded(await runConcurrent(32, claimSql, {
    operator_id: operatorId,
    evidence: fixture.evidence,
    claim: candidate,
  }));
  assert.equal(await scalar("select count(*) from public.operator_intelligence_claim_revisions;"), 1);
  assert.equal(await scalar("select count(*) from public.operator_intelligence_claim_evidence;"), 1);
  assert.equal(await scalar("select count(*) from public.operator_intelligence_eligibility_assessments;"), 1);

  const competingClaims = ["a", "b"].map((suffix) =>
    createActiveRevision(candidate, fixture.evidence, suffix)
  );
  const competingTasks = Array.from({ length: 32 }, (_, index) => ({
    sql: claimSql,
    variables: {
      operator_id: operatorId,
      evidence: fixture.evidence,
      claim: competingClaims[index % competingClaims.length],
    },
  }));
  const competingResults = await Promise.all(
    competingTasks.map((task) => callTrustedResult(task.sql, task.variables))
  );
  const winners = competingResults
    .map((result, index) => ({ result, index }))
    .filter(({ result }) => result.code === 0);
  const stale = competingResults.filter(
    (result) => result.code !== 0 && /40001/.test(result.stderr)
  );
  assert.equal(winners.length, 16);
  assert.equal(stale.length, 16);
  assert.equal(new Set(winners.map(({ index }) => index % 2)).size, 1);
  assert.equal(await scalar("select current_revision from public.operator_intelligence_claims;"), 2);
  assert.equal(await scalar("select count(*) from public.operator_intelligence_claim_revisions;"), 2);
  const winningClaim = competingClaims[winners[0].index % competingClaims.length];

  const eligibility = {
    ...winningClaim.eligibility,
    assessedAt: "2026-07-21T12:05:00.000Z",
  };
  const eligibilitySql = `select public.append_operator_intelligence_eligibility(
    :'operator_id'::uuid,
    :'claim_id',
    :'claim_revision_id',
    :'eligibility'::jsonb
  );`;
  assertAllSucceeded(await runConcurrent(32, eligibilitySql, {
    operator_id: operatorId,
    claim_id: winningClaim.claimId,
    claim_revision_id: winningClaim.id,
    eligibility,
  }));
  assert.equal(
    await scalar(
      "select count(*) from public.operator_intelligence_eligibility_assessments where assessed_at = '2026-07-21T12:05:00Z';"
    ),
    1
  );

  const rollbackEligibility = {
    ...eligibility,
    assessedAt: "2026-07-21T12:06:00.000Z",
  };
  await callTrusted(`begin; ${eligibilitySql} rollback;`, {
    operator_id: operatorId,
    claim_id: winningClaim.claimId,
    claim_revision_id: winningClaim.id,
    eligibility: rollbackEligibility,
  });
  assert.equal(
    await scalar(
      "select count(*) from public.operator_intelligence_eligibility_assessments where assessed_at = '2026-07-21T12:06:00Z';"
    ),
    0
  );

  const revokedConsent = createOperatorConsentDecision({
    ...fixture.consent,
    id: "consent-2-revoked",
    decision: "revoked",
    effectiveAt: "2026-07-21T12:10:00.000Z",
    recordedAt: "2026-07-21T12:10:00.000Z",
    supersedesDecisionId: fixture.consent.id,
    provenance: {
      ...fixture.consent.provenance,
      generatedAt: "2026-07-21T12:10:00.000Z",
    },
  });
  await verifyTrustMutationRace(
    `begin;
     select public.append_operator_consent_decision(
       :'operator_id'::uuid, :'mutation'::jsonb
     );
     select pg_sleep(0.5);
     commit;`,
    revokedConsent,
    eligibilitySql,
    {
      operator_id: operatorId,
      claim_id: winningClaim.claimId,
      claim_revision_id: winningClaim.id,
      eligibility: {
        ...eligibility,
        assessedAt: "2026-07-21T12:11:00.000Z",
      },
    }
  );

  const restoredConsent = createOperatorConsentDecision({
    ...fixture.consent,
    id: "consent-3-restored",
    effectiveAt: "2026-07-21T12:12:00.000Z",
    recordedAt: "2026-07-21T12:12:00.000Z",
    supersedesDecisionId: revokedConsent.id,
    provenance: {
      ...fixture.consent.provenance,
      generatedAt: "2026-07-21T12:12:00.000Z",
    },
  });
  await callTrusted(
    "select public.append_operator_consent_decision(:'operator_id'::uuid, :'consent'::jsonb);",
    { operator_id: operatorId, consent: restoredConsent }
  );

  const withdrawnDisposition = createOperatorEvidenceDisposition({
    ...fixture.disposition,
    id: "disposition-2-withdrawn",
    disposition: "withdrawn",
    reason: "Sprint 17 verifies disposition concurrency.",
    effectiveAt: "2026-07-21T12:13:00.000Z",
    recordedAt: "2026-07-21T12:13:00.000Z",
    supersedesDispositionId: fixture.disposition.id,
  });
  await verifyTrustMutationRace(
    `begin;
     select public.append_operator_evidence_disposition(
       :'operator_id'::uuid, :'mutation'::jsonb
     );
     select pg_sleep(0.5);
     commit;`,
    withdrawnDisposition,
    eligibilitySql,
    {
      operator_id: operatorId,
      claim_id: winningClaim.claimId,
      claim_revision_id: winningClaim.id,
      eligibility: {
        ...eligibility,
        assessedAt: "2026-07-21T12:14:00.000Z",
      },
    }
  );

  await verifyConflicts(
    admissionSql,
    admissionVariables,
    claimSql,
    candidate
  );

  process.stdout.write(
    "Operator Intelligence PostgreSQL concurrency verification passed.\n"
  );
}

async function seedOwnership() {
  await expectSuccess(await runSql(`
    insert into public.operators (id, callsign)
    values (:'operator_id'::uuid, 'Sprint 17 Verification');
    insert into auth.users (id, email)
    values ('22222222-2222-4222-8222-222222222222', 'sprint17@example.invalid');
    insert into public.operator_account_bindings (account_id, operator_id)
    values ('22222222-2222-4222-8222-222222222222', :'operator_id'::uuid);
    insert into public.oracle_sessions (id, operator_id)
    values ('aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa', :'operator_id'::uuid);
  `, { operator_id: operatorId }));
}

function createActiveRevision(
  candidate: ReturnType<typeof createOperatorIntelligenceClaimRevision>,
  evidence: ReturnType<typeof createTrustFixture>["evidence"],
  suffix: string
) {
  const id = `${candidate.claimId}-revision-2-${suffix}`;
  return createOperatorIntelligenceClaimRevision({
    ...activeClaimInput,
    id,
    claimId: candidate.claimId,
    operatorId,
    revision: 2,
    evidence: candidate.evidence.map((link) => ({
      ...link,
      claimRevisionId: id,
    })),
    scope: evidence.scope,
    policyId: candidate.policyId,
    policyVersion: candidate.policyVersion,
    supersedesRevisionId: candidate.id,
    confidence: {
      ...activeClaimInput.confidence,
      policyId: candidate.policyId,
      policyVersion: candidate.policyVersion,
    },
    explanation: {
      ...activeClaimInput.explanation,
      evidenceReferenceIds: [evidence.id],
      policyVersion: candidate.policyVersion,
    },
    eligibility: {
      ...activeClaimInput.eligibility,
      purpose: candidate.eligibility.purpose,
      policyId: candidate.policyId,
      policyVersion: candidate.policyVersion,
      assessedAt,
    },
  }, [evidence]);
}

async function verifyConflicts(
  admissionSql: string,
  admissionVariables: Record<string, unknown>,
  claimSql: string,
  candidate: ReturnType<typeof createOperatorIntelligenceClaimRevision>
) {
  const duplicateAdmission = {
    ...(admissionVariables.admission as Record<string, unknown>),
    id: "admission-alternative-id",
  };
  const duplicateResult = await callTrustedResult(admissionSql, {
    ...admissionVariables,
    admission: duplicateAdmission,
  });
  assert.match(duplicateResult.stderr, /23505/);

  const conflictingClaim = {
    ...candidate,
    value: { conflict: true },
  };
  const immutableResult = await callTrustedResult(claimSql, {
    operator_id: operatorId,
    evidence: admissionVariables.evidence,
    claim: conflictingClaim,
  });
  assert.match(immutableResult.stderr, /23505/);
  assert.equal(await scalar("select count(*) from public.operator_intelligence_claim_revisions;"), 2);
}

async function verifyTrustMutationRace(
  mutationSql: string,
  mutation: unknown,
  eligibilitySql: string,
  eligibilityVariables: Record<string, unknown>
) {
  const mutationPromise = callTrustedResult(mutationSql, {
    operator_id: operatorId,
    mutation,
  });
  await new Promise((resolve) => setTimeout(resolve, 100));
  const eligibilityResult = await callTrustedResult(
    eligibilitySql,
    eligibilityVariables
  );
  const mutationResult = await mutationPromise;

  await expectSuccess(mutationResult);
  assert.notEqual(eligibilityResult.code, 0);
  assert.match(eligibilityResult.stderr, /23514/);
}

async function runConcurrent(
  count: number,
  sql: string,
  variables: Record<string, unknown>
): Promise<readonly SqlResult[]> {
  return Promise.all(
    Array.from({ length: count }, () => callTrustedResult(sql, variables))
  );
}

async function callTrusted(sql: string, variables: Record<string, unknown>) {
  await expectSuccess(await callTrustedResult(sql, variables));
}

function callTrustedResult(sql: string, variables: Record<string, unknown>) {
  return runSql(
    `select set_config('request.jwt.claim.role', 'service_role', false); ${sql}`,
    variables
  );
}

async function scalar(sql: string): Promise<number> {
  const result = await runSql(sql, {});
  await expectSuccess(result);
  return Number(result.stdout.trim().split(/\r?\n/).at(-1));
}

function assertAllSucceeded(results: readonly SqlResult[]) {
  for (const result of results) {
    assert.equal(result.code, 0, result.stderr);
  }
}

async function expectSuccess(result: SqlResult) {
  assert.equal(result.code, 0, result.stderr);
}

function runSql(
  sql: string,
  variables: Record<string, unknown>
): Promise<SqlResult> {
  const args = [
    databaseUrl!,
    "-X",
    "-A",
    "-t",
    "-v",
    "ON_ERROR_STOP=1",
    "-v",
    "VERBOSITY=verbose",
  ];

  for (const [name, value] of Object.entries(variables)) {
    args.push("-v", `${name}=${typeof value === "string" ? value : JSON.stringify(value)}`);
  }

  return new Promise((resolve, reject) => {
    const child = spawn(psql!, args, { windowsHide: true, stdio: "pipe" });
    let stdout = "";
    let stderr = "";
    child.stdout.setEncoding("utf8");
    child.stderr.setEncoding("utf8");
    child.stdout.on("data", (chunk: string) => { stdout += chunk; });
    child.stderr.on("data", (chunk: string) => { stderr += chunk; });
    child.on("error", reject);
    child.on("close", (code) => resolve({ code: code ?? 1, stdout, stderr }));
    child.stdin.end(`${sql}\n`);
  });
}

void main().catch((error: unknown) => {
  console.error(error);
  process.exitCode = 1;
});
