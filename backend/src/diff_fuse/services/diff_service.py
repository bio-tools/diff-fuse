from __future__ import annotations

from diff_fuse.api.schemas.diff import (
    DiffRequest,
    DiffResponse,
    DiffStatus,
    DocumentFormat,
    DocumentMeta,
    NodeKind,
    ValuePresence,
)
from diff_fuse.domain.diff import build_diff_tree
from diff_fuse.domain.normalize import DocumentParseError, parse_and_normalize_json

from diff_fuse.state.session_store import sessions


def diff_in_session(session_id: str, req: SessionDiffRequest) -> DiffResponse:
    s = sessions.get(session_id)
    if s is None:
        raise KeyError(session_id)
    return compute_diff(DiffRequest(documents=s.documents, array_strategies=req.array_strategies))


def compute_diff(req: DiffRequest) -> DiffResponse:
    documents_meta: list[DocumentMeta] = []

    # doc_id -> (present, normalized_value)
    root_inputs: dict[str, tuple[bool, object | None]] = {}

    for d in req.documents:
        meta = DocumentMeta(doc_id=d.doc_id, name=d.name, format=d.format, ok=True, error=None)

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

    # Build the tree. Root path is "".
    root = build_diff_tree(
        path="",
        key=None,
        per_doc_values=root_inputs,
        array_strategies=req.array_strategies,
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

    return DiffResponse(documents=documents_meta, root=root)
