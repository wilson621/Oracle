import assert from "node:assert/strict";
import fs from "node:fs";
import { spawn } from "node:child_process";

const psql = process.env.SPRINT18_PSQL;
const databaseUrl = process.env.SPRINT18_DATABASE_URL;
if (!psql || !databaseUrl) {
  throw new Error("SPRINT18_PSQL and SPRINT18_DATABASE_URL are required.");
}
const target = new URL(databaseUrl);
const databaseName = decodeURIComponent(target.pathname.slice(1));
if (!/^[a-zA-Z][a-zA-Z0-9_]*$/.test(databaseName) || databaseName === "postgres") {
  throw new Error("Persistence verification requires a disposable database.");
}
const maintenance = new URL(target);
maintenance.pathname = "/postgres";

const operatorA = "11111111-1111-4111-8111-111111111111";
const operatorB = "22222222-2222-4222-8222-222222222222";
const accountA = "aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa";
const accountB = "bbbbbbbb-bbbb-4bbb-8bbb-bbbbbbbbbbbb";
const verifiedAt = "2026-07-24T12:00:00.000Z";

const policy = {
  contract: { name: "oracle.operator-control-policy-set", version: 1 },
  id: "control-policy",
  policyVersion: "1.0.0",
  effectiveFrom: "2026-07-24T00:00:00.000Z",
  effectiveUntil: null,
  purposes: [{
    id: "operator-control",
    optional: true,
    consentRequired: true,
    revocationEffect: "future-processing-and-eligibility-removal",
    observationCategories: [],
    declarationDomains: ["identity", "preference", "goal"],
    admissionPolicy: null,
  }],
  declarationLifecycle: {
    allowedDomains: ["identity", "preference", "goal"],
    expiryRequiredDomains: ["goal"],
  },
  retentionRules: [
    {
      id: "audit-retention",
      informationCategory: "control-audit",
      authoritativeOwner: "operator-intelligence-service",
      purpose: "operator-control",
      retentionClass: "control-audit",
      startEvent: "operation-completed",
      durationDays: { state: "configured", value: 30 },
      expiryEvent: { state: "unconfigured" },
      reassessmentDays: { state: "unconfigured" },
      consentDependent: false,
      legalAuthority: { state: "unconfigured" },
      disposition: "physical-delete",
      auditTreatment: "content-free",
      backupTreatment: "policy-supplied",
      externalProcessorTreatment: "none",
      deletionInteraction: "policy-supplied",
      approvingAuthority: "founder",
    },
    {
      id: "tombstone-retention",
      informationCategory: "control-tombstone",
      authoritativeOwner: "operator-intelligence-service",
      purpose: "operator-control",
      retentionClass: "control-tombstone",
      startEvent: "deletion-completed",
      durationDays: { state: "configured", value: 30 },
      expiryEvent: { state: "unconfigured" },
      reassessmentDays: { state: "unconfigured" },
      consentDependent: false,
      legalAuthority: { state: "unconfigured" },
      disposition: "physical-delete",
      auditTreatment: "content-free",
      backupTreatment: "policy-supplied",
      externalProcessorTreatment: "none",
      deletionInteraction: "policy-supplied",
      approvingAuthority: "founder",
    },
  ],
  deletion: { state: "unconfigured" },
  audit: {
    state: "configured",
    value: {
      permittedFields: [
        "operation-id", "actor-class", "scope-identifier", "action-type",
        "policy-identity", "request-time", "transition-time",
        "completion-time", "outcome", "recovery-state",
        "affected-record-counts", "non-content-integrity-evidence",
      ],
      retentionRuleId: "audit-retention",
    },
  },
  tombstone: {
    state: "configured",
    value: {
      justifications: [
        "prevent-unsafe-replay",
        "preserve-monotonic-revision-integrity",
        "prove-deletion-transition",
        "coordinate-deletion-recovery",
      ],
      permittedFields: [
        "tombstone-id", "operation-id", "subject-type",
        "non-content-subject-identity", "policy-identity", "deleted-at",
        "predecessor-identity", "integrity-digest",
      ],
      retentionRuleId: "tombstone-retention",
    },
  },
  backup: { state: "unconfigured" },
  externalProcessors: { state: "unconfigured" },
  export: { state: "unconfigured" },
  bounds: { state: "unconfigured" },
  recovery: { state: "unconfigured" },
  approvedBy: "founder",
  approvedAt: verifiedAt,
};

