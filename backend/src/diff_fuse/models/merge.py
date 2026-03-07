"""
Merge selection models.

This module defines the client-provided selection structure used during
merge resolution. Selections instruct the merge engine how to resolve
conflicts at specific nodes in the diff tree.

Design goals
------------
- Explicit and machine-readable resolution intent.
- Support both document-based and manual overrides.
- Allow hierarchical inheritance down the diff tree.
"""

from typing import Annotated, Any, Literal

from pydantic import Field

from diff_fuse.models.base import DiffFuseModel


class DocMergeSelection(DiffFuseModel):
    """
    Document-based merge selection.

    This selection mode indicates that the value for a node should be taken
    from a specific source document.

    Attributes
    ----------
    kind : Literal["doc"]
        Discriminator for document-based selection.
    doc_id : str
        Identifier of the source document to use for this node.
    """

    kind: Literal["doc"] = Field(
        ...,
        description="Resolve from a source document.",
    )
    doc_id: str = Field(
        ...,
        description="Required when kind='doc'.",
    )


class ManualMergeSelection(DiffFuseModel):
    """
    Manual override merge selection.

    This selection mode indicates that the value for a node should be overridden
    with a user-provided literal.

    Attributes
    ----------
    kind : Literal["manual"]
        Discriminator for manual override selection.
    manual_value : Any
        Literal value to use for this node. Must be JSON-serializable.
    """

    kind: Literal["manual"] = Field(
        ...,
        description="Resolve from a manually provided JSON value.",
    )
    manual_value: Any = Field(
        ...,
        description="Required when kind='manual'. May be null.",
    )


MergeSelection = Annotated[
    DocMergeSelection | ManualMergeSelection,
    Field(discriminator="kind"),
]
