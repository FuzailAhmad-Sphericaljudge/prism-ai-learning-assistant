import pytest
from api.mastery.recommender import NextBestActionRecommender
from api.schemas.mastery import ConceptMastery


def test_recommender_prioritizes_gap_found():
    course_id = "00000000-0000-0000-0000-000000000002"
    concepts = [
        ConceptMastery(
            concept_tag="BST Invariant",
            status="demonstrated",
            mastery_score=0.95,
            attempts_count=4,
            correct_count=4,
        ),
        ConceptMastery(
            concept_tag="Tree Search Complexity",
            status="gap_found",
            mastery_score=0.35,
            attempts_count=2,
            correct_count=0,
            misconceptions=["Constant Height Assumption"],
            evidence_landmarks=["10:25", "Slide 5"],
        ),
        ConceptMastery(
            concept_tag="Tree Insertion",
            status="not_assessed",
            mastery_score=0.0,
            attempts_count=0,
            correct_count=0,
        ),
    ]

    action = NextBestActionRecommender.recommend(course_id=course_id, concepts=concepts)
    assert action is not None
    assert action.concept_tag == "Tree Search Complexity"
    assert action.recommended_type == "revise"
    assert "10:25" in action.label or "10:25" in action.coordinate
    assert "learn/00000000-0000-0000-0000-000000000002" in action.action_url
    assert "Constant Height Assumption" in action.reason


def test_recommender_targets_improving_when_no_gaps():
    course_id = "00000000-0000-0000-0000-000000000002"
    concepts = [
        ConceptMastery(
            concept_tag="BST Invariant",
            status="demonstrated",
            mastery_score=0.90,
            attempts_count=3,
            correct_count=3,
        ),
        ConceptMastery(
            concept_tag="Tree Search Complexity",
            status="improving",
            mastery_score=0.65,
            attempts_count=2,
            correct_count=1,
        ),
    ]

    action = NextBestActionRecommender.recommend(course_id=course_id, concepts=concepts)
    assert action is not None
    assert action.concept_tag == "Tree Search Complexity"
    assert action.recommended_type == "practice"
    assert "practice" in action.action_url.lower()


def test_recommender_targets_earliest_unassessed():
    course_id = "00000000-0000-0000-0000-000000000002"
    concepts = [
        ConceptMastery(
            concept_tag="BST Invariant",
            status="demonstrated",
            mastery_score=1.0,
            attempts_count=2,
            correct_count=2,
        ),
        ConceptMastery(
            concept_tag="Tree Search Complexity",
            status="not_assessed",
            mastery_score=0.0,
            attempts_count=0,
            correct_count=0,
        ),
    ]

    action = NextBestActionRecommender.recommend(course_id=course_id, concepts=concepts)
    assert action is not None
    assert action.concept_tag == "Tree Search Complexity"
    assert action.recommended_type == "practice"


def test_recommender_all_demonstrated():
    course_id = "00000000-0000-0000-0000-000000000002"
    concepts = [
        ConceptMastery(
            concept_tag="BST Invariant",
            status="demonstrated",
            mastery_score=1.0,
            attempts_count=2,
            correct_count=2,
        ),
        ConceptMastery(
            concept_tag="Tree Search Complexity",
            status="demonstrated",
            mastery_score=1.0,
            attempts_count=2,
            correct_count=2,
        ),
    ]

    action = NextBestActionRecommender.recommend(course_id=course_id, concepts=concepts)
    assert action is not None
    assert action.recommended_type == "explore"
    assert "interview" in action.label.lower() or "socratic" in action.label.lower()
