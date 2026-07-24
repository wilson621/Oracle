import type {
  OracleSessionIntelligenceContext,
  OracleSessionIntelligenceMetric,
  OracleSessionReportDisagreement,
  OracleSessionReportEngineId,
  OracleSessionReportEngineOutput,
} from "./session-report-types";

export type OracleSessionReportEngine = Readonly<{
  id: OracleSessionReportEngineId;
  version: string;
  dependencies: readonly OracleSessionReportEngineId[];
  execute(
    context: OracleSessionIntelligenceContext,
    completed: ReadonlyMap<
      OracleSessionReportEngineId,
      OracleSessionReportEngineOutput
    >
  ): Promise<OracleSessionReportEngineOutput>;
}>;

export class OracleSessionReportEngineRegistry {
  private readonly engines = new Map<
    OracleSessionReportEngineId,
    OracleSessionReportEngine
  >();

  register(engine: OracleSessionReportEngine): void {
    if (this.engines.has(engine.id)) {
      throw new Error(`Duplicate Session Report Engine '${engine.id}'.`);
    }
    this.engines.set(engine.id, Object.freeze({ ...engine }));
  }

  getOrdered(): readonly OracleSessionReportEngine[] {
    const ordered: OracleSessionReportEngine[] = [];
    const visiting = new Set<OracleSessionReportEngineId>();
    const visited = new Set<OracleSessionReportEngineId>();
    const visit = (engine: OracleSessionReportEngine) => {
      if (visiting.has(engine.id)) {
        throw new Error("Session Report Engine dependencies are circular.");
      }
      if (visited.has(engine.id)) return;
      visiting.add(engine.id);
      for (const dependency of engine.dependencies) {
        const required = this.engines.get(dependency);
        if (!required) {
          throw new Error(
            `Session Report Engine '${engine.id}' requires '${dependency}'.`
          );
        }
        visit(required);
      }
      visiting.delete(engine.id);
      visited.add(engine.id);
      ordered.push(engine);
    };
    for (const engine of this.engines.values()) visit(engine);
    return Object.freeze(ordered);
  }
}

export function createCoreSessionReportEngineRegistry() {
  const registry = new OracleSessionReportEngineRegistry();
  registry.register(engine("behaviour", [], executeBehaviour));
  registry.register(engine("trend", ["behaviour"], executeTrend));
  registry.register(engine("prediction", ["trend"], executePrediction));
  registry.register(engine("memory", [], executeMemory));
  registry.register(engine("contextual", [], executeContextual));
  return registry;
}

export async function runSessionReportEngineRuntime(
  registry: OracleSessionReportEngineRegistry,
  context: OracleSessionIntelligenceContext
): Promise<Readonly<{
  outputs: readonly OracleSessionReportEngineOutput[];
  disagreements: readonly OracleSessionReportDisagreement[];
}>> {
  const completed = new Map<
    OracleSessionReportEngineId,
    OracleSessionReportEngineOutput
  >();
  for (const reportEngine of registry.getOrdered()) {
    try {
      const output = await reportEngine.execute(context, completed);
      completed.set(reportEngine.id, Object.freeze(output));
    } catch (error) {
      completed.set(
        reportEngine.id,
        Object.freeze({
          engineId: reportEngine.id,
          engineVersion: reportEngine.version,
          status: "failed",
          summary:
            error instanceof Error ? error.message : "Engine execution failed.",
          confidence: 0,
          evidenceReferenceIds: [],
          recommendation: null,
          reassessmentTrigger: "Retry when the failed engine becomes available.",
        })
      );
    }
  }
  const outputs = Object.freeze([...completed.values()]);
  return Object.freeze({
    outputs,
    disagreements: Object.freeze(detectDisagreements(context)),
  });
}

function engine(
  id: OracleSessionReportEngineId,
  dependencies: readonly OracleSessionReportEngineId[],
  execute: OracleSessionReportEngine["execute"]
): OracleSessionReportEngine {
  return Object.freeze({ id, version: "1.0.0", dependencies, execute });
}

