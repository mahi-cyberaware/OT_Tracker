WorkTrack V25.4 — Home Update Slide Responsive Fix

Upload/replace ONLY these files on your V25 development branch:
- style.css
- sw.js
- updates/worktrack-update.svg
- updates/workforce.svg
- updates/security.svg

No Supabase SQL migration is required.
No app-v22.js change is required.

Fixes:
- Prevents update slide text from being cropped on mobile.
- Gives the slide a stable responsive height on phones/tablets.
- Keeps eyebrow, title, description and release badge inside a safe content area.
- Makes desktop/tablet typography larger and more readable.
- Bumps the service-worker cache so the new CSS is loaded.

The background artwork remains independent. You can replace any SVG later using the same filename without changing the slide text configuration.
