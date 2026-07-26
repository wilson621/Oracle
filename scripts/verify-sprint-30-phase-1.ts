import assert from "node:assert/strict";
import {
  LocalTransientOperationalDiagnosticSink,
  OracleOperationalDiagnosticsService,
  requireOperationalDiagnosticDefinitions,
  type OracleOperationalDiagnosticDefinition,
} from "../lib/oracle/platform/operational-diagnostics/index.js";

const definitions: readonly OracleOperationalDiagnosticDefinition[] = [
  {
    code: "platform.startup.completed",
    subsystem: "platform",
    severity: "info",
    summary: "Oracle Platform startup completed.",
    allowedAttributes: ["durationMs", "runtimeTarget"],
  },
  {
    code: "platform.startup.failed",
    subsystem: "platform",
    severity: "error",
    summary: "Oracle Platform startup failed.",
    allowedAttributes: ["failureClass", "runtimeTarget"],
  },
];

const sink = new LocalTransientOperationalDiagnosticSink(2);
const service = new OracleOperationalDiagnosticsService({
  mode: "local-certification",
  definitions,
  sink,
  now: () => "2026-07-26T08:00:00.000Z",
  createId: () => "diagnostic-0001",
});

const admitted = service.report({
  code: "platform.startup.completed",
  correlationId: "diagnostic-correlation-startup-0001",
  attributes: {
    durationMs: 275,
    runtimeTarget: "electron",
  },
});
assert.equal(admitted.accepted, true);
if (!admitted.accepted) {
  throw new Error("Expected an admitted operational diagnostic.");
}
assert.equal(admitted.envelope.purpose, "software-support");
assert.equal(admitted.envelope.authority, "non-authoritative");
assert.equal(admitted.envelope.summary, "Oracle Platform startup completed.");
assert.equal(Object.isFrozen(admitted.envelope), true);
assert.equal(Object.isFrozen(admitted.envelope.attributes), true);

assert.deepEqual(
  service.report({
    code: "operator-intelligence.created",
  }),
  {
    accepted: false,
    reason: "unknown-code",
  }
);
assert.deepEqual(
  service.report({
    code: "platform.startup.completed",
    attributes: {
      operatorId: "operator-1",
    },
  }),
  {
    accepted: false,
    reason: "prohibited-attribute",
  }
);
assert.deepEqual(
  service.report({
    code: "platform.startup.failed",
    attributes: {
      failureClass: "password=do-not-admit",
    },
  }),
  {
    accepted: false,
    reason: "unsafe-attribute-value",
  }
);
assert.deepEqual(
  service.report({
    code: "platform.startup.completed",
    correlationId: "session-0001",
  }),
  {
    accepted: false,
    reason: "invalid-correlation-id",
  }
);
assert.deepEqual(
  service.report({
    code: "platform.startup.completed",
    attributes: {
      unexpectedValue: true,
    },
  }),
  {
    accepted: false,
    reason: "undeclared-attribute",
  }
);

assert.throws(() =>
  requireOperationalDiagnosticDefinitions([
    {
      code: "unsafe.definition",
      subsystem: "platform",
      severity: "warning",
      summary: "Unsafe definition.",
      allowedAttributes: ["sessionId"],
    },
  ])
);
assert.throws(() =>
  requireOperationalDiagnosticDefinitions([
    {
      code: "unsafe.summary",
      subsystem: "platform",
      severity: "warning",
      summary: "token=do-not-register",
      allowedAttributes: [],
    },
  ])
);

const invalidId = new OracleOperationalDiagnosticsService({
  mode: "local-certification",
  definitions,
  sink: new LocalTransientOperationalDiagnosticSink(),
  createId: () => "session-0001",
});
assert.deepEqual(
  invalidId.report({
    code: "platform.startup.completed",
  }),
  {
    accepted: false,
    reason: "invalid-diagnostic-id",
  }
);

const disabled = new OracleOperationalDiagnosticsService({
  mode: "disabled",
  definitions,
  sink: null,
});
assert.deepEqual(
  disabled.report({
    code: "platform.startup.completed",
  }),
  {
    accepted: false,
    reason: "diagnostics-disabled",
  }
);

service.report({
  code: "platform.startup.failed",
  attributes: {
    failureClass: "configuration-unavailable",
    runtimeTarget: "web",
  },
});
service.report({
  code: "platform.startup.completed",
  attributes: {
    durationMs: 190,
    runtimeTarget: "web",
  },
});
assert.equal(sink.getSnapshot().length, 2);
assert.equal(sink.getSnapshot()[0]?.code, "platform.startup.failed");

const metricsBeforeStop = service.getMetrics();
assert.equal(metricsBeforeStop.attempts, 8);
assert.equal(metricsBeforeStop.admitted, 3);
assert.equal(metricsBeforeStop.rejected, 5);
assert.equal(metricsBeforeStop.sinkFailures, 0);

service.stop();
assert.equal(sink.getSnapshot().length, 0);
assert.deepEqual(
  service.report({
    code: "platform.startup.completed",
  }),
  {
    accepted: false,
    reason: "diagnostics-stopped",
  }
);

console.log(
  "Sprint 30 Phase 1 operational diagnostic admission, minimisation, separation, ephemerality and fail-closed controls verified."
);
