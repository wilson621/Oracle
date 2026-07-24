import assert from "node:assert/strict";
import fs from "node:fs";
import { spawn } from "node:child_process";

const dockerExecutable = process.env.ORACLE_DOCKER_EXE;
const dockerContainer = process.env.ORACLE_POSTGRES_CONTAINER;
const databaseUrl = process.env.SPRINT24_DATABASE_URL;
if (!dockerExecutable || !dockerContainer || !databaseUrl) {
  throw new Error(
    "ORACLE_DOCKER_EXE, ORACLE_POSTGRES_CONTAINER and SPRINT24_DATABASE_URL are required."
  );
}
const migration = fs.readFileSync(
  "database/014_operator_development_lifecycle.sql",
  "utf8"
);

async function main() {
  assert.equal(
    await scalar("select to_regclass('public.oracle_sessions') is not null;"),
    "t"
  );
  await execute(migration.replace(/commit;\s*$/iu, "rollback;\n"));
  assert.equal(
    await scalar("select to_regclass('public.oracle_missions') is null;"),
    "t"
  );
  await execute(migration);
  assert.equal(
    await scalar("select count(*) from pg_tables where schemaname='public' and tablename in ('oracle_missions','oracle_planner_entries','operator_progression_transactions','operator_achievement_awards','oracle_development_correlations');"),
    "5"
  );
  assert.equal(
    await scalar("select count(*) from pg_policies where schemaname='public' and tablename in ('oracle_missions','oracle_planner_entries','operator_progression_transactions','operator_achievement_awards','oracle_development_correlations');"),
    "5"
  );
  assert.equal(
    await scalar("select has_table_privilege('authenticated','public.operator_progression_transactions','insert');"),
    "f"
  );
  assert.equal(
    await scalar("select has_table_privilege('authenticated','public.operator_achievement_awards','insert');"),
    "f"
  );
  process.stdout.write(
    `${JSON.stringify({
      schemaVersion: 1,
      postgres: await scalar("show server_version;"),
      chain: "009 -> 010 -> 011 -> 012 -> 013 -> 014",
      rollbackVerified: true,
      relations: 5,
      rlsPolicies: 5,
      authenticatedMutation: false,
      deployed: false,
      activated: false,
      runtimePersistenceActivated: false,
      result: "pass",
    }, null, 2)}\n`
  );
  process.stdout.write("Migration 014 disposable PostgreSQL verification passed.\n");
}

async function scalar(sql) {
  return (await psql(["-At", "-c", sql])).trim();
}

async function execute(sql) {
  await psql(["-v", "ON_ERROR_STOP=1", "-f", "-"], sql);
}

function psql(args, input = "") {
  const target = new URL(databaseUrl);
  const command = [
    "exec",
    "-i",
    dockerContainer,
    "psql",
    "-U",
    decodeURIComponent(target.username),
    "-d",
    target.pathname.slice(1),
    ...args,
  ];
  return new Promise((resolve, reject) => {
    const child = spawn(dockerExecutable, command, {
      stdio: ["pipe", "pipe", "pipe"],
    });
    let stdout = "";
    let stderr = "";
    child.stdout.on("data", (chunk) => (stdout += chunk));
    child.stderr.on("data", (chunk) => (stderr += chunk));
    child.on("error", reject);
    child.on("close", (code) =>
      code === 0 ? resolve(stdout) : reject(new Error(stderr || stdout))
    );
    child.stdin.end(input);
  });
}

void main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
