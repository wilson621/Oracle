import assert from "node:assert/strict";
import crypto from "node:crypto";
import fs from "node:fs";
import { spawn } from "node:child_process";

const psql = process.env.SPRINT17_PSQL;
const databaseUrl = process.env.SPRINT17_DATABASE_URL;
const evidenceFile = process.env.SPRINT17_PERFORMANCE_EVIDENCE_FILE;

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

const baselinePlanQueries = [
  {
    name: "eligible-head-page-scoped-before-projection",
    sql: `with historical_heads as (
        select distinct on (revision.claim_id)
          revision.operator_id,
          revision.claim_id,
          revision.claim_revision_id,
          revision.claim_revision_contract,
          revision.effective_from
        from public.operator_intelligence_claim_revisions revision
        where revision.operator_id = '${operatorId}'::uuid
          and revision.recorded_at <= '${asOf}'::timestamptz
        order by revision.claim_id, revision.revision desc
      ), eligible_heads as (
        select head.claim_revision_id, head.effective_from
        from historical_heads head
        cross join lateral (
          select assessment.eligibility_contract
          from public.operator_intelligence_eligibility_assessments assessment
          where assessment.operator_id = head.operator_id
            and assessment.claim_id = head.claim_id
            and assessment.claim_revision_id = head.claim_revision_id
            and assessment.purpose = '${purpose}'
            and assessment.assessed_at <= '${asOf}'::timestamptz
          order by assessment.assessed_at desc,
            assessment.recorded_at desc,
            assessment.assessment_id desc
          limit 1
        ) eligibility
        where head.claim_revision_contract ->> 'status' = 'active'
          and (eligibility.eligibility_contract ->> 'eligible')::boolean
          and head.effective_from <= '${asOf}'::timestamptz
          and head.claim_revision_contract -> 'scope' = '${integrationScope}'::jsonb
        order by head.effective_from desc, head.claim_revision_id asc
        limit 101
      )
      select * from eligible_heads`,
  },
];

const secondaryIndexJustifications = {
  operator_intelligence_evidence_operator_captured_idx:
    "Operator-owned Evidence chronology and bounded captured-at access.",
  operator_consent_decisions_current_idx:
    "Latest purpose-specific consent lookup in trusted admission and eligibility paths.",
  operator_intelligence_evidence_dispositions_current_idx:
    "Latest Evidence disposition lookup in trusted claim and eligibility paths.",
  operator_intelligence_evidence_admissions_policy_idx:
    "Operator, purpose and policy admission validation for trusted writes.",
  operator_intelligence_claim_revisions_operator_status_idx:
    "Operator/status revision access retained for approved lifecycle persistence paths.",
  operator_intelligence_claim_evidence_reference_idx:
    "Reverse Evidence-to-claim relationship access and foreign-key maintenance.",
  operator_intelligence_claim_head_scope_page_idx:
    "Measured scoped eligible-head page path.",
  operator_intelligence_claim_head_page_idx:
    "Measured unscoped eligible-head page path.",
  operator_intelligence_eligibility_current_idx:
    "Latest purpose-specific eligibility lookup and bounded eligibility history.",
};

function percentile(sorted, fraction) {
  return sorted[Math.ceil(sorted.length * fraction) - 1];
}

