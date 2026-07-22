begin;

-- Sprint 15 Phase 3 persists versioned Operator Intelligence contracts only.
-- Sprint 15.5A hardens the undeployed migration so durable intelligence can
-- only be created through the trusted Operator Intelligence Service boundary.
-- Operator identity, declarations, Sessions and raw evidence remain owned by
-- their existing authoritative systems.
alter table public.oracle_sessions
    add constraint oracle_sessions_id_operator_unique
    unique (id, operator_id);

create table public.operator_data_policy_versions (
    policy_id text not null,
    policy_version text not null,
    purpose text not null,
    retention_class text not null,
    effective_from timestamptz not null,
    effective_until timestamptz,
    allowed_claim_types text[] not null,
    minimum_evidence_quality numeric not null,
    allowed_source_classifications text[] not null,
    evidence_reference_days integer not null,
    superseded_claim_revision_days integer not null,
    maximum_claim_validity_days integer not null,
    reassess_after_days integer not null,
    policy_contract jsonb not null,
    recorded_at timestamptz not null default now(),
    primary key (policy_id, policy_version),
    constraint operator_data_policy_versions_semver_check
        check (policy_version ~ '^[0-9]+\.[0-9]+\.[0-9]+([+-][0-9A-Za-z.-]+)?$'),
    constraint operator_data_policy_versions_effective_check
        check (effective_until is null or effective_until > effective_from),
    constraint operator_data_policy_versions_claim_types_check
        check (
            cardinality(allowed_claim_types) > 0
            and allowed_claim_types <@ array[
                'recurring-game-strength', 'recurring-game-weakness'
            ]::text[]
        ),
    constraint operator_data_policy_versions_admission_check
        check (
            minimum_evidence_quality between 0 and 1
            and cardinality(allowed_source_classifications) > 0
            and allowed_source_classifications <@ array[
                'game-integration-direct-observation',
                'game-integration-deterministic-transformation'
            ]::text[]
        ),
    constraint operator_data_policy_versions_retention_check
        check (
            evidence_reference_days > 0
            and superseded_claim_revision_days > 0
            and maximum_claim_validity_days > 0
            and reassess_after_days > 0
            and reassess_after_days <= maximum_claim_validity_days
        ),
    constraint operator_data_policy_versions_contract_check
        check (
            policy_contract -> 'contract' ->> 'name' =
                'oracle.operator-data-policy-definition'
            and (policy_contract -> 'contract' ->> 'version')::integer = 1
            and policy_contract ->> 'id' = policy_id
            and policy_contract ->> 'policyVersion' = policy_version
            and policy_contract ->> 'purpose' = purpose
            and policy_contract ->> 'retentionClass' = retention_class
            and (policy_contract ->> 'effectiveFrom')::timestamptz = effective_from
            and coalesce(
                (policy_contract ->> 'effectiveUntil')::timestamptz,
                '-infinity'::timestamptz
            ) = coalesce(effective_until, '-infinity'::timestamptz)
            and policy_contract -> 'allowedClaimTypes' =
                to_jsonb(allowed_claim_types)
            and (policy_contract -> 'evidenceAdmission' ->>
                'minimumQualityScore')::numeric = minimum_evidence_quality
            and policy_contract -> 'evidenceAdmission' ->
                'allowedSourceClassifications' =
                to_jsonb(allowed_source_classifications)
            and (policy_contract -> 'retention' ->>
                'evidenceReferenceDays')::integer = evidence_reference_days
            and (policy_contract -> 'retention' ->>
                'supersededClaimRevisionDays')::integer =
                superseded_claim_revision_days
            and (policy_contract -> 'claimLifecycle' ->>
                'maximumValidityDays')::integer = maximum_claim_validity_days
            and (policy_contract -> 'claimLifecycle' ->>
                'reassessAfterDays')::integer = reassess_after_days
        )
);

create table public.operator_consent_decisions (
    operator_id uuid not null
        references public.operators(id) on delete cascade,
    consent_decision_id text not null,
    purpose text not null,
    policy_id text not null,
    policy_version text not null,
    decision text not null,
    effective_at timestamptz not null,
    recorded_at timestamptz not null,
    supersedes_decision_id text,
    consent_contract jsonb not null,
    primary key (operator_id, consent_decision_id),
    unique (
        operator_id,
        purpose,
        policy_id,
        policy_version,
        consent_decision_id
    ),
    constraint operator_consent_decisions_policy_fkey
        foreign key (policy_id, policy_version)
        references public.operator_data_policy_versions(
            policy_id,
            policy_version
        ),
    constraint operator_consent_decisions_supersedes_fkey
        foreign key (operator_id, supersedes_decision_id)
        references public.operator_consent_decisions(
            operator_id,
            consent_decision_id
        ),
    constraint operator_consent_decisions_value_check
        check (decision in ('granted', 'revoked')),
    constraint operator_consent_decisions_time_check
        check (recorded_at >= effective_at),
    constraint operator_consent_decisions_contract_check
        check (
            consent_contract -> 'contract' ->> 'name' =
                'oracle.operator-consent-decision'
            and (consent_contract -> 'contract' ->> 'version')::integer = 1
            and consent_contract ->> 'id' = consent_decision_id
            and (consent_contract ->> 'operatorId')::uuid = operator_id
            and consent_contract ->> 'purpose' = purpose
            and consent_contract ->> 'policyId' = policy_id
            and consent_contract ->> 'policyVersion' = policy_version
            and consent_contract ->> 'decision' = decision
            and (consent_contract ->> 'effectiveAt')::timestamptz = effective_at
            and (consent_contract ->> 'recordedAt')::timestamptz = recorded_at
            and coalesce(consent_contract ->> 'supersedesDecisionId', '') =
                coalesce(supersedes_decision_id, '')
            and not (consent_contract ? 'confidence')
            and consent_contract -> 'provenance' ->> 'sourceOwnerType' =
                'operator-service'
            and consent_contract -> 'provenance' ->> 'method' =
                'operator-declaration'
        )
);

create table public.operator_intelligence_evidence (
    operator_id uuid not null,
    evidence_reference_id text not null,
    source_type text not null,
    source_owner_id text not null,
    source_record_id text not null,
    observed_at timestamptz not null,
    captured_at timestamptz not null,
    purpose text not null,
    producer_id text not null,
    producer_version text not null,
    producer_method text not null,
    session_id uuid,
    integration_id text,
    integration_version text,
    evidence_quality_score numeric,
    content_digest text not null,
    retention_class text not null,
    policy_id text not null,
    policy_version text not null,
    evidence_contract jsonb not null,
    recorded_at timestamptz not null default now(),
    primary key (operator_id, evidence_reference_id),
    constraint operator_intelligence_evidence_operator_fkey
        foreign key (operator_id)
        references public.operators(id) on delete cascade,
    constraint operator_intelligence_evidence_policy_fkey
        foreign key (policy_id, policy_version)
        references public.operator_data_policy_versions(
            policy_id,
            policy_version
        ),
    constraint operator_intelligence_evidence_session_fkey
        foreign key (session_id, operator_id)
        references public.oracle_sessions(id, operator_id),
    constraint operator_intelligence_evidence_source_unique
        unique (
            operator_id,
            source_type,
            source_owner_id,
            source_record_id,
            producer_id,
            producer_version,
            content_digest,
            purpose
        ),
    constraint operator_intelligence_evidence_source_type_check
        check (source_type in (
            'session',
            'operator-declaration',
            'application-event',
            'game-integration-observation'
        )),
    constraint operator_intelligence_evidence_time_check
        check (captured_at >= observed_at),
    constraint operator_intelligence_evidence_digest_check
        check (content_digest ~ '^sha256:[0-9a-f]{64}$'),
    constraint operator_intelligence_evidence_scope_check
        check (
            (session_id is null and integration_id is null
                and integration_version is null)
            or (session_id is not null and integration_id is not null
                and integration_version is not null)
        ),
    constraint operator_intelligence_evidence_contract_check
        check (
            evidence_contract -> 'contract' ->> 'name' =
                'oracle.operator-evidence-reference'
            and (evidence_contract -> 'contract' ->> 'version')::integer = 1
            and evidence_contract ->> 'id' = evidence_reference_id
            and (evidence_contract ->> 'operatorId')::uuid = operator_id
            and evidence_contract ->> 'sourceType' = source_type
            and evidence_contract ->> 'sourceOwnerId' = source_owner_id
            and evidence_contract ->> 'sourceRecordId' = source_record_id
            and (evidence_contract ->> 'observedAt')::timestamptz = observed_at
            and (evidence_contract ->> 'capturedAt')::timestamptz = captured_at
            and evidence_contract ->> 'purpose' = purpose
            and evidence_contract -> 'producer' ->> 'id' = producer_id
            and evidence_contract -> 'producer' ->> 'version' = producer_version
            and evidence_contract -> 'producer' ->> 'method' = producer_method
            and coalesce(
                (evidence_contract -> 'scope' ->> 'sessionId')::uuid,
                '00000000-0000-0000-0000-000000000000'::uuid
            ) = coalesce(
                session_id,
                '00000000-0000-0000-0000-000000000000'::uuid
            )
            and coalesce(evidence_contract -> 'scope' ->> 'integrationId', '') =
                coalesce(integration_id, '')
            and coalesce(
                evidence_contract -> 'scope' ->> 'integrationVersion', ''
            ) = coalesce(integration_version, '')
            and coalesce(
                (evidence_contract -> 'quality' ->> 'score')::numeric,
                -1
            ) = coalesce(evidence_quality_score, -1)
            and evidence_contract ->> 'contentDigest' = content_digest
            and evidence_contract ->> 'retentionClass' = retention_class
            and evidence_contract ->> 'policyId' = policy_id
            and evidence_contract ->> 'policyVersion' = policy_version
            and evidence_contract::text !~*
                '"(operatorPrompt|prompt|rawPrompt|rawEvidence|transcript|payload)"\s*:'
        )
);

