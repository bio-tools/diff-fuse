from datetime import datetime, timedelta, timezone
from threading import Lock
from uuid import uuid4

from diff_fuse.models.document import DocumentResult, InputDocument
from diff_fuse.models.session import Session
from diff_fuse.state.session_repo import SessionRepo


class MemorySessionRepo(SessionRepo):
    """In-memory sessions for local dev. Not safe for multi-instance deployments."""

    def __init__(self, *, ttl_seconds: int = 3600) -> None:
        self._ttl = timedelta(seconds=ttl_seconds)
        self._lock = Lock()
        self._sessions: dict[str, Session] = {}

    def create(self, *, documents: list[InputDocument], documents_results: list[DocumentResult]) -> Session:
        now = datetime.now(timezone.utc)
        sid = uuid4().hex
        s = Session(
            session_id=sid,
            created_at=now,
            updated_at=now,
            documents=documents,
            documents_results=documents_results,
        )
        with self._lock:
            self._sessions[sid] = s
        return s

    def get(self, session_id: str) -> Session | None:
        now = datetime.now(timezone.utc)
        with self._lock:
            s = self._sessions.get(session_id)
            if s is None:
                return None
            if now - s.updated_at > self._ttl:
                del self._sessions[session_id]
                return None
            s.updated_at = now
            return s

    def cleanup(self) -> int:
        now = datetime.now(timezone.utc)
        removed = 0
        with self._lock:
            for sid in list(self._sessions.keys()):
                s = self._sessions[sid]
                if now - s.updated_at > self._ttl:
                    del self._sessions[sid]
                    removed += 1
        return removed
