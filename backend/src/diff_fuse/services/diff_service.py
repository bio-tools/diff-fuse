from __future__ import annotations

from diff_fuse.api.schemas.diff import (
    DiffNode,
    DiffRequest,
    DiffResponse,
    DiffStatus,
    DocumentFormat,
    DocumentMeta,
    NodeKind,
    ValuePresence,
)
from diff_fuse.core.normalize import DocumentParseError, json_type, parse_and_normalize_json


def _node_kind_from_json_type(t: str) -> NodeKind:
    if t == "object":
        return NodeKind.object
    if t == "array":
        return NodeKind.array
    return NodeKind.scalar


def compute_diff(req: DiffRequest) -> DiffResponse:
    documents_meta: list[DocumentMeta] = []
    per_doc: dict[str, ValuePresence] = {}

    parsed_ok: list[tuple[str, object, str]] = []  # (doc_id, normalized_value, json_type)

    for d in req.documents:
        # Default meta (updated below)
        meta = DocumentMeta(doc_id=d.doc_id, name=d.name, format=d.format, ok=True, error=None)

        if d.format != DocumentFormat.json:
            meta.ok = False
            meta.error = f"Unsupported format '{d.format}'. Only 'json' is supported currently."
            documents_meta.append(meta)
            per_doc[d.doc_id] = ValuePresence(present=False, value=None, value_type=None)
            continue

        try:
            parsed = parse_and_normalize_json(d.content)
            t = json_type(parsed.normalized)
            documents_meta.append(meta)
            per_doc[d.doc_id] = ValuePresence(present=True, value=parsed.normalized, value_type=t)
            parsed_ok.append((d.doc_id, parsed.normalized, t))
        except DocumentParseError as e:
            meta.ok = False
            meta.error = str(e)
            documents_meta.append(meta)
            per_doc[d.doc_id] = ValuePresence(present=False, value=None, value_type=None)

    # Decide root kind + status based on successfully parsed docs only
    if not parsed_ok:
        # Nothing parsed; still return a root so UI can render errors per column.
        root_kind = NodeKind.object
        root_status = DiffStatus.same
    else:
        types = {t for _, _, t in parsed_ok}
        root_kind = _node_kind_from_json_type(parsed_ok[0][2])

        if len(types) > 1:
            root_status = DiffStatus.type_error
        else:
            # Compare normalized full-doc values
            values = [v for _, v, _ in parsed_ok]
            root_status = DiffStatus.same if all(v == values[0] for v in values[1:]) else DiffStatus.diff

    root = DiffNode(
        path="",
        key=None,
        kind=root_kind,
        status=root_status,
        per_doc=per_doc,
        children=[],
        array_meta=None,
    )

    return DiffResponse(documents=documents_meta, root=root)
