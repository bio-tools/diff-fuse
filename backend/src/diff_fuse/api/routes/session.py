from __future__ import annotations

from fastapi import APIRouter, HTTPException
from fastapi.responses import Response

from diff_fuse.api.schemas.array_keys import SuggestArrayKeysRequest, SuggestArrayKeysResponse
from diff_fuse.api.schemas.diff import DiffResponse
from diff_fuse.api.schemas.export import ExportRequest, ExportTextResponse
from diff_fuse.api.schemas.merge import MergeResponse
from diff_fuse.api.schemas.session import (
    CreateSessionRequest,
    CreateSessionResponse,
    SessionDiffRequest,
    SessionMergeRequest,
)
from diff_fuse.services.export_service import export_merged_bytes, export_merged_text
from diff_fuse.services.session_service import (
    create_session,
    diff_in_session,
    merge_in_session,
    suggest_array_keys_in_session,
)

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


@router.post("/{session_id}/arrays/suggest-keys", response_model=SuggestArrayKeysResponse)
def suggest_array_keys(session_id: str, req: SuggestArrayKeysRequest) -> SuggestArrayKeysResponse:
    try:
        return suggest_array_keys_in_session(session_id, req)
    except KeyError:
        raise HTTPException(status_code=404, detail="Session not found")
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))


@router.post("/{session_id}/export", response_model=ExportTextResponse)
def export_merged(session_id: str, req: ExportRequest, mode: str = "text"):
    """
    mode=text     -> returns JSON with { merged, unresolved_paths, text } (clipboard-friendly)
    mode=download -> returns application/json file attachment
    """
    try:
        if mode == "download":
            data = export_merged_bytes(session_id, req)
            return Response(
                content=data,
                media_type="application/json",
                headers={"Content-Disposition": 'attachment; filename="merged.json"'},
            )
        # default: text mode
        return export_merged_text(session_id, req)

    except KeyError:
        raise HTTPException(status_code=404, detail="Session not found")
    except RuntimeError as e:
        if "Unresolved merge conflicts" in str(e):
            raise HTTPException(status_code=409, detail="Unresolved merge conflicts")
        raise HTTPException(status_code=500, detail="Export failed")