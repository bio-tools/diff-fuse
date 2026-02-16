from __future__ import annotations

import json
from typing import Any

from diff_fuse.api.schemas.diff import DiffRequest
from diff_fuse.api.schemas.export import ExportRequest, ExportTextResponse
from diff_fuse.api.schemas.merge import MergeRequest
from diff_fuse.services.merge_service import compute_merge
from diff_fuse.services.session_service import sessions  # uses the in-memory store


def export_merged_text(session_id: str, req: ExportRequest) -> ExportTextResponse:
    s = sessions.get(session_id)
    if s is None:
        raise KeyError(session_id)

    merge_req = MergeRequest(
        documents=DiffRequest(documents=s.documents, array_strategies=req.array_strategies),
        selections=req.selections,
    )
    merge_resp = compute_merge(merge_req)

    if req.require_resolved and merge_resp.unresolved_paths:
        # caller will translate to 409
        raise RuntimeError("Unresolved merge conflicts")

    indent = 2 if req.pretty else None
    text = json.dumps(merge_resp.merged, indent=indent, ensure_ascii=False, sort_keys=True)

    return ExportTextResponse(
        merged=merge_resp.merged,
        unresolved_paths=merge_resp.unresolved_paths,
        text=text,
    )


def export_merged_bytes(session_id: str, req: ExportRequest) -> bytes:
    resp = export_merged_text(session_id, req)
    return (resp.text + "\n").encode("utf-8")
