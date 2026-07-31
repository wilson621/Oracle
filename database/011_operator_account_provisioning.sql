begin;

-- Sequence values are not transactional. This single-row allocator preserves
-- designation allocation when a provisioning transaction rolls back.
create table public.operator_designation_allocator (
    singleton boolean primary key default true
        check (singleton),
    next_value bigint not null
        check (next_value > 0)
);

insert into public.operator_designation_allocator (singleton, next_value)
select true, greatest(
    (
        select case
            when sequence_state.is_called then sequence_state.last_value + 1
            else sequence_state.last_value
        end
        from public.operator_designation_sequence sequence_state
    ),
    coalesce((
        select max(substring(designation from '^OR-([0-9]+)$')::bigint) + 1
        from public.operators
        where designation ~ '^OR-[0-9]+$'
    ), 1)
);

alter table public.operator_account_bindings
    add constraint operator_account_bindings_account_operator_unique
    unique (account_id, operator_id);

create table public.operator_provisioning_receipts (
    account_id uuid primary key
        references auth.users(id) on delete cascade,
    command_id uuid not null unique,
    request_digest text not null
        check (request_digest ~ '^sha256:[0-9a-f]{64}$'),
    operator_id uuid not null unique
        references public.operators(id) on delete cascade,
    policy_id text not null
        check (length(policy_id) > 0),
    policy_version text not null
        check (length(policy_version) > 0),
    result_contract jsonb not null
        check (jsonb_typeof(result_contract) = 'object'),
    created_at timestamptz not null default now(),
    unique (account_id, operator_id),
    foreign key (account_id, operator_id)
        references public.operator_account_bindings(account_id, operator_id)
        on delete cascade
        deferrable initially deferred
);

create unique index operators_designation_unique_idx
    on public.operators(designation)
    where designation is not null;

create or replace function public.provision_operator_for_account(
    p_account_id uuid,
    p_command jsonb
)
returns jsonb
language plpgsql
security definer
set search_path = pg_catalog
as $$
declare
    command_id_value uuid;
    callsign_value text;
    policy_id_value text;
    policy_version_value text;
    request_digest_value text;
    request_digest_bytes bytea;
    pgcrypto_schema name;
    designation_number bigint;
    designation_value text;
    result_value jsonb;
    existing_receipt record;
    existing_binding record;
    provisioned_operator public.operators%rowtype;
begin
    if coalesce(auth.role(), '') <> 'service_role' then
        raise exception 'Trusted Operator provisioning authority is required.'
            using errcode = '42501';
    end if;

    if p_command -> 'contract' ->> 'name' <>
            'oracle.operator-provisioning-command'
       or (p_command -> 'contract' ->> 'version')::integer <> 1 then
        raise exception 'Unsupported Operator provisioning contract.'
            using errcode = '22023';
    end if;

    command_id_value := (p_command ->> 'commandId')::uuid;
    callsign_value := p_command ->> 'callsign';
    policy_id_value := p_command ->> 'policyId';
    policy_version_value := p_command ->> 'policyVersion';

    if callsign_value is null
       or callsign_value = ''
       or callsign_value <> btrim(callsign_value)
       or policy_id_value is null
       or policy_id_value = ''
       or policy_version_value is null
       or policy_version_value = '' then
        raise exception 'Operator provisioning command is incomplete.'
            using errcode = '22023';
    end if;

    select namespace.nspname
    into pgcrypto_schema
    from pg_catalog.pg_extension extension
    join pg_catalog.pg_namespace namespace
        on namespace.oid = extension.extnamespace
    where extension.extname = 'pgcrypto';

    if pgcrypto_schema is null then
        raise exception 'Required pgcrypto extension is unavailable.'
            using errcode = '55000';
    end if;

    execute format(
        'select %I.digest($1, $2)',
        pgcrypto_schema
    )
    into request_digest_bytes
    using convert_to(p_command::text, 'UTF8'), 'sha256';

    if request_digest_bytes is null then
        raise exception 'Operator provisioning digest is unavailable.'
            using errcode = '55000';
    end if;

    request_digest_value :=
        'sha256:' || encode(request_digest_bytes, 'hex');

    perform 1
    from auth.users account
    where account.id = p_account_id
    for update;

    if not found then
        raise exception 'Authenticated Account is unavailable.'
            using errcode = '23503';
    end if;

    select receipt.*
    into existing_receipt
    from public.operator_provisioning_receipts receipt
    where receipt.account_id = p_account_id;

    if found then
        if existing_receipt.command_id <> command_id_value
           or existing_receipt.request_digest <> request_digest_value
           or existing_receipt.policy_id <> policy_id_value
           or existing_receipt.policy_version <> policy_version_value then
            raise exception 'Operator provisioning identity is immutable.'
                using errcode = '23505';
        end if;

        select operator_record.*
        into provisioned_operator
        from public.operators operator_record
        where operator_record.id = existing_receipt.operator_id;

        if not found then
            raise exception 'Provisioned Operator record is inconsistent.'
                using errcode = '55000';
        end if;

        return existing_receipt.result_contract;
    end if;

    select binding.*
    into existing_binding
    from public.operator_account_bindings binding
    where binding.account_id = p_account_id;

    if found then
        raise exception 'Operator provisioning encountered competing state.'
            using errcode = '55000';
    end if;

    update public.operator_designation_allocator
    set next_value = next_value + 1
    where singleton
    returning next_value - 1 into designation_number;

    if designation_number is null then
        raise exception 'Operator designation allocator is unavailable.'
            using errcode = '55000';
    end if;

    designation_value :=
        'OR-' || lpad(designation_number::text, 6, '0');

    insert into public.operators (
        callsign,
        designation,
        primary_game,
        combat_rating
    ) values (
        callsign_value,
        designation_value,
        null,
        null
    )
    returning * into provisioned_operator;

    insert into public.operator_account_bindings (
        account_id,
        operator_id
    ) values (
        p_account_id,
        provisioned_operator.id
    );

    result_value := jsonb_build_object(
        'outcome', 'created',
        'operator', to_jsonb(provisioned_operator)
    );

    insert into public.operator_provisioning_receipts (
        account_id,
        command_id,
        request_digest,
        operator_id,
        policy_id,
        policy_version,
        result_contract
    ) values (
        p_account_id,
        command_id_value,
        request_digest_value,
        provisioned_operator.id,
        policy_id_value,
        policy_version_value,
        result_value
    );

    return result_value;
end;
$$;

alter table public.operator_designation_allocator enable row level security;
alter table public.operator_provisioning_receipts enable row level security;

revoke all privileges on table public.operator_designation_allocator
    from public, anon, authenticated;
revoke all privileges on table public.operator_provisioning_receipts
    from public, anon, authenticated;
grant all privileges on table public.operator_designation_allocator
    to service_role;
grant all privileges on table public.operator_provisioning_receipts
    to service_role;

revoke all privileges on function public.provision_operator_for_account(
    uuid,
    jsonb
) from public, anon, authenticated;
grant execute on function public.provision_operator_for_account(
    uuid,
    jsonb
) to service_role;

-- The previous browser-owned commissioning path is no longer authoritative.
revoke execute on function public.generate_operator_designation()
    from authenticated;
revoke usage on sequence public.operator_designation_sequence
    from authenticated;
revoke update on table public.operators
    from authenticated;

commit;
