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

    Key semantics:
    - Object nodes are merged by recursively merging children (field-by-field).
      Conflicts are recorded at the smallest unresolved nodes (usually leaves).
    - A doc selection at an object node acts as an inherited default for its subtree,
      unless overridden at deeper paths.
    - A doc selection at a scalar/array node directly picks that value.
    - A manual selection always wins and stops recursion.
    - same/missing nodes can be auto-resolved without a selection.
    - diff/type_error nodes require selections somewhere in the subtree to resolve.
    - selecting a doc where the node is missing deletes that node from the result.
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

    def merge_object_children(node: DiffNode, inherited: Selection | None) -> Any:
        out: dict[str, Any] = {}
        for child in node.children:
            merged_child = merge_node(child, inherited=inherited)
            if merged_child is not _MISSING:
                assert child.key is not None
                out[child.key] = merged_child

        # Important: an object can legitimately become empty after deletions.
        # Do NOT "fallback" to a present value, or you'll resurrect deleted keys.
        node_exists_somewhere = any(vp.present for vp in node.per_doc.values())
        if node_exists_somewhere:
            return out

        # If the object doesn't exist in any doc, propagate missing.
        return _MISSING

    def merge_node(node: DiffNode, inherited: Selection | None) -> Any:
        # Effective selection: exact path overrides inherited
        sel = selections.get(node.path, inherited)

        # Manual selection: always wins
        if sel is not None and sel.kind == "manual":
            return sel.manual_value

        # Doc selection: if selected doc lacks this node => delete it
        if sel is not None and sel.kind == "doc":
            assert sel.doc_id is not None
            chosen = value_for_doc(node, sel.doc_id)
            if chosen is _MISSING:
                return _MISSING

            # For object nodes, treat doc selection as a *default for subtree*,
            # not a hard replacement — so leaf overrides can still apply.
            if node.kind == NodeKind.object and node.children:
                return merge_object_children(node, inherited=sel)

            # For scalars/arrays (and empty objects), doc selection picks the value directly.
            return chosen

        # No selection active:
        # If object with children, we can still try to merge children.
        # This is crucial: root/object diff should not become a conflict itself.
        if node.kind == NodeKind.object and node.children:
            merged_obj = merge_object_children(node, inherited=None)
            # If subtree contains conflicts, they'll be recorded at leaves.
            # If subtree fully deleted/missing, propagate missing.
            return merged_obj

        # Auto-resolve safe nodes without selection
        if node.status in (DiffStatus.same, DiffStatus.missing):
            return pick_present_value(node)

        # diff/type_error leaf without selection => conflict at this node
        unresolved.append(node.path)
        return _MISSING

    merged = merge_node(root, inherited=None)

    if unresolved:
        # de-duplicate while preserving order
        seen: set[str] = set()
        ordered: list[str] = []
        for p in unresolved:
            if p not in seen:
                seen.add(p)
                ordered.append(p)
        raise MergeConflictError(ordered)

    if merged is _MISSING:
        return {}

    return merged