create table public.operator_intelligence_evidence_dispositions (
    operator_id uuid not null,
    evidence_reference_id text not null,
    disposition_id text not null,
    disposition text not null,
    reason text not null,
    effective_at timestamptz not null,
    recorded_at timestamptz not null,
    supersedes_disposition_id text,
    disposition_contract jsonb not null,
    primary key (operator_id, evidence_reference_id, disposition_id),
    unique (operator_id, disposition_id),
    constraint operator_intelligence_evidence_dispositions_evidence_fkey
        foreign key (operator_id, evidence_reference_id)
        references public.operator_intelligence_evidence(
            operator_id,
            evidence_reference_id
        ) on delete cascade,
    constraint operator_intelligence_evidence_dispositions_supersedes_fkey
        foreign key (
            operator_id,
            evidence_reference_id,
            supersedes_disposition_id
        ) references public.operator_intelligence_evidence_dispositions(
            operator_id,
            evidence_reference_id,
            disposition_id
        ),
    constraint operator_intelligence_evidence_dispositions_value_check
        check (disposition in (
            'available', 'withdrawn', 'source-deleted', 'retention-expired'
        )),
    constraint operator_intelligence_evidence_dispositions_time_check
        check (recorded_at >= effective_at),
    constraint operator_intelligence_evidence_dispositions_contract_check
        check (
            disposition_contract -> 'contract' ->> 'name' =
                'oracle.operator-evidence-disposition'
            and (disposition_contract -> 'contract' ->> 'version')::integer = 1
            and disposition_contract ->> 'id' = disposition_id
            and (disposition_contract ->> 'operatorId')::uuid = operator_id
            and disposition_contract ->> 'evidenceReferenceId' =
                evidence_reference_id
            and disposition_contract ->> 'disposition' = disposition
            and disposition_contract ->> 'reason' = reason
            and (disposition_contract ->> 'effectiveAt')::timestamptz =
                effective_at
            and (disposition_contract ->> 'recordedAt')::timestamptz =
                recorded_at
            and coalesce(
                disposition_contract ->> 'supersedesDispositionId', ''
            ) = coalesce(supersedes_disposition_id, '')
        )
);

create table public.operator_intelligence_evidence_admissions (
    operator_id uuid not null,
    admission_id text not null,
    evidence_reference_id text not null,
    evidence_disposition_id text not null,
    session_id uuid not null,
    source_record_id text not null,
    integration_id text not null,
    integration_version text not null,
    purpose text not null,
    intended_claim_type text not null,
    source_classification text not null,
    policy_id text not null,
    policy_version text not null,
    consent_decision_id text not null,
    admitted_at timestamptz not null,
    admission_contract jsonb not null,
    recorded_at timestamptz not null default now(),
    primary key (operator_id, admission_id),
    unique (operator_id, evidence_reference_id, purpose, intended_claim_type),
    constraint operator_intelligence_evidence_admissions_evidence_fkey
        foreign key (operator_id, evidence_reference_id)
        references public.operator_intelligence_evidence(
            operator_id,
            evidence_reference_id
        ) on delete cascade,
    constraint operator_intelligence_evidence_admissions_disposition_fkey
        foreign key (
            operator_id,
            evidence_reference_id,
            evidence_disposition_id
        ) references public.operator_intelligence_evidence_dispositions(
            operator_id,
            evidence_reference_id,
            disposition_id
        ),
    constraint operator_intelligence_evidence_admissions_session_fkey
        foreign key (session_id, operator_id)
        references public.oracle_sessions(id, operator_id),
    constraint operator_intelligence_evidence_admissions_policy_fkey
        foreign key (policy_id, policy_version)
        references public.operator_data_policy_versions(
            policy_id,
            policy_version
        ),
    constraint operator_intelligence_evidence_admissions_consent_fkey
        foreign key (
            operator_id,
            purpose,
            policy_id,
            policy_version,
            consent_decision_id
        ) references public.operator_consent_decisions(
            operator_id,
            purpose,
            policy_id,
            policy_version,
            consent_decision_id
        ),
    constraint operator_intelligence_evidence_admissions_claim_type_check
        check (intended_claim_type in (
            'recurring-game-strength', 'recurring-game-weakness'
        )),
    constraint operator_intelligence_evidence_admissions_source_check
        check (source_classification in (
            'game-integration-direct-observation',
            'game-integration-deterministic-transformation'
        )),
    constraint operator_intelligence_evidence_admissions_contract_check
        check (
            admission_contract -> 'contract' ->> 'name' =
                'oracle.operator-game-session-evidence-admission'
            and (admission_contract -> 'contract' ->> 'version')::integer = 1
            and admission_contract ->> 'id' = admission_id
            and (admission_contract ->> 'operatorId')::uuid = operator_id
            and admission_contract ->> 'evidenceReferenceId' =
                evidence_reference_id
            and admission_contract ->> 'evidenceDispositionId' =
                evidence_disposition_id
            and (admission_contract ->> 'sessionId')::uuid = session_id
            and admission_contract ->> 'sourceRecordId' = source_record_id
            and admission_contract ->> 'integrationId' = integration_id
            and admission_contract ->> 'integrationVersion' =
                integration_version
            and admission_contract ->> 'purpose' = purpose
            and admission_contract ->> 'intendedClaimType' = intended_claim_type
            and admission_contract ->> 'sourceClassification' =
                source_classification
            and admission_contract ->> 'policyId' = policy_id
            and admission_contract ->> 'policyVersion' = policy_version
            and admission_contract ->> 'consentDecisionId' =
                consent_decision_id
            and (admission_contract ->> 'admittedAt')::timestamptz = admitted_at
        )
);

create table public.operator_intelligence_claims (
    operator_id uuid not null,
    claim_id text not null,
    current_revision_id text not null,
    current_revision integer not null check (current_revision > 0),
    created_at timestamptz not null default now(),
    primary key (operator_id, claim_id),
    unique (operator_id, claim_id, current_revision_id, current_revision),
    constraint operator_intelligence_claims_operator_fkey
        foreign key (operator_id)
        references public.operators(id) on delete cascade
);

create table public.operator_intelligence_claim_revisions (
    operator_id uuid not null,
    claim_id text not null,
    claim_revision_id text not null,
    revision integer not null,
    claim_type text,
    status text not null,
    epistemic text,
    claim_revision_contract jsonb not null,
    effective_from timestamptz,
    valid_until timestamptz,
    last_assessed_at timestamptz,
    reassess_after timestamptz,
    reassessment_trigger text,
    policy_id text not null,
    policy_version text not null,
    supersedes_revision_id text,
    deleted_at timestamptz,
    recorded_at timestamptz not null default now(),
    primary key (operator_id, claim_revision_id),
    unique (operator_id, claim_id, revision),
    unique (operator_id, claim_id, claim_revision_id),
    unique (operator_id, claim_id, claim_revision_id, revision),
    constraint operator_intelligence_claim_revisions_claim_fkey
        foreign key (operator_id, claim_id)
        references public.operator_intelligence_claims(operator_id, claim_id)
        on delete cascade,
    constraint operator_intelligence_claim_revisions_policy_fkey
        foreign key (policy_id, policy_version)
        references public.operator_data_policy_versions(
            policy_id,
            policy_version
        ),
    constraint operator_intelligence_claim_revisions_supersedes_fkey
        foreign key (operator_id, claim_id, supersedes_revision_id)
        references public.operator_intelligence_claim_revisions(
            operator_id,
            claim_id,
            claim_revision_id
        ),
    constraint operator_intelligence_claim_revisions_status_check
        check (status in (
            'candidate', 'active', 'disputed', 'superseded', 'expired', 'deleted'
        )),
    constraint operator_intelligence_claim_revisions_positive_revision_check
        check (revision > 0),
    constraint operator_intelligence_claim_revisions_revision_chain_check
        check (
            (revision = 1 and supersedes_revision_id is null)
            or (revision > 1 and supersedes_revision_id is not null)
        ),
    constraint operator_intelligence_claim_revisions_lifecycle_check
        check (
            (
                status = 'deleted'
                and claim_type is null
                and epistemic is null
                and deleted_at is not null
                and not (claim_revision_contract ?| array[
                    'type', 'epistemic', 'value', 'confidence', 'explanation',
                    'evidence', 'provenance', 'scope', 'temporalValidity',
                    'eligibility'
                ])
            )
            or (
                status <> 'deleted'
                and claim_type is not null
                and epistemic in ('suspected', 'inferred')
                and deleted_at is null
                and effective_from is not null
                and (
                    valid_until is not null
                    or reassess_after is not null
                    or reassessment_trigger is not null
                )
                and (
                    (status = 'candidate'
                        and epistemic = 'suspected'
                        and claim_revision_contract -> 'explanation' = 'null'::jsonb)
                    or (status <> 'candidate'
                        and epistemic = 'inferred'
                        and claim_revision_contract -> 'explanation' <> 'null'::jsonb)
                )
            )
        ),
    constraint operator_intelligence_claim_revisions_sensitive_type_check
        check (
            claim_type is null
            or claim_type !~* '(addiction|behavioral-dna|behavioural-dna|burnout|clinical-mental-state|disability|ethnicity|frustration|gender|health|learning-style|motivation|personality|political-belief|protected-characteristic|psychological-conclusion|race|religious-belief|religion|sexuality)'
        ),
    constraint operator_intelligence_claim_revisions_initial_family_check
        check (
            claim_type is null
            or claim_type in (
                'recurring-game-strength', 'recurring-game-weakness'
            )
        ),
    constraint operator_intelligence_claim_revisions_contract_check
        check (
            claim_revision_contract -> 'contract' ->> 'name' =
                'oracle.operator-intelligence-claim'
            and (claim_revision_contract -> 'contract' ->> 'version')::integer = 1
            and claim_revision_contract ->> 'id' = claim_revision_id
            and claim_revision_contract ->> 'claimId' = claim_id
            and (claim_revision_contract ->> 'operatorId')::uuid = operator_id
            and (claim_revision_contract ->> 'revision')::integer = revision
            and claim_revision_contract ->> 'status' = status
            and claim_revision_contract ->> 'policyId' = policy_id
            and claim_revision_contract ->> 'policyVersion' = policy_version
            and coalesce(claim_revision_contract ->> 'supersedesRevisionId', '') =
                coalesce(supersedes_revision_id, '')
            and not (claim_revision_contract ? 'evidence')
            and not (claim_revision_contract ? 'eligibility')
        )
);

