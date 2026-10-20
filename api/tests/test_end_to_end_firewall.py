import pytest
from fastapi.testclient import TestClient


def test_end_to_end_policy_firewall_and_retrieval(client: TestClient):
    seeded_course_id = "00000000-0000-0000-0000-000000000002"

    # 1. Initialize session at 18:42 (1122.0s)
    sess_res = client.post(
        "/sessions",
        json={
            "course_id": seeded_course_id,
            "playback_sec": 1122.0,
            "mode": "learn_so_far",
            "title": "E2E Firewall Test Session",
        },
    )
    assert sess_res.status_code == 201
    session_id = sess_res.json()["id"]

    # 2. Query deletion while guarded at 18:42
    ret_res_guarded = client.post(
        "/retrieve",
        json={
            "query": "How do we delete a node with two children?",
            "course_id": seeded_course_id,
            "playback_sec": 1122.0,
            "mode": "learn_so_far",
            "top_k": 5,
        },
    )
    assert ret_res_guarded.status_code == 200
    guarded_data = ret_res_guarded.json()

    # Blocked list must contain future deletion chunks
    assert any("deletion" in blk["reason"].lower() or "blocked" in blk["reason"].lower() for blk in guarded_data["blocked"])

    # 3. Patch session to 22:00 (1320.0s) when deletion has been fully taught
    patch_res = client.patch(
        f"/sessions/{session_id}/playback",
        json={"playback_sec": 1320.0, "mode": "learn_so_far"},
    )
    assert patch_res.status_code == 200
    assert patch_res.json()["current_playback_sec"] == 1320.0

    # 4. Re-query deletion now that student has advanced past deletion lecture
    ret_res_advanced = client.post(
        "/retrieve",
        json={
            "query": "How do we delete a node with two children?",
            "course_id": seeded_course_id,
            "playback_sec": 1320.0,
            "mode": "learn_so_far",
            "top_k": 5,
        },
    )
    assert ret_res_advanced.status_code == 200
    advanced_data = ret_res_advanced.json()

    # Deletion chunks must now be admitted!
    assert advanced_data["admitted_count"] > 0
    admitted_text = " ".join([a["text"].lower() for a in advanced_data["admitted"]])
    assert "delete" in admitted_text or "node" in admitted_text
