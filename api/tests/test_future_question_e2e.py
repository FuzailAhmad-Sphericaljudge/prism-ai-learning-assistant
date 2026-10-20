import pytest
from fastapi.testclient import TestClient


def test_future_only_question_withheld_at_18_42(client: TestClient):
    """
    Validates that at 18:42 (1122s), an advanced question about AVL or
    Red-Black rotations (taught at 25:30) is safely withheld with is_not_covered=True,
    preventing any future leakage in learn_so_far mode.
    """
    seeded_course_id = "00000000-0000-0000-0000-000000000002"

    payload = {
        "query": "How do AVL tree rotations prevent tree degeneration?",
        "course_id": seeded_course_id,
        "playback_sec": 1122.0,  # 18:42 landmark
        "mode": "learn_so_far",
    }

    res = client.post("/chat", json=payload)
    assert res.status_code == 200
    data = res.json()

    # Must be marked as not covered yet
    assert data["is_not_covered"] is True
    assert data["available_at_sec"] == 1530.0  # 25:30
    assert "not covered yet" in data["answer"].lower()
    assert "rotations" in data["not_covered_topic"].lower() or "balancing" in data["not_covered_topic"].lower()

    # Zero future citations admitted
    for cit in data["citations"]:
        if cit.get("start_sec") is not None:
            assert cit["start_sec"] <= 1122.0


def test_future_question_unlocked_in_explore_ahead_mode(client: TestClient):
    """
    Validates that switching to explore_ahead unlocks future content
    and generates a validated answer.
    """
    seeded_course_id = "00000000-0000-0000-0000-000000000002"

    payload = {
        "query": "What are AVL tree rotations?",
        "course_id": seeded_course_id,
        "playback_sec": 1122.0,
        "mode": "explore_ahead",
    }

    res = client.post("/chat", json=payload)
    assert res.status_code == 200
    data = res.json()

    assert data["is_not_covered"] is False
    assert len(data["answer"]) > 20
