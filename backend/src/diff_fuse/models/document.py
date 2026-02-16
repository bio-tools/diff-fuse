from __future__ import annotations

from enum import Enum

from pydantic import Field

from diff_fuse.models.api import APIModel


class DocumentFormat(str, Enum):
    """
    Supported input document formats.

    Attributes
    ----------
    json : str
        JSON text input. This is the only supported format currently.
    """

    json = "json"


class InputDocument(APIModel):
    """
    Client-supplied document used for diff and merge operations.

    Attributes
    ----------
    doc_id : str
        Stable identifier provided by the client (e.g., UUID). This identifier is
        used throughout the API to refer to the same document.
    name : str
        Human-readable name to show in the UI.
    format : DocumentFormat
        Declared format of `content`. The backend may reject unsupported formats.
    content : str
        Raw document text.

    Notes
    -----
    - `doc_id` must be unique within a request/session.
    - Parsing/validation errors are surfaced via `DocumentMeta` in responses.
    """

    doc_id: str = Field(..., description="Stable id provided by client (e.g., uuid).")
    name: str = Field(..., description="Display name shown in the UI.")
    format: DocumentFormat = Field(DocumentFormat.json, description="Declared format of `content`.")
    content: str = Field(..., description="Raw document text.")


class DocumentMeta(APIModel):
    """
    Parse/validation status for a document included in a diff/merge operation.

    Attributes
    ----------
    doc_id : str
        The document identifier as provided by the client.
    name : str
        The document display name as provided by the client.
    format : DocumentFormat
        The declared document format.
    ok : bool
        Whether the document was successfully parsed/normalized.
    error : str | None
        Human-readable parse/validation error, when `ok=False`.
    """

    doc_id: str
    name: str
    format: DocumentFormat
    # parse/validation feedback
    ok: bool = True
    error: str | None = None