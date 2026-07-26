import assert from "node:assert/strict";
import crypto from "node:crypto";
import fs from "node:fs";
import path from "node:path";
import { spawnSync } from "node:child_process";

const container = "oracle-sprint-30-phase-2-postgres";
const password = "oracle-sprint-30-disposable";
const database = "oracle_sprint30_phase2";
const databaseUrl = `postgresql://postgres:${password}@localhost:5432/${database}`;
const evidenceDirectory =
  "docs/sprints/evidence/sprint-30/phase-2/generated";
const chain = [
  "database/009_operator_intelligence_persistence.sql",
  "database/010_operator_trust_control_persistence.sql",
  "database/011_operator_account_provisioning.sql",
  "database/012_operator_identity_lifecycle.sql",
  "database/013_authoritative_session_lifecycle.sql",
  "database/014_operator_development_lifecycle.sql",
];

let phaseEvidence;
try {
  removeContainer();
  docker([
    "run",
    "--name",
    container,
    "-e",
    `POSTGRES_PASSWORD=${password}`,
    "-d",
    "postgres:17",
  ]);
  waitForPostgres();

  runNode("scripts/verify-migration-013-persistence.mjs", {
    ORACLE_DOCKER_EXE: "docker",
    ORACLE_POSTGRES_CONTAINER: container,
    SPRINT21_DATABASE_URL: databaseUrl,
    ORACLE_CERTIFICATION_EVIDENCE_PATH: path.join(
      evidenceDirectory,
      "session-lifecycle-postgres.json"
    ),
  });

  resetDatabase();
  applyCanonicalChain();
  seedSyntheticJourney();
  phaseEvidence = verifySyntheticJourney();
} finally {
  removeContainer();
}
assertContainerRemoved();
fs.mkdirSync(evidenceDirectory, { recursive: true });
fs.writeFileSync(
  path.join(evidenceDirectory, "postgres-critical-journey.json"),
  `${JSON.stringify(phaseEvidence, null, 2)}\n`
);
process.stdout.write(
  "Sprint 30 Phase 2 disposable PostgreSQL critical journey passed.\n"
);

function applyCanonicalChain() {
  for (const file of [
    "scripts/sprint-17/bootstrap-supabase-verification.sql",
    "database/001_initial_schema.sql",
    "database/007_operator_achievements.sql",
    "database/008_operator_ownership.sql",
    ...chain,
  ]) {
    psql(fs.readFileSync(file, "utf8"));
  }
}

