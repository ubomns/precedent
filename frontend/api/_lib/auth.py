import os

import jwt
from fastapi import HTTPException, Request, status

# Asymmetric JWT verification. Supabase signs access tokens with an asymmetric key
# (P-256 / ES256 by default) and publishes the public keys at the project's JWKS
# endpoint. We verify the signature locally against those public keys — no shared
# secret, no round-trip to the auth server. The JWKS is fetched once and cached by
# PyJWKClient (instance reuse on Fluid Compute keeps it warm).
_ALGORITHMS = ["ES256", "RS256"]

_jwk_client = None


def _auth_base() -> str | None:
    base = os.getenv("SUPABASE_URL") or os.getenv("NEXT_PUBLIC_SUPABASE_URL")
    return base.rstrip("/") if base else None


def _jwks_url() -> str | None:
    base = _auth_base()
    if not base:
        return None
    return f"{base}/auth/v1/.well-known/jwks.json"


def _expected_issuer() -> str | None:
    base = _auth_base()
    return f"{base}/auth/v1" if base else None


def _get_jwk_client():
    """Lazily construct (and cache) the JWKS client. Returns None if unconfigured."""
    global _jwk_client
    if _jwk_client is None:
        url = _jwks_url()
        if url:
            _jwk_client = jwt.PyJWKClient(url)
    return _jwk_client


async def get_current_user(request: Request) -> dict:
    """Verify the Supabase access token and return the authenticated user.

    Reads `Authorization: Bearer <token>`, verifies the asymmetric signature
    against the project's JWKS public keys, checks expiry and the `authenticated`
    audience, and returns {"user_id": <sub>, "claims": <payload>}. Raises 401 on
    any auth failure, 500 if the server is not configured (SUPABASE_URL unset).
    """
    auth_header = request.headers.get("Authorization", "")
    if not auth_header.startswith("Bearer "):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Missing or invalid Authorization header",
        )

    client = _get_jwk_client()
    if client is None:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Server authentication is not configured",
        )

    token = auth_header[7:]
    try:
        signing_key = client.get_signing_key_from_jwt(token)
        decode_kwargs = {
            "algorithms": _ALGORITHMS,
            "audience": "authenticated",
            # Defense in depth: require an expiry and pin the issuer to this project's
            # auth server so a validly-signed token from elsewhere can't be replayed.
            "options": {"require": ["exp", "aud", "sub"]},
        }
        issuer = _expected_issuer()
        if issuer:
            decode_kwargs["issuer"] = issuer
        payload = jwt.decode(token, signing_key.key, **decode_kwargs)
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
