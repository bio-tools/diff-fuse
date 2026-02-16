from __future__ import annotations

from typing import Any

from fastapi import APIRouter, HTTPException
from fastapi.responses import Response
from pydantic import Field

from diff_fuse.api.schemas.api import APIModel
from diff_fuse.api.schemas.array_strategies import ArrayStrategy
from diff_fuse.api.schemas.merge import MergeSelection
from diff_fuse.services.export_service import export_merged_bytes, export_merged_text

router = APIRouter()

class ExportRequest(APIModel):
    array_strategies: dict[str, ArrayStrategy] = Field(default_factory=dict)
    selections: dict[str, MergeSelection] = Field(default_factory=dict)
    pretty: bool = True
    require_resolved: bool = False


class ExportTextResponse(APIModel):
    merged: Any
    unresolved_paths: list[str] = Field(default_factory=list)
    text: str


@router.post("/{session_id}/export/text", response_model=ExportTextResponse)
def export_text(session_id: str, req: ExportRequest) -> ExportTextResponse:
    try:
        return export_merged_text(session_id, req)
    except KeyError:
        raise HTTPException(status_code=404, detail="Session not found")
    except RuntimeError as e:
        if "Unresolved merge conflicts" in str(e):
            raise HTTPException(status_code=409, detail="Unresolved merge conflicts")
        raise HTTPException(status_code=500, detail="Export failed")


@router.post("/{session_id}/export/download")
def export_download(session_id: str, req: ExportRequest):
    try:
        data = export_merged_bytes(session_id, req)
        return Response(
            content=data,
            media_type="application/json",
            headers={"Content-Disposition": 'attachment; filename="merged.json"'},
        )
    except KeyError:
        raise HTTPException(status_code=404, detail="Session not found")
    except RuntimeError as e:
        if "Unresolved merge conflicts" in str(e):
            raise HTTPException(status_code=409, detail="Unresolved merge conflicts")
        raise HTTPException(status_code=500, detail="Export failed")
