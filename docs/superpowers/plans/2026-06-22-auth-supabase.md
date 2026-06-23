# Auth + Entitlement Gating (Supabase) Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Require a verified account to generate BRDs, enforce a server-side per-user quota (Registered = 3, Subscribed = unlimited), and replace the publicly-shipped API key with Supabase JWT verification.

**Architecture:** Supabase provides managed auth (email+password + Google OAuth) and Postgres. The Next.js app uses `@supabase/ssr` for cookie-based sessions, a `middleware.ts` that refreshes the session and redirects unauthenticated visitors away from `/intake`, `/review`, `/export`, and custom design-system auth pages. FastAPI verifies the Supabase access token (HS256 / `SUPABASE_JWT_SECRET`) on every `/api` route and calls an atomic `consume_quota` Postgres RPC on `/generate` only.

**Tech Stack:** Next.js 15 App Router, React 19, TypeScript, Zustand, `@supabase/ssr` + `@supabase/supabase-js`; FastAPI (Python), PyJWT, httpx; Supabase Postgres (RLS + plpgsql RPC). Tests: Playwright (serial) + Vitest + pytest.

## Global Constraints

These apply to every task. Exact values copied from the spec.

- **Provider:** Supabase (managed auth + Postgres). No other auth provider.
- **Auth methods:** Email + password AND "Continue with Google". Email confirmation **required** for email/password; Google is pre-verified.
- **No anonymous tier.** Supabase anonymous sign-ins stay DISABLED. Generation requires a logged-in user.
- **Protected routes:** `/intake`, `/review`, `/export` — logged-out → redirect `/login?next=<path>`.
- **Registered free-tier limit = `3`** BRD generations. Subscribed = unlimited. This `3` is the single source of truth in `consume_quota`; UI copy must say "3".
- **Quota is consumed on `/generate` ONLY.** `/regenerate-section`, `/critique`, `/apply-critique`, `/export` require auth but do NOT consume quota.
- **JWT verification:** HS256, secret `SUPABASE_JWT_SECRET`, `audience="authenticated"`, subject claim `sub` = user_id. 401 on missing/invalid/expired.
- **Retire `NEXT_PUBLIC_API_SECRET_KEY`** (shipped to browser ⇒ enforces nothing) and the server `API_SECRET_KEY` / `verify_api_key` path. FastAPI auth is now Supabase-JWT only.
- **LLM model unchanged:** `gpt-4.1-mini`, strict JSON schema. Do not touch the 12-section contract.
- **Design system is the visual contract.** Auth pages use `Button`, `Card`, `Input`, `FieldWrapper`, typography from `@/components/design-system`. No new color/gradient styles (see `DESIGN.md`).
- **Open-redirect guard:** only same-origin relative `next` params are honored; everything else falls back to `/intake`.
- **No production auth bypass.** E2E simulates auth by network-stubbing Supabase REST endpoints + seeding the session cookie (decided 2026-06-22). No env-gated shortcut in app code.
- **Branch `feature/auth-supabase`, local only.** Do NOT push to origin; pushes are held until the whole auth+pricing track is done and a security assessment is complete.
- **API entrypoint is `frontend/api/handler.py`** which imports `_lib.main:app` (NOT the old `[...path].py`).
- **Contact/upgrade target:** `mailto:hello@nsikak.dev` (matches the existing landing contact CTA) until the pricing sub-project (#3) lands.

## Prerequisites (user-performed provisioning — assistant guides)

These block *runtime/integration* testing but NOT writing or unit-testing code. The Supabase project must exist before Tasks 3–4 and the auth pages can be exercised against a live backend.

1. Create a Supabase project (Vercel Marketplace integration or supabase.com).
2. Set env vars locally (`frontend/.env.local`) and on Vercel:
   - `NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_ANON_KEY` (client + server)
   - `SUPABASE_SERVICE_ROLE_KEY` (server only — RPC / DB writes)
   - `SUPABASE_JWT_SECRET` (server only — FastAPI verifies JWTs)
   - `SUPABASE_URL` (server only, for FastAPI; same value as `NEXT_PUBLIC_SUPABASE_URL`)
3. Supabase dashboard: enable **email confirmations**; set Site URL + Redirect allow-list (`http://localhost:3000`, `http://localhost:3001`, Vercel preview/prod). Keep **anonymous sign-ins DISABLED**.
4. Google Cloud Console: OAuth 2.0 Web client; authorized redirect URI `https://<project>.supabase.co/auth/v1/callback`; paste client id + secret into Supabase's Google provider.
5. Apply the migration from Task 2 (Supabase SQL editor or CLI).

## File Structure

**Created:**
- `frontend/lib/supabase/client.ts` — browser Supabase client factory.
- `frontend/lib/supabase/server.ts` — server (RSC/route-handler) Supabase client factory.
- `frontend/lib/supabase/middleware.ts` — `updateSession()` (refresh + route protection).
- `frontend/middleware.ts` — Next middleware entry; delegates to `updateSession`.
- `frontend/lib/auth/next-param.ts` — `sanitizeNext()` open-redirect guard (pure, unit-tested).
- `frontend/app/auth/callback/route.ts` — `exchangeCodeForSession` for confirm/reset/OAuth.
- `frontend/app/login/page.tsx`, `frontend/app/signup/page.tsx`,
  `frontend/app/forgot-password/page.tsx`, `frontend/app/auth/reset-password/page.tsx` — auth pages.
- `frontend/components/auth/auth-card.tsx` — shared auth-page layout shell.
- `frontend/components/auth/google-button.tsx` — "Continue with Google" button.
- `frontend/components/auth/auth-nav-actions.tsx` — nav Sign in / email + Log out.
- `frontend/api/_lib/auth.py` — `get_current_user` Supabase-JWT dependency.
- `frontend/api/_lib/services/quota.py` — `consume_quota` RPC client.
- `supabase/migrations/0001_auth_quota.sql` — tables, RLS, RPC, trigger.
- `frontend/lib/auth/next-param.test.ts` — Vitest unit tests.
- `frontend/api/_lib/tests/test_auth.py`, `frontend/api/_lib/tests/test_quota.py` — pytest.
- `frontend/tests/helpers-auth.ts` — Playwright `stubAuth()` + smoke test seam.
- `frontend/tests/auth.spec.ts`, `frontend/tests/gating.spec.ts` — auth + quota E2E.

**Modified:**
- `frontend/package.json` — add `@supabase/supabase-js`, `@supabase/ssr`.
- `frontend/api/requirements.txt` — add `pyjwt`, `httpx`.
- `frontend/.env.local.example` — Supabase vars; drop `NEXT_PUBLIC_API_SECRET_KEY`.
- `frontend/next.config.js` — CSP `connect-src` includes the Supabase origin.
- `frontend/api/_lib/main.py` — replace `verify_api_key` with `get_current_user`; drop `API_SECRET_KEY`.
- `frontend/api/_lib/routers/generate.py` — quota consumption on `/generate`.
- `frontend/lib/api.ts` — async `apiHeaders()` attaches Supabase access token; drop secret key.
- `frontend/components/intake/use-wizard.ts` — `await apiHeaders()`; 401/402 handling.
- `frontend/app/review/page.tsx`, `frontend/app/export/page.tsx` — `await apiHeaders()`; nav actions.
- `frontend/app/page.tsx` — nav actions (Sign in / Log out).
- `frontend/tests/intake.spec.ts`, `frontend/tests/review.spec.ts`, `frontend/tests/export.spec.ts` — use `stubAuth()`; drop the old shared-key auth-header assertion.
- `CLAUDE.md` — note `handler.py` entrypoint + auth model (housekeeping).

---

### Task 1: Frontend Supabase deps, env scaffolding, client factories, CSP

**Files:**
- Modify: `frontend/package.json`
- Modify: `frontend/.env.local.example`
- Modify: `frontend/next.config.js:9-22`
- Create: `frontend/lib/supabase/client.ts`
- Create: `frontend/lib/supabase/server.ts`

**Interfaces:**
- Produces: `createClient()` from `lib/supabase/client.ts` (browser, sync) and `createClient()` from `lib/supabase/server.ts` (server, async — returns `Promise<SupabaseClient>`).

- [ ] **Step 1: Install Supabase packages**

Run (from `frontend/`):
```bash
npm install @supabase/supabase-js @supabase/ssr
```
Expected: both added to `package.json` `dependencies`; `npm ls @supabase/ssr` resolves.

- [ ] **Step 2: Browser client factory**

Create `frontend/lib/supabase/client.ts`:
```ts
import { createBrowserClient } from "@supabase/ssr";

export function createClient() {
  return createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  );
}
```

- [ ] **Step 3: Server client factory**

Create `frontend/lib/supabase/server.ts`:
```ts
import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";

export async function createClient() {
  const cookieStore = await cookies();

  return createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return cookieStore.getAll();
        },
        setAll(cookiesToSet) {
          try {
            cookiesToSet.forEach(({ name, value, options }) =>
              cookieStore.set(name, value, options)
            );
          } catch {
            // Called from a Server Component; safe to ignore when middleware
            // is refreshing the session.
          }
        },
      },
    }
  );
}
```

- [ ] **Step 4: Update env example**

Replace the secret-key block in `frontend/.env.local.example` (lines ~11-21) so it reads:
```bash
# Supabase (auth + Postgres). Client + server.
NEXT_PUBLIC_SUPABASE_URL=https://<project-ref>.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=<anon-key>

# Server only — never exposed to the browser.
SUPABASE_URL=https://<project-ref>.supabase.co
SUPABASE_SERVICE_ROLE_KEY=<service-role-key>
SUPABASE_JWT_SECRET=<jwt-secret>

# Required: OpenAI API key used by the BRD generation agents.
OPENAI_API_KEY=sk-...
```
Delete the `NEXT_PUBLIC_API_SECRET_KEY` and `API_SECRET_KEY` lines entirely.

- [ ] **Step 5: Add Supabase origin to CSP connect-src**

In `frontend/next.config.js`, after `const isDev = ...` (line 7) add:
```js
const supabaseOrigin = process.env.NEXT_PUBLIC_SUPABASE_URL
  ? new URL(process.env.NEXT_PUBLIC_SUPABASE_URL).origin
  : "";
```
Then change the `connect-src` line (line 13) from:
```js
  "connect-src 'self'",
```
to:
```js
  `connect-src 'self'${supabaseOrigin ? ` ${supabaseOrigin}` : ""}`,
```

- [ ] **Step 6: Verify build compiles**

Run:
```bash
npm run build
```
Expected: build succeeds (clients are tree-shaken out of unrelated routes; no type errors).

- [ ] **Step 7: Commit**

```bash
git add frontend/package.json frontend/package-lock.json frontend/lib/supabase frontend/.env.local.example frontend/next.config.js
git commit -m "feat(auth): add Supabase client factories, env scaffolding, CSP origin"
```

---

### Task 2: Database migration — profiles, ledger, RLS, consume_quota RPC, trigger

**Files:**
- Create: `supabase/migrations/0001_auth_quota.sql`

**Interfaces:**
- Produces: `public.consume_quota(p_user_id uuid) returns json` → `{"allowed": bool, "remaining": int, "tier": "registered"|"subscribed"}`. `remaining = -1` means unlimited.

- [ ] **Step 1: Write the migration SQL**

Create `supabase/migrations/0001_auth_quota.sql`:
```sql
-- Profiles: one row per auth user. is_subscribed flipped by payments (sub-project #4).
create table if not exists public.profiles (
  user_id uuid primary key references auth.users(id) on delete cascade,
  is_subscribed boolean not null default false,
  created_at timestamptz not null default now()
);

-- Ledger: one row per generated BRD. Quota = count(*) per user.
create table if not exists public.brd_generations (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  created_at timestamptz not null default now()
);
create index if not exists brd_generations_user_id_idx
  on public.brd_generations (user_id);

-- RLS: users may read only their own rows. Writes happen via the SECURITY DEFINER
-- RPC / service role only (both bypass RLS), so no insert/update policies are granted.
alter table public.profiles enable row level security;
alter table public.brd_generations enable row level security;

drop policy if exists profiles_select_own on public.profiles;
create policy profiles_select_own on public.profiles
  for select to authenticated using (auth.uid() = user_id);

drop policy if exists brd_generations_select_own on public.brd_generations;
create policy brd_generations_select_own on public.brd_generations
  for select to authenticated using (auth.uid() = user_id);

-- Auto-create a profile row when a new auth user is created.
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into public.profiles (user_id) values (new.id)
  on conflict (user_id) do nothing;
  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();

-- Atomic quota check + consume. Registered free-tier limit is 3 (single source of truth).
-- A per-user transaction advisory lock serializes concurrent generates to prevent the
-- check-then-insert race that could let a user exceed their cap.
create or replace function public.consume_quota(p_user_id uuid)
returns json
language plpgsql
security definer
set search_path = public
as $$
declare
  v_limit int := 3;  -- registered free tier
  v_subscribed boolean;
  v_count int;
  v_remaining int;
begin
  perform pg_advisory_xact_lock(hashtext(p_user_id::text));

  select is_subscribed into v_subscribed
  from public.profiles where user_id = p_user_id;

  if v_subscribed is null then
    insert into public.profiles (user_id) values (p_user_id)
    on conflict (user_id) do nothing;
    v_subscribed := false;
  end if;

  if v_subscribed then
    insert into public.brd_generations (user_id) values (p_user_id);
    return json_build_object('allowed', true, 'remaining', -1, 'tier', 'subscribed');
  end if;

  select count(*) into v_count
  from public.brd_generations where user_id = p_user_id;

  if v_count >= v_limit then
    return json_build_object('allowed', false, 'remaining', 0, 'tier', 'registered');
  end if;

  insert into public.brd_generations (user_id) values (p_user_id);
  v_remaining := v_limit - (v_count + 1);
  return json_build_object('allowed', true, 'remaining', v_remaining, 'tier', 'registered');
end;
$$;

-- Only the service role (which bypasses these grants) should call this.
revoke all on function public.consume_quota(uuid) from public, anon, authenticated;
```

- [ ] **Step 2: Apply and sanity-check (user-performed, against the provisioned project)**

In the Supabase SQL editor, run the migration, then verify:
```sql
select public.consume_quota('00000000-0000-0000-0000-000000000001');
```
Expected: first three calls return `{"allowed":true,...}` with `remaining` 2, 1, 0; the fourth returns `{"allowed":false,"remaining":0,"tier":"registered"}`. Then `delete from public.brd_generations where user_id = '00000000-0000-0000-0000-000000000001';` to reset.

- [ ] **Step 3: Commit**

```bash
git add supabase/migrations/0001_auth_quota.sql
git commit -m "feat(auth): add profiles, brd_generations ledger, RLS, consume_quota RPC"
```

---

### Task 3: Backend Supabase-JWT dependency (replace shared-key auth)

**Files:**
- Create: `frontend/api/_lib/auth.py`
- Create: `frontend/api/_lib/tests/__init__.py` (empty)
- Create: `frontend/api/_lib/tests/test_auth.py`
- Modify: `frontend/api/requirements.txt`
- Modify: `frontend/api/_lib/main.py:5,20,93-125`

**Interfaces:**
- Produces: `get_current_user(request: Request) -> dict` returning `{"user_id": str, "claims": dict}`; raises `HTTPException(401)` on missing/invalid token, `HTTPException(500)` if `SUPABASE_JWT_SECRET` is unset.

- [ ] **Step 1: Add backend deps + install pytest locally**

Append to `frontend/api/requirements.txt`:
```
pyjwt>=2.8.0
httpx>=0.27.0
```
Then install for local testing (from `frontend/api/`):
```bash
pip install pyjwt httpx pytest
```

- [ ] **Step 2: Write the failing test**

Create `frontend/api/_lib/tests/test_auth.py`:
```python
import os
import time

import jwt
import pytest
from fastapi import Request

os.environ["SUPABASE_JWT_SECRET"] = "test-secret"

from _lib.auth import get_current_user  # noqa: E402

SECRET = "test-secret"


def _request(auth_header: str | None) -> Request:
    headers = []
    if auth_header is not None:
        headers.append((b"authorization", auth_header.encode()))
    scope = {"type": "http", "headers": headers}
    return Request(scope)


def _token(**overrides) -> str:
    payload = {
        "sub": "user-123",
        "aud": "authenticated",
        "exp": int(time.time()) + 3600,
    }
    payload.update(overrides)
    return jwt.encode(payload, SECRET, algorithm="HS256")


@pytest.mark.asyncio
async def test_valid_token_returns_user():
    result = await get_current_user(_request(f"Bearer {_token()}"))
    assert result["user_id"] == "user-123"
    assert result["claims"]["aud"] == "authenticated"


@pytest.mark.asyncio
async def test_missing_header_401():
    with pytest.raises(Exception) as exc:
        await get_current_user(_request(None))
    assert getattr(exc.value, "status_code", None) == 401


@pytest.mark.asyncio
async def test_expired_token_401():
    with pytest.raises(Exception) as exc:
        await get_current_user(_request(f"Bearer {_token(exp=int(time.time()) - 10)}"))
    assert getattr(exc.value, "status_code", None) == 401


@pytest.mark.asyncio
async def test_wrong_audience_401():
    with pytest.raises(Exception) as exc:
        await get_current_user(_request(f"Bearer {_token(aud='other')}"))
    assert getattr(exc.value, "status_code", None) == 401
```

- [ ] **Step 3: Run it to confirm it fails**

Run (from `frontend/api/`):
```bash
python -m pytest _lib/tests/test_auth.py -v -p no:cacheprovider
```
Expected: collection error / FAIL — `_lib.auth` does not exist yet. (If `pytest-asyncio` is missing, install it: `pip install pytest-asyncio` and add an `asyncio_mode = auto` setting per Step 4.)

- [ ] **Step 4: Implement the dependency**

Create `frontend/api/_lib/auth.py`:
```python
import os

import jwt
from fastapi import HTTPException, Request, status

SUPABASE_JWT_SECRET = os.getenv("SUPABASE_JWT_SECRET")


async def get_current_user(request: Request) -> dict:
    """Verify the Supabase access token and return the authenticated user.

    Reads `Authorization: Bearer <token>`, verifies the HS256 signature with
    SUPABASE_JWT_SECRET, checks expiry and the `authenticated` audience, and
    returns {"user_id": <sub>, "claims": <payload>}. Raises 401 on any failure.
    """
    auth_header = request.headers.get("Authorization", "")
    if not auth_header.startswith("Bearer "):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Missing or invalid Authorization header",
        )

    secret = os.getenv("SUPABASE_JWT_SECRET", SUPABASE_JWT_SECRET)
    if not secret:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Server authentication is not configured",
        )

    token = auth_header[7:]
    try:
        payload = jwt.decode(
            token,
            secret,
            algorithms=["HS256"],
            audience="authenticated",
        )
    except jwt.PyJWTError:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid or expired token",
        )

    user_id = payload.get("sub")
    if not user_id:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Token is missing a subject claim",
        )

    return {"user_id": user_id, "claims": payload}
```

Also create empty `frontend/api/_lib/tests/__init__.py`. If using `pytest-asyncio`, add `frontend/api/pytest.ini`:
```ini
[pytest]
asyncio_mode = auto
```

- [ ] **Step 5: Run the test to confirm it passes**

Run (from `frontend/api/`):
```bash
python -m pytest _lib/tests/test_auth.py -v -p no:cacheprovider
```
Expected: 4 passed.

- [ ] **Step 6: Wire the dependency into main.py and remove the shared key**

In `frontend/api/_lib/main.py`:
- Add import after the other `_lib` imports (near line 12): `from _lib.auth import get_current_user`.
- Delete the `API_SECRET_KEY = os.getenv("API_SECRET_KEY")` line (line 20).
- Delete the entire `verify_api_key` function (lines 93-106).
- Change both `app.include_router(...)` calls (lines 114-125) to use the new dependency:
```python
app.include_router(
    generate.router,
    prefix="/api",
    tags=["generate"],
    dependencies=[Depends(get_current_user)],
)
app.include_router(
    export.router,
    prefix="/api",
    tags=["export"],
    dependencies=[Depends(get_current_user)],
)
```
(`Depends` is already imported on line 5.)

- [ ] **Step 7: Commit**

```bash
git add frontend/api/requirements.txt frontend/api/_lib/auth.py frontend/api/_lib/tests frontend/api/pytest.ini frontend/api/_lib/main.py
git commit -m "feat(auth): verify Supabase JWT in FastAPI; retire shared API key"
```

---

### Task 4: Backend quota enforcement on /generate

**Files:**
- Create: `frontend/api/_lib/services/quota.py`
- Create: `frontend/api/_lib/tests/test_quota.py`
- Modify: `frontend/api/_lib/routers/generate.py:5-11,78-113`

**Interfaces:**
- Consumes: `get_current_user` (Task 3) — `current_user["user_id"]`.
- Produces: `consume_quota(user_id: str) -> dict` (async) → the RPC's `{"allowed", "remaining", "tier"}`.

- [ ] **Step 1: Write the failing test (route returns 402 when quota denied)**

Create `frontend/api/_lib/tests/test_quota.py`:
```python
import os
import time

import jwt
import pytest
from fastapi.testclient import TestClient

os.environ["SUPABASE_JWT_SECRET"] = "test-secret"

from _lib.main import app  # noqa: E402
from _lib.routers import generate as generate_router  # noqa: E402

client = TestClient(app)


def _auth():
    token = jwt.encode(
        {"sub": "user-123", "aud": "authenticated", "exp": int(time.time()) + 3600},
        "test-secret",
        algorithm="HS256",
    )
    return {"Authorization": f"Bearer {token}"}


def _brief():
    return {
        "project_objective": "x",
        "stakeholders": [{"name": "A", "role": "B"}],
        "scope_in": ["a"],
        "scope_out": ["b"],
        "target_users": "u",
        "regulatory_context": "r",
    }


def test_generate_402_when_quota_exceeded(monkeypatch):
    async def fake_consume(user_id):
        assert user_id == "user-123"
        return {"allowed": False, "remaining": 0, "tier": "registered"}

    monkeypatch.setattr(generate_router, "consume_quota", fake_consume)

    resp = client.post("/api/generate", json=_brief(), headers=_auth())
    assert resp.status_code == 402
    body = resp.json()
    assert body["error"]["code"] == "QUOTA_EXCEEDED"
    assert body["error"]["tier"] == "registered"


def test_generate_401_without_token():
    resp = client.post("/api/generate", json=_brief())
    assert resp.status_code == 401
```

- [ ] **Step 2: Run it to confirm it fails**

Run (from `frontend/api/`):
```bash
python -m pytest _lib/tests/test_quota.py -v -p no:cacheprovider
```
Expected: FAIL — `generate` router has no `consume_quota` symbol; the 402 path doesn't exist.

- [ ] **Step 3: Implement the quota client**

Create `frontend/api/_lib/services/quota.py`:
```python
import os

import httpx


async def consume_quota(user_id: str) -> dict:
    """Atomically check + consume one generation for the user via the Postgres RPC.

    Returns {"allowed": bool, "remaining": int, "tier": str}. Uses the Supabase
    service-role key (server-only) so it bypasses RLS. Raises on transport/HTTP error.
    """
    base = os.getenv("SUPABASE_URL") or os.getenv("NEXT_PUBLIC_SUPABASE_URL")
    service_key = os.getenv("SUPABASE_SERVICE_ROLE_KEY")
    if not base or not service_key:
        raise RuntimeError("Supabase service configuration is missing")

    url = f"{base.rstrip('/')}/rest/v1/rpc/consume_quota"
    headers = {
        "apikey": service_key,
        "Authorization": f"Bearer {service_key}",
        "Content-Type": "application/json",
    }
    async with httpx.AsyncClient(timeout=10.0) as client:
        resp = await client.post(url, headers=headers, json={"p_user_id": user_id})
    resp.raise_for_status()
    return resp.json()
```

- [ ] **Step 4: Enforce quota in the /generate route**

In `frontend/api/_lib/routers/generate.py`:
- Update imports (lines 5-11). Change the FastAPI import line to include `Depends` and add `JSONResponse` + the new modules:
```python
from fastapi import APIRouter, Depends, HTTPException, Request, status
from fastapi.responses import JSONResponse
```
and after the existing `_lib` imports add:
```python
from _lib.auth import get_current_user
from _lib.services.quota import consume_quota
```
- Change the `generate_brd` signature + add the quota gate at the top of the function body (lines 78-100):
```python
@router.post("/generate")
@limiter.limit("10/minute")
async def generate_brd(
    request: Request,
    brief: BriefInput,
    current_user: dict = Depends(get_current_user),
):
    """
    Accepts a structured brief and returns a complete BRD document.
    Consumes one generation from the user's quota, then runs the drafter for
    each of the 12 sections. Critique is run separately on demand.
    """
    quota = await consume_quota(current_user["user_id"])
    if not quota["allowed"]:
        return JSONResponse(
            status_code=402,
            content={
                "error": {
                    "code": "QUOTA_EXCEEDED",
                    "tier": quota["tier"],
                    "remaining": quota["remaining"],
                }
            },
        )

    try:
        sections = [
            # ... unchanged 12-section list ...
        ]
```
Leave the rest of the function body (the `sections` list, `asyncio.gather`, `brd_data`, return, except) exactly as-is. Do NOT add quota to `regenerate-section`, `critique`, `apply-critique`.

- [ ] **Step 5: Run the test to confirm it passes**

Run (from `frontend/api/`):
```bash
python -m pytest _lib/tests/ -v -p no:cacheprovider
```
Expected: all pass (the 402 and 401 cases plus Task 3's 4 tests).

- [ ] **Step 6: Commit**

```bash
git add frontend/api/_lib/services/quota.py frontend/api/_lib/routers/generate.py frontend/api/_lib/tests/test_quota.py
git commit -m "feat(auth): consume per-user quota on /generate; 402 on exceeded"
```

---

### Task 5: next-param sanitizer + auth callback route handler

**Files:**
- Create: `frontend/lib/auth/next-param.ts`
- Create: `frontend/lib/auth/next-param.test.ts`
- Create: `frontend/app/auth/callback/route.ts`

**Interfaces:**
- Consumes: `createClient()` from `lib/supabase/server.ts` (Task 1).
- Produces: `sanitizeNext(next: string | null | undefined) -> string` (always a safe same-origin relative path; default `/intake`).

- [ ] **Step 1: Write the failing unit test**

Create `frontend/lib/auth/next-param.test.ts`:
```ts
import { describe, it, expect } from "vitest";
import { sanitizeNext } from "./next-param";

describe("sanitizeNext", () => {
  it("defaults to /intake when missing", () => {
    expect(sanitizeNext(null)).toBe("/intake");
    expect(sanitizeNext(undefined)).toBe("/intake");
    expect(sanitizeNext("")).toBe("/intake");
  });

  it("allows same-origin relative paths", () => {
    expect(sanitizeNext("/review")).toBe("/review");
    expect(sanitizeNext("/export?x=1")).toBe("/export?x=1");
  });

  it("rejects protocol-relative and absolute URLs", () => {
    expect(sanitizeNext("//evil.com")).toBe("/intake");
    expect(sanitizeNext("https://evil.com")).toBe("/intake");
    expect(sanitizeNext("http://evil.com")).toBe("/intake");
  });

  it("rejects backslash and non-leading-slash inputs", () => {
    expect(sanitizeNext("/\\evil.com")).toBe("/intake");
    expect(sanitizeNext("evil")).toBe("/intake");
  });
});
```

- [ ] **Step 2: Run it to confirm it fails**

Run (from `frontend/`):
```bash
npm run test:unit -- next-param
```
Expected: FAIL — module not found.

- [ ] **Step 3: Implement the sanitizer**

Create `frontend/lib/auth/next-param.ts`:
```ts
/**
 * Guard against open redirects. Only same-origin, relative paths are honored;
 * anything else falls back to /intake.
 */
export function sanitizeNext(next: string | null | undefined): string {
  if (!next) return "/intake";
  if (!next.startsWith("/")) return "/intake";
  if (next.startsWith("//")) return "/intake";
  if (next.includes("\\")) return "/intake";
  return next;
}
```

- [ ] **Step 4: Run the test to confirm it passes**

Run (from `frontend/`):
```bash
npm run test:unit -- next-param
```
Expected: 4 passed.

- [ ] **Step 5: Implement the callback route handler**

Create `frontend/app/auth/callback/route.ts`:
```ts
import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { sanitizeNext } from "@/lib/auth/next-param";

// Handles email confirmation, password reset, and OAuth — all return a `code`.
export async function GET(request: Request) {
  const { searchParams, origin } = new URL(request.url);
  const code = searchParams.get("code");
  const next = sanitizeNext(searchParams.get("next"));

  if (code) {
    const supabase = await createClient();
    const { error } = await supabase.auth.exchangeCodeForSession(code);
    if (!error) {
      return NextResponse.redirect(`${origin}${next}`);
    }
  }

  return NextResponse.redirect(`${origin}/login?error=auth`);
}
```

- [ ] **Step 6: Commit**

```bash
git add frontend/lib/auth/next-param.ts frontend/lib/auth/next-param.test.ts frontend/app/auth/callback/route.ts
git commit -m "feat(auth): add next-param open-redirect guard and OAuth/confirm callback"
```

---

### Task 6: Session middleware, route protection, and the E2E auth stub seam

**Files:**
- Create: `frontend/lib/supabase/middleware.ts`
- Create: `frontend/middleware.ts`
- Create: `frontend/tests/helpers-auth.ts`
- Create: `frontend/tests/auth.spec.ts` (smoke portion only this task; expanded in Task 7/11)

**Interfaces:**
- Consumes: `createServerClient` from `@supabase/ssr`.
- Produces: `updateSession(request: NextRequest) -> Promise<NextResponse>`; `stubAuth(page)` Playwright helper that makes a browser appear authenticated.

- [ ] **Step 1: Implement the session/protection helper**

Create `frontend/lib/supabase/middleware.ts`:
```ts
import { createServerClient } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";

const PROTECTED_PREFIXES = ["/intake", "/review", "/export"];

function isProtected(pathname: string): boolean {
  return PROTECTED_PREFIXES.some(
    (p) => pathname === p || pathname.startsWith(`${p}/`)
  );
}

export async function updateSession(request: NextRequest) {
  let response = NextResponse.next({ request });

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll();
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value }) =>
            request.cookies.set(name, value)
          );
          response = NextResponse.next({ request });
          cookiesToSet.forEach(({ name, value, options }) =>
            response.cookies.set(name, value, options)
          );
        },
      },
    }
  );

  // Do not run code between createServerClient and getUser() — it refreshes the token.
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const pathname = request.nextUrl.pathname;
  if (!user && isProtected(pathname)) {
    const url = request.nextUrl.clone();
    url.pathname = "/login";
    url.search = `?next=${encodeURIComponent(pathname)}`;
    return NextResponse.redirect(url);
  }

  return response;
}
```

- [ ] **Step 2: Implement the middleware entry**

Create `frontend/middleware.ts`:
```ts
import { type NextRequest } from "next/server";
import { updateSession } from "@/lib/supabase/middleware";

export async function middleware(request: NextRequest) {
  return await updateSession(request);
}

export const config = {
  matcher: [
    // Run on everything except static assets and files with an extension.
    "/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp|ico|docx|txt|js|css)$).*)",
  ],
};
```

- [ ] **Step 3: Write the E2E auth stub helper**

Create `frontend/tests/helpers-auth.ts`:
```ts
import { type Page } from "@playwright/test";

export const TEST_USER_ID = "11111111-1111-1111-1111-111111111111";
export const TEST_EMAIL = "tester@example.com";
// Any non-empty string; FastAPI is mocked in E2E, so the token is never verified.
export const TEST_ACCESS_TOKEN = "e2e-access-token";

const PROJECT_REF = "stub"; // matches NEXT_PUBLIC_SUPABASE_URL=https://stub.supabase.co

function fakeSession() {
  return {
    access_token: TEST_ACCESS_TOKEN,
    refresh_token: "e2e-refresh-token",
    expires_in: 3600,
    expires_at: Math.floor(Date.now() / 1000) + 3600,
    token_type: "bearer",
    user: {
      id: TEST_USER_ID,
      aud: "authenticated",
      email: TEST_EMAIL,
      role: "authenticated",
    },
  };
}

/**
 * Make the browser appear authenticated to both the middleware (server-side
 * getUser) and the browser client (getSession), without a real Supabase project.
 *
 * Strategy: intercept the only Supabase auth REST calls the app makes, and seed
 * the @supabase/ssr session cookie. If a future @supabase/ssr upgrade changes the
 * cookie encoding, the smoke test below fails loudly — update encodeCookie here.
 */
export async function stubAuth(page: Page) {
  await page.route("**/auth/v1/user**", (route) =>
    route.fulfill({
      status: 200,
      contentType: "application/json",
      body: JSON.stringify(fakeSession().user),
    })
  );
  await page.route("**/auth/v1/token**", (route) =>
    route.fulfill({
      status: 200,
      contentType: "application/json",
      body: JSON.stringify(fakeSession()),
    })
  );

  const cookieValue = `base64-${Buffer.from(
    JSON.stringify(fakeSession())
  ).toString("base64")}`;

  await page.context().addCookies([
    {
      name: `sb-${PROJECT_REF}-auth-token`,
      value: cookieValue,
      domain: "localhost",
      path: "/",
      httpOnly: false,
      sameSite: "Lax",
    },
  ]);
}
```

- [ ] **Step 4: Configure the test env for the stub**

Add the stub Supabase env to the Playwright webServer in `frontend/playwright.config.ts`. Find the `webServer` block and ensure its `env` includes:
```ts
env: {
  NEXT_PUBLIC_SUPABASE_URL: "https://stub.supabase.co",
  NEXT_PUBLIC_SUPABASE_ANON_KEY: "stub-anon-key",
},
```
(Merge with any existing `env`; keep other webServer fields unchanged.)

- [ ] **Step 5: Write the protection + stub smoke tests**

Create `frontend/tests/auth.spec.ts`:
```ts
import { test, expect } from "@playwright/test";
import { stubAuth } from "./helpers-auth";

test.describe("Route protection", () => {
  test("logged-out visitor to /intake is redirected to /login?next=", async ({
    page,
  }) => {
    await page.goto("/intake");
    await expect(page).toHaveURL(/\/login\?next=%2Fintake/);
  });

  test("stubAuth lets an authenticated visitor reach /intake", async ({
    page,
  }) => {
    await stubAuth(page);
    await page.goto("/intake");
    await expect(page).toHaveURL(/\/intake/);
    await expect(
      page.getByText("What are you building, and why now?")
    ).toBeVisible();
  });
});
```

- [ ] **Step 6: Run the smoke tests**

Run (from `frontend/`):
```bash
npm test -- auth.spec.ts
```
Expected: both pass. If the second fails (cookie not recognized), inspect the installed `@supabase/ssr` cookie format and adjust `encodeCookie`/cookie name in `helpers-auth.ts` until the authenticated visitor reaches `/intake`. This is the gate that proves the seam before other specs adopt it.

- [ ] **Step 7: Commit**

```bash
git add frontend/lib/supabase/middleware.ts frontend/middleware.ts frontend/tests/helpers-auth.ts frontend/tests/auth.spec.ts frontend/playwright.config.ts
git commit -m "feat(auth): session middleware + route protection; E2E auth stub seam"
```

---

### Task 7: Login + signup pages (+ shared auth UI)

**Files:**
- Create: `frontend/components/auth/auth-card.tsx`
- Create: `frontend/components/auth/google-button.tsx`
- Create: `frontend/app/login/page.tsx`
- Create: `frontend/app/signup/page.tsx`
- Modify: `frontend/tests/auth.spec.ts` (add form tests)

**Interfaces:**
- Consumes: `createClient()` (browser, Task 1), `sanitizeNext` (Task 5), design-system primitives.
- Produces: `<AuthCard>`, `<GoogleButton>` components for reuse in Task 8.

- [ ] **Step 1: Shared auth-card shell**

Create `frontend/components/auth/auth-card.tsx`:
```tsx
"use client";

import { ReactNode } from "react";
import Link from "next/link";
import { Card, Heading2, BodySmall } from "@/components/design-system";
import { LogoIcon } from "@/components/icons";

export function AuthCard({
  title,
  subtitle,
  children,
  footer,
}: {
  title: string;
  subtitle?: string;
  children: ReactNode;
  footer?: ReactNode;
}) {
  return (
    <main className="min-h-[100dvh] flex flex-col items-center justify-center px-4 py-16 bg-ground">
      <Link href="/" className="flex items-center gap-2.5 mb-8">
        <LogoIcon size={20} />
        <span className="text-base font-medium tracking-tight text-ink">
          Precedent
        </span>
      </Link>
      <Card padding="md" className="w-full max-w-[420px]">
        <div className="flex flex-col gap-1.5 mb-6">
          <Heading2>{title}</Heading2>
          {subtitle ? (
            <BodySmall className="text-secondary">{subtitle}</BodySmall>
          ) : null}
        </div>
        {children}
      </Card>
      {footer ? (
        <div className="mt-6 text-caption text-tertiary">{footer}</div>
      ) : null}
    </main>
  );
}
```

- [ ] **Step 2: Google button**

Create `frontend/components/auth/google-button.tsx`:
```tsx
"use client";

import { Button } from "@/components/design-system";
import { createClient } from "@/lib/supabase/client";

export function GoogleButton({ next }: { next: string }) {
  const onClick = async () => {
    const supabase = createClient();
    await supabase.auth.signInWithOAuth({
      provider: "google",
      options: {
        redirectTo: `${window.location.origin}/auth/callback?next=${encodeURIComponent(
          next
        )}`,
      },
    });
  };

  return (
    <Button variant="secondary" fullWidth onClick={onClick} type="button">
      Continue with Google
    </Button>
  );
}
```

- [ ] **Step 3: Write failing form tests**

Add to `frontend/tests/auth.spec.ts`:
```ts
test.describe("Auth forms", () => {
  test("login shows validation on empty submit", async ({ page }) => {
    await page.goto("/login");
    await page.getByRole("button", { name: "Log in" }).click();
    await expect(page.getByText("Email is required.")).toBeVisible();
  });

  test("signup success shows check-your-email", async ({ page }) => {
    await page.route("**/auth/v1/signup**", (route) =>
      route.fulfill({
        status: 200,
        contentType: "application/json",
        body: JSON.stringify({ user: { id: "x" }, session: null }),
      })
    );
    await page.goto("/signup");
    await page.getByLabel("Email").fill("new@example.com");
    await page.getByLabel("Password").fill("supersecret1");
    await page.getByRole("button", { name: "Create account" }).click();
    await expect(page.getByText(/check your email/i)).toBeVisible();
  });
});
```

- [ ] **Step 4: Run to confirm failure**

Run (from `frontend/`):
```bash
npm test -- auth.spec.ts
```
Expected: the two new tests FAIL (pages don't exist).

- [ ] **Step 5: Implement the login page**

Create `frontend/app/login/page.tsx`:
```tsx
"use client";

import { Suspense, useState } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { Button, Input, FieldWrapper } from "@/components/design-system";
import { AuthCard } from "@/components/auth/auth-card";
import { GoogleButton } from "@/components/auth/google-button";
import { createClient } from "@/lib/supabase/client";
import { sanitizeNext } from "@/lib/auth/next-param";

function LoginForm() {
  const router = useRouter();
  const next = sanitizeNext(useSearchParams().get("next"));
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [fieldError, setFieldError] = useState<{ email?: string; password?: string }>({});
  const [loading, setLoading] = useState(false);

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    const fe: typeof fieldError = {};
    if (!email) fe.email = "Email is required.";
    if (!password) fe.password = "Password is required.";
    setFieldError(fe);
    if (Object.keys(fe).length) return;

    setLoading(true);
    const supabase = createClient();
    const { error } = await supabase.auth.signInWithPassword({ email, password });
    setLoading(false);
    if (error) {
      setError(error.message);
      return;
    }
    router.push(next);
    router.refresh();
  };

  return (
    <AuthCard
      title="Log in"
      subtitle="Welcome back."
      footer={
        <>
          New here?{" "}
          <Link href={`/signup?next=${encodeURIComponent(next)}`} className="text-accent">
            Create an account
          </Link>
        </>
      }
    >
      <form onSubmit={onSubmit} className="flex flex-col gap-4" noValidate>
        <FieldWrapper label="Email" htmlFor="email" error={fieldError.email}>
          <Input id="email" type="email" value={email} onChange={(e) => setEmail(e.target.value)} error={!!fieldError.email} />
        </FieldWrapper>
        <FieldWrapper label="Password" htmlFor="password" error={fieldError.password}>
          <Input id="password" type="password" value={password} onChange={(e) => setPassword(e.target.value)} error={!!fieldError.password} />
        </FieldWrapper>
        {error ? (
          <p className="text-caption text-[var(--badge-high-text)]" role="alert">{error}</p>
        ) : null}
        <Button type="submit" fullWidth loading={loading}>Log in</Button>
      </form>
      <div className="flex items-center gap-3 my-4">
        <span className="h-px flex-1 bg-border" />
        <span className="text-caption text-tertiary">or</span>
        <span className="h-px flex-1 bg-border" />
      </div>
      <GoogleButton next={next} />
      <Link href="/forgot-password" className="mt-4 block text-caption text-tertiary hover:text-ink text-center">
        Forgot your password?
      </Link>
    </AuthCard>
  );
}

export default function LoginPage() {
  return (
    <Suspense fallback={null}>
      <LoginForm />
    </Suspense>
  );
}
```

- [ ] **Step 6: Implement the signup page**

Create `frontend/app/signup/page.tsx`:
```tsx
"use client";

import { Suspense, useState } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { Button, Input, FieldWrapper, Body } from "@/components/design-system";
import { AuthCard } from "@/components/auth/auth-card";
import { GoogleButton } from "@/components/auth/google-button";
import { createClient } from "@/lib/supabase/client";
import { sanitizeNext } from "@/lib/auth/next-param";

function SignupForm() {
  const next = sanitizeNext(useSearchParams().get("next"));
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [fieldError, setFieldError] = useState<{ email?: string; password?: string }>({});
  const [loading, setLoading] = useState(false);
  const [done, setDone] = useState(false);

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    const fe: typeof fieldError = {};
    if (!email) fe.email = "Email is required.";
    else if (!/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(email)) fe.email = "Enter a valid email.";
    if (!password) fe.password = "Password is required.";
    else if (password.length < 8) fe.password = "Use at least 8 characters.";
    setFieldError(fe);
    if (Object.keys(fe).length) return;

    setLoading(true);
    const supabase = createClient();
    const { error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        emailRedirectTo: `${window.location.origin}/auth/callback?next=${encodeURIComponent(next)}`,
      },
    });
    setLoading(false);
    if (error) {
      setError(error.message);
      return;
    }
    setDone(true);
  };

  if (done) {
    return (
      <AuthCard title="Check your email" subtitle={`We sent a confirmation link to ${email}.`}>
        <Body className="text-secondary">
          Click the link in that email to verify your account, then log in to start generating.
        </Body>
      </AuthCard>
    );
  }

  return (
    <AuthCard
      title="Create your account"
      subtitle="Free to start — 3 BRDs included."
      footer={
        <>
          Already have an account?{" "}
          <Link href={`/login?next=${encodeURIComponent(next)}`} className="text-accent">Log in</Link>
        </>
      }
    >
      <form onSubmit={onSubmit} className="flex flex-col gap-4" noValidate>
        <FieldWrapper label="Email" htmlFor="email" error={fieldError.email}>
          <Input id="email" type="email" value={email} onChange={(e) => setEmail(e.target.value)} error={!!fieldError.email} />
        </FieldWrapper>
        <FieldWrapper label="Password" htmlFor="password" hint="8+ characters" error={fieldError.password}>
          <Input id="password" type="password" value={password} onChange={(e) => setPassword(e.target.value)} error={!!fieldError.password} />
        </FieldWrapper>
        {error ? (
          <p className="text-caption text-[var(--badge-high-text)]" role="alert">{error}</p>
        ) : null}
        <Button type="submit" fullWidth loading={loading}>Create account</Button>
      </form>
      <div className="flex items-center gap-3 my-4">
        <span className="h-px flex-1 bg-border" />
        <span className="text-caption text-tertiary">or</span>
        <span className="h-px flex-1 bg-border" />
      </div>
      <GoogleButton next={next} />
    </AuthCard>
  );
}

export default function SignupPage() {
  return (
    <Suspense fallback={null}>
      <SignupForm />
    </Suspense>
  );
}
```

- [ ] **Step 7: Run the tests to confirm they pass**

Run (from `frontend/`):
```bash
npm test -- auth.spec.ts
```
Expected: all auth.spec tests pass.

- [ ] **Step 8: Commit**

```bash
git add frontend/components/auth/auth-card.tsx frontend/components/auth/google-button.tsx frontend/app/login frontend/app/signup frontend/tests/auth.spec.ts
git commit -m "feat(auth): login + signup pages with Google OAuth and validation"
```

---

### Task 8: Forgot-password + reset-password pages

**Files:**
- Create: `frontend/app/forgot-password/page.tsx`
- Create: `frontend/app/auth/reset-password/page.tsx`
- Modify: `frontend/tests/auth.spec.ts` (add reset tests)

**Interfaces:**
- Consumes: `createClient()` (browser), `<AuthCard>` (Task 7).

- [ ] **Step 1: Write failing tests**

Add to `frontend/tests/auth.spec.ts`:
```ts
test.describe("Password reset", () => {
  test("forgot-password submits and confirms", async ({ page }) => {
    await page.route("**/auth/v1/recover**", (route) =>
      route.fulfill({ status: 200, contentType: "application/json", body: "{}" })
    );
    await page.goto("/forgot-password");
    await page.getByLabel("Email").fill("a@b.com");
    await page.getByRole("button", { name: "Send reset link" }).click();
    await expect(page.getByText(/check your email/i)).toBeVisible();
  });
});
```

- [ ] **Step 2: Run to confirm failure**

Run: `npm test -- auth.spec.ts` — the new test FAILs.

- [ ] **Step 3: Implement forgot-password**

Create `frontend/app/forgot-password/page.tsx`:
```tsx
"use client";

import { useState } from "react";
import { Button, Input, FieldWrapper, Body } from "@/components/design-system";
import { AuthCard } from "@/components/auth/auth-card";
import { createClient } from "@/lib/supabase/client";

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [done, setDone] = useState(false);

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    if (!email) {
      setError("Email is required.");
      return;
    }
    setLoading(true);
    const supabase = createClient();
    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${window.location.origin}/auth/callback?next=/auth/reset-password`,
    });
    setLoading(false);
    if (error) {
      setError(error.message);
      return;
    }
    setDone(true);
  };

  if (done) {
    return (
      <AuthCard title="Check your email" subtitle={`If an account exists for ${email}, a reset link is on its way.`}>
        <Body className="text-secondary">Open the link to set a new password.</Body>
      </AuthCard>
    );
  }

  return (
    <AuthCard title="Reset your password" subtitle="We'll email you a secure link.">
      <form onSubmit={onSubmit} className="flex flex-col gap-4" noValidate>
        <FieldWrapper label="Email" htmlFor="email" error={error}>
          <Input id="email" type="email" value={email} onChange={(e) => setEmail(e.target.value)} error={!!error} />
        </FieldWrapper>
        <Button type="submit" fullWidth loading={loading}>Send reset link</Button>
      </form>
    </AuthCard>
  );
}
```

- [ ] **Step 4: Implement reset-password**

Create `frontend/app/auth/reset-password/page.tsx`:
```tsx
"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button, Input, FieldWrapper } from "@/components/design-system";
import { AuthCard } from "@/components/auth/auth-card";
import { createClient } from "@/lib/supabase/client";

