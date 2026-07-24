import assert from "node:assert/strict";
import crypto from "node:crypto";
import fs from "node:fs";

const paths = [
  "database/009_operator_intelligence_persistence.sql",
  "database/010_operator_trust_control_persistence.sql",
  "database/011_operator_account_provisioning.sql",
  "database/012_operator_identity_lifecycle.sql",
  "database/013_authoritative_session_lifecycle.sql",
  "database/014_operator_development_lifecycle.sql",
];
const migrations = paths.map((path) => fs.readFileSync(path, "utf8"));
const migration = migrations.at(-1);
assert.match(migration, /^begin;/iu);
assert.match(migration, /commit;\s*$/iu);
for (const relation of [
  "oracle_missions",
  "oracle_planner_entries",
  "operator_progression_transactions",
  "operator_achievement_awards",
  "oracle_development_correlations",
]) {
  assert.match(migration, new RegExp(`create table public\\.${relation}`, "iu"));
  assert.match(migration, new RegExp(`alter table public\\.${relation} enable row level security`, "iu"));
}
assert.match(migration, /unique \(operator_id, completion_id\)/iu);
assert.match(migration, /operator_progression_evidence_check/iu);
assert.match(migration, /revoke update on public\.operators from authenticated/iu);
assert.match(migration, /revoke insert, update, delete on public\.operator_achievements/iu);
assert.doesNotMatch(
  migration,
  /create policy .* for (insert|update|delete) to authenticated/iu
);
const evidence = {
  schemaVersion: 1,
  hashes: Object.fromEntries(
    paths.map((path, index) => [
      path,
      crypto.createHash("sha256").update(migrations[index]).digest("hex"),
    ])
  ),
  missionAuthority: "mission-service",
  progressionAuthority: "progression-service",
  clientAwardsPermitted: false,
  productionExecuted: false,
  runtimePersistenceActivated: false,
  result: "pass",
};
process.stdout.write(`${JSON.stringify(evidence, null, 2)}\n`);
process.stdout.write("Migration 014 static verification passed.\n");