function seedSyntheticJourney() {
  psql(`
    set request.jwt.claim.role = 'service_role';
    insert into auth.users (id, email) values
      ('aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa', 'alpha@example.invalid'),
      ('bbbbbbbb-bbbb-4bbb-8bbb-bbbbbbbbbbbb', 'bravo@example.invalid');
    insert into public.operators (
      id, callsign, designation, primary_game, combat_rating, display_name
    ) values
      ('11111111-1111-4111-8111-111111111111', 'Alpha', 'OR-000201', null, null, 'Alpha Operator'),
      ('22222222-2222-4222-8222-222222222222', 'Bravo', 'OR-000202', null, null, 'Bravo Operator');
    insert into public.operator_account_bindings (account_id, operator_id)
    values
      ('aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa', '11111111-1111-4111-8111-111111111111'),
      ('bbbbbbbb-bbbb-4bbb-8bbb-bbbbbbbbbbbb', '22222222-2222-4222-8222-222222222222');

    insert into public.oracle_sessions (
      id, operator_id, created_at, lifecycle_status, lifecycle_version,
      started_at, updated_at, ended_at, application_id, device_id,
      integration_id, integration_version, eligible, deletion_operation_id,
      session_contract_version, session_contract
    ) values (
      '33333333-3333-4333-8333-333333333333',
      '11111111-1111-4111-8111-111111111111',
      '2026-07-26T08:00:00Z', 'completed', 1,
      '2026-07-26T08:00:00Z', '2026-07-26T08:30:00Z',
      '2026-07-26T08:30:00Z', 'companion', 'synthetic-device',
      'call-of-duty', '1.0.0', true, null, 1,
      jsonb_build_object(
        'contract', 'oracle.session', 'contractVersion', 1,
        'id', '33333333-3333-4333-8333-333333333333',
        'operatorId', '11111111-1111-4111-8111-111111111111',
        'status', 'completed', 'version', 1,
        'startedAt', '2026-07-26T08:00:00Z',
        'updatedAt', '2026-07-26T08:30:00Z',
        'endedAt', '2026-07-26T08:30:00Z',
        'context', jsonb_build_object(
          'applicationId', 'companion', 'deviceId', 'synthetic-device',
          'integrationId', 'call-of-duty', 'integrationVersion', '1.0.0'
        ),
        'evidence', jsonb_build_array(jsonb_build_object(
          'id', '44444444-4444-4444-8444-444444444444'
        )),
        'deletionOperationId', null
      )
    );
    insert into public.oracle_session_evidence_references (
      session_id, operator_id, evidence_id, source_type, source_owner_id,
      source_record_id, purpose, policy_id, policy_version, content_digest,
      observed_at, admitted_at, evidence_contract
    ) values (
      '33333333-3333-4333-8333-333333333333',
      '11111111-1111-4111-8111-111111111111',
      '44444444-4444-4444-8444-444444444444',
      'game-integration-deterministic-transformation', 'call-of-duty',
      'synthetic-session-evidence', 'session-history', 'session-evidence',
      '1.0.0', 'sha256:${"a".repeat(64)}',
      '2026-07-26T08:20:00Z', '2026-07-26T08:20:01Z',
      jsonb_build_object(
        'id', '44444444-4444-4444-8444-444444444444',
        'sourceType', 'game-integration-deterministic-transformation',
        'sourceOwnerId', 'call-of-duty',
        'sourceRecordId', 'synthetic-session-evidence',
        'purpose', 'session-history', 'policyId', 'session-evidence',
        'policyVersion', '1.0.0',
        'contentDigest', 'sha256:${"a".repeat(64)}',
        'observedAt', '2026-07-26T08:20:00Z',
        'admittedAt', '2026-07-26T08:20:01Z'
      )
    );

    insert into public.operator_data_policy_versions (
      policy_id, policy_version, purpose, retention_class, effective_from,
      allowed_claim_types, minimum_evidence_quality,
      allowed_source_classifications, evidence_reference_days,
      superseded_claim_revision_days, maximum_claim_validity_days,
      reassess_after_days, policy_contract
    ) values (
      'qualification-understanding', '1.0.0', 'operator-coaching',
      'accepted-game-intelligence', '2026-07-01T00:00:00Z',
      array['recurring-game-strength'], 0,
      array['game-integration-deterministic-transformation'],
      30, 30, 30, 15,
      jsonb_build_object(
        'contract', jsonb_build_object(
          'name', 'oracle.operator-data-policy-definition', 'version', 1
        ),
        'id', 'qualification-understanding', 'policyVersion', '1.0.0',
        'purpose', 'operator-coaching',
        'retentionClass', 'accepted-game-intelligence',
        'effectiveFrom', '2026-07-01T00:00:00Z',
        'effectiveUntil', null,
        'allowedClaimTypes', jsonb_build_array('recurring-game-strength'),
        'evidenceAdmission', jsonb_build_object(
          'minimumQualityScore', 0,
          'allowedSourceClassifications',
          jsonb_build_array('game-integration-deterministic-transformation')
        ),
        'retention', jsonb_build_object(
          'evidenceReferenceDays', 30,
          'supersededClaimRevisionDays', 30
        ),
        'claimLifecycle', jsonb_build_object(
          'maximumValidityDays', 30, 'reassessAfterDays', 15
        )
      )
    );
    begin;
    set constraints all deferred;
    insert into public.operator_intelligence_claims (
      operator_id, claim_id, current_revision_id, current_revision
    ) values (
      '11111111-1111-4111-8111-111111111111',
      'qualification-strength', 'qualification-strength-r1', 1
    );
    insert into public.operator_intelligence_claim_revisions (
      operator_id, claim_id, claim_revision_id, revision, claim_type, status,
      epistemic, claim_revision_contract, effective_from, valid_until,
      last_assessed_at, reassess_after, reassessment_trigger, policy_id,
      policy_version, supersedes_revision_id
    ) values (
      '11111111-1111-4111-8111-111111111111',
      'qualification-strength', 'qualification-strength-r1', 1,
      'recurring-game-strength', 'candidate', 'suspected',
      jsonb_build_object(
        'contract', jsonb_build_object(
          'name', 'oracle.operator-intelligence-claim', 'version', 1
        ),
        'id', 'qualification-strength-r1',
        'claimId', 'qualification-strength',
        'operatorId', '11111111-1111-4111-8111-111111111111',
        'revision', 1, 'type', 'recurring-game-strength',
        'status', 'candidate', 'epistemic', 'suspected',
        'value', jsonb_build_object('capability', 'positioning'),
        'confidence', jsonb_build_object('score', 0.5),
        'explanation', null,
        'provenance', jsonb_build_object('sourceOwnerId', 'qualification'),
        'scope', jsonb_build_object(
          'type', 'game-integration', 'integrationId', 'call-of-duty'
        ),
        'temporalValidity', jsonb_build_object(
          'effectiveFrom', '2026-07-26T08:30:00Z',
          'validUntil', '2026-08-25T08:30:00Z',
          'lastAssessedAt', '2026-07-26T08:30:00Z',
          'reassessAfter', '2026-08-10T08:30:00Z',
          'reassessmentTrigger', 'new-session-evidence'
        ),
        'policyId', 'qualification-understanding',
        'policyVersion', '1.0.0',
        'supersedesRevisionId', null
      ),
      '2026-07-26T08:30:00Z', '2026-08-25T08:30:00Z',
      '2026-07-26T08:30:00Z', '2026-08-10T08:30:00Z',
      'new-session-evidence', 'qualification-understanding', '1.0.0', null
    );
    insert into public.operator_intelligence_claim_head_events (
      operator_id, claim_id, claim_revision_id, revision, status,
      effective_from, valid_until, scope
    ) values (
      '11111111-1111-4111-8111-111111111111',
      'qualification-strength', 'qualification-strength-r1', 1, 'candidate',
      '2026-07-26T08:30:00Z', '2026-08-25T08:30:00Z',
      '{"type":"game-integration","integrationId":"call-of-duty"}'
    );
    insert into public.operator_intelligence_eligibility_assessments (
      operator_id, claim_id, claim_revision_id, eligible, reasons, purpose,
      policy_id, policy_version, assessed_at, eligibility_contract
    ) values (
      '11111111-1111-4111-8111-111111111111',
      'qualification-strength', 'qualification-strength-r1', false,
      array['candidate'], 'operator-coaching',
      'qualification-understanding', '1.0.0', '2026-07-26T08:30:00Z',
      '{"eligible":false,"reasons":["candidate"],"purpose":"operator-coaching","policyId":"qualification-understanding","policyVersion":"1.0.0","assessedAt":"2026-07-26T08:30:00Z"}'
    );
    commit;

    insert into public.oracle_missions (
      operator_id, mission_id, report_id, coaching_focus_id, status, version,
      title, objective, required_evidence_count, reward_xp, created_at,
      updated_at, completion_id, completion_session_id,
      completion_evidence_reference_ids, mission_contract
    ) values (
      '11111111-1111-4111-8111-111111111111',
      'mission-positioning', 'report-1', 'focus-positioning', 'completed', 2,
      'Hold stronger positions', 'Complete one verified positioning session.',
      1, 100, '2026-07-26T08:31:00Z', '2026-07-26T08:32:00Z',
      'completion-positioning', '33333333-3333-4333-8333-333333333333',
      array['44444444-4444-4444-8444-444444444444'],
      '{"contract":"oracle.mission","contractVersion":1}'
    );
    insert into public.oracle_planner_entries (
      operator_id, planner_entry_id, mission_id, priority, scheduled_for,
      rationale, created_at, planner_contract
    ) values (
      '11111111-1111-4111-8111-111111111111',
      'planner-positioning', 'mission-positioning', 1,
      '2026-07-27T08:00:00Z', 'Highest verified development priority.',
      '2026-07-26T08:31:00Z',
      '{"contract":"oracle.planner-entry","contractVersion":1}'
    );
    insert into public.operator_progression_transactions (
      operator_id, transaction_id, mission_id, completion_id, xp,
      evidence_reference_ids, recorded_at, transaction_contract
    ) values (
      '11111111-1111-4111-8111-111111111111',
      'progress-positioning', 'mission-positioning',
      'completion-positioning', 100,
      array['44444444-4444-4444-8444-444444444444'],
      '2026-07-26T08:32:00Z',
      '{"contract":"oracle.progression-transaction","contractVersion":1}'
    );
    insert into public.operator_achievement_awards (
      operator_id, award_id, achievement_id, progression_transaction_id,
      awarded_at, award_contract
    ) values (
      '11111111-1111-4111-8111-111111111111',
      'award-positioning', 'verified-improvement', 'progress-positioning',
      '2026-07-26T08:32:00Z',
      '{"contract":"oracle.achievement-award","contractVersion":1}'
    );
  `);
}