export default function ResetPasswordPage() {
  const router = useRouter();
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    if (password.length < 8) {
      setError("Use at least 8 characters.");
      return;
    }
    setLoading(true);
    const supabase = createClient();
    const { error } = await supabase.auth.updateUser({ password });
    setLoading(false);
    if (error) {
      setError(error.message);
      return;
    }
    router.push("/intake");
    router.refresh();
  };

  return (
    <AuthCard title="Set a new password" subtitle="Choose a strong password you don't use elsewhere.">
      <form onSubmit={onSubmit} className="flex flex-col gap-4" noValidate>
        <FieldWrapper label="New password" htmlFor="password" hint="8+ characters" error={error}>
          <Input id="password" type="password" value={password} onChange={(e) => setPassword(e.target.value)} error={!!error} />
        </FieldWrapper>
        <Button type="submit" fullWidth loading={loading}>Update password</Button>
      </form>
    </AuthCard>
  );
}
```

- [ ] **Step 5: Run tests to confirm pass**

Run: `npm test -- auth.spec.ts` — all pass.

- [ ] **Step 6: Commit**

```bash
git add frontend/app/forgot-password frontend/app/auth/reset-password frontend/tests/auth.spec.ts
git commit -m "feat(auth): forgot-password + reset-password pages"
```

---

### Task 9: API client uses the Supabase token; update call sites + existing specs

**Files:**
- Modify: `frontend/lib/api.ts`
- Modify: `frontend/components/intake/use-wizard.ts:36-40`
- Modify: `frontend/app/review/page.tsx:540-550,782-790,806-810,711-716`
- Modify: `frontend/app/export/page.tsx:111-118`
- Modify: `frontend/tests/intake.spec.ts:73-89`
- Modify: `frontend/tests/review.spec.ts`, `frontend/tests/export.spec.ts`

**Interfaces:**
- Produces: `apiHeaders(contentType?: boolean) -> Promise<HeadersInit>` (now async), `getAccessToken() -> Promise<string | null>`.

- [ ] **Step 1: Rewrite the API client**

Replace the contents of `frontend/lib/api.ts`:
```ts
/**
 * Shared API helpers. The backend requires a Supabase access token as
 * `Authorization: Bearer <token>` on all /api/* routes (the old shared
 * NEXT_PUBLIC_API_SECRET_KEY is retired — it could never enforce anything).
 */
