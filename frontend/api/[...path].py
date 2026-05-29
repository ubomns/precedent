"""Vercel Python ASGI catch-all entry point.

Vercel's filesystem routing maps any request to /api/* to this file
(the [...path] segment is a catch-all). The original request URL is
preserved in the ASGI scope, so FastAPI routes mounted with the /api
prefix in _lib/routers/* match directly.
"""
from pathlib import Path
import sys

sys.path.insert(0, str(Path(__file__).parent))

from _lib.main import app  # noqa: E402
