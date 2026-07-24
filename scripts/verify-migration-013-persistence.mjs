import assert from "node:assert/strict";
import crypto from "node:crypto";
import fs from "node:fs";
import { spawn } from "node:child_process";

const dockerExecutable = process.env.ORACLE_DOCKER_EXE;
const dockerContainer = process.env.ORACLE_POSTGRES_CONTAINER;
const databaseUrl = process.env.SPRINT21_DATABASE_URL;
if (!dockerExecutable || !dockerContainer || !databaseUrl) {
  throw new Error(
    "ORACLE_DOCKER_EXE, ORACLE_POSTGRES_CONTAINER and SPRINT21_DATABASE_URL are required."
  );
}
const target = new URL(databaseUrl);
const databaseName = decodeURIComponent(target.pathname.slice(1));
if (!/^[A-Za-z][A-Za-z0-9_]*$/u.test(databaseName) || databaseName === "postgres") {
  throw new Error("Migration 013 verification requires a disposable database.");
}
const maintenance = new URL(target);
maintenance.pathname = "/postgres";
const chain = [
  "database/009_operator_intelligence_persistence.sql",
  "database/010_operator_trust_control_persistence.sql",
  "database/011_operator_account_provisioning.sql",
  "database/012_operator_identity_lifecycle.sql",
  "database/013_authoritative_session_lifecycle.sql",
];
const sqlByPath = Object.fromEntries(
  chain.map((path) => [path, fs.readFileSync(path, "utf8")])
);
const migration013 = sqlByPath[chain.at(-1)];

async function main() {
  await resetDatabase();
  await applyFoundation();
  for (const path of chain.slice(0, -1)) {
    await execute(databaseUrl, sqlByPath[path]);
  }
  await seedPreservationFixture();
  const beforeCatalog = await catalog();
  const beforeCounts = await preservationCounts();
  await execute(
    databaseUrl,
    migration013.replace(/commit;\s*$/iu, "rollback;\n")
  );
  assert.equal(await catalog(), beforeCatalog);
  assert.equal(await preservationCounts(), beforeCounts);

  await execute(databaseUrl, migration013);
  await verifyCatalogAndPreservation();
  const lifecycle = await verifyLifecycle();
  const security = await verifySecurity();

  const evidence = {
    schemaVersion: 1,
    verifiedAt: new Date().toISOString(),
    postgres: (await query(databaseUrl, "show server_version;")).trim(),
    chain: "009 -> 010 -> 011 -> 012 -> 013",
    hashes: Object.fromEntries(
      chain.map((path) => [path, sha256(sqlByPath[path])])
    ),
    rollbackCatalogSha256Before: sha256(beforeCatalog),
    rollbackCatalogSha256After: sha256(await rollbackCatalogSnapshot()),
    catalogIdentical: true,
    preservation: {
      ownedLegacySessions: 1,
      unownedLegacySessions: 1,
      operators: 2,
    },
    ...lifecycle,
    ...security,
    deployed: false,
    activated: false,
    runtimePersistenceActivated: false,
    result: "pass",
  };
  fs.mkdirSync("docs/sprints/evidence/sprint-21/generated", {
    recursive: true,
  });
  fs.writeFileSync(
    "docs/sprints/evidence/sprint-21/generated/migration-013-certification.json",
    `${JSON.stringify(evidence, null, 2)}\n`,
    "utf8"
  );
  process.stdout.write(`${JSON.stringify(evidence, null, 2)}\n`);
  process.stdout.write(
    "Migration 013 persistence, rollback, concurrency and RLS verification passed.\n"
  );
}

async function seedPreservationFixture() {
  await execute(databaseUrl, `
    insert into public.operators (
      id, callsign, designation, primary_game, combat_rating
    ) values
      ('11111111-1111-4111-8111-111111111111', 'Alpha', 'OR-000101', null, null),
      ('22222222-2222-4222-8222-222222222222', 'Bravo', 'OR-000102', null, null);
    insert into auth.users (id, email) values
      ('aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa', 'alpha@example.invalid'),
      ('bbbbbbbb-bbbb-4bbb-8bbb-bbbbbbbbbbbb', 'bravo@example.invalid');
    insert into public.operator_account_bindings (account_id, operator_id)
    values
      ('aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa',
       '11111111-1111-4111-8111-111111111111'),
      ('bbbbbbbb-bbbb-4bbb-8bbb-bbbbbbbbbbbb',
       '22222222-2222-4222-8222-222222222222');
    insert into public.oracle_sessions (id, operator_id, created_at)
    values
      ('10000000-0000-4000-8000-000000000001',
       '11111111-1111-4111-8111-111111111111',
       '2026-07-01T12:00:00Z'),
      ('10000000-0000-4000-8000-000000000002',
       null,
       '2026-07-01T13:00:00Z');
  `);
}

