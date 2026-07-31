import assert from "node:assert/strict";
import crypto from "node:crypto";
import fs from "node:fs";
import path from "node:path";
import { spawn } from "node:child_process";

const psql = process.env.SPRINT19_PSQL;
const databaseUrl = process.env.SPRINT19_DATABASE_URL;
const dockerExecutable = process.env.ORACLE_DOCKER_EXE;
const dockerContainer = process.env.ORACLE_POSTGRES_CONTAINER;
const useDockerPsql = Boolean(dockerExecutable && dockerContainer);
if ((!psql && !useDockerPsql) || !databaseUrl) {
  throw new Error(
    "SPRINT19_DATABASE_URL and either SPRINT19_PSQL or the disposable Docker psql configuration are required."
  );
}

const target = new URL(databaseUrl);
const databaseName = decodeURIComponent(target.pathname.slice(1));
if (
  !/^[a-zA-Z][a-zA-Z0-9_]*$/.test(databaseName) ||
  databaseName === "postgres"
) {
  throw new Error("Migration 012 verification requires a disposable database.");
}
const maintenance = new URL(target);
maintenance.pathname = "/postgres";

const migrationPaths = [
  "database/009_operator_intelligence_persistence.sql",
  "database/010_operator_trust_control_persistence.sql",
  "database/011_operator_account_provisioning.sql",
  "database/012_operator_identity_lifecycle.sql",
];
const migrations = Object.fromEntries(
  migrationPaths.map((path) => [path, fs.readFileSync(path, "utf8")])
);
const migration012 = migrations[migrationPaths[3]];
const evidencePath =
  process.env.ORACLE_CERTIFICATION_EVIDENCE_PATH ??
  "docs/sprints/evidence/sprint-19/generated/migration-012-certification.json";

const catalogSql = `
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
  from pg_constraint con
  join pg_class c on c.oid = con.conrelid
  join pg_namespace n on n.oid = c.relnamespace
  where n.nspname in ('public', 'auth')
  union all
  select 'index', schemaname, indexname, indexdef
  from pg_indexes where schemaname in ('public', 'auth')
  union all
  select 'function', n.nspname,
    p.proname || '(' || pg_get_function_identity_arguments(p.oid) || ')',
    pg_get_functiondef(p.oid)
  from pg_proc p join pg_namespace n on n.oid = p.pronamespace
  where n.nspname in ('public', 'auth')
  union all
  select 'policy', schemaname, tablename || '.' || policyname,
    cmd || '|' || roles::text || '|' || coalesce(qual, '') || '|' ||
      coalesce(with_check, '')
  from pg_policies where schemaname in ('public', 'auth')
)
select kind || '|' || schema_name || '|' || object_name || '|' || detail
from inventory
order by kind, schema_name, object_name, detail;
`;

async function main() {
  assert.match(migration012, /^begin;/i);
  assert.match(migration012, /commit;\s*$/i);

  const providerPgcryptoSchema = await verifySupabasePgcryptoPlacement();

  await resetDatabase();
  await applyFoundation();
  const cleanPgcryptoSchema = (await query(databaseUrl, `
    select namespace.nspname
    from pg_extension extension
    join pg_namespace namespace on namespace.oid = extension.extnamespace
    where extension.extname = 'pgcrypto';
  `)).trim();
  assert.equal(cleanPgcryptoSchema, "public");
  for (const path of migrationPaths.slice(0, -1)) {
    await execute(databaseUrl, migrations[path]);
  }

  await execute(databaseUrl, `
    insert into public.operators (
      id, callsign, designation, primary_game, combat_rating
    ) values (
      'aaaaaaaa-0000-4000-8000-000000000001',
      'Existing',
      'OR-000050',
      null,
      null
    );
    insert into auth.users (id, email) values (
      'aaaaaaaa-0000-4000-8000-000000000002',
      'existing@example.invalid'
    );
    insert into public.operator_account_bindings (account_id, operator_id)
    values (
      'aaaaaaaa-0000-4000-8000-000000000002',
      'aaaaaaaa-0000-4000-8000-000000000001'
    );
  `);

  const before = await query(databaseUrl, catalogSql);
  const preservedBefore = await preservationCounts();
  await execute(
    databaseUrl,
    migration012.replace(/commit;\s*$/i, "rollback;\n")
  );
  const after = await query(databaseUrl, catalogSql);
  const preservedAfter = await preservationCounts();
  assert.equal(after, before, "Migration 012 rollback changed the catalog");
  assert.equal(
    preservedAfter,
    preservedBefore,
    "Migration 012 rollback changed protected data"
  );

  await execute(databaseUrl, migration012);
  await verifyCatalog();
  const results = await verifyIdentityLifecycle();

  const evidence = {
    schemaVersion: 1,
    verifiedAt: new Date().toISOString(),
    postgres: (await query(databaseUrl, "show server_version;")).trim(),
    migration009Sha256: sha256(migrations[migrationPaths[0]]),
    migration010Sha256: sha256(migrations[migrationPaths[1]]),
    migration011Sha256: sha256(migrations[migrationPaths[2]]),
    migration012Sha256: sha256(migration012),
    chain: "009 -> 010 -> 011 -> 012",
    pgcryptoSchemasVerified: [
      cleanPgcryptoSchema,
      providerPgcryptoSchema,
    ].sort(),
    rollbackCatalogSha256Before: sha256(before),
    rollbackCatalogSha256After: sha256(after),
    catalogIdentical: true,
    ...results,
    deployed: false,
    activated: false,
    result: "pass",
  };

  fs.mkdirSync(path.dirname(evidencePath), {
    recursive: true,
  });
  fs.writeFileSync(
    evidencePath,
    `${JSON.stringify(evidence, null, 2)}\n`,
    "utf8"
  );
  process.stdout.write(`${JSON.stringify(evidence, null, 2)}\n`);
  process.stdout.write(
    "Migration 012 persistence, rollback, security, and concurrency verification passed.\n"
  );
}

