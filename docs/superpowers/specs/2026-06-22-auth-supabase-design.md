# Auth + Entitlement Gating (Supabase) — Design Spec

**Date:** 2026-06-22
**Branch:** `feature/auth-supabase` (off `main` @ `ab378fa`)
**Status:** Design — awaiting user review before plan.

## Context

Precedent currently has **no authentication and no persistence** — the Zustand
store is in-memory by design and full state is lost on reload. The product needs
real user accounts AND server-enforced usage limits ("gate by design").

**Access model: generation requires a (verified) account.** There is **no
anonymous tier** — anonymous Supabase users were considered and scrapped (weak
metering, abuse surface). Visitors evaluate the product via the existing landing
**`sample-brd.docx`** download; to generate, they sign up.

- **Registered** (free, email-confirmed or Google): **3** BRD generations
- **Subscribed**: **unlimited** (T&C per plan; the `is_subscribed` flag is set by
  payments in a later sub-project — until then registered=3 is the real cap, with
  a manual DB flag available for testing)

This spec covers **auth AND entitlement gating together** (enforcement is
required; login without enforcement is half a feature). Remaining sub-projects,
each its own spec → plan → build:

- **THIS SPEC** — auth (signup/login/reset/Google) + protected app routes +
  server-side quota enforcement.
- **#3 PRICING SECTION** — landing UI for the tiers; "Start free" → signup.
- **#4 PAYMENTS (deferred)** — Stripe/subscriptions; flips the `subscribed` flag.

## Security finding that drives this design

The current API auth is `NEXT_PUBLIC_API_SECRET_KEY` — a Bearer secret **shipped
to the browser** (`NEXT_PUBLIC_` ⇒ embedded in client JS, publicly readable).
`verify_api_key` therefore provides no real protection: anyone can extract the key
and call `/api/generate` directly. **Client-side gating is impossible to enforce.**

Enforcement moves server-side and binds to the per-user Supabase identity. The
public shared key is **retired** in favour of **Supabase JWT verification** in
FastAPI. *(User-approved.)*

## Decisions (locked during brainstorming)

| Decision | Choice |
| --- | --- |
| Provider | **Supabase** (managed auth + Postgres) |
| Auth methods | **Email + password** AND **"Continue with Google"** (OAuth) |
| Email confirmation | **Required** for email/password signups; Google pre-verified |
| Anonymous tier | **None** — generation requires login. No Supabase anonymous auth. |
| Generation access | `/intake`, `/review`, `/export` are **protected** — logged-out visitors are redirected to `/login?next=<path>` |
| Auth UI | **Custom pages** styled with the design system; `@supabase/ssr` for sessions |
| Social providers | Google only (YAGNI) |
| Enforcement | **Server-side in FastAPI** — verify Supabase JWT, check + consume quota in Postgres. Public `NEXT_PUBLIC_API_SECRET_KEY` retired. |
| Quota unit | Consumed on **`/generate`** only. `regenerate-section`/`critique`/`apply-critique`/`export` require auth but **do not** consume quota (they act on an existing BRD). |
| Tiers | Registered = 3, Subscribed = unlimited. (No anon.) |
| Branch | `feature/auth-supabase` off `main`; **local only**, not pushed until everything is done + security assessment complete |

## Tier derivation (server-side)

```
authenticated user
   ├─ is_subscribed = true  → Subscribed → unlimited
   └─ else                  → Registered → 3 BRDs
unauthenticated request → 401 (must sign up / log in)
```

## Architecture

### A. Frontend auth (Next.js App Router)

Auth pages (custom, from design-system primitives — `Card`, `Button`, `Input`,
typography — per `DESIGN.md`):

| Route | Type | Purpose |
| --- | --- | --- |
| `/signup` | page | email+password + "Continue with Google"; → "check your email" |
| `/login` | page | email+password + "Continue with Google"; honors `?next=` |
| `/forgot-password` | page | request reset email |
| `/auth/reset-password` | page | set new password (from email link) |
| `/auth/callback` | route handler | `exchangeCodeForSession` — confirmation, reset, AND OAuth |

Session + protection layer (`@supabase/ssr`):

- `lib/supabase/client.ts` (browser), `lib/supabase/server.ts` (server).
- `middleware.ts` refreshes the auth cookie each request AND **protects the app
  routes** (`/intake`, `/review`, `/export`): no session → redirect
  `/login?next=<path>`. Must coexist with the `next.config.js` CSP (add the
  Supabase origin to `connect-src`; keep dev-only `unsafe-eval`).
- Nav (`components/design-system/nav.tsx`): logged-out → **"Sign in"**;
  logged-in → email + **"Log out"**.
