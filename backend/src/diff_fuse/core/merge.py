from __future__ import annotations

from dataclasses import dataclass
from typing import Any, Literal

from diff_fuse.api.schemas.diff import DiffNode, DiffStatus, NodeKind, ValuePresence


class MergeConflictError(RuntimeError):
    """Raised when merge cannot proceed due to unresolved diffs/type errors."""

    def __init__(self, unresolved_paths: list[str]) -> None:
        msg = "Unresolved merge conflicts at: " + ", ".join(unresolved_paths)
        super().__init__(msg)
        self.unresolved_paths = unresolved_paths


_MISSING = object()


@dataclass(frozen=True)
class Selection:
    """
    A selection at a path can either:
    - pick a source document (doc_id), or
    - set a manual value.
    """

    kind: Literal["doc", "manual"]
    doc_id: str | None = None
    manual_value: Any | None = None

    @staticmethod
    def from_doc(doc_id: str) -> "Selection":
        return Selection(kind="doc", doc_id=doc_id)

    @staticmethod
    def from_manual(value: Any) -> "Selection":
        return Selection(kind="manual", manual_value=value)


def merge_from_diff_tree(
    root: DiffNode,
    selections: dict[str, Selection],
) -> Any:
    """
    Produce a merged JSON-ish Python object from a DiffNode tree plus selections.

    Rules:
    - same/missing: auto-resolve by taking the unique present value (first present)
    - diff/type_error: must have selection at this path or inherited from ancestor
    - selections inherit: selecting a subtree doc source applies to all children,
      unless overridden by a more specific selection.
    - if selection chooses a doc where the node is missing, that effectively deletes it.
    """
    unresolved: list[str] = []

    def pick_present_value(node: DiffNode) -> Any:
        for vp in node.per_doc.values():
            if vp.present:
                return vp.value
        return _MISSING

    def value_for_doc(node: DiffNode, doc_id: str) -> Any:
        vp: ValuePresence | None = node.per_doc.get(doc_id)
        if vp is None or not vp.present:
            return _MISSING
        return vp.value

    def merge_node(node: DiffNode, inherited: Selection | None) -> Any:
        # Determine effective selection at this node (path exact match overrides inherited)
        sel = selections.get(node.path, inherited)

        if sel is not None:
            if sel.kind == "manual":
                return sel.manual_value
            if sel.kind == "doc":
                assert sel.doc_id is not None
                return value_for_doc(node, sel.doc_id)

        # No selection active: auto-resolve only if safe
        if node.status in (DiffStatus.same, DiffStatus.missing):
            if node.kind == NodeKind.object:
                # If object has children, build it field-by-field.
                if node.children:
                    out: dict[str, Any] = {}
                    for child in node.children:
                        merged_child = merge_node(child, inherited=None)
                        if merged_child is not _MISSING:
                            assert child.key is not None
                            out[child.key] = merged_child
                    # If everything is missing but object exists as empty in some doc, return {}.
                    # If object truly missing in all docs, return _MISSING.
                    if out:
                        return out
                    # fallback to present value (could be {}), else missing
                    v = pick_present_value(node)
                    return v
                # Empty object node: just take present value (likely {})
                return pick_present_value(node)

            # Scalars and arrays (arrays are leaf for now)
            return pick_present_value(node)

        # diff or type_error without selection => conflict
        unresolved.append(node.path)
        return _MISSING

    merged = merge_node(root, inherited=None)

    if unresolved:
        # de-duplicate while preserving order
        seen: set[str] = set()
        ordered = []
        for p in unresolved:
            if p not in seen:
                seen.add(p)
                ordered.append(p)
        raise MergeConflictError(ordered)

    # If root missing entirely, return empty object (UI can treat as empty result)
    if merged is _MISSING:
        return {}

    return merged
