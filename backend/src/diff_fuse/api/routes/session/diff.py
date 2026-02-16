from __future__ import annotations

from fastapi import APIRouter, HTTPException
from pydantic import Field

from diff_fuse.api.schemas.api import APIModel
from diff_fuse.api.schemas.diff import DiffNode, DocumentMeta, InputDocument
from diff_fuse.api.schemas.shared import ArrayStrategies
from diff_fuse.services.session_service import diff_in_session

router = APIRouter()

class DiffRequest(APIModel):
    documents: list[InputDocument] = Field(..., min_length=2)
    array_strategies: ArrayStrategies = Field(default_factory=dict)


class DiffResponse(APIModel):
    documents: list[DocumentMeta]
    root: DiffNode


@router.post("/{session_id}/diff", response_model=DiffResponse)
def diff(session_id: str, req: DiffRequest) -> DiffResponse:
    try:
        return diff_in_session(session_id, req)
    except KeyError:
        raise HTTPException(status_code=404, detail="Session not found")
