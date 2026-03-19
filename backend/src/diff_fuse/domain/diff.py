"""
Diff tree construction.

This module builds the canonical diff representation.

Given N input documents (already parsed into JSON-compatible Python objects),
the diff engine constructs a recursive tree of `DiffNode` objects. Each node
corresponds to a canonical path within the document structure and records:

- node kind (scalar/object/array)
- diff status (same/diff/missing/type_error)
- per-document presence and (optionally) scalar value
- child nodes (for objects and arrays)
- array metadata (effective matching strategy)

Arrays are expanded element-wise according to a per-path `ArrayStrategy`
(index-based, keyed matching, etc.). Object keys are traversed by union across
documents.

Notes
-----
- Container values (objects/arrays) are intentionally not embedded in the diff
  output (`ValuePresence.value` is set to None) to keep payloads small.
  `ValuePresence.value_type` still indicates the JSON type.
- Paths are stable identifiers used by the UI and merge selections:
  object keys use dot notation, arrays use bracket notation:
    "a.b[0].c", root is "".
"""

from collections.abc import Mapping
from dataclasses import dataclass
from typing import Any

from diff_fuse.domain.array_match.index import group_by_index
from diff_fuse.domain.array_match.keyed import group_by_key
from diff_fuse.domain.errors import LimitsExceededError
from diff_fuse.domain.node_ids import Token, child_node_id, root_node_id
from diff_fuse.domain.normalize import json_type
from diff_fuse.models.arrays import ArrayStrategy, ArrayStrategyMode
from diff_fuse.models.diff import ArrayMeta, ArraySelector, DiffNode, DiffStatus, JsonType, NodeKind, ValuePresence
from diff_fuse.models.document import ValueInput
from diff_fuse.settings import get_settings


@dataclass
class _Budget:
    remaining: int


def _kind_from_type(t: JsonType) -> NodeKind:
    """Map a normalized JSON type label to a `NodeKind`."""
    match t:
        case "object":
            return NodeKind.object
        case "array":
            return NodeKind.array
        case _:
            return NodeKind.scalar


def _status_from_children(children: list[DiffNode]) -> DiffStatus:
    """
    Compute a parent status from child statuses.

    Precedence (highest to lowest):
    - type_error
    - diff
    - missing
    - same

    Parameters
    ----------
    children : list[DiffNode]
        Child nodes to aggregate.

    Returns
    -------
    DiffStatus
        Aggregated status for the parent node.
    """
    if any(c.status == DiffStatus.type_error for c in children):
        return DiffStatus.type_error
    if any(c.status == DiffStatus.diff for c in children):
        return DiffStatus.diff
    if any(c.status == DiffStatus.missing for c in children):
        return DiffStatus.missing
    return DiffStatus.same


def _presence_for_value(value: Any | None, present: bool) -> ValuePresence:
    """
    Build the `ValuePresence` payload for a single document at a node.

    Parameters
    ----------
    value : Any | None
        Value at this path for this document (only meaningful when `present=True`).
    present : bool
        Whether the path exists in this document.

    Returns
    -------
    ValuePresence
        Presence/value record. For container types (object/array), `value` is
        intentionally omitted (set to None) and only `value_type` is provided.

    Notes
    -----
    - `present=False` means the key/path does not exist.
    - `present=True` and `value=None` does *not* necessarily imply JSON null,
      because container values are also omitted. Consumers must use `value_type`.
    """
    if not present:
        return ValuePresence(present=False, value=None, value_type=None)

    t = json_type(value)

    # Do not embed large structures in the tree response.
    if t in {"object", "array"}:
        return ValuePresence(present=True, value=None, value_type=t)

    return ValuePresence(present=True, value=value, value_type=t)


def _child_path_for_array(parent_path: str, label: str) -> str:
    """
    Construct a canonical child path for an array element.

    Parameters
    ----------
    parent_path : str
        Canonical path for the parent array node. Root array uses "".

    label : str
        Label for the element produced by the array matching strategy:
        - index mode: typically "0", "1", ...
        - keyed mode: key value rendered as a string

    Returns
    -------
    str
        Canonical path for the element node, e.g.:
        - parent "steps" + label "0" -> "steps[0]"
        - root "" + label "0" -> "[0]"
    """
    return f"{parent_path}[{label}]" if parent_path else f"[{label}]"


