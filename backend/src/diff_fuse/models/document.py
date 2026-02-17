from enum import Enum
from typing import Any

from pydantic import Field

from diff_fuse.models.api import APIModel

type RootInput = tuple[bool, Any | None]


class DocumentFormat(str, Enum):
    """
    Supported input document formats.

    Attributes
    ----------
    json : str
        JSON text input. This is the only supported format currently.
    """

    json = "json"


class DocumentBase(APIModel):
    """
    Base document model with common attributes.

    Attributes
    ----------
    doc_id : str
        Stable identifier provided by the client (e.g., UUID). This identifier is
        used throughout the API to refer to the same document.
    name : str
        Human-readable name to show in the UI.
    format : DocumentFormat
        Declared format of `content`. The backend may reject unsupported formats.

    Notes
    -----
    - `doc_id` must be unique within a request/session.
    """

    doc_id: str = Field(..., description="Stable id provided by client (e.g., uuid).")
    name: str = Field(..., description="Display name shown in the UI.")
    format: DocumentFormat = Field(DocumentFormat.json, description="Declared format of `content`.")


class InputDocument(DocumentBase):
    """
    Client-supplied document used for diff and merge operations.

    Attributes
    ----------
    content : str
        Raw document text.
    """

    content: str = Field(..., description="Raw document text.")


class DocumentMeta(DocumentBase):
    """
    Metadata about a document included in diff/merge operations.

    Attributes
    ----------
    ok : bool
        Whether the document was successfully parsed/normalized.
    error : str | None
        Human-readable parse/validation error, when `ok=False`.
    """

    ok: bool = Field(..., description="Whether the document was successfully parsed/normalized.")
    error: str | None = Field(None, description="Parse/validation error message when `ok=False`.")


class DocumentResult(DocumentBase):
    """
    Parse/validation status for a document included in a diff/merge operation.

    Attributes
    ----------
    normalized : Any | None
        The parsed and normalized document content, if parsing was successful. The
        structure of this content is opaque to the API and determined by the backend's
        normalization process.
    """

    doc_id: str
    name: str
    format: DocumentFormat
    normalized: Any | None = None
    # parse/validation feedback
    ok: bool = True
    error: str | None = None

    def build_root_input(self) -> RootInput:
        """
        Build the root input tuple for this document, used in diff tree construction.

        Returns
        -------
        tuple[bool, Any | None]
            A tuple where the first element indicates whether the document is present/valid,
            and the second element is the normalized content (or None if not valid).
        """
        return (self.ok, self.normalized if self.ok else None)


    def to_meta(self) -> DocumentMeta:
        """
        Convert this DocumentResult to a DocumentMeta object for API responses.

        Returns
        -------
        DocumentMeta
            A DocumentMeta object containing the metadata of this document.
        """
        return DocumentMeta(
            doc_id=self.doc_id,
            name=self.name,
            format=self.format,
            ok=self.ok,
            error=self.error,
        )
