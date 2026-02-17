from __future__ import annotations

from datetime import datetime, timezone
from uuid import uuid4

from redis import Redis

from diff_fuse.models.document import DocumentResult, InputDocument
from diff_fuse.models.session import Session
from diff_fuse.state.session_repo import SessionRepo


class RedisSessionRepo(SessionRepo):
    """
    Redis-backed session repository.

    Design
    ------
    - Each session is stored as a single JSON value.
    - TTL is enforced by Redis.
    - On access, TTL is refreshed (sliding expiration).
    """

    def __init__(self, redis: Redis, *, ttl_seconds: int, key_prefix: str = "diff-fuse:session:") -> None:
        self._r = redis
        self._ttl = int(ttl_seconds)
        self._prefix = key_prefix

    def _key(self, session_id: str) -> str:
        return f"{self._prefix}{session_id}"

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

        self._r.set(self._key(sid), s.model_dump_json(), ex=self._ttl)
        return s

    def get(self, session_id: str) -> Session | None:
        raw = self._r.get(self._key(session_id))
        if raw is None:
            return None

        # redis-py may return bytes depending on decode_responses
        if isinstance(raw, bytes):
            raw = raw.decode("utf-8")

        s = Session.model_validate_json(raw)

        # sliding TTL + updated timestamp
        s.updated_at = datetime.now(timezone.utc)
        self._r.set(self._key(session_id), s.model_dump_json(), ex=self._ttl)
        return s

    def cleanup(self) -> int:
        # Redis handles TTL expiry; nothing to do here.
        return 0
