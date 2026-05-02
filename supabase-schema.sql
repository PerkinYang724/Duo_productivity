-- Run this in Supabase dashboard → SQL Editor → New query, then click Run.
-- Idempotent: safe to re-run.

create extension if not exists "pgcrypto";

create table if not exists app_users (
  id uuid primary key default gen_random_uuid(),
  clerk_id text unique not null,
  email text not null,
  name text not null,
  partner_id uuid references app_users(id),
  created_at timestamptz not null default now()
);

create table if not exists daily_tasks (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references app_users(id) on delete cascade,
  task_text text not null,
  date text not null,
  submitted_at timestamptz not null default now(),
  status text not null default 'pending' check (status in ('pending','approved','rejected')),
  photo_url text,
  unique (user_id, date)
);

create index if not exists daily_tasks_date_idx on daily_tasks (date);

create table if not exists streak (
  id text primary key default 'shared',
  current_streak int not null default 0,
  start_date text,
  last_reset_date text,
  last_approved_date text,
  user1_id uuid references app_users(id),
  user2_id uuid references app_users(id),
  last_updated timestamptz not null default now()
);

insert into streak (id) values ('shared') on conflict do nothing;

-- Storage bucket for completion photos. Public read so <img src> works without
-- signed URLs. Service role still required to upload (configured server-side).
insert into storage.buckets (id, name, public)
values ('completion-photos', 'completion-photos', true)
on conflict do nothing;
