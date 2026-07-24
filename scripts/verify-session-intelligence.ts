import assert from "node:assert/strict";
import { InMemoryOracleSessionLifecycleRepository } from "../lib/oracle/repositories/session-lifecycle-repository";
import { InMemoryOracleSessionReportRepository } from "../lib/oracle/repositories/session-report-repository";
import {
  createCoreSessionReportEngineRegistry,
  type OracleSessionIntelligenceProvider,
  type OracleSessionReportModelProvider,
} from "../lib/oracle/reports";
import {
  OracleSessionIntelligenceProviderRegistry,
  OracleSessionReportService,
} from "../lib/oracle/services/session-reports";
import { OracleSessionService } from "../lib/oracle/services/sessions";
import type { OperatorUnderstandingService } from "../lib/oracle/services/operator-understanding";
import { createOperatorUnderstandingSnapshot } from "../lib/oracle/understanding";

async function main() {
const operatorId = "10000000-0000-4000-8000-000000000001";
const authority = { accountId: "account-1", operatorId };
const sessionIds = [
  "20000000-0000-4000-8000-000000000001",
  "20000000-0000-4000-8000-000000000002",
] as const;
const evidenceIds = [
  "30000000-0000-4000-8000-000000000001",
  "30000000-0000-4000-8000-000000000002",
] as const;
const lifecycle = new InMemoryOracleSessionLifecycleRepository();
const sessions = new OracleSessionService(lifecycle);

await completeSession(0, "2026-07-22T10:00:00.000Z");
await completeSession(1, "2026-07-23T10:00:00.000Z");

const understanding: OperatorUnderstandingService = Object.freeze({
  async getCurrentSnapshot(request) {
    return createOperatorUnderstandingSnapshot({
      contract: { name: "oracle.operator-understanding-snapshot", version: 1 },
      operatorId,
      generatedAt: request.asOf,
      asOf: request.asOf,
      purpose: request.purpose,
      policySetVersion: "1.0.0",
      identity: [],
      preferences: [],
      goals: [],
      state: [],
      memory: [],
      intelligence: [],
      unknowns: [],
    });
  },
});

const provider: OracleSessionIntelligenceProvider = Object.freeze({
  id: "test-game-session-intelligence",
  version: "1.0.0",
  integrationId: "test-game",
  async resolve(inputSessions) {
    return inputSessions.flatMap((session, index) => [
      observation(session.id, session.evidence[0]!.id, "aim", 55 + index * 15),
      observation(
        session.id,
        session.evidence[0]!.id,
        "positioning",
        45 + index * 15
      ),
    ]);
  },
});
const providers = new OracleSessionIntelligenceProviderRegistry();
providers.register(provider);
const repository = new InMemoryOracleSessionReportRepository();
const service = new OracleSessionReportService(
  sessions,
  understanding,
  providers,
  createCoreSessionReportEngineRegistry(),
  repository,
  null
);
const request = {
  authority,
  sessionId: sessionIds[1],
  purpose: "operator-coaching",
  asOf: "2026-07-24T10:00:00.000Z",
  requestModelEnrichment: false,
} as const;
const report = await service.generate(request);

assert.equal(report.contract, "oracle.session-intelligence-report");
assert.equal(report.engines.length, 5);
assert.deepEqual(
  [...report.engines.map(({ engineId }) => engineId)].sort(),
  ["behaviour", "contextual", "memory", "prediction", "trend"]
);
assert.equal(report.status, "complete");
assert.equal(report.assessment.epistemic, "suspected");
assert.ok(report.evidenceReferenceIds.length > 0);
assert.ok(report.assessment.confidence >= 0 && report.assessment.confidence <= 1);
assert.ok(report.recommendation.reassessmentTrigger.length > 0);
assert.equal(await service.generate(request), report, "exact replay must return the immutable report");
assert.equal((await service.list(authority, null)).length, 1);

const conflictingProviders = new OracleSessionIntelligenceProviderRegistry();
conflictingProviders.register({
  ...provider,
  id: "conflicting-provider",
  async resolve(inputSessions) {
    const values = await provider.resolve(inputSessions);
    return [
      ...values.map((value) => ({
        ...value,
        semantics: { ...value.semantics, providerId: "conflicting-provider" },
      })),
      {
        ...observation(
          sessionIds[1],
          evidenceIds[1],
          "aim",
          0,
          "conflicting-provider"
        ),
        id: "conflicting-aim-observation",
      },
    ];
  },
});
const conflicting = await new OracleSessionReportService(
  sessions,
  understanding,
  conflictingProviders,
  createCoreSessionReportEngineRegistry(),
  new InMemoryOracleSessionReportRepository(),
  null
).generate(request);
assert.equal(conflicting.disagreements.length, 1);
assert.ok(conflicting.assessment.confidence < report.assessment.confidence);

const enrichedProvider: OracleSessionReportModelProvider = {
  id: "reviewed-model-provider",
  modelId: "reviewed-model",
  async enrich(input) {
    return {
      narrative: "The deterministic assessment remains controlling.",
      caveat: "Model text is optional enrichment.",
      evidenceReferenceIds: input.evidenceReferenceIds.slice(0, 1),
    };
  },
};
const enrichedService = new OracleSessionReportService(
  sessions,
  understanding,
  providers,
  createCoreSessionReportEngineRegistry(),
  repository,
  enrichedProvider
);
const enriched = await enrichedService.generate({
  ...request,
  requestModelEnrichment: true,
});
assert.equal(enriched.model.status, "enriched");
assert.equal(enriched.assessment.summary, report.assessment.summary);
assert.equal(enriched.recommendation.summary, report.recommendation.summary);
assert.equal((await service.list(authority, sessionIds[1])).length, 2);
const comparison = await service.compare(
  authority,
  report.id,
  enriched.id,
  "2026-07-24T10:01:00.000Z"
);
assert.equal(comparison.operatorId, operatorId);

const invalidModelService = new OracleSessionReportService(
  sessions,
  understanding,
  providers,
  createCoreSessionReportEngineRegistry(),
  new InMemoryOracleSessionReportRepository(),
  {
    id: "invalid-provider",
    modelId: "invalid-model",
    async enrich() {
      return { narrative: "missing strict keys" };
    },
  }
);
const invalid = await invalidModelService.generate({
  ...request,
  requestModelEnrichment: true,
});
assert.equal(invalid.status, "degraded");
assert.equal(invalid.model.status, "invalid");

const outageService = new OracleSessionReportService(
  sessions,
  understanding,
  providers,
  createCoreSessionReportEngineRegistry(),
  new InMemoryOracleSessionReportRepository(),
  {
    id: "outage-provider",
    modelId: "outage-model",
    async enrich() {
      throw new Error("provider outage");
    },
  }
);
assert.equal(
  (
    await outageService.generate({
      ...request,
      requestModelEnrichment: true,
    })
  ).model.status,
  "unavailable"
);

const unsafeProviders = new OracleSessionIntelligenceProviderRegistry();
unsafeProviders.register({
  ...provider,
  id: "unsafe-provider",
  async resolve() {
    return [
      observation(
        sessionIds[1],
        "30000000-0000-4000-8000-000000000099",
        "aim",
        99,
        "unsafe-provider"
      ),
    ];
  },
});
await assert.rejects(
  new OracleSessionReportService(
    sessions,
    understanding,
    unsafeProviders,
    createCoreSessionReportEngineRegistry(),
    new InMemoryOracleSessionReportRepository(),
    null
  ).generate(request),
  /outside admitted Evidence/
);
await assert.rejects(
  service.generate({
    ...request,
    authority: {
      accountId: "account-2",
      operatorId: "10000000-0000-4000-8000-000000000002",
    },
  }),
  /does not exist/
);

const activeSessionId = "20000000-0000-4000-8000-000000000003";
await sessions.execute(authority, {
  type: "begin",
  commandId: "40000000-0000-4000-8000-000000000010",
  idempotencyKey: "begin-active",
  operatorId,
  occurredAt: "2026-07-24T11:00:00.000Z",
  expectedVersion: null,
  sessionId: activeSessionId,
  context: {
    applicationId: "oracle-web",
    deviceId: "device-1",
    integrationId: "test-game",
    integrationVersion: "1.0.0",
  },
});
await assert.rejects(
  service.generate({ ...request, sessionId: activeSessionId }),
  /requires a completed Session/
);

const serialized = JSON.stringify(report);
assert.equal(serialized.includes('"value":'), false, "raw observations must not cross the report boundary");
assert.equal(serialized.includes("sourceRecordId"), false);
console.log("Sprint 23 Session Intelligence verification passed.");

async function completeSession(index: number, startedAt: string) {
  const sessionId = sessionIds[index]!;
  const evidenceId = evidenceIds[index]!;
  await sessions.execute(authority, {
    type: "begin",
    commandId: `40000000-0000-4000-8000-00000000000${index}`,
    idempotencyKey: `begin-${index}`,
    operatorId,
    occurredAt: startedAt,
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
    commandId: `50000000-0000-4000-8000-00000000000${index}`,
    idempotencyKey: `evidence-${index}`,
    operatorId,
    occurredAt: new Date(Date.parse(startedAt) + 1_000).toISOString(),
    expectedVersion: 1,
    sessionId,
    evidence: {
      id: evidenceId,
      sourceType: "game-integration-direct-observation",
      sourceOwnerId: "test-game",
      sourceRecordId: `record-${index}`,
      purpose: "session-intelligence",
      policyId: "session-evidence",
      policyVersion: "1.0.0",
      contentDigest: `sha256:${String(index + 1).repeat(64)}`,
      observedAt: startedAt,
      admittedAt: new Date(Date.parse(startedAt) + 1_000).toISOString(),
    },
  });
  await sessions.execute(authority, {
    type: "complete",
    commandId: `60000000-0000-4000-8000-00000000000${index}`,
    idempotencyKey: `complete-${index}`,
    operatorId,
    occurredAt: new Date(Date.parse(startedAt) + 2_000).toISOString(),
    expectedVersion: 2,
    sessionId,
  });
}

function observation(
  sessionId: string,
  evidenceReferenceId: string,
  metric: "aim" | "positioning",
  value: number,
  providerId = provider.id
) {
  return {
    id: `${sessionId}-${metric}`,
    sessionId,
    evidenceReferenceId,
    metric,
    value,
    scale: { minimum: 0, maximum: 100 },
    observedAt: "2026-07-24T09:00:00.000Z",
    semantics: {
      integrationId: "test-game",
      integrationVersion: "1.0.0",
      providerId,
      providerVersion: "1.0.0",
    },
  } as const;
}
}

void main().catch((error: unknown) => {
  console.error(error);
  process.exitCode = 1;
});
