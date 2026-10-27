-- Daybit Database Schema for Supabase
-- Run this in your Supabase SQL Editor: https://supabase.com/dashboard/project/sfmpfkzswawjodzilpes/sql/new

-- 1. Create or ensure habits table exists with composite primary key (user_id, id)
create table if not exists public.habits (
  id text not null,
  user_id uuid references auth.users(id) on delete cascade not null,
  name text not null,
  category text not null,
  emoji text not null,
  color text not null,
  target_per_month integer,
  description text,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  completions jsonb default '{}'::jsonb not null,
  primary key (user_id, id)
);

-- 2. If table was already created with old single 'id' primary key, upgrade to composite (user_id, id)
do $$
begin
  alter table public.habits drop constraint if exists habits_pkey;
  alter table public.habits add primary key (user_id, id);
exception
  when others then null;
end $$;

-- 3. Enable Row Level Security (RLS)
alter table public.habits enable row level security;

-- 4. Create RLS Policies with full USING and WITH CHECK (essential for UPSERT DO UPDATE)
drop policy if exists "Users can view own habits" on public.habits;
create policy "Users can view own habits"
  on public.habits for select
  using (auth.uid() = user_id);

drop policy if exists "Users can insert own habits" on public.habits;
create policy "Users can insert own habits"
  on public.habits for insert
  with check (auth.uid() = user_id);

drop policy if exists "Users can update own habits" on public.habits;
create policy "Users can update own habits"
  on public.habits for update
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

drop policy if exists "Users can delete own habits" on public.habits;
create policy "Users can delete own habits"
  on public.habits for delete
  using (auth.uid() = user_id);

-- 5. Enable Supabase Realtime replication for instant cross-device updates
do $$
begin
  alter publication supabase_realtime add table public.habits;
exception
  when others then null;
end $$;
