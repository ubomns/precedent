import os

import jwt
from fastapi import HTTPException, Request, status

SUPABASE_JWT_SECRET = os.getenv("SUPABASE_JWT_SECRET")


async def get_current_user(request: Request) -> dict:
    """Verify the Supabase access token and return the authenticated user.

    Reads `Authorization: Bearer <token>`, verifies the HS256 signature with
    SUPABASE_JWT_SECRET, checks expiry and the `authenticated` audience, and
    returns {"user_id": <sub>, "claims": <payload>}. Raises 401 on any failure.
    """
    auth_header = request.headers.get("Authorization", "")
    if not auth_header.startswith("Bearer "):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Missing or invalid Authorization header",
        )

    secret = os.getenv("SUPABASE_JWT_SECRET", SUPABASE_JWT_SECRET)
    if not secret:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Server authentication is not configured",
        )

    token = auth_header[7:]
    try:
        payload = jwt.decode(
            token,
            secret,
            algorithms=["HS256"],
            audience="authenticated",
        )
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
