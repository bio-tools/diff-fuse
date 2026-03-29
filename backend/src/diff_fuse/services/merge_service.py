"""
Merge service.

This module implements the service-layer logic for producing merged
documents based on a diff and user selections.
"""

from typing import Any

from diff_fuse.api.dto.diff import DiffRequest
from diff_fuse.api.dto.merge import MergeRequest, MergeResponse
from diff_fuse.domain.merge import try_merge_from_diff_tree_with_refs
from diff_fuse.models.merge import MergedNodeRef, MergeSelection
from diff_fuse.services.diff_service import diff_in_session


def build_merged(
    session_id: str,
    diff_req: DiffRequest,
    selections_by_node_id: dict[str, MergeSelection],
) -> tuple[Any, list[str], dict[str, MergedNodeRef]]:
    """
    Compute merged output for a session.

    Parameters
    ----------
    session_id : str
        Session identifier.
    diff_req : DiffRequest
        Diff configuration used to rebuild the diff tree.
    selections_by_node_id : dict[str, MergeSelection]
        Mapping from node ID -> merge selection.

    Returns
    -------
    tuple[Any, list[str], dict[str, MergedNodeRef]]
        A tuple containing:
        - merged : Any
            The merged JSON-like structure.
        - unresolved_paths : list[str]
            Paths that could not be resolved automatically.
        - resolved_ref_by_node_id : dict[str, MergedNodeRef]
            Mapping from node ID to resolved node reference.
    """
    diff_response = diff_in_session(session_id=session_id, req=diff_req)
    merged, unresolved_node_ids, resolved_ref_by_node_id = try_merge_from_diff_tree_with_refs(
        diff_response.root,
        selections_by_node_id,
    )
    return merged, unresolved_node_ids, resolved_ref_by_node_id


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
        - per-node selections

    Returns
    -------
    MergeResponse
        Contains the merged output and any unresolved conflicts.
    """
    # Ensure session exists (fail fast with proper domain error)
    # _ = fetch_session(session_id)

    merged, unresolved_node_ids, resolved_ref_by_node_id = build_merged(
        session_id=session_id,
        diff_req=req.diff_request,
        selections_by_node_id=req.selections_by_node_id,
    )

    return MergeResponse(
        merged=merged,
        unresolved_node_ids=unresolved_node_ids,
        resolved_ref_by_node_id=resolved_ref_by_node_id,
    )
