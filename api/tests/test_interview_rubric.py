import pytest
from api.interview.rubric import RubricGenerator

COURSE_ID = "00000000-0000-0000-0000-000000000002"


def test_rubric_generator_produces_grounded_criteria():
    criteria = RubricGenerator.generate_rubric(
        course_id=COURSE_ID,
        topic="Binary Search Trees & Structural Invariants",
        role_id="systems_engineer",
    )

    assert len(criteria) == 4, f"Expected 4 criteria, got {len(criteria)}"

    criterion_names = [c.name for c in criteria]
    assert "Recursive Invariant Enforcement" in criterion_names
    assert "Time Complexity & Height Bounds" in criterion_names
    assert "Pointer Manipulation & Insertion Mechanics" in criterion_names
    assert "Structural Splicing & Invariance Preservation" in criterion_names

    # Check each criterion has expected points and evidence
    for c in criteria:
        assert len(c.expected_points) >= 3, f"Criterion {c.name} lacks sufficient expected points"
        assert len(c.linked_evidence) >= 1, f"Criterion {c.name} has no linked evidence"
        evidence = c.linked_evidence[0]
        assert evidence.source_type == "video"
        assert evidence.coordinate is not None
        assert evidence.slide is not None
        assert evidence.start_sec is not None

    # Check specific landmark
    c1 = next(c for c in criteria if c.id == "crit-01")
    assert c1.linked_evidence[0].coordinate == "05:25"
    assert "ancestral" in c1.linked_evidence[0].quote.lower()
