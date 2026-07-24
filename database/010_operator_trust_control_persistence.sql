begin;

-- Sprint 18 Phase 3 adds inert persistence for Operator Trust and Control.
-- Migration 009 remains immutable. This migration registers no runtime path,
-- supplies no governance value and activates no Observation, Evidence,
-- Understanding or Memory producer.

create table public.operator_control_policy_sets (
    policy_set_id text not null,
    policy_set_version text not null,
    effective_from timestamptz not null,
    effective_until timestamptz,
    policy_contract jsonb not null,
    approved_by text not null,
    approved_at timestamptz not null,
    recorded_at timestamptz not null default clock_timestamp(),
    primary key (policy_set_id, policy_set_version),
    constraint operator_control_policy_sets_version_check
        check (policy_set_version ~ '^[0-9]+\.[0-9]+\.[0-9]+([+-][0-9A-Za-z.-]+)?$'),
    constraint operator_control_policy_sets_effective_check
        check (effective_until is null or effective_until > effective_from),
    constraint operator_control_policy_sets_contract_check
        check (
            policy_contract -> 'contract' ->> 'name' =
                'oracle.operator-control-policy-set'
            and (policy_contract -> 'contract' ->> 'version')::integer = 1
            and policy_contract ->> 'id' = policy_set_id
            and policy_contract ->> 'policyVersion' = policy_set_version
            and (policy_contract ->> 'effectiveFrom')::timestamptz = effective_from
            and coalesce(
                (policy_contract ->> 'effectiveUntil')::timestamptz,
                '-infinity'::timestamptz
            ) = coalesce(effective_until, '-infinity'::timestamptz)
            and policy_contract ->> 'approvedBy' = approved_by
            and (policy_contract ->> 'approvedAt')::timestamptz = approved_at
            and jsonb_typeof(policy_contract -> 'purposes') = 'array'
            and jsonb_typeof(policy_contract -> 'retentionRules') = 'array'
        )
);

create table public.operator_control_operations (
    operator_id uuid not null
        references public.operators(id) on delete cascade,
    operation_id text not null,
    command_id text not null,
    command_digest text not null,
    operation_type text not null,
    scope_type text,
    status text not null,
    policy_set_id text not null,
    policy_set_version text not null,
    requested_at timestamptz not null,
    eligibility_removal_required boolean not null,
    eligibility_removed_at timestamptz,
    completed_at timestamptz,
    recovery_state text not null,
    failure_code text,
    receipt_contract jsonb not null,
    recorded_at timestamptz not null default clock_timestamp(),
    primary key (operator_id, operation_id),
    unique (operator_id, command_id),
    constraint operator_control_operations_policy_fkey
        foreign key (policy_set_id, policy_set_version)
        references public.operator_control_policy_sets(
            policy_set_id,
            policy_set_version
        ),
    constraint operator_control_operations_digest_check
        check (command_digest ~ '^sha256:[0-9a-f]{64}$'),
    constraint operator_control_operations_type_check
        check (operation_type in (
            'consent', 'declaration', 'claim-correction', 'claim-dispute',
            'export', 'retention', 'evidence-disposition', 'deletion'
        )),
    constraint operator_control_operations_scope_check
        check (
            scope_type is null
            or scope_type in (
                'item', 'purpose', 'game-integration',
                'understanding-domain', 'complete-operator'
            )
        ),
    constraint operator_control_operations_status_check
        check (status in (
            'accepted', 'eligibility-removed', 'in-progress',
            'failed-recoverable', 'blocked-policy', 'completed'
        )),
    constraint operator_control_operations_recovery_check
        check (recovery_state in (
            'none', 'retry-available', 'policy-required'
        )),
    constraint operator_control_operations_completion_check
        check (
            (status = 'completed' and completed_at is not null)
            or (status <> 'completed' and completed_at is null)
        ),
    constraint operator_control_operations_eligibility_check
        check (
            (eligibility_removed_at is null or eligibility_removal_required)
            and (
                status <> 'completed'
                or not eligibility_removal_required
                or eligibility_removed_at is not null
            )
        ),
    constraint operator_control_operations_contract_check
        check (
            receipt_contract -> 'contract' ->> 'name' =
                'oracle.operator-control-operation-receipt'
            and (receipt_contract -> 'contract' ->> 'version')::integer = 1
            and receipt_contract ->> 'id' = operation_id
            and (receipt_contract ->> 'operatorId')::uuid = operator_id
            and receipt_contract ->> 'commandId' = command_id
            and receipt_contract ->> 'type' = operation_type
            and coalesce(receipt_contract ->> 'scopeType', '') =
                coalesce(scope_type, '')
            and receipt_contract ->> 'status' = status
            and receipt_contract ->> 'policySetId' = policy_set_id
            and receipt_contract ->> 'policySetVersion' = policy_set_version
            and (receipt_contract ->> 'requestedAt')::timestamptz = requested_at
            and (receipt_contract ->> 'eligibilityRemovalRequired')::boolean =
                eligibility_removal_required
            and coalesce(
                (receipt_contract ->> 'eligibilityRemovedAt')::timestamptz,
                '-infinity'::timestamptz
            ) = coalesce(eligibility_removed_at, '-infinity'::timestamptz)
            and coalesce(
                (receipt_contract ->> 'completedAt')::timestamptz,
                '-infinity'::timestamptz
            ) = coalesce(completed_at, '-infinity'::timestamptz)
            and receipt_contract ->> 'recoveryState' = recovery_state
            and coalesce(receipt_contract ->> 'failureCode', '') =
                coalesce(failure_code, '')
            and not (receipt_contract ?| array[
                'value', 'correctedValue', 'explanation', 'prompt',
                'summary', 'email', 'payload'
            ])
        )
);

create table public.operator_control_consent_decisions (
    operator_id uuid not null,
    decision_id text not null,
    command_id text not null,
    purpose text not null,
    policy_set_id text not null,
    policy_set_version text not null,
    decision text not null,
    effective_at timestamptz not null,
    recorded_at timestamptz not null,
    supersedes_decision_id text,
    consent_command jsonb not null,
    primary key (operator_id, decision_id),
    unique (operator_id, command_id),
    constraint operator_control_consent_operator_fkey
        foreign key (operator_id)
        references public.operators(id) on delete cascade,
    constraint operator_control_consent_policy_fkey
        foreign key (policy_set_id, policy_set_version)
        references public.operator_control_policy_sets(
            policy_set_id,
            policy_set_version
        ),
    constraint operator_control_consent_operation_fkey
        foreign key (operator_id, decision_id)
        references public.operator_control_operations(operator_id, operation_id)
        on delete cascade,
    constraint operator_control_consent_supersedes_fkey
        foreign key (operator_id, supersedes_decision_id)
        references public.operator_control_consent_decisions(
            operator_id,
            decision_id
        ),
    constraint operator_control_consent_value_check
        check (decision in ('granted', 'revoked')),
    constraint operator_control_consent_time_check
        check (recorded_at >= effective_at),
    constraint operator_control_consent_contract_check
        check (
            consent_command -> 'contract' ->> 'name' =
                'oracle.operator-consent-command'
            and (consent_command -> 'contract' ->> 'version')::integer = 1
            and consent_command ->> 'commandId' = command_id
            and consent_command ->> 'purpose' = purpose
            and consent_command ->> 'policySetId' = policy_set_id
            and consent_command ->> 'policySetVersion' = policy_set_version
            and consent_command ->> 'decision' = decision
            and (consent_command ->> 'effectiveAt')::timestamptz = effective_at
            and coalesce(
                consent_command ->> 'expectedCurrentDecisionId',
                ''
            ) = coalesce(supersedes_decision_id, '')
            and not (consent_command ? 'operatorId')
        )
);

