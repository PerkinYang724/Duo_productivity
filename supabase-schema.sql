-- Run this in Supabase dashboard → SQL Editor → New query, then click Run.
-- Idempotent: safe to re-run.

create extension if not exists "pgcrypto";

create table if not exists app_users (
  id uuid primary key default gen_random_uuid(),
  auth_user_id uuid unique not null references auth.users(id) on delete cascade,
  email text not null,
  name text not null,
  partner_id uuid references app_users(id) on delete set null,
  created_at timestamptz not null default now()
);

-- Existing projects: ensure partner_id FK uses ON DELETE SET NULL so cascading
-- auth.user deletes don't fail on the self-reference.
do $$
begin
  if exists (
    select 1 from pg_constraint
    where conname = 'app_users_partner_id_fkey'
      and confdeltype <> 'n'
  ) then
    alter table app_users drop constraint app_users_partner_id_fkey;
    alter table app_users add constraint app_users_partner_id_fkey
      foreign key (partner_id) references app_users(id) on delete set null;
  end if;
end $$;

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

-- ──────────────────────────────────────────────────────────────────────────────
-- Realtime: enable RLS + permissive read policies + add tables to the
-- realtime publication so the client can subscribe to changes. Server actions
-- use the service-role key, which bypasses RLS, so writes still work.
-- ──────────────────────────────────────────────────────────────────────────────

alter table app_users enable row level security;
alter table daily_tasks enable row level security;
alter table streak enable row level security;

drop policy if exists "auth read app_users" on app_users;
create policy "auth read app_users" on app_users
  for select to authenticated using (true);

drop policy if exists "auth read daily_tasks" on daily_tasks;
create policy "auth read daily_tasks" on daily_tasks
  for select to authenticated using (true);

drop policy if exists "auth read streak" on streak;
create policy "auth read streak" on streak
  for select to authenticated using (true);

-- Add tables to the realtime publication. Re-running this statement errors
-- "relation is already member of publication"; that's harmless.
alter publication supabase_realtime add table app_users, daily_tasks, streak;

-- ──────────────────────────────────────────────────────────────────────────────
-- Migrating from the previous Clerk-based schema?
-- Uncomment and run these once to convert clerk_id (text) to auth_user_id (uuid).
-- They drop existing data because the test run had only a handful of rows.
-- ──────────────────────────────────────────────────────────────────────────────
-- update streak set user1_id = null, user2_id = null where id = 'shared';
-- delete from daily_tasks;
-- delete from app_users;
-- alter table app_users drop column if exists clerk_id;
-- alter table app_users add column if not exists auth_user_id uuid unique
--   references auth.users(id) on delete cascade;
