import assert from "node:assert/strict";
import { spawn } from "node:child_process";

const psql = process.env.SPRINT18_PSQL;
const databaseUrl = process.env.SPRINT18_DATABASE_URL;
if (!psql || !databaseUrl) {
  throw new Error("SPRINT18_PSQL and SPRINT18_DATABASE_URL are required.");
}

const operatorId = "11111111-1111-4111-8111-111111111111";
const measured = await query(`
begin;
set constraints all deferred;

insert into public.operator_declarations (
  operator_id, declaration_id, current_revision_id, current_revision
)
select
  '${operatorId}'::uuid,
  'perf-declaration-' || item,
  'perf-declaration-revision-' || item,
  1
from generate_series(1, 10000) item;

insert into public.operator_declaration_revisions (
  operator_id, declaration_id, declaration_revision_id, revision,
  domain, declaration_key, status, effective_at, expires_at,
  policy_set_id, policy_set_version, supersedes_revision_id,
  deleted_at, declaration_contract
)
select
  '${operatorId}'::uuid,
  'perf-declaration-' || item,
  'perf-declaration-revision-' || item,
  1,
  'preference',
  'perf-key-' || item,
  'active',
  '2026-07-24T12:00:00Z'::timestamptz - (item || ' seconds')::interval,
  null,
  'control-policy',
  '1.0.0',
  null,
  null,
  jsonb_build_object(
    'contract', jsonb_build_object(
      'name', 'oracle.operator-declaration-revision',
      'version', 1
    ),
    'id', 'perf-declaration-revision-' || item,
    'declarationId', 'perf-declaration-' || item,
    'operatorId', '${operatorId}',
    'revision', 1,
    'domain', 'preference',
    'key', 'perf-key-' || item,
    'status', 'active',
    'epistemic', 'declared',
    'value', item,
    'confidence', null,
    'provenance', jsonb_build_object(
      'purpose', case
        when item % 10 = 0 then 'operator-control'
        else 'other-purpose-' || (item % 10)
      end
    ),
    'scope', jsonb_build_object('type', 'operator'),
    'temporalValidity', jsonb_build_object(
      'effectiveFrom',
        to_jsonb('2026-07-24T12:00:00Z'::timestamptz -
          (item || ' seconds')::interval),
      'validUntil', null
    ),
    'policyId', 'control-policy',
    'policyVersion', '1.0.0',
    'supersedesRevisionId', null
  )
from generate_series(1, 10000) item;

insert into public.operator_declaration_head_events (
  operator_id, declaration_id, declaration_revision_id, revision,
  domain, purpose, status, effective_at
)
select
  '${operatorId}'::uuid,
  'perf-declaration-' || item,
  'perf-declaration-revision-' || item,
  1,
  'preference',
  case
    when item % 10 = 0 then 'operator-control'
    else 'other-purpose-' || (item % 10)
  end,
  'active',
  '2026-07-24T12:00:00Z'::timestamptz - (item || ' seconds')::interval
from generate_series(1, 10000) item;

insert into public.operator_control_operations (
  operator_id, operation_id, command_id, command_digest, operation_type,
  scope_type, status, policy_set_id, policy_set_version, requested_at,
  eligibility_removal_required, eligibility_removed_at, completed_at,
  recovery_state, failure_code, receipt_contract
)
select
  '${operatorId}'::uuid,
  'perf-operation-' || item,
  'perf-command-' || item,
  'sha256:' || lpad(to_hex(item), 64, '0'),
  'export',
  null,
  'accepted',
  'control-policy',
  '1.0.0',
  '2026-07-24T12:00:00Z'::timestamptz - (item || ' seconds')::interval,
  false,
  null,
  null,
  'none',
  null,
  jsonb_build_object(
    'contract', jsonb_build_object(
      'name', 'oracle.operator-control-operation-receipt',
      'version', 1
    ),
    'id', 'perf-operation-' || item,
    'operatorId', '${operatorId}',
    'commandId', 'perf-command-' || item,
    'type', 'export',
    'scopeType', null,
    'status', 'accepted',
    'policySetId', 'control-policy',
    'policySetVersion', '1.0.0',
    'requestedAt', to_jsonb(
      '2026-07-24T12:00:00Z'::timestamptz -
        (item || ' seconds')::interval
    ),
    'eligibilityRemovalRequired', false,
    'eligibilityRemovedAt', null,
    'completedAt', null,
    'affectedRecordCounts', '{}'::jsonb,
    'recoveryState', 'none',
    'failureCode', null
  )
from generate_series(1, 10000) item;

analyze public.operator_declaration_head_events;
analyze public.operator_declarations;
analyze public.operator_declaration_revisions;
analyze public.operator_control_operations;

explain (analyze, buffers, format text)
select revision.declaration_contract
from public.operator_declaration_head_events head
join public.operator_declarations aggregate
  on aggregate.operator_id = head.operator_id
 and aggregate.declaration_id = head.declaration_id
 and aggregate.current_revision_id = head.declaration_revision_id
join public.operator_declaration_revisions revision
  on revision.operator_id = head.operator_id
 and revision.declaration_revision_id = head.declaration_revision_id
where head.operator_id = '${operatorId}'
  and head.purpose = 'operator-control'
  and head.domain = 'preference'
  and head.status in ('active', 'corrected')
  and head.effective_at <= '2026-07-24T12:00:00Z'
order by head.effective_at desc, head.declaration_revision_id
limit 50;

explain (analyze, buffers, format text)
select receipt_contract
from public.operator_control_operations
where operator_id = '${operatorId}'
order by requested_at desc, operation_id desc
limit 50;

rollback;
`);

assert.match(measured, /operator_declaration_head_page_idx/);
assert.match(measured, /operator_control_operation_page_idx/);
assert.doesNotMatch(measured, /Seq Scan on operator_declaration_head_events/);
assert.doesNotMatch(measured, /Seq Scan on operator_control_operations/);
assert.equal(
  (await query(`
    select count(*) from public.operator_declarations
    where declaration_id like 'perf-declaration-%';
  `)).trim(),
  "0",
  "Performance verification left declaration residue"
);
assert.equal(
  (await query(`
    select count(*) from public.operator_control_operations
    where operation_id like 'perf-operation-%';
  `)).trim(),
  "0",
  "Performance verification left operation residue"
);

process.stdout.write(JSON.stringify({
  declarationHeads: 10000,
  operations: 10000,
  pageSize: 50,
  declarationIndex: "operator_declaration_head_page_idx",
  operationIndex: "operator_control_operation_page_idx",
  rollbackResidue: 0,
  result: "pass",
}, null, 2) + "\n");
process.stdout.write("Migration 010 performance verification passed.\n");

function query(sql) {
  return new Promise((resolve, reject) => {
    const child = spawn(
      psql,
      [databaseUrl, "-X", "-A", "-t", "-q", "-v", "ON_ERROR_STOP=1"],
      { windowsHide: true, stdio: "pipe" }
    );
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
