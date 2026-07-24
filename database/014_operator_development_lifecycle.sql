begin;

create table public.oracle_missions (
    operator_id uuid not null references public.operators(id) on delete cascade,
    mission_id text not null,
    report_id text not null,
    coaching_focus_id text not null,
    status text not null,
    version integer not null,
    title text not null,
    objective text not null,
    required_evidence_count integer not null,
    reward_xp integer not null,
    created_at timestamptz not null,
    updated_at timestamptz not null,
    completion_id text,
    completion_session_id uuid,
    completion_evidence_reference_ids text[] not null default '{}',
    mission_contract jsonb not null,
    primary key (operator_id, mission_id),
    unique (operator_id, report_id),
    unique (operator_id, completion_id),
    constraint oracle_missions_status_check check (
        status in (
            'proposed', 'accepted', 'active', 'completed', 'abandoned',
            'superseded', 'deleted'
        )
    ),
    constraint oracle_missions_version_check check (version > 0),
    constraint oracle_missions_evidence_count_check
        check (required_evidence_count > 0),
    constraint oracle_missions_reward_check check (reward_xp >= 0),
    constraint oracle_missions_completion_check check (
        (status <> 'completed') or (
            completion_id is not null
            and completion_session_id is not null
            and cardinality(completion_evidence_reference_ids)
                >= required_evidence_count
        )
    ),
    foreign key (completion_session_id, operator_id)
        references public.oracle_sessions(id, operator_id)
);

create table public.oracle_planner_entries (
    operator_id uuid not null,
    planner_entry_id text not null,
    mission_id text not null,
    priority smallint not null,
    scheduled_for timestamptz not null,
    rationale text not null,
    created_at timestamptz not null,
    planner_contract jsonb not null,
    primary key (operator_id, planner_entry_id),
    unique (operator_id, mission_id),
    foreign key (operator_id, mission_id)
        references public.oracle_missions(operator_id, mission_id)
        on delete cascade,
    constraint oracle_planner_priority_check check (priority between 1 and 3)
);

create table public.operator_progression_transactions (
    operator_id uuid not null,
    transaction_id text not null,
    mission_id text not null,
    completion_id text not null,
    xp integer not null,
    evidence_reference_ids text[] not null,
    recorded_at timestamptz not null,
    transaction_contract jsonb not null,
    primary key (operator_id, transaction_id),
    unique (operator_id, completion_id),
    foreign key (operator_id, mission_id)
        references public.oracle_missions(operator_id, mission_id),
    constraint operator_progression_xp_check check (xp >= 0),
    constraint operator_progression_evidence_check
        check (cardinality(evidence_reference_ids) > 0)
);

create table public.operator_achievement_awards (
    operator_id uuid not null,
    award_id text not null,
    achievement_id text not null,
    progression_transaction_id text not null,
    awarded_at timestamptz not null,
    award_contract jsonb not null,
    primary key (operator_id, award_id),
    unique (operator_id, achievement_id),
    foreign key (operator_id, progression_transaction_id)
        references public.operator_progression_transactions(
            operator_id, transaction_id
        )
);

create table public.oracle_development_correlations (
    operator_id uuid not null,
    correlation_id text not null,
    report_id text not null,
    coaching_focus_id text not null,
    mission_id text not null,
    planner_entry_id text not null,
    completion_session_id uuid,
    progression_transaction_id text,
    reassessment_contract jsonb not null,
    created_at timestamptz not null,
    updated_at timestamptz not null,
    primary key (operator_id, correlation_id),
    unique (operator_id, report_id),
    foreign key (operator_id, mission_id)
        references public.oracle_missions(operator_id, mission_id),
    foreign key (operator_id, planner_entry_id)
        references public.oracle_planner_entries(operator_id, planner_entry_id),
    foreign key (completion_session_id, operator_id)
        references public.oracle_sessions(id, operator_id),
    foreign key (operator_id, progression_transaction_id)
        references public.operator_progression_transactions(
            operator_id, transaction_id
        )
);

create index oracle_missions_operator_status_idx
    on public.oracle_missions(operator_id, status, updated_at desc);
create index oracle_planner_operator_schedule_idx
    on public.oracle_planner_entries(operator_id, scheduled_for, priority);
create index operator_progression_operator_time_idx
    on public.operator_progression_transactions(operator_id, recorded_at desc);

alter table public.oracle_missions enable row level security;
alter table public.oracle_planner_entries enable row level security;
alter table public.operator_progression_transactions enable row level security;
alter table public.operator_achievement_awards enable row level security;
alter table public.oracle_development_correlations enable row level security;

create policy oracle_missions_select_own on public.oracle_missions
    for select to authenticated using (
        exists (
            select 1 from public.operator_account_bindings binding
            where binding.account_id = (select auth.uid())
              and binding.operator_id = oracle_missions.operator_id
        )
    );
create policy oracle_planner_entries_select_own on public.oracle_planner_entries
    for select to authenticated using (
        exists (
            select 1 from public.operator_account_bindings binding
            where binding.account_id = (select auth.uid())
              and binding.operator_id = oracle_planner_entries.operator_id
        )
    );
create policy operator_progression_transactions_select_own
    on public.operator_progression_transactions
    for select to authenticated using (
        exists (
            select 1 from public.operator_account_bindings binding
            where binding.account_id = (select auth.uid())
              and binding.operator_id =
                  operator_progression_transactions.operator_id
        )
    );
create policy operator_achievement_awards_select_own
    on public.operator_achievement_awards
    for select to authenticated using (
        exists (
            select 1 from public.operator_account_bindings binding
            where binding.account_id = (select auth.uid())
              and binding.operator_id = operator_achievement_awards.operator_id
        )
    );
create policy oracle_development_correlations_select_own
    on public.oracle_development_correlations
    for select to authenticated using (
        exists (
            select 1 from public.operator_account_bindings binding
            where binding.account_id = (select auth.uid())
              and binding.operator_id =
                  oracle_development_correlations.operator_id
        )
    );

revoke all on public.oracle_missions from public, anon, authenticated;
revoke all on public.oracle_planner_entries from public, anon, authenticated;
revoke all on public.operator_progression_transactions
    from public, anon, authenticated;
revoke all on public.operator_achievement_awards
    from public, anon, authenticated;
revoke all on public.oracle_development_correlations
    from public, anon, authenticated;

grant select on public.oracle_missions to authenticated;
grant select on public.oracle_planner_entries to authenticated;
grant select on public.operator_progression_transactions to authenticated;
grant select on public.operator_achievement_awards to authenticated;
grant select on public.oracle_development_correlations to authenticated;
grant all on public.oracle_missions to service_role;
grant all on public.oracle_planner_entries to service_role;
grant all on public.operator_progression_transactions to service_role;
grant all on public.operator_achievement_awards to service_role;
grant all on public.oracle_development_correlations to service_role;

-- Retire browser-owned mutation authority. Compatibility projections remain
-- readable until persisted producers are separately activated.
revoke update on public.operators from authenticated;
revoke insert, update, delete on public.operator_achievements
    from authenticated;

commit;
