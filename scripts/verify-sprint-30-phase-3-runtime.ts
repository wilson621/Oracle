import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";
import { OracleExtensionRuntime } from "../lib/companion/extensions/extension-runtime.js";
import { createCoreOraclePlatformComposition } from "../lib/oracle/composition/core-platform-composition.js";
import { ORACLE_WEB_COMPOSITION_MANIFEST } from "../lib/oracle/composition/web-composition-root.js";
import {
  createOracleRuntimeCompositionManifest,
  type OraclePlatformComposition,
} from "../lib/oracle/platform/platform-composition.js";
import { OraclePlatformCompositionRoot } from "../lib/oracle/platform/platform-composition-root.js";
import {
  createOraclePlatformHealthSnapshot,
  isOraclePlatformHealthSnapshot,
} from "../lib/oracle/platform/platform-health.js";
import { OraclePlatformRuntime } from "../lib/oracle/platform/platform-runtime.js";
import {
  LocalTransientOperationalDiagnosticSink,
  OracleOperationalDiagnosticsService,
  ORACLE_RUNTIME_OPERATIONAL_DIAGNOSTIC_DEFINITIONS,
  createOracleOperationalDiagnosticsDeclaration,
  createOracleOperationalDiagnosticsService,
  type OracleOperationalDiagnosticSink,
} from "../lib/oracle/platform/operational-diagnostics/index.js";
import { ORACLE_ELECTRON_COMPOSITION_MANIFEST } from "../desktop/platform/desktop-composition-root.js";

const evidencePath =
  "docs/sprints/evidence/sprint-30/phase-3/generated/runtime-reliability.json";

verifyCanonicalDisabledTargets();
verifyLocalRuntimeDiagnostics();
verifyFailureIsolation();
verifyDeliveryDegradation();
verifyFreshRecoveryAndEphemerality();
verifyBoundedSoak();
writeEvidence();

console.log(
  "Sprint 30 Phase 3 runtime diagnostics, failure isolation and fresh recovery qualification passed."
);

function verifyCanonicalDisabledTargets(): void {
  for (const manifest of [
    ORACLE_WEB_COMPOSITION_MANIFEST,
    ORACLE_ELECTRON_COMPOSITION_MANIFEST,
  ]) {
    assert.equal(manifest.manifestVersion, "1.7.0");
    assert.equal(manifest.operationalDiagnostics.mode, "disabled");
    assert.equal(manifest.operationalDiagnostics.transport, "none");
    const runtime = new OraclePlatformRuntime(
      createCoreOraclePlatformComposition(
        manifest,
        createOracleOperationalDiagnosticsService(
          manifest.operationalDiagnostics
        )
      )
    );
    const state = runtime.start();
    assert.equal(state.status, "ready");
    assert.equal(state.operationalDiagnostics.status, "disabled");
    assert.equal(
      state.subsystems.find(
        ({ id }) => id === "operational-diagnostics"
      )?.status,
      "ready"
    );
    const health = createOraclePlatformHealthSnapshot(state, 1);
    assert.equal(isOraclePlatformHealthSnapshot(health), true);
    assert.equal(health.operationalDiagnostics.authority, "non-authoritative");
    assert.equal(health.operationalDiagnostics.retention, "none");
    assert.equal(health.operationalDiagnostics.transport, "none");
  }
}

function verifyLocalRuntimeDiagnostics(): void {
  const { runtime, sink } = createLocalRuntime();
  const state = runtime.start();
  assert.equal(state.status, "ready");
  assert.equal(state.operationalDiagnostics.status, "ready");
  assert.equal(state.operationalDiagnostics.metrics.admitted, 1);
  const envelopes = sink.getSnapshot();
  assert.equal(envelopes.length, 1);
  assert.equal(envelopes[0]?.code, "platform.runtime.started");
  assert.equal(envelopes[0]?.purpose, "software-support");
  assert.equal(envelopes[0]?.authority, "non-authoritative");
  assert.equal(envelopes[0]?.attributes.runtimeTarget, "web");
  assert.equal(Object.isFrozen(envelopes[0]), true);

  const health = createOraclePlatformHealthSnapshot(state, 1);
  const serialized = JSON.stringify(health);
  assert.doesNotMatch(
    serialized,
    /diagnosticId|correlationId|failureClass|operatorId|sessionId/iu
  );
  assert.equal(health.operationalDiagnostics.metrics.admitted, 1);

  const stopped = runtime.stop();
  assert.equal(stopped.operationalDiagnostics.status, "stopped");
  assert.equal(sink.getSnapshot().length, 0);
}

