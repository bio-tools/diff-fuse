from __future__ import annotations

from collections.abc import Mapping
from typing import Any

from diff_fuse.api.schemas.diff import (
    ArrayMeta,
    ArrayStrategy,
    ArrayStrategyMode,
    DiffNode,
    DiffStatus,
    NodeKind,
    ValuePresence,
)
from diff_fuse.core.array_match.index import group_by_index
from diff_fuse.core.array_match.keyed import group_by_key
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

    # Do not embed large structures in the tree response.
    if t in {"object", "array"}:
        return ValuePresence(present=True, value=None, value_type=t)

    return ValuePresence(present=True, value=value, value_type=t)


def _child_path_for_array(parent_path: str, label: str) -> str:
    # parent_path may be "" (root array)
    return f"{parent_path}[{label}]" if parent_path else f"[{label}]"


def build_diff_tree(
    *,
    path: str,
    key: str | None,
    per_doc_values: dict[str, tuple[bool, Any | None]],
    array_strategies: dict[str, ArrayStrategy] | None = None,
) -> DiffNode:
    """
    Build a DiffNode tree for objects + scalars + arrays (arrays expanded according to per-path strategy).
    """
    array_strategies = array_strategies or {}

    present_items: list[tuple[str, Any]] = [(doc_id, v) for doc_id, (present, v) in per_doc_values.items() if present]

    per_doc: dict[str, ValuePresence] = {
        doc_id: _presence_for_value(v, present) for doc_id, (present, v) in per_doc_values.items()
    }

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

    types = {json_type(v) for _, v in present_items}
    if len(types) > 1:
        type_list = sorted(types)
        msg = f"type mismatch at '{path}': " + " vs ".join(type_list)
        return DiffNode(
            path=path,
            key=key,
            kind=NodeKind.scalar,
            status=DiffStatus.type_error,
            message=msg,
            per_doc=per_doc,
            children=[],
            array_meta=None,
        )

    only_type = next(iter(types))
    kind = _kind_from_type(only_type)

    # ---- object ----
    if only_type == "object":
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
                build_diff_tree(
                    path=child_path,
                    key=child_key,
                    per_doc_values=child_per_doc,
                    array_strategies=array_strategies,
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

    # ---- array ----
    if only_type == "array":
        strategy = array_strategies.get(path, ArrayStrategy(mode=ArrayStrategyMode.index))
        array_meta = ArrayMeta(strategy=strategy)

        # If strategy is non-index/non-keyed, we don't implement yet — surface as error node.
        # (You can change to "treat as leaf" if you prefer.)
        try:
            if strategy.mode == ArrayStrategyMode.index:
                groups = group_by_index(path=path, per_doc_arrays=per_doc_values)
            elif strategy.mode == ArrayStrategyMode.keyed:
                if not strategy.key:
                    raise ValueError(f"Keyed mode requires 'key' at array path '{path}'.")
                groups = group_by_key(path=path, per_doc_arrays=per_doc_values, key=strategy.key)
            else:
                raise ValueError(f"Array strategy '{strategy.mode}' not implemented yet at '{path}'.")
        except ValueError as e:
            return DiffNode(
                path=path,
                key=key,
                kind=kind,
                status=DiffStatus.type_error,
                message=str(e),
                per_doc=per_doc,
                children=[],
                array_meta=array_meta,
            )

        children: list[DiffNode] = []
        for g in groups:
            child_path = _child_path_for_array(path, g.label)
            children.append(
                build_diff_tree(
                    path=child_path,
                    key=g.label,
                    per_doc_values=g.per_doc,
                    array_strategies=array_strategies,
                )
            )

        status = _status_from_children(children) if children else DiffStatus.same
        # If some docs are missing the array entirely, that should bubble as missing unless diffs exist.
        any_missing_array = any(not present for present, _ in per_doc_values.values())
        if any_missing_array and status == DiffStatus.same:
            status = DiffStatus.missing

        return DiffNode(
            path=path,
            key=key,
            kind=kind,
            status=status,
            per_doc=per_doc,
            children=children,
            array_meta=array_meta,
        )

    # ---- scalar leaf ----
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
