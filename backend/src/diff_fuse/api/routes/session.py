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

from diff_fuse.api.dto.session import AddDocsSessionRequest, RemoveDocSessionRequest, SessionResponse
from diff_fuse.services.session_service import (
    add_docs_in_session,
    create_session,
    list_docs_meta_in_session,
    remove_doc_in_session,
)

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
    req : AddDocsSessionRequest
        Session creation payload containing the input documents.

    Returns
    -------
    SessionResponse
        Contains the generated `session_id` and document metadata.

    Notes
    -----
    - Document parsing errors (if any) are captured in the stored
      `DocumentResult` objects and surfaced in later operations.
    """
    return create_session(req)


@router.post("/{session_id}/add-docs", response_model=SessionResponse)
def add_docs(session_id: str, req: AddDocsSessionRequest) -> SessionResponse:
    """
    Add documents to an existing session.

    This endpoint allows clients to append new documents to an existing
    session. The new documents are parsed, normalized, and stored
    alongside the existing ones.

    Parameters
    ----------
    session_id : str
        Target session identifier.
    req : AddDocsSessionRequest
        Request payload containing the new documents to add.

    Returns
    -------
    SessionResponse
        Updated session metadata after adding the new documents.

    Notes
    -----
    This operation mutates the session by appending new documents. The
    existing documents remain unchanged.
    """
    return add_docs_in_session(session_id, req)


@router.post("/{session_id}/remove-doc", response_model=SessionResponse)
def remove_doc(session_id: str, req: RemoveDocSessionRequest) -> SessionResponse:
    """
    Remove a document from an existing session.

    This endpoint allows clients to remove a specific document from an
    existing session by its `doc_id`. The session's stored documents are
    updated accordingly.

    Parameters
    ----------
    session_id : str
        Target session identifier.
    req : RemoveDocSessionRequest
        Request payload containing the `doc_id` of the document to remove.

    Returns
    -------
    SessionResponse
        Updated session metadata after removing the specified document.

    Notes
    -----
    - This operation mutates the session by removing the specified document. The
    remaining documents remain unchanged.
    """
    return remove_doc_in_session(session_id, req.doc_id)


@router.get("/{session_id}/docs-meta", response_model=SessionResponse)
def list_docs_meta(session_id: str) -> SessionResponse:
    """
    List metadata for all documents in a session.

    Parameters
    ----------
    session_id : str
        Target session identifier.

    Returns
    -------
    SessionResponse
        Session metadata including document metadata for all documents in the session.
    """
    return list_docs_meta_in_session(session_id)