async function verifySupabasePgcryptoPlacement() {
  await resetDatabase();
  await execute(databaseUrl, `
    create schema extensions;
    create extension pgcrypto with schema extensions;
  `);
  await applyFoundation();
  assert.equal(
    (await query(databaseUrl, `
      select namespace.nspname
      from pg_extension extension
      join pg_namespace namespace on namespace.oid = extension.extnamespace
      where extension.extname = 'pgcrypto';
    `)).trim(),
    "extensions",
    "Supabase provider fixture did not preserve pgcrypto in extensions"
  );
  for (const migrationPath of migrationPaths) {
    await execute(databaseUrl, migrations[migrationPath]);
  }
  const generatedOutput = await query(databaseUrl, `
    set request.jwt.claim.role = 'service_role';
    select public.generate_available_operator_callsign();
  `);
  const generated = generatedOutput.trim().split(/\r?\n/u).at(-1);
  assert.ok(generated);
  assert.match(generated, /^Vanguard-[0-9A-F]{6}$/u);
  return "extensions";
}
async function verifyCatalog() {
  assert.equal(
    (await query(databaseUrl, `
      select count(*) from information_schema.columns
      where table_schema = 'public'
        and table_name = 'operators'
        and column_name in (
          'display_name',
          'callsign_change_tokens',
          'callsign_token_accrual_at'
        );
    `)).trim(),
    "3"
  );
  assert.equal(
    (await query(databaseUrl, `
      select count(*) from pg_class c
      join pg_namespace n on n.oid = c.relnamespace
      where n.nspname = 'public'
        and c.relname in (
          'operator_reserved_callsigns',
          'operator_prohibited_callsign_terms',
          'operator_callsign_quarantine'
        );
    `)).trim(),
    "3"
  );
  assert.equal(
    (await query(databaseUrl, `
      select count(*) from pg_proc p
      join pg_namespace n on n.oid = p.pronamespace
      where n.nspname = 'public'
        and p.proname in (
          'assert_operator_callsign_available',
          'change_operator_callsign',
          'generate_available_operator_callsign',
          'update_operator_display_name',
          'quarantine_deleted_operator_callsign',
          'quarantine_unbound_operator_callsign'
        )
        and p.prosecdef
        and p.proconfig = array['search_path=pg_catalog'];
    `)).trim(),
    "6"
  );
  assert.equal(
    (await query(databaseUrl, `
      select count(*) from public.operator_reserved_callsigns;
    `)).trim(),
    "8"
  );
}

