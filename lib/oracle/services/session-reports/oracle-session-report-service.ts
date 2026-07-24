import { createHash } from "node:crypto";
import type { OracleSessionReportRepository } from "../../repositories/session-report-repository";
import {
  ORACLE_SESSION_REPORT_CONTRACT,
  ORACLE_SESSION_REPORT_CONTRACT_VERSION,
  OracleSessionReportEngineRegistry,
  createOracleSessionIntelligenceObservation,
  createOracleSessionReport,
  createStructuredSessionReportModelOutput,
  runSessionReportEngineRuntime,
  type OracleSessionIntelligenceObservation,
  type OracleSessionIntelligenceProvider,
  type OracleSessionReport,
  type OracleSessionReportComparison,
  type OracleSessionReportEngineOutput,
  type OracleSessionReportModelProvider,
} from "../../reports";
import type { OperatorUnderstandingService } from "../operator-understanding";
import {
  type AuthenticatedOracleSessionAuthority,
  OracleSessionService,
} from "../sessions";

export class OracleSessionIntelligenceProviderRegistry {
  private readonly providers = new Map<string, OracleSessionIntelligenceProvider>();

  register(provider: OracleSessionIntelligenceProvider): void {
    if (
      !provider.id ||
      !provider.integrationId ||
      !/^\d+\.\d+\.\d+$/u.test(provider.version)
    ) {
      throw new Error("Session Intelligence provider identity is invalid.");
    }
    if (this.providers.has(provider.integrationId)) {
      throw new Error(
        `Duplicate Session Intelligence provider for '${provider.integrationId}'.`
      );
    }
    this.providers.set(provider.integrationId, Object.freeze({ ...provider }));
  }

  require(integrationId: string): OracleSessionIntelligenceProvider {
    const provider = this.providers.get(integrationId);
    if (!provider) {
      throw new Error(
        `No Session Intelligence provider owns '${integrationId}' semantics.`
      );
    }
    return provider;
  }
}

export type GenerateOracleSessionReportRequest = Readonly<{
  authority: AuthenticatedOracleSessionAuthority;
  sessionId: string;
  purpose: string;
  asOf: string;
  requestModelEnrichment: boolean;
}>;

export class OracleSessionReportService {
  constructor(
    private readonly sessions: OracleSessionService,
    private readonly understanding: OperatorUnderstandingService,
    private readonly providers: OracleSessionIntelligenceProviderRegistry,
    private readonly engines: OracleSessionReportEngineRegistry,
    private readonly repository: OracleSessionReportRepository,
    private readonly modelProvider: OracleSessionReportModelProvider | null
  ) {}