create table public.operator_declarations (
    operator_id uuid not null
        references public.operators(id) on delete cascade,
    declaration_id text not null,
    current_revision_id text not null,
    current_revision integer not null check (current_revision > 0),
    created_at timestamptz not null default clock_timestamp(),
    primary key (operator_id, declaration_id),
    unique (
        operator_id,
        declaration_id,
        current_revision_id,
        current_revision
    )
);

create table public.operator_declaration_revisions (
    operator_id uuid not null,
    declaration_id text not null,
    declaration_revision_id text not null,
    revision integer not null,
    domain text,
    declaration_key text,
    status text not null,
    effective_at timestamptz,
    expires_at timestamptz,
    policy_set_id text not null,
    policy_set_version text not null,
    supersedes_revision_id text,
    deleted_at timestamptz,
    declaration_contract jsonb not null,
    recorded_at timestamptz not null default clock_timestamp(),
    primary key (operator_id, declaration_revision_id),
    unique (operator_id, declaration_id, revision),
    unique (operator_id, declaration_id, declaration_revision_id),
    unique (
        operator_id,
        declaration_id,
        declaration_revision_id,
        revision
    ),
    constraint operator_declaration_revisions_declaration_fkey
        foreign key (operator_id, declaration_id)
        references public.operator_declarations(operator_id, declaration_id)
        on delete cascade,
    constraint operator_declaration_revisions_policy_fkey
        foreign key (policy_set_id, policy_set_version)
        references public.operator_control_policy_sets(
            policy_set_id,
            policy_set_version
        ),
    constraint operator_declaration_revisions_supersedes_fkey
        foreign key (
            operator_id,
            declaration_id,
            supersedes_revision_id
        )
        references public.operator_declaration_revisions(
            operator_id,
            declaration_id,
            declaration_revision_id
        ),
    constraint operator_declaration_revisions_status_check
        check (status in (
            'active', 'corrected', 'superseded',
            'withdrawn', 'expired', 'deleted'
        )),
    constraint operator_declaration_revisions_domain_check
        check (domain is null or domain in ('identity', 'preference', 'goal')),
    constraint operator_declaration_revisions_chain_check
        check (
            (revision = 1 and supersedes_revision_id is null)
            or (revision > 1 and supersedes_revision_id is not null)
        ),
    constraint operator_declaration_revisions_content_check
        check (
            (
                status = 'deleted'
                and domain is null
                and declaration_key is null
                and effective_at is null
                and expires_at is null
                and deleted_at is not null
                and not (declaration_contract ?| array[
                    'domain', 'key', 'value', 'epistemic', 'confidence',
                    'provenance', 'scope', 'temporalValidity'
                ])
            )
            or (
                status <> 'deleted'
                and domain is not null
                and declaration_key is not null
                and effective_at is not null
                and deleted_at is null
            )
        ),
    constraint operator_declaration_revisions_contract_check
        check (
            declaration_contract -> 'contract' ->> 'name' =
                'oracle.operator-declaration-revision'
            and (declaration_contract -> 'contract' ->> 'version')::integer = 1
            and declaration_contract ->> 'id' = declaration_revision_id
            and declaration_contract ->> 'declarationId' = declaration_id
            and (declaration_contract ->> 'operatorId')::uuid = operator_id
            and (declaration_contract ->> 'revision')::integer = revision
            and declaration_contract ->> 'status' = status
            and declaration_contract ->> 'policyId' = policy_set_id
            and declaration_contract ->> 'policyVersion' = policy_set_version
            and coalesce(
                declaration_contract ->> 'supersedesRevisionId',
                ''
            ) = coalesce(supersedes_revision_id, '')
        )
);

alter table public.operator_declarations
    add constraint operator_declarations_current_revision_fkey
    foreign key (
        operator_id,
        declaration_id,
        current_revision_id,
        current_revision
    )
    references public.operator_declaration_revisions(
        operator_id,
        declaration_id,
        declaration_revision_id,
        revision
    )
    deferrable initially deferred;

create table public.operator_declaration_head_events (
    operator_id uuid not null,
    declaration_id text not null,
    declaration_revision_id text not null,
    revision integer not null,
    domain text,
    purpose text,
    status text not null,
    effective_at timestamptz,
    recorded_at timestamptz not null default clock_timestamp(),
    primary key (operator_id, declaration_id, revision),
    unique (operator_id, declaration_revision_id),
    constraint operator_declaration_head_revision_fkey
        foreign key (
            operator_id,
            declaration_id,
            declaration_revision_id,
            revision
        )
        references public.operator_declaration_revisions(
            operator_id,
            declaration_id,
            declaration_revision_id,
            revision
        ) on delete cascade,
    constraint operator_declaration_head_status_check
        check (status in (
            'active', 'corrected', 'superseded',
            'withdrawn', 'expired', 'deleted'
        )),
    constraint operator_declaration_head_content_check
        check (
            (status = 'deleted'
                and domain is null
                and purpose is null
                and effective_at is null)
            or (status <> 'deleted'
                and domain in ('identity', 'preference', 'goal')
                and purpose is not null
                and effective_at is not null)
        )
);

create table public.operator_control_operation_steps (
    operator_id uuid not null,
    operation_id text not null,
    step_id text not null,
    owner_name text not null,
    action_name text not null,
    status text not null,
    attempt integer not null,
    started_at timestamptz,
    completed_at timestamptz,
    affected_record_count integer not null,
    failure_code text,
    checkpoint text,
    step_contract jsonb not null,
    recorded_at timestamptz not null default clock_timestamp(),
    primary key (operator_id, operation_id, step_id),
    constraint operator_control_steps_operation_fkey
        foreign key (operator_id, operation_id)
        references public.operator_control_operations(operator_id, operation_id)
        on delete cascade,
    constraint operator_control_steps_owner_check
        check (owner_name in (
            'operator-service', 'operator-intelligence-service',
            'memory-service', 'session-service', 'progression-service',
            'backup-owner', 'external-processor'
        )),
    constraint operator_control_steps_status_check
        check (status in (
            'pending', 'running', 'failed-recoverable', 'succeeded',
            'retained-legal', 'processor-pending', 'backup-pending'
        )),
    constraint operator_control_steps_count_check
        check (attempt > 0 and affected_record_count >= 0),
    constraint operator_control_steps_contract_check
        check (
            step_contract -> 'contract' ->> 'name' =
                'oracle.operator-control-operation-step'
            and (step_contract -> 'contract' ->> 'version')::integer = 1
            and step_contract ->> 'id' = step_id
            and step_contract ->> 'operationId' = operation_id
            and step_contract ->> 'owner' = owner_name
            and step_contract ->> 'action' = action_name
            and step_contract ->> 'status' = status
            and (step_contract ->> 'attempt')::integer = attempt
            and (step_contract ->> 'affectedRecordCount')::integer =
                affected_record_count
            and not (step_contract ?| array[
                'value', 'explanation', 'prompt', 'summary',
                'email', 'payload'
            ])
        )
);

