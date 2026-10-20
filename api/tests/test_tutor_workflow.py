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