function verifySyntheticJourney() {
  const alpha = "aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa";
  const bravo = "bbbbbbbb-bbbb-4bbb-8bbb-bbbbbbbbbbbb";
  const alphaExport = JSON.parse(
    scalar(authenticatedSql(alpha, `
      select json_build_object(
        'sessions', (select count(*) from public.oracle_sessions),
        'understanding', (select count(*) from public.operator_intelligence_claims),
        'missions', (select count(*) from public.oracle_missions),
        'progression', (select count(*) from public.operator_progression_transactions)
      );
    `))
  );
  assert.deepEqual(alphaExport, {
    sessions: 1,
    understanding: 1,
    missions: 1,
    progression: 1,
  });
  const bravoExport = JSON.parse(
    scalar(authenticatedSql(bravo, `
      select json_build_object(
        'sessions', (select count(*) from public.oracle_sessions),
        'understanding', (select count(*) from public.operator_intelligence_claims),
        'missions', (select count(*) from public.oracle_missions),
        'progression', (select count(*) from public.operator_progression_transactions)
      );
    `))
  );
  assert.deepEqual(bravoExport, {
    sessions: 0,
    understanding: 0,
    missions: 0,
    progression: 0,
  });
  expectFailure(
    authenticatedSql(
      alpha,
      "select count(*) from public.oracle_session_evidence_references;"
    ),
    "permission denied"
  );
  assert.equal(
    scalar(
      "set request.jwt.claim.role = 'service_role'; select count(*) from public.oracle_session_evidence_references;"
    ),
    "1"
  );
  expectFailure(
    authenticatedSql(alpha, `
      delete from public.oracle_sessions
      where id = '33333333-3333-4333-8333-333333333333';
    `),
    "permission denied"
  );
  expectFailure(
    authenticatedSql(alpha, `
      insert into public.operator_progression_transactions (
        operator_id, transaction_id, mission_id, completion_id, xp,
        evidence_reference_ids, recorded_at, transaction_contract
      ) values (
        '11111111-1111-4111-8111-111111111111', 'forged', 'mission-positioning',
        'forged', 999, array['forged'], now(), '{}'
      );
    `),
    "permission denied"
  );

  psql(`
    set request.jwt.claim.role = 'service_role';
    update public.oracle_sessions
    set lifecycle_status = 'deletion-pending',
        lifecycle_version = 2,
        updated_at = '2026-07-26T08:33:00Z',
        eligible = false,
        deletion_operation_id = '55555555-5555-4555-8555-555555555555',
        session_contract = jsonb_set(
          jsonb_set(
            jsonb_set(
              jsonb_set(session_contract, '{status}', '"deletion-pending"'),
              '{version}', '2'
            ),
            '{updatedAt}', '"2026-07-26T08:33:00Z"'
          ),
          '{deletionOperationId}', '"55555555-5555-4555-8555-555555555555"'
        )
    where id = '33333333-3333-4333-8333-333333333333';
  `);
  assert.equal(
    scalar(
      authenticatedSql(
        alpha,
        "select count(*) from public.oracle_sessions;"
      )
    ),
    "0"
  );

  return {
    schemaVersion: 1,
    verifiedAt: new Date().toISOString(),
    result: "passed",
    postgres: scalar("show server_version;"),
    chain: "009 -> 010 -> 011 -> 012 -> 013 -> 014",
    migrationHashes: Object.fromEntries(
      chain.map((file) => [file, sha256(fs.readFileSync(file))])
    ),
    syntheticAccounts: 2,
    databaseAuthenticationBoundary: "authenticated-role-and-jwt-claims-passed",
    providerPasswordTransaction:
      "unavailable-local-supabase-auth-provider-not-configured",
    crossOperatorIsolation: "passed",
    sessionLifecycle: "passed-by-authoritative-migration-013-harness",
    evidenceProjection: "passed",
    evidenceRendererBoundary: "authenticated-direct-read-denied",
    understandingProjection: "passed",
    missionProjection: "passed",
    progressionProjection: "passed",
    exportProjection: "passed",
    deletionEligibilityRemoval: "passed",
    authenticatedMutationDenied: true,
    production: "unchanged",
    deployed: false,
    runtimePersistenceActivated: false,
    containerRemovedAfterVerification: true,
  };
}

