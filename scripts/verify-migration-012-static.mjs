import assert from "node:assert/strict";
import crypto from "node:crypto";
import fs from "node:fs";

const migrations = Object.fromEntries(
  [9, 10, 11, 12].map((number) => {
    const filename = fs.readdirSync("database").find(
      (entry) => entry.startsWith(`${String(number).padStart(3, "0")}_`)
    );
    assert.ok(filename, `Migration ${number} is missing`);
    return [
      number,
      fs.readFileSync(`database/${filename}`, "utf8"),
    ];
  })
);

assert.equal(
  sha256(migrations[9]),
  "fecbba028df14f581be05d36e7f2eb329f27f8cfe90c8638a6d94d17e00a652f",
  "Migration 009 changed"
);
assert.equal(
  sha256(migrations[10]),
  "7c46a1c9a3a0ff7e8f5c2348a3179c98934ad34ec9e66a2c2632830b65c7d715",
  "Migration 010 changed"
);
assert.equal(
  sha256(migrations[11]),
  "dff827ce532a062fdc3aa93df08eba4628e004b46e9233005325f443e8429928",
  "Migration 011 changed"
);

const migration = migrations[12];
assert.match(migration, /^begin;\s/i);
assert.match(migration, /commit;\s*$/i);
assert.match(migration, /add column display_name text/i);
assert.match(migration, /callsign_change_tokens smallint not null default 3/i);
assert.match(migration, /callsign_token_accrual_at timestamptz/i);
assert.match(migration, /unique index operators_callsign_case_insensitive_unique_idx/i);
assert.match(migration, /operator_reserved_callsigns/i);
assert.match(migration, /operator_prohibited_callsign_terms/i);
assert.match(migration, /operator_callsign_quarantine/i);
assert.match(migration, /interval '6 months'/i);
assert.match(migration, /interval '12 months'/i);
assert.match(migration, /change_operator_callsign/i);
assert.match(migration, /generate_available_operator_callsign/i);
assert.match(
  migration,
  /from pg_catalog\.pg_extension extension\s+join pg_catalog\.pg_namespace namespace/i
);
assert.match(migration, /where extension\.extname = 'pgcrypto'/i);
assert.match(
  migration,
  /execute format\(\s*'select %I\.gen_random_bytes\(\$1\)',\s*pgcrypto_schema\s*\)/i
);
assert.match(migration, /using 4/i);
assert.match(migration, /Required pgcrypto extension is unavailable/i);
assert.doesNotMatch(
  migration,
  /(?:public|extensions)\.gen_random_bytes\s*\(/i
);
assert.match(migration, /update_operator_display_name/i);
assert.match(
  migration,
  /operator_account_binding_deleted_callsign_quarantine_trigger/i
);
assert.match(migration, /security definer\s+set search_path = pg_catalog/gi);
assert.match(migration, /coalesce\(auth\.role\(\), ''\) <> 'service_role'/i);
assert.match(migration, /from public, anon, authenticated/gi);

for (const reserved of [
  "oracle",
  "admin",
  "administrator",
  "system",
  "support",
  "moderator",
  "developer",
  "founder",
]) {
  assert.match(migration, new RegExp(`\\('${reserved}'`, "i"));
}

assert.doesNotMatch(
  migration,
  /operator_intelligence_|operator_control_policy_sets|operator_declarations/i,
  "Migration 012 must not activate or couple to deferred runtime persistence"
);

process.stdout.write(
  `${JSON.stringify({
    migration009Sha256: sha256(migrations[9]),
    migration010Sha256: sha256(migrations[10]),
    migration011Sha256: sha256(migrations[11]),
    migration012Sha256: sha256(migration),
    reservedCallsigns: 8,
    callsignChangeTokens: 3,
    tokenRestorationMonths: 6,
    quarantineMonths: 12,
    result: "pass",
  }, null, 2)}\n`
);
process.stdout.write("Migration 012 static verification passed.\n");

function sha256(value) {
  return crypto.createHash("sha256").update(value).digest("hex");
}
