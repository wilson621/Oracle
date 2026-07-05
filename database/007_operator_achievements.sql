create table operator_achievements (

    id uuid primary key default gen_random_uuid(),

    operator_id uuid references operators(id) on delete cascade,

    achievement_id text not null,

    unlocked_at timestamptz default now(),

    unique(operator_id, achievement_id)

);