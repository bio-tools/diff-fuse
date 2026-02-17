from __future__ import annotations

import pytest


def test_health(client):
    r = client.get("/health")
    assert r.status_code == 200
    data = r.json()
    assert data["status"] == "ok"
    assert "env" in data


def test_session_create_diff_merge_smoke(client, doc_factory):
    # 1) create session
    payload = {
        "documents": [
            doc_factory({"x": 1, "arr": [1, 2]}, name="A"),
            doc_factory({"x": 2, "arr": [1]}, name="B"),
        ]
    }
    r = client.post("/", json=payload)
    assert r.status_code == 200, r.text
    body = r.json()
    assert "session_id" in body
    assert len(body["documents_meta"]) == 2
    session_id = body["session_id"]

    # 2) diff
    r = client.post(f"/{session_id}/diff", json={"array_strategies": {}})
    assert r.status_code == 200, r.text
    diff_body = r.json()
    assert diff_body["root"]["path"] == ""

    # 3) merge (no selections -> unresolved expected because x differs)
    r = client.post(
        f"/{session_id}/merge",
        json={"diff_request": {"array_strategies": {}}, "selections": {}},
    )
    assert r.status_code == 200, r.text
    merge_body = r.json()
    assert "merged" in merge_body
    assert "unresolved_paths" in merge_body
    assert isinstance(merge_body["unresolved_paths"], list)


@pytest.mark.parametrize(
    "require_resolved, expected_status",
    [
        (False, 200),
        (True, 409),  # merge_conflict -> 409 in your main.py handler
    ],
)
def test_export_smoke_conflict_handling(client, doc_factory, require_resolved, expected_status):
    # create session with conflict
    payload = {
        "documents": [
            doc_factory({"x": 1}, name="A"),
            doc_factory({"x": 2}, name="B"),
        ]
    }
    r = client.post("/", json=payload)
    assert r.status_code == 200
    session_id = r.json()["session_id"]

    export_req = {
        "merge_request": {
            "diff_request": {"array_strategies": {}},
            "selections": {},
        },
        "pretty": True,
        "require_resolved": require_resolved,
    }

    r = client.post(f"/{session_id}/export/text", json=export_req)
    assert r.status_code == expected_status
    if expected_status == 200:
        data = r.json()
        assert "text" in data
        assert "unresolved_paths" in data
    else:
        err = r.json()
        assert err["error"]["code"] == "merge_conflict"
