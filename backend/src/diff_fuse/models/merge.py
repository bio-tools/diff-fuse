"""
Merge selection models.

This module defines the client-provided selection structure used during
merge resolution. Selections instruct the merge engine how to resolve
conflicts at specific paths in the diff tree.

Design goals
------------
- Explicit and machine-readable resolution intent.
- Support both document-based and manual overrides.
- Allow hierarchical inheritance down the diff tree.
"""

from typing import Any, Literal

from pydantic import Field

from diff_fuse.models.base import DiffFuseModel


class MergeSelection(DiffFuseModel):
    """
    User selection describing how to resolve a particular diff path.

    A selection specifies the source of truth for a node during merge.
    Two modes are supported:
    - ``kind="doc"``:
        Select the value from a specific source document.
    - ``kind="manual"``:
        Override the value with a user-provided literal.

    Selections are applied hierarchically: a selection at path ``"a.b"``
    applies to all descendants (e.g., ``"a.b.c"``) unless a more specific
    selection overrides it.

    Attributes
    ----------
    kind : {"doc", "manual"}
        Resolution mode.
    doc_id : str | None, default=None
        Identifier of the source document when ``kind="doc"``.
    manual_value : Any | None, default=None
        Literal value to inject when ``kind="manual"``.

    Notes
    -----
    - Validation of whether the selected document actually contains the
      requested path is performed during merge execution.
    - Manual values must be JSON-serializable for export operations.
    """

    kind: Literal["doc", "manual"] = Field(
        ...,
        description="Resolution mode: 'doc' or 'manual'.",
    )

    doc_id: str | None = Field(
        default=None,
        description="Required when kind='doc'.",
    )

    manual_value: Any | None = Field(
        default=None,
        description="Required when kind='manual'.",
    )
