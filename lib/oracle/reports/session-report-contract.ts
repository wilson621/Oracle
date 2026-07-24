import {
  ORACLE_SESSION_REPORT_CONTRACT,
  ORACLE_SESSION_REPORT_CONTRACT_VERSION,
  type OracleSessionIntelligenceObservation,
  type OracleSessionReport,
  type OracleSessionReportEngineOutput,
} from "./session-report-types";

const ENGINE_IDS = new Set([
  "behaviour",
  "trend",
  "prediction",
  "memory",
  "contextual",
]);

export function createOracleSessionIntelligenceObservation(
  value: OracleSessionIntelligenceObservation
): OracleSessionIntelligenceObservation {
  if (
    !value.id ||
    !value.sessionId ||
    !value.evidenceReferenceId ||
    !Number.isFinite(value.value) ||
    value.scale.minimum >= value.scale.maximum ||
    value.value < value.scale.minimum ||
    value.value > value.scale.maximum ||
    !Number.isFinite(Date.parse(value.observedAt)) ||
    !value.semantics.integrationId ||
    !value.semantics.integrationVersion ||
    !value.semantics.providerId ||
    !/^\d+\.\d+\.\d+$/u.test(value.semantics.providerVersion)
  ) {
    throw new Error("Session Intelligence observation is invalid.");
  }
  return deepFreeze(structuredClone(value));
}

export function createOracleSessionReport(
  value: OracleSessionReport
): OracleSessionReport {
  if (
    value.contract !== ORACLE_SESSION_REPORT_CONTRACT ||
    value.contractVersion !== ORACLE_SESSION_REPORT_CONTRACT_VERSION ||
    !value.id ||
    !value.operatorId ||
    !value.sessionId ||
    !Number.isInteger(value.revision) ||
    value.revision < 1 ||
    !/^[a-f0-9]{64}$/u.test(value.inputFingerprint) ||
    !Number.isFinite(Date.parse(value.generatedAt))
  ) {
    throw new Error("Oracle Session Report identity is invalid.");
  }
  assertConfidence(value.assessment.confidence, "assessment");
  assertConfidence(value.recommendation.confidence, "recommendation");
  if (
    value.engines.length !== 5 ||
    new Set(value.engines.map(({ engineId }) => engineId)).size !== 5
  ) {
    throw new Error("Oracle Session Report requires exactly one output per engine.");
  }
  for (const engine of value.engines) assertEngine(engine);
  assertUnique(value.evidenceReferenceIds, "report Evidence");
  assertUnique(value.understandingClaimIds, "report Understanding");
  if (
    value.recommendation.evidenceReferenceIds.some(
      (id) => !value.evidenceReferenceIds.includes(id)
    )
  ) {
    throw new Error("Report recommendation references unadmitted Evidence.");
  }
  if (
    value.assessment.epistemic === "inferred" &&
    value.evidenceReferenceIds.length === 0
  ) {
    throw new Error("Inferred Session assessment requires Evidence.");
  }
  if (
    value.status === "complete" &&
    (value.engines.some(({ status }) => status === "failed") ||
      value.model.status === "unavailable" ||
      value.model.status === "invalid")
  ) {
    throw new Error("Provider or engine failure must produce a degraded report.");
  }
  return deepFreeze(structuredClone(value));
}

export function createStructuredSessionReportModelOutput(value: unknown) {
  if (typeof value !== "object" || value === null || Array.isArray(value)) {
    throw new Error("Model output must be a structured object.");
  }
  const record = value as Record<string, unknown>;
  const keys = Object.keys(record).sort();
  if (
    JSON.stringify(keys) !==
      JSON.stringify(["caveat", "evidenceReferenceIds", "narrative"]) ||
    typeof record.narrative !== "string" ||
    record.narrative.length < 1 ||
    record.narrative.length > 500 ||
    (record.caveat !== null && typeof record.caveat !== "string") ||
    !Array.isArray(record.evidenceReferenceIds) ||
    !record.evidenceReferenceIds.every((id) => typeof id === "string")
  ) {
    throw new Error("Model output does not match the Session Report schema.");
  }
  return deepFreeze({
    narrative: record.narrative,
    caveat: record.caveat as string | null,
    evidenceReferenceIds: record.evidenceReferenceIds as string[],
  });
}

function assertEngine(engine: OracleSessionReportEngineOutput): void {
  if (
    !ENGINE_IDS.has(engine.engineId) ||
    !/^\d+\.\d+\.\d+$/u.test(engine.engineVersion) ||
    !engine.summary ||
    !engine.reassessmentTrigger
  ) {
    throw new Error("Oracle Session Report engine output is invalid.");
  }
  assertConfidence(engine.confidence, engine.engineId);
  assertUnique(engine.evidenceReferenceIds, `${engine.engineId} Evidence`);
  if (engine.status === "established" && engine.evidenceReferenceIds.length === 0) {
    throw new Error("Established engine output requires Evidence.");
  }
}

function assertConfidence(value: number, path: string): void {
  if (!Number.isFinite(value) || value < 0 || value > 1) {
    throw new Error(`Oracle Session Report ${path} confidence is invalid.`);
  }
}

function assertUnique(values: readonly string[], path: string): void {
  if (new Set(values).size !== values.length) {
    throw new Error(`${path} contains duplicate identities.`);
  }
}

function deepFreeze<Value>(value: Value): Value {
  if (value && typeof value === "object") {
    Object.freeze(value);
    for (const nested of Object.values(value)) deepFreeze(nested);
  }
  return value;
}
