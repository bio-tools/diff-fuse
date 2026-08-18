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

from diff_fuse.models.arrays import ArrayStrategy
from diff_fuse.models.base import DiffFuseModel
from diff_fuse.models.diff import DiffNode, NullMode


class DiffRequest(DiffFuseModel):
    """
    Request payload for computing a diff within a session.

    Attributes
    ----------
    array_strategies_by_node_id : dict[str, ArrayStrategy]
        Optional per-node overrides controlling how arrays are matched.
        Keys are canonical node IDs.
        Behavior:
        - Missing paths use the backend default strategy.
        - Provided paths override the strategy only at that location.
    null_mode : NullMode
        How JSON null is interpreted when comparing documents. Defaults to
        `NullMode.missing`, where a null means "no value" just like an absent key.
        Use `NullMode.value` to treat null as an ordinary value whose type can
        conflict with others.

    Notes
    -----
    This request does **not** include documents; documents are retrieved
    from the session identified in the route.

    `null_mode` should be sent consistently to the diff, merge and export
    endpoints: each rebuilds the tree from the request, and changing the mode
    changes which nodes exist, so selections keyed by node id may no longer match.
    """

    array_strategies_by_node_id: dict[str, ArrayStrategy] = Field(default_factory=dict)
    null_mode: NullMode = Field(
        default=NullMode.missing,
        description="How JSON null is interpreted. 'missing' treats null as no value.",
    )


class DiffResponse(DiffFuseModel):
    """
    Response payload containing the computed diff tree.

    Attributes
    ----------
    root : DiffNode
        Root of the hierarchical diff tree.
        The root node has:
        - ``path == ""``
        - ``key is None``
    """

    root: DiffNode
