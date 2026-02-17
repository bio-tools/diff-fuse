"""
Diff service.

This module implements the service-layer logic for computing structural
diffs between documents stored in a session.
"""

from __future__ import annotations

from diff_fuse.api.dto.diff import DiffRequest, DiffResponse
from diff_fuse.domain.diff import build_stable_root_diff_tree
from diff_fuse.models.arrays import ArrayStrategy
from diff_fuse.models.diff import DiffNode
from diff_fuse.models.document import ValueInput
from diff_fuse.services.shared import fetch_session


def build_diff_root(
    root_inputs: dict[str, ValueInput],
    array_strategies: dict[str, ArrayStrategy],
) -> DiffNode:
    """
    Build the root diff tree for a set of normalized documents.

    Parameters
    ----------
    root_inputs : dict[str, ValueInput]
        Mapping ``doc_id -> (present, normalized_value)`` derived from the
        session's document results.
    array_strategies : dict[str, ArrayStrategy]
        Optional per-path overrides controlling how arrays are aligned.

    Returns
    -------
    DiffNode
        Root node of the computed diff tree.

    Notes
    -----
    The root path is always the empty string ``""``.
    """
    root = build_stable_root_diff_tree(
        per_doc_values=root_inputs,
        array_strategies=array_strategies,
    )
    return root


def diff_in_session(session_id: str, req: DiffRequest) -> DiffResponse:
    """
    Compute a diff for an existing session.

    Parameters
    ----------
    session_id : str
        Identifier of the session to diff.
    req : DiffRequest
        Diff configuration (currently array strategies).

    Returns
    -------
    DiffResponse
        Response containing the diff tree.
    """
    s = fetch_session(session_id)

    root = build_diff_root(
        root_inputs=s.root_inputs,
        array_strategies=req.array_strategies,
    )

    return DiffResponse(root=root)
