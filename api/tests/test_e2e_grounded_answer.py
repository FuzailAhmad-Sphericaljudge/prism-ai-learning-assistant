import pytest
from fastapi.testclient import TestClient

from api.database import SessionLocal
from api.models.session import Message, Session


def test_e2e_grounded_tutor_pipeline_with_real_seeded_course(client: TestClient):
    """
    End-to-end test of the full grounded answer pipeline:
    1. Create a session at 700.0s (BST property taught, deletion & balancing future).
    2. Query covered topic -> gets grounded explanation, citation snapshot, and diagnostic check.
    3. Query future topic -> safely withheld by Temporal Evidence Firewall.
    4. Switch mode to explore_ahead -> unlocked and flagged.
    """
    seeded_course_id = "00000000-0000-0000-0000-000000000002"

    # Step 1: Create session
    sess_res = client.post(
        "/sessions",
        json={
            "course_id": seeded_course_id,
            "mode": "learn_so_far",
            "playback_sec": 700.0,
        },
    )
    assert sess_res.status_code == 201
    session_id = sess_res.json()["id"]

    # Step 2: Query covered topic in learn_so_far mode
    chat_res = client.post(
        "/chat",
        json={
            "query": "What is the binary search tree property?",
            "course_id": seeded_course_id,
            "playback_sec": 700.0,
            "mode": "learn_so_far",
            "session_id": session_id,
        },
    )
    assert chat_res.status_code == 200
    data = chat_res.json()

    assert data["validation_passed"] is True
    assert data["is_not_covered"] is False
    assert len(data["citations"]) > 0
    assert data["check"] is not None
    assert "question" in data["check"]
    assert len(data["check"]["options"]) >= 2

    # Step 3: Verify persistence of messages and citation snapshot in DB
    db = SessionLocal()
    try:
        messages = (
            db.query(Message)
            .filter(Message.session_id == session_id)
            .order_by(Message.created_at.asc())
            .all()
        )
        assert len(messages) == 2
        user_msg, asst_msg = messages[0], messages[1]
        assert user_msg.role == "user"
        assert asst_msg.role == "assistant"
        assert asst_msg.citations is not None
        assert len(asst_msg.citations) == len(data["citations"])
        assert asst_msg.citations[0]["evidence_id"] == data["citations"][0]["evidence_id"]
    finally:
        db.close()

    # Step 4: Query future topic in learn_so_far mode
    future_res = client.post(
        "/chat",
        json={
            "query": "How do you delete a node with two children in a BST?",
            "course_id": seeded_course_id,
            "playback_sec": 700.0,  # Deletion is taught at 18:42 (1122s)
            "mode": "learn_so_far",
            "session_id": session_id,
        },
    )
    assert future_res.status_code == 200
    future_data = future_res.json()

    assert future_data["is_not_covered"] is True
    assert "not covered yet" in future_data["answer"].lower()
    assert future_data["available_at_sec"] == 1122.0

    # Step 5: Switch to explore_ahead mode
    patch_res = client.patch(
        f"/sessions/{session_id}/playback",
        json={"playback_sec": 700.0, "mode": "explore_ahead"},
    )
    assert patch_res.status_code == 200
    assert patch_res.json()["mode"] == "explore_ahead"

    # Step 6: Query deletion in explore_ahead mode
    unlocked_res = client.post(
        "/chat",
        json={
            "query": "Explain node deletion with two children in a BST.",
            "course_id": seeded_course_id,
            "playback_sec": 700.0,
            "mode": "explore_ahead",
            "session_id": session_id,
        },
    )
    assert unlocked_res.status_code == 200
    unlocked_data = unlocked_res.json()
    assert unlocked_data["is_not_covered"] is False
    assert len(unlocked_data["citations"]) > 0
