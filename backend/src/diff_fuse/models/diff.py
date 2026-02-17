from __future__ import annotations

from enum import Enum
from typing import Any, Literal

from pydantic import Field

from diff_fuse.models.api import APIModel
from diff_fuse.models.arrays import ArrayStrategy

JsonType = Literal["object", "array", "string", "number", "boolean", "null"]


class DiffStatus(str, Enum):
    """
    Diff status for a node.

    Attributes
    ----------
    same : str
        All present values at this node are equal and no document is missing the node.
    diff : str
        At least two documents have different values at this node (same type).
    missing : str
        At least one document is missing the node/path, but all present values agree.
    type_error : str
        Documents disagree on the JSON type at this node, or an array strategy is
        invalid for the data at this node.
    """

    same = "same"
    diff = "diff"
    missing = "missing"
    type_error = "type_error"


class NodeKind(str, Enum):
    """
    JSON structural kind of a node.

    Attributes
    ----------
    scalar : str
        A JSON scalar leaf (string/number/boolean/null).
    object : str
        A JSON object (mapping).
    array : str
        A JSON array (sequence).
    """

    scalar = "scalar"
    object = "object"
    array = "array"


class ValuePresence(APIModel):
    """
    Per-document value/presence information for a single diff node.

    This structure answers: for a given `DiffNode.path`, what does each document
    contain?

    Attributes
    ----------
    present : bool
        Whether the path exists in that document.
        - False means the key/path does not exist.
        - True means the key/path exists (even if the value is JSON null).
    value : Any | None
        The value at the node, when included.

        Important distinction
        ---------------------
        - `present=False` means the path does not exist.
        - `present=True` and `value=None` can mean either:
          (a) the node exists and its JSON value is null, OR
          (b) the backend chose not to embed a container value (object/array) for
              payload size reasons.

        Use `value_type` and `DiffNode.kind` to interpret this correctly.
    value_type : str | None
        Normalized JSON type label (e.g., "string", "number", "boolean", "null",
        "object", "array"). When `present=False`, this may be None.

    Notes
    -----
    Implementations commonly omit `value` for container nodes (object/array).
    """

    present: bool
    value: Any | None = None
    value_type: JsonType | None = Field(
        default=None,
        description="Normalized type label",
    )


class ArrayMeta(APIModel):
    """
    Extra metadata for array nodes.

    Attributes
    ----------
    strategy : ArrayStrategy
        The effective strategy applied to this array node.

    Notes
    -----
    This is included only when `DiffNode.kind == NodeKind.array`.
    """

    strategy: ArrayStrategy


class DiffNode(APIModel):
    """
    A node in the diff tree.

    Each node corresponds to a canonical `path` in the document structure and
    records (a) the node's structural kind, (b) its diff status, and (c) per-document
    presence/value information.

    Attributes
    ----------
    path : str
        Canonical path identifier (e.g., "a.b[0].c"). Root is "".
    key : str | None
        The final path segment (object key or array element label) used for UI display.
        For the root node, this is None.
    kind : NodeKind
        Structural kind at this node.
    status : DiffStatus
        Diff status at this node.
    message : str | None
        Optional explanation when `status == "type_error"`, such as:
        - type mismatch: "number vs string"
        - invalid array strategy: missing keyed `key`, etc.
    per_doc : dict[str, ValuePresence]
        Mapping from `doc_id` -> per-document presence/value information.
    children : list[DiffNode]
        Child nodes when `kind` is object or array.
        The backend guarantees stable ordering:
        - object children are sorted by object key
        - array children ordering depends on strategy (e.g., index ascending)
    array_meta : ArrayMeta | None
        Present only for array nodes, to surface strategy configuration to the UI.

    Notes
    -----
    - `path` values are unique within the tree and can be used as stable identifiers
      for selections and UI state.
    - Container nodes (object/array) generally do not embed `per_doc[*].value`.
    """

    path: str = Field(..., description="Canonical path like 'a.b[0].c'. Root is ''")
    key: str | None = Field(
        default=None,
        description="The last segment of the path (object key or array index label).",
    )
    kind: NodeKind
    status: DiffStatus
    message: str | None = Field(default=None, description="Optional explanation for type_error or strategy failure.")

    per_doc: dict[str, ValuePresence] = Field(
        ...,
        description="Map doc_id -> presence/value at this node/path.",
    )

    children: list[DiffNode] = Field(default_factory=list)
    array_meta: ArrayMeta | None = None


# DiffNode.model_rebuild()