  async generate(
    request: GenerateOracleSessionReportRequest
  ): Promise<OracleSessionReport> {
    if (!Number.isFinite(Date.parse(request.asOf)) || !request.purpose.trim()) {
      throw new Error("Session Report purpose and asOf are required.");
    }
    const session = await this.sessions.getCompletedSession(
      request.authority,
      request.sessionId
    );
    if (!session) throw new Error("Oracle Session does not exist.");

    const history = [
      ...(
      await this.sessions.listCompletedSessions(request.authority, {
        integrationId: session.context.integrationId,
        pageSize: 100,
      })
      ),
    ].sort(
      (left, right) =>
        left.startedAt.localeCompare(right.startedAt) ||
        left.id.localeCompare(right.id)
    );
    const understanding = await this.understanding.getCurrentSnapshot({
      purpose: request.purpose,
      asOf: request.asOf,
      applicationId: session.context.applicationId,
      gameIntegration: {
        id: session.context.integrationId,
        version: session.context.integrationVersion,
      },
    });
    if (understanding.operatorId !== request.authority.operatorId) {
      throw new Error("Session Report crossed authenticated Operator ownership.");
    }

    const provider = this.providers.require(session.context.integrationId);
    const observations = validateObservations(
      await provider.resolve(history),
      provider,
      history,
      request.authority.operatorId
    );
    const runtime = await runSessionReportEngineRuntime(this.engines, {
      session,
      history,
      understanding,
      observations,
      assembledAt: request.asOf,
    });
    const fingerprint = digest({
      session: { id: session.id, version: session.version },
      history: history.map(({ id, version }) => ({ id, version })),
      observations,
      understanding: understanding.intelligence.map(
        ({ id, revision, status }) => ({ id, revision, status })
      ),
      provider: { id: provider.id, version: provider.version },
      engines: runtime.outputs.map(({ engineId, engineVersion }) => ({
        engineId,
        engineVersion,
      })),
      model: request.requestModelEnrichment
        ? {
            providerId: this.modelProvider?.id ?? null,
            modelId: this.modelProvider?.modelId ?? null,
          }
        : null,
    });
    const replay = await this.repository.findByFingerprint(
      request.authority.operatorId,
      session.id,
      fingerprint
    );
    if (replay) return replay;

    const previous = await this.repository.list(
      request.authority.operatorId,
      session.id,
      100
    );
    const selected = selectConclusion(runtime.outputs);
    const disagreementPenalty = Math.min(0.5, runtime.disagreements.length * 0.15);
    const confidence = round(
      Math.max(0, selected.confidence - disagreementPenalty)
    );
    const evidenceReferenceIds = unique(
      runtime.outputs.flatMap(({ evidenceReferenceIds }) => evidenceReferenceIds)
    );
    const model = await enrichModel(
      request.requestModelEnrichment,
      this.modelProvider,
      selected.summary,
      selected.recommendation ??
        "Collect more admitted Evidence before changing the coaching plan.",
      evidenceReferenceIds
    );
    const degraded =
      runtime.outputs.some(({ status }) => status === "failed") ||
      model.status === "invalid" ||
      model.status === "unavailable";
    const report = createOracleSessionReport({
      contract: ORACLE_SESSION_REPORT_CONTRACT,
      contractVersion: ORACLE_SESSION_REPORT_CONTRACT_VERSION,
      id: digest({ operatorId: session.operatorId, sessionId: session.id, fingerprint }),
      operatorId: session.operatorId,
      sessionId: session.id,
      revision: Math.max(0, ...previous.map(({ revision }) => revision)) + 1,
      status: degraded ? "degraded" : "complete",
      generatedAt: request.asOf,
      inputFingerprint: fingerprint,
      assessment: {
        epistemic:
          selected.status === "established"
            ? "inferred"
            : selected.status === "suspected"
              ? "suspected"
              : "unknown",
        summary: selected.summary,
        confidence,
      },
      recommendation: {
        summary:
          selected.recommendation ??
          "Collect more admitted Evidence before changing the coaching plan.",
        confidence,
        evidenceReferenceIds: unique(selected.evidenceReferenceIds),
        reassessmentTrigger: selected.reassessmentTrigger,
      },
      engines: runtime.outputs,
      disagreements: runtime.disagreements,
      evidenceReferenceIds,
      understandingClaimIds: unique(
        understanding.intelligence.map(({ claimId }) => claimId)
      ),
      model,
    });
    return this.repository.save(report);
  }

  list(
    authority: AuthenticatedOracleSessionAuthority,
    sessionId: string | null,
    pageSize = 20
  ) {
    return this.repository.list(authority.operatorId, sessionId, pageSize);
  }

  async compare(
    authority: AuthenticatedOracleSessionAuthority,
    earlierReportId: string,
    laterReportId: string,
    generatedAt: string
  ): Promise<OracleSessionReportComparison> {
    const [earlier, later] = await Promise.all([
      this.repository.findById(authority.operatorId, earlierReportId),
      this.repository.findById(authority.operatorId, laterReportId),
    ]);
    if (!earlier || !later) throw new Error("Session Report comparison target is unavailable.");
    return Object.freeze({
      contract: "oracle.session-intelligence-report-comparison",
      contractVersion: 1,
      operatorId: authority.operatorId,
      earlierReportId,
      laterReportId,
      confidenceChange: round(
        later.assessment.confidence - earlier.assessment.confidence
      ),
      assessmentChanged: earlier.assessment.summary !== later.assessment.summary,
      recommendationChanged:
        earlier.recommendation.summary !== later.recommendation.summary,
      generatedAt,
    });
  }
}

