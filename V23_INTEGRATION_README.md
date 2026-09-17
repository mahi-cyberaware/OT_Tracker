# WorkTrack V23 — Built from V22.6

This package is based on the working WorkTrack V22 final package.
Only the Written Statement feature was added.

## Target branch
Use ONLY on `V23-integration`. Do not replace `main`.

## V22.6 preserved
- Existing index.html structure and UI
- Existing style.css
- Existing app-v22.js behavior
- Existing manifest, service worker, icons and existing Supabase files

## V23 addition
- One new Menu item: Written Statement
- Written Statement section inside the existing `<main>`
- OCR + AI statement module
- Company-form preview
- Print / Save PDF
- Draft save
- API endpoint under `api/statement.js`

The `supabase/written_statements.sql` file is included for reference. It has already been run and should NOT be rerun unless the database is intentionally reset.


V23 final integration fix: V22.6 menu/navigation preserved; Written Statement is a single added app section. Removed competing navigation controller and bumped JS/service-worker cache versions to prevent stale first-load behavior. Deploy this package only to V23-integration.
