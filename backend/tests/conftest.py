from __future__ import annotations

import json
import uuid
from typing import Any

import pytest
from fastapi.testclient import TestClient


@pytest.fixture(autouse=True)
def _reset_singletons_and_env(monkeypatch: pytest.MonkeyPatch) -> None:
    """
    Ensure each test starts with clean, predictable configuration.

    Why this exists:
    - diff_fuse.settings caches a singleton Settings instance.
    - diff_fuse.deps caches a singleton SessionRepo instance.
    - tests often tweak env vars; without resetting, settings/repo can go stale.
    """
    # Set safe defaults for tests
    monkeypatch.setenv("DIFF_FUSE_ENVIRONMENT", "dev")
    monkeypatch.setenv("DIFF_FUSE_SESSION_BACKEND", "memory")
    monkeypatch.setenv("DIFF_FUSE_UVICORN_WORKERS", "1")
    monkeypatch.setenv("DIFF_FUSE_RELOAD", "false")
    monkeypatch.setenv("DIFF_FUSE_MAX_JSON_DEPTH", "60")
    monkeypatch.setenv("DIFF_FUSE_MAX_DIFF_NODES", "200000")
    monkeypatch.setenv("DIFF_FUSE_MAX_DOCUMENTS_PER_SESSION", "10")
    monkeypatch.setenv("DIFF_FUSE_MAX_DOCUMENT_CHARS", "1000000")
    monkeypatch.setenv("DIFF_FUSE_MAX_TOTAL_CHARS_PER_SESSION", "3000000")

    # Reset cached settings and repo singletons
    import diff_fuse.deps as deps
    import diff_fuse.settings as settings

    settings._settings = None  # type: ignore[attr-defined]
    deps._repo = None  # type: ignore[attr-defined]


@pytest.fixture
def app():
    """
    FastAPI app fixture.

    Importing here (after env reset) ensures app reads the correct settings.
    """
    from diff_fuse.main import app as _app

    return _app


@pytest.fixture
def client(app):
    """Synchronous TestClient for API smoke tests."""
    return TestClient(app)


@pytest.fixture
def doc_factory():
    """
    Build InputDocument payload dicts for API requests.

    Keeps tests decoupled from Pydantic model constructors.
    """

    def _make(
        content: str | dict[str, Any] | list[Any],
        *,
        name: str = "doc",
        doc_id: str | None = None,
        format: str = "json",
    ) -> dict[str, Any]:
        if isinstance(content, (dict, list)):
            content_str = json.dumps(content, ensure_ascii=False, sort_keys=True)
        else:
            content_str = content

        return {
            "doc_id": doc_id or uuid.uuid4().hex,
            "name": name,
            "format": format,
            "content": content_str,
        }

    return _make
