import {
  ORACLE_CONVERSATION_CONTRACT,
  ORACLE_CONVERSATION_CONTRACT_VERSION,
  ORACLE_CONVERSATION_PROMPT_VERSION,
  classifyOracleConversationIntent,
  sourcesForConversationIntent,
  type OracleConversationEvidence,
  type OracleConversationEvidencePacket,
  type OracleConversationModelProvider,
  type OracleConversationRequest,
  type OracleConversationResponse,
  type OracleConversationRetrievalGateway,
} from "../../conversation";

export class OracleConversationService {
  constructor(
    private readonly retrieval: OracleConversationRetrievalGateway,
    private readonly modelProvider: OracleConversationModelProvider | null
  ) {}

  async answer(
    request: OracleConversationRequest
  ): Promise<OracleConversationResponse> {
    validateRequest(request);
    const intent = classifyOracleConversationIntent(request.text);
    if (intent === "prohibited") {
      return response(request, intent, "refused",
        "Oracle can explain authoritative records, but cannot perform or disguise an authoritative mutation through conversation.",
        [], ["Conversational mutation authority is prohibited."], "not-requested");
    }
    if (intent === "clarification") {
      return response(request, intent, "clarification",
        "Ask about a Session, trend, coaching focus, Mission, plan, progression, or reviewed game knowledge.",
        [], ["No allowlisted factual intent was identified."], "not-requested");
    }

    const sources = sourcesForConversationIntent(intent);
    const evidence = Object.freeze((
      await this.retrieval.retrieve({
        authority: request.authority,
        requestId: request.requestId,
        purpose: request.purpose,
        intent,
        sources,
        asOf: request.asOf,
      })
    ).map(minimiseRetrievedEvidence));
    validateEvidence(request, sources, evidence);
    const fresh = evidence.filter((item) =>
      item.validUntil === null || item.validUntil >= request.asOf
    );
    const staleIds = evidence
      .filter((item) => !fresh.includes(item))
      .map(({ id }) => id);
    if (fresh.length === 0) {
      return response(request, intent, "clarification",
        "Oracle does not have sufficiently fresh authoritative evidence to answer that yet.",
        evidence, ["All available evidence is stale or no evidence was available."],
        "not-requested", staleIds);
    }

    const deterministic = deterministicAnswer(intent, fresh);
    if (!request.requestModelSynthesis || !this.modelProvider) {
      return response(request, intent, "answered", deterministic, fresh, [],
        "not-requested", staleIds);
    }
    const packet = createPacket(request, intent, fresh);
    try {
      const output = await this.modelProvider.synthesize({
        instructionContract: "oracle.conversation-model-instruction",
        instructionVersion: ORACLE_CONVERSATION_PROMPT_VERSION,
        untrustedUserData: request.text,
        evidencePacket: packet,
        allowedEvidenceIds: Object.freeze(fresh.map(({ id }) => id)),
      });
      if (
        !output.answer.trim() ||
        output.evidenceIds.some((id) => !fresh.some((item) => item.id === id))
      ) {
        return response(request, intent, "degraded", deterministic, fresh,
          ["Model synthesis failed evidence-reference closure; deterministic answer used."],
          "invalid", staleIds, this.modelProvider);
      }
      return response(request, intent, "answered", output.answer, fresh, [],
        "enriched", staleIds, this.modelProvider);
    } catch {
      return response(request, intent, "degraded", deterministic, fresh,
        ["Model provider was unavailable; deterministic answer used."],
        "unavailable", staleIds, this.modelProvider);
    }
  }
}

function validateRequest(request: OracleConversationRequest): void {
  if (
    !request.requestId.trim() ||
    !request.authority.operatorId.trim() ||
    !request.text.trim() ||
    request.text.length > 2_000 ||
    !Number.isFinite(Date.parse(request.asOf)) ||
    !Number.isFinite(Date.parse(request.authority.authenticatedAt)) ||
    request.purpose !== "operator-question"
  ) {
    throw new Error("Conversation request is invalid.");
  }
}

