"""
Export API routes.

This module provides endpoints for exporting the merged document produced
from a session. Two export modes are supported:
- text mode: returns the merged JSON as a string (clipboard-friendly)
- download mode: returns the merged JSON as a file attachment

Notes
-----
Both endpoints rely on the same underlying merge computation and therefore
share the same conflict semantics.
"""

from fastapi import APIRouter
from fastapi.responses import Response

from diff_fuse.api.dto.export import ExportRequest, ExportTextResponse
from diff_fuse.services.export_service import export_merged_bytes, export_merged_text

router = APIRouter()


@router.post("/{session_id}/export/text", response_model=ExportTextResponse)
def export_text(session_id: str, req: ExportRequest) -> ExportTextResponse:
    """
    Return the merged document as formatted text.

    This endpoint is primarily intended for UI workflows such as:
    - copy-to-clipboard
    - inline preview
    - quick inspection of merge results

    Parameters
    ----------
    session_id : str
        Identifier of the session containing the documents to merge.
    req : ExportRequest
        Export configuration including:
        - merge request (diff config + selections)
        - pretty-print preference
        - conflict requirements

    Returns
    -------
    ExportTextResponse
        Textual representation of the merged JSON along with any unresolved
        conflict paths.

    Raises
    ------
    DomainError
        If the session does not exist or has expired.
    """
    return export_merged_text(session_id, req)


@router.post("/{session_id}/export/download")
def export_download(session_id: str, req: ExportRequest):
    """
    Download the merged document as a JSON file.

    This endpoint returns the merged result as an HTTP attachment suitable
    for saving to disk.

    Parameters
    ----------
    session_id : str
        Identifier of the session containing the documents to merge.
    req : ExportRequest
        Export configuration controlling merge behavior and formatting.

    Returns
    -------
    Response
        Binary HTTP response with:
        - media type: application/json
        - content-disposition: attachment
        - body: UTF-8 encoded JSON

    Raises
    ------
    DomainError
        If the session does not exist or has expired.

    Notes
    -----
    The downloaded JSON is identical to the text export output, aside from
    transport encoding.
    """
    data = export_merged_bytes(session_id, req)
    return Response(
        content=data,
        media_type="application/json",
        headers={"Content-Disposition": 'attachment; filename="merged.json"'},
    )
