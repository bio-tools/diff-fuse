from __future__ import annotations

from typing import Any

from diff_fuse.api.dto.diff import DiffRequest
from diff_fuse.api.dto.merge import MergeRequest, MergeResponse
from diff_fuse.domain.merge import try_merge_from_diff_tree
from diff_fuse.models.merge import MergeSelection
from diff_fuse.services.diff_service import diff_in_session
from diff_fuse.services.shared import fetch_session


def build_merged(
    session_id: str,
    diff_req: DiffRequest,
    selections: dict[str, MergeSelection],
) -> tuple[Any, list[str]]:
    diff_response = diff_in_session(session_id=session_id, req=diff_req)
    merged, unresolved_paths = try_merge_from_diff_tree(diff_response.root, selections)
    return merged, unresolved_paths


def merge_in_session(session_id: str, req: MergeRequest) -> MergeResponse:
    _ = fetch_session(session_id)

    merged, unresolved_paths = build_merged(
        session_id=session_id,
        diff_req=req.diff_request,
        selections=req.selections,
    )

    return MergeResponse(merged=merged, unresolved_paths=unresolved_paths)
