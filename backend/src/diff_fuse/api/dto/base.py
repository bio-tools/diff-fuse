from __future__ import annotations

from pydantic import Field

from diff_fuse.api.schemas.api import APIModel
from diff_fuse.api.schemas.document import InputDocument


class CreateSessionRequest(APIModel):
    """
    Request payload to create a new session.

    A session stores the provided documents server-side and returns a `session_id`
    that can be used to compute diffs, apply merges, request array key suggestions,
    and export results without resending document content.

    Parameters
    ----------
    documents : list[InputDocument]
        The set of input documents to store in the session.

        Constraints
        ----------
        - Must contain at least two documents (N-way comparisons, N >= 2).
        - Each document must include a stable `doc_id` that the client will use
          when referring to sources in selections.

    Notes
    -----
    Session creation does not necessarily validate/parse document content.
    Downstream operations are responsible for parsing and will report per-document
    errors in their responses.
    """

    documents: list[InputDocument] = Field(..., min_length=2)


class CreateSessionResponse(APIModel):
    """
    Response payload returned after creating a session.

    Attributes
    ----------
    session_id : str
        Opaque identifier for the newly created session. The client should treat
        this as an opaque token and not infer semantics from its contents.

    Notes
    -----
    - Session IDs may expire depending on server configuration (TTL).
    """

    session_id: str
