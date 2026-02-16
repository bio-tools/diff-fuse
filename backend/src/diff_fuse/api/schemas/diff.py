"""
Diff API schemas.

These Pydantic models define the public request/response contract for computing
structural diffs across multiple documents and representing the result as a tree.

Core concepts
-------------
- Document: A named, typed input blob (currently JSON text) identified by `doc_id`.
- Diff tree: A tree of nodes (`DiffNode`) where each node corresponds to a canonical
  `path` into the document structure.
- Presence: For each node, `per_doc` describes whether the node exists in each
  document and (for scalar nodes) what the value is.
- Status: Each node has a `DiffStatus` describing whether documents agree, differ,
  are missing data, or have incompatible types.

Path format
-----------
Paths are canonical strings used as stable identifiers for diff nodes:
- Object keys are joined with dot notation: "a.b.c"
- Array elements are represented with bracket notation: "items[0]"
- The root path is the empty string: ""

The backend guarantees that `DiffNode.path` values are unique within a diff tree.

Array strategies
----------------
Arrays can be compared element-wise using different strategies (`ArrayStrategy`).
The strategy is chosen per array node path via `DiffRequest.array_strategies`.

Notes
-----
- The API is designed for N-way diffs (N >= 2).
- For performance and payload size, container nodes (objects/arrays) may omit
  embedded values (i.e., `ValuePresence.value` may be `None` even when present).
  The `value_type` still indicates the node's JSON type.

See Also
--------
diff_fuse.api.schemas.merge.MergeSelection
    Merge selection schema uses `DiffNode.path` as the key.
diff_fuse.api.schemas.session.SessionDiffRequest
    Session-based diff requests reuse `array_strategies`.
"""

from __future__ import annotations

from enum import Enum
from typing import Any

from pydantic import Field

from diff_fuse.api.schemas.api import APIModel

# ---- Input ----


class DocumentFormat(str, Enum):
    """
    Supported input document formats.

    Attributes
    ----------
    json : str
        JSON text input. This is the only supported format currently.
    """

    json = "json"


class InputDocument(APIModel):
    """
    Client-supplied document used for diff and merge operations.

    Attributes
    ----------
    doc_id : str
        Stable identifier provided by the client (e.g., UUID). This identifier is
        used throughout the API to refer to the same document.
    name : str
        Human-readable name to show in the UI.
    format : DocumentFormat
        Declared format of `content`. The backend may reject unsupported formats.
    content : str
        Raw document text.

    Notes
    -----
    - `doc_id` must be unique within a request/session.
    - Parsing/validation errors are surfaced via `DocumentMeta` in responses.
    """

    doc_id: str = Field(..., description="Stable id provided by client (e.g., uuid).")
    name: str = Field(..., description="Display name shown in the UI.")
    format: DocumentFormat = Field(DocumentFormat.json, description="Declared format of `content`.")
    content: str = Field(..., description="Raw document text.")


# ---- Output ----


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
    value_type: str | None = Field(
        default=None,
        description="Normalized type label, e.g. 'string','number','boolean','null','object','array'.",
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

    children: list["DiffNode"] = Field(default_factory=list)
    array_meta: ArrayMeta | None = None


DiffNode.model_rebuild()


class DocumentMeta(APIModel):
    """
    Parse/validation status for a document included in a diff/merge operation.

    Attributes
    ----------
    doc_id : str
        The document identifier as provided by the client.
    name : str
        The document display name as provided by the client.
    format : DocumentFormat
        The declared document format.
    ok : bool
        Whether the document was successfully parsed/normalized.
    error : str | None
        Human-readable parse/validation error, when `ok=False`.
    """

    doc_id: str
    name: str
    format: DocumentFormat
    # parse/validation feedback
    ok: bool = True
    error: str | None = None
