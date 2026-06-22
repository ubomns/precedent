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


def test_generate_releases_quota_on_fan_out_failure(monkeypatch):
    """Quota consumed before fan-out → release_quota called when fan-out raises."""
    released_calls = []

    async def fake_consume(user_id):
        assert user_id == "user-123"
        return {"allowed": True, "remaining": 2, "tier": "registered"}

    async def fake_release(user_id):
        released_calls.append(user_id)
        return {"released": True}

    async def failing_draft_section(section_name, brief):
        raise RuntimeError("OpenAI 429 – rate limit exceeded")

    monkeypatch.setattr(generate_router, "consume_quota", fake_consume)
    monkeypatch.setattr(generate_router, "release_quota", fake_release)
    monkeypatch.setattr(generate_router, "draft_section", failing_draft_section)

    resp = client.post("/api/generate", json=_brief(), headers=_auth())
    assert resp.status_code == 500
    assert released_calls == ["user-123"]
