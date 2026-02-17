from diff_fuse.api.dto.session import (
    CreateSessionRequest,
    CreateSessionResponse,
)
from diff_fuse.deps import get_session_repo
from diff_fuse.domain.errors import LimitsExceeded
from diff_fuse.domain.normalize import DocumentParseError, parse_and_normalize_json
from diff_fuse.models.document import DocumentFormat, DocumentResult, InputDocument
from diff_fuse.settings import get_settings


def _enforce_session_limits(documents: list[InputDocument]) -> None:
    s = get_settings()

    if len(documents) > s.max_documents_per_session:
        raise LimitsExceeded(f"Too many documents: {len(documents)} > {s.max_documents_per_session}")

    total = 0
    for d in documents:
        n = len(d.content)
        if n > s.max_document_chars:
            raise LimitsExceeded(f"Document '{d.name}' too large: {n} chars > {s.max_document_chars}")
        total += n

    if total > s.max_total_chars_per_session:
        raise LimitsExceeded(f"Total input too large: {total} chars > {s.max_total_chars_per_session}")


def process_documents(documents: list[InputDocument]) -> list[DocumentResult]:
    documents_results: list[DocumentResult] = []

    # check all documents ids are unique
    doc_ids = [d.doc_id for d in documents]
    if len(set(doc_ids)) != len(doc_ids):
        raise ValueError("Document IDs must be unique within a session")

    for d in documents:
        document_result = DocumentResult(doc_id=d.doc_id, name=d.name, format=d.format, ok=True, error=None)

        if d.format != DocumentFormat.json:
            document_result.ok = False
            document_result.error = f"Unsupported format '{d.format}'. Only 'json' is supported currently."
            documents_results.append(document_result)
            continue

        try:
            parsed = parse_and_normalize_json(d.content)
            document_result.normalized = parsed.normalized
            documents_results.append(document_result)
        except DocumentParseError as e:
            document_result.ok = False
            document_result.error = str(e)
            documents_results.append(document_result)

    return documents_results


def create_session(req: CreateSessionRequest) -> CreateSessionResponse:
    _enforce_session_limits(req.documents)
    document_results = process_documents(req.documents)
    repo = get_session_repo()
    repo.cleanup()
    session = repo.create(documents=req.documents, documents_results=document_results)
    return CreateSessionResponse(
        session_id=session.session_id,
        documents_meta=[doc.to_meta() for doc in document_results]
    )