async function verifyCatalogAndPreservation() {
  assert.equal(
    (await query(databaseUrl, `
      select count(*) from information_schema.columns
      where table_schema = 'public' and table_name = 'oracle_sessions'
        and column_name in (
          'lifecycle_status', 'lifecycle_version', 'started_at', 'updated_at',
          'ended_at', 'application_id', 'device_id', 'integration_id',
          'integration_version', 'eligible', 'deletion_operation_id',
          'session_contract'
        );
    `)).trim(),
    "12"
  );
  assert.equal(
    (await query(databaseUrl, `
      select count(*) from pg_class c join pg_namespace n on n.oid = c.relnamespace
      where n.nspname = 'public' and c.relname in (
        'oracle_session_evidence_references',
        'oracle_session_command_receipts'
      );
    `)).trim(),
    "2"
  );
  assert.equal(
    (await query(databaseUrl, `
      select count(*) from public.oracle_sessions
      where id in (
        '10000000-0000-4000-8000-000000000001',
        '10000000-0000-4000-8000-000000000002'
      ) and lifecycle_status = 'completed'
        and integration_id = 'legacy.analysis';
    `)).trim(),
    "2"
  );
  assert.equal(
    (await query(databaseUrl, `
      select count(*) from pg_policies where schemaname = 'public'
        and tablename = 'oracle_sessions' and cmd = 'INSERT'
        and 'authenticated' = any(roles);
    `)).trim(),
    "0"
  );
}

async function verifyLifecycle() {
  const operatorId = "11111111-1111-4111-8111-111111111111";
  const sessionId = "cccccccc-cccc-4ccc-8ccc-cccccccccccc";
  const begin = {
    type: "begin",
    commandId: "30000000-0000-4000-8000-000000000001",
    idempotencyKey: "begin-postgres-session",
    operatorId,
    sessionId,
    occurredAt: "2026-07-24T21:00:00.000Z",
    expectedVersion: null,
    context: context(),
  };
  const session1 = session({
    id: sessionId,
    operatorId,
    version: 1,
    status: "active",
    startedAt: begin.occurredAt,
    updatedAt: begin.occurredAt,
    endedAt: null,
    evidence: [],
  });
  const result1 = await mutate(begin, session1);
  const replay = await mutate(begin, session1);
  assert.deepEqual(replay, result1);
  await expectFailure(
    mutateSql(
      { ...begin, commandId: "30000000-0000-4000-8000-000000000099" },
      session1
    ),
    "idempotency conflict"
  );

  const evidence = {
    id: "40000000-0000-4000-8000-000000000001",
    sourceType: "game-integration-direct-observation",
    sourceOwnerId: "call-of-duty",
    sourceRecordId: "observation-1",
    purpose: "session-history",
    policyId: "session-evidence",
    policyVersion: "1.0.0",
    contentDigest: `sha256:${"a".repeat(64)}`,
    observedAt: "2026-07-24T21:01:00.000Z",
    admittedAt: "2026-07-24T21:01:01.000Z",
  };
  const admit = {
    ...baseCommand(operatorId, sessionId, 1),
    type: "admit-evidence",
    commandId: "30000000-0000-4000-8000-000000000002",
    idempotencyKey: "admit-postgres-evidence",
    occurredAt: evidence.admittedAt,
    evidence,
  };
  const session2 = session({
    ...session1,
    version: 2,
    updatedAt: evidence.admittedAt,
    evidence: [evidence],
  });
  await mutate(admit, session2);
  assert.equal(
    (await query(databaseUrl, `
      select count(*) from public.oracle_session_evidence_references
      where session_id = '${sessionId}' and operator_id = '${operatorId}';
    `)).trim(),
    "1"
  );

  const completeA = {
    ...baseCommand(operatorId, sessionId, 2),
    type: "complete",
    commandId: "30000000-0000-4000-8000-000000000003",
    idempotencyKey: "complete-postgres-a",
    occurredAt: "2026-07-24T21:02:00.000Z",
  };
  const completeB = {
    ...completeA,
    commandId: "30000000-0000-4000-8000-000000000004",
    idempotencyKey: "complete-postgres-b",
  };
  const session3 = session({
    ...session2,
    version: 3,
    status: "completed",
    updatedAt: completeA.occurredAt,
    endedAt: completeA.occurredAt,
  });
  const race = await Promise.allSettled([
    mutate(completeA, session3),
    mutate(completeB, session3),
  ]);
  assert.equal(race.filter(({ status }) => status === "fulfilled").length, 1);
  assert.equal(race.filter(({ status }) => status === "rejected").length, 1);

  const deletionId = "50000000-0000-4000-8000-000000000001";
  const deletion = {
    ...baseCommand(operatorId, sessionId, 3),
    type: "delete",
    commandId: "30000000-0000-4000-8000-000000000005",
    idempotencyKey: "delete-postgres-session",
    occurredAt: "2026-07-24T21:03:00.000Z",
    deletionOperationId: deletionId,
  };
  const session4 = session({
    ...session3,
    version: 4,
    status: "deletion-pending",
    updatedAt: deletion.occurredAt,
    deletionOperationId: deletionId,
  });
  await mutate(deletion, session4);
  assert.equal(
    (await query(databaseUrl, `
      select lifecycle_status || '|' || eligible
      from public.oracle_sessions where id = '${sessionId}';
    `)).trim(),
    "deletion-pending|false"
  );
  return {
    exactReplay: true,
    immutableIdempotencyConflict: true,
    optimisticConcurrency: true,
    concurrentWinnerCount: 1,
    evidenceMinimised: true,
    deletionEligibilityRemoved: true,
  };
}

