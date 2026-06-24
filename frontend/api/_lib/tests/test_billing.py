import pytest
from fastapi.testclient import TestClient

from _lib.main import app
from _lib.auth import get_current_user
from _lib.services import billing, quota

client = TestClient(app)


@pytest.fixture
def authed():
    app.dependency_overrides[get_current_user] = lambda: {
        "user_id": "user-123",
        "claims": {"email": "a@b.co"},
    }
    yield
    app.dependency_overrides.pop(get_current_user, None)


def test_checkout_401_without_token():
    # Per-route auth: no Authorization header → 401 before any Stripe/Supabase work.
    assert client.post("/api/billing/checkout").status_code == 401


def test_portal_401_without_token():
    assert client.post("/api/billing/portal").status_code == 401


def test_checkout_503_when_billing_unconfigured(authed, monkeypatch):
    monkeypatch.delenv("STRIPE_SECRET_KEY", raising=False)
    monkeypatch.delenv("STRIPE_PRICE_PRO", raising=False)
    assert client.post("/api/billing/checkout").status_code == 503


def test_status_reports_free_tier_usage(authed, monkeypatch):
    # Free user who has generated 3 of 10 → 7 remaining.
    async def fake_profile(uid):
        return {"is_subscribed": False}

    async def fake_count(uid):
        return 3

    monkeypatch.setattr(billing, "get_profile", fake_profile)
    monkeypatch.setattr(quota, "get_generation_count", fake_count)

    body = client.get("/api/billing/status").json()
    assert body["tier"] == "registered"
    assert body["free_limit"] == 10
    assert body["generations_used"] == 3
    assert body["generations_remaining"] == 7


def test_status_subscribed_has_no_remaining(authed, monkeypatch):
    async def fake_profile(uid):
        return {"is_subscribed": True}

    async def fake_count(uid):
        return 42

    monkeypatch.setattr(billing, "get_profile", fake_profile)
    monkeypatch.setattr(quota, "get_generation_count", fake_count)

    body = client.get("/api/billing/status").json()
    assert body["is_subscribed"] is True
    assert body["generations_remaining"] is None
    assert body["generations_used"] == 42


def test_webhook_400_on_bad_signature(monkeypatch):
    # Webhook is unauthenticated (Stripe-signed). A bad/unconfigured signature → 400,
    # never a 500.
    monkeypatch.delenv("STRIPE_WEBHOOK_SECRET", raising=False)
    resp = client.post(
        "/api/billing/webhook",
        content=b"{}",
        headers={"stripe-signature": "t=1,v1=bogus"},
    )
    assert resp.status_code == 400
