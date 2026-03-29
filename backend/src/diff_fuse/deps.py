"""
Session repository dependency wiring.

This module provides the application-wide factory for obtaining the
configured :class:`SessionRepo` implementation.

Backend selection
-----------------
The repository is chosen using the following settings:
- ``session_backend = "memory"``
    -> :class:`MemorySessionRepo`
- ``session_backend = "redis"``
    -> :class:`RedisSessionRepo`

In the ``prod`` environment, Redis is required to avoid data loss and
multi-instance inconsistencies.

Warnings
--------
The in-memory backend is **not safe** for multi-instance deployments.
Always use Redis in production.
"""

from __future__ import annotations

from redis import Redis

from diff_fuse.settings import get_settings
from diff_fuse.state.memory_session_repo import MemorySessionRepo
from diff_fuse.state.redis_session_repo import RedisSessionRepo
from diff_fuse.state.session_repo import SessionRepo

_repo: SessionRepo | None = None


def get_session_repo() -> SessionRepo:
    """
    Return the configured session repository singleton.

    The repository implementation is selected based on application
    settings and constructed lazily on first call.

    Returns
    -------
    SessionRepo
        The active session repository implementation.

    Raises
    ------
    RuntimeError
        If the application is running in production environment but the
        session backend is not Redis;
        If multiple Uvicorn workers are configured but the session backend
        is not Redis.
    """
    global _repo
    if _repo is not None:
        return _repo

    s = get_settings()

    # Safety guard: never allow memory sessions in prod
    if s.environment == "prod" and s.session_backend != "redis":
        raise RuntimeError("In production you must use Redis sessions (DIFF_FUSE_SESSION_BACKEND=redis).")

    if s.uvicorn_workers > 1 and s.session_backend != "redis":
        raise RuntimeError("Multiple workers require Redis sessions.")

    if s.session_backend == "redis":
        # decode_responses=False is fine; handled downstream
        r = Redis.from_url(s.redis_url)
        _repo = RedisSessionRepo(
            r,
            ttl_seconds=s.session_ttl_seconds,
            key_prefix=s.redis_key_prefix,
        )
    else:
        _repo = MemorySessionRepo(ttl_seconds=s.session_ttl_seconds)

    return _repo
