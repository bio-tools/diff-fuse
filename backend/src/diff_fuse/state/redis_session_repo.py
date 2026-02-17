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
from redis.exceptions import WatchError

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


    def save(self, session: Session) -> Session:
        """
        Update an existing session in Redis.

        Parameters
        ----------
        session : Session
            The session instance to update. Must have a valid session_id.

        Returns
        -------
        Session
            The updated session instance.
        """
        session.updated_at = datetime.now(UTC)
        self._r.set(self._key(session.session_id), session.model_dump_json(), ex=self._ttl)
        return session


    def mutate(self, session_id: str, fn):
        """
        Atomically fetch and update a session.

        Parameters
        ----------
        session_id : str
            Session identifier.
        fn : Callable[[Session], Session]
            A function that takes the current session state and returns an updated session.

        Returns
        -------
        Session | None
            The updated session if it exists; otherwise None.

        Notes
        -----
        This method uses Redis transactions to ensure atomicity. It retries a few times
        if concurrent modifications are detected. If the session does not exist,
        it returns None without calling the function.
        """
        key = self._key(session_id)

        for _ in range(5):  # small retry loop
            with self._r.pipeline() as pipe:
                try:
                    pipe.watch(key)
                    raw = pipe.get(key)
                    if raw is None:
                        pipe.unwatch()
                        return None
                    if isinstance(raw, bytes):
                        raw = raw.decode("utf-8")

                    session = Session.model_validate_json(raw)
                    session = fn(session)
                    session.updated_at = datetime.now(UTC)

                    pipe.multi()
                    pipe.set(key, session.model_dump_json(), ex=self._ttl)
                    pipe.execute()
                    return session
                except WatchError:
                    # someone else updated it, retry
                    continue

        raise RuntimeError("Failed to update session due to repeated concurrent modifications")


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
