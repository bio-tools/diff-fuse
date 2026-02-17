from typing import Protocol

from diff_fuse.models.session import Session


class SessionRepo(Protocol):
    """Storage interface for sessions (in-memory for dev, Redis for prod)."""

    def create(self, *, documents, documents_results) -> Session: ...
    def get(self, session_id: str) -> Session | None: ...
    def cleanup(self) -> int: ...
