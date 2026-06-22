import os

from slowapi import Limiter
from slowapi.util import get_remote_address

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

limiter = Limiter(
    key_func=get_remote_address,
    default_limits=["30/minute"],
    storage_uri=RATE_LIMIT_STORAGE_URI,
)
