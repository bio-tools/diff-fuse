"""
Merge service.

This module implements the service-layer logic for producing merged
documents based on a diff and user selections.
"""

from typing import Any

from diff_fuse.api.dto.diff import DiffRequest
from diff_fuse.api.dto.merge import MergeRequest, MergeResponse
from diff_fuse.domain.merge import try_merge_from_diff_tree
from diff_fuse.models.merge import MergeSelection
from diff_fuse.services.diff_service import diff_in_session
from diff_fuse.services.shared import fetch_session


def build_merged(
    session_id: str,
    diff_req: DiffRequest,
    selections: dict[str, MergeSelection],
) -> tuple[Any, list[str]]:
    """
    Compute merged output for a session.

    Parameters
    ----------
    session_id : str
        Session identifier.
    diff_req : DiffRequest
        Diff configuration used to rebuild the diff tree.
    selections : dict[str, MergeSelection]
        Mapping from canonical path -> merge selection.

    Returns
    -------
    tuple[Any, list[str]]
        A tuple containing:
        - merged : Any
            The merged JSON-like structure.
        - unresolved_paths : list[str]
            Paths that could not be resolved automatically.
    """
    diff_response = diff_in_session(session_id=session_id, req=diff_req)
    merged, unresolved_paths = try_merge_from_diff_tree(diff_response.root, selections)
    return merged, unresolved_paths


def merge_in_session(session_id: str, req: MergeRequest) -> MergeResponse:
    """
    Apply merge selections for an existing session.

    Parameters
    ----------
    session_id : str
        Identifier of the target session.
    req : MergeRequest
        Merge configuration including:
        - diff request (array strategies)
        - per-path selections

    Returns
    -------
    MergeResponse
        Contains the merged output and any unresolved conflict paths.
    """
    # Ensure session exists (fail fast with proper domain error)
    _ = fetch_session(session_id)

    merged, unresolved_paths = build_merged(
        session_id=session_id,
        diff_req=req.diff_request,
        selections=req.selections,
    )

    return MergeResponse(merged=merged, unresolved_paths=unresolved_paths)
