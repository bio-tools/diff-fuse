from enum import Enum
from typing import Any

from pydantic import Field

from diff_fuse.models.api import APIModel


class ArrayStrategyMode(str, Enum):
    """
    Array matching strategy mode.

    Attributes
    ----------
    index : str
        Match array elements by their positional index.
    keyed : str
        Match array elements by a key field inside each element (element must be
        a JSON object). The key to use is provided by `ArrayStrategy.key`.
    similarity : str
        Match array elements by similarity (planned). Not yet implemented.
    """

    index = "index"
    keyed = "keyed"
    similarity = "similarity"


class ArrayStrategy(APIModel):
    """
    Per-array configuration controlling how array elements are matched.

    Attributes
    ----------
    mode : ArrayStrategyMode
        Strategy mode.
    key : str | None
        Only used when `mode="keyed"`. The object field name to match elements on.
        Example: key="id" or key="name".
    similarity_threshold : float | None
        Only used when `mode="similarity"`. Interpreted as a normalized threshold
        in [0.0, 1.0]. (Exact semantics depend on future similarity implementation.)
    """

    mode: ArrayStrategyMode = ArrayStrategyMode.index
    key: str | None = Field(
        default=None,
        description="Only used when mode=keyed. The object key to match elements on.",
    )
    similarity_threshold: float | None = Field(
        default=None,
        ge=0.0,
        le=1.0,
        description="Only used when mode=similarity. Threshold in [0.0, 1.0].",
    )


class ArrayGroup:
    """
    A group representing one aligned array element across documents.

    Each group corresponds to one array position.
    For each document we record whether an element exists and,
    if present, the element value.

    Attributes
    ----------
    label : str
        Human-readable label for the group.
        In index mode this is the index rendered as a string (e.g., "0", "1").
        In keyed mode this is "<key>=<identifier>".
    per_doc : dict[str, tuple[bool, Any | None]]
        Mapping of `doc_id -> (present, element_value)` where:
        - present=False means the element is missing at this position for that document
        - present=True means an element exists at this position for that document and element_value
          is the element's JSON value (can be any JSON-compatible Python value)
    """

    label: str
    per_doc: dict[str, tuple[bool, Any | None]]  # doc_id -> (present, element_value)
