import type { SupabaseClient } from "@supabase/supabase-js";
import {
  OPERATOR_GAME_SESSION_EVIDENCE_ADMISSION_CONTRACT,
  createOperatorConsentDecision,
  createOperatorDataPolicyDefinition,
  createOperatorEvidenceDisposition,
  createOperatorEvidenceReference,
  createOperatorIntelligenceClaimRevision,
  createOperatorIntelligenceClaimTombstone,
  type OperatorConsentDecision,
  type OperatorDataPolicyDefinition,
  type OperatorEvidenceDisposition,
  type OperatorEvidenceReference,
  type OperatorGameSessionEvidenceAdmission,
  type OperatorIntelligenceClaimRevision,
  type OperatorIntelligenceClaimTombstone,
  type OperatorUnderstandingEligibility,
  type OperatorUnderstandingScope,
} from "../understanding";

export type OperatorIntelligencePersistenceQuery = Readonly<{
  operatorId: string;
  purpose: string;
  asOf: string;
  scope: OperatorUnderstandingScope | null;
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
  ): Promise<readonly OperatorIntelligenceClaimRevision[]>;
}

type JsonRecord = Record<string, unknown>;

type ClaimHeadRow = Readonly<{
  claim_id: string;
  current_revision_id: string;
}>;

type ClaimRevisionRow = Readonly<{
  claim_revision_id: string;
  claim_revision_contract: JsonRecord;
}>;

type ClaimEvidenceRow = Readonly<{
  claim_revision_id: string;
  evidence_reference_id: string;
  relationship: "support" | "contradict";
  rationale: string;
  linked_at: string;
}>;

type EvidenceRow = Readonly<{
  evidence_reference_id: string;
  evidence_contract: JsonRecord;
}>;

type EligibilityRow = Readonly<{
  claim_revision_id: string;
  eligibility_contract: OperatorUnderstandingEligibility;
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
  ): Promise<readonly OperatorIntelligenceClaimRevision[]> {
    const heads = await this.readClaimHeads(query.operatorId);

    if (heads.length === 0) {
      return Object.freeze([]);
    }

    const revisionIds = heads.map((head) => head.current_revision_id);
    const [revisions, links, eligibilityRows] = await Promise.all([
      this.readClaimRevisions(query.operatorId, revisionIds),
      this.readEvidenceLinks(query.operatorId, revisionIds),
      this.readEligibility(
        query.operatorId,
        revisionIds,
        query.purpose,
        query.asOf
      ),
    ]);
    const evidenceIds = [...new Set(
      links.map((link) => link.evidence_reference_id)
    )];
    const evidence = await this.readEvidence(query.operatorId, evidenceIds);
    const evidenceById = new Map(
      evidence.map((item) => [item.id, item] as const)
    );
    const linksByRevision = groupBy(links, (link) => link.claim_revision_id);
    const latestEligibility = new Map<string, OperatorUnderstandingEligibility>();

    for (const row of eligibilityRows) {
      if (!latestEligibility.has(row.claim_revision_id)) {
        latestEligibility.set(
          row.claim_revision_id,
          row.eligibility_contract
        );
      }
    }

    const currentClaims: OperatorIntelligenceClaimRevision[] = [];

    for (const revision of revisions) {
      const eligibility = latestEligibility.get(revision.claim_revision_id);

      if (!eligibility?.eligible) {
        continue;
      }

      const revisionLinks = (linksByRevision.get(revision.claim_revision_id) ?? [])
        .map((link) => ({
          claimId: String(revision.claim_revision_contract.claimId),
          claimRevisionId: revision.claim_revision_id,
          evidenceReferenceId: link.evidence_reference_id,
          relationship: link.relationship,
          rationale: link.rationale,
          linkedAt: link.linked_at,
        }));
      const revisionEvidence = revisionLinks.map((link) => {
        const reference = evidenceById.get(link.evidenceReferenceId);

        if (!reference) {
          throw new Error(
            `Operator Intelligence evidence '${link.evidenceReferenceId}' is unavailable.`
          );
        }

        return reference;
      });
      const claim = createOperatorIntelligenceClaimRevision(
        {
          ...revision.claim_revision_contract,
          evidence: revisionLinks,
          eligibility,
        },
        revisionEvidence
      );

      if (
        claim.status === "active" &&
        isCurrentAt(claim, query.asOf) &&
        matchesScope(claim.scope, query.scope)
      ) {
        currentClaims.push(claim);
      }
    }

    return Object.freeze(currentClaims);
  }

  private async readClaimHeads(operatorId: string): Promise<ClaimHeadRow[]> {
    const { data, error } = await this.client
      .from("operator_intelligence_claims")
      .select("claim_id,current_revision_id")
      .eq("operator_id", operatorId);

    if (error) {
      throw error;
    }

    return (data ?? []) as ClaimHeadRow[];
  }

  private async readClaimRevisions(
    operatorId: string,
    revisionIds: readonly string[]
  ): Promise<ClaimRevisionRow[]> {
    const { data, error } = await this.client
      .from("operator_intelligence_claim_revisions")
      .select("claim_revision_id,claim_revision_contract")
      .eq("operator_id", operatorId)
      .in("claim_revision_id", [...revisionIds]);

    if (error) {
      throw error;
    }

    return (data ?? []) as ClaimRevisionRow[];
  }

  private async readEvidenceLinks(
    operatorId: string,
    revisionIds: readonly string[]
  ): Promise<ClaimEvidenceRow[]> {
    const { data, error } = await this.client
      .from("operator_intelligence_claim_evidence")
      .select(
        "claim_revision_id,evidence_reference_id,relationship,rationale,linked_at"
      )
      .eq("operator_id", operatorId)
      .in("claim_revision_id", [...revisionIds]);

    if (error) {
      throw error;
    }

    return (data ?? []) as ClaimEvidenceRow[];
  }

  private async readEligibility(
    operatorId: string,
    revisionIds: readonly string[],
    purpose: string,
    asOf: string
  ): Promise<EligibilityRow[]> {
    const { data, error } = await this.client
      .from("operator_intelligence_eligibility_assessments")
      .select("claim_revision_id,eligibility_contract,assessed_at")
      .eq("operator_id", operatorId)
      .eq("purpose", purpose)
      .in("claim_revision_id", [...revisionIds])
      .lte("assessed_at", asOf)
      .order("assessed_at", { ascending: false });

    if (error) {
      throw error;
    }

    return (data ?? []) as EligibilityRow[];
  }

  private async readEvidence(
    operatorId: string,
    evidenceIds: readonly string[]
  ): Promise<OperatorEvidenceReference[]> {
    if (evidenceIds.length === 0) {
      return [];
    }

    const { data, error } = await this.client
      .from("operator_intelligence_evidence")
      .select("evidence_reference_id,evidence_contract")
      .eq("operator_id", operatorId)
      .in("evidence_reference_id", [...evidenceIds]);

    if (error) {
      throw error;
    }

    return ((data ?? []) as EvidenceRow[]).map((row) =>
      createOperatorEvidenceReference(row.evidence_contract)
    );
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

function groupBy<Row, Key>(
  rows: readonly Row[],
  getKey: (row: Row) => Key
): Map<Key, Row[]> {
  const grouped = new Map<Key, Row[]>();

  for (const row of rows) {
    const key = getKey(row);
    const group = grouped.get(key) ?? [];
    group.push(row);
    grouped.set(key, group);
  }

  return grouped;
}
