WORKTRACK V23 FINAL FIX

Target branch: V23-integration ONLY.
Do NOT change main.

Replace/upload these files:
1. index.html
2. style.css
3. written-statement.css
4. written-statement-module.js
5. capital-catering-logo.jpg
6. api/statement.js

Existing app-v22-6.js is intentionally NOT included. Keep the working V22.6 file already in the repository.

Fixes:
- Restores the proper slide-out menu styling.
- Restores the clean WorkTrack footer styling.
- Keeps Written Statement inside the main application flow, before the footer.
- Adds the missing Written Statement module so OCR / Generate / Save Draft / Print work.
- Adds a visible review/edit box for the AI-generated Staff Statement.
- Formats incident date as DD/MM/YYYY in the company-form preview.
- Reduces uploaded report images before sending to the AI endpoint.
- Fixes Written Statement print/PDF CSS so the company-form preview is printed instead of being hidden.
- Uses a cleaner Capital Catering logo crop taken from the supplied company form photo.

After upload, wait for Vercel Preview deployment and hard-refresh the V23 preview URL.