async function verifyIdentityLifecycle() {
  const accountAlpha = "11111111-1111-4111-8111-111111111111";
  const accountCaseRace = "22222222-2222-4222-8222-222222222222";
  const accountDelete = "33333333-3333-4333-8333-333333333333";
  const accountReleased = "44444444-4444-4444-8444-444444444444";
  const accountInvalid = "55555555-5555-4555-8555-555555555555";
  await execute(databaseUrl, `
    insert into auth.users (id, email) values
      ('${accountAlpha}', 'alpha@example.invalid'),
      ('${accountCaseRace}', 'race@example.invalid'),
      ('${accountDelete}', 'delete@example.invalid'),
      ('${accountReleased}', 'released@example.invalid'),
      ('${accountInvalid}', 'invalid@example.invalid');
  `);

  await expectFailure(
    trustedProvision(accountInvalid, command(
      "55555555-aaaa-4aaa-8aaa-555555555555",
      "Oracle"
    )),
    "reserved"
  );
  await expectFailure(
    trustedProvision(accountInvalid, command(
      "55555555-bbbb-4bbb-8bbb-555555555555",
      "fuck"
    )),
    "prohibited"
  );
  await expectFailure(
    trustedProvision(accountInvalid, command(
      "55555555-cccc-4ccc-8ccc-555555555555",
      "Оracle"
    )),
    "initial identity policy"
  );

  await query(databaseUrl, trustedProvision(
    accountAlpha,
    command("11111111-aaaa-4aaa-8aaa-111111111111", "Vanguard")
  ));
  const race = await Promise.allSettled([
    query(databaseUrl, trustedProvision(
      accountCaseRace,
      command("22222222-aaaa-4aaa-8aaa-222222222222", "Spectre")
    )),
    query(databaseUrl, trustedProvision(
      accountReleased,
      command("44444444-aaaa-4aaa-8aaa-444444444444", "sPeCtRe")
    )),
  ]);
  assert.equal(race.filter((result) => result.status === "fulfilled").length, 1);
  assert.equal(race.filter((result) => result.status === "rejected").length, 1);

  for (const [accountId, commandId, callsign] of [
    [
      accountCaseRace,
      "22222222-bbbb-4bbb-8bbb-222222222222",
      "Nomad",
    ],
    [
      accountReleased,
      "44444444-bbbb-4bbb-8bbb-444444444444",
      "Ranger",
    ],
  ]) {
    if ((await query(databaseUrl, `
      select count(*) from public.operator_account_bindings
      where account_id = '${accountId}';
    `)).trim() === "0") {
      await query(databaseUrl, trustedProvision(
        accountId,
        command(commandId, callsign)
      ));
    }
  }

  await query(databaseUrl, trustedProvision(
    accountDelete,
    command("33333333-aaaa-4aaa-8aaa-333333333333", "Sentinel")
  ));

  await expectFailure(
    `set role authenticated;
     select public.change_operator_callsign('${accountAlpha}', 'Direct');
     reset role;`,
    "permission denied"
  );
  await expectFailure(
    `set role authenticated;
     select * from public.operator_callsign_quarantine;
     reset role;`,
    "permission denied"
  );

  await query(databaseUrl, trustedSql(`
    select public.update_operator_display_name('${accountAlpha}', 'Same Name');
    select public.update_operator_display_name('${accountReleased}', 'Same Name');
  `));
  assert.equal(
    (await query(databaseUrl, `
      select count(*) from public.operators where display_name = 'Same Name';
    `)).trim(),
    "2"
  );

  let changed = parseJsonResult(await query(databaseUrl, trustedSql(`
    select public.change_operator_callsign('${accountAlpha}', 'Pathfinder');
  `)));
  assert.equal(changed.remainingTokens, 2);
  assert.equal(
    (await query(databaseUrl, `
      select count(*) from public.operator_callsign_quarantine
      where callsign_key = 'vanguard'
        and release_at > now() + interval '11 months';
    `)).trim(),
    "1"
  );

  await execute(databaseUrl, `
    update public.operators operator_record
    set callsign_token_accrual_at = now() - interval '6 months'
    from public.operator_account_bindings binding
    where binding.account_id = '${accountAlpha}'
      and binding.operator_id = operator_record.id;
  `);
  changed = parseJsonResult(await query(databaseUrl, trustedSql(`
    select public.change_operator_callsign('${accountAlpha}', 'Pathfinder Two');
  `)));
  assert.equal(changed.remainingTokens, 2);

  await query(databaseUrl, trustedSql(`
    select public.change_operator_callsign('${accountAlpha}', 'Pathfinder Three');
  `));
  changed = parseJsonResult(await query(databaseUrl, trustedSql(`
    select public.change_operator_callsign('${accountAlpha}', 'Pathfinder Four');
  `)));
  assert.equal(changed.remainingTokens, 0);
  await expectFailure(
    trustedSql(`
      select public.change_operator_callsign('${accountAlpha}', 'No Tokens');
    `),
    "No Callsign Change Tokens"
  );

  await execute(databaseUrl, `
    update public.operators operator_record
    set callsign_token_accrual_at = now() - interval '18 months'
    from public.operator_account_bindings binding
    where binding.account_id = '${accountAlpha}'
      and binding.operator_id = operator_record.id;
  `);
  changed = parseJsonResult(await query(databaseUrl, trustedSql(`
    select public.change_operator_callsign('${accountAlpha}', 'Restored');
  `)));
  assert.equal(changed.remainingTokens, 2);

  await expectFailure(
    trustedSql(`
      select public.change_operator_callsign('${accountReleased}', 'Vanguard');
    `),
    "quarantined"
  );
  await execute(databaseUrl, `
    update public.operator_callsign_quarantine
    set release_at = greatest(
      quarantined_at + interval '1 microsecond',
      now() - interval '1 second'
    )
    where callsign_key = 'vanguard';
  `);
  changed = parseJsonResult(await query(databaseUrl, trustedSql(`
    select public.change_operator_callsign('${accountReleased}', 'Vanguard');
  `)));
  assert.equal(changed.callsign, "Vanguard");

  const generated = (await query(databaseUrl, trustedSql(`
    select public.generate_available_operator_callsign();
  `))).trim().split("\n").at(-1);
  assert.match(generated, /^Vanguard-[0-9A-F]{6}$/);
  await expectFailure(
    `set role authenticated;
     select public.generate_available_operator_callsign();
     reset role;`,
    "permission denied"
  );

  await execute(databaseUrl, `
    delete from auth.users where id = '${accountDelete}';
  `);
  assert.equal(
    (await query(databaseUrl, `
      select count(*) from public.operator_callsign_quarantine
      where callsign_key = 'sentinel'
        and reason = 'account-deleted'
        and release_at > now() + interval '11 months';
    `)).trim(),
    "1"
  );
  assert.equal(
    (await query(databaseUrl, `
      select count(*) from public.operators where callsign = 'Sentinel';
    `)).trim(),
    "1",
    "Account deletion must not delete permanent Operator identity"
  );

  return {
    caseInsensitiveConcurrentWinnerCount: 1,
    reservedRejection: true,
    profanityRejection: true,
    unicodeHomoglyphRejection: true,
    displayNameNonUnique: true,
    initialTokenBalance: 3,
    tokenConsumption: true,
    sixMonthRestoration: true,
    maximumTokenBalance: 3,
    twelveMonthQuarantine: true,
    quarantineRelease: true,
    accountDeletionQuarantine: true,
    permanentOperatorAfterAccountDeletion: true,
    trustedRoleOnly: true,
    generatedCallsign: true,
  };
}