import { createClient } from "@/lib/supabase/client";

export const API_BASE = process.env.NEXT_PUBLIC_API_URL ?? "";

export function apiUrl(path: string): string {
  return `${API_BASE}${path}`;
}

export async function getAccessToken(): Promise<string | null> {
  const supabase = createClient();
  const {
    data: { session },
  } = await supabase.auth.getSession();
  return session?.access_token ?? null;
}

export async function apiHeaders(contentType: boolean = true): Promise<HeadersInit> {
  const headers: Record<string, string> = {};
  if (contentType) {
    headers["Content-Type"] = "application/json";
  }
  const token = await getAccessToken();
  if (token) {
    headers["Authorization"] = `Bearer ${token}`;
  }
  return headers;
}
```

- [ ] **Step 2: Await apiHeaders at all three call sites**

In `frontend/components/intake/use-wizard.ts` change `headers: apiHeaders(),` to `headers: await apiHeaders(),` (line ~38).

In `frontend/app/review/page.tsx`, change all four `headers: apiHeaders(),` occurrences (in `handleAccept`, `handleRegenerate`, `handleRunCritique`, `useExportBRD`) to `headers: await apiHeaders(),`. Each is already inside an `async` function.

In `frontend/app/export/page.tsx`, change `headers: apiHeaders(),` (line ~113) to `headers: await apiHeaders(),`.

- [ ] **Step 3: Update existing specs to authenticate + drop the shared-key assertion**

In `frontend/tests/intake.spec.ts`:
- Add `import { stubAuth } from "./helpers-auth";` at the top.
- In `test.beforeEach`, add `await stubAuth(page);` BEFORE `await page.goto("/intake");`.
- In the "walks the full conversation and generates" test, delete the `authHeader` capture and the final assertion `expect(authHeader).toBe(...)` (lines ~74-76, 88). Keep the route fulfillment so the test still asserts navigation to `/review`.

In `frontend/tests/review.spec.ts` and `frontend/tests/export.spec.ts`: add the same `import { stubAuth }` and call `await stubAuth(page);` before the first navigation (these specs use `walkIntakeWizard`, which navigates to `/intake` — protected). If they have a `beforeEach`, add it there; otherwise add it at the start of each test before `walkIntakeWizard`.

- [ ] **Step 4: Run the affected suites**

Run (from `frontend/`):
```bash
npm test -- intake.spec.ts review.spec.ts export.spec.ts
```
Expected: green. (If a spec still lands on `/login`, its `stubAuth` call is missing or ordered after navigation.)

- [ ] **Step 5: Commit**

```bash
git add frontend/lib/api.ts frontend/components/intake/use-wizard.ts frontend/app/review/page.tsx frontend/app/export/page.tsx frontend/tests/intake.spec.ts frontend/tests/review.spec.ts frontend/tests/export.spec.ts
git commit -m "feat(auth): attach Supabase access token to API calls; auth E2E setup"
```

---

### Task 10: Nav auth state (Sign in / Log out)

**Files:**
- Create: `frontend/components/auth/auth-nav-actions.tsx`
- Modify: `frontend/app/page.tsx:27`
- Modify: `frontend/app/review/page.tsx:852-862` (compose actions)
- Modify: `frontend/app/export/page.tsx:152`
- Modify: `frontend/tests/auth.spec.ts` (nav-state test)

**Interfaces:**
- Consumes: `createClient()` (browser).
- Produces: `<AuthNavActions />` — renders "Sign in" when logged out, email + "Log out" when logged in.

- [ ] **Step 1: Write failing nav test**

Add to `frontend/tests/auth.spec.ts`:
```ts
test.describe("Nav auth state", () => {
  test("shows Sign in when logged out", async ({ page }) => {
    await page.goto("/");
    await expect(page.getByRole("link", { name: "Sign in" })).toBeVisible();
  });

  test("shows Log out when authenticated", async ({ page }) => {
    await stubAuth(page);
    await page.goto("/");
    await expect(page.getByRole("button", { name: "Log out" })).toBeVisible();
  });
});
```

- [ ] **Step 2: Run to confirm failure**

Run: `npm test -- auth.spec.ts` — the two nav tests FAIL.

- [ ] **Step 3: Implement the nav actions component**

Create `frontend/components/auth/auth-nav-actions.tsx`:
```tsx
"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";

