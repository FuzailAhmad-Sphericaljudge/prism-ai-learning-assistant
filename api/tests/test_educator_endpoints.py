import pytest
from fastapi.testclient import TestClient
from api.main import app

client = TestClient(app)

COURSE_ID = "00000000-0000-0000-0000-000000000002"


def test_get_educator_insights_endpoint():
    resp = client.get(f"/educator/insights?course_id={COURSE_ID}")
    assert resp.status_code == 200, resp.text
    data = resp.json()

    assert data["course_id"] == COURSE_ID
    assert data["total_questions_asked"] >= 1
    assert data["total_practice_attempts"] >= 1
    assert len(data["confusion_heatmap"]) == 14
    assert len(data["top_misconceptions"]) >= 3
    assert len(data["top_questions"]) >= 3
    assert len(data["concept_distributions"]) == 6


def test_get_confusion_heatmap_endpoint():
    resp = client.get(f"/educator/confusion-heatmap?course_id={COURSE_ID}")
    assert resp.status_code == 200, resp.text
    data = resp.json()

    assert isinstance(data, list)
    assert len(data) == 14
    assert data[0]["start_sec"] == 0.0
    assert data[0]["end_sec"] == 120.0
    assert data[0]["coordinate_label"] == "00:00 - 02:00"


def test_export_educator_csv_endpoint():
    resp = client.get(f"/educator/export/csv?course_id={COURSE_ID}")
    assert resp.status_code == 200, resp.text
    assert "text/csv" in resp.headers["content-type"]
    assert "attachment" in resp.headers.get("content-disposition", "")

    csv_text = resp.text
    assert "# PRISM EDUCATOR COHORT TELEMETRY EXPORT" in csv_text
    assert "CONFUSION HEATMAP" in csv_text
    assert "TOP RECURRING MISCONCEPTIONS" in csv_text
    assert "Immediate Parent Fallacy" in csv_text
    assert "Local Parent-Child Fallacy" in csv_text
