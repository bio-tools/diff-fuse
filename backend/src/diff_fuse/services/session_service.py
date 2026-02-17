"""
Session service.

This module implements the service-layer logic for creating sessions and
preprocessing uploaded documents.
"""

from diff_fuse.api.dto.session import AddDocsSessionRequest, SessionResponse
from diff_fuse.deps import get_session_repo
from diff_fuse.domain.errors import DomainValidationError, LimitsExceededError
from diff_fuse.domain.normalize import DocumentParseError, parse_and_normalize_json
from diff_fuse.models.document import DocumentFormat, DocumentResult, InputDocument
from diff_fuse.models.session import Session
from diff_fuse.services.shared import fetch_session
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
    DomainValidationError
        If at least two documents share the same ``doc_id``.

    Notes
    -----
    ``doc_id`` is used as the stable identifier for per-document state and for
    merge selections. Duplicates would make downstream results ambiguous.
    """
    doc_ids = [d.doc_id for d in documents]
    if len(set(doc_ids)) != len(doc_ids):
        # You can upgrade this to a DomainError later if you want a stable code.
        raise DomainValidationError(field="doc_id", reason="Document IDs must be unique within a session")


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
            r.error = e.as_details().get("reason", e.message)

        results.append(r)

    return results


def create_session(req: AddDocsSessionRequest) -> SessionResponse:
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
    session = repo.create(documents_results=documents_results)

    return SessionResponse(
        session_id=session.session_id,
        documents_meta=[dr.to_meta() for dr in documents_results],
    )


def add_docs_in_session(session_id: str, req: AddDocsSessionRequest) -> SessionResponse:
    """
    Add documents to an existing session.

    Parameters
    ----------
    session_id : str
        Target session identifier.
    req : AddDocsSessionRequest
        Request containing the documents to add.

    Returns
    -------
    SessionResponse
        Updated session metadata after adding the new documents.

    Notes
    -----
    This operation mutates the session by appending new documents. The
    existing documents remain unchanged.
    """
    enforce_session_input_limits(req.documents)
    validate_unique_doc_ids(req.documents)

    documents_results = parse_and_normalize_documents(req.documents)

    def _fn(s: Session) -> Session:
        # Merge existing and new documents
        s.documents_results.extend(documents_results)
        return s

    repo = get_session_repo()
    updated_session = repo.mutate(session_id, _fn)
    if updated_session is None:
        raise DomainValidationError(field="session_id", reason=f"Session '{session_id}' not found")

    return SessionResponse(
        session_id=updated_session.session_id,
        documents_meta=[dr.to_meta() for dr in updated_session.documents_results],
    )


def remove_doc_in_session(session_id: str, doc_id: str) -> SessionResponse:
    """
    Remove a document from an existing session.

    Parameters
    ----------
    session_id : str
        Target session identifier.
    doc_id : str
        Document ID to remove from the session.

    Returns
    -------
    SessionResponse
        Updated session metadata after removing the specified document.

    Notes
    -----
    This operation mutates the session by removing the specified document.
    If the document ID does not exist in the session, a validation error is raised.
    """
    def _fn(s: Session) -> Session:
        updated = [dr for dr in s.documents_results if dr.doc_id != doc_id]
        if len(updated) < 2:
            raise DomainValidationError(
                field="documents",
                reason=f"Cannot remove document '{doc_id}' because a session must have at least 2 documents",
            )
        s.documents_results = updated
        return s

    repo = get_session_repo()
    updated_session = repo.mutate(session_id, _fn)
    if updated_session is None:
        raise DomainValidationError(field="session_id", reason=f"Session '{session_id}' not found")

    return SessionResponse(
        session_id=updated_session.session_id,
        documents_meta=[dr.to_meta() for dr in updated_session.documents_results],
    )


def list_docs_meta_in_session(session_id: str) -> SessionResponse:
    """
    List metadata for all documents in a session.

    Parameters
    ----------
    session_id : str
        Target session identifier.

    Returns
    -------
    SessionResponse
        Session metadata including the list of documents with their parsing status.
    """
    s = fetch_session(session_id)

    return SessionResponse(
        session_id=s.session_id,
        documents_meta=[dr.to_meta() for dr in s.documents_results],
    )