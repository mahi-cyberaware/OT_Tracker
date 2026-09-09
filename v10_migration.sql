-- WorkTrack V10 database migration
-- Run this ONCE in Supabase SQL Editor.
-- It keeps all existing attendance records.

alter table public.attendance
  add column if not exists ot_reason text;

-- Convert the old generic 'leave' value to Annual Leave.
update public.attendance
set status='annual_leave'
where status='leave';

-- Replace the old status restriction with the V10 statuses.
alter table public.attendance
  drop constraint if exists attendance_status_check;

alter table public.attendance
  add constraint attendance_status_check
  check (
    status in (
      'present',
      'absent',
      'sick_leave',
      'annual_leave',
      'comp_off',
      'off',
      'holiday'
    )
  );
