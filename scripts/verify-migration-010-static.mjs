import assert from "node:assert/strict";
import crypto from "node:crypto";
import fs from "node:fs";

const migration009 = fs.readFileSync(
  "database/009_operator_intelligence_persistence.sql",
  "utf8"
);
const migration010 = fs.readFileSync(
  "database/010_operator_trust_control_persistence.sql",
  "utf8"
);

assert.equal(
  crypto.createHash("sha256").update(migration009).digest("hex"),
  "fecbba028df14f581be05d36e7f2eb329f27f8cfe90c8638a6d94d17e00a652f",
  "Migration 009 changed"
);
assert.match(migration010, /^begin;\s/i);
assert.match(migration010, /commit;\s*$/i);

const tables = [
  "operator_control_policy_sets",
  "operator_control_consent_decisions",
  "operator_declarations",
  "operator_declaration_revisions",
  "operator_declaration_head_events",
  "operator_control_operations",
  "operator_control_operation_steps",
  "operator_control_tombstones",
];
for (const table of tables) {
  assert.match(
    migration010,
    new RegExp(`create table public\\.${table} \\(`),
    `Missing ${table}`
  );
  assert.match(
    migration010,
    new RegExp(`alter table public\\.${table} enable row level security;`),
    `RLS is not enabled for ${table}`
  );
  assert.match(
    migration010,
    new RegExp(`revoke all privileges on table public\\.${table}`),
    `Direct privileges are not revoked for ${table}`
  );
}
assert.equal(
  [...migration010.matchAll(/create table public\./g)].length,
  tables.length,
  "Migration 010 must contain exactly the approved eight relations"
);

const functions = [
  "register_operator_control_policy_set",
  "persist_operator_control_operation",
  "append_operator_control_consent_decision",
  "persist_operator_declaration_revision",
  "persist_operator_control_operation_step",
  "persist_operator_control_tombstone",
  "persist_operator_controlled_claim_revision",
  "append_operator_controlled_evidence_disposition",
  "append_operator_control_ineligibility_batch",
  "delete_operator_declaration_batch",
  "delete_operator_intelligence_batch",
  "read_operator_declaration_page",
  "read_operator_declaration_lifecycle_page",
  "read_operator_control_operation_page",
  "read_operator_control_operation_steps",
];
for (const functionName of functions) {
  assert.match(
    migration010,
    new RegExp(
      `create or replace function(?:\\s+public\\.| public\\.)${functionName}\\(`
    ),
    `Missing trusted function ${functionName}`
  );
  assert.match(
    migration010,
    new RegExp(`grant execute on function\\s+public\\.${functionName}\\(`),
    `Missing service-role grant for ${functionName}`
  );
}

assert.doesNotMatch(
  migration010,
  /alter table public\.(operator_data_policy_versions|operator_consent_decisions|operator_intelligence_)/,
  "Migration 010 must not alter a Migration 009 relation"
);
assert.doesNotMatch(
  migration010,
  /create (?:materialized )?view|create trigger|create extension/i,
  "Migration 010 must not add a parallel projection, trigger, or extension"
);
assert.doesNotMatch(
  migration010,
  /default\s+(30|90|365)\b/i,
  "Migration 010 must not introduce a governance-duration default"
);
assert.match(
  migration010,
  /admission_record <> 'null'::jsonb/,
  "Explicit absent admission authority must be preserved"
);
assert.match(
  migration010,
  /Tombstone policy is unavailable or unconfigured/,
  "Tombstone persistence must fail closed"
);

process.stdout.write(
  `${JSON.stringify({
    migration009Sha256: crypto
      .createHash("sha256")
      .update(migration009)
      .digest("hex"),
    migration010Sha256: crypto
      .createHash("sha256")
      .update(migration010)
      .digest("hex"),
    relations: tables.length,
    trustedFunctions: functions.length,
    result: "pass",
  }, null, 2)}\n`
);
process.stdout.write("Migration 010 static verification passed.\n");
