from fastapi import APIRouter, HTTPException
from fastapi.responses import Response

from diff_fuse.api.dto.export import ExportRequest, ExportTextResponse
from diff_fuse.services.export_service import export_merged_bytes, get_merged_text

router = APIRouter()


@router.post("/{session_id}/export/text", response_model=ExportTextResponse)
def export_text(session_id: str, req: ExportRequest) -> ExportTextResponse:
    try:
        return get_merged_text(session_id, req)
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
