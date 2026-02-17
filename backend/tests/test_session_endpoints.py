from fastapi.testclient import TestClient

from diff_fuse.main import app

client = TestClient(app)


def test_session_create_and_diff():
    create_payload = {
        "documents": [
            {"doc_id": "a", "name": "A", "format": "json", "content": '{"x": 1}'},
            {"doc_id": "b", "name": "B", "format": "json", "content": '{"x": 2}'},
        ]
    }
    r = client.post("/api/session", json=create_payload)
    assert r.status_code == 200
    sid = r.json()["session_id"]

    r2 = client.post(f"/api/session/{sid}/diff", json={"array_strategies": {}})
    assert r2.status_code == 200
    data = r2.json()
    assert data["root"]["status"] in ("diff", "type_error", "missing", "same")


def test_session_404():
    r = client.post("/api/session/doesnotexist/diff", json={"array_strategies": {}})
    assert r.status_code == 404