async function verifySecurity() {
  const alpha = "aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa";
  const bravo = "bbbbbbbb-bbbb-4bbb-8bbb-bbbbbbbbbbbb";
  await expectFailure(
    `
      set role authenticated;
      set request.jwt.claim.sub = '${alpha}';
      insert into public.oracle_sessions (operator_id)
      values ('11111111-1111-4111-8111-111111111111');
      reset role;
    `,
    "permission denied"
  );
  assert.equal(
    (await query(databaseUrl, authenticatedSql(alpha, `
      select count(id) from public.oracle_sessions;
    `))).trim(),
    "1"
  );
  assert.equal(
    (await query(databaseUrl, authenticatedSql(bravo, `
      select count(id) from public.oracle_sessions;
    `))).trim(),
    "0"
  );
  await expectFailure(
    authenticatedSql(alpha, `
      select public.persist_oracle_session_mutation(
        '11111111-1111-4111-8111-111111111111',
        'sha256:${"0".repeat(64)}', '{}'::jsonb, '{}'::jsonb, '{}'::jsonb
      );
    `),
    "permission denied"
  );
  await expectFailure(
    authenticatedSql(alpha, `
      select session_contract from public.oracle_sessions;
    `),
    "permission denied"
  );
  await expectFailure(
    authenticatedSql(alpha, `
      select * from public.oracle_session_evidence_references;
    `),
    "permission denied"
  );
  return {
    trustedServiceMutationOnly: true,
    authenticatedDirectInsertDenied: true,
    crossOperatorRlsIsolation: true,
    rendererUnsafeColumnsDenied: true,
    deletedSessionIneligible: true,
  };
}

function mutate(command, currentSession) {
  return query(databaseUrl, mutateSql(command, currentSession)).then(parseJson);
}

function mutateSql(command, currentSession) {
  const receipt = {
    commandId: command.commandId,
    idempotencyKey: command.idempotencyKey,
    commandType: command.type,
    operatorId: command.operatorId,
    sessionId: command.sessionId,
    sessionVersion: currentSession.version,
    status: currentSession.status,
    recordedAt: command.occurredAt,
    replayed: false,
  };
  const digest = `sha256:${sha256(JSON.stringify(command))}`;
  return trustedSql(`
    select public.persist_oracle_session_mutation(
      '${command.operatorId}', '${digest}', ${json(command)},
      ${json(currentSession)}, ${json(receipt)}
    );
  `);
}

function baseCommand(operatorId, sessionId, expectedVersion) {
  return { operatorId, sessionId, expectedVersion };
}

function context() {
  return {
    applicationId: "companion",
    deviceId: "trusted-device-1",
    integrationId: "call-of-duty",
    integrationVersion: "1.0.0",
  };
}

function session(input) {
  return {
    contract: "oracle.session",
    contractVersion: 1,
    deletionOperationId: null,
    context: context(),
    ...input,
  };
}