function verifyFailureIsolation(): void {
  const optional = createLocalRuntime();
  const failingExtensions = new OracleExtensionRuntime();
  failingExtensions.getStates = () => {
    throw new Error("optional extension password=must-not-enter-envelope");
  };
  const optionalState = new OraclePlatformRuntime(
    Object.freeze({
      ...optional.runtime.getComposition(),
      extensions: failingExtensions,
    })
  ).start();
  assert.equal(optionalState.status, "degraded");
  assert.equal(
    optionalState.subsystems.find(({ id }) => id === "extensions")?.status,
    "failed"
  );
  assert.equal(
    optional.sink
      .getSnapshot()
      .some(({ code }) => code === "platform.runtime.failed"),
    true
  );
  assert.doesNotMatch(
    JSON.stringify(optional.sink.getSnapshot()),
    /must-not-enter-envelope/u
  );

  const required = createLocalRuntime();
  const failingGuidance: OraclePlatformComposition["guidance"] = {
    getProviderManifests() {
      throw new Error("required guidance secret=must-not-enter-envelope");
    },
  };
  const requiredState = new OraclePlatformRuntime(
    Object.freeze({
      ...required.runtime.getComposition(),
      guidance: failingGuidance,
    })
  ).start();
  assert.equal(requiredState.status, "failed");
  assert.equal(
    requiredState.subsystems.find(({ id }) => id === "guidance")?.status,
    "failed"
  );
  assert.doesNotMatch(
    JSON.stringify(required.sink.getSnapshot()),
    /must-not-enter-envelope/u
  );
}

function verifyDeliveryDegradation(): void {
  const declaration =
    createOracleOperationalDiagnosticsDeclaration("local-certification");
  const failingSink: OracleOperationalDiagnosticSink = {
    classification: "local-transient",
    write() {
      throw new Error("isolated local sink failure");
    },
    clear() {},
  };
  const service = new OracleOperationalDiagnosticsService({
    mode: "local-certification",
    definitions: ORACLE_RUNTIME_OPERATIONAL_DIAGNOSTIC_DEFINITIONS,
    sink: failingSink,
  });
  const manifest = createLocalManifest();
  assert.deepEqual(service.getDeclaration(), declaration);
  const runtime = new OraclePlatformRuntime(
    createCoreOraclePlatformComposition(manifest, service)
  );
  const state = runtime.start();
  assert.equal(state.status, "degraded");
  assert.equal(state.operationalDiagnostics.status, "degraded");
  assert.equal(state.operationalDiagnostics.metrics.sinkFailures, 1);
  assert.equal(state.operationalDiagnostics.authority, "non-authoritative");
}

