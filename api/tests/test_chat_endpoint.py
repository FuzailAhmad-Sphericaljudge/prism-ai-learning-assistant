import pytest
from fastapi.testclient import TestClient


def test_post_chat_sync_grounded_answer_and_check(client: TestClient):
    """
    Validates synchronous POST /chat generates a grounded answer with
    valid citations and a structured diagnostic check card.
    """
    seeded_course_id = "00000000-0000-0000-0000-000000000002"

    payload = {
        "query": "What is the binary search tree property?",
        "course_id": seeded_course_id,
        "playback_sec": 700.0,
        "mode": "learn_so_far",
    }

    res = client.post("/chat", json=payload)
    assert res.status_code == 200
    data = res.json()

    assert "answer" in data
    assert len(data["answer"]) > 10
    assert "citations" in data
    assert isinstance(data["citations"], list)
    assert len(data["citations"]) > 0

    first_cit = data["citations"][0]
    assert first_cit["evidence_id"].startswith("E")
    assert "quote" in first_cit
    assert "coordinate" in first_cit

    # Diagnostic check card
    assert data["check"] is not None
    check = data["check"]
    assert "question" in check
    assert "options" in check
    assert len(check["options"]) >= 2
    assert 0 <= check["correct_index"] < len(check["options"])
    assert "explanation" in check


def test_post_chat_sync_with_session_persistence(client: TestClient):
    """
    Validates that providing a session_id associates the message turn
    and returns a persisted message_id in the response.
    """
    seeded_course_id = "00000000-0000-0000-0000-000000000002"

    # Create session
    sess_res = client.post(
        "/sessions",
        json={
            "course_id": seeded_course_id,
            "mode": "learn_so_far",
            "playback_sec": 500.0,
        },
    )
    assert sess_res.status_code == 201
    session_id = sess_res.json()["id"]

    # Query chat with session_id
    payload = {
        "query": "Explain what a node contains in a BST.",
        "course_id": seeded_course_id,
        "playback_sec": 500.0,
        "mode": "learn_so_far",
        "session_id": session_id,
    }

    res = client.post("/chat", json=payload)
    assert res.status_code == 200
    data = res.json()

    assert data["session_id"] == session_id
    assert data["message_id"] is not None


def test_post_chat_sync_course_not_found(client: TestClient):
    res = client.post(
        "/chat",
        json={
            "query": "Hello",
            "course_id": "00000000-0000-0000-0000-000000000099",
            "playback_sec": 100.0,
        },
    )
    assert res.status_code == 404
