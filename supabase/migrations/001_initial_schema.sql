-- ============================================
-- HabitTrack Database Schema for Supabase
-- Run this in the Supabase SQL Editor
-- ============================================

-- Enable UUID extension
create extension if not exists "uuid-ossp";

-- ============================================
-- HYDRATION TABLES
-- ============================================

-- Hydration Logs Table
create table hydration_logs (
  id uuid primary key default uuid_generate_v4(),
  user_id uuid references auth.users(id) on delete cascade,
  amount integer not null,
  label text default 'Quick Add',
  logged_at timestamptz default now(),
  created_at timestamptz default now()
);

-- Hydration Settings Table
create table hydration_settings (
  id uuid primary key default uuid_generate_v4(),
  user_id uuid unique references auth.users(id) on delete cascade,
  daily_goal integer default 2500,
  presets integer[] default array[250, 500, 750],
  updated_at timestamptz default now()
);

-- ============================================
-- SLEEP TABLES
-- ============================================

-- Sleep Logs Table (includes both raw input AND calculated stats)
create table sleep_logs (
  id uuid primary key default uuid_generate_v4(),
  user_id uuid references auth.users(id) on delete cascade,
  
  -- Raw Input Fields (SleepLog)
  date date not null,
  lights_out time not null,
  wake_up time not null,
  out_of_bed time not null,
  latency integer default 0,
  awakenings integer default 0,
  awake_duration integer default 0,
  subjective_quality integer default 5 check (subjective_quality >= 1 and subjective_quality <= 10),
  
  -- Calculated Stats Fields (DailySleepStats)
  total_time_in_bed integer,
  total_sleep_time integer,
  sleep_efficiency numeric(5,2),
  sleep_quality_score numeric(4,2),
  sleep_debt numeric(4,2),
  
  created_at timestamptz default now()
);

-- Sleep Settings Table
create table sleep_settings (
  id uuid primary key default uuid_generate_v4(),
  user_id uuid unique references auth.users(id) on delete cascade,
  target_hours numeric(3,1) default 8.0,
  updated_at timestamptz default now()
);

-- ============================================
-- USER PROFILES TABLE (Optional)
-- ============================================

create table profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  display_name text,
  avatar_url text,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

-- ============================================
-- ROW LEVEL SECURITY (RLS)
-- ============================================

-- Enable RLS on all tables
alter table hydration_logs enable row level security;
alter table hydration_settings enable row level security;
alter table sleep_logs enable row level security;
alter table sleep_settings enable row level security;
alter table profiles enable row level security;

-- Hydration Logs Policies
create policy "Users can view own hydration logs" 
  on hydration_logs for select using (auth.uid() = user_id);

create policy "Users can insert own hydration logs" 
  on hydration_logs for insert with check (auth.uid() = user_id);

create policy "Users can delete own hydration logs" 
  on hydration_logs for delete using (auth.uid() = user_id);

-- Hydration Settings Policies
create policy "Users can view own hydration settings" 
  on hydration_settings for select using (auth.uid() = user_id);

create policy "Users can insert own hydration settings" 
  on hydration_settings for insert with check (auth.uid() = user_id);

create policy "Users can update own hydration settings" 
  on hydration_settings for update using (auth.uid() = user_id);

-- Sleep Logs Policies
create policy "Users can view own sleep logs" 
  on sleep_logs for select using (auth.uid() = user_id);

create policy "Users can insert own sleep logs" 
  on sleep_logs for insert with check (auth.uid() = user_id);

create policy "Users can delete own sleep logs" 
  on sleep_logs for delete using (auth.uid() = user_id);

-- Sleep Settings Policies
create policy "Users can view own sleep settings" 
  on sleep_settings for select using (auth.uid() = user_id);

create policy "Users can insert own sleep settings" 
  on sleep_settings for insert with check (auth.uid() = user_id);

create policy "Users can update own sleep settings" 
  on sleep_settings for update using (auth.uid() = user_id);

-- Profiles Policies
create policy "Users can view own profile" 
  on profiles for select using (auth.uid() = id);

create policy "Users can insert own profile" 
  on profiles for insert with check (auth.uid() = id);

create policy "Users can update own profile" 
  on profiles for update using (auth.uid() = id);

-- ============================================
-- INDEXES FOR PERFORMANCE
-- ============================================

create index idx_hydration_logs_user on hydration_logs(user_id);
create index idx_hydration_logs_logged_at on hydration_logs(logged_at desc);
create index idx_sleep_logs_user on sleep_logs(user_id);
create index idx_sleep_logs_date on sleep_logs(date desc);

-- ============================================
-- TRIGGER: Auto-create profile on signup
-- ============================================

create or replace function public.handle_new_user()
returns trigger as $$
begin
  insert into public.profiles (id)
  values (new.id);
  return new;
end;
$$ language plpgsql security definer;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();

-- ============================================
-- TRIGGER: Auto-create settings on first access
-- ============================================

create or replace function public.ensure_hydration_settings()
returns trigger as $$
begin
  insert into public.hydration_settings (user_id)
  values (new.user_id)
  on conflict (user_id) do nothing;
  return new;
end;
$$ language plpgsql security definer;

create or replace function public.ensure_sleep_settings()
returns trigger as $$
begin
  insert into public.sleep_settings (user_id)
  values (new.user_id)
  on conflict (user_id) do nothing;
  return new;
end;
$$ language plpgsql security definer;