export function AuthNavActions() {
  const router = useRouter();
  const pathname = usePathname();
  const [email, setEmail] = useState<string | null>(null);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    const supabase = createClient();
    supabase.auth.getUser().then(({ data }) => {
      setEmail(data.user?.email ?? null);
      setReady(true);
    });
    const { data: sub } = supabase.auth.onAuthStateChange((_e, session) => {
      setEmail(session?.user?.email ?? null);
    });
    return () => sub.subscription.unsubscribe();
  }, []);

  if (!ready) return null;

  if (!email) {
    return (
      <Link
        href={`/login?next=${encodeURIComponent(pathname)}`}
        className="px-3 py-2 text-sm tracking-tight text-secondary hover:text-ink transition-colors rounded-md"
      >
        Sign in
      </Link>
    );
  }

  const onLogout = async () => {
    const supabase = createClient();
    await supabase.auth.signOut();
    router.push("/");
    router.refresh();
  };

  return (
    <div className="flex items-center gap-3">
      <span className="hidden sm:inline text-caption text-tertiary font-mono max-w-[18ch] truncate">
        {email}
      </span>
      <button
        type="button"
        onClick={onLogout}
        className="px-3 py-2 text-sm tracking-tight text-secondary hover:text-ink transition-colors rounded-md"
      >
        Log out
      </button>
    </div>
  );
}
```

- [ ] **Step 4: Wire into the three Nav usages**

In `frontend/app/page.tsx`: import `import { AuthNavActions } from "@/components/auth/auth-nav-actions";` and change `<Nav items={NAV_ITEMS} />` to `<Nav items={NAV_ITEMS} actions={<AuthNavActions />} />`.

In `frontend/app/export/page.tsx`: import it and change `<Nav items={navItems} />` to `<Nav items={navItems} actions={<AuthNavActions />} />`.

In `frontend/app/review/page.tsx`: the nav already passes an Export button as `actions`. Compose both:
```tsx
const navActions = (
  <div className="flex items-center gap-2">
    <Button size="sm" variant="primary" onClick={exportBRD} loading={exporting} trailingIcon={<IconDownload size={14} />}>
      Export
    </Button>
    <AuthNavActions />
  </div>
);
```
(Add the import.)

- [ ] **Step 5: Run tests to confirm pass**

Run: `npm test -- auth.spec.ts` — all pass.

- [ ] **Step 6: Commit**

```bash
git add frontend/components/auth/auth-nav-actions.tsx frontend/app/page.tsx frontend/app/export/page.tsx frontend/app/review/page.tsx frontend/tests/auth.spec.ts
git commit -m "feat(auth): nav shows Sign in / email + Log out"
```

---

### Task 11: 401/402 handling + quota upgrade prompt; gating E2E

**Files:**
- Modify: `frontend/components/intake/use-wizard.ts:26-68`
- Modify: `frontend/components/intake/wizard-reducer.ts:9-31,114-118`
- Modify: `frontend/components/intake/review-card.tsx:49-56` (renders `state.submitError`; the upgrade prompt goes here)
- Create: `frontend/tests/gating.spec.ts`

**Interfaces:**
- Consumes: `useWizard()` state (Task 9), `stubAuth` (Task 6).
- Produces: a `quotaExceeded` flag on the wizard state surfaced as an upgrade prompt.

- [ ] **Step 1: Write the failing gating test**

Create `frontend/tests/gating.spec.ts`:
```ts
import { test, expect } from "@playwright/test";
import { stubAuth } from "./helpers-auth";
import { walkIntakeWizard } from "./helpers";