function command(commandId, callsign) {
  return {
    contract: {
      name: "oracle.operator-provisioning-command",
      version: 1,
    },
    commandId,
    callsign,
    policyId: "oracle.founder.callsign",
    policyVersion: "2026-07-24",
  };
}

function trustedProvision(accountId, value) {
  return trustedSql(`
    select public.provision_operator_for_account(
      '${accountId}', ${json(value)}
    );
  `);
}

function trustedSql(sql) {
  return `set request.jwt.claim.role = 'service_role'; ${sql}`;
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
      'sessions', (select count(*) from public.oracle_sessions),
      'migration009', (
        select count(*) from pg_class c
        join pg_namespace n on n.oid = c.relnamespace
        where n.nspname = 'public'
          and c.relname like 'operator_intelligence_%'
      ),
      'migration010', (
        select count(*) from pg_class c
        join pg_namespace n on n.oid = c.relnamespace
        where n.nspname = 'public'
          and c.relname like 'operator_control_%'
      ),
      'migration011', (
        select count(*) from pg_class c
        join pg_namespace n on n.oid = c.relnamespace
        where n.nspname = 'public'
          and c.relname in (
            'operator_designation_allocator',
            'operator_provisioning_receipts'
          )
      )
    );
  `);
}

async function expectFailure(sql, pattern) {
  await assert.rejects(
    query(databaseUrl, sql),
    (error) =>
      error instanceof Error &&
      error.message.toLowerCase().includes(pattern.toLowerCase())
  );
}

function json(value) {
  return `'${JSON.stringify(value).replaceAll("'", "''")}'::jsonb`;
}

function parseJsonResult(value) {
  const lines = value.trim().split("\n");
  return JSON.parse(lines.at(-1));
}

function sha256(value) {
  return crypto.createHash("sha256").update(value).digest("hex");
}

function execute(url, sql) {
  return query(url, sql).then(() => undefined);
}

function query(url, sql) {
  return new Promise((resolve, reject) => {
    const executable = useDockerPsql ? dockerExecutable : psql;
    const args = useDockerPsql
      ? [
          "exec",
          "-i",
          dockerContainer,
          "psql",
          url,
          "-X",
          "-A",
          "-t",
          "-v",
          "ON_ERROR_STOP=1",
        ]
      : [url, "-X", "-A", "-t", "-v", "ON_ERROR_STOP=1"];
    const child = spawn(executable, args, {
      windowsHide: true,
      stdio: "pipe",
    });
    let stdout = "";
    let stderr = "";
    child.stdout.setEncoding("utf8");
    child.stderr.setEncoding("utf8");
    child.stdout.on("data", (chunk) => {
      stdout += chunk;
    });
    child.stderr.on("data", (chunk) => {
      stderr += chunk;
    });
    child.on("error", reject);
    child.on("close", (code) => {
      if (code === 0) {
        resolve(stdout.replaceAll("\r\n", "\n"));
      } else {
        reject(new Error(stderr || `psql exited with ${code}`));
      }
    });
    child.stdin.end(`${sql}\n`);
  });
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
