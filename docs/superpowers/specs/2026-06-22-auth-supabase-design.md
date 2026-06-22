# Auth (Supabase) — Design Spec

**Date:** 2026-06-22
**Branch:** `feature/auth-supabase` (off `main` @ `ab378fa`)
**Status:** Design — awaiting user review before plan.

## Context

Precedent currently has **no authentication and no persistence** — the Zustand
store is in-memory by design and full state is lost on reload. The product now
needs a user-account model to support a usage-based entitlement scheme:

- **Anonymous** (no account): 1 BRD generation
- **Registered** (free account): 3 BRD generations
- **Subscribed**: unlimited (T&C per subscription plan)

This effort decomposes into independent sub-projects, each with its own
spec → plan → implementation:

1. **Auth** (this spec) — signup, login, logout, forgot/reset password, Google OAuth.
2. **Persistence + entitlement gating** — DB schema + per-user BRD-count enforcement; FastAPI verifies the Supabase JWT.
3. **Pricing section** — landing UI for the 4 tiers; "Start free" routes to signup.
4. **Real payments** (deferred) — Stripe/subscription.

This spec covers **#1 only**. It must be shippable on its own: it adds the
ability to authenticate but **gates nothing yet** (anonymous users keep full
access to `/intake`, since the 1-free-BRD rule is enforced in #2).

## Decisions (locked during brainstorming)

| Decision | Choice |
| --- | --- |
| Provider | **Supabase** (managed auth + Postgres; one integration also serves #2's DB needs) |
| Auth methods | **Email + password** AND **"Continue with Google"** (OAuth) |
| Email confirmation | **Required** for email/password signups. Google accounts arrive pre-verified. |
| Auth UI | **Custom pages** styled with the existing design system (no generic auth-kit look); `@supabase/ssr` for session logic |
| Social providers | Google only (no GitHub/others — YAGNI) |
| Backend (FastAPI) | **Unchanged in this sub-project.** JWT verification lands in #2 where it is actually needed. |
| Branch | `feature/auth-supabase` off `main`; **local only**, not pushed to origin until everything is done and a security assessment is complete |

## Provisioning (user-performed; assistant guides step-by-step)

These are account/dashboard steps the assistant cannot do:

1. **Create a Supabase project** — via Vercel Marketplace (auto-injects env vars) or supabase.com.
2. **Environment variables:**
   - `NEXT_PUBLIC_SUPABASE_URL` — client + server
   - `NEXT_PUBLIC_SUPABASE_ANON_KEY` — client + server
   - `SUPABASE_SERVICE_ROLE_KEY` — server only, never exposed (used in #2)
   - `SUPABASE_JWT_SECRET` — server only (used by FastAPI in #2)
   - Mirror these in `frontend/.env.local.example` (placeholder values only).
3. **Supabase dashboard config:**
   - Enable **email confirmations**.
   - Set **Site URL** and **Redirect URLs** allow-list: `http://localhost:3000`,
     `http://localhost:3001` (Playwright), and the Vercel preview/prod domains.
4. **Google OAuth (Google Cloud Console):**
   - Create an OAuth 2.0 Client ID (Web application).
   - Authorized redirect URI → the Supabase auth callback
     (`https://<project>.supabase.co/auth/v1/callback`).
   - Paste the Client ID + secret into Supabase's Google provider config.

## Architecture

### Routes & pages (Next.js App Router)

All pages built from existing design-system primitives (`DoubleBezel`/`Card`,
`Button`, `Input`, typography) per `DESIGN.md`.

| Route | Type | Purpose |
| --- | --- | --- |
| `/signup` | page (client form) | email+password + "Continue with Google"; on submit → "check your email" pending state |
| `/login` | page (client form) | email+password + "Continue with Google" → session |
| `/forgot-password` | page (client form) | request a password-reset email |
| `/auth/reset-password` | page (client form) | set a new password (arrived via email link) |
| `/auth/callback` | route handler | `exchangeCodeForSession` — handles email confirmation, password reset, AND Google OAuth (one handler for all three) |

### Session layer (`@supabase/ssr`)

- `lib/supabase/client.ts` — browser client (`createBrowserClient`).
- `lib/supabase/server.ts` — server client (`createServerClient`) reading/writing cookies.
- `middleware.ts` — refreshes the auth cookie on every request (canonical Supabase
  SSR pattern). Must coexist with the existing `next.config.js` CSP.

### Nav auth state

- `components/design-system/nav.tsx` — server-read session so there is no flash:
  - logged-out → **"Sign in"** link
  - logged-in → account email + **"Log out"** action

### CSP / config

- `next.config.js` already defines a CSP. Add the Supabase project origin to
  `connect-src` (and any Supabase/Google origins required for OAuth) so the
  client can reach `https://<project>.supabase.co`. Keep the existing dev-only
  `unsafe-eval` allowance intact.

## Scope guards (YAGNI)

- **No account/profile/settings page** beyond logout.
- **No role/permission system.**
- `/intake` stays **public** — auth adds capability, gates nothing in this sub-project.
- No backend (FastAPI) changes — deferred to #2.
- No payments — deferred to #4.

## Error handling

- Form-level inline validation (empty fields, password length, email format).
- Surface Supabase auth errors (wrong credentials, unconfirmed email, rate-limited)
  as readable messages, not raw error codes.
- `/auth/callback` failure (expired/invalid code) → redirect to `/login` with an
  error notice.

## Testing

Playwright (serial runner, `npm test` — **not** `npx playwright`, per env gotchas):

- signup → "check your email" pending state renders.
- login form validation (empty, bad format) shows inline errors.
- forgot-password request → confirmation state.
- logged-out vs logged-in nav state.
- Email-link and OAuth flows are **mocked at the `/auth/callback` boundary**
  (CI cannot click real emails or complete Google's consent screen).
- Unit-test any pure helpers (e.g. form validators) with Vitest.

## Out of scope (later sub-projects)

- Entitlement counting / BRD-quota enforcement → #2.
- FastAPI Supabase-JWT verification → #2.
- Pricing section UI → #3.
- Stripe/subscriptions → #4.
- Custom SMTP (Resend) for branded auth emails → follow-up (Supabase built-in
  email is rate-limited but sufficient to start).

## Security note

Per user instruction, this and subsequent sub-projects stay **local (un-pushed)**
until a security assessment is completed. Auth is security-critical surface;
the assessment should cover: cookie flags/SameSite, CSP correctness, redirect
allow-list (open-redirect prevention on `/auth/callback`), secret handling
(service-role key never client-exposed), and rate-limiting on auth endpoints.
