"""Vercel Python serverless entry point.

A vercel.json rewrite sends every /api/* request to this file. Vercel
preserves the original request URL on the function side, so FastAPI
inside sees /api/generate, /api/critique, etc. and routes mounted with
prefix="/api" in _lib/routers/* match directly.
"""
from pathlib import Path
import sys

sys.path.insert(0, str(Path(__file__).parent))

from _lib.main import app  # noqa: E402
