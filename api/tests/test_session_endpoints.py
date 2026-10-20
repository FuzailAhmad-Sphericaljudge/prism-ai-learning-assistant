import uuid
import pytest
from fastapi.testclient import TestClient


def test_session_lifecycle(client: TestClient):
    # 1. Ensure a valid course exists
    course_code = f"CS-SESS-{uuid.uuid4().hex[:6].upper()}"
    course_res = client.post(
        "/courses",
        json={
            "title": "Session Lifecycle Course",
            "code": course_code,
            "instructor": "Dr. Elena Rostova",
        },
    )
    assert course_res.status_code == 201
    course_id = course_res.json()["id"]

    # 2. Create a session at 18:42 in learn_so_far mode
    create_payload = {
        "course_id": course_id,
        "playback_sec": 1122.0,
        "mode": "learn_so_far",
        "title": "Interactive BST Session",
    }
    res = client.post("/sessions", json=create_payload)
    assert res.status_code == 201
    data = res.json()
    assert data["course_id"] == course_id
    assert data["current_playback_sec"] == 1122.0
    assert data["mode"] == "learn_so_far"
    session_id = data["id"]

    # 3. Get the session by ID
    get_res = client.get(f"/sessions/{session_id}")
    assert get_res.status_code == 200
    assert get_res.json()["id"] == session_id

    # 4. Patch playback and mode
    patch_payload = {
        "playback_sec": 1250.0,
        "mode": "explore_ahead",
    }
    patch_res = client.patch(f"/sessions/{session_id}/playback", json=patch_payload)
    assert patch_res.status_code == 200
    updated_data = patch_res.json()
    assert updated_data["current_playback_sec"] == 1250.0
    assert updated_data["mode"] == "explore_ahead"


def test_session_course_not_found(client: TestClient):
    res = client.post(
        "/sessions",
        json={"course_id": "00000000-0000-0000-0000-000000000099", "playback_sec": 0.0},
    )
    assert res.status_code == 404