create table public.operator_control_tombstones (
    operator_id uuid not null,
    tombstone_id text not null,
    operation_id text not null,
    subject_type text not null,
    non_content_subject_identity text not null,
    policy_set_id text not null,
    policy_set_version text not null,
    justification text not null,
    deleted_at timestamptz not null,
    predecessor_identity text,
    integrity_digest text not null,
    tombstone_contract jsonb not null,
    recorded_at timestamptz not null default clock_timestamp(),
    primary key (operator_id, tombstone_id),
    constraint operator_control_tombstones_operation_fkey
        foreign key (operator_id, operation_id)
        references public.operator_control_operations(operator_id, operation_id)
        on delete cascade,
    constraint operator_control_tombstones_policy_fkey
        foreign key (policy_set_id, policy_set_version)
        references public.operator_control_policy_sets(
            policy_set_id,
            policy_set_version
        ),
    constraint operator_control_tombstones_subject_check
        check (subject_type in (
            'declaration', 'claim', 'evidence-reference', 'operator'
        )),
    constraint operator_control_tombstones_justification_check
        check (justification in (
            'prevent-unsafe-replay',
            'preserve-monotonic-revision-integrity',
            'prove-deletion-transition',
            'coordinate-deletion-recovery'
        )),
    constraint operator_control_tombstones_digest_check
        check (integrity_digest ~ '^sha256:[0-9a-f]{64}$'),
    constraint operator_control_tombstones_contract_check
        check (
            tombstone_contract -> 'contract' ->> 'name' =
                'oracle.operator-control-tombstone'
            and (tombstone_contract -> 'contract' ->> 'version')::integer = 1
            and tombstone_contract ->> 'id' = tombstone_id
            and tombstone_contract ->> 'operationId' = operation_id
            and tombstone_contract ->> 'subjectType' = subject_type
            and tombstone_contract ->> 'nonContentSubjectIdentity' =
                non_content_subject_identity
            and tombstone_contract ->> 'policySetId' = policy_set_id
            and tombstone_contract ->> 'policySetVersion' = policy_set_version
            and tombstone_contract ->> 'justification' = justification
            and (tombstone_contract ->> 'deletedAt')::timestamptz = deleted_at
            and coalesce(
                tombstone_contract ->> 'predecessorIdentity',
                ''
            ) = coalesce(predecessor_identity, '')
            and tombstone_contract ->> 'integrityDigest' = integrity_digest
            and not (tombstone_contract ?| array[
                'value', 'evidence', 'explanation', 'confidence',
                'prompt', 'summary', 'email', 'payload'
            ])
        )
);

create index operator_control_policy_effective_idx
    on public.operator_control_policy_sets(
        effective_from desc,
        effective_until,
        policy_set_id,
        policy_set_version
    );
create index operator_control_consent_current_idx
    on public.operator_control_consent_decisions(
        operator_id,
        purpose,
        effective_at desc,
        recorded_at desc,
        decision_id desc
    );
create index operator_declaration_head_page_idx
    on public.operator_declaration_head_events(
        operator_id,
        status,
        domain,
        purpose,
        effective_at desc,
        declaration_revision_id asc
    ) include (declaration_id, revision);
create index operator_declaration_lifecycle_page_idx
    on public.operator_declaration_revisions(
        operator_id,
        declaration_id,
        revision desc
    ) include (status, recorded_at);
create index operator_control_operation_page_idx
    on public.operator_control_operations(
        operator_id,
        requested_at desc,
        operation_id desc
    ) include (status, operation_type);
create index operator_control_step_status_idx
    on public.operator_control_operation_steps(
        operator_id,
        operation_id,
        status,
        step_id
    );
create index operator_control_tombstone_subject_idx
    on public.operator_control_tombstones(
        operator_id,
        subject_type,
        non_content_subject_identity
    );

create or replace function public.register_operator_control_policy_set(
    p_policy jsonb
)
returns jsonb
language plpgsql
security definer
set search_path = pg_catalog
as $$
declare
    purpose_record jsonb;
    admission_record jsonb;
    existing_contract jsonb;
begin
    if coalesce(auth.role(), '') <> 'service_role' then
        raise exception 'Trusted Operator control authority is required.'
            using errcode = '42501';
    end if;

    if p_policy -> 'contract' ->> 'name' <>
            'oracle.operator-control-policy-set'
       or (p_policy -> 'contract' ->> 'version')::integer <> 1 then
        raise exception 'Invalid Operator control policy contract.'
            using errcode = '22023';
    end if;

    for purpose_record in
        select value from jsonb_array_elements(p_policy -> 'purposes')
    loop
        admission_record := purpose_record -> 'admissionPolicy';
        if admission_record <> 'null'::jsonb and not exists (
            select 1
            from public.operator_data_policy_versions admission
            where admission.policy_id = admission_record ->> 'policyId'
              and admission.policy_version =
                    admission_record ->> 'policyVersion'
              and admission.purpose = purpose_record ->> 'id'
        ) then
            raise exception
                'Control purpose admission binding does not exist or match.'
                using errcode = '23503';
        end if;
    end loop;

    insert into public.operator_control_policy_sets (
        policy_set_id,
        policy_set_version,
        effective_from,
        effective_until,
        policy_contract,
        approved_by,
        approved_at
    ) values (
        p_policy ->> 'id',
        p_policy ->> 'policyVersion',
        (p_policy ->> 'effectiveFrom')::timestamptz,
        (p_policy ->> 'effectiveUntil')::timestamptz,
        p_policy,
        p_policy ->> 'approvedBy',
        (p_policy ->> 'approvedAt')::timestamptz
    )
    on conflict (policy_set_id, policy_set_version) do nothing;

    select policy_contract
    into existing_contract
    from public.operator_control_policy_sets
    where policy_set_id = p_policy ->> 'id'
      and policy_set_version = p_policy ->> 'policyVersion';

    if existing_contract is distinct from p_policy then
        raise exception 'Operator control policy versions are immutable.'
            using errcode = '23505';
    end if;

    return existing_contract;
end;
$$;

create or replace function public.persist_operator_control_operation(
    p_operator_id uuid,
    p_command_digest text,
    p_receipt jsonb
)
returns jsonb
language plpgsql
security definer
set search_path = pg_catalog
as $$
declare
    existing_record record;
    pending_steps integer;
    policy_record jsonb;
