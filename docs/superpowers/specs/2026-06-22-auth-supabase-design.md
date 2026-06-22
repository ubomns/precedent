# Auth + Entitlement Gating (Supabase) — Design Spec

**Date:** 2026-06-22
**Branch:** `feature/auth-supabase` (off `main` @ `ab378fa`)
**Status:** Design — awaiting user review before plan.

## Context

Precedent currently has **no authentication and no persistence** — the Zustand
store is in-memory by design and full state is lost on reload. The product needs
real user accounts AND server-enforced usage limits ("gate by design"):

- **Anonymous** (auto, no signup): **1** BRD generation
- **Registered** (free account): **3** BRD generations
- **Subscribed**: **unlimited** (T&C per plan; the subscribed flag is set by
  payments in a later sub-project — until then "registered" is the effective cap,
  with a manual DB flag available for testing)

This spec covers **auth AND entitlement gating together** — the user requires
enforcement, and a login with no enforcement is half a feature. Remaining
sub-projects, each its own spec → plan → build:

- **THIS SPEC** — auth (signup/login/reset/Google) + anonymous identity +
  server-side quota enforcement.
- **#3 PRICING SECTION** — landing UI for the 4 tiers; "Start free" → signup.
- **#4 PAYMENTS (deferred)** — Stripe/subscriptions; flips the `subscribed` flag.

## Security finding that drives this design

The current API auth is `NEXT_PUBLIC_API_SECRET_KEY` — a Bearer secret **shipped
to the browser** (`NEXT_PUBLIC_` ⇒ embedded in client JS, publicly readable).
`verify_api_key` therefore provides no real protection: anyone can extract the key
and call `/api/generate` directly. **Client-side gating is impossible to enforce.**

Therefore enforcement moves server-side and binds to the per-user Supabase
identity. The public shared key is **retired** as the auth mechanism in favour of
**Supabase JWT verification** in FastAPI.

## Decisions (locked during brainstorming)

| Decision | Choice |
| --- | --- |
| Provider | **Supabase** (managed auth + Postgres) |
| Auth methods | **Email + password** AND **"Continue with Google"** (OAuth) |
| Email confirmation | **Required** for email/password signups; Google pre-verified |
| Anonymous tier | **Supabase Anonymous Auth** — every visitor gets a real anon user (1 BRD); signup **links** identity to the same `uid` → registered (3), preserving work |
| Auth UI | **Custom pages** styled with the design system; `@supabase/ssr` for sessions |
| Social providers | Google only (YAGNI) |
| Enforcement | **Server-side in FastAPI** — verify Supabase JWT, check + consume quota in Postgres. Public `NEXT_PUBLIC_API_SECRET_KEY` retired. |
| Quota unit | Consumed on **`/generate`** only. `regenerate-section`/`critique`/`apply-critique` stay ungated for any authenticated user (they edit an existing BRD). |
| Branch | `feature/auth-supabase` off `main`; **local only**, not pushed to origin until everything is done + security assessment complete |

## Identity model (Supabase Anonymous Auth)

```
Visitor → signInAnonymously() → anon auth.users row (is_anonymous=true) → 1 BRD
   │ sign up (linkIdentity email/Google to the SAME uid)
   ▼
Registered user (same uid, is_anonymous=false, email confirmed) → 3 BRDs
   │ subscribe (#4 payments sets is_subscribed=true)
   ▼
Subscribed → unlimited
```

- On first load, if no session, the client calls `signInAnonymously()` so every
  visitor has a stable `uid` to meter against.
- Signup **upgrades the existing anon user in place** (link email/Google), so the
  visitor keeps their `uid` and any usage already recorded.
- Tier is derived server-side: `is_anonymous` → anonymous; else `is_subscribed`
  → subscribed; else registered.

## Architecture

### A. Frontend auth (Next.js App Router)

Routes (custom pages from design-system primitives — `Card`, `Button`, `Input`,
typography — per `DESIGN.md`):

| Route | Type | Purpose |
| --- | --- | --- |
| `/signup` | page | email+password + "Continue with Google"; links to anon user; → "check your email" |
| `/login` | page | email+password + "Continue with Google" |
| `/forgot-password` | page | request reset email |
| `/auth/reset-password` | page | set new password (from email link) |
| `/auth/callback` | route handler | `exchangeCodeForSession` — confirmation, reset, AND OAuth |

Session layer (`@supabase/ssr`):

- `lib/supabase/client.ts` (browser), `lib/supabase/server.ts` (server).
- `middleware.ts` refreshes the auth cookie each request AND bootstraps an
  anonymous session if none exists. Must coexist with the `next.config.js` CSP
  (add the Supabase origin to `connect-src`; keep dev-only `unsafe-eval`).
- Nav (`components/design-system/nav.tsx`): anon/logged-out → **"Sign in"**;
  registered → email + **"Log out"**.

### B. Database (Supabase Postgres)

- `profiles` — `user_id uuid PK references auth.users(id)`, `is_subscribed bool
  default false`, `created_at`. Auto-created on first auth via trigger.