def _build_missing_node(
    *,
    node_id: str,
    parent_id: str | None,
    path: str,
    key: str | None,
    per_doc: dict[str, ValuePresence],
    parent_path: str | None,
    array_selector: ArraySelector | None,
) -> DiffNode:
    """Build a node representing absence in all documents."""
    return DiffNode(
        node_id=node_id,
        parent_id=parent_id,
        path=path,
        key=key,
        kind=NodeKind.scalar,
        status=DiffStatus.missing,
        message=None,
        per_doc=per_doc,
        children=[],
        array_meta=None,
        parent_path=parent_path,
        array_selector=array_selector,
    )


def _build_type_error_node(
    *,
    node_id: str,
    parent_id: str | None,
    path: str,
    key: str | None,
    kind: NodeKind,
    per_doc: dict[str, ValuePresence],
    message: str,
    array_meta: ArrayMeta | None,
    parent_path: str | None,
    array_selector: ArraySelector | None,
) -> DiffNode:
    """Build a node representing an unreconcilable type/strategy error."""
    return DiffNode(
        node_id=node_id,
        parent_id=parent_id,
        path=path,
        key=key,
        kind=kind,
        status=DiffStatus.type_error,
        message=message,
        per_doc=per_doc,
        children=[],
        array_meta=array_meta,
        parent_path=parent_path,
        array_selector=array_selector,
    )


def _build_object_node(
    *,
    node_id: str,
    parent_id: str | None,
    node_tokens: list[Token],
    path: str,
    key: str | None,
    per_doc_values: dict[str, ValueInput],
    per_doc: dict[str, ValuePresence],
    present_items: list[tuple[str, Any]],
    array_strategies_by_node_id: dict[str, ArrayStrategy],
    parent_path: str | None,
    array_selector: ArraySelector | None,
    _budget: _Budget,
) -> DiffNode:
    """
    Build an object node by unioning keys and recursing per key.

    Parameters
    ----------
    node_id, parent_id, node_tokens
        Stable opaque IDs and tokens for this node and its parent, used for identity.
    path, key
        Node identity.
    per_doc_values : dict[str, ValueInput]
        Per-document presence/value at this path (values are mappings).
    per_doc : dict[str, ValuePresence]
        Precomputed per-document presence payload for this node.
    present_items : list[tuple[str, Any]]
        List of (doc_id, value) for documents where this node is present.
    array_strategies_by_node_id : dict[str, ArrayStrategy]
        Per-array-node strategy configuration to pass through recursion.
    parent_path : str | None
        Canonical path of the parent node. Root uses None.
    array_selector : ArraySelector | None
        For array element nodes, describes how this element was selected/aligned across documents.
    _budget : _Budget
        Remaining node budget to enforce max diff size.

    Returns
    -------
    DiffNode
        Object node with one child per key in the union of object keys across
        all present documents.

    Example
    -------
    Given two documents with values at path "a" as:
    - doc1: {"x": 1, "y": 2}
    - doc2: {"x": 1}
    The child keys are the union {"x", "y"}. The resulting node has two children:
    - "x" with status `same` (values agree)
    - "y" with status `missing` (missing in doc2, present in doc1)
    """
    key_union: set[str] = set()
    for _, v in present_items:
        assert isinstance(v, Mapping)
        key_union.update(str(k) for k in v.keys())

    children: list[DiffNode] = []
    for child_key in sorted(key_union):
        child_path = child_key if path == "" else f"{path}.{child_key}"

        child_per_doc: dict[str, ValueInput] = {}
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
                array_strategies_by_node_id=array_strategies_by_node_id,
                parent_path=path,
                array_selector=None,
                parent_id=node_id,
                parent_tokens=node_tokens,
                token=("o", child_key),
                _budget=_budget,
            )
        )

    status = _status_from_children(children)
    return DiffNode(
        node_id=node_id,
        parent_id=parent_id,
        path=path,
        key=key,
        kind=NodeKind.object,
        status=status,
        message=None,
        per_doc=per_doc,
        children=children,
        array_meta=None,
        parent_path=parent_path,
        array_selector=array_selector,
    )


