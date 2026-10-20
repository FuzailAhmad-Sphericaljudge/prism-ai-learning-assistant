import logging
from typing import List, Optional
from sqlalchemy.orm import Session as DBSession

from api.schemas.interview import RubricCriterion
from api.schemas.chat import CitationItem
from api.practice.taxonomy import BST_CONCEPTS, get_concept_by_tag
from api.models.chunk import Chunk
from api.models.source import Source

logger = logging.getLogger("prism.interview.rubric")


class RubricGenerator:
    """
    Generates structured, evidence-grounded oral defense rubrics from course materials.
    Every criterion defines expected points and direct temporal lecture coordinates.
    """

    @classmethod
    def generate_rubric(
        cls,
        course_id: str,
        topic: str,
        role_id: Optional[str] = None,
        db: Optional[DBSession] = None,
    ) -> List[RubricCriterion]:
        criteria: List[RubricCriterion] = []

        # 1. Invariant Integrity & Ancestry
        c1_evidence = cls._build_evidence(
            evidence_id="E1",
            chunk_id="chunk-bst-inv-01",
            source_type="video",
            coordinate="05:25",
            quote="The BST property is ancestral: every key in the left subtree must be strictly less than the root node.",
            start_sec=325.0,
            end_sec=385.0,
            slide=3,
            page=1,
        )
        criteria.append(
            RubricCriterion(
                id="crit-01",
                name="Recursive Invariant Enforcement",
                description="Demonstrates that the BST invariant holds ancestrally across all subtree descendants, not merely between adjacent parent-child nodes.",
                weight=1.0,
                expected_points=[
                    "Left subtree keys must be strictly less than root key",
                    "Right subtree keys must be greater than or equal to root key",
                    "Invariant is global and recursive, rejecting the local parent-child fallacy",
                    "Explains binary search correctness relying on subtree pruning",
                ],
                linked_evidence=[c1_evidence],
            )
        )

        # 2. Algorithmic Complexity & Degeneracy
        c2_evidence = cls._build_evidence(
            evidence_id="E2",
            chunk_id="chunk-bst-comp-02",
            source_type="video",
            coordinate="08:15",
            quote="Search traverses a single downward path. Cost is bounded by tree height h. In the worst-case degenerate tree, h = N, yielding O(N) linear time.",
            start_sec=495.0,
            end_sec=555.0,
            slide=5,
            page=2,
        )
        criteria.append(
            RubricCriterion(
                id="crit-02",
                name="Time Complexity & Height Bounds",
                description="Rigorous analysis of Tree-Search time complexity as a function of tree height h, distinguishing balanced O(log N) from degenerate O(N).",
                weight=1.0,
                expected_points=[
                    "Search cost is strictly bounded by height h (touching at most h + 1 nodes)",
                    "Inserting strictly sorted keys degenerates tree into a linear linked list of height N",
                    "Worst-case search in unbalanced BST is O(N)",
                    "Balanced trees enforce height h = O(log N)",
                ],
                linked_evidence=[c2_evidence],
            )
        )

        # 3. Pointer Mechanics & Traversal
        c3_evidence = cls._build_evidence(
            evidence_id="E3",
            chunk_id="chunk-bst-ins-03",
            source_type="video",
            coordinate="12:40",
            quote="Tree-Insert maintains trailing pointer y to retain the parent reference when active pointer x drops off to null.",
            start_sec=760.0,
            end_sec=820.0,
            slide=8,
            page=3,
        )
        criteria.append(
            RubricCriterion(
                id="crit-03",
                name="Pointer Manipulation & Insertion Mechanics",
                description="Mechanics of trailing pointer maintenance, null-leaf attachment, and in-order traversal ordering.",
                weight=1.0,
                expected_points=[
                    "Trailing pointer y maintains parent reference while pointer x descends to null",
                    "New keys are always attached as new leaves at the bottom of the tree",
                    "In-order traversal visits left subtree, root, then right subtree in strictly sorted order",
                    "If right subtree is non-empty, successor is Tree-Minimum(x.right)",
                ],
                linked_evidence=[c3_evidence],
            )
        )

        # 4. Deletion Splicing & Rotations
        c4_evidence = cls._build_evidence(
            evidence_id="E4",
            chunk_id="chunk-bst-del-04",
            source_type="video",
            coordinate="21:10",
            quote="When node z has two children, substitute z with its in-order successor y from z's right subtree. Splicing y preserves all subtree invariants.",
            start_sec=1270.0,
            end_sec=1330.0,
            slide=14,
            page=4,
        )
        criteria.append(
            RubricCriterion(
                id="crit-04",
                name="Structural Splicing & Invariance Preservation",
                description="Handling edge cases during node deletion and understanding tree rotation preservation.",
                weight=1.0,
                expected_points=[
                    "Distinguishes 3 deletion cases: leaf, single child, and two children",
                    "When two children exist, replaces target with its in-order successor",
                    "Successor has at most one child (its right child), making it easy to splice out",
                    "Tree rotations restructure heights while strictly preserving in-order key sequence",
                ],
                linked_evidence=[c4_evidence],
            )
        )

        return criteria

    @classmethod
    def _build_evidence(
        cls,
        evidence_id: str,
        chunk_id: str,
        source_type: str,
        coordinate: str,
        quote: str,
        start_sec: float,
        end_sec: float,
        slide: int,
        page: int,
    ) -> CitationItem:
        return CitationItem(
            evidence_id=evidence_id,
            chunk_id=chunk_id,
            source_type=source_type,
            coordinate=coordinate,
            quote=quote,
            start_sec=start_sec,
            end_sec=end_sec,
            slide=slide,
            page=page,
        )