async function executeBehaviour(
  context: OracleSessionIntelligenceContext
): Promise<OracleSessionReportEngineOutput> {
  const latest = context.observations.filter(
    ({ sessionId }) => sessionId === context.session.id
  );
  if (latest.length === 0) return unknown("behaviour", "No admitted performance observations are available.");
  const averages = metricAverages(latest);
  const strongest = rank(averages, "desc")[0];
  const weakest = rank(averages, "asc")[0];
  if (!strongest || !weakest) return unknown("behaviour", "Performance dimensions are incomplete.");
  const completeness = averages.size / 5;
  return output(
    "behaviour",
    completeness === 1 ? "established" : "suspected",
    `${label(strongest[0])} is the strongest observed dimension and ${label(weakest[0])} is the weakest for this Session.`,
    Math.round(completeness * 85) / 100,
    latest.map(({ evidenceReferenceId }) => evidenceReferenceId),
    `Review ${label(weakest[0])} in the next comparable Session.`,
    "Reassess after the next completed Session with comparable admitted Evidence."
  );
}

async function executeTrend(
  context: OracleSessionIntelligenceContext
): Promise<OracleSessionReportEngineOutput> {
  const sessions = [...new Set(context.observations.map(({ sessionId }) => sessionId))];
  if (sessions.length < 2) return unknown("trend", "At least two comparable Sessions are required for Trend.");
  const first = metricAverages(
    context.observations.filter(({ sessionId }) => sessionId === sessions[0])
  );
  const last = metricAverages(
    context.observations.filter(({ sessionId }) => sessionId === sessions.at(-1))
  );
  const changes = [...last].flatMap(([metric, value]) =>
    first.has(metric) ? [[metric, value - (first.get(metric) ?? value)] as const] : []
  );
  if (changes.length === 0) return unknown("trend", "Comparable metric semantics are unavailable.");
  const averageChange =
    changes.reduce((sum, [, change]) => sum + change, 0) / changes.length;
  const direction = averageChange > 2 ? "improving" : averageChange < -2 ? "declining" : "stable";
  return output(
    "trend",
    sessions.length >= 3 ? "established" : "suspected",
    `Comparable performance is ${direction} across ${sessions.length} Sessions.`,
    Math.min(0.9, 0.45 + sessions.length * 0.1),
    context.observations.map(({ evidenceReferenceId }) => evidenceReferenceId),
    direction === "declining"
      ? "Stabilise the weakest declining dimension before increasing difficulty."
      : "Continue collecting comparable Sessions to confirm the trend.",
    "Reassess when a new comparable completed Session is admitted."
  );
}

async function executePrediction(
  _context: OracleSessionIntelligenceContext,
  completed: ReadonlyMap<OracleSessionReportEngineId, OracleSessionReportEngineOutput>
): Promise<OracleSessionReportEngineOutput> {
  const trend = completed.get("trend");
  if (!trend || trend.status === "unknown" || trend.status === "failed") {
    return unknown("prediction", "Prediction is unavailable without a usable Trend.");
  }
  return output(
    "prediction",
    "suspected",
    `Near-term performance is expected to remain consistent with the bounded Trend: ${trend.summary}`,
    Math.max(0, Math.round(trend.confidence * 0.8 * 100) / 100),
    [...trend.evidenceReferenceIds],
    "Use the Trend recommendation as a provisional next step.",
    "Reassess after the next comparable Session; this is not a mature outcome forecast."
  );
}

async function executeMemory(
  context: OracleSessionIntelligenceContext
): Promise<OracleSessionReportEngineOutput> {
  const claims = context.understanding.intelligence.filter(
    ({ scope }) =>
      scope.type === "game-integration" &&
      scope.integrationId === context.session.context.integrationId &&
      scope.integrationVersion === context.session.context.integrationVersion
  );
  if (claims.length === 0) return unknown("memory", "No eligible governed Understanding applies to this Game Integration.");
  return output(
    "memory",
    "established",
    `${claims.length} eligible governed Understanding claim(s) provide longitudinal context.`,
    claims.reduce((sum, claim) => sum + claim.confidence.score, 0) / claims.length,
    claims.flatMap((claim) => claim.evidence.map(({ evidenceReferenceId }) => evidenceReferenceId)),
    "Compare this Session with the applicable governed Understanding before changing a long-term plan.",
    "Reassess when linked Understanding is contradicted, disputed, expired, superseded or deleted."
  );
}

