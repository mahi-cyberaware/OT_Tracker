# WorkTrack V27 — Profile Picture + AI Fallback

## What changed

### 1. Profile picture
- Upload/change/remove profile picture from the existing profile area.
- Existing profile functionality is preserved.
- Supabase migration: `supabase/v27_profile_avatars.sql`

### 2. Staff Statement AI fallback
The `/api/statement` endpoint now uses this order:

1. Gemini
2. Groq
3. Cerebras
4. OpenAI (optional, if configured)
5. Built-in statement engine (always available)

If a provider is unavailable, rate-limited, out of quota, times out, or returns an error, WorkTrack automatically moves to the next provider. The user still receives a statement whenever the explanation field contains text.

The API response also includes `provider`, so the frontend can identify which engine generated the statement.

## Vercel Environment Variables

Add these in **Vercel → Project → Settings → Environment Variables**.

Recommended:
- `GEMINI_API_KEY` — Google AI Studio key
- `GROQ_API_KEY` — Groq API key
- `CEREBRAS_API_KEY` — Cerebras API key

Optional:
- `OPENAI_API_KEY` — existing OpenAI key
- `GEMINI_MODEL` — optional; default: `gemini-2.5-flash`
- `GROQ_MODEL` — optional; default: `openai/gpt-oss-120b`
- `CEREBRAS_MODEL` — optional; default: `gpt-oss-120b`
- `OPENAI_MODEL` — optional; default: `gpt-5.6-luna`

**Never put these keys in frontend JavaScript, HTML, GitHub, or client-side environment variables.**

## Provider setup

### Gemini
1. Open Google AI Studio.
2. Create an API key.
3. Add it to Vercel as `GEMINI_API_KEY`.

Gemini supports REST `generateContent`; free-tier rate limits depend on the project/model. Check Google's current quota page before relying on a specific limit.

### Groq
1. Create a Groq API key.
2. Add it to Vercel as `GROQ_API_KEY`.
3. Leave `GROQ_MODEL` unchanged unless you intentionally select another supported model.

### Cerebras
1. Create a Cerebras Inference API key.
2. Add it to Vercel as `CEREBRAS_API_KEY`.
3. The default model is `gpt-oss-120b`.

### OpenAI
OpenAI is retained as an optional compatibility provider. It is not required for the fallback chain. If the current OpenAI account has no credits, WorkTrack will simply continue to the built-in engine.

## Supabase profile picture setup

1. Open Supabase for the WorkTrack project.
2. Go to **SQL Editor**.
3. Open/copy `supabase/v27_profile_avatars.sql`.
4. Run it once.
5. Confirm the `profile-avatars` storage bucket and policies were created.

## Deploy

1. Extract this ZIP.
2. Commit/push the complete project to the private GitHub repository.
3. Deploy/redeploy the project in Vercel.
4. Add the environment variables above to the same Vercel project.
5. Make sure the variables are enabled for the environment you deploy (Production and/or Preview).
6. Redeploy after adding or changing environment variables.

## Test AI

Open the Staff Statement screen and enter a simple explanation, then click **Generate Staff Statement**.

Expected:
- With Gemini working: `provider = Gemini`
- If Gemini fails but Groq works: `provider = Groq`
- If both fail but Cerebras works: `provider = Cerebras`
- If those fail and OpenAI works: `provider = OpenAI`
- If all external providers fail: `provider = Built-in`

The built-in fallback uses the employee's supplied explanation and does not invent missing facts.

## Important security note

Do not commit API keys to GitHub. If a key is ever pasted into source code or a public repository, revoke/rotate it immediately and replace it in Vercel.

## No changes to core calculations

This V27 AI change is isolated to `api/statement.js`. Existing OT, attendance, OCR, PDF, and other application modules are not intentionally changed by the AI fallback implementation.
