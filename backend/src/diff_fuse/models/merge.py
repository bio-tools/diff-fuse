from typing import Any, Literal

from pydantic import Field

from diff_fuse.api.dto.base import APIModel


class MergeSelection(APIModel):
    """
    User selection describing how to resolve a particular path.

    A selection can either:
    - pick a source document (kind="doc"), or
    - override with a manual value (kind="manual").

    Attributes
    ----------
    kind : {"doc", "manual"}
        Selection mode.

    doc_id : str | None, default=None
        Document identifier to choose values from when kind="doc".

    manual_value : Any | None, default=None
        Value to use when kind="manual".

    Notes
    -----
    Selections are applied with inheritance: a selection at path "a.b" applies
    to all descendants (e.g. "a.b.c") unless overridden by a more specific
    selection.
    """

    kind: Literal["doc", "manual"] = Field(..., description="How this path is resolved.")
    doc_id: str | None = Field(default=None, description="Required when kind='doc'.")
    manual_value: Any | None = Field(default=None, description="Required when kind='manual'.")

    @staticmethod
    def from_doc(doc_id: str) -> "MergeSelection":
        """
        Construct a document-based selection.

        Parameters
        ----------
        doc_id : str
            Document identifier.

        Returns
        -------
        Selection
            Selection with kind="doc".
        """
        return MergeSelection(kind="doc", doc_id=doc_id)

    @staticmethod
    def from_manual(value: Any) -> "MergeSelection":
        """
        Construct a manual override selection.

        Parameters
        ----------
        value : Any
            Manual value to write into the merged output.

        Returns
        -------
        Selection
            Selection with kind="manual".
        """
        return MergeSelection(kind="manual", manual_value=value)
