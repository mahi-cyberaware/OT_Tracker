-- WorkTrack database schema
create extension if not exists pgcrypto;

create table if not exists public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  duty_hours numeric(4,2) not null default 9,
  created_at timestamptz not null default now()
);

create table if not exists public.attendance (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  work_date date not null,
  check_in time,
  check_out time,
  break_minutes integer not null default 0 check (break_minutes >= 0),
  status text not null default 'present' check (status in ('present','leave','off','holiday')),
  notes text,
  created_at timestamptz not null default now(),
  unique(user_id, work_date)
);

alter table public.profiles enable row level security;
alter table public.attendance enable row level security;

create policy "Users can view own profile" on public.profiles for select using (auth.uid() = id);
create policy "Users can insert own profile" on public.profiles for insert with check (auth.uid() = id);
create policy "Users can update own profile" on public.profiles for update using (auth.uid() = id);

create policy "Users can view own attendance" on public.attendance for select using (auth.uid() = user_id);
create policy "Users can insert own attendance" on public.attendance for insert with check (auth.uid() = user_id);
create policy "Users can update own attendance" on public.attendance for update using (auth.uid() = user_id);
create policy "Users can delete own attendance" on public.attendance for delete using (auth.uid() = user_id);

create or replace function public.handle_new_user()
returns trigger language plpgsql security definer set search_path = public as $$
begin
  insert into public.profiles (id) values (new.id) on conflict do nothing;
  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created after insert on auth.users
for each row execute procedure public.handle_new_user();

-- Optional future admin support:
-- Add an is_admin boolean to profiles and create restricted admin policies
-- only after your user-management requirements are finalized.
