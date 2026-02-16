from __future__ import annotations

from diff_fuse.api.dto.session import (
    CreateSessionRequest,
    CreateSessionResponse,
)
from diff_fuse.state.session_store import sessions


def create_session(req: CreateSessionRequest) -> CreateSessionResponse:
    s = sessions.create(req.documents)
    return CreateSessionResponse(session_id=s.session_id)