alter table public.operator_intelligence_claims
    add constraint operator_intelligence_claims_current_revision_fkey
    foreign key (
        operator_id,
        claim_id,
        current_revision_id,
        current_revision
    )
    references public.operator_intelligence_claim_revisions(
        operator_id,
        claim_id,
        claim_revision_id,
        revision
    )
    deferrable initially deferred;

create table public.operator_intelligence_claim_evidence (
    operator_id uuid not null,
    claim_id text not null,
    claim_revision_id text not null,
    evidence_reference_id text not null,
    relationship text not null,
    rationale text not null,
    linked_at timestamptz not null,
    primary key (operator_id, claim_revision_id, evidence_reference_id),
    constraint operator_intelligence_claim_evidence_revision_fkey
        foreign key (operator_id, claim_id, claim_revision_id)
        references public.operator_intelligence_claim_revisions(
            operator_id,
            claim_id,
            claim_revision_id
        ) on delete cascade,
    constraint operator_intelligence_claim_evidence_reference_fkey
        foreign key (operator_id, evidence_reference_id)
        references public.operator_intelligence_evidence(
            operator_id,
            evidence_reference_id
        ),
    constraint operator_intelligence_claim_evidence_relationship_check
        check (relationship in ('support', 'contradict'))
);

create table public.operator_intelligence_eligibility_assessments (
    assessment_id uuid not null default gen_random_uuid(),
    operator_id uuid not null,
    claim_id text not null,
    claim_revision_id text not null,
    eligible boolean not null,
    reasons text[] not null default '{}',
    purpose text not null,
    policy_id text not null,
    policy_version text not null,
    assessed_at timestamptz not null,
    eligibility_contract jsonb not null,
    recorded_at timestamptz not null default now(),
    primary key (operator_id, assessment_id),
    unique (
        operator_id,
        claim_id,
        claim_revision_id,
        purpose,
        assessed_at
    ),
    constraint operator_intelligence_eligibility_revision_fkey
        foreign key (operator_id, claim_id, claim_revision_id)
        references public.operator_intelligence_claim_revisions(
            operator_id,
            claim_id,
            claim_revision_id
        ) on delete cascade,
    constraint operator_intelligence_eligibility_policy_fkey
        foreign key (policy_id, policy_version)
        references public.operator_data_policy_versions(
            policy_id,
            policy_version
        ),
    constraint operator_intelligence_eligibility_state_check
        check (eligible = (cardinality(reasons) = 0)),
    constraint operator_intelligence_eligibility_reasons_check
        check (reasons <@ array[
            'candidate', 'consent-absent', 'consent-revoked', 'disputed',
            'expired', 'superseded', 'deleted', 'outside-purpose',
            'outside-scope', 'insufficient-evidence'
        ]::text[]),
    constraint operator_intelligence_eligibility_contract_check
        check (
            (eligibility_contract ->> 'eligible')::boolean = eligible
            and eligibility_contract -> 'reasons' = to_jsonb(reasons)
            and eligibility_contract ->> 'purpose' = purpose
            and eligibility_contract ->> 'policyId' = policy_id
            and eligibility_contract ->> 'policyVersion' = policy_version
            and (eligibility_contract ->> 'assessedAt')::timestamptz = assessed_at
        )
);

create index operator_intelligence_evidence_operator_captured_idx
    on public.operator_intelligence_evidence(operator_id, captured_at desc);
create index operator_consent_decisions_current_idx
    on public.operator_consent_decisions(
        operator_id,
        purpose,
        effective_at desc,
        recorded_at desc
    );
create index operator_intelligence_evidence_dispositions_current_idx
    on public.operator_intelligence_evidence_dispositions(
        operator_id,
        evidence_reference_id,
        effective_at desc,
        recorded_at desc
    );
create index operator_intelligence_evidence_admissions_policy_idx
    on public.operator_intelligence_evidence_admissions(
        operator_id,
        purpose,
        policy_id,
        policy_version,
        admitted_at desc
    );
create index operator_intelligence_claim_revisions_operator_status_idx
    on public.operator_intelligence_claim_revisions(
        operator_id,
        status,
        effective_from desc
    );
create index operator_intelligence_claim_evidence_reference_idx
    on public.operator_intelligence_claim_evidence(
        operator_id,
        evidence_reference_id
    );
create index operator_intelligence_eligibility_current_idx
    on public.operator_intelligence_eligibility_assessments(
        operator_id,
        claim_revision_id,
        purpose,
        assessed_at desc
    );

create or replace function public.register_operator_data_policy_version(
    p_policy jsonb
)
returns jsonb
language plpgsql
security definer
set search_path = pg_catalog
as $$
declare
    existing_contract jsonb;
begin
    if coalesce(auth.role(), '') <> 'service_role' then
        raise exception 'Trusted Operator Intelligence authority is required.'
            using errcode = '42501';
    end if;

    if (p_policy -> 'contract' ->> 'name') <>
            'oracle.operator-data-policy-definition'
       or (p_policy -> 'contract' ->> 'version')::integer <> 1 then
        raise exception 'Unsupported Operator data policy contract.'
            using errcode = '22023';
    end if;

    insert into public.operator_data_policy_versions (
        policy_id,
        policy_version,
        purpose,
        retention_class,
        effective_from,
        effective_until,
        allowed_claim_types,
        minimum_evidence_quality,
        allowed_source_classifications,
        evidence_reference_days,
        superseded_claim_revision_days,
        maximum_claim_validity_days,
        reassess_after_days,
        policy_contract
    ) values (
        p_policy ->> 'id',
        p_policy ->> 'policyVersion',
        p_policy ->> 'purpose',
        p_policy ->> 'retentionClass',
        (p_policy ->> 'effectiveFrom')::timestamptz,
        (p_policy ->> 'effectiveUntil')::timestamptz,
        array(select jsonb_array_elements_text(
            p_policy -> 'allowedClaimTypes'
        )),
        (p_policy -> 'evidenceAdmission' ->>
            'minimumQualityScore')::numeric,
        array(select jsonb_array_elements_text(
            p_policy -> 'evidenceAdmission' ->
                'allowedSourceClassifications'
        )),
        (p_policy -> 'retention' ->>
            'evidenceReferenceDays')::integer,
        (p_policy -> 'retention' ->>
            'supersededClaimRevisionDays')::integer,
        (p_policy -> 'claimLifecycle' ->>
            'maximumValidityDays')::integer,
        (p_policy -> 'claimLifecycle' ->>
            'reassessAfterDays')::integer,
        p_policy
    )
    on conflict (policy_id, policy_version) do nothing;

    select policy_contract
    into existing_contract
    from public.operator_data_policy_versions
    where policy_id = p_policy ->> 'id'
      and policy_version = p_policy ->> 'policyVersion';

    if existing_contract is distinct from p_policy then
        raise exception 'Operator data policy version is immutable.'
            using errcode = '23505';
    end if;

    return existing_contract;
end;
$$;

create or replace function public.append_operator_consent_decision(
    p_operator_id uuid,
    p_consent jsonb
)
returns jsonb
language plpgsql
security definer
set search_path = pg_catalog
as $$
declare
    current_decision record;
    existing_contract jsonb;
begin
    if coalesce(auth.role(), '') <> 'service_role' then
        raise exception 'Trusted Operator Intelligence authority is required.'
            using errcode = '42501';
    end if;

    if (p_consent -> 'contract' ->> 'name') <>
            'oracle.operator-consent-decision'
       or (p_consent -> 'contract' ->> 'version')::integer <> 1
       or (p_consent ->> 'operatorId')::uuid <> p_operator_id then
        raise exception 'Invalid Operator consent contract or ownership.'
            using errcode = '22023';
    end if;

    if not exists (
        select 1
        from public.operator_data_policy_versions policy
        where policy.policy_id = p_consent ->> 'policyId'
          and policy.policy_version = p_consent ->> 'policyVersion'
          and policy.purpose = p_consent ->> 'purpose'
    ) then
        raise exception 'Consent must reference an existing purpose policy.'
            using errcode = '23503';
    end if;

    select
        consent_decision_id,
        effective_at,
        recorded_at
    into current_decision
    from public.operator_consent_decisions
    where operator_id = p_operator_id
      and purpose = p_consent ->> 'purpose'
    order by recorded_at desc, effective_at desc, consent_decision_id desc
    limit 1
    for update;

    if not found then
        if p_consent ->> 'supersedesDecisionId' is not null then
            raise exception 'Initial consent cannot supersede another decision.'
                using errcode = '23514';
        end if;
    elsif p_consent ->> 'supersedesDecisionId' is distinct from
            current_decision.consent_decision_id
       or (p_consent ->> 'effectiveAt')::timestamptz <
            current_decision.effective_at
       or (p_consent ->> 'recordedAt')::timestamptz <
            current_decision.recorded_at then
        raise exception 'Consent decision does not append to the current history.'
            using errcode = '40001';
    end if;

    insert into public.operator_consent_decisions (
        operator_id,
        consent_decision_id,
        purpose,
        policy_id,
        policy_version,
        decision,
        effective_at,
        recorded_at,
        supersedes_decision_id,
        consent_contract
    ) values (
        p_operator_id,
        p_consent ->> 'id',
        p_consent ->> 'purpose',
        p_consent ->> 'policyId',
        p_consent ->> 'policyVersion',
        p_consent ->> 'decision',
        (p_consent ->> 'effectiveAt')::timestamptz,
        (p_consent ->> 'recordedAt')::timestamptz,
        p_consent ->> 'supersedesDecisionId',
        p_consent
    )
    on conflict (operator_id, consent_decision_id) do nothing;

    select consent_contract
    into existing_contract
    from public.operator_consent_decisions
    where operator_id = p_operator_id
      and consent_decision_id = p_consent ->> 'id';

    if existing_contract is distinct from p_consent then
        raise exception 'Operator consent decisions are immutable.'
            using errcode = '23505';
    end if;

    return existing_contract;
