import pytest
from fastapi.testclient import TestClient
from api.main import app

client = TestClient(app)

COURSE_ID = "00000000-0000-0000-0000-000000000002"
USER_ID = "00000000-0000-0000-0000-000000000001"


def test_get_interview_roles():
    resp = client.get("/interview/roles")
    assert resp.status_code == 200, resp.text
    data = resp.json()
    assert isinstance(data, list)
    assert len(data) >= 3
    role_ids = [r["id"] for r in data]
    assert "systems_engineer" in role_ids
    assert "algorithm_specialist" in role_ids


def test_interview_endpoints_end_to_end():
    # 1. Start Interview
    start_payload = {
        "course_id": COURSE_ID,
        "user_id": USER_ID,
        "role": "systems_engineer",
        "topic": "Binary Search Trees & Structural Invariants",
        "max_rounds": 2,
    }
    resp_start = client.post("/interview/start", json=start_payload)
    assert resp_start.status_code == 200, resp_start.text
    start_data = resp_start.json()

    session_id = start_data["session_id"]
    assert start_data["current_round"] == 1
    assert start_data["max_rounds"] == 2
    assert len(start_data["rubric"]) == 4
    assert len(start_data["initial_question"]) > 10

    # 2. Get active session state
    resp_get = client.get(f"/interview/{session_id}")
    assert resp_get.status_code == 200
    assert resp_get.json()["session_id"] == session_id

    # 3. Turn 1
    turn1_payload = {
        "session_id": session_id,
        "user_answer": "In-order traversal visits left, root, right, but the BST property requires all left keys to be smaller than root ancestrally.",
    }
    resp_t1 = client.post("/interview/turn", json=turn1_payload)
    assert resp_t1.status_code == 200, resp_t1.text
    t1_data = resp_t1.json()

    assert t1_data["round_number"] == 2
    assert t1_data["is_completed"] is False
    assert t1_data["next_question"] is not None
    assert t1_data["justification"] is not None

    # 4. Turn 2 (final round)
    turn2_payload = {
        "session_id": session_id,
        "user_answer": "Tree-search takes O(h) time because it branches down a single path touching h+1 nodes; worst case is O(N) in degenerate linked lists.",
    }
    resp_t2 = client.post("/interview/turn", json=turn2_payload)
    assert resp_t2.status_code == 200, resp_t2.text
    t2_data = resp_t2.json()

    assert t2_data["is_completed"] is True
    assert t2_data["next_question"] is None

    # 5. Fetch Final Report
    resp_report = client.get(f"/interview/{session_id}/report")
    assert resp_report.status_code == 200, resp_report.text
    report_data = resp_report.json()

    assert report_data["session_id"] == session_id
    assert 0.0 <= report_data["overall_score"] <= 100.0
    assert len(report_data["criteria_scores"]) == 4
    assert isinstance(report_data["strengths"], list)
    assert isinstance(report_data["gaps"], list)
    assert isinstance(report_data["revision_links"], list)
