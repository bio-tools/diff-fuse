import json

from diff_fuse.api.dto.export import ExportRequest, ExportTextResponse
from diff_fuse.api.dto.merge import MergeRequest
from diff_fuse.domain.errors import ConflictUnresolvedError
from diff_fuse.services.merge_service import merge_in_session
from diff_fuse.services.shared import fetch_session


def get_merged_text(
    session_id: str, merge_req: MergeRequest, pretty: bool, require_resolved: bool
) -> tuple[list[str], str]:

    merge_response = merge_in_session(session_id=session_id, req=merge_req)

    if require_resolved and merge_response.unresolved_paths:
        raise ConflictUnresolvedError(merge_response.unresolved_paths)

    indent = 2 if pretty else None
    text = json.dumps(merge_response.merged, indent=indent, ensure_ascii=False, sort_keys=True)

    return merge_response.unresolved_paths, text


def export_merged_text(session_id: str, req: ExportRequest) -> ExportTextResponse:
    _ = fetch_session(session_id)

    unresolved_paths, text = get_merged_text(
        session_id=session_id, merge_req=req.merge_request, pretty=req.pretty, require_resolved=req.require_resolved
    )

    return ExportTextResponse(
        unresolved_paths=unresolved_paths,
        text=text,
    )


def export_merged_bytes(session_id: str, req: ExportRequest) -> bytes:
    _ = fetch_session(session_id)

    _, text = get_merged_text(
        session_id=session_id, merge_req=req.merge_request, pretty=req.pretty, require_resolved=req.require_resolved
    )

    return (text + "\n").encode("utf-8")
