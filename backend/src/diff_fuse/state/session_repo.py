"""
Session storage abstractions.

This module defines the storage interface used by the application to persist
and retrieve sessions.

The goal is to keep business logic independent of the storage backend so that
different implementations can be swapped in without touching services or routes
(e.g., in-memory storage for development/testing vs. Redis for production).

Notes
-----
This is a *structural* interface (``typing.Protocol``). Any class that provides
the same methods with compatible signatures will be accepted by type checkers,
even if it does not explicitly inherit from :class:`SessionRepo`.
"""

from collections.abc import Callable
from typing import Protocol

from diff_fuse.models.session import Session


class SessionRepo(Protocol):
    """
    Storage interface for sessions.

    Implementations are expected to apply expiration semantics (TTL) as configured
    by the application. For example:
    - an in-memory backend may expire entries during reads and cleanup passes
    - a Redis backend may use key TTLs
    """

    def create(self, *, documents_results) -> Session:
        """
        Create and store a new session.

        Parameters
        ----------
        documents_results : list[DocumentResult]
            Parsed/normalized results corresponding to the input documents.

        Returns
        -------
        Session
            The created session instance, including its new session id.
        """
        ...

    def get(self, session_id: str) -> Session | None:
        """
        Fetch an existing session.

        Parameters
        ----------
        session_id : str
            Opaque session identifier.

        Returns
        -------
        Session | None
            The session if it exists and is not expired; otherwise None.
        """
        ...

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

        Notes
        -----
        This method is optional and may not be implemented by all backends.
        For example, if sessions are immutable after creation, this can be a no-op.
        """
        ...

    def mutate(self, session_id: str, fn: Callable[[Session], Session]) -> Session | None:
        """
        Atomically fetch and update a session.

        Parameters
        ----------
        session_id : str
            Opaque session identifier.

        fn : Callable[[Session], Session]
            A function that takes the current session state and returns an updated session.
            This allows for atomic read-modify-write operations.

        Returns
        -------
        Session | None
            The updated session if the operation succeeded; otherwise None (e.g., if session not found).
        """
        ...

    def cleanup(self) -> int:
        """
        Remove expired sessions.

        Returns
        -------
        int
            The number of sessions removed.
        """
        ...
