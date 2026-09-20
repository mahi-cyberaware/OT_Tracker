WorkTrack V25.3 Home Update Card Fix

Upload/replace ONLY these files on your V25 development branch:
- app-v22.js
- style.css
- sw.js
- updates/worktrack-update.svg
- updates/workforce.svg
- updates/security.svg

No Supabase SQL migration is required.

IMPORTANT:
The slide text is now HTML/config driven, not baked into the background image.
To change a slide background later, replace the corresponding image file while keeping the same filename, OR change the image path in WORKTRACK_UPDATE in app-v22.js.
The version/title can be changed in the same WORKTRACK_UPDATE config without editing the artwork.