function receipt(operatorId, operationId, commandId, type) {
  return {
    contract: {
      name: "oracle.operator-control-operation-receipt",
      version: 1,
    },
    id: operationId,
    operatorId,
    commandId,
    type,
    scopeType: null,
    status: "accepted",
    policySetId: policy.id,
    policySetVersion: policy.policyVersion,
    requestedAt: verifiedAt,
    eligibilityRemovalRequired: false,
    eligibilityRemovedAt: null,
    completedAt: null,
    affectedRecordCounts: {},
    recoveryState: "none",
    failureCode: null,
  };
}

function consent(commandId) {
  return {
    contract: { name: "oracle.operator-consent-command", version: 1 },
    commandId,
    purpose: "operator-control",
    policySetId: policy.id,
    policySetVersion: policy.policyVersion,
    decision: "granted",
    effectiveAt: verifiedAt,
    expectedCurrentDecisionId: null,
  };
}

async function main() {
  await execute(maintenance.toString(), `
    select pg_terminate_backend(pid) from pg_stat_activity
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
    "database/010_operator_trust_control_persistence.sql",
  ]) {
    await execute(databaseUrl, fs.readFileSync(file, "utf8"));
  }
  await execute(databaseUrl, `
    insert into public.operators (id, callsign) values
      ('${operatorA}', 'Phase3-A'),
      ('${operatorB}', 'Phase3-B');
    insert into auth.users (id, email) values
      ('${accountA}', 'phase3-a@example.invalid'),
      ('${accountB}', 'phase3-b@example.invalid');
    insert into public.operator_account_bindings (account_id, operator_id) values
      ('${accountA}', '${operatorA}'),
      ('${accountB}', '${operatorB}');
  `);

  const trusted = "set request.jwt.claim.role = 'service_role';";
  assert.deepEqual(
    JSON.parse(await query(databaseUrl, `${trusted}
      select public.register_operator_control_policy_set(${json(policy)});
    `)),
    policy
  );
  await query(databaseUrl, `${trusted}
    select public.register_operator_control_policy_set(${json(policy)});
  `);
  await expectFailure(databaseUrl, `${trusted}
    select public.register_operator_control_policy_set(
      ${json({ ...policy, approvedBy: "other" })}
    );
  `, "immutable");
  await expectFailure(databaseUrl, `${trusted}
    select public.register_operator_control_policy_set(
      ${json({
        ...policy,
        id: "missing-admission-binding",
        purposes: [{
          ...policy.purposes[0],
          admissionPolicy: {
            policyId: "missing",
            policyVersion: "1.0.0",
          },
        }],
      })}
    );
  `, "does not exist or match");
  const noTombstonePolicy = {
    ...policy,
    id: "no-tombstone-policy",
    tombstone: { state: "unconfigured" },
  };
  await query(databaseUrl, `${trusted}
    select public.register_operator_control_policy_set(
      ${json(noTombstonePolicy)}
    );
  `);
  const noTombstoneReceipt = {
    ...receipt(
      operatorB,
      "no-tombstone-operation",
      "no-tombstone-command",
      "deletion"
    ),
    scopeType: "item",
    policySetId: noTombstonePolicy.id,
    eligibilityRemovalRequired: true,
  };
  await query(databaseUrl, `${trusted}
    select public.persist_operator_control_operation(
      '${operatorB}',
      'sha256:${"9".repeat(64)}',
      ${json(noTombstoneReceipt)}
    );
  `);
  await expectFailure(databaseUrl, `${trusted}
    select public.persist_operator_control_tombstone(
      '${operatorB}',
      ${json({
        contract: {
          name: "oracle.operator-control-tombstone",
          version: 1,
        },
        id: "no-tombstone",
        operationId: noTombstoneReceipt.id,
        subjectType: "declaration",
        nonContentSubjectIdentity: "subject",
        policySetId: noTombstonePolicy.id,
        policySetVersion: noTombstonePolicy.policyVersion,
        justification: "prove-deletion-transition",
        deletedAt: verifiedAt,
        predecessorIdentity: null,
        integrityDigest: `sha256:${"8".repeat(64)}`,
      })}
    );
  `, "unavailable or unconfigured");

  for (const [operatorId, suffix] of [[operatorA, "a"], [operatorB, "b"]]) {
    const operation = receipt(
      operatorId,
      `consent-operation-${suffix}`,
      `consent-command-${suffix}`,
      "consent"
    );
    await query(databaseUrl, `${trusted}
      select public.persist_operator_control_operation(
        '${operatorId}',
        'sha256:${suffix.repeat(64)}',
        ${json(operation)}
      );
    `);
    const command = consent(`consent-command-${suffix}`);
    await query(databaseUrl, `${trusted}
      select public.append_operator_control_consent_decision(
        '${operatorId}',
        ${json(command)},
        '${verifiedAt}'
      );
    `);
    await query(databaseUrl, `${trusted}
      select public.append_operator_control_consent_decision(
        '${operatorId}',
        ${json(command)},
        '${verifiedAt}'
      );
    `);
  }

  const declarationOperation = receipt(
    operatorA,
    "declaration-operation-a",
    "declaration-command-a",
    "declaration"
  );
  await query(databaseUrl, `${trusted}
    select public.persist_operator_control_operation(
      '${operatorA}',
      'sha256:${"c".repeat(64)}',
      ${json(declarationOperation)}
    );
  `);
  await expectFailure(databaseUrl, `${trusted}
    select public.persist_operator_control_operation(
      '${operatorA}',
      'sha256:${"d".repeat(64)}',
      ${json(declarationOperation)}
    );
  `, "immutable conflict");
  const declarationCommand = {
    contract: { name: "oracle.operator-declaration-command", version: 1 },
    commandId: "declaration-command-a",
    action: "create",
    declarationId: "declaration-a",
    revisionId: "declaration-revision-a-1",
    expectedCurrentRevisionId: null,
    domain: "preference",
    key: "review-style",
    value: "concise",
    purpose: "operator-control",
    scope: { type: "operator" },
    effectiveAt: verifiedAt,
    expiresAt: null,
    reasonCode: "operator-declared",
    policySetId: policy.id,
    policySetVersion: policy.policyVersion,
  };
  const declarationRevision = {
    contract: { name: "oracle.operator-declaration-revision", version: 1 },
    id: "declaration-revision-a-1",
    declarationId: "declaration-a",
    operatorId: operatorA,
    revision: 1,
    domain: "preference",
    key: "review-style",
    status: "active",
    epistemic: "declared",
    value: "concise",
    confidence: null,
    provenance: {
      sourceOwnerType: "operator-service",
      sourceOwnerId: "operator-service",
      method: "operator-declaration",
      producerId: "operator-service",
      producerVersion: "1.0.0",
      generatedAt: verifiedAt,
      purpose: "operator-control",
    },
    scope: { type: "operator" },
    temporalValidity: {
      effectiveFrom: verifiedAt,
      validUntil: null,
      lastAssessedAt: null,
      reassessAfter: null,
      reassessmentTrigger: null,
    },
    policyId: policy.id,
    policyVersion: policy.policyVersion,
    supersedesRevisionId: null,
  };
  await query(databaseUrl, `${trusted}
    select public.persist_operator_declaration_revision(
      '${operatorA}',
      ${json(declarationCommand)},
      ${json(declarationRevision)}
    );
  `);

  const competing = ["a", "b"].map((suffix) => {
    const commandId = `declaration-command-${suffix}-2`;
    return {
      suffix,
      operation: receipt(
        operatorA,
        `declaration-operation-${suffix}-2`,
        commandId,
        "declaration"
      ),
      command: {
        ...declarationCommand,
        commandId,
        action: "revise",
        revisionId: `declaration-revision-${suffix}-2`,
        expectedCurrentRevisionId: declarationRevision.id,
        value: suffix,
      },
      revision: {
        ...declarationRevision,
        id: `declaration-revision-${suffix}-2`,
        revision: 2,
        value: suffix,
        supersedesRevisionId: declarationRevision.id,
      },
    };
  });
  for (const candidate of competing) {
    await query(databaseUrl, `${trusted}
      select public.persist_operator_control_operation(
        '${operatorA}',
        'sha256:${candidate.suffix.repeat(64)}',
        ${json(candidate.operation)}
      );
    `);
  }
  const concurrency = await Promise.allSettled(competing.map((candidate) =>
    query(databaseUrl, `${trusted}
      select public.persist_operator_declaration_revision(
        '${operatorA}',
        ${json(candidate.command)},
        ${json(candidate.revision)}
      );
    `)
  ));
  assert.equal(
    concurrency.filter((outcome) => outcome.status === "fulfilled").length,
    1
  );
  assert.equal(
    concurrency.filter((outcome) =>
      outcome.status === "rejected" &&
      /concurrency race/i.test(String(outcome.reason))
    ).length,
    1
  );

  const deletionReceipt = {
    ...receipt(
      operatorA,
      "deletion-operation-a",
      "deletion-command-a",
      "deletion"
    ),
    scopeType: "item",
    eligibilityRemovalRequired: true,
  };
  await query(databaseUrl, `${trusted}
    select public.persist_operator_control_operation(
      '${operatorA}',
      'sha256:${"e".repeat(64)}',
      ${json(deletionReceipt)}
    );
  `);
  const pendingStep = {
    contract: {
      name: "oracle.operator-control-operation-step",
      version: 1,
    },
    id: "deletion-step-a",
    operationId: deletionReceipt.id,
    owner: "operator-service",
    action: "remove-declaration",
    status: "pending",
    attempt: 1,
    startedAt: null,
    completedAt: null,
    affectedRecordCount: 0,
    failureCode: null,
    checkpoint: null,
  };
  await query(databaseUrl, `${trusted}
    select public.persist_operator_control_operation_step(
      '${operatorA}',
      ${json(pendingStep)}
    );
  `);
  const completedDeletion = {
    ...deletionReceipt,
    status: "completed",
    eligibilityRemovedAt: verifiedAt,
    completedAt: verifiedAt,
  };
  await expectFailure(databaseUrl, `${trusted}
    select public.persist_operator_control_operation(
      '${operatorA}',
      'sha256:${"e".repeat(64)}',
      ${json(completedDeletion)}
    );
  `, "incomplete steps");
  await query(databaseUrl, `${trusted}
    select public.persist_operator_control_operation_step(
      '${operatorA}',
      ${json({
        ...pendingStep,
        status: "succeeded",
        startedAt: verifiedAt,
        completedAt: verifiedAt,
      })}
    );
  `);
  await query(databaseUrl, `${trusted}
    select public.persist_operator_control_operation(
      '${operatorA}',
      'sha256:${"e".repeat(64)}',
      ${json(completedDeletion)}
    );
  `);
  const deletionTombstone = {
    contract: {
      name: "oracle.operator-control-tombstone",
      version: 1,
    },
    id: "tombstone-a",
    operationId: deletionReceipt.id,
    subjectType: "declaration",
    nonContentSubjectIdentity: declarationRevision.declarationId,
    policySetId: policy.id,
    policySetVersion: policy.policyVersion,
    justification: "prove-deletion-transition",
    deletedAt: verifiedAt,
    predecessorIdentity: declarationRevision.id,
    integrityDigest: `sha256:${"a".repeat(64)}`,
  };
  await query(databaseUrl, `${trusted}
    select public.persist_operator_control_tombstone(
      '${operatorA}',
      ${json(deletionTombstone)}
    );
  `);
  assert.equal(await query(databaseUrl, `${trusted}
    select public.delete_operator_declaration_batch(
      '${operatorA}',
      '${deletionReceipt.id}',
      array['${declarationRevision.declarationId}'],
      1
    );
  `), "1\n");
  assert.equal(await query(databaseUrl, `
    select count(*) from public.operator_declaration_revisions
    where declaration_contract::text like '%concise%';
  `), "0\n");
  await expectFailure(databaseUrl, `${trusted}
    select public.persist_operator_declaration_revision(
      '${operatorA}',
      ${json(declarationCommand)},
      ${json(declarationRevision)}
    );
  `, "cannot be replayed");

  assert.equal(await query(databaseUrl, `
    set role authenticated;
    set request.jwt.claim.role = 'authenticated';
    set request.jwt.claim.sub = '${accountA}';
    select count(*) from public.operator_control_consent_decisions;
  `), "1\n");
  assert.equal(await query(databaseUrl, `
    set role authenticated;
    set request.jwt.claim.role = 'authenticated';
    set request.jwt.claim.sub = '${accountB}';
    select count(*) from public.operator_declarations;
  `), "0\n");
  await expectFailure(databaseUrl, `
    set role authenticated;
    set request.jwt.claim.role = 'authenticated';
    set request.jwt.claim.sub = '${accountA}';
    insert into public.operator_control_operations (
      operator_id, operation_id, command_id, command_digest, operation_type,
      status, policy_set_id, policy_set_version, requested_at,
      eligibility_removal_required, recovery_state, receipt_contract
    ) values (
      '${operatorA}', 'forbidden', 'forbidden',
      'sha256:${"f".repeat(64)}', 'export', 'accepted',
      '${policy.id}', '${policy.policyVersion}', '${verifiedAt}', false,
      'none', '{}'::jsonb
    );
  `, "permission denied");
  await expectFailure(databaseUrl, `
    set role anon;
    select count(*) from public.operator_control_operations;
  `, "permission denied");
  await expectFailure(databaseUrl, `
    set role authenticated;
    set request.jwt.claim.role = 'authenticated';
    select public.register_operator_control_policy_set(${json(policy)});
  `, "permission denied");

  const result = {
    policyVersions: Number((await query(databaseUrl,
      "select count(*) from public.operator_control_policy_sets;"
    )).trim()),
    broadConsentDecisions: Number((await query(databaseUrl,
      "select count(*) from public.operator_control_consent_decisions;"
    )).trim()),
    declarationRevisions: Number((await query(databaseUrl,
      "select count(*) from public.operator_declaration_revisions;"
    )).trim()),
    crossOperatorIsolation: true,
    authenticatedMutationDenied: true,
    exactReplay: true,
    immutableConflict: true,
    concurrentRevisionWinner: 1,
    completionGating: true,
    failClosedTombstonePolicy: true,
    deletionResidueAbsent: true,
    deletedIdentityReplayDenied: true,
    anonymousDenied: true,
    untrustedRpcDenied: true,
    result: "pass",
  };
  process.stdout.write(`${JSON.stringify(result, null, 2)}\n`);
  process.stdout.write("Migration 010 persistence verification passed.\n");
}

function json(value) {
  return `'${JSON.stringify(value).replaceAll("'", "''")}'::jsonb`;
}

async function expectFailure(url, sql, pattern) {
  try {
    await query(url, sql);
  } catch (error) {
    assert.match(String(error), new RegExp(pattern, "i"));
    return;
  }
  assert.fail(`Expected failure matching ${pattern}`);
}

function execute(url, sql) {
  return query(url, sql).then(() => undefined);
}

function query(url, sql) {
  return new Promise((resolve, reject) => {
    const child = spawn(psql, [url, "-X", "-A", "-t", "-q", "-v", "ON_ERROR_STOP=1"], {
      windowsHide: true,
      stdio: "pipe",
    });
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

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