- `brd_generations` — ledger, one row per generated BRD: `id`, `user_id`,
  `created_at`. Quota = `COUNT(*)` per user (a ledger keeps the door open for
  future per-period limits + analytics).
- **RLS** on both: a user can read only their own rows; writes go through the
  service role / RPC only.
- `consume_quota(p_user_id uuid)` Postgres **RPC** (SECURITY DEFINER): atomically
  checks current count against the tier limit and inserts a `brd_generations` row,
  returning `allowed boolean` + `remaining int`. Atomicity prevents races.
- Tier limits as a single source of truth (SQL constant / table): anon=1,
  registered=3, subscribed=NULL(unlimited).

### C. Backend enforcement (FastAPI, `api/handler.py` + `_lib/`)

- New `verify_supabase_jwt` dependency replaces `verify_api_key` on the routers:
  reads `Authorization: Bearer <supabase_access_token>`, verifies the signature
  with `SUPABASE_JWT_SECRET` (HS256) — extracts `sub` (user_id) and claims
  (`is_anonymous`, `email`). 401 on missing/invalid.
- `/generate` only: before drafting, call the `consume_quota` RPC (via Supabase
  service role / PostgREST or asyncpg). If `allowed=false` → **HTTP 402**
  `{"error":{"code":"QUOTA_EXCEEDED","tier":...,"remaining":0}}`. If allowed,
  proceed with the existing 12-way fan-out.
- `regenerate-section`/`critique`/`apply-critique`/`export`: keep
  `verify_supabase_jwt` (must be authenticated) but **no quota consumption**.
- slowapi rate limits stay as-is (defense in depth).

### D. Frontend API client changes

- `lib/api.ts`: **drop `NEXT_PUBLIC_API_SECRET_KEY`**. `apiHeaders()` instead
  attaches the current Supabase **access token** (`Authorization: Bearer
  <access_token>`) read from the live session.
- Generate flow handles **402 QUOTA_EXCEEDED**: anon → prompt **"Sign up for 2
  more free BRDs"** (→ `/signup`); registered → **"Upgrade for unlimited"**
  (→ pricing/contact). Friendly, not a dead end.

## Scope guards (YAGNI)

- No account/profile/settings page beyond logout.
- No roles/permissions beyond the tier derivation.
- No Stripe/payments — `is_subscribed` flipped manually for now (#4 later).
- No custom SMTP — Supabase built-in email to start (Resend follow-up).
- Pricing-section UI is sub-project #3, not here.

## Error handling

- Inline form validation (empty, email format, password length); readable
  Supabase error messages (bad creds, unconfirmed email, rate-limited).
- `/auth/callback` invalid/expired code → redirect `/login` with notice; guard
  against open-redirect (only allow same-origin `next` params).
- API 401 (no/expired token) → refresh session or bounce to `/login`.
- API 402 (quota) → the upgrade prompts above.

## Testing

Playwright (serial, `npm test` — NOT `npx`, per env gotchas) + Vitest units:

- signup → "check your email"; login validation; forgot-password request; nav
  auth state.
- Email-link + OAuth mocked at the `/auth/callback` boundary (CI can't click
  emails / complete Google consent).
- **Gating**: anon can generate once; 2nd `/generate` → 402 + signup prompt;
  registered gets 3 then 402 + upgrade prompt. Backend quota tested against the
  `consume_quota` RPC (Supabase local or a seeded test user); mock at the API
  boundary in E2E.
- Vitest: pure helpers (form validators, tier-limit/derivation logic, 402-response
  handling).

## Provisioning (user-performed; assistant guides)

1. **Create Supabase project** (Vercel Marketplace auto-injects env, or supabase.com).
2. **Env vars** (mirror placeholders into `frontend/.env.local.example`):
   - `NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_ANON_KEY` (client+server)
   - `SUPABASE_SERVICE_ROLE_KEY` (server only — DB writes / RPC)
   - `SUPABASE_JWT_SECRET` (server only — FastAPI verifies JWTs)
3. **Supabase dashboard**: enable **email confirmations**; enable **Anonymous
   sign-ins**; set Site URL + Redirect allow-list (`localhost:3000`,
   `localhost:3001`, Vercel preview/prod).
4. **Google OAuth** (Google Cloud Console): OAuth 2.0 Web client; authorized
   redirect URI → `https://<project>.supabase.co/auth/v1/callback`; paste
   client id + secret into Supabase's Google provider.
5. Apply DB migrations (tables, RLS, `consume_quota` RPC, profile trigger) via
   the Supabase SQL editor / CLI.

## Security note

This work stays **local (un-pushed)** until a security assessment is complete.
Assessment must cover: retirement of the public API key; Supabase JWT
verification correctness (signature, expiry, `aud`); RLS policies (no cross-user
reads/writes); `consume_quota` atomicity/race-safety; service-role key never
client-exposed; cookie flags/SameSite; `/auth/callback` open-redirect prevention;
rate-limiting on auth + generate endpoints; anonymous-auth abuse (mass anon
account creation) mitigation.