function authenticatedSql(accountId, sql) {
  return `
    set role authenticated;
    set request.jwt.claim.role = 'authenticated';
    set request.jwt.claim.sub = '${accountId}';
    ${sql}
    reset role;
  `;
}

function resetDatabase() {
  psql(
    `
      select pg_terminate_backend(pid) from pg_stat_activity
      where datname = '${database}' and pid <> pg_backend_pid();
      drop database if exists ${database};
      create database ${database};
    `,
    "postgres"
  );
}

function scalar(sql) {
  return psql(sql).trim().split(/\r?\n/u).at(-1);
}

function expectFailure(sql, text) {
  const result = dockerPsql(sql);
  assert.notEqual(result.status, 0);
  assert.match(
    `${result.stdout}${result.stderr}`.toLowerCase(),
    new RegExp(text, "iu")
  );
}

function psql(sql, targetDatabase = database) {
  const result = dockerPsql(sql, targetDatabase);
  if (result.status !== 0) {
    throw new Error(result.stderr || result.stdout);
  }
  return result.stdout.replaceAll("\r\n", "\n");
}

function dockerPsql(sql, targetDatabase = database) {
  return spawnSync(
    "docker",
    [
      "exec",
      "-i",
      container,
      "psql",
      "-U",
      "postgres",
      "-d",
      targetDatabase,
      "-X",
      "-A",
      "-t",
      "-q",
      "-v",
      "ON_ERROR_STOP=1",
    ],
    {
      input: `${sql}\n`,
      encoding: "utf8",
      windowsHide: true,
      maxBuffer: 64 * 1024 * 1024,
    }
  );
}

