"""
Merge computation API routes.

This module exposes endpoints for producing a merged document within an
existing session. The merge operation applies user selections on top of the
computed diff tree to synthesize a single output document.

Notes
-----
The merge operation depends on:
- the session's stored documents
- the diff configuration (array strategies)
- the user-provided path selections
"""

from fastapi import APIRouter

from diff_fuse.api.dto.merge import MergeRequest, MergeResponse
from diff_fuse.services.merge_service import merge_in_session

router = APIRouter()


@router.post("/{session_id}/merge", response_model=MergeResponse)
def merge(session_id: str, req: MergeRequest) -> MergeResponse:
    """
    Produce a merged document for a session.

    This endpoint applies the provided path selections to the session's
    documents and returns the synthesized merged output. Any unresolved
    conflicts are reported explicitly.

    Parameters
    ----------
    session_id : str
        Identifier of the session containing the documents to merge.
    req : MergeRequest
        Merge configuration including:
        - diff configuration (array strategies)
        - per-path merge selections

    Returns
    -------
    MergeResponse
        The merged document along with any unresolved conflict paths.

    Raises
    ------
    DomainError
        If the session does not exist or has expired.

    Notes
    -----
    - Merge behavior is deterministic given the same selections.
    - Container nodes inherit selections down the tree unless overridden.
    - Paths listed in `unresolved_paths` require user intervention.
    """
    return merge_in_session(session_id, req)