begin
    if coalesce(auth.role(), '') <> 'service_role' then
        raise exception 'Trusted Operator control authority is required.'
            using errcode = '42501';
    end if;
    if (p_receipt ->> 'operatorId')::uuid <> p_operator_id
       or p_receipt -> 'contract' ->> 'name' <>
            'oracle.operator-control-operation-receipt'
       or p_command_digest !~ '^sha256:[0-9a-f]{64}$' then
        raise exception 'Invalid Operator control operation.'
            using errcode = '22023';
    end if;
    if not exists (
        select 1 from public.operators where id = p_operator_id
    ) then
        raise exception 'Operator ownership cannot be established.'
            using errcode = '42501';
    end if;
    select policy_contract
    into policy_record
    from public.operator_control_policy_sets
    where policy_set_id = p_receipt ->> 'policySetId'
      and policy_set_version = p_receipt ->> 'policySetVersion';
    if not found
       or policy_record -> 'audit' ->> 'state' <> 'configured'
       or not (
            policy_record -> 'audit' -> 'value' -> 'permittedFields'
            ?& array[
                'operation-id', 'action-type', 'policy-identity',
                'request-time', 'outcome', 'recovery-state',
                'affected-record-counts'
            ]
       ) then
        raise exception 'Audit policy is unavailable or unconfigured.'
            using errcode = '23514';
    end if;

    perform pg_advisory_xact_lock(hashtextextended(
        p_operator_id::text || ':control:' || (p_receipt ->> 'commandId'),
        0
    ));

    select *
    into existing_record
    from public.operator_control_operations
    where operator_id = p_operator_id
      and command_id = p_receipt ->> 'commandId'
    for update;

    if found then
        if existing_record.operation_id <> p_receipt ->> 'id'
           or existing_record.command_digest <> p_command_digest then
            raise exception 'Operator control command is an immutable conflict.'
                using errcode = '23505';
        end if;
        if existing_record.receipt_contract = p_receipt then
            return existing_record.receipt_contract;
        end if;
        if existing_record.status = 'completed'
           or not (
                (existing_record.status = 'accepted'
                    and p_receipt ->> 'status' in (
                        'eligibility-removed', 'in-progress',
                        'failed-recoverable', 'blocked-policy', 'completed'
                    ))
                or (existing_record.status = 'eligibility-removed'
                    and p_receipt ->> 'status' in (
                        'in-progress', 'failed-recoverable',
                        'blocked-policy', 'completed'
                    ))
                or (existing_record.status = 'in-progress'
                    and p_receipt ->> 'status' in (
                        'failed-recoverable', 'blocked-policy', 'completed'
                    ))
                or (existing_record.status = 'failed-recoverable'
                    and p_receipt ->> 'status' in (
                        'in-progress', 'blocked-policy', 'completed'
                    ))
                or (existing_record.status = 'blocked-policy'
                    and p_receipt ->> 'status' = 'in-progress')
           ) then
            raise exception 'Invalid Operator control operation transition.'
                using errcode = '40001';
        end if;
    end if;

    if p_receipt ->> 'status' = 'completed' then
        select count(*)
        into pending_steps
        from public.operator_control_operation_steps step
        where step.operator_id = p_operator_id
          and step.operation_id = p_receipt ->> 'id'
          and step.status not in ('succeeded', 'retained-legal');
        if pending_steps > 0 then
            raise exception 'Operator control operation has incomplete steps.'
                using errcode = '23514';
        end if;
    end if;

    insert into public.operator_control_operations (
        operator_id, operation_id, command_id, command_digest,
        operation_type, scope_type, status, policy_set_id,
        policy_set_version, requested_at, eligibility_removal_required,
        eligibility_removed_at, completed_at, recovery_state, failure_code,
        receipt_contract
    ) values (
        p_operator_id,
        p_receipt ->> 'id',
        p_receipt ->> 'commandId',
        p_command_digest,
        p_receipt ->> 'type',
        p_receipt ->> 'scopeType',
        p_receipt ->> 'status',
        p_receipt ->> 'policySetId',
        p_receipt ->> 'policySetVersion',
        (p_receipt ->> 'requestedAt')::timestamptz,
        (p_receipt ->> 'eligibilityRemovalRequired')::boolean,
        (p_receipt ->> 'eligibilityRemovedAt')::timestamptz,
        (p_receipt ->> 'completedAt')::timestamptz,
        p_receipt ->> 'recoveryState',
        p_receipt ->> 'failureCode',
        p_receipt
    )
    on conflict (operator_id, operation_id) do update set
        status = excluded.status,
        eligibility_removed_at = excluded.eligibility_removed_at,
        completed_at = excluded.completed_at,
        recovery_state = excluded.recovery_state,
        failure_code = excluded.failure_code,
        receipt_contract = excluded.receipt_contract;

    return p_receipt;
end;
$$;

create or replace function public.append_operator_control_consent_decision(
    p_operator_id uuid,
    p_command jsonb,
    p_recorded_at timestamptz
)
returns jsonb
language plpgsql
security definer
set search_path = pg_catalog
as $$
declare
    operation_record record;
    current_decision record;
    existing_contract jsonb;
begin
    if coalesce(auth.role(), '') <> 'service_role' then
        raise exception 'Trusted Operator control authority is required.'
            using errcode = '42501';
    end if;
    if p_command -> 'contract' ->> 'name' <> 'oracle.operator-consent-command'
       or p_command ? 'operatorId' then
        raise exception 'Invalid Operator control consent command.'
            using errcode = '22023';
    end if;

    select *
    into operation_record
    from public.operator_control_operations
    where operator_id = p_operator_id
      and command_id = p_command ->> 'commandId'
      and operation_type = 'consent'
      and policy_set_id = p_command ->> 'policySetId'
      and policy_set_version = p_command ->> 'policySetVersion'
    for update;
    if not found then
        raise exception 'Consent requires its accepted control operation.'
            using errcode = '23503';
    end if;
    if not exists (
        select 1
        from public.operator_control_policy_sets policy,
             jsonb_array_elements(
                policy.policy_contract -> 'purposes'
             ) purpose
        where policy.policy_set_id = p_command ->> 'policySetId'
          and policy.policy_set_version = p_command ->> 'policySetVersion'
          and purpose ->> 'id' = p_command ->> 'purpose'
          and (purpose ->> 'consentRequired')::boolean
    ) then
        raise exception 'Consent purpose is not authorised by the policy.'
            using errcode = '23514';
    end if;

    select consent_command
    into existing_contract
    from public.operator_control_consent_decisions
    where operator_id = p_operator_id
      and command_id = p_command ->> 'commandId';
    if found then
        if existing_contract is distinct from p_command then
            raise exception 'Operator control consent is an immutable conflict.'
                using errcode = '23505';
        end if;
        return existing_contract;
    end if;

    select decision_id, effective_at, recorded_at
    into current_decision
    from public.operator_control_consent_decisions
    where operator_id = p_operator_id
      and purpose = p_command ->> 'purpose'
    order by effective_at desc, recorded_at desc, decision_id desc
    limit 1
    for update;

    if found and (
        p_command ->> 'expectedCurrentDecisionId' is distinct from
            current_decision.decision_id
        or (p_command ->> 'effectiveAt')::timestamptz <
            current_decision.effective_at
        or p_recorded_at < current_decision.recorded_at
    ) then
        raise exception 'Consent command lost a concurrency race.'
            using errcode = '40001';
    elsif not found
       and p_command ->> 'expectedCurrentDecisionId' is not null then
        raise exception 'Initial consent cannot supersede a decision.'
            using errcode = '40001';
    end if;

    insert into public.operator_control_consent_decisions (
        operator_id, decision_id, command_id, purpose,
        policy_set_id, policy_set_version, decision, effective_at,
        recorded_at, supersedes_decision_id, consent_command
    ) values (
        p_operator_id,
        operation_record.operation_id,
        p_command ->> 'commandId',
        p_command ->> 'purpose',
        p_command ->> 'policySetId',
        p_command ->> 'policySetVersion',
        p_command ->> 'decision',
        (p_command ->> 'effectiveAt')::timestamptz,
        p_recorded_at,
        p_command ->> 'expectedCurrentDecisionId',
        p_command
    )
    on conflict (operator_id, command_id) do nothing;

    select consent_command
    into existing_contract
    from public.operator_control_consent_decisions
    where operator_id = p_operator_id
      and command_id = p_command ->> 'commandId';
    if existing_contract is distinct from p_command then
        raise exception 'Operator control consent is an immutable conflict.'
            using errcode = '23505';
    end if;
    return existing_contract;
end;
$$;

create or replace function public.persist_operator_declaration_revision(
    p_operator_id uuid,
    p_command jsonb,
    p_revision jsonb
)
returns jsonb
language plpgsql
security definer
set search_path = pg_catalog
as $$
declare
    current_declaration record;
    existing_contract jsonb;
    next_revision integer;