def _build_array_node(
    *,
    node_id: str,
    parent_id: str | None,
    node_tokens: list[Token],
    path: str,
    key: str | None,
    per_doc_values: dict[str, ValueInput],
    per_doc: dict[str, ValuePresence],
    array_strategies_by_node_id: dict[str, ArrayStrategy],
    parent_path: str | None,
    array_selector: ArraySelector | None,
    _budget: _Budget,
) -> DiffNode:
    """
    Build an array node by aligning elements and recursing per aligned group.

    The array alignment strategy is chosen per array path.

    Parameters
    ----------
    path, key
        Node identity.
    per_doc_values : dict[str, ValueInput]
        Per-document presence/value at this path (values are lists when present).
    per_doc : dict[str, ValuePresence]
        Precomputed per-document presence payload for this node.
    array_strategies_by_node_id : dict[str, ArrayStrategy]
        Per-array-path strategy configuration. Missing nodes use backend defaults.
    parent_path : str | None
        Canonical path of the parent node. Root uses None.
    array_selector : ArraySelector | None
        For array element nodes, describes how this element was selected/aligned across documents.
    _budget : _Budget
        Remaining node budget to enforce max diff size.

    Returns
    -------
    DiffNode
        Array node with one child per aligned element group.

    Notes
    -----
    If the configured strategy cannot be applied (e.g., keyed strategy without a key),
    this returns a `type_error` node with an explanatory message.
    """
    strategy = array_strategies_by_node_id.get(path, ArrayStrategy(mode=ArrayStrategyMode.index))
    array_meta = ArrayMeta(strategy=strategy)

    try:
        match strategy.mode:
            case ArrayStrategyMode.index:
                groups = group_by_index(path=path, per_doc_arrays=per_doc_values)
            case ArrayStrategyMode.keyed:
                if not strategy.key:
                    raise ValueError(f"Keyed mode requires 'key' at array path '{path}'.")
                groups = group_by_key(path=path, per_doc_arrays=per_doc_values, key=strategy.key)
            case ArrayStrategyMode.similarity:
                raise ValueError(f"Array strategy '{strategy.mode}' not implemented yet at '{path}'.")
            case _:
                raise ValueError(f"Unrecognized array strategy '{strategy.mode}' at '{path}'.")
    except ValueError as e:
        return _build_type_error_node(
            node_id=node_id,
            parent_id=parent_id,
            path=path,
            key=key,
            kind=NodeKind.array,
            per_doc=per_doc,
            message=str(e),
            array_meta=array_meta,
            parent_path=parent_path,
            array_selector=array_selector,
        )

    children: list[DiffNode] = []
    for g in groups:
        child_path = _child_path_for_array(path, g.label)

        sel = g.selector
        if sel is None:
            # fallback: index by order in groups (rare)
            element_token: Token = ("i", int(g.label)) if g.label.isdigit() else ("o", g.label)
        else:
            if sel.mode == ArrayStrategyMode.index:
                assert sel.index is not None
                element_token = ("i", int(sel.index))
            elif sel.mode == ArrayStrategyMode.keyed:
                # Note: sel.key is the field name, sel.value is the identifier value (string)
                assert sel.key is not None
                assert sel.value is not None
                element_token = ("k", str(sel.key), str(sel.value))
            else:
                # similarity etc: define something stable for later
                element_token = ("o", g.label)

        children.append(
            build_diff_tree(
                path=child_path,
                key=g.label,
                per_doc_values=g.per_doc,
                array_strategies_by_node_id=array_strategies_by_node_id,
                parent_path=path,
                array_selector=g.selector,
                parent_id=node_id,
                parent_tokens=node_tokens,
                token=element_token,
                _budget=_budget,
            )
        )

    status = _status_from_children(children) if children else DiffStatus.same
    any_missing_array = any(not present for present, _ in per_doc_values.values())
    if any_missing_array and status == DiffStatus.same:
        status = DiffStatus.missing

    return DiffNode(
        node_id=node_id,
        parent_id=parent_id,
        path=path,
        key=key,
        kind=NodeKind.array,
        status=status,
        message=None,
        per_doc=per_doc,
        children=children,
        array_meta=array_meta,
        parent_path=parent_path,
        array_selector=array_selector,
    )


