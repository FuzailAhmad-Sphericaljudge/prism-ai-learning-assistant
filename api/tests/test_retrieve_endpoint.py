import pytest
from fastapi.testclient import TestClient


def test_post_retrieve_debug_at_18_42(client: TestClient):
    # Use seeded course
    seeded_course_id = "00000000-0000-0000-0000-000000000002"

    payload = {
        "query": "What is the binary search tree property?",
        "course_id": seeded_course_id,
        "playback_sec": 1122.0,  # 18:42
        "mode": "learn_so_far",
        "top_k": 3,
    }

    res = client.post("/retrieve", json=payload)
    assert res.status_code == 200
    data = res.json()

    assert data["course_id"] == seeded_course_id
    assert data["playback_sec"] == 1122.0
    assert data["mode"] == "learn_so_far"
    assert "admitted" in data
    assert "blocked" in data
    assert "scoped_prompt_preview" in data
    assert "PERMITTED TEMPORAL EVIDENCE" in data["scoped_prompt_preview"]

    # Verify that no admitted chunk starts after 1122.0s
    for adm in data["admitted"]:
        if adm["source_type"] == "video" and adm["start_sec"] is not None:
            assert adm["start_sec"] <= 1122.0

    # Verify blocked chunks have explicit rejection reasons
    for blk in data["blocked"]:
        assert blk["status"] in ("excluded_future", "excluded_resource_policy")
        assert "Blocked" in blk["reason"] or "future" in blk["reason"].lower()


def test_post_retrieve_course_not_found(client: TestClient):
    res = client.post(
        "/retrieve",
        json={
            "query": "Test query",
            "course_id": "00000000-0000-0000-0000-000000000099",
            "playback_sec": 100.0,
        },
    )
    assert res.status_code == 404
