import type { SupabaseClient } from "@supabase/supabase-js";
import {
  OPERATOR_GAME_SESSION_EVIDENCE_ADMISSION_CONTRACT,
  OPERATOR_INTELLIGENCE_MAX_EVIDENCE_PER_CLAIM,
  OperatorIntelligencePageBudgetError,
  createOperatorConsentDecision,
  createOperatorDataPolicyDefinition,
  createOperatorEvidenceDisposition,
  createOperatorEvidenceReference,
  createOperatorIntelligenceClaimRevision,
  createOperatorIntelligenceClaimTombstone,
  createOperatorIntelligencePageResult,
  type OperatorConsentDecision,
  type OperatorDataPolicyDefinition,
  type OperatorEvidenceDisposition,
  type OperatorEvidenceReference,
  type OperatorGameSessionEvidenceAdmission,
  type OperatorIntelligenceClaimRevision,
  type OperatorIntelligenceClaimTombstone,
  type OperatorIntelligencePageRequest,
  type OperatorIntelligencePageResult,
  type OperatorUnderstandingEligibility,
  type OperatorUnderstandingScope,
} from "../understanding";
import {
  decodeOperatorIntelligenceCursor,
  encodeOperatorIntelligenceCursor,
} from "./operator-intelligence-pagination";

export type OperatorIntelligencePersistenceQuery = Readonly<{
  operatorId: string;
  purpose: string;
  asOf: string;
  scope: OperatorUnderstandingScope | null;
  page: OperatorIntelligencePageRequest;
}>;

export type OperatorIntelligenceLifecycleQuery = Readonly<{
  operatorId: string;
  claimId: string;
  purpose: string;
  asOf: string;
  scope: OperatorUnderstandingScope | null;
  page: OperatorIntelligencePageRequest;
}>;

export type OperatorIntelligenceEligibilityHistoryQuery = Readonly<{
  operatorId: string;
  claimId: string;
  claimRevisionId: string;
  purpose: string;
  asOf: string;
  page: OperatorIntelligencePageRequest;
}>;

export interface OperatorIntelligenceRepository {
  registerPolicyDefinition(
    policy: OperatorDataPolicyDefinition
  ): Promise<OperatorDataPolicyDefinition>;
  appendConsentDecision(
    operatorId: string,
    decision: OperatorConsentDecision
  ): Promise<OperatorConsentDecision>;
  admitGameSessionEvidence(
    operatorId: string,
    evidence: OperatorEvidenceReference,
    disposition: OperatorEvidenceDisposition,
    admission: OperatorGameSessionEvidenceAdmission
  ): Promise<OperatorGameSessionEvidenceAdmission>;
  appendEvidenceDisposition(
    operatorId: string,
    disposition: OperatorEvidenceDisposition
  ): Promise<OperatorEvidenceDisposition>;
  persistClaimRevision(
    operatorId: string,
    evidenceReferences: readonly OperatorEvidenceReference[],
    claimRevision:
      | OperatorIntelligenceClaimRevision
      | OperatorIntelligenceClaimTombstone
  ): Promise<
    OperatorIntelligenceClaimRevision | OperatorIntelligenceClaimTombstone
  >;
  appendEligibilityAssessment(
    operatorId: string,
    claimId: string,
    claimRevisionId: string,
    eligibility: OperatorUnderstandingEligibility
  ): Promise<OperatorUnderstandingEligibility>;
  listEligibleClaimRevisions(
    query: OperatorIntelligencePersistenceQuery
  ): Promise<OperatorIntelligencePageResult<OperatorIntelligenceClaimRevision>>;
  listClaimLifecycle(
    query: OperatorIntelligenceLifecycleQuery
  ): Promise<OperatorIntelligencePageResult<
    OperatorIntelligenceClaimRevision | OperatorIntelligenceClaimTombstone
  >>;
  listEligibilityHistory(
    query: OperatorIntelligenceEligibilityHistoryQuery
  ): Promise<OperatorIntelligencePageResult<OperatorUnderstandingEligibility>>;
}

type JsonRecord = Record<string, unknown>;

type EligibleClaimPageRow = Readonly<{
  claimRevisionId: string;
  effectiveFrom: string;
  claimRevisionContract: JsonRecord;
  eligibilityContract: OperatorUnderstandingEligibility;
  evidenceLinks: readonly JsonRecord[];
  evidenceContracts: readonly JsonRecord[];
}>;

