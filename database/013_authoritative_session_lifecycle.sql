begin;

-- ADR-041 evolves the historical oracle_sessions relation into the canonical
-- durable Session record. Existing report-shaped rows remain preserved as
-- completed legacy Sessions. Runtime persistence remains separately gated.
alter table public.oracle_sessions
    add column session_contract_version integer not null default 1,
    add column lifecycle_status text not null default 'completed',
    add column lifecycle_version integer not null default 1,
    add column started_at timestamptz,
    add column updated_at timestamptz,
    add column ended_at timestamptz,
    add column application_id text,
    add column device_id text,
    add column integration_id text,
    add column integration_version text,
    add column eligible boolean not null default true,
    add column deletion_operation_id uuid,
    add column session_contract jsonb;

update public.oracle_sessions
set started_at = coalesce(created_at, now()),
    updated_at = coalesce(created_at, now()),
    ended_at = coalesce(created_at, now()),
    application_id = 'legacy.oracle',
    device_id = 'legacy-unknown',
    integration_id = 'legacy.analysis',
    integration_version = '0.0.0',
    session_contract = jsonb_build_object(
        'contract', 'oracle.session',
        'contractVersion', 1,
        'id', id,
        'operatorId', operator_id,
        'status', 'completed',
        'version', 1,
        'startedAt', coalesce(created_at, now()),
        'updatedAt', coalesce(created_at, now()),
        'endedAt', coalesce(created_at, now()),
        'context', jsonb_build_object(
            'applicationId', 'legacy.oracle',
            'deviceId', 'legacy-unknown',
            'integrationId', 'legacy.analysis',
            'integrationVersion', '0.0.0'
        ),
        'evidence', '[]'::jsonb,
        'deletionOperationId', null
    );

alter table public.oracle_sessions
    alter column started_at set not null,
    alter column updated_at set not null,
    alter column application_id set not null,
    alter column device_id set not null,
    alter column integration_id set not null,
    alter column integration_version set not null,
    alter column session_contract set not null,
    add constraint oracle_sessions_lifecycle_status_check check (
        lifecycle_status in (
            'active', 'completed', 'abandoned', 'deletion-pending', 'deleted'
        )
    ),
    add constraint oracle_sessions_lifecycle_version_check
        check (lifecycle_version > 0),
    add constraint oracle_sessions_contract_version_check
        check (session_contract_version = 1),
    add constraint oracle_sessions_integration_version_check
        check (
            integration_version ~
            '^[0-9]+\.[0-9]+\.[0-9]+([-+][0-9A-Za-z.-]+)?$'
        ),
    add constraint oracle_sessions_terminal_time_check check (
        (lifecycle_status = 'active' and ended_at is null)
        or lifecycle_status in ('deletion-pending', 'deleted')
        or (lifecycle_status in ('completed', 'abandoned')
            and ended_at is not null)
    ),
    add constraint oracle_sessions_deletion_check check (
        (lifecycle_status in ('deletion-pending', 'deleted')
            and deletion_operation_id is not null and not eligible)
        or (lifecycle_status not in ('deletion-pending', 'deleted')
            and deletion_operation_id is null and eligible)
    ),
    add constraint oracle_sessions_contract_check check (
        session_contract ->> 'contract' = 'oracle.session'
        and (session_contract ->> 'contractVersion')::integer = 1
        and (session_contract ->> 'id')::uuid = id
        and (session_contract ->> 'operatorId')::uuid = operator_id
        and session_contract ->> 'status' = lifecycle_status
        and (session_contract ->> 'version')::integer = lifecycle_version
        and (session_contract ->> 'startedAt')::timestamptz = started_at
        and (session_contract ->> 'updatedAt')::timestamptz = updated_at
        and coalesce(
            (session_contract ->> 'endedAt')::timestamptz,
            '-infinity'::timestamptz
        ) = coalesce(ended_at, '-infinity'::timestamptz)
        and session_contract -> 'context' ->> 'applicationId' = application_id
        and session_contract -> 'context' ->> 'deviceId' = device_id
        and session_contract -> 'context' ->> 'integrationId' = integration_id
        and session_contract -> 'context' ->> 'integrationVersion' =
            integration_version
        and session_contract -> 'evidence' is not null
        and jsonb_typeof(session_contract -> 'evidence') = 'array'
        and not (session_contract ?| array[
            'prompt', 'screenshot', 'rawObservation', 'rawContent',
            'gameMemory', 'credentials'
        ])
    );

