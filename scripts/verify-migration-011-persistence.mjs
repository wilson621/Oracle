import assert from "node:assert/strict";
import crypto from "node:crypto";
import fs from "node:fs";
import { spawn } from "node:child_process";

const psql = process.env.SPRINT19_PSQL;
const databaseUrl = process.env.SPRINT19_DATABASE_URL;
if (!psql || !databaseUrl) {
  throw new Error("SPRINT19_PSQL and SPRINT19_DATABASE_URL are required.");
}

const target = new URL(databaseUrl);
const databaseName = decodeURIComponent(target.pathname.slice(1));
if (
  !/^[a-zA-Z][a-zA-Z0-9_]*$/.test(databaseName) ||
  databaseName === "postgres"
) {
  throw new Error("Migration 011 verification requires a disposable database.");
}
const maintenance = new URL(target);
maintenance.pathname = "/postgres";

const migration011 = fs.readFileSync(
  "database/011_operator_account_provisioning.sql",
  "utf8"
);
const migration011Hash = sha256(migration011);
const chains = [
  {
    name: "009 -> 011",
    files: [
      "database/009_operator_intelligence_persistence.sql",
      "database/011_operator_account_provisioning.sql",
    ],
  },
  {
    name: "009 -> 010 -> 011",
    files: [
      "database/009_operator_intelligence_persistence.sql",
      "database/010_operator_trust_control_persistence.sql",
      "database/011_operator_account_provisioning.sql",
    ],
  },
];

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
  assert.match(migration011, /^begin;/i);
  assert.match(migration011, /commit;\s*$/i);

  const results = [];
  for (const chain of chains) {
    results.push(await verifyChain(chain));
  }

  const evidence = {
    schemaVersion: 1,
    postgres: (await query(databaseUrl, "show server_version;")).trim(),
    migration009Sha256: sha256(fs.readFileSync(chains[0].files[0], "utf8")),
    migration010Sha256: sha256(
      fs.readFileSync("database/010_operator_trust_control_persistence.sql", "utf8")
    ),
    migration011Sha256: migration011Hash,
    chains: results,
    deployed: false,
    activated: false,
    result: "pass",
  };
  process.stdout.write(`${JSON.stringify(evidence, null, 2)}\n`);
  process.stdout.write(
    "Migration 011 dual-chain persistence, rollback, security, and concurrency verification passed.\n"
  );
}

async function verifyChain(chain) {
  await resetDatabase();
  await applyFoundation();
  for (const file of chain.files.slice(0, -1)) {
    await execute(databaseUrl, fs.readFileSync(file, "utf8"));
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
    migration011.replace(/commit;\s*$/i, "rollback;\n")
  );
  const after = await query(databaseUrl, catalogSql);
  const preservedAfter = await preservationCounts();
  assert.equal(after, before, `${chain.name}: catalog changed after rollback`);
  assert.equal(
    preservedAfter,
    preservedBefore,
    `${chain.name}: protected rows changed after rollback`
  );

  await execute(databaseUrl, migration011);
  await verifyCatalog(chain.name);
  await verifyProvisioning(chain.name);

  return {
    chain: chain.name,
    rollbackCatalogSha256Before: sha256(before),
    rollbackCatalogSha256After: sha256(after),
    catalogIdentical: true,
    exactReplay: true,
    immutableConflict: true,
    competingState: true,
    concurrentWinnerCount: 1,
    rollbackSafeDesignationAllocation: true,
    trustedRoleOnly: true,
    result: "pass",
  };
}

async function verifyCatalog(chainName) {
  assert.equal(
    (await query(databaseUrl, `
      select count(*) from pg_class c
      join pg_namespace n on n.oid = c.relnamespace
      where n.nspname = 'public'
        and c.relname in (
          'operator_designation_allocator',
          'operator_provisioning_receipts'
        );
    `)).trim(),
    "2",
    `${chainName}: Migration 011 relations are missing`
  );
  assert.equal(
    (await query(databaseUrl, `
      select count(*) from pg_proc p
      join pg_namespace n on n.oid = p.pronamespace
      where n.nspname = 'public'
        and p.proname = 'provision_operator_for_account'
        and p.prosecdef
        and p.proconfig = array['search_path=pg_catalog'];
    `)).trim(),
    "1",
    `${chainName}: trusted function security is invalid`
  );
}

