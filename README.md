# WorkTrack V10

WorkTrack V10 is based on the stable V9 project.

## V10 additions
- Present, Absent, Sick Leave, Annual Leave, Comp-Off, Day Off, Public Holiday statuses
- Overtime reason field
- Date details popup when clicking a calendar date
- Notes and OT reason displayed in the date details popup
- Monthly attendance calculation excludes Off/leave/comp-off and does not count future dates
- Existing V9 authentication/session approach retained

## Supabase migration
Before deploying V10, run `supabase/v10_migration.sql` once in Supabase SQL Editor.

This migration adds `ot_reason`, converts the old `leave` status to `annual_leave`, and updates the status constraint. Existing attendance records are preserved.

## Deploy
Replace the previous V9 project files with the files in this folder and deploy to the existing Vercel project.
Do not change the Supabase URL/key or authentication storage settings from the working V9 setup.
