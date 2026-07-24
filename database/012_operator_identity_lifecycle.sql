begin;

alter table public.operators
    add column display_name text,
    add column callsign_change_tokens smallint not null default 3
        check (callsign_change_tokens between 0 and 3),
    add column callsign_token_accrual_at timestamptz;

alter table public.operators
    add constraint operators_callsign_initial_policy_check
    check (
        callsign = btrim(callsign)
        and char_length(callsign) between 3 and 32
        and callsign ~ '^[A-Za-z0-9][A-Za-z0-9 _-]{1,30}[A-Za-z0-9]$'
    );

create unique index operators_callsign_case_insensitive_unique_idx
    on public.operators (lower(callsign));

create table public.operator_reserved_callsigns (
    callsign_key text primary key
        check (callsign_key = lower(callsign_key)),
    display_value text not null,
    reason text not null,
    permanently_reserved boolean not null default true,
    created_at timestamptz not null default now()
);

insert into public.operator_reserved_callsigns (
    callsign_key,
    display_value,
    reason
) values
    ('oracle', 'Oracle', 'Oracle system identity'),
    ('admin', 'Admin', 'Administrative identity'),
    ('administrator', 'Administrator', 'Administrative identity'),
    ('system', 'System', 'Oracle system identity'),
    ('support', 'Support', 'Support identity'),
    ('moderator', 'Moderator', 'Moderation identity'),
    ('developer', 'Developer', 'Development identity'),
    ('founder', 'Founder', 'Founder identity');

create table public.operator_prohibited_callsign_terms (
    term text primary key
        check (
            term = lower(term)
            and term ~ '^[a-z0-9]+$'
        ),
    reason text not null default 'profanity',
    created_at timestamptz not null default now()
);

insert into public.operator_prohibited_callsign_terms (term) values
    ('cunt'),
    ('faggot'),
    ('fuck'),
    ('nigger'),
    ('shit');

create table public.operator_callsign_quarantine (
    id uuid primary key default gen_random_uuid(),
    callsign text not null,
    callsign_key text not null,
    historical_operator_id uuid not null,
    reason text not null
        check (reason in ('changed', 'account-deleted')),
    quarantined_at timestamptz not null default now(),
    release_at timestamptz not null,
    created_at timestamptz not null default now(),
    check (callsign_key = lower(callsign)),
    check (release_at > quarantined_at)
);

create index operator_callsign_quarantine_lookup_idx
    on public.operator_callsign_quarantine (callsign_key, release_at);

create index operator_callsign_quarantine_history_idx
    on public.operator_callsign_quarantine (
        historical_operator_id,
        quarantined_at desc
    );

create or replace function public.assert_operator_callsign_available(
    p_callsign text,
    p_excluding_operator_id uuid default null
)
returns void
language plpgsql
security definer
set search_path = pg_catalog
as $$
declare
    normalized_value text;
    callsign_key_value text;
begin
    normalized_value := btrim(p_callsign);
    callsign_key_value := lower(normalized_value);

    if normalized_value is null
       or char_length(normalized_value) not between 3 and 32
       or normalized_value !~
            '^[A-Za-z0-9][A-Za-z0-9 _-]{1,30}[A-Za-z0-9]$' then
        raise exception 'Callsign does not satisfy the initial identity policy.'
            using errcode = '22023';
    end if;

    if exists (
        select 1
        from public.operator_reserved_callsigns reserved
        where reserved.callsign_key = callsign_key_value
    ) then
        raise exception 'Callsign is reserved.'
            using errcode = '23505';
    end if;

    if exists (
        select 1
        from regexp_split_to_table(
            callsign_key_value,
            '[ _-]+'
        ) component
        join public.operator_prohibited_callsign_terms prohibited
          on prohibited.term = component
    ) then
        raise exception 'Callsign is prohibited.'
            using errcode = '22023';
    end if;

    if exists (
        select 1
        from public.operators operator_record
        where lower(operator_record.callsign) = callsign_key_value
          and (
              p_excluding_operator_id is null
              or operator_record.id <> p_excluding_operator_id
          )
    ) then
        raise exception 'Callsign is already owned.'
            using errcode = '23505';
    end if;

    if exists (
        select 1
        from public.operator_callsign_quarantine quarantine
        where quarantine.callsign_key = callsign_key_value
          and quarantine.release_at > now()
    ) then
        raise exception 'Callsign is quarantined.'
            using errcode = '23505';
    end if;