create table public.oracle_session_evidence_references (
    session_id uuid not null,
    operator_id uuid not null,
    evidence_id uuid not null,
    source_type text not null,
    source_owner_id text not null,
    source_record_id text not null,
    purpose text not null,
    policy_id text not null,
    policy_version text not null,
    content_digest text not null,
    observed_at timestamptz not null,
    admitted_at timestamptz not null,
    evidence_contract jsonb not null,
    primary key (session_id, evidence_id),
    foreign key (session_id, operator_id)
        references public.oracle_sessions(id, operator_id) on delete cascade,
    constraint oracle_session_evidence_source_type_check check (
        source_type in (
            'game-integration-direct-observation',
            'game-integration-deterministic-transformation',
            'operator-supplied'
        )
    ),
    constraint oracle_session_evidence_digest_check
        check (content_digest ~ '^sha256:[0-9a-f]{64}$'),
    constraint oracle_session_evidence_time_check
        check (admitted_at >= observed_at),
    constraint oracle_session_evidence_minimisation_check check (
        not (evidence_contract ?| array[
            'prompt', 'screenshot', 'rawObservation', 'rawContent',
            'gameMemory', 'credentials', 'summary'
        ])
    )
);

create table public.oracle_session_command_receipts (
    operator_id uuid not null
        references public.operators(id) on delete cascade,
    idempotency_key text not null,
    command_id uuid not null,
    session_id uuid not null,
    command_type text not null,
    command_digest text not null,
    previous_version integer,
    resulting_version integer not null,
    recorded_at timestamptz not null,
    command_contract jsonb not null,
    result_contract jsonb not null,
    primary key (operator_id, idempotency_key),
    unique (operator_id, command_id),
    foreign key (session_id, operator_id)
        references public.oracle_sessions(id, operator_id) on delete cascade,
    constraint oracle_session_command_type_check check (
        command_type in (
            'begin', 'resume', 'recover', 'complete', 'abandon',
            'admit-evidence', 'delete', 'finalize-deletion'
        )
    ),
    constraint oracle_session_command_digest_check
        check (command_digest ~ '^sha256:[0-9a-f]{64}$'),
    constraint oracle_session_command_version_check check (
        resulting_version > 0
        and (previous_version is null or previous_version > 0)
    ),
    constraint oracle_session_command_minimisation_check check (
        not (command_contract ?| array[
            'prompt', 'screenshot', 'rawObservation', 'rawContent',
            'gameMemory', 'credentials'
        ])
    )
);

create index oracle_sessions_operator_history_idx
    on public.oracle_sessions (
        operator_id, started_at desc, id desc
    ) where eligible;
create index oracle_sessions_operator_status_history_idx
    on public.oracle_sessions (
        operator_id, lifecycle_status, started_at desc, id desc
    ) where eligible;
create index oracle_session_evidence_operator_session_idx
    on public.oracle_session_evidence_references (
        operator_id, session_id, admitted_at, evidence_id
    );

create or replace function public.persist_oracle_session_mutation(
    p_operator_id uuid,
    p_command_digest text,
    p_command jsonb,
    p_session jsonb,
    p_receipt jsonb
)
returns jsonb
language plpgsql
security definer
set search_path = pg_catalog
as $$
declare
    existing_receipt record;
    current_session record;
    evidence jsonb;
    previous_version integer;