- Landing primary CTAs ("Generate my BRD" / "Start free"): when logged out, route
  to `/signup` (or `/intake`, which the middleware will bounce to `/login?next=/intake`).
  Final wording lands with the pricing sub-project (#3); the redirect makes either safe.

### B. Database (Supabase Postgres)

- `profiles` — `user_id uuid PK references auth.users(id)`, `is_subscribed bool
  default false`, `created_at`. Auto-created on signup via trigger.
- `brd_generations` — ledger, one row per generated BRD: `id`, `user_id`,
  `created_at`. Quota = `COUNT(*)` per user (a ledger keeps the door open for
  future per-period limits + analytics).
- **RLS** on both: a user can read only their own rows; writes go through the
  service role / RPC only.
- `consume_quota(p_user_id uuid)` Postgres **RPC** (SECURITY DEFINER): atomically
  checks current count against the tier limit (registered=3; subscribed=unlimited)
  and inserts a `brd_generations` row, returning `allowed boolean` +
  `remaining int`. Atomicity prevents races.
- Tier limits as a single SQL source of truth.

### C. Backend enforcement (FastAPI, `api/handler.py` + `_lib/`)

- New `verify_supabase_jwt` dependency **replaces** `verify_api_key` on the
  routers: reads `Authorization: Bearer <supabase_access_token>`, verifies the
  signature with `SUPABASE_JWT_SECRET` (HS256), checks expiry/`aud`, extracts
  `sub` (user_id) + claims. 401 on missing/invalid.
- `/generate` only: before drafting, call `consume_quota` (via Supabase service
  role / PostgREST or asyncpg). `allowed=false` → **HTTP 402**
  `{"error":{"code":"QUOTA_EXCEEDED","tier":...,"remaining":0}}`. Else proceed
  with the existing 12-way fan-out.
- `regenerate-section`/`critique`/`apply-critique`/`export`: keep
  `verify_supabase_jwt` (must be authenticated) but **no quota consumption**.
- slowapi rate limits stay (defense in depth).

### D. Frontend API client changes

- `lib/api.ts`: **drop `NEXT_PUBLIC_API_SECRET_KEY`**. `apiHeaders()` instead
  attaches the live Supabase **access token** (`Authorization: Bearer
  <access_token>`) from the current session.
- Generate flow handles:
  - **401** → session expired/missing → bounce to `/login?next=/intake`.
  - **402 QUOTA_EXCEEDED** (registered hit 3) → **"You've used your 3 free BRDs —
    upgrade for unlimited"** prompt → pricing/contact. Friendly, not a dead end.

## Scope guards (YAGNI)

- No account/profile/settings page beyond logout.
- No roles/permissions beyond the subscribed-vs-registered derivation.
- No Stripe/payments — `is_subscribed` flipped manually for now (#4 later).
- No custom SMTP — Supabase built-in email to start (Resend follow-up).
- Pricing-section UI is sub-project #3, not here.

## Error handling

- Inline form validation (empty, email format, password length); readable
  Supabase error messages (bad creds, unconfirmed email, rate-limited).
- `/auth/callback` invalid/expired code → redirect `/login` with notice; guard
  against open-redirect — only allow same-origin relative `next` params.
- API 401 → refresh session or bounce to `/login?next=…`.
- API 402 → the upgrade prompt above.

## Testing

Playwright (serial, `npm test` — NOT `npx`, per env gotchas) + Vitest units:

- signup → "check your email"; login validation; forgot-password request; nav
  auth state; **protected routes redirect to `/login?next=…` when logged out**,
  and post-login land on the intended page.
- Email-link + OAuth mocked at the `/auth/callback` boundary (CI can't click
  emails / complete Google consent).
- **Gating**: a registered user generates 3 BRDs; the 4th `/generate` → 402 +
  upgrade prompt. Backend quota tested against the `consume_quota` RPC (Supabase
  local or a seeded test user); mock at the API boundary in E2E.
- Vitest: pure helpers (form validators, tier-limit/derivation logic,
  401/402-response handling, `next`-param sanitizer).

## Provisioning (user-performed; assistant guides)

1. **Create Supabase project** (Vercel Marketplace auto-injects env, or supabase.com).
2. **Env vars** (mirror placeholders into `frontend/.env.local.example`):
   - `NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_ANON_KEY` (client+server)
   - `SUPABASE_SERVICE_ROLE_KEY` (server only — DB writes / RPC)
   - `SUPABASE_JWT_SECRET` (server only — FastAPI verifies JWTs)
3. **Supabase dashboard**: enable **email confirmations**; set Site URL + Redirect
   allow-list (`localhost:3000`, `localhost:3001`, Vercel preview/prod).
   *(Anonymous sign-ins stay DISABLED.)*
4. **Google OAuth** (Google Cloud Console): OAuth 2.0 Web client; authorized
   redirect URI → `https://<project>.supabase.co/auth/v1/callback`; paste
   client id + secret into Supabase's Google provider.
5. Apply DB migrations (tables, RLS, `consume_quota` RPC, profile trigger) via
   the Supabase SQL editor / CLI.

## Security note

Stays **local (un-pushed)** until a security assessment is complete. Assessment
must cover: retirement of the public API key; Supabase JWT verification
correctness (signature, expiry, `aud`); RLS policies (no cross-user reads/writes);
`consume_quota` atomicity/race-safety; service-role key never client-exposed;
cookie flags/SameSite; protected-route + `/auth/callback` open-redirect
prevention; rate-limiting on auth + generate endpoints; throwaway-email abuse of
the 3-free tier (email confirmation required is the first line; per-email/temp-domain
checks are a possible follow-up).
