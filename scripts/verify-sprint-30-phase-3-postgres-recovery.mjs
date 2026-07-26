import assert from "node:assert/strict";
import crypto from "node:crypto";
import fs from "node:fs";
import path from "node:path";
import { spawnSync } from "node:child_process";

const container = "oracle-sprint-30-phase-3-postgres";
const password = "oracle-sprint-30-phase-3-disposable";
const database = "oracle_sprint30_phase3";
const evidencePath =
  "docs/sprints/evidence/sprint-30/phase-3/generated/postgres-recovery.json";
const chain = [
  "database/009_operator_intelligence_persistence.sql",
  "database/010_operator_trust_control_persistence.sql",
  "database/011_operator_account_provisioning.sql",
  "database/012_operator_identity_lifecycle.sql",
  "database/013_authoritative_session_lifecycle.sql",
  "database/014_operator_development_lifecycle.sql",
];

let evidence;
try {
  removeContainer();
  docker([
    "run",
    "--name",
    container,
    "-e",
    `POSTGRES_PASSWORD=${password}`,
    "-e",
    `POSTGRES_DB=${database}`,
    "-d",
    "postgres:17",
  ]);
  waitForPostgres();
  applyCanonicalChain();
  seedSyntheticSession();

  const initial = serviceSnapshot();
  assert.deepEqual(initial, {
    operators: 1,
    bindings: 1,
    sessions: 1,
    eligibleSessions: 1,
    deletionPendingSessions: 0,
  });
  assert.equal(authenticatedSessionCount(), "1");

  const initialBackup = dumpDatabase();
  restoreDatabase(initialBackup);
  assert.deepEqual(serviceSnapshot(), initial);
  assert.equal(authenticatedSessionCount(), "1");

  markDeletionPending();
  const deletionPending = serviceSnapshot();
  assert.deepEqual(deletionPending, {
    operators: 1,
    bindings: 1,
    sessions: 1,
    eligibleSessions: 0,
    deletionPendingSessions: 1,
  });
  assert.equal(authenticatedSessionCount(), "0");

  const deletionBackup = dumpDatabase();
  restoreDatabase(deletionBackup);
  assert.deepEqual(serviceSnapshot(), deletionPending);
  assert.equal(authenticatedSessionCount(), "0");

  finalizeDeletion();
  const deleted = serviceSnapshot();
  assert.deepEqual(deleted, {
    operators: 1,
    bindings: 1,
    sessions: 0,
    eligibleSessions: 0,
    deletionPendingSessions: 0,
  });

  const finalBackup = dumpDatabase();
  restoreDatabase(finalBackup);
  assert.deepEqual(serviceSnapshot(), deleted);
  assert.equal(authenticatedSessionCount(), "0");

  evidence = {
    schemaVersion: 1,
    verifiedAt: new Date().toISOString(),
    result: "passed",
    postgres: scalar("show server_version;"),
    canonicalChain: "009 -> 010 -> 011 -> 012 -> 013 -> 014",
    migrationHashes: Object.fromEntries(
      chain.map((file) => [file, sha256(fs.readFileSync(file))])
    ),
    backupTransport: "process-memory-only",
    retainedBackupArtifact: false,
    initialBackupSha256: sha256(initialBackup),
    deletionPendingBackupSha256: sha256(deletionBackup),
    finalBackupSha256: sha256(finalBackup),
    initialRestore: "passed",
    deletionPendingRestore: "passed-remained-ineligible",
    finalDeletionRestore: "passed-no-session-residue",
    permanentOperatorIdentityPreserved: true,
    crossOperatorOrProductionDataUsed: false,
    productionEndpointUsed: false,
    productionCredentialUsed: false,
    runtimePersistenceActivated: false,
    migrationsDeployed: false,
    containerRemovedAfterVerification: true,
  };
} finally {
  removeContainer();
}

