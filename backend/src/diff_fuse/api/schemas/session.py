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

from diff_fuse.api.schemas.merge import MergeSelection
from diff_fuse.api.schemas.shared import DiffOptions

type MergeSelections = dict[str, MergeSelection]



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
