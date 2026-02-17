"""
Redis-backed session repository.

This module provides a distributed implementation of the session storage
interface using Redis. It is intended for production deployments where
multiple application instances must share session state.

Design characteristics
----------------------
- Each session is stored as a single JSON blob.
- TTL expiration is enforced natively by Redis.
- Sliding expiration is implemented on access.
- No in-process locking is required.
- Safe for horizontally scaled deployments.

Notes
-----
The repository assumes Redis is configured for appropriate memory limits
and eviction policy for the deployment environment.
"""

from __future__ import annotations

from datetime import UTC, datetime
from uuid import uuid4

from redis import Redis

from diff_fuse.models.document import DocumentResult
from diff_fuse.models.session import Session
from diff_fuse.state.session_repo import SessionRepo


class RedisSessionRepo(SessionRepo):
    """
    Redis-backed implementation of :class:`SessionRepo`.

    Sessions are serialized as JSON and stored under a configurable key
    prefix. Redis TTL is used for expiration, and the TTL is refreshed on
    each successful access (sliding expiration).

    Parameters
    ----------
    redis : Redis
        Initialized Redis client instance.
    ttl_seconds : int
        Session time-to-live in seconds.
    key_prefix : str, default="diff-fuse:session:"
        Prefix used for Redis keys.

    Notes
    -----
    Storage model:
    - Key: ``{key_prefix}{session_id}``
    - Value: JSON-serialized :class:`Session`
    - Expiration: Redis TTL

    The entire session is rewritten on each access to update the sliding TTL.
    This is acceptable for moderate payload sizes but may need optimization
    if sessions grow very large.
    """

    def __init__(self, redis: Redis, *, ttl_seconds: int, key_prefix: str = "diff-fuse:session:") -> None:
        """
        Initialize the Redis session repository.

        Parameters
        ----------
        redis : Redis
            Configured Redis client.
        ttl_seconds : int
            Session expiration time in seconds.
        key_prefix : str, default="diff-fuse:session:"
            Redis key namespace prefix.
        """
        self._r = redis
        self._ttl = int(ttl_seconds)
        self._prefix = key_prefix

    def _key(self, session_id: str) -> str:
        """
        Build the Redis key for a session.

        Parameters
        ----------
        session_id : str
            Session identifier.

        Returns
        -------
        str
            Redis key.
        """
        return f"{self._prefix}{session_id}"

    def create(self, *, documents_results: list[DocumentResult]) -> Session:
        """
        Create and persist a new session.

        Parameters
        ----------
        documents_results : list[DocumentResult]
            Parsed/normalized document results.

        Returns
        -------
        Session
            Newly created session.

        Notes
        -----
        The session is immediately written to Redis with the configured TTL.
        """
        now = datetime.now(UTC)
        sid = uuid4().hex

        session = Session(
            session_id=sid,
            created_at=now,
            updated_at=now,
            documents_results=documents_results,
        )

        self._r.set(self._key(sid), session.model_dump_json(), ex=self._ttl)
        return session

    def get(self, session_id: str) -> Session | None:
        """
        Retrieve a session from Redis.

        Parameters
        ----------
        session_id : str
            Session identifier.

        Returns
        -------
        Session | None
            The session if found; otherwise None.

        Notes
        -----
        Behavior:

        - Missing key -> returns None
        - Existing key -> TTL is refreshed (sliding expiration)
        - ``updated_at`` timestamp is updated on each access
        """
        raw = self._r.get(self._key(session_id))
        if raw is None:
            return None

        # redis-py may return bytes depending on decode_responses
        if isinstance(raw, bytes):
            raw = raw.decode("utf-8")

        session = Session.model_validate_json(raw)

        # Sliding expiration
        session.updated_at = datetime.now(UTC)
        self._r.set(self._key(session_id), session.model_dump_json(), ex=self._ttl)

        return session

    def cleanup(self) -> int:
        """
        Perform repository cleanup.

        Returns
        -------
        int
            Always returns 0.

        Notes
        -----
        Redis handles TTL expiration automatically, so no manual cleanup
        is required for this backend.
        """
        # Redis handles TTL expiry; nothing to do here.
        return 0