function waitForPostgres() {
  for (let attempt = 0; attempt < 60; attempt += 1) {
    const result = spawnSync(
      "docker",
      ["exec", container, "pg_isready", "-U", "postgres"],
      { encoding: "utf8", windowsHide: true }
    );
    if (result.status === 0) return;
    Atomics.wait(new Int32Array(new SharedArrayBuffer(4)), 0, 0, 250);
  }
  throw new Error("Disposable PostgreSQL did not become ready.");
}

function runNode(script, environment) {
  const result = spawnSync(process.execPath, [script], {
    cwd: process.cwd(),
    env: { ...process.env, ...environment },
    encoding: "utf8",
    windowsHide: true,
    maxBuffer: 64 * 1024 * 1024,
  });
  process.stdout.write(result.stdout);
  process.stderr.write(result.stderr);
  if (result.status !== 0) {
    throw new Error(`${script} exited with ${result.status}.`);
  }
}

function docker(args) {
  const result = spawnSync("docker", args, {
    encoding: "utf8",
    windowsHide: true,
    maxBuffer: 64 * 1024 * 1024,
  });
  if (result.status !== 0) {
    throw new Error(result.stderr || result.stdout);
  }
  return result.stdout.trim();
}

function removeContainer() {
  const existing = spawnSync(
    "docker",
    ["container", "inspect", container],
    { encoding: "utf8", windowsHide: true }
  );
  if (existing.status === 0) {
    docker(["rm", "-f", container]);
  }
}

function assertContainerRemoved() {
  const result = spawnSync(
    "docker",
    ["container", "inspect", container],
    { encoding: "utf8", windowsHide: true }
  );
  assert.notEqual(
    result.status,
    0,
    "Disposable PostgreSQL container must be removed after verification."
  );
}

function sha256(value) {
  return crypto.createHash("sha256").update(value).digest("hex");
}
