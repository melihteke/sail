# Setup: Supabase, Google login and the Deploy button

This guide switches sail.mteke.com from Markdown files to **Supabase** (database, login and file storage), so
you can log sails from the admin panel at **https://sail.mteke.com/admin/**.

It takes about 20 minutes. Until step 7 is done, the live site keeps building from the Markdown files, so nothing
breaks along the way.

> `<ref>` below is your Supabase project ref: the `xxxx` in `https://xxxx.supabase.co`.

## 1. Supabase project

1. Go to [supabase.com/dashboard](https://supabase.com/dashboard) → **New project**.
   - Name: `sail-logbook`.
   - Region: **West EU (Ireland)** or **Central EU (Frankfurt)**.
   - Save the database password somewhere safe (you won't need it day to day).
2. **SQL Editor** → **New query** → paste the whole of
   [`supabase/migrations/0001_schema.sql`](../supabase/migrations/0001_schema.sql) → **Run**.
   This creates the tables, the row level security, the `media` and `gpx` storage buckets, and makes
   `melihteke@gmail.com` the admin. Then do the same with
   [`supabase/migrations/0002_site_settings.sql`](../supabase/migrations/0002_site_settings.sql) (live wind and sea
   locations editable from the admin), then
   [`supabase/migrations/0003_race.sql`](../supabase/migrations/0003_race.sql) and
   [`supabase/migrations/0004_race_courses.sql`](../supabase/migrations/0004_race_courses.sql) (the academy race:
   courses, scoreboards and the server-side race check). All of them are safe to run again.
3. **Project Settings → API**: copy the **Project URL** and the **anon / publishable key**. Both are public by design.
   Also note the **service_role / secret key** for step 6. That one is secret: never commit or share it.

## 2. Auth URLs

**Authentication → URL Configuration**

| Setting       | Value                                                                              |
| ------------- | ---------------------------------------------------------------------------------- |
| Site URL      | `https://sail.mteke.com`                                                           |
| Redirect URLs | `https://sail.mteke.com/**` and `http://localhost:4321/**` (for local development) |

## 3. Google login

1. Go to [console.cloud.google.com](https://console.cloud.google.com) and create a project named `Sail Logbook`
   (or reuse the WSA project).
2. **APIs & Services → OAuth consent screen** (Google Auth Platform):
   - User type **External**, app name `Sail Logbook`, your support email.
   - Authorised domains: `mteke.com` and `supabase.co`.
   - Scopes: `email`, `profile` and `openid`.
   - **Publish** the app (otherwise only test users can sign in).
3. **Credentials → Create credentials → OAuth client ID**:
   - Type: **Web application**.
   - Authorised JavaScript origins: `https://sail.mteke.com`.
   - Authorised redirect URI: `https://<ref>.supabase.co/auth/v1/callback`.
4. Copy the **Client ID** and **Client secret** into Supabase → **Authentication → Sign In / Providers → Google**,
   and turn it on.

## 4. Deploy button (edge function)

The admin panel's **Deploy site** / **Publish** buttons run the GitHub Pages workflow through a small Supabase Edge
Function. It checks that the caller is the admin, so the GitHub token never reaches the browser.

1. GitHub → **Settings → Developer settings → Fine-grained personal access tokens → Generate new token**:
   - Name: `sail-logbook deploy`, expiration: up to you (1 year is fine; GitHub emails you before it expires).
   - Repository access: **Only select repositories → melihteke/sail**.
   - Permissions → Repository → **Actions: Read and write** (nothing else).
2. Supabase → **Edge Functions → Deploy a new function → Via editor**:
   - Name: `publish`.
   - Paste [`supabase/functions/publish/index.ts`](../supabase/functions/publish/index.ts) and deploy.
   - (With the Supabase CLI: `npx supabase functions deploy publish --project-ref <ref>`.)
3. Supabase → **Edge Functions → Secrets → Add new secret**: `GITHUB_TOKEN` = the token from step 1.

## 5. GitHub Actions variables

GitHub → **melihteke/sail → Settings → Secrets and variables → Actions → Variables → New repository variable**:

| Name                       | Value                       |
| -------------------------- | --------------------------- |
| `PUBLIC_SUPABASE_URL`      | `https://<ref>.supabase.co` |
| `PUBLIC_SUPABASE_ANON_KEY` | the anon / publishable key  |

These are *variables*, not secrets: they end up in the public site anyway.

## 6. Move the existing logbook into Supabase

Run once on your computer, in the repository folder:

```powershell
$env:SUPABASE_URL = "https://<ref>.supabase.co"
$env:SUPABASE_SERVICE_ROLE_KEY = "<service_role key>"   # from step 1.3; don't save it in a file
npx tsx scripts/migrate-to-supabase.ts --dry-run          # shows what will be imported
npx tsx scripts/migrate-to-supabase.ts
Remove-Item Env:SUPABASE_SERVICE_ROLE_KEY
```

This imports the Polyvalk (with its photo and specs), both sails (track, wind, analysis, story sections) and the
YouTube video. You can run it again safely: sails are matched by slug.

## 7. Go live

1. Open **https://sail.mteke.com/admin/** → **Sign in with Google** with melihteke@gmail.com.
   You should see the two sails.
2. Click **Deploy site**. After about 2 minutes the site is built from Supabase.
3. Check the live site. If anything looks wrong, remove the two GitHub variables from step 5 and run the workflow
   again: the site goes back to the Markdown files.

Once you're happy, you can delete `src/content/sails/`, `scripts/new-sail.mjs` and `scripts/add-media.mjs`
(the Markdown workflow), or keep them as a backup.

## Local development

```powershell
Copy-Item .env.example .env   # fill in PUBLIC_SUPABASE_URL + PUBLIC_SUPABASE_ANON_KEY
npm install
npm run dev                   # http://localhost:4321 and http://localhost:4321/admin/
npm test                      # RLS rules (PGlite), analysis, parsers
```

A full local Supabase (Docker Desktop required) works too: `npx supabase start`, then use the URL and anon key it
prints. The schema in `supabase/migrations` is applied automatically.

## Good to know

- **Free plan limits:** 500 MB database, 1 GB file storage, 50 MB per file. A processed photo is ~300–500 KB.
  Use YouTube for longer videos.
- **Pausing:** Supabase pauses free projects after 7 days without any activity. The public site keeps working (it's
  static). Only the admin panel needs the project: open the Supabase dashboard and click **Restore**.
- **Adding another admin:** run `insert into public.admins (email) values ('someone@gmail.com');` in the SQL editor.