async function verifyProvisioning(chainName) {
  const accountOne = "11111111-1111-4111-8111-111111111111";
  const accountTwo = "22222222-2222-4222-8222-222222222222";
  const accountRollback = "33333333-3333-4333-8333-333333333333";
  const accountConcurrent = "44444444-4444-4444-8444-444444444444";
  await execute(databaseUrl, `
    insert into auth.users (id, email) values
      ('${accountOne}', 'one@example.invalid'),
      ('${accountTwo}', 'two@example.invalid'),
      ('${accountRollback}', 'rollback@example.invalid'),
      ('${accountConcurrent}', 'concurrent@example.invalid');
  `);

  const commandOne = command(
    "11111111-aaaa-4aaa-8aaa-111111111111",
    "Vanguard"
  );
  await expectFailure(
    databaseUrl,
    `select public.provision_operator_for_account(
      '${accountOne}', ${json(commandOne)}
    );`,
    "Trusted Operator provisioning authority is required"
  );

  const created = parseJsonResult(await query(databaseUrl, trustedCall(
    accountOne,
    commandOne
  )));
  assert.equal(created.outcome, "created");
  assert.equal(created.operator.callsign, "Vanguard");
  assert.match(created.operator.designation, /^OR-\d{6,}$/);

  const replayed = parseJsonResult(await query(databaseUrl, trustedCall(
    accountOne,
    commandOne
  )));
  assert.deepEqual(
    replayed,
    created,
    `${chainName}: exact replay did not return the original result`
  );

  await expectFailure(
    databaseUrl,
    trustedCall(accountOne, { ...commandOne, callsign: "Changed" }),
    "immutable"
  );
  await expectFailure(
    databaseUrl,
    trustedCall(
      accountOne,
      command("11111111-bbbb-4bbb-8bbb-111111111111", "Vanguard")
    ),
    "immutable"
  );
  await expectFailure(
    databaseUrl,
    trustedCall(
      "aaaaaaaa-0000-4000-8000-000000000002",
      command("11111111-cccc-4ccc-8ccc-111111111111", "Existing")
    ),
    "competing state"
  );

  await expectFailure(
    databaseUrl,
    `set role authenticated;
     insert into public.operators (callsign) values ('Direct');
     reset role;`,
    "permission denied"
  );
  await expectFailure(
    databaseUrl,
    `set role authenticated;
     select public.provision_operator_for_account(
       '${accountTwo}', ${json(command(
         "22222222-aaaa-4aaa-8aaa-222222222222",
         "Direct"
       ))}
     );
     reset role;`,
    "permission denied"
  );

  const allocatorBefore = Number((await query(
    databaseUrl,
    "select next_value from public.operator_designation_allocator;"
  )).trim());
  await execute(databaseUrl, `
    begin;
    set local request.jwt.claim.role = 'service_role';
    select public.provision_operator_for_account(
      '${accountRollback}',
      ${json(command(
        "33333333-aaaa-4aaa-8aaa-333333333333",
        "Rollback"
      ))}
    );
    rollback;
  `);
  const allocatorAfter = Number((await query(
    databaseUrl,
    "select next_value from public.operator_designation_allocator;"
  )).trim());
  assert.equal(
    allocatorAfter,
    allocatorBefore,
    `${chainName}: designation allocation survived rollback`
  );
  assert.equal(
    (await query(databaseUrl, `
      select count(*) from public.operator_account_bindings
      where account_id = '${accountRollback}';
    `)).trim(),
    "0"
  );

  const concurrentCommands = [
    command("44444444-aaaa-4aaa-8aaa-444444444444", "Concurrent-A"),
    command("44444444-bbbb-4bbb-8bbb-444444444444", "Concurrent-B"),
  ];
  const concurrency = await Promise.allSettled(
    concurrentCommands.map((value) =>
      query(databaseUrl, trustedCall(accountConcurrent, value))
    )
  );
  assert.equal(
    concurrency.filter((result) => result.status === "fulfilled").length,
    1,
    `${chainName}: concurrent provisioning did not produce one winner`
  );
  assert.equal(
    concurrency.filter(
      (result) =>
        result.status === "rejected" &&
        result.reason instanceof Error &&
        /immutable/i.test(result.reason.message)
    ).length,
    1,
    `${chainName}: concurrent loser was not rejected immutably`
  );

  assert.equal(
    (await query(databaseUrl, `
      select json_build_object(
        'operators', count(distinct operator_record.id),
        'bindings', count(distinct binding.account_id),
        'receipts', count(distinct receipt.account_id)
      )
      from public.operator_account_bindings binding
      join public.operators operator_record
        on operator_record.id = binding.operator_id
      join public.operator_provisioning_receipts receipt
        on receipt.account_id = binding.account_id
       and receipt.operator_id = binding.operator_id
      where binding.account_id in ('${accountOne}', '${accountConcurrent}');
    `)).trim(),
    '{"operators" : 2, "bindings" : 2, "receipts" : 2}'
  );
}

function command(commandId, callsign) {
  return {
    contract: {
      name: "oracle.operator-provisioning-command",
      version: 1,
    },
    commandId,
    callsign,
    policyId: "founder-policy",
    policyVersion: "1.0.0",
  };
}

function trustedCall(accountId, value) {
  return `
    set request.jwt.claim.role = 'service_role';
    select public.provision_operator_for_account(
      '${accountId}', ${json(value)}
    );
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
      'sessions', (select count(*) from public.oracle_sessions),
      'migration009', (
        select count(*) from pg_class c
        join pg_namespace n on n.oid = c.relnamespace
        where n.nspname = 'public'
          and c.relname like 'operator_intelligence_%'
      )
    );
  `);
}

async function expectFailure(url, sql, pattern) {
  await assert.rejects(
    query(url, sql),
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
    const child = spawn(
      psql,
      [url, "-X", "-A", "-t", "-v", "ON_ERROR_STOP=1"],
      { windowsHide: true, stdio: "pipe" }
    );
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
