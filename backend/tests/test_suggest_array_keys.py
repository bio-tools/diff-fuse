from fastapi.testclient import TestClient

from diff_fuse.main import app

client = TestClient(app)


def test_suggest_array_keys_smoke():
    # Create session with arrays of objects
    r = client.post(
        "/api/session",
        json={
            "documents": [
                {
                    "doc_id": "a",
                    "name": "A",
                    "format": "json",
                    "content": '{"steps":[{"name":"build","t":1},{"name":"test","t":2}]}',
                },
                {
                    "doc_id": "b",
                    "name": "B",
                    "format": "json",
                    "content": '{"steps":[{"name":"test","t":999},{"name":"build","t":1}]}',
                },
            ]
        },
    )
    sid = r.json()["session_id"]

    r2 = client.post(f"/api/session/{sid}/arrays/suggest-keys", json={"path": "steps", "top_k": 5})
    assert r2.status_code == 200
    data = r2.json()
    keys = [s["key"] for s in data["suggestions"]]
    assert "name" in keys  # should be a strong candidate
