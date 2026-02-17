from __future__ import annotations

import json

from diff_fuse.api.dto.export import ExportRequest, ExportTextResponse
from diff_fuse.api.dto.merge import MergeRequest
from diff_fuse.services.merge_service import merge_in_session
from diff_fuse.services.session_service import sessions


def export_merged_text(
    session_id: str,
    merge_req: MergeRequest,
    pretty: bool,
    require_resolved: bool
) -> ExportTextResponse:

    merge_resp = merge_in_session(session_id=session_id, req=merge_req)

    if require_resolved and merge_resp.unresolved_paths:
        raise RuntimeError("Unresolved merge conflicts")

    indent = 2 if pretty else None
    text = json.dumps(merge_resp.merged, indent=indent, ensure_ascii=False, sort_keys=True)

    return ExportTextResponse(
        merged=merge_resp.merged,
        unresolved_paths=merge_resp.unresolved_paths,
        text=text,
    )


def export_merged_bytes(session_id: str, req: ExportRequest) -> bytes:
    s = sessions.get(session_id)
    if s is None:
        raise KeyError(session_id)

    resp = export_merged_text(
        session_id=session_id,
        req=req.merge_request,
        pretty=req.pretty,
        require_resolved=req.require_resolved
    )
    return (resp.text + "\n").encode("utf-8")
