from __future__ import annotations

from typing import Any

from fastapi import APIRouter, HTTPException
from pydantic import Field

from diff_fuse.api.routes.session.diff import DiffRequest
from diff_fuse.api.schemas.api import APIModel
from diff_fuse.api.schemas.diff import DocumentMeta
from diff_fuse.api.schemas.merge import MergeSelection
from diff_fuse.api.schemas.session import SessionMergeRequest
from diff_fuse.services.session_service import merge_in_session

router = APIRouter()

class MergeRequest(APIModel):
    # Keep same shape as diff request to avoid frontend duplication.
    documents: DiffRequest = Field(..., description="Same as /api/diff request payload.")
    selections: dict[str, MergeSelection] = Field(
        default_factory=dict,
        description="Map path -> selection (doc/manual).",
    )


class MergeResponse(APIModel):
    documents: list[DocumentMeta]
    merged: Any
    unresolved_paths: list[str] = Field(default_factory=list)


@router.post("/{session_id}/merge", response_model=MergeResponse)
def merge(session_id: str, req: SessionMergeRequest) -> MergeResponse:
    try:
        return merge_in_session(session_id, req)
    except KeyError:
        raise HTTPException(status_code=404, detail="Session not found")
