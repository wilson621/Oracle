import fs from "node:fs";
import path from "node:path";
import { spawn } from "node:child_process";
import { createHash } from "node:crypto";

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
const evidenceDirectory = path.join(
  root,
  "docs",
  "sprints",
  "evidence",
  "sprint-17",
  "generated"
);
const pendingEvidenceDirectory = path.join(
  root,
  ".tmp-tools",
  "sprint-17-pending-evidence"
);

async function main() {
  fs.rmSync(pendingEvidenceDirectory, { recursive: true, force: true });
  fs.mkdirSync(pendingEvidenceDirectory, { recursive: true });

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

  await runNpmScript("operator-understanding:verify");

  for (let repetition = 1; repetition <= 3; repetition += 1) {
    await resetVerificationDatabase();
    await run(
      "node",
      [
        ".tmp-operator-intelligence-persistence-verification/scripts/verify-operator-intelligence-concurrency.js",
      ],
      undefined,
      {
        SPRINT17_CONCURRENCY_REPETITION: String(repetition),
        SPRINT17_CONCURRENCY_EVIDENCE_FILE: path.join(
          pendingEvidenceDirectory,
          `concurrency-repetition-${repetition}.json`
        ),
      }
    );
  }

  await run(psql, [
    databaseUrl,
    "-X",
    "-v",
    "ON_ERROR_STOP=1",
    "-f",
    "scripts/sprint-17/load-production-shaped-fixture.sql",
  ]);
  await run(
    "node",
    ["scripts/verify-operator-intelligence-performance.mjs"],
    undefined,
    {
      SPRINT17_PERFORMANCE_EVIDENCE_FILE: path.join(
        pendingEvidenceDirectory,
        "performance-and-query-plans.json"
      ),
    }
  );
  await run(psql, [
    databaseUrl,
    "-X",
    "-v",
    "ON_ERROR_STOP=1",
    "-f",
    "scripts/sprint-17/verify-security.sql",
  ]);

  await run(
    "node",
    ["scripts/verify-migration-009-rollback.mjs"],
    undefined,
    {
      SPRINT17_ROLLBACK_EVIDENCE_FILE: path.join(
        pendingEvidenceDirectory,
        "rollback-and-catalog.json"
      ),
    }
  );

  for (const script of [
    "operator:ownership:verify",
    "operator-intelligence:persistence:verify",
    "operator-intelligence:authority:verify",
    "operator-intelligence:trust:verify",
    "guidance:verify",
    "companion:presentation:verify",
    "architecture:audit",
    "desktop:compile",
    "lint",
    "build",
  ]) {
    await runNpmScript(script);
  }

  await run("git", ["diff", "--check"]);

  const migration = fs.readFileSync(
    path.join(root, "database", "009_operator_intelligence_persistence.sql")
  );
  fs.writeFileSync(
    path.join(pendingEvidenceDirectory, "verification-manifest.json"),
    `${JSON.stringify({
      schemaVersion: 1,
      evidenceDate: new Date().toISOString(),
      postgres: "17.10",
      migrationSha256: createHash("sha256").update(migration).digest("hex"),
      concurrencyRepetitions: 3,
      suites: [
        "pagination-and-page-budgets",
        "snapshot-contract-and-budgets",
        "persistence",
        "postgresql-concurrency-three-repetitions",
        "production-shaped-performance-and-query-plans",
        "database-security",
        "migration-rollback-and-catalog",
        "operator-ownership",
        "operator-intelligence-authority",
        "operator-intelligence-trust",
        "guidance",
        "companion-presentation",
        "architecture",
        "desktop-typescript",
        "lint",
        "production-build",
        "git-diff-check",
      ],
      result: "pass",
    }, null, 2)}\n`,
    "utf8"
  );
  fs.rmSync(evidenceDirectory, { recursive: true, force: true });
  fs.renameSync(pendingEvidenceDirectory, evidenceDirectory);

  process.stdout.write(
    "All Sprint 17 scale, Snapshot, performance, concurrency, rollback, security, regression, and closure gates passed.\n"
  );
}

async function resetVerificationDatabase() {
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
}

function runNpmScript(script) {
  if (process.env.npm_execpath) {
    return run(process.execPath, [process.env.npm_execpath, "run", script]);
  }

  return run("npm", ["run", script]);
}

function run(executable, args, stdin, environment = {}) {
  return new Promise((resolve, reject) => {
    const child = spawn(executable, args, {
      cwd: root,
      env: { ...process.env, ...environment },
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
    fs.rmSync(pendingEvidenceDirectory, { recursive: true, force: true });
  });