begin
    if coalesce(auth.role(), '') <> 'service_role' then
        raise exception 'Trusted Operator declaration authority is required.'
            using errcode = '42501';
    end if;
    if p_command -> 'contract' ->> 'name' <>
            'oracle.operator-declaration-command'
       or p_command ? 'operatorId'
       or (p_revision ->> 'operatorId')::uuid <> p_operator_id
       or p_revision ->> 'declarationId' <>
            p_command ->> 'declarationId'
       or p_revision ->> 'id' <> p_command ->> 'revisionId'
       or p_revision ->> 'policyId' <> p_command ->> 'policySetId'
       or p_revision ->> 'policyVersion' <>
            p_command ->> 'policySetVersion' then
        raise exception 'Invalid Operator declaration persistence bundle.'
            using errcode = '22023';
    end if;
    if not exists (
        select 1
        from public.operator_control_operations
        where operator_id = p_operator_id
          and command_id = p_command ->> 'commandId'
          and operation_type = 'declaration'
          and policy_set_id = p_command ->> 'policySetId'
          and policy_set_version = p_command ->> 'policySetVersion'
    ) then
        raise exception 'Declaration requires its accepted control operation.'
            using errcode = '23503';
    end if;
    if exists (
        select 1
        from public.operator_control_tombstones tombstone
        where tombstone.operator_id = p_operator_id
          and tombstone.subject_type = 'declaration'
          and tombstone.non_content_subject_identity =
                p_command ->> 'declarationId'
    ) then
        raise exception 'Deleted declaration identity cannot be replayed.'
            using errcode = '23505';
    end if;

    perform pg_advisory_xact_lock(hashtextextended(
        p_operator_id::text || ':declaration:' ||
            (p_command ->> 'declarationId'),
        0
    ));
    select declaration_contract
    into existing_contract
    from public.operator_declaration_revisions
    where operator_id = p_operator_id
      and declaration_revision_id = p_revision ->> 'id';
    if found then
        if existing_contract is distinct from p_revision then
            raise exception 'Declaration revision is an immutable conflict.'
                using errcode = '23505';
        end if;
        return existing_contract;
    end if;

    select *
    into current_declaration
    from public.operator_declarations
    where operator_id = p_operator_id
      and declaration_id = p_command ->> 'declarationId'
    for update;

    if found then
        if current_declaration.current_revision_id is distinct from
                p_command ->> 'expectedCurrentRevisionId' then
            raise exception 'Declaration command lost a concurrency race.'
                using errcode = '40001';
        end if;
        next_revision := current_declaration.current_revision + 1;
    else
        if p_command ->> 'expectedCurrentRevisionId' is not null then
            raise exception 'Initial declaration cannot expect a revision.'
                using errcode = '40001';
        end if;
        next_revision := 1;
        insert into public.operator_declarations (
            operator_id, declaration_id, current_revision_id, current_revision
        ) values (
            p_operator_id,
            p_command ->> 'declarationId',
            p_revision ->> 'id',
            next_revision
        );
    end if;

    if (p_revision ->> 'revision')::integer <> next_revision then
        raise exception 'Declaration revision is not monotonic.'
            using errcode = '40001';
    end if;

    insert into public.operator_declaration_revisions (
        operator_id, declaration_id, declaration_revision_id, revision,
        domain, declaration_key, status, effective_at, expires_at,
        policy_set_id, policy_set_version, supersedes_revision_id,
        deleted_at, declaration_contract
    ) values (
        p_operator_id,
        p_revision ->> 'declarationId',
        p_revision ->> 'id',
        (p_revision ->> 'revision')::integer,
        p_revision ->> 'domain',
        p_revision ->> 'key',
        p_revision ->> 'status',
        (p_revision -> 'temporalValidity' ->> 'effectiveFrom')::timestamptz,
        (p_revision -> 'temporalValidity' ->> 'validUntil')::timestamptz,
        p_revision ->> 'policyId',
        p_revision ->> 'policyVersion',
        p_revision ->> 'supersedesRevisionId',
        (p_revision ->> 'deletedAt')::timestamptz,
        p_revision
    )
    on conflict (operator_id, declaration_revision_id) do nothing;

    select declaration_contract
    into existing_contract
    from public.operator_declaration_revisions
    where operator_id = p_operator_id
      and declaration_revision_id = p_revision ->> 'id';
    if existing_contract is distinct from p_revision then
        raise exception 'Declaration revision is an immutable conflict.'
            using errcode = '23505';
    end if;

    update public.operator_declarations
    set current_revision_id = p_revision ->> 'id',
        current_revision = next_revision
    where operator_id = p_operator_id
      and declaration_id = p_revision ->> 'declarationId';

    insert into public.operator_declaration_head_events (
        operator_id, declaration_id, declaration_revision_id, revision,
        domain, purpose, status, effective_at
    ) values (
        p_operator_id,
        p_revision ->> 'declarationId',
        p_revision ->> 'id',
        next_revision,
        p_revision ->> 'domain',
        p_revision -> 'provenance' ->> 'purpose',
        p_revision ->> 'status',
        (p_revision -> 'temporalValidity' ->> 'effectiveFrom')::timestamptz
    )
    on conflict (operator_id, declaration_id, revision) do nothing;

    return existing_contract;
end;
$$;

create or replace function public.persist_operator_control_operation_step(
    p_operator_id uuid,
    p_step jsonb
)
returns jsonb
language plpgsql
security definer
set search_path = pg_catalog
as $$
declare
    existing_step record;
begin
    if coalesce(auth.role(), '') <> 'service_role' then
        raise exception 'Trusted Operator control authority is required.'
            using errcode = '42501';
    end if;
    if p_step -> 'contract' ->> 'name' <>
            'oracle.operator-control-operation-step' then
        raise exception 'Invalid Operator control operation step.'
            using errcode = '22023';
    end if;
    select *
    into existing_step
    from public.operator_control_operation_steps
    where operator_id = p_operator_id
      and operation_id = p_step ->> 'operationId'
      and step_id = p_step ->> 'id'
    for update;
    if found and existing_step.step_contract = p_step then
        return existing_step.step_contract;
    end if;
    if found and (
        (p_step ->> 'attempt')::integer < existing_step.attempt
        or existing_step.status in ('succeeded', 'retained-legal')
        or not (
            (existing_step.status = 'pending'
                and p_step ->> 'status' in (
                    'running', 'failed-recoverable', 'succeeded',
                    'retained-legal', 'processor-pending', 'backup-pending'
                ))
            or (existing_step.status = 'running'
                and p_step ->> 'status' in (
                    'failed-recoverable', 'succeeded', 'retained-legal',
                    'processor-pending', 'backup-pending'
                ))
            or (existing_step.status in (
                    'failed-recoverable', 'processor-pending', 'backup-pending'
                ) and p_step ->> 'status' in (
                    'running', 'failed-recoverable', 'succeeded',
                    'retained-legal', 'processor-pending', 'backup-pending'
                ))
        )
    ) then
        raise exception 'Invalid Operator control step transition.'
            using errcode = '40001';
    end if;

    insert into public.operator_control_operation_steps (
        operator_id, operation_id, step_id, owner_name, action_name,
        status, attempt, started_at, completed_at, affected_record_count,
        failure_code, checkpoint, step_contract
    ) values (
        p_operator_id,
        p_step ->> 'operationId',
        p_step ->> 'id',
        p_step ->> 'owner',
        p_step ->> 'action',
        p_step ->> 'status',
        (p_step ->> 'attempt')::integer,
        (p_step ->> 'startedAt')::timestamptz,
        (p_step ->> 'completedAt')::timestamptz,
        (p_step ->> 'affectedRecordCount')::integer,
        p_step ->> 'failureCode',
        p_step ->> 'checkpoint',
        p_step
    )
    on conflict (operator_id, operation_id, step_id) do update set
        status = excluded.status,
        attempt = excluded.attempt,
        started_at = excluded.started_at,
        completed_at = excluded.completed_at,
        affected_record_count = excluded.affected_record_count,
        failure_code = excluded.failure_code,
        checkpoint = excluded.checkpoint,
        step_contract = excluded.step_contract;
    return p_step;
