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
const migration011 = fs.readFileSync(
  "database/011_operator_account_provisioning.sql",
  "utf8"
);
const migration011Sha256 =
  "5be24f86228d018dc2d5aacbf3f186c9414432c18c2b573a7a3a1e340496d505";

assert.equal(
  sha256(migration009),
  "fecbba028df14f581be05d36e7f2eb329f27f8cfe90c8638a6d94d17e00a652f",
  "Migration 009 changed"
);
assert.equal(
  sha256(migration010),
  "7c46a1c9a3a0ff7e8f5c2348a3179c98934ad34ec9e66a2c2632830b65c7d715",
  "Migration 010 changed"
);
assert.equal(
  sha256(migration011),
  migration011Sha256,
  "Certified Migration 011 changed"
);
assert.match(migration011, /^begin;\s/i);
assert.match(migration011, /commit;\s*$/i);

for (const table of [
  "operator_designation_allocator",
  "operator_provisioning_receipts",
]) {
  assert.match(
    migration011,
    new RegExp(`create table public\\.${table} \\(`),
    `Missing ${table}`
  );
  assert.match(
    migration011,
    new RegExp(`alter table public\\.${table} enable row level security;`),
    `RLS is not enabled for ${table}`
  );
  assert.match(
    migration011,
    new RegExp(`revoke all privileges on table public\\.${table}`),
    `Direct privileges are not revoked for ${table}`
  );
}

assert.equal(
  [...migration011.matchAll(/create table public\./g)].length,
  2,
  "Migration 011 must contain exactly the two required relations"
);
assert.match(
  migration011,
  /create or replace function public\.provision_operator_for_account\(\s*p_account_id uuid,\s*p_command jsonb\s*\)/i
);
assert.match(migration011, /security definer\s+set search_path = pg_catalog/i);
assert.match(
  migration011,
  /grant execute on function public\.provision_operator_for_account\(\s*uuid,\s*jsonb\s*\) to service_role/i
);
assert.match(
  migration011,
  /coalesce\(auth\.role\(\), ''\) <> 'service_role'/i
);
assert.match(
  migration011,
  /operator_account_bindings_account_operator_unique/i
);
assert.match(migration011, /request_digest ~ '\^sha256:\[0-9a-f\]\{64\}\$'/i);
assert.match(migration011, /Operator provisioning identity is immutable/i);
assert.match(migration011, /Operator provisioning encountered competing state/i);
assert.match(
  migration011,
  /revoke update on table public\.operators\s+from authenticated/i
);

for (const migration010Relation of [
  "operator_control_policy_sets",
  "operator_control_consent_decisions",
  "operator_declarations",
  "operator_declaration_revisions",
  "operator_declaration_head_events",
  "operator_control_operations",
  "operator_control_operation_steps",
  "operator_control_tombstones",
]) {
  assert.doesNotMatch(
    migration011,
    new RegExp(`public\\.${migration010Relation}\\b`),
    `Migration 011 must remain independent of ${migration010Relation}`
  );
}

assert.doesNotMatch(
  migration011,
  /create trigger|create extension|operator_intelligence_|operator_control_/i,
  "Migration 011 must not depend on trust-control runtime persistence"
);

process.stdout.write(
  `${JSON.stringify({
    migration009Sha256: sha256(migration009),
    migration010Sha256: sha256(migration010),
    migration011Sha256,
    relations: 2,
    trustedFunctions: 1,
    migration010Dependencies: 0,
    result: "pass",
  }, null, 2)}\n`
);
process.stdout.write("Migration 011 static verification passed.\n");

function sha256(value) {
  return crypto.createHash("sha256").update(value).digest("hex");
}
