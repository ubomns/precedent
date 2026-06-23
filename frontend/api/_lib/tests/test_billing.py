import pytest
from fastapi.testclient import TestClient

from _lib.main import app
from _lib.auth import get_current_user

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
