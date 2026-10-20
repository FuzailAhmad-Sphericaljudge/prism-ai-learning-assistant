import pytest
from api.interview.report_generator import InterviewReportGenerator
from api.interview.rubric import RubricGenerator

COURSE_ID = "00000000-0000-0000-0000-000000000002"
USER_ID = "00000000-0000-0000-0000-000000000001"


def test_interview_report_generator_computes_strengths_gaps_and_revisions():
    rubric = RubricGenerator.generate_rubric(COURSE_ID, "Binary Search Trees")

    # Set mock scores: 2 strong, 2 with gaps
    rubric[0].score = 90.0
    rubric[0].justification = "Mastered ancestral invariant."
    rubric[1].score = 85.0
    rubric[1].justification = "Mastered height bounds and degeneracy."
    rubric[2].score = 45.0
    rubric[2].justification = "Missed trailing pointer mechanics."
    rubric[3].score = 50.0
    rubric[3].justification = "Omitted successor splicing in two-children case."

    transcript = [
        {"round": 1, "question": "Explain invariant", "answer": "Ancestral bound..."},
        {"round": 2, "question": "Explain complexity", "answer": "O(h) and degenerate O(N)..."},
        {"round": 3, "question": "Explain insert", "answer": "Standard pointers..."},
    ]

    report = InterviewReportGenerator.generate_report(
        session_id="test-session-123",
        course_id=COURSE_ID,
        user_id=USER_ID,
        role="Systems Software Engineer",
        topic="Binary Search Trees & Structural Invariants",
        rubric=rubric,
        transcript=transcript,
    )

    # (90 + 85 + 45 + 50) / 4 = 270 / 4 = 67.5
    assert report.overall_score == 67.5
    assert report.status == "needs_revision"
    assert len(report.criteria_scores) == 4

    # Strengths check
    assert len(report.strengths) == 2
    assert any("Recursive Invariant Enforcement" in s for s in report.strengths)

    # Gaps check
    assert len(report.gaps) == 2
    assert any("Pointer Manipulation" in g for g in report.gaps)
    assert any("Structural Splicing" in g for g in report.gaps)

    # Revision links check
    assert len(report.revision_links) == 2
    coords = [r.coordinate for r in report.revision_links]
    assert "12:40" in coords  # Tree insertion trailing pointer
    assert "21:10" in coords  # Deletion splicing
