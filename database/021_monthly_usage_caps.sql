begin;

-- Replaces migration 020's per-calendar-day usage cap with a per-Operator
-- billing-cycle usage cap, per Lee's decisions:
--  - 2026-09-04 (screenshots of the original pricing conversation): the
--    real locked-in numbers are 45 Full Match Analysis reports and 45
--    Content Clips per billing cycle -- NOT 2/day each (020's numbers were
--    a placeholder that never matched what was actually decided) -- and
--    the cycle should reset on each customer's own subscription
--    anniversary, not a shared calendar month.
--  - 2026-09-05: Loadout Intelligence stays deliberately uncapped
--    (competitors give it away free) -- it never had a row in 020's table
--    and doesn't get one here either.
--
-- There's no real customer usage recorded against 020's table yet (Oracle
-- hasn't launched), so this migration drops and replaces it outright
-- rather than trying to migrate day-shaped rows into a cycle-shaped table.
--
-- PROVISIONAL: "billing cycle" is anchored on operators.created_at
-- (account creation date) because there's no real subscription data yet
-- (Stripe integration still in progress) -- see
-- lib/oracle/usage-caps/usage-cap.ts for the cycle-start calculation this
-- table's rows are keyed against. Once real subscription start dates
-- exist, that calculation should switch to those, and this table's shape
-- (one row per Operator/feature/cycle-start) still works unchanged.
--
-- This remains a soft usage guardrail, not a security boundary -- see
-- 020's original notes, which still apply: all reads/writes go through
-- the trusted (service_role) client only, called from server code that
-- has already resolved operator_id from the signed-in Account.

drop function if exists public.increment_oracle_daily_usage(uuid, text, date, integer);
drop table if exists public.oracle_daily_usage;

create table public.oracle_monthly_usage (
    id uuid primary key default gen_random_uuid(),
    operator_id uuid not null references public.operators(id) on delete cascade,

    feature text not null check (feature in (
        'full-match-analysis', 'content-clips'
    )),
    -- The UTC calendar date this Operator's current billing cycle started
    -- on (see billingCycleStart() in usage-cap.ts) -- NOT the date usage
    -- happened. All usage within one cycle shares this same value, which
    -- is what lets one row hold a running total for the whole cycle.
    cycle_start date not null,
    units_used integer not null default 0,

    updated_at timestamptz not null default now(),

    unique (operator_id, feature, cycle_start)
);

create index oracle_monthly_usage_operator_cycle_idx
    on public.oracle_monthly_usage(operator_id, cycle_start desc);

alter table public.oracle_monthly_usage enable row level security;

drop policy if exists oracle_monthly_usage_select_own
    on public.oracle_monthly_usage;
create policy oracle_monthly_usage_select_own
    on public.oracle_monthly_usage
    for select
    to authenticated
    using (
        exists (
            select 1
            from public.operator_account_bindings binding
            where binding.account_id = (select auth.uid())
              and binding.operator_id = oracle_monthly_usage.operator_id
        )
    );

revoke all privileges on table public.oracle_monthly_usage
    from anon, authenticated;
grant select on table public.oracle_monthly_usage
    to authenticated;

-- Atomic "add p_units to this cycle's usage" upsert -- avoids a
-- read-then-write race between two near-simultaneous requests for the
-- same Operator (unlikely for one person on one PC, but cheap to make
-- safe). Returns the new running total for that Operator/feature/cycle.
-- SECURITY DEFINER so it can write regardless of RLS; only ever called
-- with the trusted (service_role) client from server code, never exposed
-- to anon/authenticated directly.
create or replace function public.increment_oracle_monthly_usage(
    p_operator_id uuid,
    p_feature text,
    p_cycle_start date,
    p_units integer
)
returns integer
language plpgsql
security definer
set search_path = public
as $$
declare
    v_new_total integer;
begin
    insert into public.oracle_monthly_usage (operator_id, feature, cycle_start, units_used)
    values (p_operator_id, p_feature, p_cycle_start, greatest(p_units, 0))
    on conflict (operator_id, feature, cycle_start)
    do update set
        units_used = public.oracle_monthly_usage.units_used + greatest(p_units, 0),
        updated_at = now()
    returning units_used into v_new_total;

    return v_new_total;
end;
$$;

revoke all on function public.increment_oracle_monthly_usage(uuid, text, date, integer)
    from public, anon, authenticated;

commit;
