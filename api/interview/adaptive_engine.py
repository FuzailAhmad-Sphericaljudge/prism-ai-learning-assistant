import logging
from typing import List, Dict, Any, Optional, Tuple
from api.schemas.interview import RubricCriterion, TurnEvaluation
from api.schemas.chat import CitationItem

logger = logging.getLogger("prism.interview.adaptive")


class AdaptiveInterviewEngine:
    """
    Evaluates candidate oral responses against structured rubric criteria and
    generates justified pedagogical follow-up questions tailored to revealed gaps.
    """

    @classmethod
    def evaluate_and_next_question(
        cls,
        round_number: int,
        max_rounds: int,
        candidate_answer: str,
        rubric: List[RubricCriterion],
    ) -> Tuple[TurnEvaluation, List[RubricCriterion], Optional[str], Optional[str], bool]:
        """
        Returns:
            - TurnEvaluation for the current round
            - Updated rubric with assigned scores and justifications
            - Next justified question (or None if completed)
            - Justification string explaining why this question was selected
            - is_completed (bool)
        """
        answer_lower = candidate_answer.strip().lower()
        curr_idx = min(round_number - 1, len(rubric) - 1)
        active_criterion = rubric[curr_idx]

        # 1. Rubric grading logic per criterion
        demonstrated: List[str] = []
        missed: List[str] = []

        if active_criterion.id == "crit-01":
            # Invariant: left < root <= right, ancestral / recursive
            has_left_right = "left" in answer_lower and "right" in answer_lower
            has_ancestral = any(w in answer_lower for w in ["ancest", "descendant", "global", "recursive", "all"])
            has_pruning = any(w in answer_lower for w in ["prun", "search", "subtree", "branch"])

            if has_left_right:
                demonstrated.append("Left subtree keys strictly less than root key")
            else:
                missed.append("Left subtree keys strictly less than root key")

            if has_ancestral:
                demonstrated.append("Recursive ancestral property across all descendants")
            else:
                missed.append("Recursive ancestral property across all descendants")

            if has_pruning:
                demonstrated.append("Explains binary search correctness relying on subtree pruning")
            else:
                missed.append("Explains binary search correctness relying on subtree pruning")

        elif active_criterion.id == "crit-02":
            # Complexity: O(h), degenerate O(N), balanced O(log N)
            has_height = any(w in answer_lower for w in ["height", "o(h)", "path", "depth"])
            has_worst = any(w in answer_lower for w in ["o(n)", "linear", "degenerate", "skewed", "list"])
            has_balanced = any(w in answer_lower for w in ["log n", "balanced", "avl", "red-black"])

            if has_height:
                demonstrated.append("Search cost is strictly bounded by height h (touching at most h + 1 nodes)")
            else:
                missed.append("Search cost is strictly bounded by height h (touching at most h + 1 nodes)")

            if has_worst:
                demonstrated.append("Worst-case search in unbalanced BST is O(N) when degenerate")
            else:
                missed.append("Worst-case search in unbalanced BST is O(N) when degenerate")

            if has_balanced:
                demonstrated.append("Balanced trees enforce height h = O(log N)")
            else:
                missed.append("Balanced trees enforce height h = O(log N)")

        elif active_criterion.id == "crit-03":
            # Pointer: trailing pointer y, leaf attachment, in-order sorted
            has_trailing = any(w in answer_lower for w in ["trailing", "parent", "pointer y", "y pointer"])
            has_leaf = any(w in answer_lower for w in ["leaf", "null", "attach", "bottom"])
            has_successor = any(w in answer_lower for w in ["minimum", "right subtree", "successor"])

            if has_trailing:
                demonstrated.append("Trailing pointer y maintains parent reference while pointer x descends to null")
            else:
                missed.append("Trailing pointer y maintains parent reference while pointer x descends to null")

            if has_leaf:
                demonstrated.append("New keys are always attached as new leaves at the bottom of the tree")
            else:
                missed.append("New keys are always attached as new leaves at the bottom of the tree")

            if has_successor:
                demonstrated.append("If right subtree is non-empty, successor is Tree-Minimum(x.right)")
            else:
                missed.append("If right subtree is non-empty, successor is Tree-Minimum(x.right)")

        else:
            # crit-04: Deletion & Rotations
            has_cases = any(w in answer_lower for w in ["case", "leaf", "single child", "two children"])
            has_splice = any(w in answer_lower for w in ["successor", "splice", "copy", "substitute"])
            has_rotation = any(w in answer_lower for w in ["rotation", "in-order", "preserve", "invariance"])

            if has_cases:
                demonstrated.append("Distinguishes 3 deletion cases: leaf, single child, and two children")
            else:
                missed.append("Distinguishes 3 deletion cases: leaf, single child, and two children")

            if has_splice:
                demonstrated.append("When two children exist, replaces target with its in-order successor")
            else:
                missed.append("When two children exist, replaces target with its in-order successor")

            if has_rotation:
                demonstrated.append("Tree rotations restructure heights while strictly preserving in-order key sequence")
            else:
                missed.append("Tree rotations restructure heights while strictly preserving in-order key sequence")

        # 2. Score calculation
        total_pts = len(demonstrated) + len(missed)
        score = round((len(demonstrated) / total_pts) * 100.0, 1) if total_pts > 0 else 50.0

        if score >= 75.0:
            eval_justification = f"Strong demonstration ({score}%): candidate articulated {', '.join(demonstrated)}."
        elif score >= 50.0:
            eval_justification = f"Partial understanding ({score}%): candidate covered {', '.join(demonstrated)}, but omitted {', '.join(missed)}."
        else:
            eval_justification = f"Significant conceptual gap ({score}%): candidate failed to establish {', '.join(missed)}."

        turn_eval = TurnEvaluation(
            criterion_id=active_criterion.id,
            criterion_name=active_criterion.name,
            score=score,
            justification=eval_justification,
            missed_points=missed,
            demonstrated_points=demonstrated,
        )

        # Update rubric object
        active_criterion.score = score
        active_criterion.justification = eval_justification

        # 3. Check termination condition
        is_completed = round_number >= max_rounds

        if is_completed:
            return turn_eval, rubric, None, None, True

        # 4. Generate next justified question
        next_question: str
        question_justification: str

        if missed and len(missed) >= 2 and round_number < max_rounds:
            # Socratic probe targeting missing expected point
            missing_item = missed[0]
            if "ancestral" in missing_item.lower():
                next_question = (
                    "You mentioned the immediate parent and child order, but what happens if a node deep in the left subtree "
                    "violates the root's bound? Why does binary search fail if the invariant is not strictly ancestral?"
                )
                question_justification = "Probing Socratic depth on ancestral invariants because candidate's answer omitted recursive left-subtree verification."
            elif "worst-case" in missing_item.lower() or "height" in missing_item.lower():
                next_question = (
                    "Could you specify the exact worst-case runtime for Tree-Search when inputs arrive in sorted order? "
                    "How does the tree's height compare to the number of nodes N in that scenario?"
                )
                question_justification = "Targeting complexity bounds because candidate did not clearly articulate the degenerate O(N) case."
            elif "trailing" in missing_item.lower():
                next_question = (
                    "In Tree-Insert, if we don't keep track of the trailing parent pointer y, what occurs when the descending pointer x "
                    "becomes null? How does the new node attach to the tree?"
                )
                question_justification = "Follow-up on pointer mechanics because candidate did not explain the need for the trailing parent pointer y."
            else:
                next_question = (
                    f"Let's look closer at {active_criterion.name}. Could you clarify how {missing_item.lower()} is enforced?"
                )
                question_justification = f"Targeted follow-up because candidate omitted {missing_item}."
        else:
            # Advance to next criterion in rubric
            next_idx = min(round_number, len(rubric) - 1)
            next_crit = rubric[next_idx]

            if next_crit.id == "crit-02":
                next_question = (
                    "Excellent. Now let's analyze algorithmic performance. If a software system receives keys that are already sorted, "
                    "what happens to the tree structure, and what is the resulting search time complexity?"
                )
                question_justification = "Candidate successfully demonstrated the BST invariant; advancing to analyze worst-case time complexity and tree height bounds."
            elif next_crit.id == "crit-03":
                next_question = (
                    "Understood. Moving to implementation mechanics: explain how Tree-Insert attaches a new key without corrupting "
                    "existing pointers, and how you find a node's in-order successor when its right subtree is non-empty."
                )
                question_justification = "Candidate handled complexity; advancing to verify pointer manipulation and in-order traversal mechanics."
            elif next_crit.id == "crit-04":
                next_question = (
                    "To conclude our technical defense: describe how node deletion preserves the BST invariant when the target node "
                    "has two children. Which node replaces it, and why does this keep in-order ordering intact?"
                )
                question_justification = "Advancing to advanced structural case splicing: node deletion and invariant preservation."
            else:
                next_question = f"Next, let's explore {next_crit.name}. How does the system handle this in practice?"
                question_justification = f"Advancing to criterion: {next_crit.name}."

        return turn_eval, rubric, next_question, question_justification, False
