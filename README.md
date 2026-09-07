# WorkTrack — Attendance & Overtime

A mobile-first multi-user attendance and overtime tracker.

## Architecture
- Frontend: plain HTML/CSS/JavaScript
- Authentication + database: Supabase
- Hosting: Vercel or GitHub Pages
- Each user can only access their own records through Row Level Security.

## Setup
1. Create a Supabase project.
2. Open SQL Editor and run `supabase/schema.sql`.
3. In `app.js`, replace:
   - `YOUR_SUPABASE_URL`
   - `YOUR_SUPABASE_ANON_KEY`
4. Test by opening `index.html` locally.
5. Push the project to GitHub.
6. Import the repository into Vercel and deploy.

## Important
The Supabase anon key is intended for browser use when Row Level Security is correctly configured. Never put a Supabase service-role key in this frontend.

## Overtime calculation
Worked hours = check-out - check-in - break.
Overtime = max(0, worked hours - user's daily duty hours).

## Included
- Registration/login
- Private user records
- Configurable duty hours
- Daily attendance
- Break time
- Automatic OT
- Monthly dashboard
- Calendar
- History
- Edit/delete
- CSV export
- Leave/off/holiday status
- Responsive mobile UI

## Next production upgrades
- Password reset
- PDF reports
- Admin dashboard
- Company/workplace groups
- Approval workflow
- Email reminders
- Cloud backup policies
- Audit log
