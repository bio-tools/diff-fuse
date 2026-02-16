"""
Session API schemas.

These Pydantic models define the request/response payloads for the session-based API.
A *session* is a temporary server-side container that stores a set of input documents
so the client does not need to resend full document contents for every diff/merge
operation.

The session layer is intentionally lightweight:
- Sessions are stored in-memory and may expire (TTL).
- A session contains *exactly* the documents provided at creation time.
- Subsequent operations supply only configuration (e.g., array strategies) and
  merge selections.
"""

from __future__ import annotations

from pydantic import Field

from diff_fuse.api.schemas.api import APIModel
from diff_fuse.api.schemas.diff import InputDocument
from diff_fuse.api.schemas.merge import MergeSelection
from diff_fuse.api.schemas.shared import DiffOptions

type MergeSelections = dict[str, MergeSelection]


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


class SessionDiffRequest(DiffOptions):
    """
    Request payload to compute a diff within an existing session.

    This request supplies only diff configuration; the documents themselves are
    retrieved from the session.
    """

    pass


class SessionMergeRequest(DiffOptions):
    """
    Request payload to compute a merged output within an existing session.

    This request supplies:
    - array strategy configuration (affects diff construction for merge context)
    - path-based selections (resolutions) for diffs/type errors

    Attributes
    ----------
    selections : dict[str, MergeSelection]
        Mapping from canonical node path -> selection that resolves that node.

        Path semantics
        --------------
        - Keys must match `DiffNode.path` values produced by the diff tree.
        - Selections may target leaves or subtrees (depending on merge semantics).
        - More specific paths override inherited subtree selections.

    Notes
    -----
    The merge endpoint may return a partial merge result along with
    `unresolved_paths` when not all conflicts are resolved.
    """

    selections: MergeSelections = Field(default_factory=dict)
