# WorkTrack V27 — Profile Picture + AI Fallback

This V27 package is built directly from the uploaded `OT_Tracker-main.zip` (the current main branch backup). The existing OT/attendance logic, OCR flow, PDF preview, Supabase authentication and written-statement UI are retained.

## 1. GitHub branch

Create a branch from `main` before uploading this package:

```text
v27-profile-ai-fallback
```

Do **not** merge it into `main` until testing is complete.

## 2. Supabase — profile pictures

V27 uses a private Storage bucket:

```text
profile-avatars
```

Run this file once in **Supabase → SQL Editor**:

```text
supabase/v27_profile_avatars.sql
```

The migration creates/updates the bucket and four policies so an authenticated user can only access objects inside their own `<auth-user-id>/` folder.

If you already ran the V27 avatar SQL and the bucket shows `profile-avatars` with the expected policies, you do not need to run it again.

## 3. Profile picture behavior

From **My Profile** the employee can:

- Upload/change a JPG, PNG or WebP image.
- Remove the current image.
- Use images up to 2 MB.
- The browser resizes the image to a maximum 512 px dimension and stores it as JPEG.
- The private Storage object is displayed using a temporary signed URL.
- If no picture exists, the employee initial remains visible.

The picture path is stored in the authenticated user's metadata as `avatar_path`.

## 4. Vercel environment variables

Add these server-side environment variables to the V27 Preview deployment:

```text
GEMINI_API_KEY
GROQ_API_KEY
CEREBRAS_API_KEY
OPENAI_API_KEY
```

Select **Preview** for the branch deployment. Production can remain unchanged while V27 is being tested.

Never place these keys in frontend JavaScript or commit them to GitHub.

## 5. AI fallback order

The `/api/statement` endpoint uses this order:

```text
Gemini
  ↓ if unavailable
Groq
  ↓ if unavailable
Cerebras
  ↓ if unavailable
OpenAI
  ↓ if unavailable
Built-in statement engine
```

The built-in engine requires no API key and prevents the Generate Staff Statement function from becoming completely unavailable when external providers are down, out of quota, or misconfigured.

### Current provider models used by V27

- Gemini: `gemini-3.8-flash`
- Groq: `openai/gpt-oss-20b`
- Cerebras: `gpt-oss-120b`
- OpenAI: `gpt-5-mini`

## 6. Redeploy after environment changes

After adding or changing Vercel environment variables:

1. Open **Vercel → Deployments**.
2. Select the V27 branch deployment.
3. Redeploy it so the new server-side environment variables are available.

## 7. Testing checklist

### Profile picture

1. Login.
2. Open **My Profile**.
3. Upload a picture.
4. Confirm it appears in the profile dialog and top-right avatar.
5. Refresh the application.
6. Confirm it remains visible.
7. Change the picture.
8. Remove it.
9. Confirm the initial returns.

### AI statement

1. Open the written statement section.
2. Enter a factual explanation.
3. Optionally run OCR first.
4. Click **Generate Staff Statement**.
5. Confirm the statement begins with `Dear Sir,`.
6. Confirm the status message identifies the provider used.

### Fallback test

Do this only on the V27 Preview environment:

1. Keep all four keys saved securely.
2. First test normally.
3. If needed, temporarily disable one provider's Preview environment variable in Vercel and redeploy.
4. Test again and confirm another provider is used.
5. Finally test with all external providers unavailable; the response should show **Built-in fallback** and still generate a statement from the employee explanation.

Do not intentionally change the Production variables while testing.

## 8. Security

API keys are read only in `/api/statement` on the server. They are never sent to the browser. The profile avatar bucket is private; V27 uses signed URLs rather than making employee photos public.