end;
$$;

create or replace function public.admit_operator_game_session_evidence(
    p_operator_id uuid,
    p_evidence jsonb,
    p_disposition jsonb,
    p_admission jsonb
)
returns jsonb
language plpgsql
security definer
set search_path = pg_catalog
as $$
declare
    policy record;
    current_consent record;
    existing_evidence jsonb;
    existing_disposition jsonb;
    existing_admission jsonb;
begin
    if coalesce(auth.role(), '') <> 'service_role' then
        raise exception 'Trusted Operator Intelligence authority is required.'
            using errcode = '42501';
    end if;

    if (p_evidence ->> 'operatorId')::uuid <> p_operator_id
       or (p_disposition ->> 'operatorId')::uuid <> p_operator_id
       or (p_admission ->> 'operatorId')::uuid <> p_operator_id then
        raise exception 'Evidence admission cannot cross Operator ownership.'
            using errcode = '42501';
    end if;

    if p_evidence -> 'contract' ->> 'name' <>
            'oracle.operator-evidence-reference'
       or (p_evidence -> 'contract' ->> 'version')::integer <> 1
       or p_disposition -> 'contract' ->> 'name' <>
            'oracle.operator-evidence-disposition'
       or (p_disposition -> 'contract' ->> 'version')::integer <> 1
       or p_admission -> 'contract' ->> 'name' <>
            'oracle.operator-game-session-evidence-admission'
       or (p_admission -> 'contract' ->> 'version')::integer <> 1 then
        raise exception 'Unsupported evidence admission contract.'
            using errcode = '22023';
    end if;

    if p_admission ->> 'evidenceReferenceId' is distinct from p_evidence ->> 'id'
       or p_disposition ->> 'evidenceReferenceId' is distinct from
            p_evidence ->> 'id'
       or p_admission ->> 'evidenceDispositionId' is distinct from
            p_disposition ->> 'id'
       or p_admission ->> 'sessionId' is distinct from
            p_evidence -> 'scope' ->> 'sessionId'
       or p_admission ->> 'sourceRecordId' is distinct from
            p_evidence ->> 'sourceRecordId'
       or p_admission ->> 'integrationId' is distinct from
            p_evidence -> 'scope' ->> 'integrationId'
       or p_admission ->> 'integrationVersion' is distinct from
            p_evidence -> 'scope' ->> 'integrationVersion'
       or p_admission ->> 'purpose' is distinct from p_evidence ->> 'purpose'
       or p_admission ->> 'policyId' is distinct from p_evidence ->> 'policyId'
       or p_admission ->> 'policyVersion' is distinct from
            p_evidence ->> 'policyVersion' then
        raise exception 'Evidence admission identity and scope do not match.'
            using errcode = '23514';
    end if;

    if p_evidence -> 'producer' ->> 'version' !~
            '^(0|[1-9][0-9]*)\.(0|[1-9][0-9]*)\.(0|[1-9][0-9]*)(-[0-9A-Za-z.-]+)?(\+[0-9A-Za-z.-]+)?$'
       or p_admission ->> 'integrationVersion' !~
            '^(0|[1-9][0-9]*)\.(0|[1-9][0-9]*)\.(0|[1-9][0-9]*)(-[0-9A-Za-z.-]+)?(\+[0-9A-Za-z.-]+)?$' then
        raise exception 'Evidence producer and Game Integration versions must be stable semantic versions.'
            using errcode = '23514';
    end if;

    select *
    into policy
    from public.operator_data_policy_versions policy_version
    where policy_version.policy_id = p_admission ->> 'policyId'
      and policy_version.policy_version = p_admission ->> 'policyVersion'
      and policy_version.purpose = p_admission ->> 'purpose'
      and (p_admission ->> 'admittedAt')::timestamptz >=
            policy_version.effective_from
      and (
          policy_version.effective_until is null
          or (p_admission ->> 'admittedAt')::timestamptz <
                policy_version.effective_until
      );

    if not found
       or not ((p_admission ->> 'intendedClaimType') =
            any(policy.allowed_claim_types))
       or not ((p_admission ->> 'sourceClassification') =
            any(policy.allowed_source_classifications))
       or p_evidence ->> 'retentionClass' is distinct from
            policy.retention_class
       or (p_evidence -> 'quality' ->> 'policyId') is distinct from
            policy.policy_id
       or (p_evidence -> 'quality' ->> 'policyVersion') is distinct from
            policy.policy_version
       or (p_evidence -> 'quality' ->> 'score')::numeric <
            policy.minimum_evidence_quality then
        raise exception 'Evidence does not satisfy the effective admission policy.'
            using errcode = '23514';
    end if;

    select
        consent_decision_id,
        decision,
        policy_id,
        policy_version
    into current_consent
    from public.operator_consent_decisions
    where operator_id = p_operator_id
      and purpose = p_admission ->> 'purpose'
      and effective_at <= (p_admission ->> 'admittedAt')::timestamptz
    order by effective_at desc, recorded_at desc, consent_decision_id desc
    limit 1;

    if not found
       or current_consent.decision <> 'granted'
       or current_consent.consent_decision_id is distinct from
            p_admission ->> 'consentDecisionId'
       or current_consent.policy_id is distinct from p_admission ->> 'policyId'
       or current_consent.policy_version is distinct from
            p_admission ->> 'policyVersion' then
        raise exception 'Current purpose-specific consent is required.'
            using errcode = '42501';
    end if;

    if not exists (
        select 1
        from public.oracle_sessions session_record
        where session_record.id = (p_admission ->> 'sessionId')::uuid
          and session_record.operator_id = p_operator_id
    ) then
        raise exception 'Evidence Session ownership cannot be proven.'
            using errcode = '42501';
    end if;

    if p_disposition ->> 'disposition' <> 'available'
       or p_disposition ->> 'supersedesDispositionId' is not null
       or (p_evidence ->> 'capturedAt')::timestamptz >
            (p_admission ->> 'admittedAt')::timestamptz
       or (p_evidence -> 'quality' ->> 'assessedAt')::timestamptz >
            (p_admission ->> 'admittedAt')::timestamptz then
        raise exception 'Initial evidence availability or timing is invalid.'
            using errcode = '23514';
    end if;

    if p_admission ->> 'sourceClassification' =
            'game-integration-direct-observation' then
        if p_evidence ->> 'sourceType' <> 'game-integration-observation'
           or p_evidence ->> 'sourceOwnerId' is distinct from
                p_admission ->> 'integrationId'
           or p_evidence -> 'producer' ->> 'method' <> 'direct-observation'
           or p_evidence -> 'producer' ->> 'id' is distinct from
                p_admission ->> 'integrationId'
           or p_evidence -> 'producer' ->> 'version' is distinct from
                p_admission ->> 'integrationVersion' then
            raise exception 'Direct observation provenance is invalid.'
                using errcode = '23514';
        end if;
    elsif p_evidence ->> 'sourceType' <> 'session'
          or p_evidence -> 'producer' ->> 'method' <>
                'deterministic-transformation' then
        raise exception 'Deterministic Session provenance is invalid.'
            using errcode = '23514';
    end if;

    insert into public.operator_intelligence_evidence (
        operator_id,
        evidence_reference_id,
        source_type,
        source_owner_id,
        source_record_id,
        observed_at,
        captured_at,
        purpose,
        producer_id,
        producer_version,
        producer_method,
        session_id,
        integration_id,
        integration_version,
        evidence_quality_score,
        content_digest,
        retention_class,
        policy_id,
        policy_version,
        evidence_contract
    ) values (
        p_operator_id,
        p_evidence ->> 'id',
        p_evidence ->> 'sourceType',
        p_evidence ->> 'sourceOwnerId',
        p_evidence ->> 'sourceRecordId',
        (p_evidence ->> 'observedAt')::timestamptz,
        (p_evidence ->> 'capturedAt')::timestamptz,
        p_evidence ->> 'purpose',
        p_evidence -> 'producer' ->> 'id',
        p_evidence -> 'producer' ->> 'version',
        p_evidence -> 'producer' ->> 'method',
        (p_evidence -> 'scope' ->> 'sessionId')::uuid,
        p_evidence -> 'scope' ->> 'integrationId',
        p_evidence -> 'scope' ->> 'integrationVersion',
        (p_evidence -> 'quality' ->> 'score')::numeric,
        p_evidence ->> 'contentDigest',
        p_evidence ->> 'retentionClass',
        p_evidence ->> 'policyId',
        p_evidence ->> 'policyVersion',
        p_evidence
    )
    on conflict (operator_id, evidence_reference_id) do nothing;

    select evidence_contract
    into existing_evidence
    from public.operator_intelligence_evidence
    where operator_id = p_operator_id
      and evidence_reference_id = p_evidence ->> 'id';

    if existing_evidence is distinct from p_evidence then
        raise exception 'Operator evidence references are immutable.'
            using errcode = '23505';
    end if;

    insert into public.operator_intelligence_evidence_dispositions (
        operator_id,
        evidence_reference_id,
        disposition_id,
        disposition,
        reason,
        effective_at,
        recorded_at,
        supersedes_disposition_id,
        disposition_contract
    ) values (
        p_operator_id,
        p_disposition ->> 'evidenceReferenceId',
        p_disposition ->> 'id',
        p_disposition ->> 'disposition',
        p_disposition ->> 'reason',
        (p_disposition ->> 'effectiveAt')::timestamptz,
        (p_disposition ->> 'recordedAt')::timestamptz,
        p_disposition ->> 'supersedesDispositionId',
        p_disposition
    )
    on conflict (
        operator_id,
        evidence_reference_id,
        disposition_id
    ) do nothing;

    select disposition_contract
    into existing_disposition
    from public.operator_intelligence_evidence_dispositions
    where operator_id = p_operator_id
      and evidence_reference_id = p_disposition ->> 'evidenceReferenceId'
      and disposition_id = p_disposition ->> 'id';

    if existing_disposition is distinct from p_disposition then
        raise exception 'Evidence dispositions are immutable.'
            using errcode = '23505';
    end if;

    insert into public.operator_intelligence_evidence_admissions (
        operator_id,
        admission_id,
        evidence_reference_id,
        evidence_disposition_id,
        session_id,
        source_record_id,
        integration_id,
        integration_version,
        purpose,
        intended_claim_type,
        source_classification,
        policy_id,
        policy_version,
        consent_decision_id,
        admitted_at,
        admission_contract
    ) values (
        p_operator_id,
        p_admission ->> 'id',
        p_admission ->> 'evidenceReferenceId',
        p_admission ->> 'evidenceDispositionId',
        (p_admission ->> 'sessionId')::uuid,
        p_admission ->> 'sourceRecordId',
        p_admission ->> 'integrationId',
        p_admission ->> 'integrationVersion',
        p_admission ->> 'purpose',
        p_admission ->> 'intendedClaimType',
        p_admission ->> 'sourceClassification',
        p_admission ->> 'policyId',
        p_admission ->> 'policyVersion',
        p_admission ->> 'consentDecisionId',
        (p_admission ->> 'admittedAt')::timestamptz,
        p_admission
    )
    on conflict (operator_id, admission_id) do nothing;

    select admission_contract
    into existing_admission
    from public.operator_intelligence_evidence_admissions
    where operator_id = p_operator_id
      and admission_id = p_admission ->> 'id';

    if existing_admission is distinct from p_admission then
        raise exception 'Evidence admissions are immutable.'
            using errcode = '23505';
    end if;

    return existing_admission;
