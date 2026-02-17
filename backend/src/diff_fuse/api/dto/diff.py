"""
DTOs for diff computation within a session.

This module defines the request and response models used by the diff
endpoints. The diff operation compares the documents stored in a session
and produces a structured tree describing similarities, differences,
and missing values.

Notes
-----
The diff operates on normalized documents already stored in the session.
"""

from pydantic import Field

from diff_fuse.api.dto.base import APIModel
from diff_fuse.models.arrays import ArrayStrategy
from diff_fuse.models.diff import DiffNode


class DiffRequest(APIModel):
    """
    Request payload for computing a diff within a session.

    Attributes
    ----------
    array_strategies : dict[str, ArrayStrategy]
        Optional per-path overrides controlling how arrays are matched.
        Keys are canonical array paths (e.g., ``"steps"`` or
        ``"pipeline.tasks"``).
        Behavior:
        - Missing paths use the backend default strategy.
        - Provided paths override the strategy only at that location.

    Notes
    -----
    This request does **not** include documents; documents are retrieved
    from the session identified in the route.
    """

    array_strategies: dict[str, ArrayStrategy] = Field(default_factory=dict)


class DiffResponse(APIModel):
    """
    Response payload containing the computed diff tree.

    Attributes
    ----------
    root : DiffNode
        Root of the hierarchical diff tree.
        The root node has:
        - ``path == ""``
        - ``key is None``

    Notes
    -----
    The returned tree contains stable paths that the client can use for:
    - rendering side-by-side comparisons
    - driving merge selections
    - requesting array key suggestions
    """

    root: DiffNode
