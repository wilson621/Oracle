import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";

import type {
  OperatorRecord,
  OperatorRepository,
} from "../lib/oracle/repositories/operator-repository";
import { createOperatorService } from "../lib/oracle/services/operator/operator-service";
import {
  OPERATOR_ACCESS_POLICY,
  OperatorAuthenticationRequiredError,
  OperatorOwnershipNotEstablishedError,
} from "../lib/oracle/services/operator/operator-service-types";

const operatorOne = createOperator("operator-1", "Alpha");
const operatorTwo = createOperator("operator-2", "Bravo");

async function main() {
  await verifyAuthenticationIsRequired();
  await verifyMissingOwnershipIsRejected();
  await verifyAccountIsolation();
  await verifyCommissioningUsesResolvedOperator();
  verifyAccessPolicy();
  verifyMigrationContract();
  verifyCurrentOperatorReadsUseRepository();

  console.log("Operator ownership verification passed.");
}

async function verifyAuthenticationIsRequired() {
  const repository = new InMemoryOperatorRepository(null, {}, {});
  const service = createOperatorService(repository);

  await assert.rejects(
    service.getCurrentOperator(),
    OperatorAuthenticationRequiredError
  );
  assert.equal(repository.bindingLookups.length, 0);
}

async function verifyMissingOwnershipIsRejected() {
  const repository = new InMemoryOperatorRepository("account-1", {}, {});
  const service = createOperatorService(repository);

  await assert.rejects(
    service.getCurrentOperator(),
    OperatorOwnershipNotEstablishedError
  );
}

async function verifyAccountIsolation() {
  const repository = new InMemoryOperatorRepository(
    "account-1",
    {
      "account-1": operatorOne.id,
      "account-2": operatorTwo.id,
    },
    {
      [operatorOne.id]: operatorOne,
      [operatorTwo.id]: operatorTwo,
    }
  );
  const service = createOperatorService(repository);

  const first = await service.getCurrentOperator();
  assert.equal(first.id, operatorOne.id);
  assert.equal(Object.isFrozen(first), true);

  repository.accountId = "account-2";
  const second = await service.getCurrentOperator();
  assert.equal(second.id, operatorTwo.id);
  assert.deepEqual(repository.bindingLookups, ["account-1", "account-2"]);
}

async function verifyCommissioningUsesResolvedOperator() {
  const repository = new InMemoryOperatorRepository(
    "account-1",
    { "account-1": operatorOne.id },
    { [operatorOne.id]: operatorOne }
  );
  const service = createOperatorService(repository);

  const commissioned =
    await service.completeCurrentOperatorCommissioning("  Vanguard  ");

  assert.deepEqual(repository.commissioningRequests, [
    { operatorId: operatorOne.id, callsign: "Vanguard" },
  ]);
  assert.equal(commissioned.callsign, "Vanguard");
}

function verifyAccessPolicy() {
  assert.equal(OPERATOR_ACCESS_POLICY.mode, "authenticated-account");
  assert.equal(OPERATOR_ACCESS_POLICY.allowsSharedFallback, false);
  assert.deepEqual(OPERATOR_ACCESS_POLICY.appliesTo, [
    "production",
    "development",
    "test",
  ]);
}

function verifyMigrationContract() {
  const migration = fs.readFileSync(
    path.join(process.cwd(), "database", "008_operator_ownership.sql"),
    "utf8"
  );

  for (const table of [
    "operator_account_bindings",
    "operators",
    "oracle_sessions",
    "operator_achievements",
  ]) {
    assert.match(
      migration,
      new RegExp(`alter table public\\.${table} enable row level security`, "i")
    );
  }

  assert.match(
    migration,
    /account_id uuid primary key\s+references auth\.users\(id\) on delete cascade/i
  );
  assert.match(
    migration,
    /operator_id uuid not null unique\s+references public\.operators\(id\) on delete cascade/i
  );
  assert.match(migration, /revoke all privileges[\s\S]+from public, anon/i);
  assert.doesNotMatch(
    migration,
    /insert\s+into\s+public\.operator_account_bindings/i
  );
  assert.doesNotMatch(
    migration,
    /update\s+public\.oracle_sessions\s+set\s+operator_id/i
  );
}

function verifyCurrentOperatorReadsUseRepository() {
  const sourceFiles = collectTypeScriptFiles(path.join(process.cwd(), "lib"));
  const directOperatorReads = sourceFiles
    .filter((file) => fs.readFileSync(file, "utf8").includes('.from("operators")'))
    .filter((file) => fs.readFileSync(file, "utf8").includes(".select("))
    .map((file) => path.relative(process.cwd(), file).replaceAll("\\", "/"));

  assert.deepEqual(directOperatorReads, [
    "lib/oracle/repositories/operator-repository.ts",
  ]);

  const resolver = fs.readFileSync(
    path.join(process.cwd(), "lib", "operator", "getCurrentOperator.ts"),
    "utf8"
  );
  assert.match(resolver, /getBrowserOperatorService\(\)\.getCurrentOperator\(\)/);
  assert.doesNotMatch(resolver, /local@oracle\.dev|limit\(1\)/);
}

function createOperator(id: string, callsign: string): OperatorRecord {
  return {
    id,
    email: `${id}@example.test`,
    callsign,
    designation: null,
    primary_game: null,
    combat_rating: "Recruit",
    xp: 0,
    level: 1,
    total_sessions: 0,
    created_at: "2026-07-21T00:00:00.000Z",
  };
}

class InMemoryOperatorRepository implements OperatorRepository {
  readonly bindingLookups: string[] = [];
  readonly commissioningRequests: Array<{
    operatorId: string;
    callsign: string;
  }> = [];

  constructor(
    public accountId: string | null,
    private readonly bindings: Record<string, string>,
    private readonly operators: Record<string, OperatorRecord>
  ) {}

  async getAuthenticatedAccountId(): Promise<string | null> {
    return this.accountId;
  }

  async findOperatorIdForAccount(accountId: string): Promise<string | null> {
    this.bindingLookups.push(accountId);
    return this.bindings[accountId] ?? null;
  }

  async findOperatorById(operatorId: string): Promise<OperatorRecord | null> {
    return this.operators[operatorId] ?? null;
  }

  async commissionOperator(
    operatorId: string,
    callsign: string
  ): Promise<OperatorRecord | null> {
    this.commissioningRequests.push({ operatorId, callsign });
    const operator = this.operators[operatorId];

    return operator
      ? { ...operator, callsign, designation: "OR-000001" }
      : null;
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