end;
$$;

create or replace function public.persist_operator_control_tombstone(
    p_operator_id uuid,
    p_tombstone jsonb
)
returns jsonb
language plpgsql
security definer
set search_path = pg_catalog
as $$
declare
    existing_contract jsonb;
    policy_contract jsonb;
begin
    if coalesce(auth.role(), '') <> 'service_role' then
        raise exception 'Trusted Operator control authority is required.'
            using errcode = '42501';
    end if;
    select policy.policy_contract
    into policy_contract
    from public.operator_control_policy_sets policy
    where policy.policy_set_id = p_tombstone ->> 'policySetId'
      and policy.policy_set_version = p_tombstone ->> 'policySetVersion';
    if not found
       or policy_contract -> 'tombstone' ->> 'state' <> 'configured'
       or not (
            policy_contract -> 'tombstone' -> 'value' -> 'justifications'
            ? (p_tombstone ->> 'justification')
       )
       or not (
            policy_contract -> 'tombstone' -> 'value' -> 'permittedFields'
            ?& array[
                'tombstone-id', 'operation-id', 'subject-type',
                'non-content-subject-identity', 'policy-identity',
                'deleted-at', 'predecessor-identity', 'integrity-digest'
            ]
       ) then
        raise exception 'Tombstone policy is unavailable or unconfigured.'
            using errcode = '23514';
    end if;

    insert into public.operator_control_tombstones (
        operator_id, tombstone_id, operation_id, subject_type,
        non_content_subject_identity, policy_set_id, policy_set_version,
        justification, deleted_at, predecessor_identity, integrity_digest,
        tombstone_contract
    ) values (
        p_operator_id,
        p_tombstone ->> 'id',
        p_tombstone ->> 'operationId',
        p_tombstone ->> 'subjectType',
        p_tombstone ->> 'nonContentSubjectIdentity',
        p_tombstone ->> 'policySetId',
        p_tombstone ->> 'policySetVersion',
        p_tombstone ->> 'justification',
        (p_tombstone ->> 'deletedAt')::timestamptz,
        p_tombstone ->> 'predecessorIdentity',
        p_tombstone ->> 'integrityDigest',
        p_tombstone
    )
    on conflict (operator_id, tombstone_id) do nothing;

    select tombstone_contract
    into existing_contract
    from public.operator_control_tombstones
    where operator_id = p_operator_id
      and tombstone_id = p_tombstone ->> 'id';
    if existing_contract is distinct from p_tombstone then
        raise exception 'Operator control tombstone is an immutable conflict.'
            using errcode = '23505';
    end if;
    return existing_contract;
end;
$$;

create or replace function public.persist_operator_controlled_claim_revision(
    p_operator_id uuid,
    p_command_digest text,
    p_receipt jsonb,
    p_evidence jsonb[],
    p_claim_revision jsonb
)
returns jsonb
language plpgsql
security definer
set search_path = pg_catalog
as $$
declare
    persisted_claim jsonb;
begin
    if coalesce(auth.role(), '') <> 'service_role'
       or p_receipt ->> 'type' not in ('claim-correction', 'claim-dispute') then
        raise exception 'Trusted controlled claim authority is required.'
            using errcode = '42501';
    end if;
    perform public.persist_operator_control_operation(
        p_operator_id,
        p_command_digest,
        p_receipt
    );
    persisted_claim := public.persist_operator_intelligence_claim_revision(
        p_operator_id,
        p_evidence,
        p_claim_revision
    );
    return persisted_claim;
end;
$$;

create or replace function
    public.append_operator_controlled_evidence_disposition(
        p_operator_id uuid,
        p_command_digest text,
        p_receipt jsonb,
        p_disposition jsonb
    )
returns jsonb
language plpgsql
security definer
set search_path = pg_catalog
as $$
declare
    persisted_disposition jsonb;
begin
    if coalesce(auth.role(), '') <> 'service_role'
       or p_receipt ->> 'type' <> 'evidence-disposition' then
        raise exception 'Trusted Evidence disposition authority is required.'
            using errcode = '42501';
    end if;
    perform public.persist_operator_control_operation(
        p_operator_id,
        p_command_digest,
        p_receipt
    );
    persisted_disposition := public.append_operator_evidence_disposition(
        p_operator_id,
        p_disposition
    );
    return persisted_disposition;
end;
$$;

create or replace function public.append_operator_control_ineligibility_batch(
    p_operator_id uuid,
    p_assessments jsonb[]
)
returns integer
language plpgsql
security definer
set search_path = pg_catalog
as $$
declare
    assessment_bundle jsonb;
    persisted_count integer := 0;
begin
    if coalesce(auth.role(), '') <> 'service_role' then
        raise exception 'Trusted eligibility authority is required.'
            using errcode = '42501';
    end if;
    if cardinality(p_assessments) < 1 or cardinality(p_assessments) > 100 then
        raise exception 'Eligibility batch exceeds its engineering ceiling.'
            using errcode = '22023';
    end if;
    foreach assessment_bundle in array p_assessments
    loop
        if (assessment_bundle -> 'eligibility' ->> 'eligible')::boolean
           or (assessment_bundle -> 'eligibility' -> 'reasons') = '[]'::jsonb
        then
            raise exception 'Control eligibility batches may only remove eligibility.'
                using errcode = '23514';
        end if;
        perform public.append_operator_intelligence_eligibility(
            p_operator_id,
            assessment_bundle ->> 'claimId',
            assessment_bundle ->> 'claimRevisionId',
            assessment_bundle -> 'eligibility'
        );
        persisted_count := persisted_count + 1;
    end loop;
    return persisted_count;
end;
$$;

create or replace function public.delete_operator_declaration_batch(
    p_operator_id uuid,
    p_operation_id text,
    p_declaration_ids text[],
    p_batch_size integer
)
returns integer
language plpgsql
security definer
set search_path = pg_catalog
as $$
declare
    removed_count integer;
begin
    if coalesce(auth.role(), '') <> 'service_role' then
        raise exception 'Trusted Operator declaration deletion is required.'
            using errcode = '42501';
    end if;
    if p_batch_size < 1
       or p_batch_size > 100
       or cardinality(p_declaration_ids) > p_batch_size then
        raise exception 'Declaration deletion batch exceeds its bound.'
            using errcode = '22023';
    end if;
    if not exists (
        select 1
        from public.operator_control_operations operation
        where operation.operator_id = p_operator_id
          and operation.operation_id = p_operation_id
          and operation.operation_type = 'deletion'
          and operation.eligibility_removed_at is not null
    ) then
        raise exception 'Deletion requires prior eligibility removal.'
            using errcode = '23514';
    end if;
    if (
        select count(*)
        from public.operator_control_tombstones tombstone
        where tombstone.operator_id = p_operator_id
          and tombstone.operation_id = p_operation_id
          and tombstone.subject_type = 'declaration'
          and tombstone.non_content_subject_identity =
                any(p_declaration_ids)
    ) <> cardinality(p_declaration_ids) then
        raise exception 'Declaration deletion requires approved tombstones.'
            using errcode = '23514';
    end if;
    delete from public.operator_declarations declaration
    where declaration.operator_id = p_operator_id
      and declaration.declaration_id = any(p_declaration_ids);
    get diagnostics removed_count = row_count;
    return removed_count;
