begin;

-- Reconcile columns that exist in the audited deployment but were absent from
-- the historical tracked baseline. Existing values and Operator IDs remain
-- unchanged; fresh databases receive the deployed defaults.
alter table public.operators
    add column if not exists xp integer not null default 0,
    add column if not exists level integer not null default 1,
    add column if not exists total_sessions integer not null default 0,
    add column if not exists designation text;

create sequence if not exists public.operator_designation_sequence
    as bigint
    start with 1
    increment by 1
    minvalue 1
    no maxvalue
    cache 1;

create or replace function public.generate_operator_designation()
returns text
language plpgsql
security invoker
set search_path = pg_catalog
as $$
declare
    next_number bigint;
begin
    next_number := nextval(
        'public.operator_designation_sequence'::regclass
    );

    return 'OR-' || lpad(next_number::text, 6, '0');
end;
$$;

-- Supabase Auth owns Account identity. This relation owns only the durable,
-- one-to-one Account-to-Operator relationship and never replaces operators.id.
create table public.operator_account_bindings (
    account_id uuid primary key
        references auth.users(id) on delete cascade,
    operator_id uuid not null unique
        references public.operators(id) on delete cascade,
    created_at timestamptz not null default now()
);

create index if not exists oracle_sessions_operator_id_idx
    on public.oracle_sessions(operator_id);

-- No binding is inferred or backfilled. The audited deployment has no Auth
-- users, and its existing Operator must be bound explicitly once ownership is
-- established outside this migration.

alter table public.operator_account_bindings enable row level security;
alter table public.operators enable row level security;
alter table public.oracle_sessions enable row level security;
alter table public.operator_achievements enable row level security;

drop policy if exists operator_account_bindings_select_own
    on public.operator_account_bindings;
create policy operator_account_bindings_select_own
    on public.operator_account_bindings
    for select
    to authenticated
    using (account_id = (select auth.uid()));

drop policy if exists operators_select_own on public.operators;
create policy operators_select_own
    on public.operators
    for select
    to authenticated
    using (
        exists (
            select 1
            from public.operator_account_bindings binding
            where binding.account_id = (select auth.uid())
              and binding.operator_id = operators.id
        )
    );

drop policy if exists operators_update_own on public.operators;
create policy operators_update_own
    on public.operators
    for update
    to authenticated
    using (
        exists (
            select 1
            from public.operator_account_bindings binding
            where binding.account_id = (select auth.uid())
              and binding.operator_id = operators.id
        )
    )
    with check (
        exists (
            select 1
            from public.operator_account_bindings binding
            where binding.account_id = (select auth.uid())
              and binding.operator_id = operators.id
        )
    );

drop policy if exists oracle_sessions_select_own
    on public.oracle_sessions;
create policy oracle_sessions_select_own
    on public.oracle_sessions
    for select
    to authenticated
    using (
        exists (
            select 1
            from public.operator_account_bindings binding
            where binding.account_id = (select auth.uid())
              and binding.operator_id = oracle_sessions.operator_id
        )
    );

drop policy if exists oracle_sessions_insert_own
    on public.oracle_sessions;
create policy oracle_sessions_insert_own
    on public.oracle_sessions
    for insert
    to authenticated
    with check (
        exists (
            select 1
            from public.operator_account_bindings binding
            where binding.account_id = (select auth.uid())
              and binding.operator_id = oracle_sessions.operator_id
        )
    );

drop policy if exists operator_achievements_select_own
    on public.operator_achievements;
create policy operator_achievements_select_own
    on public.operator_achievements
    for select
    to authenticated
    using (
        exists (
            select 1
            from public.operator_account_bindings binding
            where binding.account_id = (select auth.uid())
              and binding.operator_id = operator_achievements.operator_id
        )
    );

drop policy if exists operator_achievements_insert_own
    on public.operator_achievements;
create policy operator_achievements_insert_own
    on public.operator_achievements
    for insert
    to authenticated
    with check (
        exists (
            select 1
            from public.operator_account_bindings binding
            where binding.account_id = (select auth.uid())
              and binding.operator_id = operator_achievements.operator_id
        )
    );

revoke all privileges on table public.operator_account_bindings
    from public, anon, authenticated;
revoke all privileges on table public.operators
    from public, anon, authenticated;
revoke all privileges on table public.oracle_sessions
    from public, anon, authenticated;
revoke all privileges on table public.operator_achievements
    from public, anon, authenticated;

grant select on table public.operator_account_bindings to authenticated;
grant all privileges on table public.operator_account_bindings to service_role;
grant select, update on table public.operators to authenticated;
grant select, insert on table public.oracle_sessions to authenticated;
grant select, insert on table public.operator_achievements to authenticated;

revoke all privileges on function public.generate_operator_designation()
    from public, anon;
grant execute on function public.generate_operator_designation()
    to authenticated, service_role;

revoke all privileges on sequence public.operator_designation_sequence
    from public, anon;
grant usage on sequence public.operator_designation_sequence
    to authenticated, service_role;

commit;