test("402 on generate shows the upgrade prompt", async ({ page }) => {
  await stubAuth(page);
  await page.route("**/api/generate", (route) =>
    route.fulfill({
      status: 402,
      contentType: "application/json",
      body: JSON.stringify({
        error: { code: "QUOTA_EXCEEDED", tier: "registered", remaining: 0 },
      }),
    })
  );

  await walkIntakeWizard(page);
  await page.getByRole("button", { name: "Generate BRD" }).click();

  await expect(page.getByText(/used your 3 free BRDs/i)).toBeVisible();
  await expect(page.getByRole("link", { name: /upgrade/i })).toBeVisible();
});
```

- [ ] **Step 2: Run to confirm failure**

Run: `npm test -- gating.spec.ts` — FAILs (no upgrade prompt yet).

- [ ] **Step 3: Handle 401/402 in the generate flow**

In `frontend/components/intake/use-wizard.ts`, replace the `try`/`catch` body of `generate` so it inspects status before the generic error path:
```ts
    try {
      const res = await fetch(apiUrl("/api/generate"), {
        method: "POST",
        headers: await apiHeaders(),
        body: JSON.stringify(brief),
      });

      if (res.status === 401) {
        setGenerating(false);
        router.push(`/login?next=${encodeURIComponent("/intake")}`);
        return;
      }

      if (res.status === 402) {
        dispatch({ type: "QUOTA_EXCEEDED" });
        setGenerating(false);
        return;
      }

      if (!res.ok) {
        const body = await res.text();
        let message = `Server error (${res.status})`;
        try {
          const parsed = JSON.parse(body);
          if (parsed?.error?.message) message = parsed.error.message;
          else if (parsed.detail) message = parsed.detail;
          else if (parsed.message) message = parsed.message;
        } catch {
          // keep generic message
        }
        throw new Error(message);
      }

      const data = await res.json();
      setBRD(data.brd);
      router.push("/review");
    } catch (err: any) {
      dispatch({
        type: "SUBMIT_FAILURE",
        message: err?.message || "Failed to generate BRD. Please try again.",
      });
      setGenerating(false);
    }
