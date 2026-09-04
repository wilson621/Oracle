begin;

-- Oracle Loadout Intelligence: personalised weapon/attachment recommendations,
-- built from (a) whatever the Operator asks for in their own words (e.g.
-- "no recoil build", "movement build") and (b) their accumulated playstyle
-- profile from past Full Match Analysis reports, when they have any. Current
-- weapon/attachment meta is pulled live via Gemini's Google Search grounding
-- at generation time rather than baked into a prompt or hardcoded table --
-- see lib/oracle/loadout/oracle-loadout-recommendation-service.ts. Follows
-- the same deliberately-independent ownership pattern as migration 015
-- (oracle_match_coaching_reports): only depends on operator_account_bindings
-- from migration 008, nothing from the unfinished Authoritative Session
-- Lifecycle machinery (013+).
--
-- This migration also extends oracle_match_coaching_reports with structured
-- playstyle signals (engagement range, aggression/movement style, weapons
-- observed, notable tendencies) captured going forward as part of each Full
-- Match Analysis report -- see oracle-match-video-coaching-service.ts. These
-- columns are nullable and default null/empty specifically so existing rows
-- (recorded before this migration) remain valid without a backfill: the raw
-- video they were generated from is not retained, so there is nothing to
-- backfill them from.

alter table public.oracle_match_coaching_reports
    add column if not exists engagement_range text
        check (engagement_range is null or engagement_range in (
            'close', 'mid', 'long', 'mixed'
        )),
    add column if not exists aggression_style text
        check (aggression_style is null or aggression_style in (
            'aggressive', 'balanced', 'passive'
        )),
    add column if not exists movement_style text
        check (movement_style is null or movement_style in (
            'highly-mobile', 'moderate', 'static'
        )),
    add column if not exists weapons_observed jsonb not null default '[]'::jsonb,
    add column if not exists notable_tendencies jsonb not null default '[]'::jsonb;

create table public.oracle_loadout_recommendations (
    id uuid primary key default gen_random_uuid(),
    operator_id uuid not null
        references public.operators(id) on delete cascade,

    game text not null default 'Call of Duty',
    requested_goal text not null,

    generated_at timestamptz not null default now(),

    status text not null default 'complete'
        check (status in ('complete', 'failed')),

    model text,

    -- 'personalized' when a playstyle profile from at least one prior Full
    -- Match Analysis report was available and used; 'generic' when the
    -- Operator had no match history yet, so the recommendation is based
    -- only on their stated goal and current meta. Shown honestly in the UI
    -- rather than presenting a generic build as if it were tailored to them.
    personalization_level text
        check (personalization_level is null or personalization_level in (
            'personalized', 'generic'
        )),
    matches_considered integer not null default 0,

    loadout jsonb not null default '{}'::jsonb,
    summary text,

    -- Citations from Gemini's Google Search grounding, e.g.
    -- [{"title": "...", "url": "..."}] -- kept so a recommendation's current-
    -- meta claims can be traced back to where they came from.
    sources jsonb not null default '[]'::jsonb,

    raw_error text,

    created_at timestamptz not null default now()
);

create index oracle_loadout_recommendations_operator_id_idx
    on public.oracle_loadout_recommendations(operator_id, generated_at desc);

alter table public.oracle_loadout_recommendations enable row level security;

drop policy if exists oracle_loadout_recommendations_select_own
    on public.oracle_loadout_recommendations;
create policy oracle_loadout_recommendations_select_own
    on public.oracle_loadout_recommendations
    for select
    to authenticated
    using (
        exists (
            select 1
            from public.operator_account_bindings binding
            where binding.account_id = (select auth.uid())
              and binding.operator_id = oracle_loadout_recommendations.operator_id
        )
    );

drop policy if exists oracle_loadout_recommendations_insert_own
    on public.oracle_loadout_recommendations;
create policy oracle_loadout_recommendations_insert_own
    on public.oracle_loadout_recommendations
    for insert
    to authenticated
    with check (
        exists (
            select 1
            from public.operator_account_bindings binding
            where binding.account_id = (select auth.uid())
              and binding.operator_id = oracle_loadout_recommendations.operator_id
        )
    );

revoke all privileges on table public.oracle_loadout_recommendations
    from anon, authenticated;
grant select, insert on table public.oracle_loadout_recommendations
    to authenticated;

commit;
