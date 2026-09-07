# WorkTrack — Attendance & Overtime

A simple multi-user attendance tracker built with HTML, CSS, JavaScript, Supabase and Vercel.

## Current calculation
- Worked hours = Check-out minus Check-in.
- Overnight shifts are supported (for example 18:00 → 04:00 = 10 hours).
- Overtime = Worked hours minus daily duty hours, never below zero.
- Break minutes are not used by the current app.
- Existing `break_minutes` database column is retained for compatibility and is always saved as 0 by the current UI.

## Features
- Email sign up / login with Supabase Auth.
- Production redirect to the Vercel site after email confirmation.
- Private records using Supabase Row Level Security.
- Monthly dashboard and calendar.
- Present, Leave, Off day and Holiday statuses.
- Edit and delete attendance.
- Monthly CSV export.
- Configurable daily duty hours (default 9).
- Mobile-friendly responsive layout.

## Deployment
Static files can be deployed directly to Vercel. Update `app.js` only if the Supabase project credentials or production URL change.

## Security
Use the Supabase Publishable key in the browser. Never put a Supabase Secret/service-role key in frontend code.
