import assert from "node:assert/strict";
import { spawn } from "node:child_process";

const psql = process.env.SPRINT17_PSQL;
const databaseUrl = process.env.SPRINT17_DATABASE_URL;

if (!psql || !databaseUrl) {
  throw new Error(
    "SPRINT17_PSQL and SPRINT17_DATABASE_URL are required for performance verification."
  );
}

const operatorId = "33333333-3333-4333-8333-333333333333";
const purpose = "operator-game-pattern-intelligence";
const asOf = "2026-07-22T00:00:00Z";
const sessionScope = JSON.stringify({
  type: "session",
  sessionId: "bbbbbbbb-bbbb-4bbb-8bbb-bbbbbbbbbbbb",
  integrationId: "call-of-duty",
  integrationVersion: "1.0.0",
});
const integrationScope = JSON.stringify({
  type: "game-integration",
  integrationId: "call-of-duty",
  integrationVersion: "1.0.0",
});

const latencySql = `
select set_config('request.jwt.claim.role', 'service_role', false);
create temporary table sprint17_timings (
  scenario text not null,
  sample integer not null,
  milliseconds double precision not null
);
do $benchmark$
declare
  sample_number integer;
  started_at timestamptz;
  ignored jsonb;
begin
  for sample_number in 1..35 loop
    started_at := clock_timestamp();
    select public.read_operator_intelligence_eligible_claim_page(
      '${operatorId}'::uuid, '${purpose}', '${asOf}'::timestamptz,
      '${integrationScope}'::jsonb, 50
    ) into ignored;
    if sample_number > 5 then
      insert into sprint17_timings values (
        'eligible-page', sample_number - 5,
        extract(epoch from clock_timestamp() - started_at) * 1000
      );
    end if;
  end loop;

  for sample_number in 1..35 loop
    started_at := clock_timestamp();
    select public.read_operator_intelligence_claim_lifecycle_page(
      '${operatorId}'::uuid, 'hot-claim-1', '${purpose}',
      '${asOf}'::timestamptz, '${sessionScope}'::jsonb, 50
    ) into ignored;
    if sample_number > 5 then
      insert into sprint17_timings values (
        'claim-lifecycle-page', sample_number - 5,
        extract(epoch from clock_timestamp() - started_at) * 1000
      );
    end if;
  end loop;

  for sample_number in 1..35 loop
    started_at := clock_timestamp();
    select public.read_operator_intelligence_eligibility_history_page(
      '${operatorId}'::uuid, 'hot-claim-1', 'hot-claim-1-revision-1000',
      '${purpose}', '${asOf}'::timestamptz, 50
    ) into ignored;
    if sample_number > 5 then
      insert into sprint17_timings values (
        'eligibility-history-page', sample_number - 5,
        extract(epoch from clock_timestamp() - started_at) * 1000
      );
    end if;
  end loop;

  for sample_number in 1..35 loop
    started_at := clock_timestamp();
    select public.admit_operator_game_session_evidence(
      e.operator_id, e.evidence_contract, d.disposition_contract,
      a.admission_contract
    ) into ignored
    from public.operator_intelligence_evidence e
    join public.operator_intelligence_evidence_dispositions d
      on d.operator_id = e.operator_id
     and d.evidence_reference_id = e.evidence_reference_id
    join public.operator_intelligence_evidence_admissions a
      on a.operator_id = e.operator_id
     and a.evidence_reference_id = e.evidence_reference_id
    where e.operator_id = '11111111-1111-4111-8111-111111111111'::uuid
    order by d.recorded_at, a.admitted_at
    limit 1;
    if sample_number > 5 then
      insert into sprint17_timings values (
        'evidence-admission-replay', sample_number - 5,
        extract(epoch from clock_timestamp() - started_at) * 1000
      );
    end if;
  end loop;

  for sample_number in 1..35 loop
    started_at := clock_timestamp();
    select public.persist_operator_intelligence_claim_revision(
      revision.operator_id,
      array(
        select evidence.evidence_contract
        from public.operator_intelligence_claim_evidence link
        join public.operator_intelligence_evidence evidence
          on evidence.operator_id = link.operator_id
         and evidence.evidence_reference_id = link.evidence_reference_id
        where link.operator_id = revision.operator_id
          and link.claim_revision_id = revision.claim_revision_id
        order by link.evidence_reference_id
      ),
      revision.claim_revision_contract || jsonb_build_object(
        'evidence', (
          select jsonb_agg(jsonb_build_object(
            'claimId', link.claim_id,
            'claimRevisionId', link.claim_revision_id,
            'evidenceReferenceId', link.evidence_reference_id,
            'relationship', link.relationship,
            'rationale', link.rationale,
            'linkedAt', to_char(
              link.linked_at at time zone 'UTC',
              'YYYY-MM-DD"T"HH24:MI:SS.MS"Z"'
            )
          ) order by link.evidence_reference_id)
          from public.operator_intelligence_claim_evidence link
          where link.operator_id = revision.operator_id
            and link.claim_revision_id = revision.claim_revision_id
        ),
        'eligibility', (
          select assessment.eligibility_contract
          from public.operator_intelligence_eligibility_assessments assessment
          where assessment.operator_id = revision.operator_id
            and assessment.claim_id = revision.claim_id
            and assessment.claim_revision_id = revision.claim_revision_id
          order by assessment.recorded_at
          limit 1
        )
      )
    ) into ignored
    from public.operator_intelligence_claim_revisions revision
    where revision.operator_id = '11111111-1111-4111-8111-111111111111'::uuid
    order by revision.revision
    limit 1;
    if sample_number > 5 then
      insert into sprint17_timings values (
        'claim-revision-replay', sample_number - 5,
        extract(epoch from clock_timestamp() - started_at) * 1000
      );
    end if;
  end loop;

  for sample_number in 1..35 loop
    started_at := clock_timestamp();
    select public.append_operator_intelligence_eligibility(
      assessment.operator_id, assessment.claim_id,
      assessment.claim_revision_id, assessment.eligibility_contract
    ) into ignored
    from public.operator_intelligence_eligibility_assessments assessment
    where assessment.operator_id = '11111111-1111-4111-8111-111111111111'::uuid
    order by assessment.recorded_at
    limit 1;
    if sample_number > 5 then
      insert into sprint17_timings values (
        'eligibility-replay', sample_number - 5,
        extract(epoch from clock_timestamp() - started_at) * 1000
      );
    end if;
  end loop;
end
$benchmark$;
select scenario || '|' || sample || '|' || milliseconds
from sprint17_timings
order by scenario, sample;
`;