end;
$$;

create or replace function public.enforce_operator_callsign_policy()
returns trigger
language plpgsql
security definer
set search_path = pg_catalog
as $$
begin
    if tg_op = 'UPDATE'
       and old.callsign is distinct from new.callsign
       and current_setting(
            'oracle.callsign_change_authorized',
            true
       ) is distinct from 'true' then
        raise exception 'Callsign changes require the trusted lifecycle operation.'
            using errcode = '42501';
    end if;

    perform public.assert_operator_callsign_available(
        new.callsign,
        case when tg_op = 'UPDATE' then new.id else null end
    );
    return new;
end;
$$;

create trigger operators_callsign_policy_trigger
before insert or update of callsign on public.operators
for each row execute function public.enforce_operator_callsign_policy();

create or replace function public.change_operator_callsign(
    p_account_id uuid,
    p_callsign text
)
returns jsonb
language plpgsql
security definer
set search_path = pg_catalog
as $$
declare
    operator_record public.operators%rowtype;
    accrual_at_value timestamptz;
    token_balance smallint;
begin
    if coalesce(auth.role(), '') <> 'service_role' then
        raise exception 'Trusted Operator identity authority is required.'
            using errcode = '42501';
    end if;

    select candidate.*
    into operator_record
    from public.operators candidate
    join public.operator_account_bindings binding
      on binding.operator_id = candidate.id
    where binding.account_id = p_account_id
    for update of candidate;

    if not found then
        raise exception 'Operator ownership is unavailable.'
            using errcode = '23503';
    end if;

    if operator_record.callsign = p_callsign then
        return jsonb_build_object(
            'operatorId', operator_record.id,
            'callsign', operator_record.callsign,
            'remainingTokens', operator_record.callsign_change_tokens,
            'outcome', 'unchanged'
        );
    end if;

    token_balance := operator_record.callsign_change_tokens;
    accrual_at_value := operator_record.callsign_token_accrual_at;
    while token_balance < 3
      and accrual_at_value is not null
      and accrual_at_value + interval '6 months' <= now()
    loop
        token_balance := token_balance + 1;
        accrual_at_value := accrual_at_value + interval '6 months';
    end loop;

    if token_balance = 3 then
        accrual_at_value := null;
    end if;
    if token_balance < 1 then
        raise exception 'No Callsign Change Tokens are available.'
            using errcode = '22023';
    end if;

    perform public.assert_operator_callsign_available(
        p_callsign,
        operator_record.id
    );

    insert into public.operator_callsign_quarantine (
        callsign,
        callsign_key,
        historical_operator_id,
        reason,
        release_at
    ) values (
        operator_record.callsign,
        lower(operator_record.callsign),
        operator_record.id,
        'changed',
        now() + interval '12 months'
    );

    if accrual_at_value is null then
        accrual_at_value := now();
    end if;

    perform set_config(
        'oracle.callsign_change_authorized',
        'true',
        true
    );

    update public.operators
    set callsign = p_callsign,
        callsign_change_tokens = token_balance - 1,
        callsign_token_accrual_at = accrual_at_value
    where id = operator_record.id
    returning * into operator_record;

    return jsonb_build_object(
        'operatorId', operator_record.id,
        'callsign', operator_record.callsign,
        'remainingTokens', operator_record.callsign_change_tokens,
        'outcome', 'changed'
    );
end;
$$;

create or replace function public.generate_available_operator_callsign()
returns text
language plpgsql
security definer
set search_path = pg_catalog
as $$
declare
    candidate text;
begin
    if coalesce(auth.role(), '') <> 'service_role' then
        raise exception 'Trusted Operator identity authority is required.'
            using errcode = '42501';
    end if;

    loop
        candidate := 'Vanguard-' || upper(
            substring(encode(public.gen_random_bytes(4), 'hex') from 1 for 6)
        );
        begin
            perform public.assert_operator_callsign_available(candidate);
            return candidate;
        exception
            when unique_violation then
                null;
        end;
    end loop;
end;
$$;

create or replace function public.update_operator_display_name(
    p_account_id uuid,
    p_display_name text
)
returns jsonb
language plpgsql
security definer
set search_path = pg_catalog
as $$
declare
    operator_id_value uuid;
    display_name_value text;
