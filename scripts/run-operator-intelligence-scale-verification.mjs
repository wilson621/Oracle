import fs from "node:fs";
import path from "node:path";
import { spawn } from "node:child_process";

const psql = process.env.SPRINT17_PSQL;
const databaseUrl = process.env.SPRINT17_DATABASE_URL;

if (!psql || !databaseUrl) {
  throw new Error(
    "Set SPRINT17_PSQL and SPRINT17_DATABASE_URL to an isolated PostgreSQL 17 verification database."
  );
}

const target = new URL(databaseUrl);
const databaseName = decodeURIComponent(target.pathname.slice(1));
if (!/^[a-zA-Z][a-zA-Z0-9_]*$/.test(databaseName) || databaseName === "postgres") {
  throw new Error("The verification database must be a dedicated, safely named non-postgres database.");
}
const maintenance = new URL(target);
maintenance.pathname = "/postgres";
const root = process.cwd();
const outputDirectory = path.join(
  root,
  ".tmp-operator-intelligence-persistence-verification"
);
const scaleOutputDirectory = path.join(
  root,
  ".tmp-operator-intelligence-scale-verification"
);

async function main() {
  await run(psql, [maintenance.toString(), "-X", "-v", "ON_ERROR_STOP=1"], `
    select pg_terminate_backend(pid)
    from pg_stat_activity
    where datname = '${databaseName}' and pid <> pg_backend_pid();
    drop database if exists ${databaseName};
    create database ${databaseName};
  `);

  for (const file of [
    "scripts/sprint-17/bootstrap-supabase-verification.sql",
    "database/001_initial_schema.sql",
    "database/007_operator_achievements.sql",
    "database/008_operator_ownership.sql",
    "database/009_operator_intelligence_persistence.sql",
  ]) {
    await run(psql, [databaseUrl, "-X", "-v", "ON_ERROR_STOP=1", "-f", file]);
  }

  await run(process.execPath, ["node_modules/typescript/bin/tsc", 
    "-p", "tsconfig.operator-intelligence-scale-verification.json",
  ]);
  await run("node", [
    ".tmp-operator-intelligence-scale-verification/scripts/verify-operator-intelligence-pagination.js",
  ]);

  await run(process.execPath, ["node_modules/typescript/bin/tsc",
    "-p", "tsconfig.operator-intelligence-persistence-verification.json",
  ]);
  await run("node", [
    ".tmp-operator-intelligence-persistence-verification/scripts/verify-operator-intelligence-persistence.js",
  ]);
  await run("node", [
    ".tmp-operator-intelligence-persistence-verification/scripts/verify-operator-intelligence-concurrency.js",
  ]);

  await run(psql, [
    databaseUrl,
    "-X",
    "-v",
    "ON_ERROR_STOP=1",
    "-f",
    "scripts/sprint-17/load-production-shaped-fixture.sql",
  ]);
  await run("node", ["scripts/verify-operator-intelligence-performance.mjs"]);
  await run(process.execPath, ["scripts/audit-dependency-boundaries.mjs"]);

  process.stdout.write(
    "Sprint 17 scale, budget, query-plan, idempotency, concurrency, and architecture gates passed.\n"
  );
}

function run(executable, args, stdin) {
  return new Promise((resolve, reject) => {
    const child = spawn(executable, args, {
      cwd: root,
      env: process.env,
      windowsHide: true,
      stdio: ["pipe", "inherit", "inherit"],
    });
    child.on("error", reject);
    child.on("close", (code) => {
      if (code === 0) resolve();
      else reject(new Error(`${executable} exited with ${code}`));
    });
    child.stdin.end(stdin ?? "");
  });
}

main()
  .catch((error) => {
    console.error(error);
    process.exitCode = 1;
  })
  .finally(() => {
    fs.rmSync(outputDirectory, { recursive: true, force: true });
    fs.rmSync(scaleOutputDirectory, { recursive: true, force: true });
  });
