from __future__ import annotations

from fastapi import APIRouter, HTTPException

from diff_fuse.api.schemas.diff import DiffResponse
from diff_fuse.api.schemas.session import SessionDiffRequest
from diff_fuse.services.session_service import diff_in_session

router = APIRouter()


@router.post("/{session_id}/diff", response_model=DiffResponse)
def diff(session_id: str, req: SessionDiffRequest) -> DiffResponse:
    try:
        return diff_in_session(session_id, req)
    except KeyError:
        raise HTTPException(status_code=404, detail="Session not found")
