"""
DTOs for merge computation within a session.

This module defines the request and response models used by the merge
endpoints. The merge operation applies user selections to the diff tree
derived from session documents and produces a merged result.

Notes
-----
The merge operates on documents already stored in the session. The
client provides only strategy overrides and selection decisions.
"""

from typing import Any

from pydantic import Field

from diff_fuse.api.dto.base import APIModel
from diff_fuse.models.merge import MergeSelection

from .diff import DiffRequest


class MergeRequest(APIModel):
    """
    Request payload for computing a merged document.

    Attributes
    ----------
    diff_request : DiffRequest
        Diff configuration reused during merge, primarily to supply
        per-path array strategies.
        Rationale:
        Keeping this nested ensures the frontend can reuse the same
        configuration object for both diff and merge operations.
    selections : dict[str, MergeSelection]
        Mapping from canonical path -> user selection.
        Semantics:
        - Keys must match ``DiffNode.path`` values.
        - Each selection determines which document (or manual value)
          is chosen at that location.
        - Selections inherit down the subtree unless overridden.

    Notes
    -----
    Missing selections for conflicting nodes will result in unresolved
    paths in the response.
    """

    # Keep same shape as diff request to avoid frontend duplication.
    diff_request: DiffRequest = Field(
        ...,
        description="Diff configuration reused during merge.",
    )

    selections: dict[str, MergeSelection] = Field(
        default_factory=dict,
        description="Map path -> selection (doc/manual).",
    )


class MergeResponse(APIModel):
    """
    Response payload containing the merged output.

    Attributes
    ----------
    merged : Any
        The merged JSON-like structure produced after applying
        selections. The structure matches the input document shape.
    unresolved_paths : list[str]
        Canonical paths that could not be resolved due to missing
        selections.
        Behavior:
        - Empty list -> merge fully resolved.
        - Non-empty -> client should prompt the user for decisions.

    Notes
    -----
    The backend performs a best-effort merge even when unresolved
    conflicts remain.
    """

    merged: Any
    unresolved_paths: list[str] = Field(default_factory=list)
