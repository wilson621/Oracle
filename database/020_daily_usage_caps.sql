begin;

-- Daily usage caps for Oracle's Gemini-backed generation features, so a
-- customer's usage stays within what their subscription was actually
-- priced for instead of being open-ended (see the pricing model built
-- 2026-09-04 -- Lee's decision: 2 Full Match Analysis reports/day and 2
-- Content Clips generated/day per Operator, resetting daily).
--
-- This is a soft usage guardrail, not a security boundary. All reads and
-- writes go through the trusted (service_role) client only (see
-- lib/oracle/usage-caps/daily-usage-cap.ts), called from server code that
-- has already resolved operator_id from the signed-in Account -- never
-- directly from client code. The select policy below is a harmless
-- defence-in-depth backstop (an Operator can read their own row, nothing
-- more), not the enforcement mechanism.

create table public.oracle_daily_usage (
    id uuid primary key default gen_random_uuid(),
    operator_id uuid not null references public.operators(id) on delete cascade,

    feature text not null check (feature in (
        'full-match-analysis', 'content-clips'
    )),
    -- UTC calendar date the usage counts against -- caps reset at
    -- midnight UTC, not per-Operator local time (keeping this simple and
    -- predictable rather than needing a timezone per Operator).
    usage_date date not null,
    units_used integer not null default 0,

    updated_at timestamptz not null default now(),

    unique (operator_id, feature, usage_date)
);

create index oracle_daily_usage_operator_date_idx
    on public.oracle_daily_usage(operator_id, usage_date desc);

alter table public.oracle_daily_usage enable row level security;

drop policy if exists oracle_daily_usage_select_own
    on public.oracle_daily_usage;
create policy oracle_daily_usage_select_own
    on public.oracle_daily_usage
    for select
    to authenticated
    using (
        exists (
            select 1
            from public.operator_account_bindings binding
            where binding.account_id = (select auth.uid())
              and binding.operator_id = oracle_daily_usage.operator_id
        )
    );

revoke all privileges on table public.oracle_daily_usage
    from anon, authenticated;
grant select on table public.oracle_daily_usage
    to authenticated;

-- Atomic "add p_units to today's usage" upsert -- avoids a read-then-write
-- race between two near-simultaneous requests for the same Operator
-- (unlikely for one person on one PC, but cheap to make safe). Returns the
-- new running total for that Operator/feature/day. SECURITY DEFINER so it
-- can write regardless of RLS; only ever called with the trusted
-- (service_role) client from server code, never exposed to anon/
-- authenticated directly.
create or replace function public.increment_oracle_daily_usage(
    p_operator_id uuid,
    p_feature text,
    p_usage_date date,
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
    insert into public.oracle_daily_usage (operator_id, feature, usage_date, units_used)
    values (p_operator_id, p_feature, p_usage_date, greatest(p_units, 0))
    on conflict (operator_id, feature, usage_date)
    do update set
        units_used = public.oracle_daily_usage.units_used + greatest(p_units, 0),
        updated_at = now()
    returning units_used into v_new_total;

    return v_new_total;
end;
$$;

revoke all on function public.increment_oracle_daily_usage(uuid, text, date, integer)
    from public, anon, authenticated;

commit;
