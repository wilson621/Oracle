import assert from "node:assert/strict";
import { InMemoryOracleDevelopmentRepository } from "../lib/oracle/repositories/operator-development-repository";
import { InMemoryOracleSessionLifecycleRepository } from "../lib/oracle/repositories/session-lifecycle-repository";
import { InMemoryOracleSessionReportRepository } from "../lib/oracle/repositories/session-report-repository";
import {
  ORACLE_SESSION_REPORT_CONTRACT,
  ORACLE_SESSION_REPORT_CONTRACT_VERSION,
  createOracleSessionReport,
} from "../lib/oracle/reports";
import {
  OracleAICoachService,
  OracleMissionGenerationEngine,
  OracleMissionService,
  OraclePlannerService,
  OracleProgressionService,
} from "../lib/oracle/services/operator-development";
import { OracleSessionService } from "../lib/oracle/services/sessions";

async function main() {
  const operatorId = "10000000-0000-4000-8000-000000000001";
  const authority = { accountId: "account-1", operatorId };
  const reports = new InMemoryOracleSessionReportRepository();
  const sessions = new OracleSessionService(
    new InMemoryOracleSessionLifecycleRepository()
  );
  const report = createOracleSessionReport({
    contract: ORACLE_SESSION_REPORT_CONTRACT,
    contractVersion: ORACLE_SESSION_REPORT_CONTRACT_VERSION,
    id: "a".repeat(64),
    operatorId,
    sessionId: "20000000-0000-4000-8000-000000000001",
    revision: 1,
    status: "complete",
    generatedAt: "2026-07-24T10:00:00.000Z",
    inputFingerprint: "b".repeat(64),
    assessment: {
      epistemic: "suspected",
      summary: "Positioning is inconsistent.",
      confidence: 0.65,
    },
    recommendation: {
      summary: "Review positioning in the next comparable Session.",
      confidence: 0.65,
      evidenceReferenceIds: ["source-evidence"],
      reassessmentTrigger: "After the next comparable Session.",
    },
    engines: ["behaviour", "trend", "prediction", "memory", "contextual"].map(
      (engineId) => ({
        engineId: engineId as "behaviour",
        engineVersion: "1.0.0",
        status: "suspected" as const,
        summary: "Evidence-bound output.",
        confidence: 0.65,
        evidenceReferenceIds: ["source-evidence"],
        recommendation: "Review positioning.",
        reassessmentTrigger: "After later Evidence.",
      })
    ),
    disagreements: [],
    evidenceReferenceIds: ["source-evidence"],
    understandingClaimIds: [],
    model: {
      status: "not-requested",
      providerId: null,
      modelId: null,
      narrative: null,
      caveat: null,
    },
  });
  await reports.save(report);
  const repository = new InMemoryOracleDevelopmentRepository();
  const progression = new OracleProgressionService();
  const service = new OracleMissionService(
    reports,
    sessions,
    repository,
    new OracleAICoachService(),
    new OracleMissionGenerationEngine(),
    new OraclePlannerService(),
    progression
  );

  const proposed = await service.propose(
    authority,
    report.id,
    "2026-07-24T11:00:00.000Z"
  );
  assert.equal((await service.propose(authority, report.id, proposed.mission.createdAt)), proposed);
  assert.equal(proposed.mission.rewardXp, 100);
  assert.equal(proposed.reassessment.causalClaim, false);

  const active = await service.accept({
    authority,
    missionId: proposed.mission.id,
    idempotencyKey: "accept-1",
    expectedVersion: 1,
    occurredAt: "2026-07-24T11:01:00.000Z",
  });
  assert.equal(active.mission.status, "active");

  const sessionId = "20000000-0000-4000-8000-000000000002";
  const evidenceId = "30000000-0000-4000-8000-000000000001";
  await sessions.execute(authority, {
    type: "begin",
    commandId: "40000000-0000-4000-8000-000000000001",
    idempotencyKey: "begin-later",
    operatorId,
    occurredAt: "2026-07-24T12:00:00.000Z",
    expectedVersion: null,
    sessionId,
    context: {
      applicationId: "oracle-web",
      deviceId: "device-1",
      integrationId: "test-game",
      integrationVersion: "1.0.0",
    },
  });
  await sessions.execute(authority, {
    type: "admit-evidence",
    commandId: "40000000-0000-4000-8000-000000000002",
    idempotencyKey: "admit-later",
    operatorId,
    occurredAt: "2026-07-24T12:01:00.000Z",
    expectedVersion: 1,
    sessionId,
    evidence: {
      id: evidenceId,
      sourceType: "game-integration-direct-observation",
      sourceOwnerId: "test-game",
      sourceRecordId: "later-record",
      purpose: "mission-completion",
      policyId: "mission-evidence",
      policyVersion: "1.0.0",
      contentDigest: `sha256:${"c".repeat(64)}`,
      observedAt: "2026-07-24T12:00:00.000Z",
      admittedAt: "2026-07-24T12:01:00.000Z",
    },
  });
  await sessions.execute(authority, {
    type: "complete",
    commandId: "40000000-0000-4000-8000-000000000003",
    idempotencyKey: "complete-later",
    operatorId,
    occurredAt: "2026-07-24T12:02:00.000Z",
    expectedVersion: 2,
    sessionId,
  });

  const command = {
    authority,
    missionId: active.mission.id,
    idempotencyKey: "complete-mission-1",
    expectedVersion: 2,
    occurredAt: "2026-07-24T12:03:00.000Z",
    completionId: "completion-1",
    sessionId,
    evidenceReferenceIds: [evidenceId],
  } as const;
  const completed = await service.complete(command);
  assert.equal(completed.mission.status, "completed");
  assert.equal(completed.progressionTransaction?.xp, 100);
  assert.equal(completed.achievementAwards.length, 1);
  assert.equal(completed.reassessment.causalClaim, false);
  assert.equal(await service.complete(command), completed);

  await assert.rejects(
    service.complete({
      ...command,
      idempotencyKey: "bad-replay",
      expectedVersion: 3,
      completionId: "completion-2",
      evidenceReferenceIds: ["not-admitted"],
    }),
    /already completed|verified admitted Evidence/
  );
  await assert.rejects(
    service.propose(
      {
        accountId: "account-2",
        operatorId: "10000000-0000-4000-8000-000000000002",
      },
      report.id,
      "2026-07-24T13:00:00.000Z"
    ),
    /authorised Session Report/
  );
  const projection = JSON.stringify(completed);
  assert.equal(projection.includes("sourceRecordId"), false);
  assert.equal(projection.includes("modelId"), false);
  console.log("Sprint 24 Operator Development verification passed.");
}

void main().catch((error: unknown) => {
  console.error(error);
  process.exitCode = 1;
});
