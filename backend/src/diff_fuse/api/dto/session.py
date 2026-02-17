"""
DTOs for session creation endpoints.

This module defines the request and response models used when creating
a new server-side session. Sessions allow clients to upload documents
once and then perform multiple operations (diff, merge, suggestions,
export) without resending document content.

Notes
-----
Session creation performs parsing and normalization so downstream
operations can reuse cached results.
"""

from pydantic import Field

from diff_fuse.api.dto.base import APIModel
from diff_fuse.models.document import DocumentMeta, InputDocument


class CreateSessionRequest(APIModel):
    """
    Request payload for creating a new session.

    A session stores the provided documents server-side and returns a
    ``session_id`` that can be used to compute diffs, apply merges,
    request array key suggestions, and export results without resending
    document content.

    Attributes
    ----------
    documents : list[InputDocument]
        The set of input documents to store in the session.
        Constraints:
        - Must contain at least two documents (N-way comparisons, N ≥ 2).
        - Each document must include a stable ``doc_id`` that the client
          will later reference in merge selections.

    Notes
    -----
    Documents are parsed and normalized during session creation so that
    subsequent operations can reuse cached results efficiently.
    """

    documents: list[InputDocument] = Field(..., min_length=2)


class CreateSessionResponse(APIModel):
    """
    Response payload returned after creating a session.

    Attributes
    ----------
    session_id : str
        Opaque identifier for the newly created session. Clients should
        treat this as an opaque token and not infer semantics from its
        contents.
    documents_meta : list[DocumentMeta]
        Metadata describing the stored documents, including their
        ``doc_id``, display name, declared format, and parse status.

    Notes
    -----
    - Session IDs may expire depending on server configuration (TTL).
    - Clients should persist the ``session_id`` for subsequent API calls.
    """

    session_id: str
    documents_meta: list[DocumentMeta]