const growingTables = new Set([
  "operator_intelligence_claim_head_events",
  "operator_intelligence_claim_revisions",
  "operator_intelligence_eligibility_assessments",
  "operator_intelligence_claim_evidence",
  "operator_intelligence_evidence",
]);

const planQueries = [
  {
    name: "eligible-head-page-scoped",
    requiredIndex: "operator_intelligence_claim_head_scope_page_idx",
    sql: `select head.claim_revision_id
      from public.operator_intelligence_claim_head_events head
      where head.operator_id = '${operatorId}'::uuid
        and head.status = 'active'
        and head.scope = '${integrationScope}'::jsonb
        and not exists (
          select 1 from public.operator_intelligence_claim_head_events later
          where later.operator_id = head.operator_id
            and later.claim_id = head.claim_id
            and later.revision > head.revision
        )
      order by head.effective_from desc, head.claim_revision_id asc
      limit 101`,
  },
  {
    name: "eligible-head-page-unscoped",
    requiredIndex: "operator_intelligence_claim_head_page_idx",
    sql: `select head.claim_revision_id
      from public.operator_intelligence_claim_head_events head
      where head.operator_id = '${operatorId}'::uuid
        and head.status = 'active'
        and not exists (
          select 1 from public.operator_intelligence_claim_head_events later
          where later.operator_id = head.operator_id
            and later.claim_id = head.claim_id
            and later.revision > head.revision
        )
      order by head.effective_from desc, head.claim_revision_id asc
      limit 101`,
  },
  {
    name: "claim-lifecycle-page",
    sql: `select revision.claim_revision_id
      from public.operator_intelligence_claim_revisions revision
      where revision.operator_id = '${operatorId}'::uuid
        and revision.claim_id = 'hot-claim-1'
        and revision.recorded_at <= '${asOf}'::timestamptz
      order by revision.revision desc, revision.claim_revision_id asc
      limit 101`,
  },
  {
    name: "eligibility-history-page",
    sql: `select assessment.assessment_id
      from public.operator_intelligence_eligibility_assessments assessment
      where assessment.operator_id = '${operatorId}'::uuid
        and assessment.claim_id = 'hot-claim-1'
        and assessment.claim_revision_id = 'hot-claim-1-revision-1000'
        and assessment.purpose = '${purpose}'
        and assessment.assessed_at <= '${asOf}'::timestamptz
      order by assessment.assessed_at desc, assessment.assessment_id asc
      limit 101`,
  },
  {
    name: "page-evidence-fan-out",
    sql: `select link.evidence_reference_id, evidence.evidence_contract
      from public.operator_intelligence_claim_evidence link
      join public.operator_intelligence_evidence evidence
        on evidence.operator_id = link.operator_id
       and evidence.evidence_reference_id = link.evidence_reference_id
      where link.operator_id = '${operatorId}'::uuid
        and link.claim_revision_id = 'hot-claim-1-revision-1000'
      order by link.evidence_reference_id
      limit 33`,
  },
];

