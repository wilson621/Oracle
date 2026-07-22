import assert from "node:assert/strict";
import crypto from "node:crypto";
import fs from "node:fs";
import { spawn } from "node:child_process";

const psql = process.env.SPRINT17_PSQL;
const databaseUrl = process.env.SPRINT17_DATABASE_URL;
const expectedHash = "fecbba028df14f581be05d36e7f2eb329f27f8cfe90c8638a6d94d17e00a652f";

if (!psql || !databaseUrl) {
  throw new Error("SPRINT17_PSQL and SPRINT17_DATABASE_URL are required.");
}

const target = new URL(databaseUrl);
const databaseName = decodeURIComponent(target.pathname.slice(1));
if (!/^[a-zA-Z][a-zA-Z0-9_]*$/.test(databaseName) || databaseName === "postgres") {
  throw new Error("Rollback verification requires a dedicated non-postgres database.");
}
const maintenance = new URL(target);
maintenance.pathname = "/postgres";

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
  select 'function', n.nspname, p.proname || '(' || pg_get_function_identity_arguments(p.oid) || ')',
    pg_get_functiondef(p.oid)
  from pg_proc p join pg_namespace n on n.oid = p.pronamespace
  where n.nspname in ('public', 'auth')
  union all
  select 'policy', schemaname, tablename || '.' || policyname,
    cmd || '|' || roles::text || '|' || coalesce(qual, '') || '|' || coalesce(with_check, '')
  from pg_policies where schemaname in ('public', 'auth')
  union all
  select 'table-grant', table_schema, table_name || '.' || grantee,
    privilege_type
  from information_schema.role_table_grants
  where table_schema in ('public', 'auth')
  union all
  select 'routine-grant', routine_schema, routine_name || '.' || grantee,
    privilege_type
  from information_schema.role_routine_grants
  where routine_schema in ('public', 'auth')
)
select kind || '|' || schema_name || '|' || object_name || '|' || detail
from inventory
order by kind, schema_name, object_name, detail;
`;

async function main() {
  await execute(maintenance.toString(), `
    select pg_terminate_backend(pid) from pg_stat_activity
    where datname = '${databaseName}' and pid <> pg_backend_pid();
    drop database if exists ${databaseName};
    create database ${databaseName};
  `);
  for (const file of [
    "scripts/sprint-17/bootstrap-supabase-verification.sql",
    "database/001_initial_schema.sql",
    "database/007_operator_achievements.sql",
    "database/008_operator_ownership.sql",
  ]) {
    await execute(databaseUrl, fs.readFileSync(file, "utf8"));
  }
  await execute(databaseUrl, `
    insert into public.operators (id, callsign)
    values ('55555555-5555-4555-8555-555555555555', 'Rollback Preservation');
    insert into auth.users (id, email)
    values ('66666666-6666-4666-8666-666666666666', 'rollback@example.invalid');
    insert into public.operator_account_bindings (account_id, operator_id)
    values ('66666666-6666-4666-8666-666666666666', '55555555-5555-4555-8555-555555555555');
    insert into public.oracle_sessions (id, operator_id)
    values ('77777777-7777-4777-8777-777777777777', '55555555-5555-4555-8555-555555555555');
  `);

  const before = await query(databaseUrl, catalogSql);
  const preservedBefore = await preservationCounts();
  const migration = fs.readFileSync(
    "database/009_operator_intelligence_persistence.sql",
    "utf8"
  );
  const migrationHash = crypto.createHash("sha256").update(migration).digest("hex");
  assert.equal(migrationHash, expectedHash, "Migration 009 hash changed after pinning");
  assert.match(migration, /^begin;/i);
  assert.match(migration, /commit;\s*$/i);

  // Exercise every exact migration statement while replacing only its terminal
  // transaction decision, so PostgreSQL rolls the complete artifact back.
  const rollbackRehearsal = migration.replace(/commit;\s*$/i, "rollback;\n");
  await execute(databaseUrl, rollbackRehearsal);

  // These are deliberately separate psql processes/connections.
  const after = await query(databaseUrl, catalogSql);
  const preservedAfter = await preservationCounts();
  assert.equal(after, before, "Independent catalog differs after rollback");
  assert.equal(preservedAfter, preservedBefore, "Authoritative rows changed during rollback");
  assert.equal(await query(databaseUrl, `
    select count(*) from pg_class c join pg_namespace n on n.oid = c.relnamespace
    where n.nspname = 'public' and c.relname like 'operator_intelligence_%';
  `), "0\n");

  const catalogHash = crypto.createHash("sha256").update(before).digest("hex");
  process.stdout.write(`${JSON.stringify({
    postgres: (await query(databaseUrl, "show server_version;")).trim(),
    migrationSha256: migrationHash,
    catalogSha256Before: catalogHash,
    catalogSha256After: crypto.createHash("sha256").update(after).digest("hex"),
    catalogIdentical: true,
    preservedRows: JSON.parse(preservedAfter.trim()),
  }, null, 2)}\n`);
  process.stdout.write("Migration 009 rollback and independent catalog verification passed.\n");
}

async function preservationCounts() {
  return query(databaseUrl, `
    select json_build_object(
      'operators', (select count(*) from public.operators),
      'bindings', (select count(*) from public.operator_account_bindings),
      'sessions', (select count(*) from public.oracle_sessions)
    );
  `);
}

function execute(url, sql) {
  return query(url, sql).then(() => undefined);
}

function query(url, sql) {
  return new Promise((resolve, reject) => {
    const child = spawn(psql, [url, "-X", "-A", "-t", "-v", "ON_ERROR_STOP=1"], {
      windowsHide: true,
      stdio: "pipe",
    });
    let stdout = "";
    let stderr = "";
    child.stdout.setEncoding("utf8");
    child.stderr.setEncoding("utf8");
    child.stdout.on("data", (chunk) => { stdout += chunk; });
    child.stderr.on("data", (chunk) => { stderr += chunk; });
    child.on("error", reject);
    child.on("close", (code) => {
      if (code === 0) resolve(stdout.replaceAll("\r\n", "\n"));
      else reject(new Error(stderr || `psql exited with ${code}`));
    });
    child.stdin.end(`${sql}\n`);
  });
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