type EligibleClaimPageData = Readonly<{
  readWatermark: string;
  hasMore: boolean;
  rows: readonly EligibleClaimPageRow[];
}>;

type ClaimLifecyclePageRow = EligibleClaimPageRow & Readonly<{
  revision: number;
  recordedAt: string;
  status: string;
  eligibilityContract: OperatorUnderstandingEligibility | null;
}>;

type EligibilityHistoryPageRow = Readonly<{
  assessmentId: string;
  assessedAt: string;
  eligibilityContract: OperatorUnderstandingEligibility;
}>;

export class SupabaseOperatorIntelligenceRepository
  implements OperatorIntelligenceRepository
{
  constructor(private readonly client: SupabaseClient) {}

  async registerPolicyDefinition(
    policy: OperatorDataPolicyDefinition
  ): Promise<OperatorDataPolicyDefinition> {
    const validatedPolicy = createOperatorDataPolicyDefinition(policy);
    const { data, error } = await this.client.rpc(
      "register_operator_data_policy_version",
      {
        p_policy: validatedPolicy,
      }
    );

    if (error) {
      throw error;
    }

    return createOperatorDataPolicyDefinition(data);
  }

  async appendConsentDecision(
    operatorId: string,
    decision: OperatorConsentDecision
  ): Promise<OperatorConsentDecision> {
    const validatedDecision = createOperatorConsentDecision(decision);
    assertOperatorOwnership(operatorId, [validatedDecision]);
    const { data, error } = await this.client.rpc(
      "append_operator_consent_decision",
      {
        p_operator_id: operatorId,
        p_consent: validatedDecision,
      }
    );

    if (error) {
      throw error;
    }

    return createOperatorConsentDecision(data);
  }

  async admitGameSessionEvidence(
    operatorId: string,
    evidence: OperatorEvidenceReference,
    disposition: OperatorEvidenceDisposition,
    admission: OperatorGameSessionEvidenceAdmission
  ): Promise<OperatorGameSessionEvidenceAdmission> {
    const validatedEvidence = createOperatorEvidenceReference(evidence);
    const validatedDisposition = createOperatorEvidenceDisposition(disposition);
    assertAdmissionBundle(
      operatorId,
      validatedEvidence,
      validatedDisposition,
      admission
    );
    const { data, error } = await this.client.rpc(
      "admit_operator_game_session_evidence",
      {
        p_operator_id: operatorId,
        p_evidence: validatedEvidence,
        p_disposition: validatedDisposition,
        p_admission: admission,
      }
    );

    if (error) {
      throw error;
    }

    assertAdmissionBundle(
      operatorId,
      validatedEvidence,
      validatedDisposition,
      data as OperatorGameSessionEvidenceAdmission
    );

    const persistedAdmission = structuredClone(
      data as OperatorGameSessionEvidenceAdmission
    );

    Object.freeze(persistedAdmission.contract);
    return Object.freeze(persistedAdmission);
  }

  async appendEvidenceDisposition(
    operatorId: string,
    disposition: OperatorEvidenceDisposition
  ): Promise<OperatorEvidenceDisposition> {
    const validatedDisposition = createOperatorEvidenceDisposition(disposition);
    assertOperatorOwnership(operatorId, [validatedDisposition]);
    const { data, error } = await this.client.rpc(
      "append_operator_evidence_disposition",
      {
        p_operator_id: operatorId,
        p_disposition: validatedDisposition,
      }
    );

    if (error) {
      throw error;
    }

    return createOperatorEvidenceDisposition(data);
  }

  async persistClaimRevision(
    operatorId: string,
    evidenceReferences: readonly OperatorEvidenceReference[],
    claimRevision:
      | OperatorIntelligenceClaimRevision
      | OperatorIntelligenceClaimTombstone
  ): Promise<
    OperatorIntelligenceClaimRevision | OperatorIntelligenceClaimTombstone
  > {
    const validatedEvidence = evidenceReferences.map((evidence) =>
      createOperatorEvidenceReference(evidence)
    );
    const validatedClaim = claimRevision.status === "deleted"
      ? createOperatorIntelligenceClaimTombstone(claimRevision)
      : createOperatorIntelligenceClaimRevision(
          claimRevision,
          validatedEvidence
        );

    assertOperatorOwnership(operatorId, [
      ...validatedEvidence,
      validatedClaim,
    ]);

    const { data, error } = await this.client.rpc(
      "persist_operator_intelligence_claim_revision",
      {
        p_operator_id: operatorId,
        p_evidence: validatedEvidence,
        p_claim_revision: validatedClaim,
      }
    );

    if (error) {
      throw error;
    }

    return validatedClaim.status === "deleted"
      ? createOperatorIntelligenceClaimTombstone(data)
      : createOperatorIntelligenceClaimRevision(data, validatedEvidence);
  }

  async appendEligibilityAssessment(
    operatorId: string,
    claimId: string,
    claimRevisionId: string,
    eligibility: OperatorUnderstandingEligibility
  ): Promise<OperatorUnderstandingEligibility> {
    const { data, error } = await this.client.rpc(
      "append_operator_intelligence_eligibility",
      {
        p_operator_id: operatorId,
        p_claim_id: claimId,
        p_claim_revision_id: claimRevisionId,
        p_eligibility: eligibility,
      }
    );

    if (error) {
      throw error;
    }

    return data as OperatorUnderstandingEligibility;
  }

  async listEligibleClaimRevisions(
    query: OperatorIntelligencePersistenceQuery
  ): Promise<OperatorIntelligencePageResult<OperatorIntelligenceClaimRevision>> {
    const cursor = query.page.cursor === null
      ? null
      : decodeOperatorIntelligenceCursor({
          cursor: query.page.cursor,
          kind: "eligible-claims",
          query: eligibleClaimCursorQuery(query),
        });
    const { data, error } = await this.client.rpc(
      "read_operator_intelligence_eligible_claim_page",
      {
        p_operator_id: query.operatorId,
        p_purpose: query.purpose,
        p_as_of: query.asOf,
        p_scope: query.scope,
        p_page_size: query.page.pageSize,
        p_read_watermark: cursor?.readWatermark ?? null,
        p_after_effective_from: cursor?.position.orderValue ?? null,
        p_after_revision_id: cursor?.position.tieBreaker ?? null,
      }
    );

    if (error) {
      throw error;
    }

    const page = requireEligibleClaimPageData(data);
    if (page.rows.length > query.page.pageSize) {
      throw new Error("Operator Intelligence Repository exceeded its page limit.");
    }
    const claims = page.rows.map((row) => {
      assertEvidenceFanOut(row.evidenceLinks.length);
      const evidence = row.evidenceContracts.map((contract) =>
        createOperatorEvidenceReference(contract)
      );
      const claim = createOperatorIntelligenceClaimRevision(
        {
          ...row.claimRevisionContract,
          evidence: row.evidenceLinks,
          eligibility: row.eligibilityContract,
        },
        evidence
      );

      if (
        claim.operatorId !== query.operatorId ||
        claim.status !== "active" ||
        !claim.eligibility.eligible ||
        claim.eligibility.purpose !== query.purpose ||
        !isCurrentAt(claim, query.asOf) ||
        !matchesScope(claim.scope, query.scope)
      ) {
        throw new Error(
          "Operator Intelligence eligible page violated its query boundary."
        );
      }

      return claim;
    });
    const lastRow = page.rows.at(-1);
    const nextCursor = page.hasMore && lastRow
      ? encodeOperatorIntelligenceCursor({
          kind: "eligible-claims",
          query: eligibleClaimCursorQuery(query),
          readWatermark: page.readWatermark,
          position: {
            orderValue: lastRow.effectiveFrom,
            tieBreaker: lastRow.claimRevisionId,
          },
        })
      : null;

    return createOperatorIntelligencePageResult({
      kind: "eligible-claims",
      items: claims,
      readWatermark: page.readWatermark,
      nextCursor,
      hasMore: page.hasMore,
    });
  }

  async listClaimLifecycle(
    query: OperatorIntelligenceLifecycleQuery
  ): Promise<OperatorIntelligencePageResult<
    OperatorIntelligenceClaimRevision | OperatorIntelligenceClaimTombstone
  >> {
    const cursorQuery = lifecycleCursorQuery(query);
    const cursor = query.page.cursor === null
      ? null
      : decodeOperatorIntelligenceCursor({
          cursor: query.page.cursor,
          kind: "claim-lifecycle",
          query: cursorQuery,
        });
    const { data, error } = await this.client.rpc(
      "read_operator_intelligence_claim_lifecycle_page",
      {
        p_operator_id: query.operatorId,
        p_claim_id: query.claimId,
        p_purpose: query.purpose,
        p_as_of: query.asOf,
        p_scope: query.scope,
        p_page_size: query.page.pageSize,
        p_read_watermark: cursor?.readWatermark ?? null,
        p_after_revision: cursor === null
          ? null
          : Number(cursor.position.orderValue),
        p_after_revision_id: cursor?.position.tieBreaker ?? null,
      }
    );

    if (error) {
      throw error;
    }

    const page = requireLifecyclePageData(data);
    assertRepositoryPageLimit(page.rows.length, query.page.pageSize);
    const items = page.rows.map((row) => {
      if (row.status === "deleted") {
        const tombstone = createOperatorIntelligenceClaimTombstone(
          row.claimRevisionContract
        );
        assertOperatorOwnership(query.operatorId, [tombstone]);
        return tombstone;
      }

      if (row.eligibilityContract === null) {
        throw new Error(
          "Operator Intelligence lifecycle revision is missing eligibility."
        );
      }

      assertEvidenceFanOut(row.evidenceLinks.length);
      const evidence = row.evidenceContracts.map((contract) =>
        createOperatorEvidenceReference(contract)
      );
      const claim = createOperatorIntelligenceClaimRevision({
        ...row.claimRevisionContract,
        evidence: row.evidenceLinks,
        eligibility: row.eligibilityContract,
      }, evidence);

      if (
        claim.operatorId !== query.operatorId ||
        claim.claimId !== query.claimId ||
        claim.eligibility.purpose !== query.purpose ||
        !matchesScope(claim.scope, query.scope)
      ) {
        throw new Error(
          "Operator Intelligence lifecycle page violated its query boundary."
        );
      }

      return claim;
    });
    const lastRow = page.rows.at(-1);
    const nextCursor = page.hasMore && lastRow
      ? encodeOperatorIntelligenceCursor({
          kind: "claim-lifecycle",
          query: cursorQuery,
          readWatermark: page.readWatermark,
          position: {
            orderValue: String(lastRow.revision),
            tieBreaker: lastRow.claimRevisionId,
          },
        })
      : null;

    return createOperatorIntelligencePageResult({
      kind: "claim-lifecycle",
      items,
      readWatermark: page.readWatermark,
      nextCursor,
      hasMore: page.hasMore,
    });
  }

  async listEligibilityHistory(
    query: OperatorIntelligenceEligibilityHistoryQuery
  ): Promise<OperatorIntelligencePageResult<OperatorUnderstandingEligibility>> {
    const cursorQuery = eligibilityCursorQuery(query);
    const cursor = query.page.cursor === null
      ? null
      : decodeOperatorIntelligenceCursor({
          cursor: query.page.cursor,
          kind: "eligibility-history",
          query: cursorQuery,
        });
    const { data, error } = await this.client.rpc(
      "read_operator_intelligence_eligibility_history_page",
      {
        p_operator_id: query.operatorId,
        p_claim_id: query.claimId,
        p_claim_revision_id: query.claimRevisionId,
        p_purpose: query.purpose,
        p_as_of: query.asOf,
        p_page_size: query.page.pageSize,
        p_read_watermark: cursor?.readWatermark ?? null,
        p_after_assessed_at: cursor?.position.orderValue ?? null,
        p_after_assessment_id: cursor?.position.tieBreaker ?? null,
      }
    );

    if (error) {
      throw error;
    }

    const page = requireEligibilityHistoryPageData(data);
    assertRepositoryPageLimit(page.rows.length, query.page.pageSize);
    const items = page.rows.map((row) => {
      if (row.eligibilityContract.purpose !== query.purpose) {
        throw new Error(
          "Operator Intelligence eligibility page violated its purpose boundary."
        );
      }

      return Object.freeze(structuredClone(row.eligibilityContract));
    });
    const lastRow = page.rows.at(-1);
    const nextCursor = page.hasMore && lastRow
      ? encodeOperatorIntelligenceCursor({
          kind: "eligibility-history",
          query: cursorQuery,
          readWatermark: page.readWatermark,
          position: {
            orderValue: lastRow.assessedAt,
            tieBreaker: lastRow.assessmentId,
          },
        })
      : null;

    return createOperatorIntelligencePageResult({
      kind: "eligibility-history",
      items,
      readWatermark: page.readWatermark,
      nextCursor,
      hasMore: page.hasMore,
    });
  }
}