begin
    if coalesce(auth.role(), '') <> 'service_role' then
        raise exception 'Trusted Oracle Session Service authority is required.'
            using errcode = '42501';
    end if;
    if p_command_digest !~ '^sha256:[0-9a-f]{64}$'
       or (p_command ->> 'operatorId')::uuid <> p_operator_id
       or (p_session ->> 'operatorId')::uuid <> p_operator_id
       or p_session ->> 'contract' <> 'oracle.session'
       or (p_session ->> 'contractVersion')::integer <> 1
       or (p_command ->> 'sessionId')::uuid <>
            (p_session ->> 'id')::uuid
       or p_receipt ->> 'idempotencyKey' <>
            p_command ->> 'idempotencyKey'
       or p_receipt ->> 'commandId' <> p_command ->> 'commandId' then
        raise exception 'Invalid Oracle Session mutation contract.'
            using errcode = '22023';
    end if;
    if p_command ?| array[
        'prompt', 'screenshot', 'rawObservation', 'rawContent',
        'gameMemory', 'credentials'
    ] or p_session ?| array[
        'prompt', 'screenshot', 'rawObservation', 'rawContent',
        'gameMemory', 'credentials'
    ] then
        raise exception 'Raw Session content is prohibited.'
            using errcode = '23514';
    end if;
    if not exists (
        select 1 from public.operators where id = p_operator_id
    ) then
        raise exception 'Operator ownership cannot be established.'
            using errcode = '42501';
    end if;

    perform pg_advisory_xact_lock(hashtextextended(
        p_operator_id::text || ':session:' ||
            (p_command ->> 'idempotencyKey'),
        0
    ));
    select * into existing_receipt
    from public.oracle_session_command_receipts
    where operator_id = p_operator_id
      and idempotency_key = p_command ->> 'idempotencyKey'
    for update;
    if found then
        if existing_receipt.command_digest <> p_command_digest
           or existing_receipt.command_contract <> p_command then
            raise exception 'Oracle Session idempotency conflict.'
                using errcode = '23505';
        end if;
        return existing_receipt.result_contract;
    end if;

    select * into current_session
    from public.oracle_sessions
    where id = (p_session ->> 'id')::uuid
      and operator_id = p_operator_id
    for update;
    previous_version := nullif(p_command ->> 'expectedVersion', '')::integer;

    if p_command ->> 'type' = 'begin' then
        if exists (
            select 1 from public.oracle_sessions
            where id = (p_session ->> 'id')::uuid
        ) or previous_version is not null
           or (p_session ->> 'version')::integer <> 1 then
            raise exception 'Invalid Oracle Session begin concurrency.'
                using errcode = '40001';
        end if;
    elsif not found
       or current_session.lifecycle_version is distinct from previous_version
       or (p_session ->> 'version')::integer <>
            current_session.lifecycle_version + 1 then
        raise exception 'Stale Oracle Session lifecycle version.'
            using errcode = '40001';
    end if;

    insert into public.oracle_sessions (
        id, operator_id, created_at, session_contract_version,
        lifecycle_status, lifecycle_version, started_at, updated_at, ended_at,
        application_id, device_id, integration_id, integration_version,
        eligible, deletion_operation_id, session_contract
    ) values (
        (p_session ->> 'id')::uuid,
        p_operator_id,
        (p_session ->> 'startedAt')::timestamptz,
        1,
        p_session ->> 'status',
        (p_session ->> 'version')::integer,
        (p_session ->> 'startedAt')::timestamptz,
        (p_session ->> 'updatedAt')::timestamptz,
        (p_session ->> 'endedAt')::timestamptz,
        p_session -> 'context' ->> 'applicationId',
        p_session -> 'context' ->> 'deviceId',
        p_session -> 'context' ->> 'integrationId',
        p_session -> 'context' ->> 'integrationVersion',
        p_session ->> 'status' not in ('deletion-pending', 'deleted'),
        (p_session ->> 'deletionOperationId')::uuid,
        p_session
    )
    on conflict (id) do update set
        lifecycle_status = excluded.lifecycle_status,
        lifecycle_version = excluded.lifecycle_version,
        updated_at = excluded.updated_at,
        ended_at = excluded.ended_at,
        eligible = excluded.eligible,
        deletion_operation_id = excluded.deletion_operation_id,
        session_contract = excluded.session_contract;

    delete from public.oracle_session_evidence_references
    where session_id = (p_session ->> 'id')::uuid
      and operator_id = p_operator_id;
    for evidence in
        select value from jsonb_array_elements(p_session -> 'evidence')
    loop
        insert into public.oracle_session_evidence_references (
            session_id, operator_id, evidence_id, source_type,
            source_owner_id, source_record_id, purpose, policy_id,
            policy_version, content_digest, observed_at, admitted_at,
            evidence_contract
        ) values (
            (p_session ->> 'id')::uuid,
            p_operator_id,
            (evidence ->> 'id')::uuid,
            evidence ->> 'sourceType',
            evidence ->> 'sourceOwnerId',
            evidence ->> 'sourceRecordId',
            evidence ->> 'purpose',
            evidence ->> 'policyId',
            evidence ->> 'policyVersion',
            evidence ->> 'contentDigest',
            (evidence ->> 'observedAt')::timestamptz,
            (evidence ->> 'admittedAt')::timestamptz,
            evidence
        );
    end loop;

    insert into public.oracle_session_command_receipts (
        operator_id, idempotency_key, command_id, session_id,
        command_type, command_digest, previous_version, resulting_version,
        recorded_at, command_contract, result_contract
    ) values (
        p_operator_id,
        p_command ->> 'idempotencyKey',
        (p_command ->> 'commandId')::uuid,
        (p_session ->> 'id')::uuid,
        p_command ->> 'type',
        p_command_digest,
        previous_version,
        (p_session ->> 'version')::integer,
        (p_receipt ->> 'recordedAt')::timestamptz,
        p_command,
        jsonb_build_object('session', p_session, 'receipt', p_receipt)
    );

    return jsonb_build_object('session', p_session, 'receipt', p_receipt);
