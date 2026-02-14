from __future__ import annotations

from diff_fuse.api.schemas.diff import (
    DiffNode,
    DiffRequest,
    DiffResponse,
    DiffStatus,
    DocumentMeta,
    NodeKind,
    ValuePresence,
)


def compute_diff(req: DiffRequest) -> DiffResponse:
    docs_meta: list[DocumentMeta] = []
    per_doc: dict[str, ValuePresence] = {}

    for d in req.documents:
        docs_meta.append(DocumentMeta(doc_id=d.doc_id, name=d.name, format=d.format, ok=True))
        per_doc[d.doc_id] = ValuePresence(present=True, value=None, value_type="root")

    root = DiffNode(
        path="",
        key=None,
        kind=NodeKind.object,
        status=DiffStatus.same,
        per_doc=per_doc,
        children=[],
        array_meta=None,
    )

    return DiffResponse(documents=docs_meta, root=root)
