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