end;
$$;

create or replace function public.delete_operator_intelligence_batch(
    p_operator_id uuid,
    p_operation_id text,
    p_claim_ids text[],
    p_evidence_reference_ids text[],
    p_batch_size integer
)
returns jsonb
language plpgsql
security definer
set search_path = pg_catalog
as $$
declare
    removed_claims integer;
    removed_evidence integer;
begin
    if coalesce(auth.role(), '') <> 'service_role' then
        raise exception 'Trusted Operator Intelligence deletion is required.'
            using errcode = '42501';
    end if;
    if p_batch_size < 1
       or p_batch_size > 100
       or cardinality(p_claim_ids) + cardinality(p_evidence_reference_ids) >
            p_batch_size then
        raise exception 'Intelligence deletion batch exceeds its bound.'
            using errcode = '22023';
    end if;
    if not exists (
        select 1
        from public.operator_control_operations operation
        where operation.operator_id = p_operator_id
          and operation.operation_id = p_operation_id
          and operation.operation_type = 'deletion'
          and operation.eligibility_removed_at is not null
    ) then
        raise exception 'Deletion requires prior eligibility removal.'
            using errcode = '23514';
    end if;
    if (
        select count(*)
        from public.operator_control_tombstones tombstone
        where tombstone.operator_id = p_operator_id
          and tombstone.operation_id = p_operation_id
          and (
            (
                tombstone.subject_type = 'claim'
                and tombstone.non_content_subject_identity = any(p_claim_ids)
            )
            or (
                tombstone.subject_type = 'evidence-reference'
                and tombstone.non_content_subject_identity =
                    any(p_evidence_reference_ids)
            )
          )
    ) <> cardinality(p_claim_ids) + cardinality(p_evidence_reference_ids) then
        raise exception 'Intelligence deletion requires approved tombstones.'
            using errcode = '23514';
    end if;
    delete from public.operator_intelligence_claims claim
    where claim.operator_id = p_operator_id
      and claim.claim_id = any(p_claim_ids);
    get diagnostics removed_claims = row_count;
    delete from public.operator_intelligence_claim_evidence link
    where link.operator_id = p_operator_id
      and link.evidence_reference_id = any(p_evidence_reference_ids);
    delete from public.operator_intelligence_evidence evidence
    where evidence.operator_id = p_operator_id
      and evidence.evidence_reference_id = any(p_evidence_reference_ids);
    get diagnostics removed_evidence = row_count;
    return jsonb_build_object(
        'claims', removed_claims,
        'evidenceReferences', removed_evidence
    );
end;
$$;

create or replace function public.read_operator_declaration_page(
    p_operator_id uuid,
    p_purpose text,
    p_domain text,
    p_as_of timestamptz,
    p_page_size integer,
    p_after_effective_at timestamptz default null,
    p_after_revision_id text default null
)
returns jsonb
language plpgsql
security definer
set search_path = pg_catalog
as $$
declare
    page_rows jsonb;
begin
    if coalesce(auth.role(), '') <> 'service_role'
       or p_page_size < 1 or p_page_size > 100 then
        raise exception 'Invalid trusted declaration page request.'
            using errcode = '42501';
    end if;
    select coalesce(jsonb_agg(page.declaration_contract
        order by page.effective_at desc, page.declaration_revision_id), '[]'::jsonb)
    into page_rows
    from (
        select revision.declaration_contract,
            head.effective_at, head.declaration_revision_id
        from public.operator_declaration_head_events head
        join public.operator_declarations aggregate
          on aggregate.operator_id = head.operator_id
         and aggregate.declaration_id = head.declaration_id
         and aggregate.current_revision_id = head.declaration_revision_id
        join public.operator_declaration_revisions revision
          on revision.operator_id = head.operator_id
         and revision.declaration_revision_id = head.declaration_revision_id
        where head.operator_id = p_operator_id
          and head.purpose = p_purpose
          and (p_domain is null or head.domain = p_domain)
          and head.status in ('active', 'corrected')
          and head.effective_at <= p_as_of
          and (
            p_after_effective_at is null
            or (head.effective_at, head.declaration_revision_id) <
                (p_after_effective_at, p_after_revision_id)
          )
        order by head.effective_at desc, head.declaration_revision_id
        limit p_page_size
    ) page;
    return jsonb_build_object('rows', page_rows);
end;
$$;

create or replace function public.read_operator_declaration_lifecycle_page(
    p_operator_id uuid,
    p_declaration_id text,
    p_page_size integer,
    p_before_revision integer default null
)
returns jsonb
language plpgsql
security definer
set search_path = pg_catalog
as $$
declare
    page_rows jsonb;
begin
    if coalesce(auth.role(), '') <> 'service_role'
       or p_page_size < 1 or p_page_size > 100 then
        raise exception 'Invalid trusted declaration history request.'
            using errcode = '42501';
    end if;
    select coalesce(jsonb_agg(page.declaration_contract
        order by page.revision desc), '[]'::jsonb)
    into page_rows
    from (
        select declaration_contract, revision
        from public.operator_declaration_revisions
        where operator_id = p_operator_id
          and declaration_id = p_declaration_id
          and (p_before_revision is null or revision < p_before_revision)
        order by revision desc
        limit p_page_size
    ) page;
    return jsonb_build_object('rows', page_rows);
end;
$$;

create or replace function public.read_operator_control_operation_page(
    p_operator_id uuid,
    p_page_size integer,
    p_before_requested_at timestamptz default null,
    p_before_operation_id text default null
)
returns jsonb
language plpgsql
security definer
set search_path = pg_catalog
as $$
declare
    page_rows jsonb;
begin
    if coalesce(auth.role(), '') <> 'service_role'
       or p_page_size < 1 or p_page_size > 100 then
        raise exception 'Invalid trusted operation page request.'
            using errcode = '42501';
    end if;
    select coalesce(jsonb_agg(page.receipt_contract
        order by page.requested_at desc, page.operation_id desc), '[]'::jsonb)
    into page_rows
    from (
        select receipt_contract, requested_at, operation_id
        from public.operator_control_operations
        where operator_id = p_operator_id
          and (
            p_before_requested_at is null
            or (requested_at, operation_id) <
                (p_before_requested_at, p_before_operation_id)
          )
        order by requested_at desc, operation_id desc
        limit p_page_size
    ) page;
    return jsonb_build_object('rows', page_rows);
end;
$$;

create or replace function public.read_operator_control_operation_steps(
    p_operator_id uuid,
    p_operation_id text
)
returns jsonb
language plpgsql
security definer
set search_path = pg_catalog
as $$
declare
    step_rows jsonb;
begin
    if coalesce(auth.role(), '') <> 'service_role' then
        raise exception 'Trusted Operator control authority is required.'
            using errcode = '42501';
    end if;
    select coalesce(jsonb_agg(step_contract order by step_id), '[]'::jsonb)
    into step_rows
    from public.operator_control_operation_steps
    where operator_id = p_operator_id
      and operation_id = p_operation_id;
    return step_rows;
end;
$$;

