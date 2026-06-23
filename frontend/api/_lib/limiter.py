import os

import jwt
from slowapi import Limiter
from slowapi.util import get_remote_address
from starlette.requests import Request

# Storage backend for rate-limit counters. Defaults to in-process memory, which on
# Vercel serverless / Fluid Compute is PER-INSTANCE (each instance counts separately),
# so limits are only best-effort there. Set RATE_LIMIT_STORAGE_URI to a shared store
# (e.g. an Upstash Redis "rediss://default:<token>@<host>:<port>" URL provisioned via
# the Vercel Marketplace) for a true global cap across instances.
RATE_LIMIT_STORAGE_URI = (
    os.getenv("RATE_LIMIT_STORAGE_URI")
    or os.getenv("REDIS_URL")
    or "memory://"
)

def _rate_limit_key(request: Request) -> str:
    """Rate-limit per authenticated user when a bearer token is present, else per IP.

    The token's `sub` is read WITHOUT signature verification — that is intentional and
    safe here: real authentication/authorization is enforced separately by
    `auth.get_current_user`. Keying on the user id (rather than the client IP) stops an
    attacker from multiplying their effective quota by rotating source IPs.
    """
    auth_header = request.headers.get("Authorization", "")
    if auth_header.startswith("Bearer "):
        try:
            claims = jwt.decode(
                auth_header[7:], options={"verify_signature": False}
            )
            sub = claims.get("sub")
            if sub:
                return f"user:{sub}"
        except jwt.PyJWTError:
            pass
    return get_remote_address(request)


limiter = Limiter(
    key_func=_rate_limit_key,
    default_limits=["30/minute"],
    storage_uri=RATE_LIMIT_STORAGE_URI,
)
