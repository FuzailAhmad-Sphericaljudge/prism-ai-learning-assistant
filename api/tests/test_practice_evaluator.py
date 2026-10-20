import pytest
from api.practice.evaluator import PracticeEvaluator
from api.practice.revision import MISCONCEPTION_RULES


def test_evaluate_mcq_correct():
    evaluator = PracticeEvaluator()
    res = evaluator.evaluate(
        concept_tag="BST Invariant",
        question_type="mcq",
        question_text="What is the BST invariant?",
        user_answer="A",
        correct_answer="A",
        options=[
            "For every node x, left(x) < x <= right(x)",
            "Direct children only",
            "Balanced height only",
            "Linear index only",
        ],
    )

    assert res.is_correct is True
    assert res.score == 1.0
    assert res.misconception_tag is None
    assert "demonstrated an accurate understanding" in res.feedback
    assert res.revision_action is not None


def test_evaluate_mcq_detects_specific_misconceptions():
    evaluator = PracticeEvaluator()

    # Distractor 1 (B): Local Parent-Child Fallacy
    res_b = evaluator.evaluate(
        concept_tag="BST Invariant",
        question_type="mcq",
        question_text="What is the BST invariant?",
        user_answer="B",
        correct_answer="A",
        options=[
            "For every node x, left(x) < x <= right(x)",
            "Direct children only",
            "Balanced height only",
            "Linear index only",
        ],
    )
    assert res_b.is_correct is False
    assert res_b.score == 0.0
    assert res_b.misconception_tag == "Local Parent-Child Fallacy"
    assert "ancestral across all left and right descendants" in res_b.feedback

    # Distractor 2 (C): Balance vs Ordering Invariant Confusion
    res_c = evaluator.evaluate(
        concept_tag="BST Invariant",
        question_type="mcq",
        question_text="What is the BST invariant?",
        user_answer="C",
        correct_answer="A",
        options=[
            "For every node x, left(x) < x <= right(x)",
            "Direct children only",
            "Balanced height only",
            "Linear index only",
        ],
    )
    assert res_c.is_correct is False
    assert res_c.misconception_tag == "Balance vs Ordering Invariant Confusion"


def test_evaluate_mcq_search_complexity_misconceptions():
    evaluator = PracticeEvaluator()

    # Distractor 1 (B): Constant Height Assumption
    res = evaluator.evaluate(
        concept_tag="Tree Search Complexity",
        question_type="mcq",
        question_text="What is the worst-case time complexity of searching in an unbalanced BST?",
        user_answer="B",
        correct_answer="A",
        options=[
            "O(N), when the tree degenerates into a linear linked list",
            "O(log N), because half the keys are always eliminated",
            "O(1), using direct pointer arithmetic",
            "O(N log N), because multiple paths must be explored",
        ],
    )
    assert res.is_correct is False
    assert res.misconception_tag == "Constant Height Assumption"
    assert "degenerates the tree into an O(N) linear linked list" in res.feedback


def test_evaluate_short_answer_rubric():
    evaluator = PracticeEvaluator()

    # Accurate explanation
    correct_res = evaluator.evaluate(
        concept_tag="BST Invariant",
        question_type="short_answer",
        question_text="Why must the BST invariant hold across all descendants?",
        user_answer="Because all descendants in the left subtree must be less than the root key, forming a global ancestral ordering.",
        correct_answer="It is recursive and ancestral across all left and right descendants.",
    )
    assert correct_res.is_correct is True
    assert correct_res.score == 1.0

    # Misconception explanation
    flawed_res = evaluator.evaluate(
        concept_tag="BST Invariant",
        question_type="short_answer",
        question_text="Why must the BST invariant hold across all descendants?",
        user_answer="It only checks the direct child node pointers locally.",
        correct_answer="It is recursive and ancestral across all left and right descendants.",
    )
    assert flawed_res.is_correct is False
    assert flawed_res.misconception_tag == "Local Parent-Child Fallacy"


def test_revision_action_link_generation():
    evaluator = PracticeEvaluator()

    res = evaluator.evaluate(
        concept_tag="In-Order Successor",
        question_type="mcq",
        question_text="How do you find successor when right child is empty?",
        user_answer="B",
        correct_answer="A",
        options=["Ascend ancestor pointers", "Immediate parent always", "Right sibling", "None"],
    )

    action = res.revision_action
    assert action is not None
    assert action.type == "video"
    assert action.timestamp_sec == 1015.0  # 16:55
    assert action.coordinate == "16:55"
    assert action.slide == 7
    assert "16:55" in action.label
