from __future__ import annotations

from collections.abc import Mapping
from typing import Any

from diff_fuse.api.schemas.diff import (
    DiffNode,
    DiffStatus,
    NodeKind,
    ValuePresence,
)
from diff_fuse.core.normalize import JsonType, json_type


def _kind_from_type(t: JsonType) -> NodeKind:
    if t == "object":
        return NodeKind.object
    if t == "array":
        return NodeKind.array
    return NodeKind.scalar


def _status_from_children(children: list[DiffNode]) -> DiffStatus:
    if any(c.status == DiffStatus.type_error for c in children):
        return DiffStatus.type_error
    if any(c.status == DiffStatus.diff for c in children):
        return DiffStatus.diff
    if any(c.status == DiffStatus.missing for c in children):
        return DiffStatus.missing
    return DiffStatus.same


def _presence_for_value(value: Any | None, present: bool) -> ValuePresence:
    if not present:
        return ValuePresence(present=False, value=None, value_type=None)
    t = json_type(value)
    return ValuePresence(present=True, value=value, value_type=t)


def build_diff_tree_object_scalar(
    *,
    path: str,
    key: str | None,
    per_doc_values: dict[str, tuple[bool, Any | None]],
) -> DiffNode:
    """
    Build a DiffNode tree for objects + scalars.
    Arrays are treated as scalar-ish leaves for now (no recursion).

    per_doc_values maps: doc_id -> (present, value)
    """
    # Collect present values and types
    present_items: list[tuple[str, Any]] = [(doc_id, v) for doc_id, (present, v) in per_doc_values.items() if present]

    per_doc: dict[str, ValuePresence] = {
        doc_id: _presence_for_value(v, present) for doc_id, (present, v) in per_doc_values.items()
    }

    # If nobody has it, treat as "missing scalar" node (shouldn't happen if built correctly)
    if not present_items:
        return DiffNode(
            path=path,
            key=key,
            kind=NodeKind.scalar,
            status=DiffStatus.missing,
            per_doc=per_doc,
            children=[],
            array_meta=None,
        )

    # Type mismatch among present values => type_error node
    types = {json_type(v) for _, v in present_items}
    if len(types) > 1:
        # pick a stable-ish kind for rendering; scalar is safest
        return DiffNode(
            path=path,
            key=key,
            kind=NodeKind.scalar,
            status=DiffStatus.type_error,
            per_doc=per_doc,
            children=[],
            array_meta=None,
        )

    only_type = next(iter(types))
    kind = _kind_from_type(only_type)

    # If this is an object: recurse on union of keys
    if only_type == "object":
        # Build key union
        key_union: set[str] = set()
        for _, v in present_items:
            assert isinstance(v, Mapping)
            key_union.update(str(k) for k in v.keys())

        children: list[DiffNode] = []
        for child_key in sorted(key_union):
            child_path = child_key if path == "" else f"{path}.{child_key}"

            child_per_doc: dict[str, tuple[bool, Any | None]] = {}
            for doc_id, (present, v) in per_doc_values.items():
                if not present:
                    child_per_doc[doc_id] = (False, None)
                    continue
                assert isinstance(v, Mapping)
                if child_key in v:
                    child_per_doc[doc_id] = (True, v[child_key])
                else:
                    child_per_doc[doc_id] = (False, None)

            children.append(
                build_diff_tree_object_scalar(
                    path=child_path,
                    key=child_key,
                    per_doc_values=child_per_doc,
                )
            )

        status = _status_from_children(children)
        return DiffNode(
            path=path,
            key=key,
            kind=kind,
            status=status,
            per_doc=per_doc,
            children=children,
            array_meta=None,
        )

    # Arrays treated as leaf nodes for now (element-wise comes later)
    if only_type == "array":
        # Compare whole-array equality for now, but don't recurse
        values = [v for _, v in present_items]
        all_equal = all(v == values[0] for v in values[1:])
        any_missing = any(not present for present, _ in per_doc_values.values())
        status = (
            DiffStatus.missing
            if any_missing and all_equal
            else DiffStatus.same
            if all_equal and not any_missing
            else DiffStatus.diff
        )
        return DiffNode(
            path=path,
            key=key,
            kind=kind,
            status=status,
            per_doc=per_doc,
            children=[],
            array_meta=None,
        )

    # Scalar leaf
    values = [v for _, v in present_items]
    all_equal = all(v == values[0] for v in values[1:])
    any_missing = any(not present for present, _ in per_doc_values.values())

    status = (
        DiffStatus.missing
        if any_missing and all_equal
        else DiffStatus.same
        if all_equal and not any_missing
        else DiffStatus.diff
    )

    return DiffNode(
        path=path,
        key=key,
        kind=kind,
        status=status,
        per_doc=per_doc,
        children=[],
        array_meta=None,
    )