async function executeContextual(
  context: OracleSessionIntelligenceContext
): Promise<OracleSessionReportEngineOutput> {
  const evidence = context.session.evidence.map(({ id }) => id);
  return output(
    "contextual",
    evidence.length > 0 ? "established" : "unknown",
    `The assessment is scoped to ${context.session.context.integrationId}@${context.session.context.integrationVersion} in ${context.session.context.applicationId}.`,
    evidence.length > 0 ? 1 : 0,
    evidence,
    evidence.length > 0
      ? "Keep recommendations within this Game Integration scope."
      : null,
    "Reassess if Integration identity, version or admitted Evidence changes."
  );
}

function detectDisagreements(
  context: OracleSessionIntelligenceContext
): OracleSessionReportDisagreement[] {
  const latest = context.observations.filter(
    ({ sessionId }) => sessionId === context.session.id
  );
  const byMetric = new Map<OracleSessionIntelligenceMetric, number[]>();
  for (const observation of latest) {
    const normalized =
      (observation.value - observation.scale.minimum) /
      (observation.scale.maximum - observation.scale.minimum);
    byMetric.set(observation.metric, [
      ...(byMetric.get(observation.metric) ?? []),
      normalized,
    ]);
  }
  return [...byMetric].flatMap(([metric, values]) => {
    if (values.length < 2 || Math.max(...values) - Math.min(...values) < 0.4) return [];
    return [{
      id: `disagreement-${metric}`,
      engineIds: ["behaviour", "trend"] as const,
      summary: `Admitted observations disagree materially for ${label(metric)}.`,
      resolution: "lower-confidence" as const,
    }];
  });
}

function metricAverages(observations: readonly import("./session-report-types").OracleSessionIntelligenceObservation[]) {
  const values = new Map<OracleSessionIntelligenceMetric, number[]>();
  for (const observation of observations) {
    const normalized =
      ((observation.value - observation.scale.minimum) /
        (observation.scale.maximum - observation.scale.minimum)) *
      100;
    values.set(observation.metric, [
      ...(values.get(observation.metric) ?? []),
      normalized,
    ]);
  }
  return new Map(
    [...values].map(([metric, entries]) => [
      metric,
      entries.reduce((sum, value) => sum + value, 0) / entries.length,
    ])
  );
}

function rank(
  values: ReadonlyMap<OracleSessionIntelligenceMetric, number>,
  direction: "asc" | "desc"
) {
  return [...values].sort((a, b) =>
    direction === "asc" ? a[1] - b[1] : b[1] - a[1]
  );
}

function output(
  engineId: OracleSessionReportEngineId,
  status: "established" | "suspected" | "unknown",
  summary: string,
  confidence: number,
  evidenceReferenceIds: readonly string[],
  recommendation: string | null,
  reassessmentTrigger: string
): OracleSessionReportEngineOutput {
  return Object.freeze({
    engineId,
    engineVersion: "1.0.0",
    status,
    summary,
    confidence: Math.max(0, Math.min(1, confidence)),
    evidenceReferenceIds: Object.freeze([...new Set(evidenceReferenceIds)]),
    recommendation,
    reassessmentTrigger,
  });
}

function unknown(
  engineId: OracleSessionReportEngineId,
  summary: string
): OracleSessionReportEngineOutput {
  return output(
    engineId,
    "unknown",
    summary,
    0,
    [],
    null,
    "Reassess when sufficient admitted Evidence becomes available."
  );
}

function label(metric: OracleSessionIntelligenceMetric): string {
  return metric.replaceAll("-", " ").replace(/\b\w/gu, (character) =>
    character.toUpperCase()
  );
}
