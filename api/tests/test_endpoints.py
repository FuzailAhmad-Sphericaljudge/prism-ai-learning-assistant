import io
import pytest
from fastapi.testclient import TestClient


def test_course_endpoints_lifecycle(client: TestClient):
    # 1. Create a course
    create_payload = {
        "title": "Algorithms & Abstract Data Types",
        "code": "CS-TEST-101",
        "description": "Integration testing course for PRISM API.",
        "instructor": "Prof. Test Falcon",
        "term": "Fall 2026",
    }
    res = client.post("/courses", json=create_payload)
    assert res.status_code == 201
    course_data = res.json()
    assert course_data["code"] == "CS-TEST-101"
    course_id = course_data["id"]

    # 2. List courses
    list_res = client.get("/courses")
    assert list_res.status_code == 200
    courses = list_res.json()
    assert any(c["id"] == course_id for c in courses)

    # 3. Get single course by ID
    get_res = client.get(f"/courses/{course_id}")
    assert get_res.status_code == 200
    assert get_res.json()["title"] == "Algorithms & Abstract Data Types"

    # 4. Upload source file (VTT transcript)
    vtt_content = b"""WEBVTT\n\n00:00:00.000 --> 00:00:10.000\n<v Instructor>Intro to trees.</v>\n\n00:00:10.000 --> 00:00:20.000\n<v Instructor>BST search algorithm.</v>\n"""
    files = {"file": ("test_lecture.vtt", io.BytesIO(vtt_content), "text/vtt")}
    upload_res = client.post(
        f"/courses/{course_id}/sources",
        files=files,
        data={"title": "Test Lecture Recording", "type": "video", "version": 1},
    )
    assert upload_res.status_code == 202
    source_data = upload_res.json()
    source_id = source_data["id"]
    assert source_data["type"] == "video"

    # 5. Check source status endpoint
    status_res = client.get(f"/sources/{source_id}/status")
    assert status_res.status_code == 200
    assert status_res.json()["id"] == source_id

    # 6. Check course resources grouping
    res_grouped = client.get(f"/courses/{course_id}/resources")
    assert res_grouped.status_code == 200
    grouped_data = res_grouped.json()
    assert "video" in grouped_data["resources"]
    assert any(s["id"] == source_id for s in grouped_data["resources"]["video"])

    # 7. Check transcript retrieval and boundary cutoff
    t_res = client.get(f"/courses/{course_id}/transcript?max_time_sec=15.0")
    assert t_res.status_code == 200
    assert "cues" in t_res.json()


def test_course_not_found(client: TestClient):
    res = client.get("/courses/non-existent-uuid-99999")
    assert res.status_code == 404


def test_source_not_found(client: TestClient):
    res = client.get("/sources/non-existent-uuid-99999/status")
    assert res.status_code == 404
    file_res = client.get("/sources/non-existent-uuid-99999/file")
    assert file_res.status_code == 404
