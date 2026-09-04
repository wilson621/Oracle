begin;

-- "Ask Oracle about this report": a lightweight text chat thread attached
-- to one specific oracle_match_coaching_reports row, so an Operator can
-- follow up on a report ("why did I die so much at 09:52?", "what should I
-- focus on next game?") instead of only reading it once. Deliberately its
-- own table rather than reusing the Grounded Conversation machinery in
-- lib/oracle/conversation/ -- that system is a generic multi-source
-- evidence/intent framework built for sources (missions, planner,
-- progression, operator-understanding) that don't have real data behind
-- them yet, and its keyword-based intent classifier is too brittle for
-- free-form follow-up questions about one specific report. This is
-- narrower and actually works: every message is scoped to one report,
-- whose full content is passed to Gemini directly as context.

create table public.oracle_report_chat_messages (
    id uuid primary key default gen_random_uuid(),
    report_id uuid not null
        references public.oracle_match_coaching_reports(id) on delete cascade,
    operator_id uuid not null
        references public.operators(id) on delete cascade,

    role text not null check (role in ('operator', 'oracle')),
    content text not null,

    created_at timestamptz not null default now()
);

create index oracle_report_chat_messages_report_id_idx
    on public.oracle_report_chat_messages(report_id, created_at);

alter table public.oracle_report_chat_messages enable row level security;

drop policy if exists oracle_report_chat_messages_select_own
    on public.oracle_report_chat_messages;
create policy oracle_report_chat_messages_select_own
    on public.oracle_report_chat_messages
    for select
    to authenticated
    using (
        exists (
            select 1
            from public.operator_account_bindings binding
            where binding.account_id = (select auth.uid())
              and binding.operator_id = oracle_report_chat_messages.operator_id
        )
    );

drop policy if exists oracle_report_chat_messages_insert_own
    on public.oracle_report_chat_messages;
create policy oracle_report_chat_messages_insert_own
    on public.oracle_report_chat_messages
    for insert
    to authenticated
    with check (
        exists (
            select 1
            from public.operator_account_bindings binding
            where binding.account_id = (select auth.uid())
              and binding.operator_id = oracle_report_chat_messages.operator_id
        )
    );

revoke all privileges on table public.oracle_report_chat_messages
    from anon, authenticated;
grant select, insert on table public.oracle_report_chat_messages
    to authenticated;

commit;
