# Global AgriTech Innovation Hub: Phase 2 (Supabase backend)

React 18 + Vite 5 + React Router 6 + Supabase (Postgres, Auth, Row Level Security). Plain CSS, no UI library.
Phase 1 (the full responsive, bilingual front end) is preserved; Phase 2 replaces the mock data layer with a real
database, real authentication and a protected administrator interface.

> **Read "Verification status" before deploying.** The code was tested against a stand-in backend. It has NOT been run
> against a real Supabase project, and `npm install` / `npm run build` could not be run in the environment that produced
> this archive.

## Quick start

```bash
npm install
cp .env.example .env.local        # then fill in the two Supabase values (see below)
npm run dev                       # http://localhost:5173
npm run check:i18n                # English / Kiswahili dictionary check
npm test                          # unit tests (no Supabase needed)
npm run test:sql                  # static checks of the SQL migrations
npm run build                     # production build into dist/
```

Without Supabase values the site still opens, but data pages show a clear "backend not configured" state and sign-in is
disabled. The app never pretends to be connected.

## 1. Supabase setup (manual, one time)

1. Create a project at supabase.com. Copy **Project URL** and the **anon / publishable key** (Project Settings > API) into
   `.env.local` as `VITE_SUPABASE_URL` and `VITE_SUPABASE_ANON_KEY`. These two are public by design.
2. **Apply the migrations in order** (SQL editor, or `supabase link` then `supabase db push`):
   - `supabase/migrations/20261020000001_schema.sql` tables, constraints, indexes
   - `supabase/migrations/20261020000002_functions_triggers.sql` `is_admin()`, profile creation, author stamping, audit, RPCs
   - `supabase/migrations/20261020000003_rls_and_grants.sql` least-privilege grants and Row Level Security
3. **Seed the Phase 1 demonstration content** (repeatable, every row marked `is_sample = true`): run `supabase/seed.sql`
   in the SQL editor. Regenerate it from `src/data` with `npm run seed:generate`. Real content never uses the sample flag,
   so you can delete samples later with `delete from public.innovations where is_sample;` (and the same for other tables).
4. **Authentication > URL Configuration:** set *Site URL* to your deployed address and add these to *Redirect URLs*:
   `https://YOUR-DOMAIN/signin`, `https://YOUR-DOMAIN/reset-password`, and for local work `http://localhost:5173/signin`
   and `http://localhost:5173/reset-password`. The app builds email links from `VITE_APP_URL` (or the current origin), so
   no domain is hardcoded.
5. **Authentication > Providers > Email:** decide whether "Confirm email" is on. With it on, registration shows a
   "check your email" notice; with it off, new members are signed in immediately. Both paths are implemented.
   Supabase's built-in email service is rate limited; configure custom SMTP for production.
6. **Create the first administrator** (see below).

### First administrator (controlled procedure)

Nothing in the website can grant admin rights: `public.user_roles` has no insert/update/delete policy and no write
privilege for browser roles. To bootstrap:

1. Register normally on the site (and confirm the email if confirmation is on).
2. Open the Supabase dashboard SQL editor (a privileged session), edit the email in `supabase/bootstrap_admin.sql`, run it.
3. Sign out and in again; the Admin link appears and `/admin` opens.

Later admins are added the same way. Never put the service-role key in the browser or in a `VITE_` variable.

## 2. Deployment

Static hosting, any provider. Build command `npm run build`, output `dist`. SPA fallback and basic security headers are
configured in `netlify.toml`, `vercel.json` and `public/_redirects`.

- **Netlify / Vercel:** import the repository, add the three environment variables from `.env.example`
  (`VITE_SUPABASE_URL`, `VITE_SUPABASE_ANON_KEY`, optional `VITE_APP_URL`), deploy, then finish step 4 above with the real domain.
- Re-deploy after changing environment variables: Vite bakes them in at build time.

## 3. What is implemented

**Database** (3 migrations): taxonomies (sectors, applications, categories, countries); profiles; user_roles; innovations,
articles, courses, experts, startups, organizations, partnerships (opportunities and challenges); discussions and replies;
bookmarks; notifications; content submissions; contact messages; site settings; audit events. Foreign keys, check
constraints, unique slugs, `created_at`/`updated_at`, draft / published / archived status, trigram search indexes and
pagination indexes. Bilingual text is stored as `{ "en": ..., "sw": ... }` jsonb.

**Authentication** (Supabase Auth): register (with role choice), sign in, sign out, persistent session restored on reload,
forgot / reset password, duplicate-account handling, translated errors, loading states, protected routes, session-expired
and access-denied states, and same-site-only `?next=` redirects that cannot loop.

**Admin** (`/admin`, administrators only): list, search, status filter, pagination, create, edit with validation,
publish, unpublish, archive and delete with confirmation for innovations, categories, countries, articles, courses,
experts, startups, organizations, partnerships, community moderation, member submissions (review) and contact messages;
users (read-only list); notification broadcast to members who opted in; SEO and platform settings. Each action calls the
database; a success message appears only after the database confirms, and a refused write is shown as an error.

