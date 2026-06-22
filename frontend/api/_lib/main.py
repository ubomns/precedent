import os
from pathlib import Path

from dotenv import load_dotenv
from fastapi import Depends, FastAPI, HTTPException, Request, status
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
from slowapi.errors import RateLimitExceeded
from slowapi.middleware import SlowAPIMiddleware
from starlette.middleware.base import BaseHTTPMiddleware

from _lib.auth import get_current_user
from _lib.limiter import limiter
from _lib.routers import export, generate

# Load environment variables from a single deterministic path.
env_path = Path(__file__).resolve().parent.parent / ".env"
if env_path.exists():
    load_dotenv(env_path)

DEFAULT_ORIGINS = "https://precedent.app,http://localhost:3000,http://localhost:3001"
ALLOWED_ORIGINS = [
    origin.strip()
    for origin in os.getenv("ALLOWED_ORIGINS", DEFAULT_ORIGINS).split(",")
    if origin.strip()
]

app = FastAPI(title="Precedent API", version="1.0.0")

app.state.limiter = limiter
# Apply the limiter's default_limits to every route (decorated routes keep their
# stricter per-route limits; the tightest applicable limit wins).
app.add_middleware(SlowAPIMiddleware)


@app.exception_handler(HTTPException)
async def http_exception_handler(request: Request, exc: HTTPException):
    """Return a consistent error shape for all HTTP exceptions."""
    return JSONResponse(
        status_code=exc.status_code,
        content={"error": {"code": str(exc.status_code), "message": exc.detail}},
    )


@app.exception_handler(RateLimitExceeded)
async def rate_limit_handler(request: Request, exc: RateLimitExceeded):
    return JSONResponse(
        status_code=status.HTTP_429_TOO_MANY_REQUESTS,
        content={
            "error": {
                "code": "RATE_LIMIT_EXCEEDED",
                "message": "Rate limit exceeded. Please slow down.",
            }
        },
    )


class MaxBodySizeMiddleware(BaseHTTPMiddleware):
    """Reject request bodies larger than the configured limit."""

    def __init__(self, app, max_size_bytes: int):
        super().__init__(app)
        self.max_size_bytes = max_size_bytes

    async def dispatch(self, request: Request, call_next):
        if request.method in ("POST", "PUT", "PATCH"):
            content_length = request.headers.get("content-length")
            if content_length and int(content_length) > self.max_size_bytes:
                return JSONResponse(
                    status_code=status.HTTP_413_REQUEST_ENTITY_TOO_LARGE,
                    content={
                        "error": {
                            "code": "PAYLOAD_TOO_LARGE",
                            "message": "Request body exceeds maximum allowed size.",
                        }
                    },
                )
        return await call_next(request)


app.add_middleware(MaxBodySizeMiddleware, max_size_bytes=2 * 1024 * 1024)

app.add_middleware(
    CORSMiddleware,
    allow_origins=ALLOWED_ORIGINS,
    allow_credentials=False,
    allow_methods=["GET", "POST", "OPTIONS"],
    allow_headers=["Authorization", "Content-Type"],
)


@app.get("/")
async def root():
    return {"message": "Precedent API is running."}


app.include_router(
    generate.router,
    prefix="/api",
    tags=["generate"],
    dependencies=[Depends(get_current_user)],
)
app.include_router(
    export.router,
    prefix="/api",
    tags=["export"],
    dependencies=[Depends(get_current_user)],
)