function assertOperatorOwnership(
  operatorId: string,
  values: readonly Readonly<{ operatorId: string }>[]
): void {
  if (values.some((value) => value.operatorId !== operatorId)) {
    throw new Error(
      "Operator Intelligence persistence cannot cross Operator ownership."
    );
  }
}

function assertAdmissionBundle(
  operatorId: string,
  evidence: OperatorEvidenceReference,
  disposition: OperatorEvidenceDisposition,
  admission: OperatorGameSessionEvidenceAdmission
): void {
  assertOperatorOwnership(operatorId, [evidence, disposition, admission]);

  if (
    admission.contract.name !== OPERATOR_GAME_SESSION_EVIDENCE_ADMISSION_CONTRACT ||
    admission.contract.version !== 1 ||
    disposition.evidenceReferenceId !== evidence.id ||
    admission.evidenceReferenceId !== evidence.id ||
    admission.evidenceDispositionId !== disposition.id ||
    admission.sourceRecordId !== evidence.sourceRecordId ||
    admission.purpose !== evidence.purpose ||
    admission.policyId !== evidence.policyId ||
    admission.policyVersion !== evidence.policyVersion ||
    evidence.scope.type !== "session" ||
    admission.sessionId !== evidence.scope.sessionId ||
    admission.integrationId !== evidence.scope.integrationId ||
    admission.integrationVersion !== evidence.scope.integrationVersion
  ) {
    throw new Error(
      "Operator Intelligence evidence admission bundle is inconsistent."
    );
  }
}