end;
$$;

alter table public.oracle_session_evidence_references enable row level security;
alter table public.oracle_session_command_receipts enable row level security;

drop policy if exists oracle_sessions_select_own on public.oracle_sessions;
drop policy if exists oracle_sessions_insert_own on public.oracle_sessions;
create policy oracle_sessions_select_own_authoritative
    on public.oracle_sessions for select to authenticated
    using (
        eligible and exists (
            select 1 from public.operator_account_bindings binding
            where binding.account_id = auth.uid()
              and binding.operator_id = oracle_sessions.operator_id
        )
    );
create policy oracle_session_evidence_select_own
    on public.oracle_session_evidence_references for select to authenticated
    using (exists (
        select 1 from public.operator_account_bindings binding
        where binding.account_id = auth.uid()
          and binding.operator_id =
                oracle_session_evidence_references.operator_id
    ));
create policy oracle_session_receipts_select_own
    on public.oracle_session_command_receipts for select to authenticated
    using (exists (
        select 1 from public.operator_account_bindings binding
        where binding.account_id = auth.uid()
          and binding.operator_id = oracle_session_command_receipts.operator_id
    ));

revoke all privileges on table public.oracle_session_evidence_references
    from anon, authenticated, service_role;
revoke all privileges on table public.oracle_session_command_receipts
    from anon, authenticated, service_role;
grant select on table public.oracle_session_evidence_references
    to service_role;
grant select on table public.oracle_session_command_receipts
    to service_role;
revoke insert, update, delete on table public.oracle_sessions
    from anon, authenticated, service_role;
revoke select on table public.oracle_sessions from anon, authenticated;
grant select on table public.oracle_sessions to service_role;
grant select (
    id, operator_id, lifecycle_status, lifecycle_version, started_at,
    updated_at, ended_at, application_id, integration_id,
    integration_version, eligible
) on table public.oracle_sessions to authenticated;

revoke all on function public.persist_oracle_session_mutation(
    uuid, text, jsonb, jsonb, jsonb
) from public, anon, authenticated;
grant execute on function public.persist_oracle_session_mutation(
    uuid, text, jsonb, jsonb, jsonb
) to service_role;

commit;
