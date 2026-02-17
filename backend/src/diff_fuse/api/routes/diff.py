"""
Diff computation API routes.

This module exposes endpoints for computing structural diffs within an
existing session. The session must already contain the uploaded documents.

Notes
-----
The diff operation is stateless with respect to selections but depends on:
- the session's stored documents
- the provided per-path array strategies
"""

from fastapi import APIRouter

from diff_fuse.api.dto.diff import DiffRequest, DiffResponse
from diff_fuse.services.diff_service import diff_in_session

router = APIRouter()


@router.post("/{session_id}/diff", response_model=DiffResponse)
def diff(session_id: str, req: DiffRequest) -> DiffResponse:
    """
    Compute the diff tree for a session.

    This endpoint builds a structural diff across all documents stored in
    the specified session. The result is a hierarchical tree of `DiffNode`
    objects that the UI can render side-by-side.

    Parameters
    ----------
    session_id : str
        Identifier of the session containing the documents to compare.
    req : DiffRequest
        Diff configuration payload, containing per-array
        matching strategies.

    Returns
    -------
    DiffResponse
        The computed diff tree rooted at the document root.

    Raises
    ------
    DomainError
        If the session does not exist or has expired.

    Notes
    -----
    - The diff is recomputed on each call using cached normalized documents.
    - Array handling behavior depends on `array_strategies`.
    - The returned tree uses stable canonical paths suitable for UI state.
    """
    return diff_in_session(session_id, req)