function isCurrentAt(
  claim: OperatorIntelligenceClaimRevision,
  asOf: string
): boolean {
  const instant = Date.parse(asOf);

  return instant >= Date.parse(claim.temporalValidity.effectiveFrom) &&
    (claim.temporalValidity.validUntil === null ||
      instant < Date.parse(claim.temporalValidity.validUntil));
}

function matchesScope(
  claimScope: OperatorUnderstandingScope,
  requestedScope: OperatorUnderstandingScope | null
): boolean {
  if (requestedScope === null) {
    return true;
  }

  return JSON.stringify(claimScope) === JSON.stringify(requestedScope);
}

function requireEligibleClaimPageData(value: unknown): EligibleClaimPageData {
  if (!isRecord(value) || !Array.isArray(value.rows)) {
    throw new Error("Operator Intelligence Repository returned an invalid page.");
  }

  const readWatermark = value.readWatermark;
  const hasMore = value.hasMore;

  if (
    typeof readWatermark !== "string" ||
    !Number.isFinite(Date.parse(readWatermark)) ||
    typeof hasMore !== "boolean"
  ) {
    throw new Error("Operator Intelligence Repository returned invalid page metadata.");
  }

  const rows = value.rows.map((row) => {
    if (
      !isRecord(row) ||
      typeof row.claimRevisionId !== "string" ||
      typeof row.effectiveFrom !== "string" ||
      !isRecord(row.claimRevisionContract) ||
      !isRecord(row.eligibilityContract) ||
      !Array.isArray(row.evidenceLinks) ||
      !row.evidenceLinks.every(isRecord) ||
      !Array.isArray(row.evidenceContracts) ||
      !row.evidenceContracts.every(isRecord)
    ) {
      throw new Error("Operator Intelligence Repository returned an invalid row.");
    }

    return row as EligibleClaimPageRow;
  });

  return { readWatermark, hasMore, rows };
}