end;
$$;

create or replace function public.append_operator_evidence_disposition(
    p_operator_id uuid,
    p_disposition jsonb
)
returns jsonb
language plpgsql
security definer
set search_path = pg_catalog
as $$
declare
    current_disposition record;
    existing_contract jsonb;
begin
    if coalesce(auth.role(), '') <> 'service_role' then
        raise exception 'Trusted Operator Intelligence authority is required.'
            using errcode = '42501';
    end if;

    if (p_disposition ->> 'operatorId')::uuid <> p_operator_id
       or p_disposition -> 'contract' ->> 'name' <>
            'oracle.operator-evidence-disposition'
       or (p_disposition -> 'contract' ->> 'version')::integer <> 1 then
        raise exception 'Invalid evidence disposition contract or ownership.'
            using errcode = '22023';
    end if;

    select
        disposition_id,
        effective_at,
        recorded_at
    into current_disposition
    from public.operator_intelligence_evidence_dispositions
    where operator_id = p_operator_id
      and evidence_reference_id = p_disposition ->> 'evidenceReferenceId'
    order by recorded_at desc, effective_at desc, disposition_id desc
    limit 1
    for update;

    if not found
       or p_disposition ->> 'supersedesDispositionId' is distinct from
            current_disposition.disposition_id
       or (p_disposition ->> 'effectiveAt')::timestamptz <
            current_disposition.effective_at
       or (p_disposition ->> 'recordedAt')::timestamptz <
            current_disposition.recorded_at then
        raise exception 'Disposition does not append to current evidence history.'
            using errcode = '40001';
    end if;

    insert into public.operator_intelligence_evidence_dispositions (
        operator_id,
        evidence_reference_id,
        disposition_id,
        disposition,
        reason,
        effective_at,
        recorded_at,
        supersedes_disposition_id,
        disposition_contract
    ) values (
        p_operator_id,
        p_disposition ->> 'evidenceReferenceId',
        p_disposition ->> 'id',
        p_disposition ->> 'disposition',
        p_disposition ->> 'reason',
        (p_disposition ->> 'effectiveAt')::timestamptz,
        (p_disposition ->> 'recordedAt')::timestamptz,
        p_disposition ->> 'supersedesDispositionId',
        p_disposition
    )
    on conflict (
        operator_id,
        evidence_reference_id,
        disposition_id
    ) do nothing;

    select disposition_contract
    into existing_contract
    from public.operator_intelligence_evidence_dispositions
    where operator_id = p_operator_id
      and evidence_reference_id = p_disposition ->> 'evidenceReferenceId'
      and disposition_id = p_disposition ->> 'id';

    if existing_contract is distinct from p_disposition then
        raise exception 'Evidence dispositions are immutable.'
            using errcode = '23505';
    end if;

    return existing_contract;
end;
$$;

create or replace function public.persist_operator_intelligence_claim_revision(
    p_operator_id uuid,
    p_evidence jsonb[],
    p_claim_revision jsonb
)
returns jsonb
language plpgsql
security definer
set search_path = pg_catalog
as $$
declare
    evidence_item jsonb;
    evidence_link jsonb;
    current_claim record;
    claim_existed boolean := false;
    revision_contract jsonb;
    eligibility jsonb;
