from __future__ import annotations

from fastapi.testclient import TestClient

from diff_fuse.main import app

client = TestClient(app)


def _make_session() -> str:
    r = client.post(
        "/api/session",
        json={
            "documents": [
                {"doc_id": "a", "name": "A", "format": "json", "content": '{"x": 1, "y": 2}'},
                {"doc_id": "b", "name": "B", "format": "json", "content": '{"x": 9, "y": 2}'},
            ]
        },
    )
    assert r.status_code == 200
    return r.json()["session_id"]


def test_export_text_mode_returns_string():
    sid = _make_session()
    r = client.post(
        f"/api/session/{sid}/export/text",
        json={
            "array_strategies": {},
            "selections": {"x": {"kind": "doc", "doc_id": "b"}},
            "pretty": True,
            "require_resolved": True,
        },
    )
    assert r.status_code == 200
    data = r.json()
    assert data["merged"]["x"] == 9
    assert '"x": 9' in data["text"]


def test_export_download_mode_returns_attachment():
    sid = _make_session()
    r = client.post(
        f"/api/session/{sid}/export/download",
        json={
            "array_strategies": {},
            "selections": {"x": {"kind": "doc", "doc_id": "b"}},
            "pretty": True,
            "require_resolved": True,
        },
    )
    assert r.status_code == 200
    assert r.headers["content-type"].startswith("application/json")
    assert "attachment" in r.headers.get("content-disposition", "").lower()
    assert b'"x": 9' in r.content