alter table public.operator_control_policy_sets enable row level security;
alter table public.operator_control_consent_decisions enable row level security;
alter table public.operator_declarations enable row level security;
alter table public.operator_declaration_revisions enable row level security;
alter table public.operator_declaration_head_events enable row level security;
alter table public.operator_control_operations enable row level security;
alter table public.operator_control_operation_steps enable row level security;
alter table public.operator_control_tombstones enable row level security;

create policy operator_control_policy_sets_select_authenticated
    on public.operator_control_policy_sets for select to authenticated
    using (true);

create policy operator_control_consent_select_own
    on public.operator_control_consent_decisions for select to authenticated
    using (exists (
        select 1 from public.operator_account_bindings binding
        where binding.account_id = auth.uid()
          and binding.operator_id =
                operator_control_consent_decisions.operator_id
    ));
create policy operator_declarations_select_own
    on public.operator_declarations for select to authenticated
    using (exists (
        select 1 from public.operator_account_bindings binding
        where binding.account_id = auth.uid()
          and binding.operator_id = operator_declarations.operator_id
    ));
create policy operator_declaration_revisions_select_own
    on public.operator_declaration_revisions for select to authenticated
    using (exists (
        select 1 from public.operator_account_bindings binding
        where binding.account_id = auth.uid()
          and binding.operator_id =
                operator_declaration_revisions.operator_id
    ));
create policy operator_declaration_head_select_own
    on public.operator_declaration_head_events for select to authenticated
    using (exists (
        select 1 from public.operator_account_bindings binding
        where binding.account_id = auth.uid()
          and binding.operator_id =
                operator_declaration_head_events.operator_id
    ));
create policy operator_control_operations_select_own
    on public.operator_control_operations for select to authenticated
    using (exists (
        select 1 from public.operator_account_bindings binding
        where binding.account_id = auth.uid()
          and binding.operator_id = operator_control_operations.operator_id
    ));
create policy operator_control_steps_select_own
    on public.operator_control_operation_steps for select to authenticated
    using (exists (
        select 1 from public.operator_account_bindings binding
        where binding.account_id = auth.uid()
          and binding.operator_id =
                operator_control_operation_steps.operator_id
    ));
create policy operator_control_tombstones_select_own
    on public.operator_control_tombstones for select to authenticated
    using (exists (
        select 1 from public.operator_account_bindings binding
        where binding.account_id = auth.uid()
          and binding.operator_id = operator_control_tombstones.operator_id
    ));

revoke all privileges on table public.operator_control_policy_sets
    from anon, authenticated, service_role;
revoke all privileges on table public.operator_control_consent_decisions
    from anon, authenticated, service_role;
revoke all privileges on table public.operator_declarations
    from anon, authenticated, service_role;
revoke all privileges on table public.operator_declaration_revisions
    from anon, authenticated, service_role;
revoke all privileges on table public.operator_declaration_head_events
    from anon, authenticated, service_role;
revoke all privileges on table public.operator_control_operations
    from anon, authenticated, service_role;
revoke all privileges on table public.operator_control_operation_steps
    from anon, authenticated, service_role;
revoke all privileges on table public.operator_control_tombstones
    from anon, authenticated, service_role;

grant select on table public.operator_control_policy_sets
    to authenticated, service_role;
grant select on table public.operator_control_consent_decisions
    to authenticated, service_role;
grant select on table public.operator_declarations
    to authenticated, service_role;
grant select on table public.operator_declaration_revisions
    to authenticated, service_role;
grant select on table public.operator_declaration_head_events
    to authenticated, service_role;
grant select on table public.operator_control_operations
    to authenticated, service_role;
grant select on table public.operator_control_operation_steps
    to authenticated, service_role;
grant select on table public.operator_control_tombstones
    to authenticated, service_role;

revoke all privileges on function
    public.register_operator_control_policy_set(jsonb)
    from public, anon, authenticated;
revoke all privileges on function
    public.persist_operator_control_operation(uuid, text, jsonb)
    from public, anon, authenticated;
revoke all privileges on function
    public.append_operator_control_consent_decision(uuid, jsonb, timestamptz)
    from public, anon, authenticated;
revoke all privileges on function
    public.persist_operator_declaration_revision(uuid, jsonb, jsonb)
    from public, anon, authenticated;
revoke all privileges on function
    public.persist_operator_control_operation_step(uuid, jsonb)
    from public, anon, authenticated;
revoke all privileges on function
    public.persist_operator_control_tombstone(uuid, jsonb)
    from public, anon, authenticated;
revoke all privileges on function
    public.persist_operator_controlled_claim_revision(
        uuid, text, jsonb, jsonb[], jsonb
    ) from public, anon, authenticated;
revoke all privileges on function
    public.append_operator_controlled_evidence_disposition(
        uuid, text, jsonb, jsonb
    ) from public, anon, authenticated;
revoke all privileges on function
    public.append_operator_control_ineligibility_batch(uuid, jsonb[])
    from public, anon, authenticated;
revoke all privileges on function
    public.delete_operator_declaration_batch(uuid, text, text[], integer)
    from public, anon, authenticated;
revoke all privileges on function
    public.delete_operator_intelligence_batch(
        uuid, text, text[], text[], integer
    ) from public, anon, authenticated;
revoke all privileges on function
    public.read_operator_declaration_page(
        uuid, text, text, timestamptz, integer, timestamptz, text
    ) from public, anon, authenticated;
revoke all privileges on function
    public.read_operator_declaration_lifecycle_page(
        uuid, text, integer, integer
    ) from public, anon, authenticated;
revoke all privileges on function
    public.read_operator_control_operation_page(
        uuid, integer, timestamptz, text
    ) from public, anon, authenticated;
revoke all privileges on function
    public.read_operator_control_operation_steps(uuid, text)
    from public, anon, authenticated;

grant execute on function
    public.register_operator_control_policy_set(jsonb) to service_role;
grant execute on function
    public.persist_operator_control_operation(uuid, text, jsonb)
    to service_role;
grant execute on function
    public.append_operator_control_consent_decision(uuid, jsonb, timestamptz)
    to service_role;
grant execute on function
    public.persist_operator_declaration_revision(uuid, jsonb, jsonb)
    to service_role;
grant execute on function
    public.persist_operator_control_operation_step(uuid, jsonb)
    to service_role;
grant execute on function
    public.persist_operator_control_tombstone(uuid, jsonb)
    to service_role;
grant execute on function
    public.persist_operator_controlled_claim_revision(
        uuid, text, jsonb, jsonb[], jsonb
    ) to service_role;
grant execute on function
    public.append_operator_controlled_evidence_disposition(
        uuid, text, jsonb, jsonb
    ) to service_role;
grant execute on function
    public.append_operator_control_ineligibility_batch(uuid, jsonb[])
    to service_role;
grant execute on function
    public.delete_operator_declaration_batch(uuid, text, text[], integer)
    to service_role;
grant execute on function
    public.delete_operator_intelligence_batch(
        uuid, text, text[], text[], integer
    ) to service_role;
grant execute on function
    public.read_operator_declaration_page(
        uuid, text, text, timestamptz, integer, timestamptz, text
    ) to service_role;
grant execute on function
    public.read_operator_declaration_lifecycle_page(
        uuid, text, integer, integer
    ) to service_role;
grant execute on function
    public.read_operator_control_operation_page(
        uuid, integer, timestamptz, text
    ) to service_role;
grant execute on function
    public.read_operator_control_operation_steps(uuid, text)
    to service_role;

commit;
