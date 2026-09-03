begin;

-- Oracle Watch & Coach: AI-generated post-match coaching reports built from
-- Companion screenshots captured locally on the Operator's PC during a
-- manually started/stopped watch session.
--
-- Deliberately independent of the older oracle_sessions relation and the
-- Authoritative Session Lifecycle machinery introduced from migration 013
-- onward (evidence admissions, Session Report engines, Understanding
-- snapshots): that system was never finished end-to-end, and this feature
-- does not need it to be. This table follows only the ownership pattern
-- from migration 008 (operator_account_bindings) so it works regardless of
-- whether 010-014 have been deployed to a given environment.

create table public.oracle_match_coaching_reports (
    id uuid primary key default gen_random_uuid(),
    operator_id uuid not null
        references public.operators(id) on delete cascade,

    game text not null default 'Call of Duty',
    client_session_id uuid not null,

    started_at timestamptz not null,
    ended_at timestamptz not null,
    generated_at timestamptz not null default now(),

    status text not null default 'complete'
        check (status in ('complete', 'degraded', 'failed')),

    model text,
    frame_count integer not null default 0,

    summary text,
    verdict text,

    positioning integer,
    aim integer,
    movement integer,
    decision_making integer,
    game_sense integer,

    deaths jsonb not null default '[]'::jsonb,
    raw_error text,

    created_at timestamptz not null default now()
);

create index oracle_match_coaching_reports_operator_id_idx
    on public.oracle_match_coaching_reports(operator_id, generated_at desc);

create unique index oracle_match_coaching_reports_client_session_id_idx
    on public.oracle_match_coaching_reports(operator_id, client_session_id);

alter table public.oracle_match_coaching_reports enable row level security;

drop policy if exists oracle_match_coaching_reports_select_own
    on public.oracle_match_coaching_reports;
create policy oracle_match_coaching_reports_select_own
    on public.oracle_match_coaching_reports
    for select
    to authenticated
    using (
        exists (
            select 1
            from public.operator_account_bindings binding
            where binding.account_id = (select auth.uid())
              and binding.operator_id = oracle_match_coaching_reports.operator_id
        )
    );

drop policy if exists oracle_match_coaching_reports_insert_own
    on public.oracle_match_coaching_reports;
create policy oracle_match_coaching_reports_insert_own
    on public.oracle_match_coaching_reports
    for insert
    to authenticated
    with check (
        exists (
            select 1
            from public.operator_account_bindings binding
            where binding.account_id = (select auth.uid())
              and binding.operator_id = oracle_match_coaching_reports.operator_id
        )
    );

revoke all privileges on table public.oracle_match_coaching_reports
    from anon, authenticated;
grant select, insert on table public.oracle_match_coaching_reports
    to authenticated;

commit;
