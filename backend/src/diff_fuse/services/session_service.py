"""
Session service.

This module implements the service-layer logic for creating sessions and
preprocessing uploaded documents.
"""

from diff_fuse.api.dto.session import CreateSessionRequest, CreateSessionResponse
from diff_fuse.deps import get_session_repo
from diff_fuse.domain.errors import LimitsExceededError, ValidationError
from diff_fuse.domain.normalize import DocumentParseError, parse_and_normalize_json
from diff_fuse.models.document import DocumentFormat, DocumentResult, InputDocument
from diff_fuse.settings import get_settings


def enforce_session_input_limits(documents: list[InputDocument]) -> None:
    """
    Enforce defensive limits for session creation.

    Parameters
    ----------
    documents : list[InputDocument]
        Documents proposed for session creation.

    Raises
    ------
    LimitsExceededError
        If any configured limit is exceeded.
    """
    s = get_settings()

    if len(documents) > s.max_documents_per_session:
        raise LimitsExceededError(
            "Too many documents",
            count=len(documents),
            max_documents_per_session=s.max_documents_per_session,
        )

    total_chars = 0
    for d in documents:
        n = len(d.content)
        if n > s.max_document_chars:
            raise LimitsExceededError(
                "Document too large",
                doc_id=d.doc_id,
                name=d.name,
                size_chars=n,
                max_document_chars=s.max_document_chars,
            )
        total_chars += n

    if total_chars > s.max_total_chars_per_session:
        raise LimitsExceededError(
            "Total input too large",
            total_chars=total_chars,
            max_total_chars_per_session=s.max_total_chars_per_session,
        )


def validate_unique_doc_ids(documents: list[InputDocument]) -> None:
    """
    Validate that all document ids are unique within the request.

    Parameters
    ----------
    documents : list[InputDocument]
        Documents to validate.

    Raises
    ------
    ValidationError
        If at least two documents share the same ``doc_id``.

    Notes
    -----
    ``doc_id`` is used as the stable identifier for per-document state and for
    merge selections. Duplicates would make downstream results ambiguous.
    """
    doc_ids = [d.doc_id for d in documents]
    if len(set(doc_ids)) != len(doc_ids):
        # You can upgrade this to a DomainError later if you want a stable code.
        raise ValidationError(field="doc_id", reason="Document IDs must be unique within a session")


def parse_and_normalize_documents(documents: list[InputDocument]) -> list[DocumentResult]:
    """
    Parse and normalize input documents.

    Parameters
    ----------
    documents : list[InputDocument]
        Input documents supplied by the client.

    Returns
    -------
    list[DocumentResult]
        One result per input document, preserving input order. Each result
        contains parsing status and (when successful) the normalized content.

    Notes
    -----
    - Unsupported formats are recorded as per-document errors instead of
      failing the whole request. This allows the UI to show per-document
      feedback.
    - Parse failures are captured as ``ok=False`` results.
    """
    results: list[DocumentResult] = []

    for d in documents:
        r = DocumentResult(doc_id=d.doc_id, name=d.name, format=d.format, ok=True, error=None)

        if d.format != DocumentFormat.json:
            r.ok = False
            r.error = f"Unsupported format '{d.format}'. Only 'json' is supported currently."
            results.append(r)
            continue

        try:
            r.normalized = parse_and_normalize_json(d.content)
        except DocumentParseError as e:
            r.ok = False
            r.error = str(e)

        results.append(r)

    return results


def create_session(req: CreateSessionRequest) -> CreateSessionResponse:
    """
    Create a new session and persist its documents.

    Parameters
    ----------
    req : CreateSessionRequest
        Session creation request containing the documents to store.

    Returns
    -------
    CreateSessionResponse
        Newly created session id plus per-document metadata.

    Notes
    -----
    The repository may implement sliding expiration (e.g., Redis TTL refresh on access).
    """
    enforce_session_input_limits(req.documents)
    validate_unique_doc_ids(req.documents)

    documents_results = parse_and_normalize_documents(req.documents)

    repo = get_session_repo()
    # repo.cleanup()  # no-op for Redis; useful for memory repo
    session = repo.create(documents=req.documents, documents_results=documents_results)

    return CreateSessionResponse(
        session_id=session.session_id,
        documents_meta=[dr.to_meta() for dr in documents_results],
    )
