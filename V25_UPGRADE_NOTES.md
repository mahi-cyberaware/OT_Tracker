# WorkTrack V25 — Complete Upgrade

V25 is based on the stable V24 package. V24 functionality is preserved.

## Added
- Admin Staff Activity Center: authorized admin can search by Employee ID and optional date range.
- Server-side `admin_get_employee_activity` RPC with admin authorization.
- Professional WorkTrack About / Founder presentation.
- Professional Services section.
- Professional Contact / Founder section.
- Security & Privacy presentation updated for the admin/activity architecture.
- Admin Staff Activity menu item is visible only to admins.
- Service-worker cache bumped to V25.

## Supabase migration
Run ONLY:
- `supabase/v25_admin_activity.sql`

Do NOT rerun the old V10/V17/V18/written-statement migrations.

## Updated files
- `index.html` — Admin Activity UI, Services navigation, professional menu/footer labels.
- `app-v22.js` — V25 navigation, admin activity RPC integration, professional About/Services/Contact/Security content.
- `style.css` — V25 professional information center and admin activity responsive styling.
- `sw.js` — V25 cache version.

## New file
- `supabase/v25_admin_activity.sql`
- `V25_UPGRADE_NOTES.md`

## Deployment
1. Create a development branch from the current production `main`, e.g. `V25-upgrade`.
2. Upload/replace the V25 package files.
3. Run `supabase/v25_admin_activity.sql` once in Supabase SQL Editor.
4. Push/commit to the V25 branch.
5. Test on Vercel Preview.
6. Confirm admin Employee ID activity search works and normal employee accounts cannot access the activity RPC.
7. Test About, Services, Contact, Security and existing V24 features.
8. Only after testing, merge V25 into `main`.