function validateEvidence(
  request: OracleConversationRequest,
  sources: readonly string[],
  evidence: readonly OracleConversationEvidence[]
): void {
  const ids = new Set<string>();
  for (const item of evidence) {
    if (
      ids.has(item.id) ||
      item.operatorId !== request.authority.operatorId ||
      !sources.includes(item.source) ||
      !item.id ||
      !item.sourceRecordId ||
      !item.summary.trim() ||
      item.confidence < 0 ||
      item.confidence > 1 ||
      !Number.isFinite(Date.parse(item.observedAt)) ||
      (item.validUntil !== null &&
        !Number.isFinite(Date.parse(item.validUntil)))
    ) {
      throw new Error("Conversation retrieval crossed its governed boundary.");
    }
    ids.add(item.id);
  }
}

function createPacket(
  request: OracleConversationRequest,
  intent: Exclude<ReturnType<typeof classifyOracleConversationIntent>, "clarification" | "prohibited">,
  evidence: readonly OracleConversationEvidence[]
): OracleConversationEvidencePacket {
  return Object.freeze({
    contract: "oracle.conversation-evidence-packet",
    contractVersion: 1,
    requestId: request.requestId,
    purpose: request.purpose,
    intent,
    assembledAt: request.asOf,
    evidence: Object.freeze(evidence.map((item) => Object.freeze({
      id: item.id,
      source: item.source,
      sourceRecordId: item.sourceRecordId,
      summary: item.summary,
      confidence: item.confidence,
      observedAt: item.observedAt,
      validUntil: item.validUntil,
      scope: item.scope,
      provenance: Object.freeze([...item.provenance]),
    }))),
  });
}

function minimiseRetrievedEvidence(
  item: OracleConversationEvidence
): OracleConversationEvidence {
  return Object.freeze({
    id: item.id,
    operatorId: item.operatorId,
    source: item.source,
    sourceRecordId: item.sourceRecordId,
    summary: item.summary,
    confidence: item.confidence,
    observedAt: item.observedAt,
    validUntil: item.validUntil,
    scope: item.scope,
    provenance: Object.freeze([...item.provenance]),
  });
}

function deterministicAnswer(
  intent: string,
  evidence: readonly OracleConversationEvidence[]
): string {
  return `Oracle's ${intent} view: ${evidence.map(({ summary }) => summary).join(" ")}`;
}

function response(
  request: OracleConversationRequest,
  intent: OracleConversationResponse["intent"],
  status: OracleConversationResponse["status"],
  answer: string,
  evidence: readonly OracleConversationEvidence[],
  limitations: readonly string[],
  provider: OracleConversationResponse["synthesis"]["provider"],
  staleEvidenceIds: readonly string[] = [],
  model: OracleConversationModelProvider | null = null
): OracleConversationResponse {
  return Object.freeze({
    contract: ORACLE_CONVERSATION_CONTRACT,
    contractVersion: ORACLE_CONVERSATION_CONTRACT_VERSION,
    requestId: request.requestId,
    status,
    intent,
    answer,
    evidence: Object.freeze(evidence.map(({ id, source, sourceRecordId, summary }) =>
      Object.freeze({ id, source, sourceRecordId, summary }))),
    provenance: Object.freeze([...new Set(evidence.flatMap(({ provenance }) => provenance))]),
    confidence: evidence.length === 0
      ? 0
      : Math.round(Math.min(...evidence.map(({ confidence }) => confidence)) * 100) / 100,
    freshness: Object.freeze({
      asOf: request.asOf,
      oldestEvidenceAt: evidence.length === 0
        ? null
        : [...evidence].sort((a, b) => a.observedAt.localeCompare(b.observedAt))[0]!.observedAt,
      staleEvidenceIds: Object.freeze([...staleEvidenceIds]),
    }),
    scope: Object.freeze([...new Set(evidence.map(({ scope }) => scope))]),
    limitations: Object.freeze([...limitations]),
    synthesis: Object.freeze({
      authority: "deterministic",
      provider,
      providerId: model?.id ?? null,
      modelId: model?.modelId ?? null,
    }),
  });
}
