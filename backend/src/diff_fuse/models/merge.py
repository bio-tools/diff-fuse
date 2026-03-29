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

    kind: Literal["doc"] = "doc"
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

    kind: Literal["manual"] = "manual"
    manual_value: Any = Field(
        ...,
        description="Required when kind='manual'. May be null.",
    )


MergeSelection = Annotated[
    DocMergeSelection | ManualMergeSelection,
    Field(discriminator="kind"),
]


class MergedNodeRef(DiffFuseModel):
    """
    Machine-readable locator for a diff node inside the merged output.

    This model tells how to resolve a node's merged value from its
    parent's merged value.

    Attributes
    ----------
    present : bool
        Whether this node is present in the merged output.
    object_key : str | None
        If present=True and this node is under an object, the key to access it.
    array_index : int | None
        If present=True and this node is under an array, the index to access it.

    Semantics
    ---------
    present = False
        The node does not exist in the merged output.
    present = True and object_key is not None
        The node is available at parent_merged[object_key].
    present = True and array_index is not None
        The node is available at parent_merged[array_index].

    Notes
    -----
    - For non-root nodes, exactly one of `object_key` or `array_index` should
      be set when `present=True`.
    - The root node may be represented with only `present=True`.
    """

    present: bool = Field(
        ...,
        description="Whether this node exists in the merged output.",
    )

    object_key: str | None = Field(
        default=None,
        description="Key under the parent merged object, when applicable.",
    )

    array_index: int | None = Field(
        default=None,
        ge=0,
        description="Index under the parent merged array, when applicable.",
    )
