begin;

-- Sprint 15 Phase 3 persists versioned Operator Intelligence contracts only.
-- Operator identity, declarations, Sessions and raw evidence remain owned by
-- their existing authoritative systems.
create table public.operator_data_policy_versions (
    operator_id uuid not null
        references public.operators(id) on delete cascade,
    policy_id text not null,
    policy_version text not null,
    purpose text not null,
    retention_class text not null,
    policy_contract jsonb not null,
    recorded_at timestamptz not null default now(),
    primary key (operator_id, policy_id, policy_version),
    constraint operator_data_policy_versions_semver_check
        check (policy_version ~ '^[0-9]+\.[0-9]+\.[0-9]+([+-][0-9A-Za-z.-]+)?$'),
    constraint operator_data_policy_versions_contract_check
        check (
            policy_contract -> 'contract' ->> 'name' =
                'oracle.operator-data-policy-reference'
            and (policy_contract -> 'contract' ->> 'version')::integer = 1
            and policy_contract ->> 'id' = policy_id
            and policy_contract ->> 'policyVersion' = policy_version
            and policy_contract ->> 'purpose' = purpose
            and policy_contract ->> 'retentionClass' = retention_class
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
        foreign key (operator_id, policy_id, policy_version)
        references public.operator_data_policy_versions(
            operator_id,
            policy_id,
            policy_version
        ),
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
            and evidence_contract ->> 'contentDigest' = content_digest
            and evidence_contract ->> 'retentionClass' = retention_class
            and evidence_contract ->> 'policyId' = policy_id
            and evidence_contract ->> 'policyVersion' = policy_version
            and not (evidence_contract ?| array[
                'prompt', 'rawPrompt', 'rawEvidence', 'transcript', 'payload'
            ])
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
        foreign key (operator_id, policy_id, policy_version)
        references public.operator_data_policy_versions(
            operator_id,
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
        foreign key (operator_id, policy_id, policy_version)
        references public.operator_data_policy_versions(
            operator_id,
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
    p_operator_id uuid,
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
    if auth.uid() is null or not exists (
        select 1
        from public.operator_account_bindings binding
        where binding.account_id = auth.uid()
          and binding.operator_id = p_operator_id
    ) then
        raise exception 'Authenticated Operator ownership is required.'
            using errcode = '42501';
    end if;

    if (p_policy -> 'contract' ->> 'name') <>
            'oracle.operator-data-policy-reference'
       or (p_policy -> 'contract' ->> 'version')::integer <> 1 then
        raise exception 'Unsupported Operator data policy contract.'
            using errcode = '22023';
    end if;

    insert into public.operator_data_policy_versions (
        operator_id,
        policy_id,
        policy_version,
        purpose,
        retention_class,
        policy_contract
    ) values (
        p_operator_id,
        p_policy ->> 'id',
        p_policy ->> 'policyVersion',
        p_policy ->> 'purpose',
        p_policy ->> 'retentionClass',
        p_policy
    )
    on conflict (operator_id, policy_id, policy_version) do nothing;

    select policy_contract
    into existing_contract
    from public.operator_data_policy_versions
    where operator_id = p_operator_id
      and policy_id = p_policy ->> 'id'
      and policy_version = p_policy ->> 'policyVersion';

    if existing_contract is distinct from p_policy then
        raise exception 'Operator data policy version is immutable.'
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
    existing_evidence jsonb;
    current_claim record;
    claim_existed boolean := false;
    revision_contract jsonb;
    eligibility jsonb;
begin
    if auth.uid() is null or not exists (
        select 1
        from public.operator_account_bindings binding
        where binding.account_id = auth.uid()
          and binding.operator_id = p_operator_id
    ) then
        raise exception 'Authenticated Operator ownership is required.'
            using errcode = '42501';
    end if;

    if (p_claim_revision ->> 'operatorId')::uuid <> p_operator_id then
        raise exception 'Claim revision Operator ownership does not match.'
            using errcode = '42501';
    end if;

    foreach evidence_item in array coalesce(p_evidence, array[]::jsonb[])
    loop
        if (evidence_item ->> 'operatorId')::uuid <> p_operator_id then
            raise exception 'Evidence Operator ownership does not match.'
                using errcode = '42501';
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
            content_digest,
            retention_class,
            policy_id,
            policy_version,
            evidence_contract
        ) values (
            p_operator_id,
            evidence_item ->> 'id',
            evidence_item ->> 'sourceType',
            evidence_item ->> 'sourceOwnerId',
            evidence_item ->> 'sourceRecordId',
            (evidence_item ->> 'observedAt')::timestamptz,
            (evidence_item ->> 'capturedAt')::timestamptz,
            evidence_item ->> 'purpose',
            evidence_item -> 'producer' ->> 'id',
            evidence_item -> 'producer' ->> 'version',
            evidence_item ->> 'contentDigest',
            evidence_item ->> 'retentionClass',
            evidence_item ->> 'policyId',
            evidence_item ->> 'policyVersion',
            evidence_item
        )
        on conflict (operator_id, evidence_reference_id) do nothing;

        select evidence_contract
        into existing_evidence
        from public.operator_intelligence_evidence
        where operator_id = p_operator_id
          and evidence_reference_id = evidence_item ->> 'id';

        if existing_evidence is distinct from evidence_item then
            raise exception 'Operator evidence reference is immutable.'
                using errcode = '23505';
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

    revision_contract := p_claim_revision - 'evidence' - 'eligibility';
    eligibility := p_claim_revision -> 'eligibility';

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
begin
    if auth.uid() is null or not exists (
        select 1
        from public.operator_account_bindings binding
        where binding.account_id = auth.uid()
          and binding.operator_id = p_operator_id
    ) then
        raise exception 'Authenticated Operator ownership is required.'
            using errcode = '42501';
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

alter table public.operator_data_policy_versions enable row level security;
alter table public.operator_intelligence_evidence enable row level security;
alter table public.operator_intelligence_claims enable row level security;
alter table public.operator_intelligence_claim_revisions enable row level security;
alter table public.operator_intelligence_claim_evidence enable row level security;
alter table public.operator_intelligence_eligibility_assessments enable row level security;

create policy operator_data_policy_versions_select_own
    on public.operator_data_policy_versions
    for select to authenticated
    using (exists (
        select 1 from public.operator_account_bindings binding
        where binding.account_id = (select auth.uid())
          and binding.operator_id = operator_data_policy_versions.operator_id
    ));
create policy operator_intelligence_evidence_select_own
    on public.operator_intelligence_evidence
    for select to authenticated
    using (exists (
        select 1 from public.operator_account_bindings binding
        where binding.account_id = (select auth.uid())
          and binding.operator_id = operator_intelligence_evidence.operator_id
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
revoke all privileges on table public.operator_intelligence_evidence
    from public, anon, authenticated, service_role;
revoke all privileges on table public.operator_intelligence_claims
    from public, anon, authenticated, service_role;
revoke all privileges on table public.operator_intelligence_claim_revisions
    from public, anon, authenticated, service_role;
revoke all privileges on table public.operator_intelligence_claim_evidence
    from public, anon, authenticated, service_role;
revoke all privileges on table public.operator_intelligence_eligibility_assessments
    from public, anon, authenticated, service_role;

grant select on table public.operator_data_policy_versions to authenticated;
grant select on table public.operator_intelligence_evidence to authenticated;
grant select on table public.operator_intelligence_claims to authenticated;
grant select on table public.operator_intelligence_claim_revisions to authenticated;
grant select on table public.operator_intelligence_claim_evidence to authenticated;
grant select on table public.operator_intelligence_eligibility_assessments
    to authenticated;

revoke all privileges on function public.register_operator_data_policy_version(uuid, jsonb)
    from public, anon, authenticated, service_role;
revoke all privileges on function public.persist_operator_intelligence_claim_revision(uuid, jsonb[], jsonb)
    from public, anon, authenticated, service_role;
revoke all privileges on function public.append_operator_intelligence_eligibility(uuid, text, text, jsonb)
    from public, anon, authenticated, service_role;
grant execute on function public.register_operator_data_policy_version(uuid, jsonb)
    to authenticated;
grant execute on function public.persist_operator_intelligence_claim_revision(uuid, jsonb[], jsonb)
    to authenticated;
grant execute on function public.append_operator_intelligence_eligibility(uuid, text, text, jsonb)
    to authenticated;

commit;