function requireLifecyclePageData(value: unknown): Readonly<{
  readWatermark: string;
  hasMore: boolean;
  rows: readonly ClaimLifecyclePageRow[];
}> {
  const metadata = requirePageMetadata(value);
  const rows = metadata.rows.map((row) => {
    if (
      !isRecord(row) ||
      typeof row.claimRevisionId !== "string" ||
      typeof row.effectiveFrom !== "string" ||
      typeof row.revision !== "number" ||
      typeof row.recordedAt !== "string" ||
      typeof row.status !== "string" ||
      !isRecord(row.claimRevisionContract) ||
      (row.eligibilityContract !== null &&
        !isRecord(row.eligibilityContract)) ||
      !Array.isArray(row.evidenceLinks) ||
      !row.evidenceLinks.every(isRecord) ||
      !Array.isArray(row.evidenceContracts) ||
      !row.evidenceContracts.every(isRecord)
    ) {
      throw new Error(
        "Operator Intelligence Repository returned an invalid lifecycle row."
      );
    }

    return row as ClaimLifecyclePageRow;
  });

  return { ...metadata, rows };
}

function requireEligibilityHistoryPageData(value: unknown): Readonly<{
  readWatermark: string;
  hasMore: boolean;
  rows: readonly EligibilityHistoryPageRow[];
}> {
  const metadata = requirePageMetadata(value);
  const rows = metadata.rows.map((row) => {
    if (
      !isRecord(row) ||
      typeof row.assessmentId !== "string" ||
      typeof row.assessedAt !== "string" ||
      !isRecord(row.eligibilityContract)
    ) {
      throw new Error(
        "Operator Intelligence Repository returned an invalid eligibility row."
      );
    }

    return {
      assessmentId: row.assessmentId,
      assessedAt: row.assessedAt,
      eligibilityContract: requireEligibility(row.eligibilityContract),
    };
  });

  return { ...metadata, rows };
}

