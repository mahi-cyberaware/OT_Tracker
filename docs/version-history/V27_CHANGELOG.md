# WorkTrack V27 Changes

Built from the current `OT_Tracker-main.zip` supplied by the user.

## Added
- Private profile picture upload/change/remove in My Profile.
- Supabase `profile-avatars` bucket migration and RLS policies.
- Profile picture display in the top-right avatar and profile dialog.
- Automatic browser resizing to max 512 px and JPEG storage.
- Resilient Staff Statement AI provider chain:
  1. Gemini
  2. Groq
  3. Cerebras
  4. OpenAI
  5. Built-in fallback
- Provider name displayed after successful statement generation.
- Server-side-only API key handling.

## Preserved
- Existing OT/attendance calculations.
- Existing OCR flow.
- Existing written statement preview/PDF flow.
- Existing Supabase authentication and application UI.
