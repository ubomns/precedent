"""Stripe billing scaffold.

SCAFFOLD ONLY — a portfolio demo, not hardened billing. It implements the standard
Checkout + Customer Portal + webhook flow:

  - checkout: create/reuse a Stripe customer for the user, open a subscription
    Checkout Session for the Pro price.
  - portal: open the Stripe Customer Portal so the user can manage / cancel.
  - webhook: on subscription activation flip profiles.is_subscribed = true (the quota
    RPCs already read that column → unlimited); on cancellation flip it back.

Requires env: STRIPE_SECRET_KEY, STRIPE_PRICE_PRO (recurring price id), and
STRIPE_WEBHOOK_SECRET (for signature verification). When unset, is_configured() is
False and the routes return 503 so the rest of the app keeps working.
"""
import asyncio
import os
from urllib.parse import quote

import httpx
import stripe

from _lib.services.quota import _supabase_config, _supabase_rpc_headers


def _stripe_key() -> str | None:
    return os.getenv("STRIPE_SECRET_KEY")


def _price_pro() -> str | None:
    return os.getenv("STRIPE_PRICE_PRO")


def _webhook_secret() -> str | None:
    return os.getenv("STRIPE_WEBHOOK_SECRET")


def is_configured() -> bool:
    return bool(_stripe_key() and _price_pro())


def _client() -> stripe.StripeClient:
    return stripe.StripeClient(api_key=_stripe_key() or "")


# ── Supabase profile helpers (service-role PostgREST; bypasses RLS) ──────────────
async def _patch_profile(user_id: str, body: dict) -> None:
    base, secret_key = _supabase_config()
    headers = {**_supabase_rpc_headers(secret_key), "Prefer": "return=minimal"}
    url = f"{base}/rest/v1/profiles?user_id=eq.{quote(user_id, safe='')}"
    async with httpx.AsyncClient(timeout=10.0) as client:
        resp = await client.patch(url, headers=headers, json=body)
    resp.raise_for_status()


async def get_profile(user_id: str) -> dict | None:
    base, secret_key = _supabase_config()
    headers = _supabase_rpc_headers(secret_key)
    url = (
        f"{base}/rest/v1/profiles"
        f"?user_id=eq.{quote(user_id, safe='')}&select=is_subscribed,stripe_customer_id"
    )
    async with httpx.AsyncClient(timeout=10.0) as client:
        resp = await client.get(url, headers=headers)
    resp.raise_for_status()
    rows = resp.json()
    return rows[0] if rows else None


async def _user_id_for_customer(customer_id: str) -> str | None:
    base, secret_key = _supabase_config()
    headers = _supabase_rpc_headers(secret_key)
    url = (
        f"{base}/rest/v1/profiles"
        f"?stripe_customer_id=eq.{quote(customer_id, safe='')}&select=user_id"
    )
    async with httpx.AsyncClient(timeout=10.0) as client:
        resp = await client.get(url, headers=headers)
    resp.raise_for_status()
    rows = resp.json()
    return rows[0]["user_id"] if rows else None


# ── Stripe operations (SDK is sync → run off the event loop) ─────────────────────
async def _ensure_customer(user_id: str, email: str | None) -> str:
    profile = await get_profile(user_id)
    if profile and profile.get("stripe_customer_id"):
        return profile["stripe_customer_id"]

    def _create() -> str:
        customer = _client().customers.create(
            params={"email": email, "metadata": {"user_id": user_id}}
        )
        return customer.id

    customer_id = await asyncio.to_thread(_create)
    await _patch_profile(user_id, {"stripe_customer_id": customer_id})
    return customer_id


async def create_checkout_url(user_id: str, email: str | None, origin: str) -> str:
    customer_id = await _ensure_customer(user_id, email)

    def _create() -> str:
        session = _client().checkout.sessions.create(
            params={
                "mode": "subscription",
                "customer": customer_id,
                "client_reference_id": user_id,
                "line_items": [{"price": _price_pro(), "quantity": 1}],
                "success_url": f"{origin}/account?checkout=success",
                "cancel_url": f"{origin}/account?checkout=cancelled",
                "subscription_data": {"metadata": {"user_id": user_id}},
            }
        )
        return session.url

    return await asyncio.to_thread(_create)


async def create_portal_url(user_id: str, origin: str) -> str:
    profile = await get_profile(user_id)
    customer_id = profile and profile.get("stripe_customer_id")
    if not customer_id:
        raise ValueError("No Stripe customer for this user yet.")

    def _create() -> str:
        session = _client().billing_portal.sessions.create(
            params={"customer": customer_id, "return_url": f"{origin}/account"}
        )
        return session.url

    return await asyncio.to_thread(_create)


def construct_event(payload: bytes, sig_header: str) -> stripe.Event:
    """Verify the Stripe signature and return the event. Raises ValueError /
    stripe.SignatureVerificationError on a missing secret or a bad signature."""
    secret = _webhook_secret()
    if not secret:
        raise ValueError("Webhook secret not configured.")
    return stripe.Webhook.construct_event(payload, sig_header, secret)


async def apply_subscription_event(event: stripe.Event) -> None:
    """Flip profiles.is_subscribed based on a verified subscription lifecycle event."""
    etype = event["type"]
    obj = event["data"]["object"]

    if etype == "checkout.session.completed":
        user_id = obj.get("client_reference_id")
        customer_id = obj.get("customer")
        if user_id:
            body = {"is_subscribed": True}
            if customer_id:
                body["stripe_customer_id"] = customer_id
            await _patch_profile(user_id, body)
        return

    if etype in ("customer.subscription.updated", "customer.subscription.deleted"):
        # Resolve the user from metadata first, else by stored customer id.
        user_id = (obj.get("metadata") or {}).get("user_id")
        if not user_id and obj.get("customer"):
            user_id = await _user_id_for_customer(obj["customer"])
        if not user_id:
            return
        active = etype == "customer.subscription.updated" and obj.get("status") in (
            "active",
            "trialing",
        )
        await _patch_profile(user_id, {"is_subscribed": bool(active)})
