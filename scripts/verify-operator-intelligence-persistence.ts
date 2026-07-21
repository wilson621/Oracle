import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";
import type { SupabaseClient } from "@supabase/supabase-js";
import {
  createOperatorDataPolicyReference,
  createOperatorEvidenceReference,
  createOperatorIntelligenceClaimRevision,
} from "../lib/oracle/understanding";
import { SupabaseOperatorIntelligenceRepository } from "../lib/oracle/repositories/operator-intelligence-repository";
import {
  activeClaimInput,
  dataPolicyInput,
  evidenceInput,
} from "./operator-understanding-verification-fixtures";

const operatorId = "11111111-1111-4111-8111-111111111111";

async function main() {
  verifyMigrationContract();
  await verifyRepositoryWriteBoundary();
  await verifyCrossOperatorRejection();
  verifyRepositoryOwnershipBoundary();
  process.stdout.write(
    "Operator Intelligence persistence verification passed.\n"
  );
}

function verifyMigrationContract() {
  const migration = fs.readFileSync(
    path.join(
      process.cwd(),
      "database",
      "009_operator_intelligence_persistence.sql"
    ),
    "utf8"
  );
  const tables = [
    "operator_data_policy_versions",
    "operator_intelligence_evidence",
    "operator_intelligence_claims",
    "operator_intelligence_claim_revisions",
    "operator_intelligence_claim_evidence",
    "operator_intelligence_eligibility_assessments",
  ];

  assert.match(migration, /^begin;/i);
  assert.match(migration, /commit;\s*$/i);

  for (const table of tables) {
    assert.match(
      migration,
      new RegExp(`create table public\\.${table} \\(`, "i")
    );
    assert.match(
      migration,
      new RegExp(`alter table public\\.${table} enable row level security`, "i")
    );
    assert.match(
      migration,
      new RegExp(`revoke all privileges on table public\\.${table}`, "i")
    );
  }

  assert.match(
    migration,
    /foreign key \(operator_id, evidence_reference_id\)[\s\S]+references public\.operator_intelligence_evidence/i
  );
  assert.match(
    migration,
    /foreign key \(operator_id, claim_id, claim_revision_id\)[\s\S]+references public\.operator_intelligence_claim_revisions/i
  );
  assert.match(migration, /deferrable initially deferred/i);
  assert.match(
    migration,
    /claim_revision_contract -> 'explanation'/i
  );
  assert.match(migration, /sensitive_type_check/i);
  assert.match(
    migration,
    /grant execute on function public\.persist_operator_intelligence_claim_revision[\s\S]+to authenticated/i
  );
  assert.doesNotMatch(migration, /grant (insert|update|delete)[^;]+authenticated/i);
  assert.doesNotMatch(
    migration,
    /(insert into|update) public\.(operators|oracle_sessions|operator_account_bindings)/i
  );
}

async function verifyRepositoryWriteBoundary() {
  const client = new RecordingSupabaseClient();
  const repository = new SupabaseOperatorIntelligenceRepository(
    client as unknown as SupabaseClient
  );
  const policy = createOperatorDataPolicyReference(dataPolicyInput);
  const persistedPolicy = await repository.registerPolicyVersion(
    operatorId,
    policy
  );

  assert.deepEqual(persistedPolicy, policy);

  const evidence = createOperatorEvidenceReference({
    ...evidenceInput,
    operatorId,
  });
  const candidate = createOperatorIntelligenceClaimRevision(
    createCandidateInput(operatorId),
    [evidence]
  );
  const persisted = await repository.persistClaimRevision(
    operatorId,
    [evidence],
    candidate
  );

  assert.deepEqual(persisted, candidate);
  assert.deepEqual(
    client.calls.map((call) => call.functionName),
    [
      "register_operator_data_policy_version",
      "persist_operator_intelligence_claim_revision",
    ]
  );
  assert.equal(client.calls[1]?.arguments.p_operator_id, operatorId);
}

async function verifyCrossOperatorRejection() {
  const client = new RecordingSupabaseClient();
  const repository = new SupabaseOperatorIntelligenceRepository(
    client as unknown as SupabaseClient
  );
  const evidence = createOperatorEvidenceReference({
    ...evidenceInput,
    operatorId,
  });
  const candidate = createOperatorIntelligenceClaimRevision(
    createCandidateInput(operatorId),
    [evidence]
  );

  await assert.rejects(
    repository.persistClaimRevision(
      "22222222-2222-4222-8222-222222222222",
      [evidence],
      candidate
    ),
    /cannot cross Operator ownership/
  );
  assert.equal(client.calls.length, 0);
}

function verifyRepositoryOwnershipBoundary() {
  const sourceFiles = collectTypeScriptFiles(path.join(process.cwd(), "lib"));
  const intelligenceTableReads = sourceFiles
    .filter((file) =>
      fs.readFileSync(file, "utf8").includes('.from("operator_intelligence_')
    )
    .map((file) => path.relative(process.cwd(), file).replaceAll("\\", "/"));

  assert.deepEqual(intelligenceTableReads, [
    "lib/oracle/repositories/operator-intelligence-repository.ts",
  ]);
}

function createCandidateInput(candidateOperatorId: string) {
  return {
    ...activeClaimInput,
    operatorId: candidateOperatorId,
    status: "candidate",
    epistemic: "suspected",
    explanation: null,
    eligibility: {
      ...activeClaimInput.eligibility,
      eligible: false,
      reasons: ["candidate"],
    },
  };
}

class RecordingSupabaseClient {
  readonly calls: Array<{
    functionName: string;
    arguments: Record<string, unknown>;
  }> = [];

  async rpc(functionName: string, args: Record<string, unknown>) {
    this.calls.push({ functionName, arguments: args });

    if (functionName === "register_operator_data_policy_version") {
      return { data: args.p_policy, error: null };
    }

    if (functionName === "persist_operator_intelligence_claim_revision") {
      return { data: args.p_claim_revision, error: null };
    }

    return { data: args.p_eligibility, error: null };
  }
}

function collectTypeScriptFiles(directory: string): string[] {
  return fs.readdirSync(directory, { withFileTypes: true }).flatMap((entry) => {
    const entryPath = path.join(directory, entry.name);

    if (entry.isDirectory()) {
      return collectTypeScriptFiles(entryPath);
    }

    return /\.tsx?$/.test(entry.name) ? [entryPath] : [];
  });
}

void main().catch((error: unknown) => {
  console.error(error);
  process.exitCode = 1;
});