begin
    if coalesce(auth.role(), '') <> 'service_role' then
        raise exception 'Trusted Operator Intelligence authority is required.'
            using errcode = '42501';
    end if;

    if (p_claim_revision ->> 'operatorId')::uuid <> p_operator_id then
        raise exception 'Claim revision Operator ownership does not match.'
            using errcode = '42501';
    end if;

    revision_contract := p_claim_revision - 'evidence' - 'eligibility';
    eligibility := p_claim_revision -> 'eligibility';

    if p_claim_revision ->> 'status' <> 'deleted'
       and coalesce(array_length(p_evidence, 1), 0) = 0 then
        raise exception 'Durable intelligence requires admitted evidence.'
            using errcode = '23514';
    end if;

    if p_claim_revision ->> 'status' <> 'deleted'
       and (
           jsonb_typeof(p_claim_revision -> 'evidence') is distinct from 'array'
           or jsonb_array_length(p_claim_revision -> 'evidence') < 1
           or jsonb_array_length(p_claim_revision -> 'evidence') <>
                coalesce(array_length(p_evidence, 1), 0)
       ) then
        raise exception 'Claim evidence links must exactly match admitted evidence.'
            using errcode = '23514';
    end if;

    foreach evidence_item in array coalesce(p_evidence, array[]::jsonb[])
    loop
        if (evidence_item ->> 'operatorId')::uuid <> p_operator_id then
            raise exception 'Evidence Operator ownership does not match.'
                using errcode = '42501';
        end if;

        if not exists (
            select 1
            from public.operator_intelligence_evidence evidence_record
            join public.operator_intelligence_evidence_admissions admission
              on admission.operator_id = evidence_record.operator_id
             and admission.evidence_reference_id =
                    evidence_record.evidence_reference_id
            where evidence_record.operator_id = p_operator_id
              and evidence_record.evidence_reference_id = evidence_item ->> 'id'
              and evidence_record.evidence_contract = evidence_item
              and admission.intended_claim_type = p_claim_revision ->> 'type'
              and admission.purpose = eligibility ->> 'purpose'
              and admission.policy_id = p_claim_revision ->> 'policyId'
              and admission.policy_version =
                    p_claim_revision ->> 'policyVersion'
              and (
                  select consent.decision
                  from public.operator_consent_decisions consent
                  where consent.operator_id = p_operator_id
                    and consent.purpose = admission.purpose
                    and consent.effective_at <=
                        (eligibility ->> 'assessedAt')::timestamptz
                  order by consent.effective_at desc,
                      consent.recorded_at desc,
                      consent.consent_decision_id desc
                  limit 1
              ) = 'granted'
              and (
                  select disposition.disposition
                  from public.operator_intelligence_evidence_dispositions
                      disposition
                  where disposition.operator_id = p_operator_id
                    and disposition.evidence_reference_id =
                        evidence_record.evidence_reference_id
                    and disposition.effective_at <=
                        (eligibility ->> 'assessedAt')::timestamptz
                  order by disposition.effective_at desc,
                      disposition.recorded_at desc,
                      disposition.disposition_id desc
                  limit 1
              ) = 'available'
        ) then
            raise exception 'Claim evidence is not currently admitted.'
                using errcode = '23514';
        end if;
    end loop;

    select
        claim.claim_id,
        claim.current_revision_id,
        claim.current_revision,
        revision.status as current_status
    into current_claim
    from public.operator_intelligence_claims claim
    join public.operator_intelligence_claim_revisions revision
      on revision.operator_id = claim.operator_id
     and revision.claim_id = claim.claim_id
     and revision.claim_revision_id = claim.current_revision_id
    where claim.operator_id = p_operator_id
      and claim.claim_id = p_claim_revision ->> 'claimId'
    for update;

    if not found then
        if (p_claim_revision ->> 'revision')::integer <> 1
           or p_claim_revision ->> 'supersedesRevisionId' is not null then
            raise exception 'A new claim must begin at revision one.'
                using errcode = '23514';
        end if;

        insert into public.operator_intelligence_claims (
            operator_id,
            claim_id,
            current_revision_id,
            current_revision
        ) values (
            p_operator_id,
            p_claim_revision ->> 'claimId',
            p_claim_revision ->> 'id',
            (p_claim_revision ->> 'revision')::integer
        );
    else
        claim_existed := true;
        if (p_claim_revision ->> 'supersedesRevisionId') is distinct from
                current_claim.current_revision_id
           or (p_claim_revision ->> 'revision')::integer <>
                current_claim.current_revision + 1 then
            raise exception 'Claim revision does not supersede the current head.'
                using errcode = '40001';
        end if;

        if not (
            (current_claim.current_status = 'candidate'
                and p_claim_revision ->> 'status' in ('active', 'expired', 'deleted'))
            or (current_claim.current_status = 'active'
                and p_claim_revision ->> 'status' in (
                    'active', 'disputed', 'superseded', 'expired', 'deleted'
                ))
            or (current_claim.current_status = 'disputed'
                and p_claim_revision ->> 'status' in (
                    'active', 'superseded', 'expired', 'deleted'
                ))
            or (current_claim.current_status = 'superseded'
                and p_claim_revision ->> 'status' = 'deleted')
            or (current_claim.current_status = 'expired'
                and p_claim_revision ->> 'status' in ('candidate', 'deleted'))
        ) then
            raise exception 'Operator Intelligence lifecycle transition is invalid.'
                using errcode = '23514';
        end if;
    end if;

    if p_claim_revision ->> 'status' = 'deleted' then
        if eligibility is not null then
            raise exception 'Deleted claim tombstones cannot carry eligibility.'
                using errcode = '23514';
        end if;
    elsif eligibility is null then
        raise exception 'Claim revisions require an eligibility assessment.'
            using errcode = '23514';
    elsif p_claim_revision ->> 'status' = 'candidate' then
        if (eligibility ->> 'eligible')::boolean
           or not (eligibility -> 'reasons' ? 'candidate') then
            raise exception 'Candidate claims must be ineligible as candidates.'
                using errcode = '23514';
        end if;
    elsif p_claim_revision ->> 'status' = 'active' then
        if not (eligibility ->> 'eligible')::boolean
           or jsonb_array_length(eligibility -> 'reasons') <> 0 then
            raise exception 'Active claims require eligible assessment.'
                using errcode = '23514';
        end if;
    elsif (eligibility ->> 'eligible')::boolean
          or not (eligibility -> 'reasons' ? (p_claim_revision ->> 'status')) then
        raise exception 'Inactive claims require their lifecycle eligibility reason.'
            using errcode = '23514';
    end if;

    insert into public.operator_intelligence_claim_revisions (
        operator_id,
        claim_id,
        claim_revision_id,
        revision,
        claim_type,
        status,
        epistemic,
        claim_revision_contract,
        effective_from,
        valid_until,
        last_assessed_at,
        reassess_after,
        reassessment_trigger,
        policy_id,
        policy_version,
        supersedes_revision_id,
        deleted_at
    ) values (
        p_operator_id,
        p_claim_revision ->> 'claimId',
        p_claim_revision ->> 'id',
        (p_claim_revision ->> 'revision')::integer,
        p_claim_revision ->> 'type',
        p_claim_revision ->> 'status',
        p_claim_revision ->> 'epistemic',
        revision_contract,
        (p_claim_revision -> 'temporalValidity' ->> 'effectiveFrom')::timestamptz,
        (p_claim_revision -> 'temporalValidity' ->> 'validUntil')::timestamptz,
        (p_claim_revision -> 'temporalValidity' ->> 'lastAssessedAt')::timestamptz,
        (p_claim_revision -> 'temporalValidity' ->> 'reassessAfter')::timestamptz,
        p_claim_revision -> 'temporalValidity' ->> 'reassessmentTrigger',
        p_claim_revision ->> 'policyId',
        p_claim_revision ->> 'policyVersion',
        p_claim_revision ->> 'supersedesRevisionId',
        (p_claim_revision ->> 'deletedAt')::timestamptz
    );

    for evidence_link in
        select value from jsonb_array_elements(
            coalesce(p_claim_revision -> 'evidence', '[]'::jsonb)
        )
    loop
        if not exists (
            select 1
            from unnest(coalesce(p_evidence, array[]::jsonb[])) evidence_record
            where evidence_record ->> 'id' =
                evidence_link ->> 'evidenceReferenceId'
        ) then
            raise exception 'Every claim evidence link must be admitted and supplied.'
                using errcode = '23514';
        end if;

        insert into public.operator_intelligence_claim_evidence (
            operator_id,
            claim_id,
            claim_revision_id,
            evidence_reference_id,
            relationship,
            rationale,
            linked_at
        ) values (
            p_operator_id,
            p_claim_revision ->> 'claimId',
            p_claim_revision ->> 'id',
            evidence_link ->> 'evidenceReferenceId',
            evidence_link ->> 'relationship',
            evidence_link ->> 'rationale',
            (evidence_link ->> 'linkedAt')::timestamptz
        );
    end loop;

    if eligibility is not null then
        insert into public.operator_intelligence_eligibility_assessments (
            operator_id,
            claim_id,
            claim_revision_id,
            eligible,
            reasons,
            purpose,
            policy_id,
            policy_version,
            assessed_at,
            eligibility_contract
        ) values (
            p_operator_id,
            p_claim_revision ->> 'claimId',
            p_claim_revision ->> 'id',
            (eligibility ->> 'eligible')::boolean,
            array(select jsonb_array_elements_text(eligibility -> 'reasons')),
            eligibility ->> 'purpose',
            eligibility ->> 'policyId',
            eligibility ->> 'policyVersion',
            (eligibility ->> 'assessedAt')::timestamptz,
            eligibility
        );
    end if;

    if claim_existed then
        update public.operator_intelligence_claims
        set current_revision_id = p_claim_revision ->> 'id',
            current_revision = (p_claim_revision ->> 'revision')::integer
        where operator_id = p_operator_id
          and claim_id = p_claim_revision ->> 'claimId';
    end if;

    return p_claim_revision;
end;
$$;

create or replace function public.append_operator_intelligence_eligibility(
    p_operator_id uuid,
    p_claim_id text,
    p_claim_revision_id text,
    p_eligibility jsonb
)
returns jsonb
language plpgsql
security definer
set search_path = pg_catalog
as $$
declare
    claim_record record;
begin
    if coalesce(auth.role(), '') <> 'service_role' then
        raise exception 'Trusted Operator Intelligence authority is required.'
            using errcode = '42501';
    end if;

    select revision.status, revision.claim_type, revision.policy_id,
        revision.policy_version
    into claim_record
    from public.operator_intelligence_claim_revisions revision
    where revision.operator_id = p_operator_id
      and revision.claim_id = p_claim_id
      and revision.claim_revision_id = p_claim_revision_id;

    if not found
       or claim_record.policy_id is distinct from p_eligibility ->> 'policyId'
       or claim_record.policy_version is distinct from
            p_eligibility ->> 'policyVersion' then
        raise exception 'Eligibility must reference the owned claim policy.'
            using errcode = '23514';
    end if;

    if (p_eligibility ->> 'eligible')::boolean and (
        claim_record.status <> 'active'
        or not exists (
            select 1
            from public.operator_consent_decisions consent
            where consent.operator_id = p_operator_id
              and consent.purpose = p_eligibility ->> 'purpose'
              and consent.policy_id = p_eligibility ->> 'policyId'
              and consent.policy_version = p_eligibility ->> 'policyVersion'
              and consent.decision = 'granted'
              and consent.effective_at <=
                    (p_eligibility ->> 'assessedAt')::timestamptz
              and not exists (
                  select 1
                  from public.operator_consent_decisions later
                  where later.operator_id = consent.operator_id
                    and later.purpose = consent.purpose
                    and later.effective_at <=
                        (p_eligibility ->> 'assessedAt')::timestamptz
                    and (
                        later.effective_at > consent.effective_at
                        or (later.effective_at = consent.effective_at
                            and later.recorded_at > consent.recorded_at)
                    )
              )
        )
        or exists (
            select 1
            from public.operator_intelligence_claim_evidence link
            where link.operator_id = p_operator_id
              and link.claim_id = p_claim_id
              and link.claim_revision_id = p_claim_revision_id
              and not exists (
                  select 1
                  from public.operator_intelligence_evidence_admissions admission
                  where admission.operator_id = link.operator_id
                    and admission.evidence_reference_id =
                        link.evidence_reference_id
                    and admission.purpose = p_eligibility ->> 'purpose'
                    and admission.intended_claim_type = claim_record.claim_type
                    and admission.policy_id = p_eligibility ->> 'policyId'
                    and admission.policy_version =
                        p_eligibility ->> 'policyVersion'
                    and (
                        select disposition.disposition
                        from public.operator_intelligence_evidence_dispositions
                            disposition
                        where disposition.operator_id = link.operator_id
                          and disposition.evidence_reference_id =
                            link.evidence_reference_id
                          and disposition.effective_at <=
                            (p_eligibility ->> 'assessedAt')::timestamptz
                        order by disposition.effective_at desc,
                            disposition.recorded_at desc,
                            disposition.disposition_id desc
                        limit 1
                    ) = 'available'
              )
        )
    ) then
        raise exception 'Eligible intelligence requires current consent and evidence.'
            using errcode = '23514';
    end if;

    insert into public.operator_intelligence_eligibility_assessments (
        operator_id,
        claim_id,
        claim_revision_id,
        eligible,
        reasons,
        purpose,
        policy_id,
        policy_version,
        assessed_at,
        eligibility_contract
    ) values (
        p_operator_id,
        p_claim_id,
        p_claim_revision_id,
        (p_eligibility ->> 'eligible')::boolean,
        array(select jsonb_array_elements_text(p_eligibility -> 'reasons')),
        p_eligibility ->> 'purpose',
        p_eligibility ->> 'policyId',
        p_eligibility ->> 'policyVersion',
        (p_eligibility ->> 'assessedAt')::timestamptz,
        p_eligibility
    );

    return p_eligibility;
end;
$$;

create or replace function public.read_operator_intelligence_eligible_claim_page(
    p_operator_id uuid,
    p_purpose text,
    p_as_of timestamptz,
    p_scope jsonb,
    p_page_size integer,
    p_read_watermark timestamptz default null,
    p_after_effective_from timestamptz default null,
    p_after_revision_id text default null
)
returns jsonb
language plpgsql
security definer
set search_path = pg_catalog
as $$
declare
    effective_watermark timestamptz := coalesce(
        p_read_watermark,
        statement_timestamp()
    );
    page_rows jsonb;
    page_has_more boolean;
