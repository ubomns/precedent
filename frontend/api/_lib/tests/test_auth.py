import time

import jwt
import pytest
from cryptography.hazmat.primitives.asymmetric import ec
from fastapi import Request

import _lib.auth as auth
from _lib.auth import get_current_user

# A throwaway P-256 keypair: we sign test tokens with the private key and verify
# them against the public key (served via a faked JWKS client, so no network).
_private_key = ec.generate_private_key(ec.SECP256R1())
_public_key = _private_key.public_key()


class _FakeSigningKey:
    def __init__(self, key):
        self.key = key


class _FakeJWKClient:
    def get_signing_key_from_jwt(self, token):
        return _FakeSigningKey(_public_key)


@pytest.fixture(autouse=True)
def _patch_jwks(monkeypatch):
    # By default, tests run with a JWKS client that returns our test public key.
    monkeypatch.setattr(auth, "_get_jwk_client", lambda: _FakeJWKClient())


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
    return jwt.encode(payload, _private_key, algorithm="ES256")


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


@pytest.mark.asyncio
async def test_unconfigured_jwks_500(monkeypatch):
    # No JWKS client (SUPABASE_URL unset) → 500, not a bypass.
    monkeypatch.setattr(auth, "_get_jwk_client", lambda: None)
    with pytest.raises(Exception) as exc:
        await get_current_user(_request(f"Bearer {_token()}"))
    assert getattr(exc.value, "status_code", None) == 500
