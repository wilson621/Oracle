import assert from "node:assert/strict";
import fs from "node:fs";
import {
  InMemoryOracleSessionLifecycleRepository,
  OracleSessionRepositoryConflictError,
  OracleSessionRepositoryIdempotencyError,
} from "../lib/oracle/repositories/session-lifecycle-repository";
import { OracleSessionService } from "../lib/oracle/services/sessions";
import type {
  OracleSessionCommand,
  OracleSessionEvidenceReference,
} from "../lib/oracle/sessions";
import { OracleCompanionSessionManager } from "../desktop/companion/companion-session-manager";
import { OracleSessionHistoryApplication } from "../lib/oracle/applications/sessions";

const operatorId = "11111111-1111-4111-8111-111111111111";
const otherOperatorId = "22222222-2222-4222-8222-222222222222";
const sessionId = "aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa";
const authority = Object.freeze({
  accountId: "33333333-3333-4333-8333-333333333333",
  operatorId,
});
const repository = new InMemoryOracleSessionLifecycleRepository();
const service = new OracleSessionService(repository);

async function main() {
  const begin = command({
    type: "begin",
    commandId: "aaaaaaaa-0001-4000-8000-000000000001",
    idempotencyKey: "begin-session-a",
    expectedVersion: null,
    context: {
      applicationId: "companion",
      deviceId: "trusted-device-1",
      integrationId: "call-of-duty",
      integrationVersion: "1.0.0",
    },
  });
  const started = await service.execute(authority, begin);
  assert.equal(started.session.status, "active");
  assert.equal(started.session.version, 1);
  assert.equal(started.receipt.replayed, false);

  const replay = await service.execute(authority, begin);
  assert.equal(replay.session.version, 1);
  assert.equal(replay.receipt.replayed, true);

  await assert.rejects(
    service.execute(authority, {
      ...begin,
      commandId: "aaaaaaaa-0002-4000-8000-000000000002",
    }),
    OracleSessionRepositoryIdempotencyError
  );
  await assert.rejects(
    service.execute(
      { ...authority, operatorId: otherOperatorId },
      begin
    ),
    /authenticated owning Operator/
  );

  const evidence: OracleSessionEvidenceReference = {
    id: "bbbbbbbb-bbbb-4bbb-8bbb-bbbbbbbbbbbb",
    sourceType: "game-integration-direct-observation",
    sourceOwnerId: "call-of-duty",
    sourceRecordId: "observation-1",
    purpose: "session-history",
    policyId: "session-evidence",
    policyVersion: "1.0.0",
    contentDigest: `sha256:${"a".repeat(64)}`,
    observedAt: "2026-07-24T20:01:00.000Z",
    admittedAt: "2026-07-24T20:01:01.000Z",
  };
  const admitted = await service.execute(
    authority,
    command({
      type: "admit-evidence",
      commandId: "aaaaaaaa-0003-4000-8000-000000000003",
      idempotencyKey: "admit-evidence-a",
      expectedVersion: 1,
      evidence,
      occurredAt: "2026-07-24T20:01:01.000Z",
    })
  );
  assert.equal(admitted.session.evidence.length, 1);
  assert.equal(admitted.session.version, 2);
  assert.equal("rawObservation" in admitted.session.evidence[0], false);

  await assert.rejects(
    service.execute(
      authority,
      command({
        type: "recover",
        commandId: "aaaaaaaa-0004-4000-8000-000000000004",
        idempotencyKey: "stale-recovery",
        expectedVersion: 1,
      })
    ),
    /stale expected version/
  );

  const recovered = await service.execute(
    authority,
    command({
      type: "recover",
      commandId: "aaaaaaaa-0005-4000-8000-000000000005",
      idempotencyKey: "recover-session-a",
      expectedVersion: 2,
    })
  );
  assert.equal(recovered.session.version, 3);

  const completedCommand = command({
    type: "complete",
    commandId: "aaaaaaaa-0006-4000-8000-000000000006",
    idempotencyKey: "complete-session-a",
    expectedVersion: 3,
  });
  const completed = await service.execute(authority, completedCommand);
  assert.equal(completed.session.status, "completed");
  assert.equal(completed.session.version, 4);
  assert.equal((await service.execute(authority, completedCommand)).receipt.replayed, true);
  await assert.rejects(
    service.execute(
      authority,
      command({
        type: "resume",
        commandId: "aaaaaaaa-0007-4000-8000-000000000007",
        idempotencyKey: "resume-completed",
        expectedVersion: 4,
      })
    ),
    /cannot resume/
  );

  const application = new OracleSessionHistoryApplication(service);
  const history = await application.list(authority, {
    statuses: ["completed"],
    integrationId: "call-of-duty",
    search: "companion",
    pageSize: 10,
    beforeStartedAt: null,
    beforeSessionId: null,
  });
  assert.equal(history.status, "ready");
  assert.equal(history.sessions.length, 1);
  assert.equal((await application.detail(authority, sessionId))?.status, "completed");
  const exported = await application.export(authority, sessionId);
  assert.ok(exported);
  assert.equal(JSON.stringify(exported).includes("contentDigest"), false);
  assert.equal(exported.session.evidenceCount, 1);

  const deletion = await service.execute(
    authority,
    command({
      type: "delete",
      commandId: "aaaaaaaa-0008-4000-8000-000000000008",
      idempotencyKey: "delete-session-a",
      expectedVersion: 4,
      deletionOperationId: "dddddddd-dddd-4ddd-8ddd-dddddddddddd",
    })
  );
  assert.equal(deletion.session.status, "deletion-pending");
  assert.equal(
    (await service.listHistory(authority, {
      statuses: [],
      integrationId: null,
      search: null,
      pageSize: 10,
      beforeStartedAt: null,
      beforeSessionId: null,
    })).sessions.length,
    0
  );
  const deleted = await service.execute(
    authority,
    command({
      type: "finalize-deletion",
      commandId: "aaaaaaaa-0009-4000-8000-000000000009",
      idempotencyKey: "finalize-delete-session-a",
      expectedVersion: 5,
      deletionOperationId: "dddddddd-dddd-4ddd-8ddd-dddddddddddd",
    })
  );
  assert.equal(deleted.session.status, "deleted");
  assert.equal(deleted.session.evidence.length, 0);

  const companion = new OracleCompanionSessionManager();
  const desktop = companion.start();
  const correlated = companion.correlateDurableSession({
    contract: "oracle.session-companion-correlation",
    contractVersion: 1,
    sessionId,
    operatorId,
    desktopSessionId: desktop.id,
    deviceId: "trusted-device-1",
    integrationId: "call-of-duty",
    integrationVersion: "1.0.0",
    establishedAt: "2026-07-24T20:00:00.000Z",
  });
  assert.equal(correlated.durableCorrelation?.sessionId, sessionId);
  assert.notEqual(correlated.id, sessionId);
  await assert.rejects(
    Promise.resolve().then(() =>
      companion.correlateDurableSession({
        ...correlated.durableCorrelation!,
        sessionId: "eeeeeeee-eeee-4eee-8eee-eeeeeeeeeeee",
      })
    ),
    /already correlated/
  );

  const raceRepository = new InMemoryOracleSessionLifecycleRepository();
  const raceService = new OracleSessionService(raceRepository);
  const raceResults = await Promise.allSettled([
    raceService.execute(authority, begin),
    raceService.execute(authority, {
      ...begin,
      commandId: "aaaaaaaa-0010-4000-8000-000000000010",
      idempotencyKey: "begin-session-race",
    }),
  ]);
  assert.equal(
    raceResults.filter(({ status }) => status === "fulfilled").length,
    1
  );
  assert.ok(
    raceResults.some(
      (result) =>
        result.status === "rejected" &&
        result.reason instanceof OracleSessionRepositoryConflictError
    )
  );

  const metrics = service.getMetrics();
  assert.ok(metrics.idempotentReplays >= 2);
  assert.ok(metrics.rejectedCommands >= 3);
  const certification = {
      schemaVersion: 1,
      verifiedAt: new Date().toISOString(),
      contract: "oracle.session",
      contractVersion: 1,
      authoritativeOwner: "session-service",
      companionAuthorityMerged: false,
      evidenceMinimised: true,
      completionIdempotent: true,
      recoveryVerified: true,
      deletionOrchestrated: true,
      historyApplicationVerified: true,
      crossOperatorIsolation: true,
      concurrentWinnerCount: 1,
      runtimePersistence: "disabled",
      deployed: false,
      activated: false,
      result: "pass",
  };
  fs.mkdirSync("docs/sprints/evidence/sprint-21/generated", {
    recursive: true,
  });
  fs.writeFileSync(
    "docs/sprints/evidence/sprint-21/generated/session-lifecycle-certification.json",
    `${JSON.stringify(certification, null, 2)}\n`,
    "utf8"
  );
  process.stdout.write(`${JSON.stringify(certification, null, 2)}\n`);
}

function command<T extends Omit<OracleSessionCommand, "operatorId" | "sessionId" | "occurredAt"> & {
  occurredAt?: string;
}>(input: T): OracleSessionCommand {
  return {
    ...input,
    operatorId,
    sessionId,
    occurredAt: input.occurredAt ?? "2026-07-24T20:00:00.000Z",
  } as OracleSessionCommand;
}

void main();