function trustedSql(sql) {
  return `set request.jwt.claim.role = 'service_role'; ${sql}`;
}

function authenticatedSql(accountId, sql) {
  return `
    set role authenticated;
    set request.jwt.claim.sub = '${accountId}';
    ${sql}
    reset role;
  `;
}

async function applyFoundation() {
  for (const file of [
    "scripts/sprint-17/bootstrap-supabase-verification.sql",
    "database/001_initial_schema.sql",
    "database/007_operator_achievements.sql",
    "database/008_operator_ownership.sql",
  ]) {
    await execute(databaseUrl, fs.readFileSync(file, "utf8"));
  }
}

async function resetDatabase() {
  await execute(maintenance.toString(), `
    select pg_terminate_backend(pid) from pg_stat_activity
    where datname = '${databaseName}' and pid <> pg_backend_pid();
    drop database if exists ${databaseName};
    create database ${databaseName};
  `);
}

function preservationCounts() {
  return query(databaseUrl, `
    select json_build_object(
      'operators', (select count(*) from public.operators),
      'bindings', (select count(*) from public.operator_account_bindings),
      'sessions', (select count(*) from public.oracle_sessions)
    );
  `);
}

function catalog() {
  return query(databaseUrl, `
    with inventory as (
      select 'relation' kind, n.nspname schema_name, c.relname object_name,
        c.relkind::text detail
      from pg_class c join pg_namespace n on n.oid = c.relnamespace
      where n.nspname in ('public', 'auth')
      union all
      select 'column', table_schema, table_name || '.' || column_name,
        data_type || '|' || is_nullable || '|' || coalesce(column_default, '')
      from information_schema.columns
      where table_schema in ('public', 'auth')
      union all
      select 'constraint', n.nspname, c.relname || '.' || con.conname,
        pg_get_constraintdef(con.oid, true)
      from pg_constraint con join pg_class c on c.oid = con.conrelid
      join pg_namespace n on n.oid = c.relnamespace
      where n.nspname in ('public', 'auth')
      union all
      select 'policy', schemaname, tablename || '.' || policyname,
        cmd || '|' || roles::text || '|' || coalesce(qual, '')
      from pg_policies where schemaname in ('public', 'auth')
    )
    select kind || '|' || schema_name || '|' || object_name || '|' || detail
    from inventory order by kind, schema_name, object_name, detail;
  `);
}

async function rollbackCatalogSnapshot() {
  await resetDatabase();
  await applyFoundation();
  for (const path of chain.slice(0, -1)) await execute(databaseUrl, sqlByPath[path]);
  await seedPreservationFixture();
  const before = await catalog();
  await execute(
    databaseUrl,
    migration013.replace(/commit;\s*$/iu, "rollback;\n")
  );
  const after = await catalog();
  assert.equal(after, before);
  return after;
}

async function expectFailure(sql, pattern) {
  await assert.rejects(
    query(databaseUrl, sql),
    (error) =>
      error instanceof Error &&
      error.message.toLowerCase().includes(pattern.toLowerCase())
  );
}

function parseJson(value) {
  return JSON.parse(value.trim().split("\n").at(-1));
}

function json(value) {
  return `'${JSON.stringify(value).replaceAll("'", "''")}'::jsonb`;
}

function sha256(value) {
  return crypto.createHash("sha256").update(value).digest("hex");
}

function execute(url, sql) {
  return query(url, sql).then(() => undefined);
}

function query(url, sql) {
  return new Promise((resolve, reject) => {
    const child = spawn(
      dockerExecutable,
      [
        "exec",
        "-i",
        dockerContainer,
        "psql",
        url,
        "-X",
        "-A",
        "-t",
        "-q",
        "-v",
        "ON_ERROR_STOP=1",
      ],
      { windowsHide: true, stdio: "pipe" }
    );
    let stdout = "";
    let stderr = "";
    child.stdout.setEncoding("utf8");
    child.stderr.setEncoding("utf8");
    child.stdout.on("data", (chunk) => (stdout += chunk));
    child.stderr.on("data", (chunk) => (stderr += chunk));
    child.on("error", reject);
    child.on("close", (code) =>
      code === 0
        ? resolve(stdout.replaceAll("\r\n", "\n"))
        : reject(new Error(stderr || `psql exited with ${code}`))
    );
    child.stdin.end(`${sql}\n`);
  });
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
