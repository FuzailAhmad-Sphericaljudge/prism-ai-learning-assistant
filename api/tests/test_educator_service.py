import pytest
from api.database import SessionLocal
from api.educator.service import EducatorAnalyticsService

COURSE_ID = "00000000-0000-0000-0000-000000000002"


def test_educator_service_aggregates_insights_and_heatmap():
    db = SessionLocal()
    service = EducatorAnalyticsService()

    try:
        insights = service.get_insights(db, COURSE_ID)

        assert insights.course_id == COURSE_ID
        assert insights.total_questions_asked >= 1
        assert insights.total_practice_attempts >= 1
        assert insights.active_students >= 1
        assert 0.0 <= insights.avg_course_mastery_percentage <= 100.0

        # Verify heatmap buckets
        assert len(insights.confusion_heatmap) == 14
        first_b = insights.confusion_heatmap[0]
        assert first_b.start_sec == 0.0
        assert first_b.end_sec == 120.0
        assert first_b.coordinate_label == "00:00 - 02:00"

        last_b = insights.confusion_heatmap[-1]
        assert last_b.end_sec == 1680.0
        assert last_b.coordinate_label == "26:00 - 28:00"

        for b in insights.confusion_heatmap:
            assert 0.0 <= b.confusion_intensity <= 1.0
            assert b.query_count >= 0
            assert b.misconception_count >= 0

        # Verify top misconceptions
        assert len(insights.top_misconceptions) >= 3
        misc_tags = [m.misconception_tag for m in insights.top_misconceptions]
        assert "Immediate Parent Fallacy" in misc_tags
        assert "Local Parent-Child Fallacy" in misc_tags

        for m in insights.top_misconceptions:
            assert m.prevalence_percentage > 0.0
            assert m.landmark_coordinate is not None
            assert len(m.remediation_action) > 10

        # Verify top questions
        assert len(insights.top_questions) >= 3
        for q in insights.top_questions:
            assert q.occurrences >= 1
            assert q.playback_coordinate is not None

        # Verify concept mastery distributions
        assert len(insights.concept_distributions) == 6

    finally:
        db.close()
