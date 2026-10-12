-- HabitFlow Database Schema for Supabase
-- Run this in your Supabase SQL Editor: https://supabase.com/dashboard/project/sfmpfkzswawjodzilpes/sql/new

-- 1. Create habits table
create table if not exists public.habits (
  id text primary key,
  user_id uuid references auth.users(id) on delete cascade not null,
  name text not null,
  category text not null,
  emoji text not null,
  color text not null,
  target_per_month integer,
  description text,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  completions jsonb default '{}'::jsonb not null
);

-- 2. Enable Row Level Security (RLS)
alter table public.habits enable row level security;

-- 3. Create RLS Policies so each user only sees their own habits
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
  using (auth.uid() = user_id);

drop policy if exists "Users can delete own habits" on public.habits;
create policy "Users can delete own habits"
  on public.habits for delete
  using (auth.uid() = user_id);
