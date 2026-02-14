from __future__ import annotations

from fastapi.testclient import TestClient

from diff_fuse.main import app

client = TestClient(app)


def test_merge_endpoint_resolves_with_selection():
    payload = {
        "documents": {
            "documents": [
                {"doc_id": "a", "name": "A", "format": "json", "content": '{"x": 1}'},
                {"doc_id": "b", "name": "B", "format": "json", "content": '{"x": 2}'},
            ],
            "array_strategies": {},
        },
        "selections": {
            "x": {"kind": "doc", "doc_id": "b"},
        },
    }

    r = client.post("/api/merge", json=payload)
    assert r.status_code == 200
    data = r.json()

    assert data["unresolved_paths"] == []
    assert data["merged"] == {"x": 2}
    assert all(d["ok"] in (True, False) for d in data["documents"])


def test_merge_endpoint_returns_conflicts_without_selection():
    payload = {
        "documents": {
            "documents": [
                {"doc_id": "a", "name": "A", "format": "json", "content": '{"x": 1}'},
                {"doc_id": "b", "name": "B", "format": "json", "content": '{"x": 2}'},
            ],
            "array_strategies": {},
        },
        "selections": {},
    }

    r = client.post("/api/merge", json=payload)
    assert r.status_code == 200
    data = r.json()

    assert data["unresolved_paths"] == ["x"]
    assert data["merged"] == {}


def test_merge_endpoint_reports_parse_errors():
    payload = {
        "documents": {
            "documents": [
                {"doc_id": "a", "name": "A", "format": "json", "content": '{"x": 1}'},
                {"doc_id": "b", "name": "B", "format": "json", "content": "{bad json}"},
            ],
            "array_strategies": {},
        },
        "selections": {"x": {"kind": "doc", "doc_id": "a"}},
    }

    r = client.post("/api/merge", json=payload)
    assert r.status_code == 200
    data = r.json()

    # doc b should be flagged as parse error
    metas = {d["doc_id"]: d for d in data["documents"]}
    assert metas["b"]["ok"] is False
    assert "Invalid JSON" in (metas["b"]["error"] or "")
