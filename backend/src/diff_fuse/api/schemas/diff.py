from __future__ import annotations

from enum import Enum
from typing import Any

from pydantic import BaseModel, Field

# ---- Input ----


class DocumentFormat(str, Enum):
    json = "json"


class InputDocument(BaseModel):
    doc_id: str = Field(..., description="Stable id provided by client (e.g., uuid).")
    name: str = Field(..., description="Display name shown in the UI.")
    format: DocumentFormat = Field(DocumentFormat.json, description="Declared format of `content`.")
    content: str = Field(..., description="Raw document text.")


class ArrayStrategyMode(str, Enum):
    index = "index"
    keyed = "keyed"
    similarity = "similarity"


class ArrayStrategy(BaseModel):
    mode: ArrayStrategyMode = ArrayStrategyMode.index
    key: str | None = Field(
        default=None,
        description="Only used when mode=keyed. The object key to match elements on.",
    )
    similarity_threshold: float | None = Field(default=None, ge=0.0, le=1.0)


class DiffRequest(BaseModel):
    documents: list[InputDocument] = Field(..., min_length=2)
    # Per-array-path strategy; empty means "use defaults"
    array_strategies: dict[str, ArrayStrategy] = Field(default_factory=dict)


# ---- Output ----


class DiffStatus(str, Enum):
    same = "same"
    diff = "diff"
    missing = "missing"
    type_error = "type_error"


class NodeKind(str, Enum):
    scalar = "scalar"
    object = "object"
    array = "array"


class ValuePresence(BaseModel):
    """
    For a given node/path, what does a particular document have?
    - present=False means the key/path doesn't exist in that doc.
    - present=True + value=None means it exists and is JSON null (important difference).
    """

    present: bool
    value: Any | None = None
    value_type: str | None = Field(
        default=None,
        description="Normalized type label, e.g. 'string','number','boolean','null','object','array'.",
    )


class ArrayMeta(BaseModel):
    """
    Only included when kind=array.
    Used to surface per-array mode and matching info to the UI.
    """

    strategy: ArrayStrategy


class DiffNode(BaseModel):
    """
    Tree node representing a path in the document structure.
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


class DocumentMeta(BaseModel):
    doc_id: str
    name: str
    format: DocumentFormat
    # parse/validation feedback
    ok: bool = True
    error: str | None = None


class DiffResponse(BaseModel):
    documents: list[DocumentMeta]
    root: DiffNode
