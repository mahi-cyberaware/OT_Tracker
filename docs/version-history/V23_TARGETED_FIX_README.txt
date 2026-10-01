WorkTrack V23 — Targeted Fix Package

BASE:
- Current working V22.6-based V23 package supplied by the user.

ONLY FIXED:
1. Written Statement incident details now use separate label/value columns.
2. Print / Save PDF opens a dedicated print window containing the actual company-form preview.
3. AI statement generation keeps the OpenAI key server-side and reports a clear configuration error if the Vercel deployment has no key.
4. Settings restored: Change Password + Email change/update + Mobile number change/update.
5. Written Statement is included in the existing V22.6 navigation map.

PRESERVED:
- Existing V22.6 menu/UI/CSS structure.
- Existing attendance, roster, calendar, reports, payroll and settings behavior.
- Existing Supabase project/data.
- No service-role key is used.
- No database migration is required for these fixes.

IMPORTANT AI SETUP:
The API key must be present in Vercel Environment Variables as:
OPENAI_API_KEY

For the V23-integration Preview deployment, the variable must have PREVIEW scope enabled.
Do not put the key in index.html or browser JavaScript.

The API uses OpenAI Responses API with GPT-5.6 Luna for text + image input.
