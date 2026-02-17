from dataclasses import dataclass
from datetime import datetime, timedelta, timezone
from threading import Lock
from uuid import uuid4

from diff_fuse.models.document import DocumentResult, InputDocument, RootInput


@dataclass
class Session:
    session_id: str
    created_at: datetime
    updated_at: datetime
    documents: list[InputDocument]
    documents_results: list[DocumentResult]

    @property
    def root_inputs(self) -> dict[str, RootInput]:
        return {
            dr.doc_id: dr.build_root_input()
            for dr in self.documents_results
        }


class SessionStore:
    def __init__(self, ttl_minutes: int = 60) -> None:
        self._ttl = timedelta(minutes=ttl_minutes)
        self._lock = Lock()
        self._sessions: dict[str, Session] = {}

    def create(self, documents: list[InputDocument], documents_results: list[DocumentResult]) -> Session:
        now = datetime.now(timezone.utc)
        sid = uuid4().hex
        s = Session(
            session_id=sid,
            created_at=now,
            updated_at=now,
            documents=documents,
            documents_results=documents_results
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


sessions = SessionStore(ttl_minutes=60)
