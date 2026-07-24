import assert from "node:assert/strict";
import crypto from "node:crypto";
import fs from "node:fs";

const paths = [
  "database/009_operator_intelligence_persistence.sql",
  "database/010_operator_trust_control_persistence.sql",
  "database/011_operator_account_provisioning.sql",
  "database/012_operator_identity_lifecycle.sql",
  "database/013_authoritative_session_lifecycle.sql",
];
const migrations = paths.map((path) => fs.readFileSync(path, "utf8"));
const migration = migrations.at(-1);

assert.match(migration, /^begin;/iu);
assert.match(migration, /commit;\s*$/iu);
assert.match(migration, /persist_oracle_session_mutation/iu);
assert.match(migration, /security definer/iu);
assert.match(migration, /coalesce\(auth\.role\(\), ''\) <> 'service_role'/iu);
assert.match(migration, /oracle_session_evidence_minimisation_check/iu);
assert.match(migration, /oracle_session_command_minimisation_check/iu);
assert.match(migration, /oracle_sessions_select_own_authoritative/iu);
assert.match(migration, /oracle_session_evidence_select_own/iu);
assert.match(migration, /oracle_session_receipts_select_own/iu);
assert.match(migration, /grant select \([\s\S]*eligible[\s\S]*\) on table public\.oracle_sessions to authenticated/iu);
assert.doesNotMatch(
  migration,
  /grant select on table public\.oracle_session_evidence_references\s+to authenticated/iu
);
assert.match(migration, /deletion-pending/iu);
assert.doesNotMatch(migration, /create policy .* for (insert|update|delete) to authenticated/iu);

const evidence = {
  schemaVersion: 1,
  hashes: Object.fromEntries(
    paths.map((path, index) => [
      path,
      crypto.createHash("sha256").update(migrations[index]).digest("hex"),
    ])
  ),
  authoritativeOwner: "session-service",
  rawObservationRetention: false,
  productionExecuted: false,
  runtimePersistenceActivated: false,
  result: "pass",
};
process.stdout.write(`${JSON.stringify(evidence, null, 2)}\n`);
process.stdout.write("Migration 013 static verification passed.\n");
