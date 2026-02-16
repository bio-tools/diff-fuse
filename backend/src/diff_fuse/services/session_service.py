from __future__ import annotations

from diff_fuse.api.schemas.diff import DiffRequest, DiffResponse
from diff_fuse.api.schemas.merge import MergeRequest, MergeResponse
from diff_fuse.api.schemas.session import (
    CreateSessionRequest,
    CreateSessionResponse,
    SessionDiffRequest,
    SessionMergeRequest,
)
from diff_fuse.core.session_store import SessionStore
from diff_fuse.services.diff_service import compute_diff
from diff_fuse.services.merge_service import compute_merge

_store = SessionStore(ttl_minutes=60)


def create_session(req: CreateSessionRequest) -> CreateSessionResponse:
    s = _store.create(req.documents)
    return CreateSessionResponse(session_id=s.session_id)


def diff_in_session(session_id: str, req: SessionDiffRequest) -> DiffResponse:
    s = _store.get(session_id)
    if s is None:
        raise KeyError(session_id)
    return compute_diff(DiffRequest(documents=s.documents, array_strategies=req.array_strategies))


def merge_in_session(session_id: str, req: SessionMergeRequest) -> MergeResponse:
    s = _store.get(session_id)
    if s is None:
        raise KeyError(session_id)

    merge_req = MergeRequest(
        documents=DiffRequest(documents=s.documents, array_strategies=req.array_strategies),
        selections=req.selections,
    )
    return compute_merge(merge_req)
