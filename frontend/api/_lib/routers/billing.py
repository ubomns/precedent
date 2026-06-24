"""Billing routes (Stripe scaffold).

Mounted WITHOUT the router-level JWT dependency that protects generate/export, because
the Stripe webhook is called by Stripe (no Supabase token) and is authenticated by its
signature instead. checkout / portal / status enforce auth per-route.
"""
import logging

import stripe
from fastapi import APIRouter, Depends, HTTPException, Request, status
from fastapi.responses import JSONResponse

from _lib.auth import get_current_user
from _lib.limiter import limiter
from _lib.services import billing, quota

router = APIRouter()


def _origin(request: Request) -> str:
    return request.headers.get("origin") or str(request.base_url).rstrip("/")


def _require_configured() -> None:
    if not billing.is_configured():
        raise HTTPException(
            status_code=status.HTTP_503_SERVICE_UNAVAILABLE,
            detail="Billing is not configured.",
        )


@router.post("/billing/checkout")
@limiter.limit("10/minute")
async def checkout(request: Request, current_user: dict = Depends(get_current_user)):
    """Create a Stripe Checkout Session for the Pro subscription; returns its URL."""
    _require_configured()
    try:
        email = (current_user.get("claims") or {}).get("email")
        url = await billing.create_checkout_url(
            current_user["user_id"], email, _origin(request)
        )
        return {"url": url}
    except Exception:
        logging.exception("Stripe checkout creation failed")
        raise HTTPException(status_code=500, detail="Could not start checkout.")


@router.post("/billing/portal")
@limiter.limit("10/minute")
async def portal(request: Request, current_user: dict = Depends(get_current_user)):
    """Create a Stripe Customer Portal session; returns its URL."""
    _require_configured()
    try:
        url = await billing.create_portal_url(current_user["user_id"], _origin(request))
        return {"url": url}
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))
    except Exception:
        logging.exception("Stripe portal creation failed")
        raise HTTPException(status_code=500, detail="Could not open billing portal.")


@router.get("/billing/status")
async def billing_status(request: Request, current_user: dict = Depends(get_current_user)):
    """Current plan + usage for the signed-in user (drives the /account page)."""
    user_id = current_user["user_id"]
    profile = await billing.get_profile(user_id)
    is_subscribed = bool(profile and profile.get("is_subscribed"))

    # Free tier shows a "X of N used" counter; subscribed is unlimited so the count is
    # informational only and we don't compute a remaining value.
    used = await quota.get_generation_count(user_id)
    remaining = None if is_subscribed else max(quota.QUOTA_FREE_LIMIT - used, 0)

    return {
        "tier": "subscribed" if is_subscribed else "registered",
        "is_subscribed": is_subscribed,
        "free_limit": quota.QUOTA_FREE_LIMIT,
        "generations_used": used,
        "generations_remaining": remaining,
        "billing_configured": billing.is_configured(),
    }


@router.post("/billing/webhook")
async def webhook(request: Request):
    """Stripe webhook. Verifies the signature, then flips profiles.is_subscribed."""
    payload = await request.body()
    sig = request.headers.get("stripe-signature", "")
    try:
        event = billing.construct_event(payload, sig)
    except (ValueError, stripe.SignatureVerificationError):
        # Bad payload or signature → reject.
        return JSONResponse(status_code=400, content={"error": "invalid signature"})

    try:
        await billing.apply_subscription_event(event)
    except Exception:
        logging.exception("Failed to apply Stripe event %s", event.get("type"))
        # 200 anyway so Stripe doesn't hammer retries on a downstream blip; the event
        # type is logged for manual reconciliation. (Harden later.)
    return {"received": True}
