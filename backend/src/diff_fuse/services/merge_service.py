from __future__ import annotations

from diff_fuse.api.dto.merge import MergeRequest, MergeResponse
from diff_fuse.domain.diff import build_stable_root_diff_tree
from diff_fuse.domain.merge import try_merge_from_diff_tree
from diff_fuse.models.arrays import ArrayStrategy
from diff_fuse.models.document import (
    DocumentResult,
    RootInput,
)
from diff_fuse.models.merge import MergeSelection
from diff_fuse.state.session_store import sessions


def build_merged(
    documents_results: list[DocumentResult],
    root_inputs: dict[str, RootInput],
    array_strategies: dict[str, ArrayStrategy],
    selections: dict[str, MergeSelection],
) -> MergeResponse:
    root = build_stable_root_diff_tree(
        per_doc_values=root_inputs,
        array_strategies=array_strategies,
    )

    merged, unresolved_paths = try_merge_from_diff_tree(root, selections)

    return MergeResponse(documents_results=documents_results, merged=merged, unresolved_paths=unresolved_paths)


def merge_in_session(session_id: str, req: MergeRequest) -> MergeResponse:
    s = sessions.get(session_id)
    if s is None:
        raise KeyError(session_id)

    merge_req = MergeRequest(
        documents_results=s.documents_results,
        root_inputs=s.root_inputs,
        array_strategies=req.diff_request.array_strategies,
        selections=req.selections,
    )
    return build_merged(merge_req)