function requirePageMetadata(value: unknown): Readonly<{
  readWatermark: string;
  hasMore: boolean;
  rows: readonly unknown[];
}> {
  if (
    !isRecord(value) ||
    !Array.isArray(value.rows) ||
    typeof value.readWatermark !== "string" ||
    !Number.isFinite(Date.parse(value.readWatermark)) ||
    typeof value.hasMore !== "boolean"
  ) {
    throw new Error("Operator Intelligence Repository returned invalid page metadata.");
  }

  return {
    readWatermark: value.readWatermark,
    hasMore: value.hasMore,
    rows: value.rows,
  };
}

function requireEligibility(value: JsonRecord): OperatorUnderstandingEligibility {
  if (
    typeof value.eligible !== "boolean" ||
    !Array.isArray(value.reasons) ||
    !value.reasons.every((reason) => typeof reason === "string") ||
    typeof value.purpose !== "string" ||
    typeof value.policyId !== "string" ||
    typeof value.policyVersion !== "string" ||
    typeof value.assessedAt !== "string" ||
    !Number.isFinite(Date.parse(value.assessedAt))
  ) {
    throw new Error("Operator Intelligence Repository returned invalid eligibility.");
  }

  return value as OperatorUnderstandingEligibility;
}

function isRecord(value: unknown): value is JsonRecord {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

function eligibleClaimCursorQuery(query: OperatorIntelligencePersistenceQuery) {
  return {
    operatorId: query.operatorId,
    purpose: query.purpose,
    asOf: query.asOf,
    scope: query.scope,
  };
}

function lifecycleCursorQuery(query: OperatorIntelligenceLifecycleQuery) {
  return {
    operatorId: query.operatorId,
    claimId: query.claimId,
    purpose: query.purpose,
    asOf: query.asOf,
    scope: query.scope,
  };
}

function eligibilityCursorQuery(
  query: OperatorIntelligenceEligibilityHistoryQuery
) {
  return {
    operatorId: query.operatorId,
    claimId: query.claimId,
    claimRevisionId: query.claimRevisionId,
    purpose: query.purpose,
    asOf: query.asOf,
  };
}

function assertRepositoryPageLimit(actual: number, requested: number): void {
  if (actual > requested) {
    throw new Error("Operator Intelligence Repository exceeded its page limit.");
  }
}

function assertEvidenceFanOut(actual: number): void {
  if (actual > OPERATOR_INTELLIGENCE_MAX_EVIDENCE_PER_CLAIM) {
    throw new OperatorIntelligencePageBudgetError("evidence-fan-out");
  }
}
