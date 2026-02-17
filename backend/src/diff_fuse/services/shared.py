"""
Shared service utilities.

This module contains small helper functions used across service-layer
implementations.
"""

from diff_fuse.deps import get_session_repo
from diff_fuse.domain.errors import SessionNotFoundError
from diff_fuse.models.session import Session


def fetch_session(session_id: str) -> Session:
    """
    Retrieve an existing session or raise a domain error.

    Parameters
    ----------
    session_id : str
        Opaque session identifier provided by the client.

    Returns
    -------
    Session
        The retrieved session instance.

    Raises
    ------
    SessionNotFoundError
        If no active session exists for the given identifier.

    Notes
    -----
    - This function refreshes the session TTL indirectly via the
      repository's ``get`` implementation (sliding expiration).
    - Services should prefer this helper over directly calling the
      repository to maintain consistent error behavior.
    """
    repo = get_session_repo()
    s = repo.get(session_id)
    if s is None:
        raise SessionNotFoundError(session_id)
    return s