async function main() {
  const fixtureShape = JSON.parse(await runSql(`
    select json_build_object(
      'claimHeads', (select count(*) from public.operator_intelligence_claims where operator_id = '${operatorId}'::uuid),
      'claimHeadEvents', (select count(*) from public.operator_intelligence_claim_head_events where operator_id = '${operatorId}'::uuid),
      'claimRevisions', (select count(*) from public.operator_intelligence_claim_revisions where operator_id = '${operatorId}'::uuid),
      'eligibilityAssessments', (select count(*) from public.operator_intelligence_eligibility_assessments where operator_id = '${operatorId}'::uuid),
      'evidence', (select count(*) from public.operator_intelligence_evidence where operator_id = '${operatorId}'::uuid),
      'dispositions', (select count(*) from public.operator_intelligence_evidence_dispositions where operator_id = '${operatorId}'::uuid),
      'admissions', (select count(*) from public.operator_intelligence_evidence_admissions where operator_id = '${operatorId}'::uuid),
      'claimEvidenceLinks', (select count(*) from public.operator_intelligence_claim_evidence where operator_id = '${operatorId}'::uuid),
      'operators', (select count(*) from public.operators)
    );
  `));
  assert.equal(fixtureShape.claimHeads, 10_000);
  assert.equal(fixtureShape.claimHeadEvents, 100_000);
  assert.equal(fixtureShape.claimRevisions, 100_000);
  assert.equal(fixtureShape.eligibilityAssessments, 250_000);
  assert.equal(fixtureShape.evidence, 100_000);
  assert.equal(fixtureShape.dispositions, 100_000);
  assert.equal(fixtureShape.admissions, 100_000);
  assert.equal(fixtureShape.claimEvidenceLinks, 300_000);
  assert.ok(fixtureShape.operators >= 2);

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
  for (const scenario of [
    "eligible-page",
    "claim-lifecycle-page",
    "eligibility-history-page",
    "evidence-admission-replay",
    "claim-revision-replay",
    "eligibility-replay",
  ]) {
    assert.equal(metrics[scenario] !== undefined, true, `${scenario} was not measured`);
  }

  const plans = {};
  const rawPlans = { beforeOptimization: {}, afterOptimization: {} };
  for (const workload of baselinePlanQueries) {
    const document = JSON.parse(await runSql(
      `explain (analyze, buffers, format json) ${workload.sql};`
    ));
    rawPlans.beforeOptimization[workload.name] = document;
    plans[workload.name] = summarizePlan(document[0]);
  }

  for (const workload of planQueries) {
    const raw = await runSql(
      `explain (analyze, buffers, format json) ${workload.sql};`
    );
    const document = JSON.parse(raw);
    rawPlans.afterOptimization[workload.name] = document;
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
    plans[workload.name] = summarizePlan(root);
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

  const indexCatalog = JSON.parse(await runSql(`
    select json_agg(json_build_object(
      'name', indexes.indexname,
      'table', indexes.tablename,
      'definition', indexes.indexdef,
      'bytes', pg_relation_size(index_class.oid),
      'constraintName', constraint_record.conname,
      'constraintType', constraint_record.contype
    ) order by indexes.indexname)
    from pg_indexes indexes
    join pg_class index_class on index_class.relname = indexes.indexname
    join pg_namespace index_namespace on index_namespace.oid = index_class.relnamespace
      and index_namespace.nspname = indexes.schemaname
    left join lateral (
      select constraint_source.conname, constraint_source.contype
      from pg_constraint constraint_source
      where constraint_source.conindid = index_class.oid
        and constraint_source.contype in ('p', 'u', 'x')
      order by constraint_source.conname
      limit 1
    ) constraint_record on true
    where indexes.schemaname = 'public'
      and indexes.tablename in (
        'operator_data_policy_versions',
        'operator_consent_decisions',
        'operator_intelligence_evidence',
        'operator_intelligence_evidence_dispositions',
        'operator_intelligence_evidence_admissions',
        'operator_intelligence_claims',
        'operator_intelligence_claim_revisions',
        'operator_intelligence_claim_head_events',
        'operator_intelligence_claim_evidence',
        'operator_intelligence_eligibility_assessments'
      );
  `));
  assert.equal(indexCatalog.length, 29, "Migration 009 index inventory changed");
  const selectedIndexes = new Map();
  for (const [planName, document] of Object.entries(rawPlans.afterOptimization)) {
    for (const node of flattenPlan(document[0].Plan)) {
      if (node["Index Name"]) {
        const uses = selectedIndexes.get(node["Index Name"]) ?? [];
        uses.push(planName);
        selectedIndexes.set(node["Index Name"], uses);
      }
    }
  }
  const indexEvidence = indexCatalog.map((index) => {
    const measuredPlans = [...new Set(selectedIndexes.get(index.name) ?? [])];
    const justification = index.constraintName
      ? `Constraint-backed integrity index (${index.constraintType}: ${index.constraintName}).`
      : secondaryIndexJustifications[index.name];
    assert.ok(justification, `Index ${index.name} has no retained justification`);
    return { ...index, measuredPlans, justification };
  });

  const migration = fs.readFileSync(
    "database/009_operator_intelligence_persistence.sql"
  );
  const evidence = {
    schemaVersion: 1,
    evidenceDate: new Date().toISOString(),
    migrationSha256: crypto.createHash("sha256").update(migration).digest("hex"),
    environment: {
      postgres: await scalar("show server_version"),
      samples: 30,
      warmups: 5,
    },
    fixtureShape,
    latency: metrics,
    planSummaries: plans,
    rawExplainAnalyzeBuffersPlans: rawPlans,
    indexEvidence,
    envelope: { payloadBytes, returnedItems, incrementalHeapBytes },
    relationBytes: indexSizes,
    result: "pass",
  };

  if (evidenceFile) {
    fs.writeFileSync(evidenceFile, `${JSON.stringify(evidence, null, 2)}\n`, "utf8");
  }

  process.stdout.write(`${JSON.stringify({
    environment: evidence.environment,
    fixtureShape: evidence.fixtureShape,
    latency: evidence.latency,
    planSummaries: evidence.planSummaries,
    envelope: evidence.envelope,
    retainedIndexCount: evidence.indexEvidence.length,
    evidenceFile: evidenceFile ?? null,
    result: evidence.result,
  }, null, 2)}\n`);
  process.stdout.write("Operator Intelligence performance verification passed.\n");
}

function flattenPlan(plan) {
  return [plan, ...(plan.Plans ?? []).flatMap(flattenPlan)];
}

function summarizePlan(root) {
  const nodes = flattenPlan(root.Plan);
  return {
    planningMs: root["Planning Time"],
    executionMs: root["Execution Time"],
    rowsReturned: root.Plan["Actual Rows"],
    rowsExaminedAcrossPlanNodes: nodes.reduce((total, node) => {
      const loops = node["Actual Loops"] ?? 1;
      return total + loops * (
        (node["Actual Rows"] ?? 0) +
        (node["Rows Removed by Filter"] ?? 0) +
        (node["Rows Removed by Index Recheck"] ?? 0)
      );
    }, 0),
    bufferUsage: {
      sharedHitBlocks: root.Plan["Shared Hit Blocks"] ?? 0,
      sharedReadBlocks: root.Plan["Shared Read Blocks"] ?? 0,
      sharedDirtiedBlocks: root.Plan["Shared Dirtied Blocks"] ?? 0,
      sharedWrittenBlocks: root.Plan["Shared Written Blocks"] ?? 0,
      tempReadBlocks: root.Plan["Temp Read Blocks"] ?? 0,
      tempWrittenBlocks: root.Plan["Temp Written Blocks"] ?? 0,
    },
    indexes: [...new Set(nodes.map((node) => node["Index Name"]).filter(Boolean))],
    sorts: nodes.filter((node) => node["Sort Method"]).map((node) => ({
      method: node["Sort Method"],
      spaceUsedKiB: node["Sort Space Used"],
      spaceType: node["Sort Space Type"],
    })),
  };
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
