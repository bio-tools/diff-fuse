from __future__ import annotations

import pytest

from diff_fuse.api.dto.session import CreateSessionRequest
from diff_fuse.domain.errors import DomainValidationError, LimitsExceededError
from diff_fuse.models.document import DocumentFormat, InputDocument
from diff_fuse.services.session_service import (
    create_session,
)


def _doc(doc_id: str, content: str, name: str = "doc") -> InputDocument:
    return InputDocument(doc_id=doc_id, name=name, format=DocumentFormat.json, content=content)


def test_create_session_rejects_duplicate_doc_ids(monkeypatch):
    req = CreateSessionRequest(
        documents=[
            _doc("same", '{"x":1}', name="a"),
            _doc("same", '{"x":2}', name="b"),
        ]
    )
    with pytest.raises(DomainValidationError):
        create_session(req)


@pytest.mark.parametrize(
    "env, make_docs, exc",
    [
        (
            {"DIFF_FUSE_MAX_DOCUMENTS_PER_SESSION": "1"},
            lambda: [_doc("a", '{"x":1}'), _doc("b", '{"x":2}')],
            LimitsExceededError,
        ),
        (
            {"DIFF_FUSE_MAX_DOCUMENT_CHARS": "5"},
            lambda: [_doc("a", '{"x":12345}'), _doc("b", '{"x":1}')],
            LimitsExceededError,
        ),
        (
            {"DIFF_FUSE_MAX_TOTAL_CHARS_PER_SESSION": "10"},
            lambda: [_doc("a", '{"x":12345}'), _doc("b", '{"y":12345}')],
            LimitsExceededError,
        ),
    ],
)
def test_create_session_enforces_limits(monkeypatch, env, make_docs, exc):
    for k, v in env.items():
        monkeypatch.setenv(k, v)

    # reset settings singleton after env change
    import diff_fuse.settings as settings

    settings._settings = None  # type: ignore[attr-defined]

    # also reset repo singleton (deps)
    import diff_fuse.deps as deps

    deps._repo = None  # type: ignore[attr-defined]

    req = CreateSessionRequest(documents=make_docs())
    with pytest.raises(exc):
        create_session(req)