begin
    if coalesce(auth.role(), '') <> 'service_role' then
        raise exception 'Trusted Operator Intelligence authority is required.'
            using errcode = '42501';
    end if;

    if p_page_size < 1 or p_page_size > 100 then
        raise exception 'Operator Intelligence page size is outside its budget.'
            using errcode = '22023';
    end if;

    if (p_after_effective_from is null) <> (p_after_revision_id is null) then
        raise exception 'Operator Intelligence page position is incomplete.'
            using errcode = '22023';
    end if;

    with historical_heads as (
        select distinct on (revision.claim_id)
            revision.operator_id,
            revision.claim_id,
            revision.claim_revision_id,
            revision.claim_revision_contract,
            revision.effective_from
        from public.operator_intelligence_claim_revisions revision
        where revision.operator_id = p_operator_id
          and revision.recorded_at <= effective_watermark
        order by revision.claim_id, revision.revision desc
    ), eligible_heads as (
        select
            head.*,
            eligibility.eligibility_contract
        from historical_heads head
        cross join lateral (
            select assessment.eligibility_contract
            from public.operator_intelligence_eligibility_assessments assessment
            where assessment.operator_id = head.operator_id
              and assessment.claim_id = head.claim_id
              and assessment.claim_revision_id = head.claim_revision_id
              and assessment.purpose = p_purpose
              and assessment.assessed_at <= p_as_of
              and assessment.recorded_at <= effective_watermark
            order by assessment.assessed_at desc,
                assessment.recorded_at desc,
                assessment.assessment_id desc
            limit 1
        ) eligibility
        where head.claim_revision_contract ->> 'status' = 'active'
          and (eligibility.eligibility_contract ->> 'eligible')::boolean
          and head.effective_from <= p_as_of
          and (
              (head.claim_revision_contract -> 'temporalValidity'
                  ->> 'validUntil') is null
              or (head.claim_revision_contract -> 'temporalValidity'
                  ->> 'validUntil')::timestamptz > p_as_of
          )
          and (
              p_scope is null
              or head.claim_revision_contract -> 'scope' = p_scope
          )
          and (
              p_after_effective_from is null
              or head.effective_from < p_after_effective_from
              or (
                  head.effective_from = p_after_effective_from
                  and head.claim_revision_id > p_after_revision_id
              )
          )
        order by head.effective_from desc, head.claim_revision_id asc
        limit p_page_size + 1
    ), numbered_page as (
        select eligible_heads.*, row_number() over (
            order by effective_from desc, claim_revision_id asc
        ) as page_row_number
        from eligible_heads
    ), projected_page as (
        select
          page.effective_from,
          page.claim_revision_id,
          jsonb_build_object(
            'claimRevisionId', page.claim_revision_id,
            'effectiveFrom', page.effective_from,
            'claimRevisionContract', page.claim_revision_contract,
            'eligibilityContract', page.eligibility_contract,
            'evidenceLinks', coalesce(evidence_projection.links, '[]'::jsonb),
            'evidenceContracts', coalesce(
                evidence_projection.evidence_contracts,
                '[]'::jsonb
            )
        ) as projected
        from numbered_page page
        left join lateral (
            with selected_links as (
                select link.*
                from public.operator_intelligence_claim_evidence link
                where link.operator_id = p_operator_id
                  and link.claim_revision_id = page.claim_revision_id
                order by link.evidence_reference_id
                limit 33
            )
            select
                jsonb_agg(
                    jsonb_build_object(
                        'claimId', link.claim_id,
                        'claimRevisionId', link.claim_revision_id,
                        'evidenceReferenceId', link.evidence_reference_id,
                        'relationship', link.relationship,
                        'rationale', link.rationale,
                        'linkedAt', link.linked_at
                    ) order by link.evidence_reference_id
                ) as links,
                jsonb_agg(
                    evidence.evidence_contract
                    order by link.evidence_reference_id
                ) as evidence_contracts
            from selected_links link
            join public.operator_intelligence_evidence evidence
              on evidence.operator_id = link.operator_id
             and evidence.evidence_reference_id = link.evidence_reference_id
        ) evidence_projection on true
        where page.page_row_number <= p_page_size
        order by page.effective_from desc, page.claim_revision_id asc
    )
    select
        coalesce(
            jsonb_agg(
                projected
                order by effective_from desc, claim_revision_id asc
            ),
            '[]'::jsonb
        ),
        (select count(*) > p_page_size from numbered_page)
    into page_rows, page_has_more
    from projected_page;

    return jsonb_build_object(
        'readWatermark', effective_watermark,
        'hasMore', page_has_more,
        'rows', page_rows
    );
end;
$$;

create or replace function public.read_operator_intelligence_claim_lifecycle_page(
    p_operator_id uuid,
    p_claim_id text,
    p_purpose text,
    p_as_of timestamptz,
    p_scope jsonb,
    p_page_size integer,
    p_read_watermark timestamptz default null,
    p_after_revision integer default null,
    p_after_revision_id text default null
)
returns jsonb
language plpgsql
security definer
set search_path = pg_catalog
as $$
declare
    effective_watermark timestamptz := coalesce(
        p_read_watermark,
        statement_timestamp()
    );
    page_rows jsonb;
    page_has_more boolean;
begin
    if coalesce(auth.role(), '') <> 'service_role' then
        raise exception 'Trusted Operator Intelligence authority is required.'
            using errcode = '42501';
    end if;

    if p_page_size < 1 or p_page_size > 100 then
        raise exception 'Operator Intelligence page size is outside its budget.'
            using errcode = '22023';
    end if;

    if (p_after_revision is null) <> (p_after_revision_id is null) then
        raise exception 'Operator Intelligence page position is incomplete.'
            using errcode = '22023';
    end if;

    with bounded_revisions as (
        select
            revision.*,
            eligibility.eligibility_contract
        from public.operator_intelligence_claim_revisions revision
        cross join lateral (
            select assessment.eligibility_contract
            from public.operator_intelligence_eligibility_assessments assessment
            where assessment.operator_id = revision.operator_id
              and assessment.claim_id = revision.claim_id
              and (
                  assessment.claim_revision_id = revision.claim_revision_id
                  or revision.status = 'deleted'
              )
              and assessment.purpose = p_purpose
              and assessment.assessed_at <= p_as_of
              and assessment.recorded_at <= effective_watermark
            order by assessment.assessed_at desc,
                assessment.recorded_at desc,
                assessment.assessment_id desc
            limit 1
        ) eligibility
        where revision.operator_id = p_operator_id
          and revision.claim_id = p_claim_id
          and revision.recorded_at <= effective_watermark
          and (
              (revision.status = 'deleted' and revision.deleted_at <= p_as_of)
              or (revision.status <> 'deleted'
                  and revision.effective_from <= p_as_of)
          )
          and (
              p_scope is null
              or coalesce(
                  revision.claim_revision_contract -> 'scope',
                  (
                      select previous.claim_revision_contract -> 'scope'
                      from public.operator_intelligence_claim_revisions previous
                      where previous.operator_id = revision.operator_id
                        and previous.claim_id = revision.claim_id
                        and previous.revision < revision.revision
                        and previous.status <> 'deleted'
                      order by previous.revision desc
                      limit 1
                  )
              ) = p_scope
          )
          and (
              p_after_revision is null
              or revision.revision < p_after_revision
              or (
                  revision.revision = p_after_revision
                  and revision.claim_revision_id > p_after_revision_id
              )
          )
        order by revision.revision desc, revision.claim_revision_id asc
        limit p_page_size + 1
    ), numbered_page as (
        select bounded_revisions.*, row_number() over (
            order by revision desc, claim_revision_id asc
        ) as page_row_number
        from bounded_revisions
    ), projected_page as (
        select
            page.revision,
            page.claim_revision_id,
            jsonb_build_object(
                'claimRevisionId', page.claim_revision_id,
                'effectiveFrom', coalesce(page.effective_from, page.deleted_at),
                'revision', page.revision,
                'recordedAt', page.recorded_at,
                'status', page.status,
                'claimRevisionContract', page.claim_revision_contract,
                'eligibilityContract', case
                    when page.status = 'deleted' then 'null'::jsonb
                    else page.eligibility_contract
                end,
                'evidenceLinks', coalesce(evidence_projection.links, '[]'::jsonb),
                'evidenceContracts', coalesce(
                    evidence_projection.evidence_contracts,
                    '[]'::jsonb
                )
            ) as projected
        from numbered_page page
        left join lateral (
            with selected_links as (
                select link.*
                from public.operator_intelligence_claim_evidence link
                where link.operator_id = p_operator_id
                  and link.claim_revision_id = page.claim_revision_id
                order by link.evidence_reference_id
                limit 33
            )
            select
                jsonb_agg(
                    jsonb_build_object(
                        'claimId', link.claim_id,
                        'claimRevisionId', link.claim_revision_id,
                        'evidenceReferenceId', link.evidence_reference_id,
                        'relationship', link.relationship,
                        'rationale', link.rationale,
                        'linkedAt', link.linked_at
                    ) order by link.evidence_reference_id
                ) as links,
                jsonb_agg(
                    evidence.evidence_contract
                    order by link.evidence_reference_id
                ) as evidence_contracts
            from selected_links link
            join public.operator_intelligence_evidence evidence
              on evidence.operator_id = link.operator_id
             and evidence.evidence_reference_id = link.evidence_reference_id
        ) evidence_projection on true
        where page.page_row_number <= p_page_size
    )
    select
        coalesce(
            jsonb_agg(
                projected order by revision desc, claim_revision_id asc
            ),
            '[]'::jsonb
        ),
        (select count(*) > p_page_size from numbered_page)
    into page_rows, page_has_more
    from projected_page;

    return jsonb_build_object(
        'readWatermark', effective_watermark,
        'hasMore', page_has_more,
        'rows', page_rows
    );
end;
$$;

