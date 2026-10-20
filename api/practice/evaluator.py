import logging
from typing import Optional, List, Dict, Any
from api.practice.types import EvaluationResult, MisconceptionRule
from api.practice.revision import MISCONCEPTION_RULES, resolve_revision_action
from api.practice.taxonomy import get_concept_by_tag
from api.schemas.practice import RevisionAction

logger = logging.getLogger("prism.practice.evaluator")


class PracticeEvaluator:
    """
    Evaluator that assesses student answers against verified evidence,
    detects exact misconceptions, and returns actionable revision links.
    """

    def evaluate(
        self,
        concept_tag: str,
        question_type: str,
        question_text: str,
        user_answer: str,
        correct_answer: str,
        options: Optional[List[str]] = None,
        explanation: Optional[str] = None,
    ) -> EvaluationResult:
        if question_type.lower() == "short_answer":
            return self.evaluate_short_answer(
                concept_tag=concept_tag,
                question_text=question_text,
                user_answer=user_answer,
                correct_answer=correct_answer,
                explanation=explanation,
            )
        else:
            return self.evaluate_mcq(
                concept_tag=concept_tag,
                user_answer=user_answer,
                correct_answer=correct_answer,
                options=options or [],
                explanation=explanation,
            )

    def evaluate_mcq(
        self,
        concept_tag: str,
        user_answer: str,
        correct_answer: str,
        options: List[str],
        explanation: Optional[str] = None,
    ) -> EvaluationResult:
        u_ans = user_answer.strip().upper()
        c_ans = correct_answer.strip().upper()

        # Check if user passed full text of an option
        selected_idx: Optional[int] = None
        if len(u_ans) == 1 and u_ans in "ABCD":
            selected_idx = ord(u_ans) - ord("A")
        else:
            # Match by option text
            for idx, opt in enumerate(options):
                if u_ans.lower() == opt.lower() or opt.lower().startswith(u_ans.lower()):
                    selected_idx = idx
                    break

        correct_idx = ord(c_ans) - ord("A") if len(c_ans) == 1 and c_ans in "ABCD" else 0

        if selected_idx is not None and selected_idx == correct_idx:
            # Correct answer!
            concept = get_concept_by_tag(concept_tag)
            rev_action = resolve_revision_action(concept_tag, None)
            return EvaluationResult(
                is_correct=True,
                score=1.0,
                misconception_tag=None,
                feedback="Excellent! You demonstrated an accurate understanding of this principle.",
                explanation=explanation or (concept.description if concept else "Well done."),
                revision_action=rev_action,
            )

        # Incorrect answer: Diagnose specific misconception
        distractor_idx = selected_idx if selected_idx is not None else 1
        rule: Optional[MisconceptionRule] = None
        if concept_tag in MISCONCEPTION_RULES:
            rule = MISCONCEPTION_RULES[concept_tag].get(distractor_idx)
            if not rule and distractor_idx > 0:
                # Fallback to first distractor rule for this concept
                rule = list(MISCONCEPTION_RULES[concept_tag].values())[0]

        misconception_tag = rule.misconception_tag if rule else "Conceptual Inaccuracy"
        feedback = rule.diagnosis if rule else "Your answer differs from the verified lecture principle."
        rev_action = resolve_revision_action(concept_tag, rule)

        return EvaluationResult(
            is_correct=False,
            score=0.0,
            misconception_tag=misconception_tag,
            feedback=feedback,
            explanation=explanation or "Review the verified lecture materials to clarify this concept.",
            revision_action=rev_action,
        )

    def evaluate_short_answer(
        self,
        concept_tag: str,
        question_text: str,
        user_answer: str,
        correct_answer: str,
        explanation: Optional[str] = None,
    ) -> EvaluationResult:
        u_lower = user_answer.strip().lower()

        # Keyword Rubric checks per concept
        rubric_passed = False
        diagnosed_misconception: Optional[str] = None

        if concept_tag == "BST Invariant":
            # Correct: mentions left, right, global / ancestral / recursive / descendants
            if ("left" in u_lower or "right" in u_lower) and any(w in u_lower for w in ["descendant", "global", "ancest", "recursive", "all"]):
                rubric_passed = True
            elif "immediate" in u_lower or "only parent" in u_lower or "direct child" in u_lower:
                diagnosed_misconception = "Local Parent-Child Fallacy"
            elif "heap" in u_lower or "array" in u_lower:
                diagnosed_misconception = "Binary Heap Array Confusion"

        elif concept_tag == "Tree Search Complexity":
            if any(w in u_lower for w in ["height", "path", "o(h)", "descend", "single"]):
                rubric_passed = True
            elif "o(log n)" in u_lower and "always" in u_lower:
                diagnosed_misconception = "Constant Height Assumption"
            elif "every node" in u_lower or "linear" in u_lower:
                diagnosed_misconception = "Exhaustive Multi-Path Traversal Error"

        elif concept_tag == "Tree Insertion":
            if any(w in u_lower for w in ["leaf", "trailing", "parent", "null", "link"]):
                rubric_passed = True
            elif "root" in u_lower and "replace" in u_lower:
                diagnosed_misconception = "Root Replacement Fallacy"

        elif concept_tag == "In-Order Successor":
            if any(w in u_lower for w in ["minimum", "right subtree", "ancestor", "left child"]):
                rubric_passed = True
            elif "parent" in u_lower and "always" in u_lower:
                diagnosed_misconception = "Immediate Parent Fallacy"

        elif concept_tag == "Node Deletion":
            if any(w in u_lower for w in ["successor", "splice", "copy", "key", "one child"]):
                rubric_passed = True
            elif "both children" in u_lower or "delete both" in u_lower:
                diagnosed_misconception = "Subtree Decapitation Fallacy"

        elif concept_tag == "Self-Balancing Trees":
            if any(w in u_lower for w in ["rotation", "height", "log", "in-order", "preserve"]):
                rubric_passed = True
            elif "change order" in u_lower or "reverse" in u_lower:
                diagnosed_misconception = "In-Order Traversal Invariance Violation"

        else:
            # Generic rubric check
            if len(u_lower.split()) >= 6:
                rubric_passed = True

        rule: Optional[MisconceptionRule] = None
        if not rubric_passed and concept_tag in MISCONCEPTION_RULES:
            if diagnosed_misconception:
                for r in MISCONCEPTION_RULES[concept_tag].values():
                    if r.misconception_tag == diagnosed_misconception:
                        rule = r
                        break
            if not rule:
                rule = list(MISCONCEPTION_RULES[concept_tag].values())[0]

        if rubric_passed:
            rev_action = resolve_revision_action(concept_tag, None)
            return EvaluationResult(
                is_correct=True,
                score=1.0,
                misconception_tag=None,
                feedback="Spot on! Your explanation accurately grounds the core algorithmic invariant.",
                explanation=explanation or correct_answer,
                revision_action=rev_action,
            )
        else:
            misconception_tag = rule.misconception_tag if rule else (diagnosed_misconception or "Incomplete Explanation")
            feedback = rule.diagnosis if rule else "Your explanation lacked key foundational requirements established in the lecture."
            rev_action = resolve_revision_action(concept_tag, rule)
            return EvaluationResult(
                is_correct=False,
                score=0.0,
                misconception_tag=misconception_tag,
                feedback=feedback,
                explanation=explanation or correct_answer,
                revision_action=rev_action,
            )