begin
    if coalesce(auth.role(), '') <> 'service_role' then
        raise exception 'Trusted Operator identity authority is required.'
            using errcode = '42501';
    end if;

    display_name_value := nullif(btrim(p_display_name), '');
    if display_name_value is not null
       and char_length(display_name_value) > 80 then
        raise exception 'Display Name exceeds the approved length.'
            using errcode = '22023';
    end if;

    update public.operators operator_record
    set display_name = display_name_value
    from public.operator_account_bindings binding
    where binding.account_id = p_account_id
      and binding.operator_id = operator_record.id
    returning operator_record.id into operator_id_value;

    if operator_id_value is null then
        raise exception 'Operator ownership is unavailable.'
            using errcode = '23503';
    end if;

    return jsonb_build_object(
        'operatorId', operator_id_value,
        'displayName', display_name_value
    );
end;
$$;

create or replace function public.quarantine_deleted_operator_callsign()
returns trigger
language plpgsql
security definer
set search_path = pg_catalog
as $$
begin
    insert into public.operator_callsign_quarantine (
        callsign,
        callsign_key,
        historical_operator_id,
        reason,
        release_at
    )
    select
        old.callsign,
        lower(old.callsign),
        old.id,
        'account-deleted',
        now() + interval '12 months'
    where not exists (
        select 1
        from public.operator_callsign_quarantine quarantine
        where quarantine.historical_operator_id = old.id
          and quarantine.callsign_key = lower(old.callsign)
          and quarantine.release_at > now()
    );
    return old;
end;
$$;

create trigger operators_deleted_callsign_quarantine_trigger
before delete on public.operators
for each row execute function public.quarantine_deleted_operator_callsign();

create or replace function public.quarantine_unbound_operator_callsign()
returns trigger
language plpgsql
security definer
set search_path = pg_catalog
as $$
declare
    callsign_value text;
begin
    select operator_record.callsign
    into callsign_value
    from public.operators operator_record
    where operator_record.id = old.operator_id;

    if callsign_value is not null then
        insert into public.operator_callsign_quarantine (
            callsign,
            callsign_key,
            historical_operator_id,
            reason,
            release_at
        )
        select
            callsign_value,
            lower(callsign_value),
            old.operator_id,
            'account-deleted',
            now() + interval '12 months'
        where not exists (
            select 1
            from public.operator_callsign_quarantine quarantine
            where quarantine.historical_operator_id = old.operator_id
              and quarantine.callsign_key = lower(callsign_value)
              and quarantine.release_at > now()
        );
    end if;

    return old;
end;
$$;

create trigger operator_account_binding_deleted_callsign_quarantine_trigger
before delete on public.operator_account_bindings
for each row execute function public.quarantine_unbound_operator_callsign();

alter table public.operator_reserved_callsigns enable row level security;
alter table public.operator_prohibited_callsign_terms enable row level security;
alter table public.operator_callsign_quarantine enable row level security;

revoke all privileges on table public.operator_reserved_callsigns
    from public, anon, authenticated;
revoke all privileges on table public.operator_prohibited_callsign_terms
    from public, anon, authenticated;
revoke all privileges on table public.operator_callsign_quarantine
    from public, anon, authenticated;
grant all privileges on table public.operator_reserved_callsigns
    to service_role;
grant all privileges on table public.operator_prohibited_callsign_terms
    to service_role;
grant all privileges on table public.operator_callsign_quarantine
    to service_role;

revoke all privileges on function public.assert_operator_callsign_available(
    text,
    uuid
) from public, anon, authenticated;
revoke all privileges on function public.change_operator_callsign(
    uuid,
    text
) from public, anon, authenticated;
revoke all privileges on function public.generate_available_operator_callsign()
    from public, anon, authenticated;
revoke all privileges on function public.update_operator_display_name(
    uuid,
    text
) from public, anon, authenticated;
grant execute on function public.assert_operator_callsign_available(
    text,
    uuid
) to service_role;
grant execute on function public.change_operator_callsign(
    uuid,
    text
) to service_role;
grant execute on function public.generate_available_operator_callsign()
    to service_role;
grant execute on function public.update_operator_display_name(
    uuid,
    text
) to service_role;

commit;
