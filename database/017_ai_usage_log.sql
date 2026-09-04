begin;

-- Internal record of real Gemini API usage/cost for every call Oracle makes,
-- across every feature (Full Match Analysis, Loadout Intelligence, and
-- whatever calls Gemini next). This exists purely so the business can see
-- actual spend per feature and price subscriptions against real numbers
-- instead of estimates -- it is never shown to customers anywhere in the
-- app. Deliberately has NO select policy for anon/authenticated below: the
-- only way to read this table is the Supabase SQL Editor (or the service
-- role), by design.
--
-- estimated_cost_usd is token cost only (input/output, at the per-model
-- rate recorded alongside it) -- it does NOT include Google Search
-- grounding cost. Grounding has a shared monthly free allowance (5,000
-- requests/account as of writing) rather than a flat per-call price, so a
-- per-row grounding cost would be fiction; grounding_requests is logged
-- raw here so the actual grounding spend can be worked out in aggregate
-- (sum(grounding_requests) for the month, minus the free allowance, times
-- the per-1000-requests rate) when needed.

create table public.oracle_ai_usage_log (
    id uuid primary key default gen_random_uuid(),
    operator_id uuid references public.operators(id) on delete set null,

    feature text not null check (feature in (
        'full-match-analysis', 'loadout-intelligence', 'oracle-chat'
    )),
    model text not null,

    input_tokens integer not null default 0,
    output_tokens integer not null default 0,
    total_tokens integer not null default 0,
    grounding_requests integer not null default 0,

    -- Token cost only -- see note above on why grounding cost isn't here.
    estimated_cost_usd numeric(10, 6) not null default 0,

    created_at timestamptz not null default now()
);

create index oracle_ai_usage_log_feature_created_idx
    on public.oracle_ai_usage_log(feature, created_at desc);

alter table public.oracle_ai_usage_log enable row level security;

-- Insert-only from the app itself (an Operator's own authenticated request
-- generating a report/recommendation logs its own usage). No select policy
-- at all -- see note above.
drop policy if exists oracle_ai_usage_log_insert_own
    on public.oracle_ai_usage_log;
create policy oracle_ai_usage_log_insert_own
    on public.oracle_ai_usage_log
    for insert
    to authenticated
    with check (
        operator_id is null or exists (
            select 1
            from public.operator_account_bindings binding
            where binding.account_id = (select auth.uid())
              and binding.operator_id = oracle_ai_usage_log.operator_id
        )
    );

revoke all privileges on table public.oracle_ai_usage_log
    from anon, authenticated;
grant insert on table public.oracle_ai_usage_log
    to authenticated;

commit;
