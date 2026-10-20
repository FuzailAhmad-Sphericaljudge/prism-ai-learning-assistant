import pytest
from fastapi.testclient import TestClient
from api.main import app

client = TestClient(app)

COURSE_ID = "00000000-0000-0000-0000-000000000002"
USER_ID = "00000000-0000-0000-0000-000000000001"


def test_practice_generate_respects_playback_boundary():
    # At 700 seconds (11:40), only concepts introduced prior to 700s are permitted
    payload = {
        "course_id": COURSE_ID,
        "playback_sec": 700.0,
        "mode": "learn_so_far",
        "question_type": "mcq",
        "count": 1,
    }
    resp = client.post("/practice/generate", json=payload)
    assert resp.status_code == 200, resp.text
    data = resp.json()

    assert data["course_id"] == COURSE_ID
    assert len(data["questions"]) >= 1
    assert "BST Invariant" in data["available_concepts"]

    q = data["questions"][0]
    assert q["question_type"] == "mcq"
    assert q["concept_tag"] in ["BST Invariant", "Tree Search Complexity", "Tree Insertion"]
    assert len(q["options"]) == 4
    assert len(q["evidence_links"]) >= 1


def test_practice_generate_specific_concept():
    payload = {
        "course_id": COURSE_ID,
        "playback_sec": 1200.0,
        "mode": "learn_so_far",
        "concept_tag": "In-Order Successor",
        "question_type": "short_answer",
        "count": 1,
    }
    resp = client.post("/practice/generate", json=payload)
    assert resp.status_code == 200, resp.text
    data = resp.json()

    assert len(data["questions"]) >= 1
    q = data["questions"][0]
    assert q["concept_tag"] == "In-Order Successor"
    assert q["question_type"] == "short_answer"
    assert "successor" in q["question_text"].lower()


def test_practice_submit_correct_mcq():
    payload = {
        "question_id": "test-q-001",
        "course_id": COURSE_ID,
        "user_id": USER_ID,
        "concept_tag": "BST Invariant",
        "question_text": "What is the defining condition of the Binary Search Tree invariant?",
        "question_type": "mcq",
        "user_answer": "A",
        "playback_sec": 600.0,
    }
    resp = client.post("/practice/submit", json=payload)
    assert resp.status_code == 200, resp.text
    data = resp.json()

    assert data["is_correct"] is True
    assert data["score"] == 1.0
    assert data["misconception_tag"] is None
    assert data["updated_mastery_status"] in ["improving", "demonstrated"]
    assert data["updated_mastery_score"] > 0.0


def test_practice_submit_incorrect_mcq_with_misconception():
    payload = {
        "question_id": "test-q-002",
        "course_id": COURSE_ID,
        "user_id": USER_ID,
        "concept_tag": "BST Invariant",
        "question_text": "What is the defining condition of the Binary Search Tree invariant?",
        "question_type": "mcq",
        "user_answer": "B",
        "playback_sec": 600.0,
    }
    resp = client.post("/practice/submit", json=payload)
    assert resp.status_code == 200, resp.text
    data = resp.json()

    assert data["is_correct"] is False
    assert data["score"] == 0.0
    assert data["misconception_tag"] is not None
    assert "Local Parent-Child" in data["misconception_tag"]
    assert data["revision_action"] is not None
    assert data["revision_action"]["coordinate"] is not None
    assert data["revision_action"]["timestamp_sec"] is not None