create or replace function public.read_operator_intelligence_eligibility_history_page(
    p_operator_id uuid,
    p_claim_id text,
    p_claim_revision_id text,
    p_purpose text,
    p_as_of timestamptz,
    p_page_size integer,
    p_read_watermark timestamptz default null,
    p_after_assessed_at timestamptz default null,
    p_after_assessment_id uuid default null
)
returns jsonb
language plpgsql
security definer
set search_path = pg_catalog
as $$
declare
    effective_watermark timestamptz := coalesce(
        p_read_watermark,
        statement_timestamp()
    );
    page_rows jsonb;
    page_has_more boolean;
begin
    if coalesce(auth.role(), '') <> 'service_role' then
        raise exception 'Trusted Operator Intelligence authority is required.'
            using errcode = '42501';
    end if;

    if p_page_size < 1 or p_page_size > 100 then
        raise exception 'Operator Intelligence page size is outside its budget.'
            using errcode = '22023';
    end if;

    if (p_after_assessed_at is null) <> (p_after_assessment_id is null) then
        raise exception 'Operator Intelligence page position is incomplete.'
            using errcode = '22023';
    end if;

    with bounded_assessments as (
        select assessment.*
        from public.operator_intelligence_eligibility_assessments assessment
        where assessment.operator_id = p_operator_id
          and assessment.claim_id = p_claim_id
          and assessment.claim_revision_id = p_claim_revision_id
          and assessment.purpose = p_purpose
          and assessment.assessed_at <= p_as_of
          and assessment.recorded_at <= effective_watermark
          and (
              p_after_assessed_at is null
              or assessment.assessed_at < p_after_assessed_at
              or (
                  assessment.assessed_at = p_after_assessed_at
                  and assessment.assessment_id > p_after_assessment_id
              )
          )
        order by assessment.assessed_at desc, assessment.assessment_id asc
        limit p_page_size + 1
    ), numbered_page as (
        select bounded_assessments.*, row_number() over (
            order by assessed_at desc, assessment_id asc
        ) as page_row_number
        from bounded_assessments
    )
    select
        coalesce(
            jsonb_agg(
                jsonb_build_object(
                    'assessmentId', assessment_id,
                    'assessedAt', assessed_at,
                    'eligibilityContract', eligibility_contract
                ) order by assessed_at desc, assessment_id asc
            ) filter (where page_row_number <= p_page_size),
            '[]'::jsonb
        ),
        count(*) > p_page_size
    into page_rows, page_has_more
    from numbered_page;

    return jsonb_build_object(
        'readWatermark', effective_watermark,
        'hasMore', page_has_more,
        'rows', page_rows
    );
end;
$$;

alter table public.operator_data_policy_versions enable row level security;
alter table public.operator_consent_decisions enable row level security;
alter table public.operator_intelligence_evidence enable row level security;
alter table public.operator_intelligence_evidence_dispositions
    enable row level security;
alter table public.operator_intelligence_evidence_admissions
    enable row level security;
alter table public.operator_intelligence_claims enable row level security;
alter table public.operator_intelligence_claim_revisions enable row level security;
alter table public.operator_intelligence_claim_evidence enable row level security;
alter table public.operator_intelligence_eligibility_assessments enable row level security;

create policy operator_data_policy_versions_select_authenticated
    on public.operator_data_policy_versions
    for select to authenticated
    using (true);
create policy operator_consent_decisions_select_own
    on public.operator_consent_decisions
    for select to authenticated
    using (exists (
        select 1 from public.operator_account_bindings binding
        where binding.account_id = (select auth.uid())
          and binding.operator_id = operator_consent_decisions.operator_id
    ));
create policy operator_intelligence_evidence_select_own
    on public.operator_intelligence_evidence
    for select to authenticated
    using (exists (
        select 1 from public.operator_account_bindings binding
        where binding.account_id = (select auth.uid())
          and binding.operator_id = operator_intelligence_evidence.operator_id
    ));
create policy operator_intelligence_evidence_dispositions_select_own
    on public.operator_intelligence_evidence_dispositions
    for select to authenticated
    using (exists (
        select 1 from public.operator_account_bindings binding
        where binding.account_id = (select auth.uid())
          and binding.operator_id =
            operator_intelligence_evidence_dispositions.operator_id
    ));
create policy operator_intelligence_evidence_admissions_select_own
    on public.operator_intelligence_evidence_admissions
    for select to authenticated
    using (exists (
        select 1 from public.operator_account_bindings binding
        where binding.account_id = (select auth.uid())
          and binding.operator_id =
            operator_intelligence_evidence_admissions.operator_id
    ));
create policy operator_intelligence_claims_select_own
    on public.operator_intelligence_claims
    for select to authenticated
    using (exists (
        select 1 from public.operator_account_bindings binding
        where binding.account_id = (select auth.uid())
          and binding.operator_id = operator_intelligence_claims.operator_id
    ));
create policy operator_intelligence_claim_revisions_select_own
    on public.operator_intelligence_claim_revisions
    for select to authenticated
    using (exists (
        select 1 from public.operator_account_bindings binding
        where binding.account_id = (select auth.uid())
          and binding.operator_id = operator_intelligence_claim_revisions.operator_id
    ));
create policy operator_intelligence_claim_evidence_select_own
    on public.operator_intelligence_claim_evidence
    for select to authenticated
    using (exists (
        select 1 from public.operator_account_bindings binding
        where binding.account_id = (select auth.uid())
          and binding.operator_id = operator_intelligence_claim_evidence.operator_id
    ));
create policy operator_intelligence_eligibility_select_own
    on public.operator_intelligence_eligibility_assessments
    for select to authenticated
    using (exists (
        select 1 from public.operator_account_bindings binding
        where binding.account_id = (select auth.uid())
          and binding.operator_id = operator_intelligence_eligibility_assessments.operator_id
    ));

revoke all privileges on table public.operator_data_policy_versions
    from public, anon, authenticated, service_role;
revoke all privileges on table public.operator_consent_decisions
    from public, anon, authenticated, service_role;
revoke all privileges on table public.operator_intelligence_evidence
    from public, anon, authenticated, service_role;
revoke all privileges on table public.operator_intelligence_evidence_dispositions
    from public, anon, authenticated, service_role;
revoke all privileges on table public.operator_intelligence_evidence_admissions
    from public, anon, authenticated, service_role;
revoke all privileges on table public.operator_intelligence_claims
    from public, anon, authenticated, service_role;
revoke all privileges on table public.operator_intelligence_claim_revisions
    from public, anon, authenticated, service_role;
revoke all privileges on table public.operator_intelligence_claim_evidence
    from public, anon, authenticated, service_role;
revoke all privileges on table public.operator_intelligence_eligibility_assessments
    from public, anon, authenticated, service_role;

grant select on table public.operator_data_policy_versions
    to authenticated, service_role;
grant select on table public.operator_consent_decisions
    to authenticated, service_role;
grant select on table public.operator_intelligence_evidence
    to authenticated, service_role;
grant select on table public.operator_intelligence_evidence_dispositions
    to authenticated, service_role;
grant select on table public.operator_intelligence_evidence_admissions
    to authenticated, service_role;
grant select on table public.operator_intelligence_claims
    to authenticated, service_role;
grant select on table public.operator_intelligence_claim_revisions
    to authenticated, service_role;
grant select on table public.operator_intelligence_claim_evidence
    to authenticated, service_role;
grant select on table public.operator_intelligence_eligibility_assessments
    to authenticated, service_role;

revoke all privileges on function public.register_operator_data_policy_version(jsonb)
    from public, anon, authenticated, service_role;
revoke all privileges on function public.append_operator_consent_decision(uuid, jsonb)
    from public, anon, authenticated, service_role;
revoke all privileges on function public.admit_operator_game_session_evidence(uuid, jsonb, jsonb, jsonb)
    from public, anon, authenticated, service_role;
revoke all privileges on function public.append_operator_evidence_disposition(uuid, jsonb)
    from public, anon, authenticated, service_role;
revoke all privileges on function public.persist_operator_intelligence_claim_revision(uuid, jsonb[], jsonb)
    from public, anon, authenticated, service_role;
revoke all privileges on function public.append_operator_intelligence_eligibility(uuid, text, text, jsonb)
    from public, anon, authenticated, service_role;
revoke all privileges on function public.read_operator_intelligence_eligible_claim_page(uuid, text, timestamptz, jsonb, integer, timestamptz, timestamptz, text)
    from public, anon, authenticated, service_role;
revoke all privileges on function public.read_operator_intelligence_claim_lifecycle_page(uuid, text, text, timestamptz, jsonb, integer, timestamptz, integer, text)
    from public, anon, authenticated, service_role;
revoke all privileges on function public.read_operator_intelligence_eligibility_history_page(uuid, text, text, text, timestamptz, integer, timestamptz, timestamptz, uuid)
    from public, anon, authenticated, service_role;
grant execute on function public.register_operator_data_policy_version(jsonb)
    to service_role;
grant execute on function public.append_operator_consent_decision(uuid, jsonb)
    to service_role;
grant execute on function public.admit_operator_game_session_evidence(uuid, jsonb, jsonb, jsonb)
    to service_role;
grant execute on function public.append_operator_evidence_disposition(uuid, jsonb)
    to service_role;
grant execute on function public.persist_operator_intelligence_claim_revision(uuid, jsonb[], jsonb)
    to service_role;
grant execute on function public.append_operator_intelligence_eligibility(uuid, text, text, jsonb)
    to service_role;
grant execute on function public.read_operator_intelligence_eligible_claim_page(uuid, text, timestamptz, jsonb, integer, timestamptz, timestamptz, text)
    to service_role;
grant execute on function public.read_operator_intelligence_claim_lifecycle_page(uuid, text, text, timestamptz, jsonb, integer, timestamptz, integer, text)
    to service_role;
grant execute on function public.read_operator_intelligence_eligibility_history_page(uuid, text, text, text, timestamptz, integer, timestamptz, timestamptz, uuid)
    to service_role;

commit;
