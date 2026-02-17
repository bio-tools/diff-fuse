"""
DTOs for exporting merged results.

This module defines request and response models for exporting the merged
document derived from session data. Export is conceptually the final step
after diff and merge, producing a serialized representation suitable for
download or clipboard use.

Notes
-----
Export operates on session documents and internally performs the same
merge logic as the merge endpoint.
"""

from pydantic import Field

from diff_fuse.models.base import DiffFuseModel

from .merge import MergeRequest


class ExportRequest(DiffFuseModel):
    """
    Request payload for exporting the merged document.

    Attributes
    ----------
    merge_request : MergeRequest
        Full merge configuration reused during export. This includes
        array strategies and user selections.
        Rationale:
        Nesting the merge request ensures the frontend can reuse the
        exact same state object across merge and export operations.
    pretty : bool, default=True
        Whether the exported text should be pretty-printed (indented).
        If False, the output is compact.
    require_resolved : bool, default=False
        If True, the export will fail when unresolved conflicts remain.
        Behavior:
        - False -> best-effort export with unresolved paths reported.
        - True -> export endpoint should return a conflict error when
          unresolved paths are present.
    """

    merge_request: MergeRequest = Field(
        ...,
        description="Merge configuration reused during export.",
    )

    pretty: bool = True
    require_resolved: bool = False


class ExportTextResponse(DiffFuseModel):
    """
    Response payload for text-based export.

    Attributes
    ----------
    text : str
        Serialized merged document (typically JSON).

    unresolved_paths : list[str]
        Canonical paths that remained unresolved during merge.
        Interpretation:
        - Empty list -> fully resolved export.
        - Non-empty -> export was best-effort (unless strict mode
          prevented it).

    Notes
    -----
    This response is primarily intended for clipboard workflows. File
    downloads typically use a binary response instead.
    """

    unresolved_paths: list[str] = Field(default_factory=list)
    text: str
