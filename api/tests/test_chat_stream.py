import json
import pytest
from fastapi.testclient import TestClient


def test_post_chat_stream_grounded_answer(client: TestClient):
    """
    Validates POST /chat/stream generates progressive SSE token events
    and ends with a structured final payload containing valid citations.
    """
    seeded_course_id = "00000000-0000-0000-0000-000000000002"

    payload = {
        "query": "What is the binary search tree property?",
        "course_id": seeded_course_id,
        "playback_sec": 700.0,
        "mode": "learn_so_far",
    }

    res = client.post("/chat/stream", json=payload)
    assert res.status_code == 200
    assert "text/event-stream" in res.headers["content-type"]

    body = res.text
    assert "event: token" in body
    assert "event: final" in body

    # Parse the final event
    lines = body.split("\n")
    final_line = None
    for i, line in enumerate(lines):
        if line.startswith("event: final"):
            # The next non-empty line contains data: {...}
            for j in range(i + 1, len(lines)):
                if lines[j].startswith("data: "):
                    final_line = lines[j][len("data: "):]
                    break
            break

    assert final_line is not None
    data = json.loads(final_line)

    assert "answer" in data
    assert len(data["answer"]) > 10
    assert "citations" in data
    assert isinstance(data["citations"], list)
    assert data["validation_passed"] is True
    assert data["is_not_covered"] is False


def test_post_chat_stream_future_question(client: TestClient):
    """
    Validates that asking a future question (e.g. deletion at 5:00) streams
    a safe 'not covered yet' fallback and flags is_not_covered=True in the final event.
    """
    seeded_course_id = "00000000-0000-0000-0000-000000000002"

    payload = {
        "query": "How do you delete a node with two children?",
        "course_id": seeded_course_id,
        "playback_sec": 300.0,  # 5:00 (deletion taught at 18:42)
        "mode": "learn_so_far",
    }

    res = client.post("/chat/stream", json=payload)
    assert res.status_code == 200
    assert "text/event-stream" in res.headers["content-type"]

    body = res.text
    assert "event: final" in body

    lines = body.split("\n")
    final_line = None
    for i, line in enumerate(lines):
        if line.startswith("event: final"):
            for j in range(i + 1, len(lines)):
                if lines[j].startswith("data: "):
                    final_line = lines[j][len("data: "):]
                    break
            break

    assert final_line is not None
    data = json.loads(final_line)

    assert data["is_not_covered"] is True
    assert "not covered yet" in data["answer"].lower()
    assert data["available_at_sec"] == 1122.0


def test_post_chat_stream_course_not_found(client: TestClient):
    res = client.post(
        "/chat/stream",
        json={
            "query": "Hello",
            "course_id": "00000000-0000-0000-0000-000000000099",
            "playback_sec": 100.0,
        },
    )
    assert res.status_code == 404