```

- [ ] **Step 4: Add the QUOTA_EXCEEDED action to the reducer**

In `frontend/components/intake/wizard-reducer.ts`:
- Add `quotaExceeded: boolean;` to the `WizardState` interface (after `submitError: string;`, line ~17).
- Add `quotaExceeded: false,` to `initialState` (after `submitError: "",`, line ~39).
- Add to the `WizardAction` union (after the `SUBMIT_FAILURE` member, line ~31):
```ts
  | { type: "QUOTA_EXCEEDED" };
```
- Add a case in `reduce` (alongside `SUBMIT_FAILURE`, after line ~118):
```ts
    case "QUOTA_EXCEEDED":
      return { ...state, status: "error", quotaExceeded: true };
```
- In the `BEGIN_SUBMIT` case (line ~115), also clear the flag so a retry resets it:
```ts
    case "BEGIN_SUBMIT":
      return { ...state, status: "submitting", submitError: "", quotaExceeded: false };
```

- [ ] **Step 5: Render the upgrade prompt in review-card.tsx**

In `frontend/components/intake/review-card.tsx`, immediately AFTER the `state.submitError` block (after line 56, before the `<div className="mt-5">` submit button block), add:
```tsx
{state.quotaExceeded ? (
  <div
    role="alert"
    className="mt-4 rounded-lg bg-surface-2 border border-border-strong px-4 py-3"
  >
    <p className="text-body text-ink">You've used your 3 free BRDs.</p>
    <p className="mt-1 text-body-sm text-secondary">
      <a
        href="mailto:hello@nsikak.dev?subject=Upgrade%20Precedent"
        className="text-accent hover:text-accent-hover"
      >
        Upgrade for unlimited generations
      </a>
      .
    </p>
  </div>
) : null}
```
The existing `SUBMIT_FAILURE` path sets a generic `submitError`; the `QUOTA_EXCEEDED` action does NOT set `submitError`, so only this prompt shows on a 402 (no duplicate red error banner).

- [ ] **Step 6: Run the gating test to confirm pass**

Run: `npm test -- gating.spec.ts` — passes.

- [ ] **Step 7: Commit**

```bash
git add frontend/components/intake/use-wizard.ts frontend/components/intake/wizard-reducer.ts frontend/components/intake/ frontend/tests/gating.spec.ts
git commit -m "feat(auth): handle 401/402 on generate; show quota upgrade prompt"
```

---

### Task 12: Full verification + docs

**Files:**
- Modify: `CLAUDE.md` (entrypoint + auth model note)

- [ ] **Step 1: Run the entire frontend suite**

Run (from `frontend/`):
```bash
npm run test:unit && npm run lint && npm run build && npm test
```
Expected: Vitest green, lint clean, build OK, Playwright green (serial). Investigate any failure with systematic-debugging; do not bump Playwright workers (see env gotchas).

- [ ] **Step 2: Run the backend suite**

Run (from `frontend/api/`):
```bash
python -m pytest _lib/tests/ -v -p no:cacheprovider
```
Expected: all pass.

- [ ] **Step 3: Update CLAUDE.md**

Update the "How requests reach Python on Vercel" section to reference `frontend/api/handler.py` (not `[...path].py`) and add a one-line note: "API auth is Supabase JWT verification (`_lib/auth.py::get_current_user`); the old `NEXT_PUBLIC_API_SECRET_KEY` is retired. `/generate` consumes a per-user quota via the `consume_quota` Postgres RPC." Update the `requirements.txt` path reference to `frontend/api/requirements.txt`.

- [ ] **Step 4: Commit**

```bash
git add CLAUDE.md
git commit -m "docs(auth): document handler.py entrypoint + Supabase auth model"
```

- [ ] **Step 5: Hand off for security assessment**

Do NOT push. Surface to the user that the branch is ready for the security assessment described in the spec (JWT verification correctness, RLS, `consume_quota` atomicity, service-role key never client-exposed, cookie flags, open-redirect prevention, rate-limiting, throwaway-email abuse). Pushes remain held until that assessment is complete.

---

## Notes carried from the spec / codebase

- **Subscribed = unlimited is unreachable until payments (#4).** For testing, flip `profiles.is_subscribed = true` manually in the Supabase dashboard.
- **Run Playwright via `npm test`, never `npx playwright test`** (dual-instance error — see env gotchas). The suite runs serial (`workers: 1`).
- **Playwright defaults to `colorScheme: light`** — irrelevant here but don't add theme assumptions to auth specs.
- **The 12-section contract is untouched** by this plan; do not edit `SECTION_SCHEMAS` or the renderer.
- **HS256 vs asymmetric JWTs:** the spec mandates HS256 with `SUPABASE_JWT_SECRET`. If the Supabase project is later switched to asymmetric (ES256/RS256) signing keys, `get_current_user` must move to JWKS verification — out of scope here.
