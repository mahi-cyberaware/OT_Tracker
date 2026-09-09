-- WorkTrack V17 — private duty roster
-- Run this ONCE in Supabase SQL Editor. No existing attendance/profile data is changed.
create table if not exists public.roster_entries (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  employee_id text not null,
  work_date date not null,
  duty_start time,
  duty_end time,
  duty_type text not null default 'present' check (duty_type in ('present','off','annual_leave','sick_leave','comp_off','holiday')),
  raw_duty text,
  created_at timestamptz not null default now(),
  unique(user_id, work_date)
);
alter table public.roster_entries enable row level security;
drop policy if exists "Users can view own roster" on public.roster_entries;
drop policy if exists "Users can insert own roster" on public.roster_entries;
drop policy if exists "Users can update own roster" on public.roster_entries;
drop policy if exists "Users can delete own roster" on public.roster_entries;
create policy "Users can view own roster" on public.roster_entries for select using (auth.uid() = user_id);
create policy "Users can insert own roster" on public.roster_entries for insert with check (auth.uid() = user_id);
create policy "Users can update own roster" on public.roster_entries for update using (auth.uid() = user_id) with check (auth.uid() = user_id);
create policy "Users can delete own roster" on public.roster_entries for delete using (auth.uid() = user_id);
create index if not exists roster_entries_user_date_idx on public.roster_entries(user_id, work_date);


-- V17.1 ADMIN-ONLY ROSTER UPLOAD
-- Employee ID 200396 (Mahesh) is the initial WorkTrack administrator.
alter table public.profiles add column if not exists role text not null default 'user';
alter table public.profiles drop constraint if exists profiles_role_check;
alter table public.profiles add constraint profiles_role_check check (role in ('user','admin'));

update public.profiles
set role='admin'
where id in (
  select id from auth.users
  where coalesce(raw_user_meta_data->>'employee_id','')='200396'
);

create or replace function public.is_roster_admin()
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (
    select 1
    from public.profiles
    where id = auth.uid() and role = 'admin'
  );
$$;

revoke all on function public.is_roster_admin() from public;
grant execute on function public.is_roster_admin() to authenticated;

drop policy if exists "Users can insert own roster" on public.roster_entries;
drop policy if exists "Users can update own roster" on public.roster_entries;
drop policy if exists "Users can delete own roster" on public.roster_entries;

create policy "Admins can insert roster"
on public.roster_entries for insert
with check (public.is_roster_admin());

create policy "Admins can update roster"
on public.roster_entries for update
using (public.is_roster_admin())
with check (public.is_roster_admin());

create policy "Admins can delete roster"
on public.roster_entries for delete
using (public.is_roster_admin());