function validateObservations(
  values: readonly OracleSessionIntelligenceObservation[],
  provider: OracleSessionIntelligenceProvider,
  sessions: readonly import("../../sessions").OracleSession[],
  operatorId: string
): readonly OracleSessionIntelligenceObservation[] {
  const admitted = new Map(
    sessions.flatMap((session) =>
      session.evidence.map((evidence) => [
        `${session.id}|${evidence.id}`,
        { session, evidence },
      ] as const)
    )
  );
  const observationIds = new Set<string>();
  return Object.freeze(
    values.map((value) => {
      const observation = createOracleSessionIntelligenceObservation(value);
      if (observationIds.has(observation.id)) {
        throw new Error("Session Intelligence observation identity is duplicated.");
      }
      observationIds.add(observation.id);
      const admission = admitted.get(
        `${observation.sessionId}|${observation.evidenceReferenceId}`
      );
      if (
        !admission ||
        admission.session.operatorId !== operatorId ||
        observation.semantics.providerId !== provider.id ||
        observation.semantics.providerVersion !== provider.version ||
        observation.semantics.integrationId !== provider.integrationId ||
        observation.semantics.integrationVersion !==
          admission.session.context.integrationVersion
      ) {
        throw new Error(
          "Session Intelligence observation is outside admitted Evidence or provider semantics."
        );
      }
      return observation;
    })
  );
}

function selectConclusion(
  outputs: readonly OracleSessionReportEngineOutput[]
): OracleSessionReportEngineOutput {
  const priority = ["behaviour", "trend", "memory", "prediction", "contextual"];
  return (
    priority
      .map((engineId) => outputs.find((output) => output.engineId === engineId))
      .find(
        (output) =>
          output && output.status !== "unknown" && output.status !== "failed"
      ) ??
    outputs.find(({ status }) => status === "unknown") ??
    outputs[0]!
  );
}

async function enrichModel(
  requested: boolean,
  provider: OracleSessionReportModelProvider | null,
  assessment: string,
  recommendation: string,
  evidenceReferenceIds: readonly string[]
) {
  if (!requested || !provider) {
    return Object.freeze({
      status: "not-requested" as const,
      providerId: null,
      modelId: null,
      narrative: null,
      caveat: null,
    });
  }
  try {
    const output = createStructuredSessionReportModelOutput(
      await provider.enrich({ assessment, recommendation, evidenceReferenceIds })
    );
    if (
      output.evidenceReferenceIds.some(
        (id) => !evidenceReferenceIds.includes(id)
      )
    ) {
      throw new Error("Model output referenced unadmitted Evidence.");
    }
    return Object.freeze({
      status: "enriched" as const,
      providerId: provider.id,
      modelId: provider.modelId,
      narrative: output.narrative,
      caveat: output.caveat,
    });
  } catch (error) {
    const invalid =
      error instanceof Error &&
      (error.message.includes("schema") ||
        error.message.includes("unadmitted Evidence"));
    return Object.freeze({
      status: invalid ? ("invalid" as const) : ("unavailable" as const),
      providerId: provider.id,
      modelId: provider.modelId,
      narrative: null,
      caveat: null,
    });
  }
}

function digest(value: unknown): string {
  return createHash("sha256").update(JSON.stringify(value)).digest("hex");
}

function unique(values: readonly string[]): readonly string[] {
  return Object.freeze([...new Set(values)]);
}

function round(value: number): number {
  return Math.round(value * 100) / 100;
}
