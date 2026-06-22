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