**Public site:** every Phase 1 page now reads from the database. Innovation directory and library paginate, filter, sort
and search in the database; all public queries also filter `status = 'published'`. Taxonomies are loaded at start-up and
refresh the shared lists.

**Members:** profile, settings and notification preferences, saved innovations and articles, notifications, content
submissions with status, dashboard, community posts and replies, contact form.

**Bilingual:** English and Kiswahili for all new screens and errors; `npm run check:i18n` enforces key parity and that
every key used in source exists.

## 4. Security model: what enforces what

Enforced by **Postgres policies and grants** (cannot be bypassed from the browser):

- public visitors read published content only; every write to managed content needs `public.is_admin()`;
- admin status comes only from a row in `user_roles`, which no API caller can write; user-supplied metadata is never trusted
  for authorization (sign-up metadata only fills display fields, each validated);
- bookmarks, notifications, profiles, submissions are scoped to `auth.uid()`; members can only mark notifications read
  (column-level grant);
- contact messages: anyone can insert, only admins can read; audit events: admin read only, written by triggers
  (who/what/when, never row contents, passwords or tokens);
- author names on posts are stamped by the database, so a client cannot post as someone else.

Enforced by the **front end only** (convenience, not security): hiding the Admin link, redirects, the "forbidden" screen.
Opening an admin URL by hand does nothing useful without the database role.

Needs **trusted server-side execution** and is NOT included: sending email or push notifications (see
`src/services/notificationProvider.js` for the interface), file uploads, rate limiting, CAPTCHA and abuse protection on the
public contact form and on sign-up (use Supabase Auth rate limits / CAPTCHA settings and an Edge Function if needed).

Security is **not** claimed to be production-ready. Before launch: have the policies reviewed on a real project, test them
with two real accounts, enable CAPTCHA and custom SMTP, add a Content Security Policy suited to your domains, and run
`npm audit` (do not run `npm audit fix --force` blindly).

## 5. Verification status

Run in the build environment, which had **no npm registry access and no PostgreSQL**:

| Check | Result |
| --- | --- |
| `npm run check:i18n` | passes (English and Kiswahili have identical key sets) |
| `npm test` (53 unit tests: auth logic, services, admin permissions, errors, validation, config, i18n) | passes, against an in-memory stand-in for Supabase |
| `npm run test:sql` (16 static checks: RLS on every table, no admin escalation path, grants, seed up to date, no secrets) | passes. These read the SQL text; **they do not execute it** |
| Browser smoke test: 260 page visits across public, member and admin sessions, English and Kiswahili, at 1280px and 360px (no console errors, no raw translation keys, guards redirect, member blocked from admin, no horizontal overflow) | passes against the stand-in backend and a stand-in router |
| 12 browser flows (wrong password, session restore, expiry, open-redirect guard, registration + duplicate, password reset, save after sign-in, profile persistence, contact -> admin-only, draft not public until published, refused delete reported honestly, community post, submission status) | pass against the stand-in backend |

**Not run:** `npm install`, `npm run build` (real Vite), the migrations and seed on a real Postgres, any call to a real
Supabase project, real email confirmation / password reset emails, `npm audit`, Lighthouse, screen-reader testing. The
integration tests that would prove the RLS policies on a real database (member cannot write, anon cannot read drafts,
etc.) still need a configured Supabase project; the unit tests only prove the application logic and the stand-in's rules.
`package-lock.json` could not be generated offline: run `npm install` once and commit it.

The browser checks live in `tests/browser/` (`build.mjs`, `serve.mjs`, `smoke.mjs`, `flows.mjs`) and need Playwright; they
use `tests/support/fakeSupabase.js` instead of the network.

## 6. Known limitations

- Media library: not implemented (needs a Storage bucket with policies). The screen says so.
- Notifications are in-app only; no email / push provider is shipped.
- Featured innovations on the homepage are the newest published ones (Phase 1 used a hand-picked list).
- Category sort orders by category id rather than by translated category name.
- Demo names such as "Demo Expert One" are not translated; Kiswahili text has not been reviewed by a native speaker.
- No server-side rate limiting or CAPTCHA (see section 4).

## 7. Troubleshooting

- *"Backend not configured" on every page:* the two `VITE_` variables are missing at build time; set them and rebuild.
- *Pages load but lists are empty:* migrations applied but seed not run, or content is still `draft` (only published rows show).
- *Sign-up works but the confirmation link opens the wrong site:* fix Site URL / Redirect URLs (step 4) or set `VITE_APP_URL`.
- *Admin page says "You do not have access":* the account has no row in `user_roles`; run the bootstrap script, then sign in again.
- *Saves fail with a permission error:* the third migration was not applied, or the session expired; sign in again.
- *Deep links 404 on your host:* the SPA fallback file for that host is missing (`netlify.toml`, `vercel.json`, `public/_redirects`).

## Project layout

```
src/            components, pages (user/ and admin/ are lazy bundles), services (the only data access), auth, i18n, styles
supabase/       migrations/, seed.sql (generated), bootstrap_admin.sql
scripts/        check-i18n.mjs, generate-seed.mjs
tests/          unit/, sql/, browser/, support/
```
