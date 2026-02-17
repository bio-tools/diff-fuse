from __future__ import annotations

from redis import Redis

from diff_fuse.settings import get_settings
from diff_fuse.state.memory_session_repo import MemorySessionRepo
from diff_fuse.state.redis_session_repo import RedisSessionRepo
from diff_fuse.state.session_repo import SessionRepo

_repo: SessionRepo | None = None


def get_session_repo() -> SessionRepo:
    """
    Return a singleton session repository.

    Notes
    -----
    This keeps construction in one place and makes it easy to swap in tests.
    """
    global _repo
    if _repo is not None:
        return _repo

    s = get_settings()

    if s.environment == "prod" and s.session_backend != "redis":
        raise RuntimeError("In production you must use Redis sessions (DIFF_FUSE_SESSION_BACKEND=redis).")

    if s.session_backend == "redis":
        r = Redis.from_url(s.redis_url)  # decode_responses False is fine; handled
        _repo = RedisSessionRepo(r, ttl_seconds=s.session_ttl_seconds, key_prefix=s.redis_key_prefix)
    else:
        _repo = MemorySessionRepo(ttl_seconds=s.session_ttl_seconds)

    return _repo
