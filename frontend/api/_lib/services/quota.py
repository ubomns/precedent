import os
from urllib.parse import quote

import httpx

# Registered free-tier lifetime generation limit. Mirrors consume_quota's v_limit in
# the Postgres migration; the RPC remains the enforcement authority — this constant is
# only for read-only display (e.g. the /account "X of 10 used" counter).
QUOTA_FREE_LIMIT = 10


def _supabase_rpc_headers(secret_key: str) -> dict:
    return {
        "apikey": secret_key,
        "Authorization": f"Bearer {secret_key}",
        "Content-Type": "application/json",
    }


def _supabase_config() -> tuple[str, str]:
    # SUPABASE_SECRET_KEY (sb_secret_...) is the new server-only key; it authorizes
    # as the service_role Postgres role (BYPASSRLS), which is what the RPCs need.
    base = os.getenv("SUPABASE_URL") or os.getenv("NEXT_PUBLIC_SUPABASE_URL")
    secret_key = os.getenv("SUPABASE_SECRET_KEY")
    if not base or not secret_key:
        raise RuntimeError("Supabase service configuration is missing")
    return base.rstrip("/"), secret_key


async def consume_quota(user_id: str) -> dict:
    """Atomically check + consume one generation for the user via the Postgres RPC.

    Returns {"allowed": bool, "remaining": int, "tier": str}. Uses the Supabase
    secret key (server-only) so it bypasses RLS. Raises on transport/HTTP error.
    """
    base, secret_key = _supabase_config()
    url = f"{base}/rest/v1/rpc/consume_quota"
    async with httpx.AsyncClient(timeout=10.0) as client:
        resp = await client.post(
            url,
            headers=_supabase_rpc_headers(secret_key),
            json={"p_user_id": user_id},
        )
    resp.raise_for_status()
    return resp.json()


async def consume_refinement(user_id: str) -> dict:
    """Atomically check + consume one refinement op (critique / regenerate / apply) via RPC.

    Refinements are LLM-backed and metered separately from the lifetime generation
    quota: a per-user DAILY cap (free tier) bounds OpenAI cost without eating into
    the "10 BRDs included" allowance. Returns {"allowed": bool, "remaining": int,
    "tier": str}. Uses the Supabase secret key (server-only) so it bypasses RLS.
    Raises on transport/HTTP error.
    """
    base, secret_key = _supabase_config()
    url = f"{base}/rest/v1/rpc/consume_refinement"
    async with httpx.AsyncClient(timeout=10.0) as client:
        resp = await client.post(
            url,
            headers=_supabase_rpc_headers(secret_key),
            json={"p_user_id": user_id},
        )
    resp.raise_for_status()
    return resp.json()


async def get_generation_count(user_id: str) -> int:
    """Read-only: how many BRDs this user has generated (the lifetime quota is count-based).

    Uses PostgREST's exact-count header so we don't transfer the rows themselves. Uses the
    Supabase secret key (server-only, bypasses RLS). Raises on transport/HTTP error.
    """
    base, secret_key = _supabase_config()
    headers = {**_supabase_rpc_headers(secret_key), "Prefer": "count=exact"}
    url = (
        f"{base}/rest/v1/brd_generations"
        f"?user_id=eq.{quote(user_id, safe='')}&select=id&limit=1"
    )
    async with httpx.AsyncClient(timeout=10.0) as client:
        resp = await client.get(url, headers=headers)
    resp.raise_for_status()
    # Content-Range looks like "0-0/<total>" (or "*/<total>" when empty).
    content_range = resp.headers.get("content-range", "")
    total = content_range.split("/")[-1] if "/" in content_range else ""
    if total.isdigit():
        return int(total)
    return len(resp.json())


async def release_quota(user_id: str) -> dict:
    """Compensating action: refund one consumed generation if drafting fails after consume_quota.

    Advisory-locked per-user (same key as consume_quota) so it serializes with consumes.
    Returns {"released": bool}. Uses the Supabase secret key (server-only).
    Raises on transport/HTTP error.
    """
    base, secret_key = _supabase_config()
    url = f"{base}/rest/v1/rpc/release_quota"
    async with httpx.AsyncClient(timeout=10.0) as client:
        resp = await client.post(
            url,
            headers=_supabase_rpc_headers(secret_key),
            json={"p_user_id": user_id},
        )
    resp.raise_for_status()
    return resp.json()
