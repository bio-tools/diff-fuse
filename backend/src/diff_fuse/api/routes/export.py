from fastapi import APIRouter
from fastapi.responses import Response

from diff_fuse.api.dto.export import ExportRequest, ExportTextResponse
from diff_fuse.services.export_service import export_merged_bytes, get_merged_text

router = APIRouter()


@router.post("/{session_id}/export/text", response_model=ExportTextResponse)
def export_text(session_id: str, req: ExportRequest) -> ExportTextResponse:
    return get_merged_text(session_id, req)


@router.post("/{session_id}/export/download")
def export_download(session_id: str, req: ExportRequest):
    data = export_merged_bytes(session_id, req)
    return Response(
        content=data,
        media_type="application/json",
        headers={"Content-Disposition": 'attachment; filename="merged.json"'},
    )
