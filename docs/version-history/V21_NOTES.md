# WorkTrack V21 — Final Menu Fix

- Renamed app.js to app-v21.js to eliminate stale app.js cache ambiguity.
- index.html explicitly loads app-v21.js?v=21.0.
- Menu navigation uses direct button listeners instead of the previous document capture handler.
- Section visibility is controlled directly and Home is not used as a fallback unless an invalid section is requested.
- Service-worker cache version bumped to V21.
- No Supabase migration required.
