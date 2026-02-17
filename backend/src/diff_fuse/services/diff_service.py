from __future__ import annotations

from diff_fuse.api.dto.diff import DiffRequest, DiffResponse
from diff_fuse.domain.diff import build_stable_root_diff_tree
from diff_fuse.models.arrays import ArrayStrategy
from diff_fuse.models.document import DocumentResult, RootInput
from diff_fuse.state.session_store import sessions


def build_diff_response(
    documents_results: list[DocumentResult],
    root_inputs: dict[str, RootInput],
    array_strategies: dict[str, ArrayStrategy]
) -> DiffResponse:

    root = build_stable_root_diff_tree(
        per_doc_values=root_inputs,
        array_strategies=array_strategies,
    )

    return DiffResponse(documents_results=documents_results, root=root)


def diff_in_session(session_id: str, req: DiffRequest) -> DiffResponse:
    s = sessions.get(session_id)
    if s is None:
        raise KeyError(session_id)
    return build_diff_response(
        documents_results=s.documents_results,
        root_inputs=s.root_inputs,
        array_strategies=req.array_strategies
    )
