-- WorkTrack V25 — Admin Staff Activity Center
-- Run ONCE in Supabase SQL Editor after V24 is already working.
-- This migration is additive: it does not modify or delete existing attendance/roster data.

create or replace function public.admin_get_employee_activity(
  p_employee_id text,
  p_from_date date default null,
  p_to_date date default null
)
returns table (
  employee_id text,
  employee_name text,
  activity_date date,
  activity_time text,
  activity_type text,
  details text
)
language sql
security definer
stable
set search_path = public
as $$
  with target as (
    select
      u.id,
      trim(concat(coalesce(u.raw_user_meta_data->>'first_name',''), ' ', coalesce(u.raw_user_meta_data->>'surname',''))) as employee_name,
      trim(coalesce(u.raw_user_meta_data->>'employee_id','')) as employee_id
    from auth.users u
    where trim(coalesce(u.raw_user_meta_data->>'employee_id','')) = trim(p_employee_id)
    limit 1
  ),
  activity as (
    select
      t.employee_id,
      t.employee_name,
      a.work_date as activity_date,
      coalesce(a.check_in::text, '') as activity_time,
      'Attendance'::text as activity_type,
      concat(
        'Status: ', coalesce(a.status,'—'),
        ' • Check-in: ', coalesce(a.check_in::text,'—'),
        ' • Check-out: ', coalesce(a.check_out::text,'—'),
        case when coalesce(a.ot_reason,'') <> '' then concat(' • OT reason: ', a.ot_reason) else '' end
      ) as details
    from target t
    join public.attendance a on a.user_id=t.id
    where (p_from_date is null or a.work_date >= p_from_date)
      and (p_to_date is null or a.work_date <= p_to_date)

    union all

    select
      t.employee_id,
      t.employee_name,
      r.work_date as activity_date,
      coalesce(r.duty_start::text, '') as activity_time,
      'Roster'::text as activity_type,
      concat(
        'Duty: ', coalesce(r.duty_type,'—'),
        case when r.duty_start is not null or r.duty_end is not null then concat(' • ', coalesce(r.duty_start::text,'—'), ' – ', coalesce(r.duty_end::text,'—')) else '' end
      ) as details
    from target t
    join public.roster_entries r on r.user_id=t.id
    where (p_from_date is null or r.work_date >= p_from_date)
      and (p_to_date is null or r.work_date <= p_to_date)

    union all

    select
      t.employee_id,
      t.employee_name,
      ws.created_at::date as activity_date,
      to_char(ws.created_at,'HH24:MI') as activity_time,
      'Written Statement'::text as activity_type,
      concat('Incident: ', coalesce(nullif(ws.incident_title,''),'Untitled statement')) as details
    from target t
    join public.written_statements ws on ws.user_id=t.id
    where (p_from_date is null or ws.created_at::date >= p_from_date)
      and (p_to_date is null or ws.created_at::date <= p_to_date)
  )
  select employee_id, employee_name, activity_date, activity_time, activity_type, details
  from activity
  order by activity_date desc, activity_time desc nulls last, activity_type;
$$;

revoke all on function public.admin_get_employee_activity(text,date,date) from public;
grant execute on function public.admin_get_employee_activity(text,date,date) to authenticated;
