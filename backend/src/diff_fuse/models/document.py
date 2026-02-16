from __future__ import annotations

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
    - Parsing/validation errors are surfaced via `DocumentResult` in responses.
    """

    doc_id: str = Field(..., description="Stable id provided by client (e.g., uuid).")
    name: str = Field(..., description="Display name shown in the UI.")
    format: DocumentFormat = Field(DocumentFormat.json, description="Declared format of `content`.")
    content: str = Field(..., description="Raw document text.")


class DocumentResult(APIModel):
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
    normalized : Any | None
        The parsed and normalized document content, if parsing was successful. The
        structure of this content is opaque to the API and determined by the backend's
        normalization process.
    ok : bool
        Whether the document was successfully parsed/normalized.
    error : str | None
        Human-readable parse/validation error, when `ok=False`.
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
