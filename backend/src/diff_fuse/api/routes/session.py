from __future__ import annotations

from fastapi import APIRouter, HTTPException

from diff_fuse.api.schemas.diff import DiffResponse
from diff_fuse.api.schemas.merge import MergeResponse
from diff_fuse.api.schemas.session import (
    CreateSessionRequest,
    CreateSessionResponse,
    SessionDiffRequest,
    SessionMergeRequest,
)
from diff_fuse.services.session_service import create_session, diff_in_session, merge_in_session

router = APIRouter()


@router.post("", response_model=CreateSessionResponse)
def create(req: CreateSessionRequest) -> CreateSessionResponse:
    return create_session(req)


@router.post("/{session_id}/diff", response_model=DiffResponse)
def diff(session_id: str, req: SessionDiffRequest) -> DiffResponse:
    try:
        return diff_in_session(session_id, req)
    except KeyError:
        raise HTTPException(status_code=404, detail="Session not found")


@router.post("/{session_id}/merge", response_model=MergeResponse)
def merge(session_id: str, req: SessionMergeRequest) -> MergeResponse:
    try:
        return merge_in_session(session_id, req)
    except KeyError:
        raise HTTPException(status_code=404, detail="Session not found")