function verifyFreshRecoveryAndEphemerality(): void {
  const services: OracleOperationalDiagnosticsService[] = [];
  const sinks: LocalTransientOperationalDiagnosticSink[] = [];
  let compositionAttempt = 0;
  const root = new OraclePlatformCompositionRoot(() => {
    compositionAttempt += 1;
    const sink = new LocalTransientOperationalDiagnosticSink(20);
    const service = new OracleOperationalDiagnosticsService({
      mode: "local-certification",
      definitions: ORACLE_RUNTIME_OPERATIONAL_DIAGNOSTIC_DEFINITIONS,
      sink,
    });
    sinks.push(sink);
    services.push(service);
    const composition = createCoreOraclePlatformComposition(
      createLocalManifest(),
      service
    );
    if (compositionAttempt === 1) {
      return Object.freeze({
        ...composition,
        guidance: {
          getProviderManifests() {
            throw new Error("synthetic first-attempt failure");
          },
        },
      });
    }
    return composition;
  });

  const failed = root.start();
  assert.equal(failed.status, "failed");
  assert.ok(sinks[0]!.getSnapshot().length > 0);
  const recovered = root.recover();
  assert.equal(recovered.status, "ready");
  assert.equal(recovered.attempt, 2);
  assert.notEqual(services[0], services[1]);
  assert.notEqual(sinks[0], sinks[1]);
  assert.equal(sinks[0]!.getSnapshot().length, 0);
  assert.deepEqual(
    sinks[1]!.getSnapshot().map(({ code }) => code),
    [
      "platform.runtime.recovery-started",
      "platform.runtime.started",
      "platform.runtime.recovery-completed",
    ]
  );
  assert.equal(recovered.operationalDiagnostics.metrics.admitted, 3);
}

function verifyBoundedSoak(): void {
  const sink = new LocalTransientOperationalDiagnosticSink(25);
  let id = 0;
  const service = new OracleOperationalDiagnosticsService({
    mode: "local-certification",
    definitions: ORACLE_RUNTIME_OPERATIONAL_DIAGNOSTIC_DEFINITIONS,
    sink,
    createId: () => `diagnostic-soak-${++id}`,
  });
  for (let attempt = 1; attempt <= 500; attempt += 1) {
    const admitted = service.report({
      code: "platform.runtime.started",
      attributes: { runtimeTarget: "web" },
    });
    assert.equal(admitted.accepted, true);
  }
  assert.equal(service.getMetrics().admitted, 500);
  assert.equal(sink.getSnapshot().length, 25);
  assert.equal(sink.getSnapshot()[0]?.diagnosticId, "diagnostic-soak-476");
  service.stop();
  assert.equal(sink.getSnapshot().length, 0);
}

function createLocalRuntime(): Readonly<{
  runtime: OraclePlatformRuntime;
  sink: LocalTransientOperationalDiagnosticSink;
}> {
  const sink = new LocalTransientOperationalDiagnosticSink(20);
  const service = new OracleOperationalDiagnosticsService({
    mode: "local-certification",
    definitions: ORACLE_RUNTIME_OPERATIONAL_DIAGNOSTIC_DEFINITIONS,
    sink,
  });
  return {
    runtime: new OraclePlatformRuntime(
      createCoreOraclePlatformComposition(createLocalManifest(), service)
    ),
    sink,
  };
}

function createLocalManifest() {
  return createOracleRuntimeCompositionManifest({
    ...ORACLE_WEB_COMPOSITION_MANIFEST,
    operationalDiagnostics:
      createOracleOperationalDiagnosticsDeclaration("local-certification"),
  });
}

function writeEvidence(): void {
  fs.mkdirSync(path.dirname(evidencePath), { recursive: true });
  fs.writeFileSync(
    evidencePath,
    `${JSON.stringify({
      schemaVersion: 1,
      verifiedAt: new Date().toISOString(),
      result: "passed",
      runtimeManifestVersion: "1.7.0",
      canonicalTargets: {
        web: "diagnostics-disabled",
        electron: "diagnostics-disabled",
      },
      localCertification: {
        transport: "bounded-process-memory",
        retention: "none",
        upload: false,
        externalProvider: false,
        rendererProjection: "metrics-only",
      },
      smoke: "passed",
      boundedSoakAdmissions: 500,
      boundedSoakRetained: 25,
      optionalFailureIsolation: "passed-degraded",
      requiredFailureIsolation: "passed-failed-closed",
      sinkFailureIsolation: "passed-observable-degraded",
      crashEnvelope: "passed-minimised-non-authoritative",
      freshRecovery: "passed-new-runtime-new-diagnostics-instance",
      teardown: "passed-transient-state-cleared",
      incidentResponseExercise:
        "passed-detect-fail-closed-clear-reconstruct-recover",
      productionDiagnostics: false,
      runtimePersistence: false,
      deployment: false,
    }, null, 2)}\n`
  );
}
