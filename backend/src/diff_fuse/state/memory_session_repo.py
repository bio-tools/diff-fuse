"""
In-memory session repository.

This module provides a simple in-process implementation of the session
storage interface. It is intended primarily for local development.
It is **not suitable for multi-instance production deployments**, because
each process maintains its own isolated memory state.

Design characteristics
----------------------
- Thread-safe via a single global lock.
- TTL-based expiration checked lazily on access and during cleanup.
- No persistence across process restarts.
- O(1) access by session id.

For production environments, prefer a distributed backend (e.g., Redis).
"""

from datetime import UTC, datetime, timedelta
from threading import Lock
from uuid import uuid4

from diff_fuse.models.document import DocumentResult
from diff_fuse.models.session import Session
from diff_fuse.state.session_repo import SessionRepo


class MemorySessionRepo(SessionRepo):
    """
    In-memory implementation of :class:`SessionRepo`.

    This repository stores all sessions in a local dictionary protected by
    a thread lock. Sessions expire after a configurable TTL.

    Parameters
    ----------
    ttl_seconds : int, default=3600
        Time-to-live for sessions in seconds. Expiration is enforced lazily
        on access and during explicit cleanup calls.

    Notes
    -----
    Limitations:
    - Not safe for multi-instance deployments (each process has its own memory).
    - Not persistent (sessions are lost on process restart).
    - Single lock may become a bottleneck under very high concurrency.

    For production workloads, a Redis-backed implementation is recommended.
    """

    def __init__(self, *, ttl_seconds: int = 3600) -> None:
        """
        Initialize the in-memory repository.

        Parameters
        ----------
        ttl_seconds : int, default=3600
            Session expiration time in seconds.
        """
        self._ttl = timedelta(seconds=ttl_seconds)
        self._lock = Lock()
        self._sessions: dict[str, Session] = {}

    def create(self, *, documents_results: list[DocumentResult]) -> Session:
        """
        Create and store a new session.

        Parameters
        ----------
        documents_results : list[DocumentResult]
            Parsed/normalized results corresponding to the input documents.

        Returns
        -------
        Session
            The newly created session instance.
        """
        now = datetime.now(UTC)
        sid = uuid4().hex

        session = Session(
            session_id=sid,
            created_at=now,
            updated_at=now,
            documents_results=documents_results,
        )

        with self._lock:
            self._sessions[sid] = session

        return session

    def get(self, session_id: str) -> Session | None:
        """
        Retrieve a session by id.

        Parameters
        ----------
        session_id : str
            Opaque session identifier.

        Returns
        -------
        Session | None
            The session if it exists and is not expired; otherwise None.

        Notes
        -----
        Behavior:
        - Missing session -> returns None
        - Expired session -> removed and returns None
        - Valid session -> ``updated_at`` is refreshed (sliding TTL)
        """
        now = datetime.now(UTC)

        with self._lock:
            session = self._sessions.get(session_id)
            if session is None:
                return None

            # TTL expiration check
            if now - session.updated_at > self._ttl:
                del self._sessions[session_id]
                return None

            # Sliding expiration
            session.updated_at = now
            return session

    def save(self, session: Session) -> Session:
        """
        Update an existing session.

        Parameters
        ----------
        session : Session
            The session instance to update. Must have a valid session_id.

        Returns
        -------
        Session
            The updated session instance.
        """
        now = datetime.now(UTC)
        session.updated_at = now
        with self._lock:
            self._sessions[session.session_id] = session
        return session

    def mutate(self, session_id: str, fn):
        """
        Atomically fetch and update a session.

        Parameters
        ----------
        session_id : str
            Opaque session identifier.
        fn : Callable[[Session], Session]
            A function that takes the current session and returns an updated session.

        Returns
        -------
        Session | None
            The updated session if it exists; otherwise None.
        """
        with self._lock:
            session = self.get(session_id)  # NOTE: your get() already refreshes TTL/updated_at
            if session is None:
                return None
            session = fn(session)
            self._sessions[session_id] = session
            return session

    def cleanup(self) -> int:
        """
        Remove expired sessions.

        Returns
        -------
        int
            Number of sessions removed.
        """
        now = datetime.now(UTC)
        removed = 0

        with self._lock:
            for sid in list(self._sessions.keys()):
                session = self._sessions[sid]
                if now - session.updated_at > self._ttl:
                    del self._sessions[sid]
                    removed += 1

        return removed
