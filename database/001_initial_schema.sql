create extension if not exists pgcrypto;

create table public.operators (
    id uuid primary key default gen_random_uuid(),
    email text unique,
    callsign text not null,
    primary_game text default 'Call of Duty',
    combat_rating text default 'Recruit',
    created_at timestamptz default now()
);

create table public.oracle_sessions (
    id uuid primary key default gen_random_uuid(),
    operator_id uuid references public.operators(id) on delete cascade,

    game text default 'Call of Duty',
    session_type text default 'text',

    prompt text,

    verdict text,
    diagnosis text,
    strength text,
    correction text,

    grade text,

    win_chance integer,
    confidence integer,

    positioning integer,
    aim integer,
    movement integer,
    decision_making integer,
    game_sense integer,

    created_at timestamptz default now()
);