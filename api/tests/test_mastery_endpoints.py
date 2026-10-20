import pytest
from fastapi.testclient import TestClient
from api.main import app

client = TestClient(app)

COURSE_ID = "00000000-0000-0000-0000-000000000002"
USER_ID = "00000000-0000-0000-0000-000000000001"


def test_get_mastery_dashboard():
    resp = client.get(f"/mastery?course_id={COURSE_ID}&user_id={USER_ID}")
    assert resp.status_code == 200, resp.text
    data = resp.json()

    assert data["course_id"] == COURSE_ID
    assert data["user_id"] == USER_ID
    assert data["total_concepts"] == 6
    assert isinstance(data["assessed_concepts"], int)
    assert isinstance(data["overall_mastery_percentage"], float)
    assert len(data["concepts"]) == 6

    # Verify each concept item structure
    tags = [c["concept_tag"] for c in data["concepts"]]
    assert "BST Invariant" in tags
    assert "Tree Search Complexity" in tags
    assert "Self-Balancing Trees" in tags

    for c in data["concepts"]:
        assert c["status"] in ["not_assessed", "gap_found", "improving", "demonstrated"]
        assert 0.0 <= c["mastery_score"] <= 1.0
        assert isinstance(c["evidence_landmarks"], list)
        assert len(c["evidence_landmarks"]) >= 1

    # Verify next best action recommendation
    assert data["next_best_action"] is not None
    nba = data["next_best_action"]
    assert "concept_tag" in nba
    assert "recommended_type" in nba
    assert "action_url" in nba
    assert "reason" in nba


def test_get_mastery_timeline():
    resp = client.get(f"/mastery/timeline?course_id={COURSE_ID}&user_id={USER_ID}")
    assert resp.status_code == 200, resp.text
    data = resp.json()

    assert data["course_id"] == COURSE_ID
    assert data["user_id"] == USER_ID
    assert isinstance(data["total_attempts"], int)
    assert isinstance(data["timeline"], list)

    if data["timeline"]:
        item = data["timeline"][0]
        assert "concept_tag" in item
        assert "question_text" in item
        assert "is_correct" in item
        assert "feedback" in item
        assert "created_at" in item
