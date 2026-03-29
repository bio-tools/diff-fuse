"""
DTOs for array key suggestion endpoints.

This module defines the request/response models used by the API endpoint
that analyzes arrays of objects and suggests candidate keys suitable for
keyed array matching.
"""

from pydantic import Field

from diff_fuse.models.array_keys import KeySuggestion
from diff_fuse.models.base import DiffFuseModel


class SuggestArrayKeysRequest(DiffFuseModel):
    """
    Request payload for array key suggestion.

    Attributes
    ----------
    node_id : str
        Canonical ID of the target array node. The node ID must resolve to an array in at least
        one document.
    top_k : int
        Maximum number of suggestions to return.
        Constraints:
        - Minimum: -1 (no limit)
        - Maximum: 50
    """

    node_id: str = Field(..., description="Array node ID.")
    top_k: int = Field(default=-1, ge=-1, le=50)


class SuggestArrayKeysResponse(DiffFuseModel):
    """
    Response payload containing ranked key suggestions.

    Attributes
    ----------
    node_id : str
        The array node ID that was analyzed. Echoed from the request for
        convenience and client-side validation.
    suggestions : list[KeySuggestion]
        Ranked list of candidate keys, ordered by descending confidence
        score. The list may be empty if no suitable keys were detected.
    """

    node_id: str
    suggestions: list[KeySuggestion]
