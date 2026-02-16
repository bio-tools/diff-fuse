from __future__ import annotations

from diff_fuse.api.dto.merge import MergeRequest, MergeResponse
from diff_fuse.domain.diff import build_diff_tree
from diff_fuse.domain.merge import MergeConflictError, try_merge_from_diff_tree
from diff_fuse.domain.normalize import DocumentParseError, parse_and_normalize_json
from diff_fuse.models.document import (
    DocumentFormat,
    DocumentResult,
)
from diff_fuse.models.merge import MergeSelection
from diff_fuse.state.session_store import sessions


def compute_merge(req: MergeRequest) -> MergeResponse:
    diff_req = req.documents

    documents_meta: list[DocumentResult] = []
    root_inputs: dict[str, tuple[bool, object | None]] = {}

    # Parse + normalize each doc (JSON only for now)
    for d in diff_req.documents:
        meta = DocumentResult(doc_id=d.doc_id, name=d.name, format=d.format, ok=True, error=None)

        if d.format != DocumentFormat.json:
            meta.ok = False
            meta.error = f"Unsupported format '{d.format}'. Only 'json' is supported currently."
            documents_meta.append(meta)
            root_inputs[d.doc_id] = (False, None)
            continue

        try:
            parsed = parse_and_normalize_json(d.content)
            documents_meta.append(meta)
            root_inputs[d.doc_id] = (True, parsed.normalized)
        except DocumentParseError as e:
            meta.ok = False
            meta.error = str(e)
            documents_meta.append(meta)
            root_inputs[d.doc_id] = (False, None)

    # Build diff tree (object/scalar recursion; arrays as leaf for now)
    root = build_diff_tree(
        path="",
        key=None,
        per_doc_values=root_inputs,
        array_strategies=diff_req.array_strategies,
    )

    # Convert API selections -> internal selections
    internal_selections: dict[str, MergeSelection] = {}
    for path, sel in req.selections.items():
        if sel.kind == "doc":
            if not sel.doc_id:
                continue
            internal_selections[path] = MergeSelection.from_doc(sel.doc_id)
        else:
            internal_selections[path] = MergeSelection.from_manual(sel.manual_value)

    # Merge
    merged, unresolved_paths = try_merge_from_diff_tree(root, internal_selections)

    return MergeResponse(documents_meta=documents_meta, merged=merged, unresolved_paths=unresolved_paths)


def merge_in_session(session_id: str, req: MergeRequest) -> MergeResponse:
    s = sessions.get(session_id)
    if s is None:
        raise KeyError(session_id)

    merge_req = MergeRequest(
        documents=DiffRequest(documents=s.documents, array_strategies=req.array_strategies),
        selections=req.selections,
    )
    return compute_merge(merge_req)
