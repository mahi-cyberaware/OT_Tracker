# WorkTrack V20.1 — Actual Menu Fix

The root cause was the HTML still loading `app.js?v=19.0`. The browser/PWA could therefore continue serving the old JavaScript even when the new `app.js` was uploaded.

V20.1 changes:
- index.html now loads `app.js?v=20.1`
- service worker cache version is bumped
- service worker app shell explicitly caches `app.js?v=20.1`
- Supabase/auth/database code is unchanged
- No SQL migration is required
