from __future__ import annotations

from diff_fuse.api.dto.diff import DiffRequest, DiffResponse
from diff_fuse.domain.diff import build_diff_tree
from diff_fuse.domain.normalize import DocumentParseError, parse_and_normalize_json
from diff_fuse.models.arrays import ArrayStrategy
from diff_fuse.models.diff import (
    DiffStatus,
    NodeKind,
    ValuePresence,
)
from diff_fuse.models.document import DocumentFormat, DocumentResult, InputDocument, RootInput
from diff_fuse.state.session_store import sessions


def compute_diff(
    documents_results: list[DocumentResult],
    root_inputs: dict[str, RootInput],
    array_strategies: dict[str, ArrayStrategy]
) -> DiffResponse:

    # Build the tree. Root path is "".
    root = build_diff_tree(
        path="",
        key=None,
        per_doc_values=root_inputs,
        array_strategies=array_strategies,
    )

    # If nothing parsed, root builder returns missing-ish node; override to stable object
    # so UI has a predictable root.
    if all(not present for present, _ in root_inputs.values()):
        root.kind = NodeKind.object
        root.status = DiffStatus.same
        root.children = []
        root.per_doc = {
            doc_id: ValuePresence(present=False, value=None, value_type=None) for doc_id in root_inputs.keys()
        }

    return DiffResponse(documents_results=documents_results, root=root)


def diff_in_session(session_id: str, req: DiffRequest) -> DiffResponse:
    s = sessions.get(session_id)
    if s is None:
        raise KeyError(session_id)
    return compute_diff(
        documents_results=s.documents_results,
        root_inputs=s.root_inputs,
        array_strategies=req.array_strategies
    )
