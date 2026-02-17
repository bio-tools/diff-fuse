"""
Session creation API routes.

This module exposes endpoints for creating diff/merge sessions.
A session persists uploaded documents server-side and returns a
`session_id` that clients use for subsequent operations.

Notes
-----
Session creation does not perform heavy diff/merge computation.
It primarily stores documents and prepares normalized metadata
for later operations.
"""

from fastapi import APIRouter

from diff_fuse.api.dto.session import AddDocsSessionRequest, SessionResponse
from diff_fuse.services.session_service import create_session

router = APIRouter()


@router.post("/", response_model=SessionResponse)
def create(req: AddDocsSessionRequest) -> SessionResponse:
    """
    Create a new session.

    This endpoint stores the provided documents server-side and returns
    a `session_id` that can be used for subsequent operations such as:

    - diff computation
    - merge resolution
    - array key suggestions
    - export

    Parameters
    ----------
    req : CreateSessionRequest
        Session creation payload containing the input documents.

    Returns
    -------
    CreateSessionResponse
        Contains the generated `session_id` and document metadata.

    Notes
    -----
    - Document parsing errors (if any) are captured in the stored
      `DocumentResult` objects and surfaced in later operations.
    """
    return create_session(req)
