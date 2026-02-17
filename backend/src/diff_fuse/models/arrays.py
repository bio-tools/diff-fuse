"""
Array matching models and configuration.

This module defines the configuration structures used to control how
array elements are aligned across documents during diff computation.
"""

from enum import StrEnum

from pydantic import Field

from diff_fuse.api.dto.base import APIModel
from diff_fuse.models.document import ValueInput


class ArrayStrategyMode(StrEnum):
    """
    Array element matching strategy.

    Attributes
    ----------
    index : str
        Match elements by positional index.
        Example:
        ``arr[0]`` aligns across all documents.
    keyed : str
        Match elements by a key field inside each object element.
        Requirements:
        - Elements must be JSON objects.
        - The configured key must exist in each element.
        - Key values should be unique (per document).
    similarity : str
        Match elements using a similarity heuristic (planned feature).
    """

    index = "index"
    keyed = "keyed"
    similarity = "similarity"


class ArrayStrategy(APIModel):
    """
    Per-array matching configuration.

    This model controls how a specific array path should be aligned during
    diff computation.

    Attributes
    ----------
    mode : ArrayStrategyMode
        Matching strategy to apply.

    key : str | None
        Object field used for keyed matching (required when
        ``mode="keyed"``).
        Example:
        - ``"id"``
        - ``"name"``
    similarity_threshold : float | None
        Threshold used by the similarity matcher (future feature).
        Must lie in the closed interval ``[0.0, 1.0]``.

    Notes
    -----
    If a strategy is invalid for the actual data (e.g., keyed mode on
    non-object arrays), the diff engine will surface an error
    at the corresponding array node.
    """

    mode: ArrayStrategyMode = ArrayStrategyMode.index
    key: str | None = Field(
        default=None,
        description="Object field used for keyed matching (mode=keyed).",
    )
    similarity_threshold: float | None = Field(
        default=None,
        ge=0.0,
        le=1.0,
        description="Similarity threshold in [0.0, 1.0] (mode=similarity).",
    )


class ArrayGroup(APIModel):
    """
    Internal representation of one aligned array element.

    Each group represents a single logical position in the aligned array
    across all documents.

    Attributes
    ----------
    label : str
        Human-readable identifier for the group.
        Conventions:
        - index mode -> ``"0"``, ``"1"``, ...
        - keyed mode -> ``"<key>=<identifier>"``
    per_doc : dict[str, ValueInput]
        Mapping of ``doc_id`` to element presence and value.
    """

    label: str
    per_doc: dict[str, ValueInput]