def _build_scalar_node(
    *,
    node_id: str,
    parent_id: str | None,
    path: str,
    key: str | None,
    per_doc: dict[str, ValuePresence],
    present_items: list[tuple[str, Any]],
    per_doc_values: dict[str, ValueInput],
    kind: NodeKind,
    parent_path: str | None,
    array_selector: ArraySelector | None,
) -> DiffNode:
    """
    Build a scalar leaf node and compute its status.

    Parameters
    ----------
    node_id, parent_id
        Stable opaque IDs for this node and its parent, used for identity.
    path, key
        Node identity.
    per_doc : dict[str, ValuePresence]
        Precomputed per-document presence payload for this node.
    present_items : list[tuple[str, Any]]
        (doc_id, value) for documents where this node is present.
    per_doc_values : dict[str, ValueInput]
        Per-document presence/value at this path.
    kind : NodeKind
        Node kind (should be scalar for this function, but passed explicitly).
    parent_path : str | None
        Canonical path of the parent node. Root uses None.
    array_selector : ArraySelector | None
        For array element nodes, describes how this element was selected/aligned across documents.

    Returns
    -------
    DiffNode
        Scalar leaf node with computed status.
    """
    values = [v for _, v in present_items]
    all_equal = all(v == values[0] for v in values[1:])
    any_missing = any(not present for present, _ in per_doc_values.values())

    status = (
        DiffStatus.missing
        if any_missing and all_equal
        else DiffStatus.same if all_equal and not any_missing else DiffStatus.diff
    )

    return DiffNode(
        node_id=node_id,
        parent_id=parent_id,
        path=path,
        key=key,
        kind=kind,
        status=status,
        message=None,
        per_doc=per_doc,
        children=[],
        array_meta=None,
        parent_path=parent_path,
        array_selector=array_selector,
    )


