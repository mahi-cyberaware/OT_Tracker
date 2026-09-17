create table if not exists public.written_statements (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  incident_title text,
  date_of_incident date,
  location_of_incident text,
  time_of_incident time,
  flight_no_etd text,
  staff_no text,
  staff_name text,
  staff_mob_no text,
  staff_designation text,
  involved boolean not null default false,
  witness boolean not null default false,
  injured_party boolean not null default false,
  ocr_text text,
  user_reason text,
  staff_statement text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
alter table public.written_statements enable row level security;
drop policy if exists "Users can view own written statements" on public.written_statements;
create policy "Users can view own written statements" on public.written_statements for select using (auth.uid()=user_id);
drop policy if exists "Users can insert own written statements" on public.written_statements;
create policy "Users can insert own written statements" on public.written_statements for insert with check (auth.uid()=user_id);
drop policy if exists "Users can update own written statements" on public.written_statements;
create policy "Users can update own written statements" on public.written_statements for update using (auth.uid()=user_id) with check (auth.uid()=user_id);
drop policy if exists "Users can delete own written statements" on public.written_statements;
create policy "Users can delete own written statements" on public.written_statements for delete using (auth.uid()=user_id);
