"""
DTOs for array key suggestion endpoints.

This module defines the request/response models used by the API endpoint
that analyzes arrays of objects and suggests candidate keys suitable for
keyed array matching.
"""

from pydantic import Field

from diff_fuse.api.dto.base import APIModel
from diff_fuse.models.array_keys import KeySuggestion


class SuggestArrayKeysRequest(APIModel):
    """
    Request payload for array key suggestion.

    Attributes
    ----------
    path : str
        Canonical path to the target array node (e.g., ``"steps"`` or
        ``"a.b[0].steps"``). The path must resolve to an array in at least
        one document.
    top_k : int
        Maximum number of suggestions to return.
        Constraints:
        - Minimum: -1 (no limit)
        - Maximum: 50
    """

    path: str = Field(..., description="Array node path (e.g. 'steps' or 'a.b[0].steps').")
    top_k: int = Field(default=-1, ge=-1, le=50)


class SuggestArrayKeysResponse(APIModel):
    """
    Response payload containing ranked key suggestions.

    Attributes
    ----------
    path : str
        The array path that was analyzed. Echoed from the request for
        convenience and client-side validation.
    suggestions : list[KeySuggestion]
        Ranked list of candidate keys, ordered by descending confidence
        score. The list may be empty if no suitable keys were detected.
    """

    path: str
    suggestions: list[KeySuggestion]