def build_diff_tree(
    *,
    path: str,
    key: str | None,
    per_doc_values: dict[str, ValueInput],
    array_strategies_by_node_id: dict[str, ArrayStrategy] | None = None,
    parent_path: str | None = None,
    array_selector: ArraySelector | None = None,
    parent_id: str | None = None,
    parent_tokens: list[Token] | None = None,
    token: Token | None = None,
    _budget: _Budget | None = None,
) -> DiffNode:
    """
    Build a `DiffNode` tree for the given path across multiple documents.

    This is the main entry point for diff construction. It takes per-document
    values at a specific path and recursively expands objects and arrays into a
    tree of `DiffNode` instances.

    Parameters
    ----------
    path : str
        Canonical path for this node. Root is "".
    key : str | None
        Display key for this node (object key or array element label). Use None
        for the root node.
    per_doc_values : dict[str, ValueInput]
        Mapping of `doc_id -> (present, value)` at this path.
        - present=False indicates the path is absent in that document.
        - present=True indicates the path exists and the corresponding `value`
          contains the parsed JSON value at that path.
    array_strategies_by_node_id : dict[str, ArrayStrategy] | None, default=None
        Mapping of array node IDs -> matching strategy configuration.
        Missing nodes use backend defaults (currently index-based).
    parent_path : str | None
        Canonical path of the parent node. Root uses None.
    array_selector : ArraySelector | None
        For array element nodes, describes how this element was selected/aligned across documents.
    parent_id : str | None
        Stable opaque ID of the parent node. Root uses None.
    parent_tokens : list[Token] | None
        List of tokens from the root to the parent node, used for generating child node IDs.
    token : Token | None
        Token for this node, used for generating the node ID. Should be None for the root node.
    _budget : _Budget | None
        Internal parameter for tracking remaining node budget.

    Returns
    -------
    DiffNode
        Root of the diff subtree for the given path.

    Raises
    ------
    TypeError
        If a value contains unsupported (non-JSON) Python types.
    LimitsExceeded
        If the total number of nodes in the diff tree exceeds the configured maximum.

    Notes
    -----
    - If no document contains the path, a `missing` node is returned.
    - If documents disagree on the JSON type at this path, a `type_error` node
      is returned with an explanatory message.
    - Container values are not embedded in `per_doc[*].value` for payload size
      reasons; consumers must use `value_type` to interpret presence.
    """
    if _budget is None:
        s = get_settings()
        _budget = _Budget(remaining=s.max_diff_nodes)

    if _budget.remaining <= 0:
        raise LimitsExceededError("Diff tree too large (node limit exceeded).")
    _budget.remaining -= 1

    if parent_tokens is None:
        parent_tokens = []

    if parent_id is None:
        # root call
        node_id = root_node_id()
        node_tokens = []
    else:
        assert token is not None
        node_id, node_tokens = child_node_id(parent_tokens, token)

    array_strategies_by_node_id = array_strategies_by_node_id or {}

    present_items: list[tuple[str, Any]] = [(doc_id, v) for doc_id, (present, v) in per_doc_values.items() if present]

    per_doc: dict[str, ValuePresence] = {
        doc_id: _presence_for_value(v, present) for doc_id, (present, v) in per_doc_values.items()
    }

    if not present_items:
        return _build_missing_node(
            node_id=node_id,
            parent_id=parent_id,
            path=path,
            key=key,
            per_doc=per_doc,
            parent_path=parent_path,
            array_selector=array_selector,
        )

    types = {json_type(v) for _, v in present_items}
    if len(types) > 1:
        type_list = sorted(types)
        msg = f"type mismatch at '{path}': " + " vs ".join(type_list)
        # Kind is ambiguous; represent as scalar with explicit error message.
        return _build_type_error_node(
            node_id=node_id,
            parent_id=parent_id,
            path=path,
            key=key,
            kind=NodeKind.scalar,
            per_doc=per_doc,
            message=msg,
            array_meta=None,
            parent_path=parent_path,
            array_selector=array_selector,
        )

    only_type = next(iter(types))
    kind = _kind_from_type(only_type)

    if only_type == "object":
        return _build_object_node(
            node_id=node_id,
            parent_id=parent_id,
            node_tokens=node_tokens,
            path=path,
            key=key,
            per_doc_values=per_doc_values,
            per_doc=per_doc,
            present_items=present_items,
            array_strategies=array_strategies_by_node_id,
            parent_path=parent_path,
            array_selector=array_selector,
            _budget=_budget,
        )

    if only_type == "array":
        return _build_array_node(
            node_id=node_id,
            parent_id=parent_id,
            node_tokens=node_tokens,
            path=path,
            key=key,
            per_doc_values=per_doc_values,
            per_doc=per_doc,
            array_strategies_by_node_id=array_strategies_by_node_id,
            parent_path=parent_path,
            array_selector=array_selector,
            _budget=_budget,
        )

    return _build_scalar_node(
        node_id=node_id,
        parent_id=parent_id,
        path=path,
        key=key,
        per_doc=per_doc,
        present_items=present_items,
        per_doc_values=per_doc_values,
        kind=kind,
        parent_path=parent_path,
        array_selector=array_selector,
    )


def build_stable_root_diff_tree(
    *,
    per_doc_values: dict[str, ValueInput],
    array_strategies_by_node_id: dict[str, ArrayStrategy],
) -> DiffNode:
    """
    Build the diff tree with a stable root node even when all documents are missing.

    This is a thin wrapper around `build_diff_tree` to handle the special case
    where all documents are missing at the root path. In that case, the standard
    `build_diff_tree` would return a node with kind=scalar and status=missing,
    which is not ideal for the UI. Instead, we override it to return a stable
    object node with status=same and no children, so the UI can reliably render a
    root object and allow the user to add fields.

    Parameters
    ----------
    per_doc_values: dict[str, ValueInput]
        Root inputs for each document.
    array_strategies_by_node_id: dict[str, ArrayStrategy]
        Array strategies for each node.

    Returns
    -------
    DiffNode
        The stable root diff tree node.
    """
    root = build_diff_tree(
        path="",
        key=None,
        per_doc_values=per_doc_values,
        array_strategies_by_node_id=array_strategies_by_node_id,
        parent_path=None,
        array_selector=None,
        parent_id=None,
        parent_tokens=None,
        token=None,
    )

    # If nothing parsed, root builder returns missing-ish node; override to stable object
    # so UI has a predictable root.
    if all(not present for present, _ in per_doc_values.values()):
        root.kind = NodeKind.object
        root.status = DiffStatus.same
        root.children = []
        root.per_doc = {
            doc_id: ValuePresence(present=False, value=None, value_type=None) for doc_id in per_doc_values.keys()
        }

    return root
