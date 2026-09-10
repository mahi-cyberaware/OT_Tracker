-- WorkTrack V18 — Smart Roster & Duty Reminder / Roster Management
-- Run ONCE after V17. It does not modify attendance records.

-- Admin-only roster management helpers.
-- The browser may parse the uploaded Excel, but these functions perform
-- the final employee-ID mapping and writes inside Supabase so normal users
-- cannot upload or modify someone else's roster.

create or replace function public.admin_import_roster(
  p_rows jsonb,
  p_replace_from date,
  p_replace_to date
)
returns jsonb
language plpgsql
security definer
set search_path = public
as $$
declare
  matched_users integer := 0;
  upserted_rows integer := 0;
  incoming_ids integer := 0;
begin
  if not public.is_roster_admin() then
    raise exception 'Only a WorkTrack administrator can import a roster';
  end if;

  if p_rows is null or jsonb_typeof(p_rows) <> 'array' then
    raise exception 'Roster rows must be a JSON array';
  end if;

  if p_replace_from is null or p_replace_to is null or p_replace_from > p_replace_to then
    raise exception 'Invalid roster replacement date range';
  end if;

  select count(distinct x.employee_id)
  into incoming_ids
  from jsonb_to_recordset(p_rows) as x(employee_id text, work_date date, duty_start time, duty_end time, duty_type text, raw_duty text)
  where nullif(trim(x.employee_id),'') is not null;

  select count(*)
  into matched_users
  from public.profiles p
  join auth.users u on u.id = p.id
  where p.role = 'user' or p.role = 'admin';

  -- Remove the previous roster for employees represented in this upload,
  -- only inside the uploaded date range. This makes a revised monthly roster
  -- authoritative while leaving other months untouched.
  delete from public.roster_entries re
  where re.work_date between p_replace_from and p_replace_to
    and re.employee_id in (
      select distinct trim(x.employee_id)
      from jsonb_to_recordset(p_rows) as x(employee_id text, work_date date, duty_start time, duty_end time, duty_type text, raw_duty text)
      where nullif(trim(x.employee_id),'') is not null
    );

  insert into public.roster_entries
    (user_id, employee_id, work_date, duty_start, duty_end, duty_type, raw_duty)
  select
    u.id,
    trim(x.employee_id),
    x.work_date,
    x.duty_start,
    x.duty_end,
    case when x.duty_type in ('present','off','annual_leave','sick_leave','comp_off','holiday') then x.duty_type else 'present' end,
    x.raw_duty
  from jsonb_to_recordset(p_rows) as x(employee_id text, work_date date, duty_start time, duty_end time, duty_type text, raw_duty text)
  join auth.users u
    on coalesce(u.raw_user_meta_data->>'employee_id','') = trim(x.employee_id)
  where x.work_date between p_replace_from and p_replace_to
    and nullif(trim(x.employee_id),'') is not null
    and x.work_date is not null
  on conflict (user_id, work_date) do update set
    employee_id = excluded.employee_id,
    duty_start = excluded.duty_start,
    duty_end = excluded.duty_end,
    duty_type = excluded.duty_type,
    raw_duty = excluded.raw_duty;

  get diagnostics upserted_rows = row_count;

  return jsonb_build_object(
    'incoming_employee_ids', incoming_ids,
    'upserted_rows', upserted_rows,
    'replacement_from', p_replace_from,
    'replacement_to', p_replace_to
  );
end;
$$;

create or replace function public.admin_upsert_roster_entry(
  p_employee_id text,
  p_work_date date,
  p_duty_start time,
  p_duty_end time,
  p_duty_type text,
  p_raw_duty text default null
)
returns jsonb
language plpgsql
security definer
set search_path = public
as $$
declare
  target_user uuid;
begin
  if not public.is_roster_admin() then
    raise exception 'Only a WorkTrack administrator can edit a roster';
  end if;

  select id into target_user
  from auth.users
  where coalesce(raw_user_meta_data->>'employee_id','') = trim(p_employee_id)
  limit 1;

  if target_user is null then
    raise exception 'No WorkTrack account found for Employee ID %', p_employee_id;
  end if;

  insert into public.roster_entries
    (user_id, employee_id, work_date, duty_start, duty_end, duty_type, raw_duty)
  values
    (target_user, trim(p_employee_id), p_work_date, p_duty_start, p_duty_end,
     case when p_duty_type in ('present','off','annual_leave','sick_leave','comp_off','holiday') then p_duty_type else 'present' end,
     p_raw_duty)
  on conflict (user_id, work_date) do update set
    duty_start = excluded.duty_start,
    duty_end = excluded.duty_end,
    duty_type = excluded.duty_type,
    raw_duty = excluded.raw_duty,
    employee_id = excluded.employee_id;

  return jsonb_build_object('success', true, 'employee_id', trim(p_employee_id), 'work_date', p_work_date);
end;
$$;

create or replace function public.admin_delete_roster_entry(
  p_employee_id text,
  p_work_date date
)
returns jsonb
language plpgsql
security definer
set search_path = public
as $$
begin
  if not public.is_roster_admin() then
    raise exception 'Only a WorkTrack administrator can delete a roster entry';
  end if;

  delete from public.roster_entries
  where employee_id = trim(p_employee_id)
    and work_date = p_work_date;

  return jsonb_build_object('success', true, 'employee_id', trim(p_employee_id), 'work_date', p_work_date);
end;
$$;

create or replace function public.admin_get_roster()
returns table (
  employee_id text,
  employee_name text,
  work_date date,
  duty_start time,
  duty_end time,
  duty_type text,
  raw_duty text
)
language sql
security definer
stable
set search_path = public
as $$
  select
    re.employee_id,
    trim(concat(coalesce(u.raw_user_meta_data->>'first_name',''), ' ', coalesce(u.raw_user_meta_data->>'surname',''))),
    re.work_date,
    re.duty_start,
    re.duty_end,
    re.duty_type,
    re.raw_duty
  from public.roster_entries re
  join auth.users u on u.id = re.user_id
  where public.is_roster_admin()
  order by re.work_date asc, re.employee_id asc;
$$;

revoke all on function public.admin_import_roster(jsonb,date,date) from public;
revoke all on function public.admin_upsert_roster_entry(text,date,time,time,text,text) from public;
revoke all on function public.admin_delete_roster_entry(text,date) from public;
revoke all on function public.admin_get_roster() from public;

grant execute on function public.admin_import_roster(jsonb,date,date) to authenticated;
grant execute on function public.admin_upsert_roster_entry(text,date,time,time,text,text) to authenticated;
grant execute on function public.admin_delete_roster_entry(text,date) to authenticated;
grant execute on function public.admin_get_roster() to authenticated;
