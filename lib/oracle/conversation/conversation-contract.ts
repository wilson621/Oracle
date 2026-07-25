export const ORACLE_CONVERSATION_CONTRACT = "oracle.grounded-conversation";
export const ORACLE_CONVERSATION_CONTRACT_VERSION = 1;
export const ORACLE_CONVERSATION_PROMPT_VERSION = "1.0.0";

export type OracleConversationIntent =
  | "session"
  | "trend"
  | "coaching"
  | "mission"
  | "planner"
  | "progression"
  | "game-knowledge"
  | "clarification"
  | "prohibited";

export type OracleConversationSource =
  | "sessions"
  | "reports"
  | "operator-understanding"
  | "ai-coach"
  | "missions"
  | "planner"
  | "progression"
  | "game-integrations";

export type AuthenticatedConversationAuthority = Readonly<{
  operatorId: string;
  authenticatedAt: string;
}>;

export type OracleConversationRequest = Readonly<{
  requestId: string;
  authority: AuthenticatedConversationAuthority;
  text: string;
  purpose: "operator-question";
  asOf: string;
  requestModelSynthesis: boolean;
}>;

export type OracleConversationEvidence = Readonly<{
  id: string;
  operatorId: string;
  source: OracleConversationSource;
  sourceRecordId: string;
  summary: string;
  confidence: number;
  observedAt: string;
  validUntil: string | null;
  scope: string;
  provenance: readonly string[];
}>;

export type OracleConversationEvidencePacket = Readonly<{
  contract: "oracle.conversation-evidence-packet";
  contractVersion: 1;
  requestId: string;
  purpose: "operator-question";
  intent: OracleConversationIntent;
  assembledAt: string;
  evidence: readonly Readonly<{
    id: string;
    source: OracleConversationSource;
    sourceRecordId: string;
    summary: string;
    confidence: number;
    observedAt: string;
    validUntil: string | null;
    scope: string;
    provenance: readonly string[];
  }>[];
}>;

export type OracleConversationModelInput = Readonly<{
  instructionContract: "oracle.conversation-model-instruction";
  instructionVersion: typeof ORACLE_CONVERSATION_PROMPT_VERSION;
  untrustedUserData: string;
  evidencePacket: OracleConversationEvidencePacket;
  allowedEvidenceIds: readonly string[];
}>;

export type OracleConversationModelOutput = Readonly<{
  answer: string;
  evidenceIds: readonly string[];
}>;

export interface OracleConversationModelProvider {
  readonly id: string;
  readonly modelId: string;
  synthesize(
    input: OracleConversationModelInput
  ): Promise<OracleConversationModelOutput>;
}

export interface OracleConversationRetrievalGateway {
  retrieve(request: Readonly<{
    authority: AuthenticatedConversationAuthority;
    requestId: string;
    purpose: "operator-question";
    intent: OracleConversationIntent;
    sources: readonly OracleConversationSource[];
    asOf: string;
  }>): Promise<readonly OracleConversationEvidence[]>;
}

export type OracleConversationResponse = Readonly<{
  contract: typeof ORACLE_CONVERSATION_CONTRACT;
  contractVersion: typeof ORACLE_CONVERSATION_CONTRACT_VERSION;
  requestId: string;
  status: "answered" | "clarification" | "refused" | "degraded";
  intent: OracleConversationIntent;
  answer: string;
  evidence: readonly Readonly<{
    id: string;
    source: OracleConversationSource;
    sourceRecordId: string;
    summary: string;
  }>[];
  provenance: readonly string[];
  confidence: number;
  freshness: Readonly<{
    asOf: string;
    oldestEvidenceAt: string | null;
    staleEvidenceIds: readonly string[];
  }>;
  scope: readonly string[];
  limitations: readonly string[];
  synthesis: Readonly<{
    authority: "deterministic";
    provider: "not-requested" | "enriched" | "unavailable" | "invalid";
    providerId: string | null;
    modelId: string | null;
  }>;
}>;