function percentile(sorted, fraction) {
  return sorted[Math.ceil(sorted.length * fraction) - 1];
}

async function main() {
  const latencyResult = await runSql(latencySql);
  const samples = new Map();
  for (const line of latencyResult.trim().split(/\r?\n/)) {
    const match = /^([^|]+)\|(\d+)\|([\d.]+)$/.exec(line);
    if (!match) continue;
    const [, scenario, , milliseconds] = match;
    const scenarioSamples = samples.get(scenario) ?? [];
    scenarioSamples.push(Number(milliseconds));
    samples.set(scenario, scenarioSamples);
  }

  const metrics = {};
  for (const [scenario, values] of samples) {
    assert.equal(values.length, 30, `${scenario} must have 30 measured samples`);
    values.sort((left, right) => left - right);
    const write = scenario.endsWith("replay");
    const p95Limit = write ? 200 : 250;
    const p99Limit = write ? 400 : 500;
    metrics[scenario] = {
      samples: values.length,
      p50Ms: percentile(values, 0.5),
      p95Ms: percentile(values, 0.95),
      p99Ms: percentile(values, 0.99),
    };
    assert.ok(metrics[scenario].p95Ms <= p95Limit, `${scenario} p95 exceeded`);
    assert.ok(metrics[scenario].p99Ms <= p99Limit, `${scenario} p99 exceeded`);
  }
  assert.equal(metrics["eligible-page"] !== undefined, true);
  assert.equal(metrics["evidence-admission-replay"] !== undefined, true);

  const plans = {};
  for (const workload of planQueries) {
    const raw = await runSql(
      `explain (analyze, buffers, format json) ${workload.sql};`
    );
    const document = JSON.parse(raw);
    const root = document[0];
    const nodes = flattenPlan(root.Plan);
    for (const node of nodes) {
      assert.ok(
        !(node["Node Type"] === "Seq Scan" && growingTables.has(node["Relation Name"])),
        `${workload.name} sequentially scanned ${node["Relation Name"]}`
      );
      assert.notEqual(node["Sort Method"], "external merge", `${workload.name} spilled`);
      assert.notEqual(node["Sort Space Type"], "Disk", `${workload.name} spilled`);
    }
    if (workload.requiredIndex) {
      assert.ok(
        nodes.some((node) => node["Index Name"] === workload.requiredIndex),
        `${workload.name} did not use ${workload.requiredIndex}`
      );
    }
    plans[workload.name] = {
      planningMs: root["Planning Time"],
      executionMs: root["Execution Time"],
      returnedRows: root.Plan["Actual Rows"],
      sharedHitBlocks: sum(nodes, "Shared Hit Blocks"),
      sharedReadBlocks: sum(nodes, "Shared Read Blocks"),
      indexes: [...new Set(nodes.map((node) => node["Index Name"]).filter(Boolean))],
    };
  }

  const payloadRaw = await runSql(`
    select set_config('request.jwt.claim.role', 'service_role', false);
    select page::text
    from (select public.read_operator_intelligence_eligible_claim_page(
      '${operatorId}'::uuid, '${purpose}', '${asOf}'::timestamptz,
      '${integrationScope}'::jsonb, 50
    ) page) measured;
  `);
  const payloadText = payloadRaw.trim().split(/\r?\n/).at(-1);
  const payloadBytes = Buffer.byteLength(payloadText, "utf8");
  assert.ok(payloadBytes <= 512 * 1024, "approved page exceeded 512 KiB");
  const beforeHeap = process.memoryUsage().heapUsed;
  const materialized = JSON.parse(payloadText);
  const incrementalHeapBytes = Math.max(
    0,
    process.memoryUsage().heapUsed - beforeHeap
  );
  assert.ok(incrementalHeapBytes <= 32 * 1024 * 1024, "page exceeded 32 MiB heap budget");
  const returnedItems = materialized.rows.length;
  assert.equal(returnedItems, 50);

  const indexSizes = JSON.parse(await runSql(`
    select json_object_agg(relname, bytes)
    from (
      select c.relname, pg_relation_size(c.oid) bytes
      from pg_class c
      where c.relname in (
        'operator_intelligence_claim_head_events',
        'operator_intelligence_claim_head_page_idx',
        'operator_intelligence_claim_head_scope_page_idx',
        'operator_intelligence_claim_revisions'
      )
      order by c.relname
    ) sizes;
  `));

  process.stdout.write(`${JSON.stringify({
    environment: { postgres: await scalar("show server_version"), samples: 30, warmups: 5 },
    latency: metrics,
    plans,
    envelope: { payloadBytes, returnedItems, incrementalHeapBytes },
    relationBytes: indexSizes,
  }, null, 2)}\n`);
  process.stdout.write("Operator Intelligence performance verification passed.\n");
}

function flattenPlan(plan) {
  return [plan, ...(plan.Plans ?? []).flatMap(flattenPlan)];
}

function sum(nodes, key) {
  return nodes.reduce((total, node) => total + (node[key] ?? 0), 0);
}

async function scalar(sql) {
  return (await runSql(`${sql};`)).trim();
}

function runSql(sql) {
  const args = [databaseUrl, "-X", "-A", "-t", "-v", "ON_ERROR_STOP=1"];
  return new Promise((resolve, reject) => {
    const child = spawn(psql, args, { windowsHide: true, stdio: "pipe" });
    let stdout = "";
    let stderr = "";
    child.stdout.setEncoding("utf8");
    child.stderr.setEncoding("utf8");
    child.stdout.on("data", (chunk) => { stdout += chunk; });
    child.stderr.on("data", (chunk) => { stderr += chunk; });
    child.on("error", reject);
    child.on("close", (code) => {
      if (code === 0) resolve(stdout);
      else reject(new Error(stderr || `psql exited with ${code}`));
    });
    child.stdin.end(`${sql}\n`);
  });
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