assertContainerRemoved();
fs.mkdirSync(path.dirname(evidencePath), { recursive: true });
fs.writeFileSync(evidencePath, `${JSON.stringify(evidence, null, 2)}\n`);
console.log(
  "Sprint 30 Phase 3 disposable PostgreSQL backup, restore and deletion recovery qualification passed."
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

function seedSyntheticSession() {
  psql(`
    set request.jwt.claim.role = 'service_role';
    insert into auth.users (id, email)
    values (
      'aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa',
      'phase3-recovery@example.invalid'
    );
    insert into public.operators (
      id, callsign, designation, primary_game, combat_rating, display_name
    ) values (
      '11111111-1111-4111-8111-111111111111',
      'Phase3 Recovery', 'OR-000301', null, null, 'Phase 3 Recovery'
    );
    insert into public.operator_account_bindings (account_id, operator_id)
    values (
      'aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa',
      '11111111-1111-4111-8111-111111111111'
    );
    insert into public.oracle_sessions (
      id, operator_id, created_at, lifecycle_status, lifecycle_version,
      started_at, updated_at, ended_at, application_id, device_id,
      integration_id, integration_version, eligible, deletion_operation_id,
      session_contract_version, session_contract
    ) values (
      '33333333-3333-4333-8333-333333333333',
      '11111111-1111-4111-8111-111111111111',
      '2026-07-26T09:00:00Z', 'completed', 1,
      '2026-07-26T09:00:00Z', '2026-07-26T09:30:00Z',
      '2026-07-26T09:30:00Z', 'companion', 'synthetic-device',
      'call-of-duty', '1.0.0', true, null, 1,
      jsonb_build_object(
        'contract', 'oracle.session', 'contractVersion', 1,
        'id', '33333333-3333-4333-8333-333333333333',
        'operatorId', '11111111-1111-4111-8111-111111111111',
        'status', 'completed', 'version', 1,
        'startedAt', '2026-07-26T09:00:00Z',
        'updatedAt', '2026-07-26T09:30:00Z',
        'endedAt', '2026-07-26T09:30:00Z',
        'context', jsonb_build_object(
          'applicationId', 'companion',
          'deviceId', 'synthetic-device',
          'integrationId', 'call-of-duty',
          'integrationVersion', '1.0.0'
        ),
        'evidence', jsonb_build_array(),
        'deletionOperationId', null
      )
    );
  `);
}

function markDeletionPending() {
  psql(`
    set request.jwt.claim.role = 'service_role';
    update public.oracle_sessions
    set lifecycle_status = 'deletion-pending',
        lifecycle_version = 2,
        updated_at = '2026-07-26T09:31:00Z',
        eligible = false,
        deletion_operation_id = '55555555-5555-4555-8555-555555555555',
        session_contract = jsonb_set(
          jsonb_set(
            jsonb_set(
              jsonb_set(session_contract, '{status}', '"deletion-pending"'),
              '{version}', '2'
            ),
            '{updatedAt}', '"2026-07-26T09:31:00Z"'
          ),
          '{deletionOperationId}',
          '"55555555-5555-4555-8555-555555555555"'
        )
    where id = '33333333-3333-4333-8333-333333333333';
  `);
}

function finalizeDeletion() {
  psql(`
    set request.jwt.claim.role = 'service_role';
    delete from public.oracle_sessions
    where id = '33333333-3333-4333-8333-333333333333'
      and lifecycle_status = 'deletion-pending'
      and eligible = false;
  `);
}

function serviceSnapshot() {
  return JSON.parse(
    scalar(`
      set request.jwt.claim.role = 'service_role';
      select json_build_object(
        'operators', (select count(*) from public.operators),
        'bindings', (select count(*) from public.operator_account_bindings),
        'sessions', (select count(*) from public.oracle_sessions),
        'eligibleSessions', (
          select count(*) from public.oracle_sessions where eligible
        ),
        'deletionPendingSessions', (
          select count(*) from public.oracle_sessions
          where lifecycle_status = 'deletion-pending'
        )
      );
    `)
  );
}

function authenticatedSessionCount() {
  return scalar(`
    set role authenticated;
    set request.jwt.claim.role = 'authenticated';
    set request.jwt.claim.sub = 'aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa';
    select count(*) from public.oracle_sessions;
    reset role;
  `);
}

function dumpDatabase() {
  const result = spawnSync(
    "docker",
    [
      "exec",
      container,
      "pg_dump",
      "-U",
      "postgres",
      "-d",
      database,
      "--format=custom",
      "--no-owner",
    ],
    {
      encoding: "buffer",
      windowsHide: true,
      maxBuffer: 128 * 1024 * 1024,
    }
  );
  if (result.status !== 0) {
    throw new Error(result.stderr.toString("utf8"));
  }
  return result.stdout;
}

function restoreDatabase(backup) {
  resetDatabase();
  const result = spawnSync(
    "docker",
    [
      "exec",
      "-i",
      container,
      "pg_restore",
      "-U",
      "postgres",
      "-d",
      database,
      "--no-owner",
      "--exit-on-error",
    ],
    {
      input: backup,
      encoding: "buffer",
      windowsHide: true,
      maxBuffer: 128 * 1024 * 1024,
    }
  );
  if (result.status !== 0) {
    throw new Error(result.stderr.toString("utf8"));
  }
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

function psql(sql, targetDatabase = database) {
  const result = spawnSync(
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
      maxBuffer: 128 * 1024 * 1024,
    }
  );
  if (result.status !== 0) {
    throw new Error(result.stderr || result.stdout);
  }
  return result.stdout.replaceAll("\r\n", "\n");
}

function waitForPostgres() {
  for (let attempt = 0; attempt < 120; attempt += 1) {
    const logs = spawnSync(
      "docker",
      ["logs", container],
      { encoding: "utf8", windowsHide: true }
    );
    const readyCount = (
      `${logs.stdout}${logs.stderr}`.match(
        /database system is ready to accept connections/gu
      ) ?? []
    ).length;
    const probe = spawnSync(
      "docker",
      [
        "exec",
        container,
        "psql",
        "-U",
        "postgres",
        "-d",
        database,
        "-X",
        "-A",
        "-t",
        "-q",
        "-c",
        "select 1",
      ],
      { encoding: "utf8", windowsHide: true }
    );
    if (readyCount >= 2 && probe.status === 0) return;
    Atomics.wait(new Int32Array(new SharedArrayBuffer(4)), 0, 0, 250);
  }
  throw new Error(
    "Disposable PostgreSQL did not complete its final startup."
  );
}

function docker(args) {
  const result = spawnSync("docker", args, {
    encoding: "utf8",
    windowsHide: true,
    maxBuffer: 128 * 1024 * 1024,
  });
  if (result.status !== 0) {
    throw new Error(result.stderr || result.stdout);
  }
  return result.stdout.trim();
}

function removeContainer() {
  const result = spawnSync(
    "docker",
    ["container", "inspect", container],
    { encoding: "utf8", windowsHide: true }
  );
  if (result.status === 0) {
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
    "Disposable PostgreSQL recovery container must be removed."
  );
}

function sha256(value) {
  return crypto.createHash("sha256").update(value).digest("hex");
}
