from unittest.mock import MagicMock
import json
import pytest

from api.schemas.chat import ChatRequest
from api.tutor.workflow import TutorWorkflow
from api.firewall.types import FirewallMode
from api.retrieval.types import ScoredCandidate, RetrievalResult


def test_tutor_workflow_grounded_answer_and_check():
    """Tests normal tutor flow with valid citations and diagnostic check."""
    mock_db = MagicMock()
    mock_retriever = MagicMock()

    c1 = ScoredCandidate(
        chunk_id="chunk-1",
        source_id="s1",
        source_type="video",
        text="The binary search tree property requires left descendants to be strictly less than root.",
        start_sec=200.0,
        end_sec=250.0,
    )
    mock_retriever.retrieve.return_value = RetrievalResult(
        query="What is the BST property?",
        course_id="c1",
        playback_sec=300.0,
        mode=FirewallMode.LEARN_SO_FAR,
        admitted_candidates=[c1],
    )

    workflow = TutorWorkflow(retriever=mock_retriever)

    # Mock provider response
    workflow.provider.generate = MagicMock(return_value=json.dumps({
        "answer": "The binary search tree invariant [E1] requires all keys in the left subtree to be strictly smaller than the root node.",
        "citations": [{"evidence_id": "E1", "quote": "left descendants to be strictly less than root"}],
        "diagnostic_check": {
            "question": "If root key is 50, which key cannot be in the left subtree?",
            "options": ["55", "30", "20", "15"],
            "correct_index": 0,
            "explanation": "Keys in the left subtree must be strictly less than 50, so 55 is invalid.",
        },
        "is_not_covered": False,
        "not_covered_topic": None,
    }))

    req = ChatRequest(
        query="What is the BST property?",
        course_id="c1",
        playback_sec=300.0,
        mode=FirewallMode.LEARN_SO_FAR,
    )

    resp = workflow.execute(req, db=mock_db)

    assert resp.validation_passed is True
    assert resp.is_not_covered is False
    assert len(resp.citations) == 1
    assert resp.citations[0].evidence_id == "E1"
    assert resp.check is not None
    assert resp.check.correct_index == 0
    assert "left subtree" in resp.answer


def test_tutor_workflow_triggers_not_covered_yet_on_downstream_concept():
    """Tests that querying deletion at 1000s (< 18:42) triggers 'not covered yet' without calling LLM."""
    mock_db = MagicMock()
    workflow = TutorWorkflow()

    req = ChatRequest(
        query="How do we delete a node with two children?",
        course_id="c1",
        playback_sec=1000.0,  # Before 18:42 (1122s)
        mode=FirewallMode.LEARN_SO_FAR,
    )

    resp = workflow.execute(req, db=mock_db)

    assert resp.is_not_covered is True
    assert resp.not_covered_topic == "Node deletion algorithms"
    assert resp.available_at_sec == 1122.0
    assert "Topic Not Covered Yet" in resp.answer
    assert resp.check is not None


def test_tutor_workflow_triggers_not_covered_yet_on_avl_rotation():
    """Tests that querying AVL rotations at 1200s (< 25:30) triggers 'not covered yet'."""
    mock_db = MagicMock()
    workflow = TutorWorkflow()

    req = ChatRequest(
        query="Explain how AVL tree double rotations work.",
        course_id="c1",
        playback_sec=1200.0,
        mode=FirewallMode.LEARN_SO_FAR,
    )

    resp = workflow.execute(req, db=mock_db)

    assert resp.is_not_covered is True
    assert "AVL" in resp.not_covered_topic
    assert resp.available_at_sec == 1530.0


def test_tutor_workflow_explore_ahead_bypasses_future_restriction():
    """In explore_ahead mode, downstream queries proceed to retrieval."""
    mock_db = MagicMock()
    mock_retriever = MagicMock()
    c_del = ScoredCandidate(
        chunk_id="c-del",
        source_id="s1",
        source_type="video",
        text="Case 3: Replace node with successor.",
        start_sec=1150.0,
        end_sec=1200.0,
    )
    mock_retriever.retrieve.return_value = RetrievalResult(
        query="How do we delete?",
        course_id="c1",
        playback_sec=500.0,
        mode=FirewallMode.EXPLORE_AHEAD,
        admitted_candidates=[c_del],
    )

    workflow = TutorWorkflow(retriever=mock_retriever)
    workflow.provider.generate = MagicMock(return_value=json.dumps({
        "answer": "Under explore ahead mode, deletion replaces z with successor [E1].",
        "citations": [{"evidence_id": "E1", "quote": "Replace node with successor"}],
        "diagnostic_check": {"question": "What is replaced?", "options": ["Successor", "Parent"], "correct_index": 0, "explanation": "Successor"},
        "is_not_covered": False,
    }))

    req = ChatRequest(
        query="How do we delete?",
        course_id="c1",
        playback_sec=500.0,
        mode=FirewallMode.EXPLORE_AHEAD,
    )

    resp = workflow.execute(req, db=mock_db)
    assert resp.is_not_covered is False
    assert len(resp.citations) == 1


def test_tutor_workflow_one_time_corrective_regeneration():
    """Tests that an initial invalid citation triggers corrective regeneration."""
    mock_db = MagicMock()
    mock_retriever = MagicMock()
    c1 = ScoredCandidate(
        chunk_id="c1",
        source_id="s1",
        source_type="video",
        text="Grounded content on BST invariants.",
        start_sec=100.0,
        end_sec=150.0,
    )
    mock_retriever.retrieve.return_value = RetrievalResult(
        query="Invariants?",
        course_id="c1",
        playback_sec=200.0,
        mode=FirewallMode.LEARN_SO_FAR,
        admitted_candidates=[c1],
    )

    workflow = TutorWorkflow(retriever=mock_retriever)

    # First call produces invalid citation [E99]; second call corrects to [E1]
    invalid_gen = json.dumps({
        "answer": "This claim cites non-existent [E99].",
        "citations": [{"evidence_id": "E99", "quote": "none"}],
        "diagnostic_check": {"question": "Q?", "options": ["A"], "correct_index": 0, "explanation": "exp"},
    })
    corrected_gen = json.dumps({
        "answer": "This corrected claim cites valid [E1].",
        "citations": [{"evidence_id": "E1", "quote": "Grounded content"}],
        "diagnostic_check": {"question": "Q?", "options": ["A"], "correct_index": 0, "explanation": "exp"},
    })

    workflow.provider.generate = MagicMock(side_effect=[invalid_gen, corrected_gen])

    req = ChatRequest(
        query="Invariants?",
        course_id="c1",
        playback_sec=200.0,
        mode=FirewallMode.LEARN_SO_FAR,
    )

    resp = workflow.execute(req, db=mock_db)

    # Provider should have been called twice (1 initial + 1 corrective retry)
    assert workflow.provider.generate.call_count == 2
    assert resp.validation_passed is True
    assert "corrected claim" in resp.answer
    assert resp.citations[0].evidence_id == "E1"


