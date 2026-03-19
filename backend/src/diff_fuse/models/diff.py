"""
Diff tree models.

This module defines the core data structures returned by the diff engine.
The diff engine compares multiple normalized JSON-like documents and produces
a tree of nodes describing structural alignment, differences, and per-document
presence at each canonical node ID.
"""

from __future__ import annotations

from enum import StrEnum
from typing import Any, Literal

from pydantic import Field

from diff_fuse.models.arrays import ArraySelector, ArrayStrategy
from diff_fuse.models.base import DiffFuseModel

JsonType = Literal["object", "array", "string", "number", "boolean", "null"]
"""
Normalized JSON type label.

This type is used in API payloads to describe values in a uniform way,
independent of Python implementation details.
"""


class DiffStatus(StrEnum):
    """
    Diff status for a node.

    Attributes
    ----------
    same : str
        All documents that contain this node agree on the value, and no document
        is missing the node.
    diff : str
        At least two documents contain this node but disagree on its value.
        All present values share the same JSON type.
    missing : str
        At least one document is missing this node/path, but all documents that
        contain it agree on its value.
        Missingness is tracked separately from JSON null:
        - missing means the key/path does not exist
        - null means it exists and the value is JSON null
    type_error : str
        A structural/type-level issue prevents a meaningful value diff at this node.
        Example scenarios:
        - One document has an object while another has a string at the same path.
        - An array strategy is invalid for the actual array contents (e.g. keyed
          strategy but elements are not objects).
    """

    same = "same"
    diff = "diff"
    missing = "missing"
    type_error = "type_error"


class NodeKind(StrEnum):
    """
    Structural kind of a diff node.

    Attributes
    ----------
    scalar : str
        A JSON scalar leaf (string/number/boolean/null).
    object : str
        A JSON object.
    array : str
        A JSON array.
    """

    scalar = "scalar"
    object = "object"
    array = "array"


class ValuePresence(DiffFuseModel):
    """
    Per-document presence/value information for a single node.

    This structure answers: for a given diff node (identified by its canonical
    node ID), what does each document contain?

    Attributes
    ----------
    present : bool
        Whether the node exists in the document.
        - False means the node does not exist.
        - True means the node exists (even if the value is JSON null).
    value : Any | None
        The value at the node, when embedded in the response.
        Interpretation rules:
        - present=False always means "missing" regardless of `value`.
        - present=True and value=None can mean either:
          (a) the value is JSON null, or
          (b) the backend intentionally omitted a container value (object/array)
              to keep payloads small.
              Use `value_type` and the node's `kind` to interpret `None` correctly.
    value_type : JsonType | None
        Normalized JSON type label for the value.
        - When present=False, this is typically None.
        - When present=True, this is one of the JsonType literals.

    Notes
    -----
    Implementations commonly omit `value` for container nodes (object/array).
    """

    present: bool
    value: Any | None = None
    value_type: JsonType | None = Field(default=None, description="Normalized JSON type label.")


class ArrayMeta(DiffFuseModel):
    """
    Extra metadata attached to array nodes.

    Attributes
    ----------
    strategy : ArrayStrategy
        The effective array strategy applied at this array node.

    Notes
    -----
    This is only included when `DiffNode.kind == NodeKind.array`.
    """

    strategy: ArrayStrategy


class DiffNode(DiffFuseModel):
    """
    Node in the diff tree.

    Each node corresponds to a canonical path and describes:
    - structural kind (scalar/object/array)
    - diff status (same/diff/missing/type_error)
    - per-document presence/value information
    - child nodes for object/array structures

    Attributes
    ----------
    node_id : str
        Stable opaque ID for this node (safe identifier).
    parent_id : str | None
        Stable opaque ID of the parent node. Root uses None.
    path : str
        Canonical path identifier (e.g., ``"a.b[0].c"``). The root path is ``""``.
    key : str | None
        Key for object nodes, or None for the root and array nodes. This is used for display purposes.
    kind : NodeKind
        Structural kind of the node.
    status : DiffStatus
        Diff status of the node.
    message : str | None
        Optional explanation, typically used when `status == "type_error"`.
        Example messages:
        - ``"type mismatch at 'x': number vs string"``
        - ``"Keyed mode requires 'key' at array path 'items'"``
    per_doc : dict[str, ValuePresence]
        Mapping from ``doc_id`` to per-document presence/value information at this node.
    children : list[DiffNode]
        Child nodes for object and array nodes.
        Ordering guarantees:
        - Object children are sorted by object key.
        - Array children ordering depends on the applied array strategy (e.g., index
          ascending or stable keyed ordering).
    array_meta : ArrayMeta | None
        Present only for array nodes, to surface array strategy configuration.
    parent_path : str | None
        Canonical path of the parent node. The root node has `parent_path = None`.
    array_selector : ArraySelector | None
        For array element nodes, describes how this element was selected/aligned across documents.

    Notes
    -----
    - Container nodes generally omit embedded values in `per_doc[*].value`.
    """

    node_id: str = Field(..., description="Stable opaque id for this node (safe identifier).")
    parent_id: str | None = Field(default=None, description="Stable opaque id of the parent node. Root uses None.")

    path: str = Field(..., description="Display path. Do not use for identity.")
    key: str | None = Field(..., description="Display key/label.")

    kind: NodeKind
    status: DiffStatus
    message: str | None = Field(default=None, description="Explanation for type errors or strategy failures.")

    per_doc: dict[str, ValuePresence] = Field(..., description="Map doc_id -> presence/value at this node/path.")
    children: list[DiffNode] = Field(default_factory=list)
    array_meta: ArrayMeta | None = None
    parent_path: str | None = Field(
        default=None,
        description="Canonical parent path. Root uses None.",
    )
    array_selector: ArraySelector | None = Field(
        default=None,
        description="For array element nodes only: describes the selector used.",
    )
