"""
Document models used throughout diff-fuse.

This module defines the canonical representations of input documents and
their processing state.
"""

from enum import StrEnum
from typing import Any

from pydantic import Field

from diff_fuse.models.base import DiffFuseModel

type ValueInput = tuple[bool, Any | None]
"""
Internal nput tuple.

Structure
---------
(present, normalized_value)
- present=True  -> document parsed successfully
- present=False -> document missing or invalid
"""


class DocumentFormat(StrEnum):
    """
    Supported input document formats.

    Attributes
    ----------
    json : str
        JSON text input. This is currently the only supported format.
    """

    json = "json"


class _DocumentBase(DiffFuseModel):
    """
    Base document model shared across API layers.

    Attributes
    ----------
    doc_id : str
        Stable identifier provided by the client (e.g., UUID). This identifier
        is used throughout the system to reference the same document.
    name : str
        Human-readable display name for UI presentation.
    format : DocumentFormat
        Declared format of the document content.
    """

    doc_id: str = Field(..., description="Stable id provided by client (e.g., uuid).")
    name: str = Field(..., description="Display name shown in the UI.")
    format: DocumentFormat = Field(DocumentFormat.json, description="Declared document format.")


class InputDocument(_DocumentBase):
    """
    Client-supplied document payload.

    This model represents the raw document submitted by the client for
    operations.

    Attributes
    ----------
    content : str
        Raw document text. Parsing and normalization are performed later
        during session processing.
    """

    content: str = Field(..., description="Raw document text.")


class DocumentMeta(_DocumentBase):
    """
    Lightweight document status for API responses.

    This model is returned to clients to report whether each document
    was successfully parsed and normalized.

    Attributes
    ----------
    ok : bool
        Whether parsing and normalization succeeded.
    error : str | None
        Human-readable error message when ``ok=False``.
    """

    ok: bool = Field(..., description="Whether the document parsed successfully.")
    error: str | None = Field(None, description="Parse/validation error message when ok=False.")


class DocumentResult(DocumentMeta):
    """
    Full per-document processing result.

    This model is stored inside sessions and represents the outcome of
    parsing and normalization. It is the canonical internal representation
    used by the operations.

    Attributes
    ----------
    normalized : Any | None
        Parsed and normalized document content when ``ok=True``.
        The structure is backend-defined and treated as opaque by the API.

    Notes
    -----
    - When ``ok=False``, ``normalized`` is typically ``None``.
    """

    normalized: Any | None = None

    def build_root_input(self) -> ValueInput:
        """
        Build the diff-engine input tuple for this document.

        Returns
        -------
        ValueInput
            Tuple of the form ``(present, normalized_value)``.

        Notes
        -----
        This is the canonical bridge between session storage and the
        diff tree builder.
        """
        return (self.ok, self.normalized if self.ok else None)

    def to_meta(self) -> DocumentMeta:
        """
        Convert this result into the lightweight API metadata view.

        Returns
        -------
        DocumentMeta
            Metadata representation suitable for API responses.
        """
        return DocumentMeta(
            doc_id=self.doc_id,
            name=self.name,
            format=self.format,
            ok=self.ok,
            error=self.error,
        )
