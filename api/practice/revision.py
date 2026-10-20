from typing import Optional, Dict
from api.schemas.practice import RevisionAction
from api.practice.types import MisconceptionRule
from api.practice.taxonomy import get_concept_by_tag


MISCONCEPTION_RULES: Dict[str, Dict[int, MisconceptionRule]] = {
    "BST Invariant": {
        1: MisconceptionRule(
            concept_tag="BST Invariant",
            distractor_index=1,
            misconception_tag="Local Parent-Child Fallacy",
            diagnosis="You assumed the BST invariant only applies locally between an immediate parent and its children. The invariant is recursive and ancestral across all left and right descendants.",
            remedial_timestamp_sec=325.0,  # 05:25
            remedial_slide=3,
            remedial_page=1,
            remedial_label="Revise Dr. Rostova's explanation of Global Invariants at 05:25",
        ),
        2: MisconceptionRule(
            concept_tag="BST Invariant",
            distractor_index=2,
            misconception_tag="Balance vs Ordering Invariant Confusion",
            diagnosis="You conflated the structural key ordering invariant with height balancing. Standard BSTs impose zero height balance restrictions at insertion.",
            remedial_timestamp_sec=325.0,
            remedial_slide=3,
            remedial_page=1,
            remedial_label="Review Subtree Ordering Invariant on Slide 3",
        ),
        3: MisconceptionRule(
            concept_tag="BST Invariant",
            distractor_index=3,
            misconception_tag="Binary Heap Array Confusion",
            diagnosis="You confused pointer-based binary search trees with array-backed binary heaps. BSTs do not enforce array-index relationships.",
            remedial_timestamp_sec=325.0,
            remedial_slide=3,
            remedial_page=1,
            remedial_label="Review Lecture Notes on BST Structure at 05:25",
        ),
    },
    "Tree Search Complexity": {
        1: MisconceptionRule(
            concept_tag="Tree Search Complexity",
            distractor_index=1,
            misconception_tag="Constant Height Assumption",
            diagnosis="You assumed binary search trees are unconditionally balanced. In an unbalanced BST, inserting sorted keys degenerates the tree into an O(N) linear linked list.",
            remedial_timestamp_sec=625.0,  # 10:25
            remedial_slide=5,
            remedial_page=2,
            remedial_label="Revise Tree Degeneration & Height at 10:25 in Video",
        ),
        2: MisconceptionRule(
            concept_tag="Tree Search Complexity",
            distractor_index=2,
            misconception_tag="Constant Time Direct Indexing Fallacy",
            diagnosis="Binary search trees require branching pointer dereferences along a path; they do not provide O(1) hash array lookups.",
            remedial_timestamp_sec=625.0,
            remedial_slide=5,
            remedial_page=2,
            remedial_label="Review Tree Search Algorithm on Slide 5",
        ),
        3: MisconceptionRule(
            concept_tag="Tree Search Complexity",
            distractor_index=3,
            misconception_tag="Exhaustive Multi-Path Traversal Error",
            diagnosis="Tree-Search branches in exactly one direction at each node, bounding work to height h without backtracking.",
            remedial_timestamp_sec=625.0,
            remedial_slide=5,
            remedial_page=2,
            remedial_label="Review Search Path Tracing at 10:25",
        ),
    },
    "Tree Insertion": {
        1: MisconceptionRule(
            concept_tag="Tree Insertion",
            distractor_index=1,
            misconception_tag="Trailing Pointer Misunderstanding",
            diagnosis="The trailing parent pointer y does not count nodes; it preserves the parent reference so the new node can be linked when x becomes null.",
            remedial_timestamp_sec=855.0,  # 14:15
            remedial_slide=6,
            remedial_page=2,
            remedial_label="Revise Trailing Parent Pointers at 14:15 in Video",
        ),
        2: MisconceptionRule(
            concept_tag="Tree Insertion",
            distractor_index=2,
            misconception_tag="Automatic Balance Rotation Fallacy",
            diagnosis="Standard Tree-Insert does not re-balance or rotate; it merely attaches a leaf at the located null boundary.",
            remedial_timestamp_sec=855.0,
            remedial_slide=6,
            remedial_page=2,
            remedial_label="Review Tree-Insert Algorithm on Slide 6",
        ),
    },
    "In-Order Successor": {
        1: MisconceptionRule(
            concept_tag="In-Order Successor",
            distractor_index=1,
            misconception_tag="Immediate Parent Fallacy",
            diagnosis="When right(x) is empty, x's parent is only the successor if x was a left child. If x was a right child, you must ascend until reaching an ancestor whose left child contains x.",
            remedial_timestamp_sec=1015.0,  # 16:55
            remedial_slide=7,
            remedial_page=2,
            remedial_label="Revise Successor Ancestor Traversal at 16:55 in Video",
        ),
        2: MisconceptionRule(
            concept_tag="In-Order Successor",
            distractor_index=2,
            misconception_tag="Direct Sibling Link Error",
            diagnosis="Binary search trees do not maintain horizontal sibling pointers. Successor lookup requires ancestor pointer navigation.",
            remedial_timestamp_sec=1015.0,
            remedial_slide=7,
            remedial_page=2,
            remedial_label="Review Successor Case 2 on Slide 7",
        ),
    },
    "Node Deletion": {
        1: MisconceptionRule(
            concept_tag="Node Deletion",
            distractor_index=1,
            misconception_tag="Subtree Decapitation Fallacy",
            diagnosis="You cannot delete children or elevate both subtrees simultaneously. When deleting a 2-child node, it must be replaced with its in-order successor.",
            remedial_timestamp_sec=1155.0,  # 19:15
            remedial_slide=8,
            remedial_page=3,
            remedial_label="Revise Deletion Case 3 (Two Children) at 19:15 in Video",
        ),
        2: MisconceptionRule(
            concept_tag="Node Deletion",
            distractor_index=2,
            misconception_tag="Arbitrary Leaf Replacement Error",
            diagnosis="Replacing a 2-child node with an arbitrary leaf violates the BST ordering invariant. Only the in-order successor or predecessor preserves sorting.",
            remedial_timestamp_sec=1155.0,
            remedial_slide=8,
            remedial_page=3,
            remedial_label="Review 3-Case Deletion Strategy on Slide 8",
        ),
    },
    "Self-Balancing Trees": {
        1: MisconceptionRule(
            concept_tag="Self-Balancing Trees",
            distractor_index=1,
            misconception_tag="In-Order Traversal Invariance Violation",
            diagnosis="Tree rotations alter subtree heights but strictly preserve the in-order key sequence.",
            remedial_timestamp_sec=1570.0,  # 26:10
            remedial_slide=10,
            remedial_page=4,
            remedial_label="Revise Rotations Invariant on Slide 10",
        ),
    },
}


def resolve_revision_action(
    concept_tag: str,
    misconception_rule: Optional[MisconceptionRule] = None,
) -> RevisionAction:
    """
    Constructs an actionable deep-link to the exact video timestamp, slide,
    or PDF page where the student can master the misunderstood concept.
    """
    if misconception_rule:
        mins = int(misconception_rule.remedial_timestamp_sec // 60)
        secs = int(misconception_rule.remedial_timestamp_sec % 60)
        coord = f"{mins:02d}:{secs:02d}"

        return RevisionAction(
            type="video",
            coordinate=coord,
            timestamp_sec=misconception_rule.remedial_timestamp_sec,
            slide=misconception_rule.remedial_slide,
            page=misconception_rule.remedial_page,
            label=misconception_rule.remedial_label,
        )

    # Fallback to concept landmark
    concept = get_concept_by_tag(concept_tag)
    if concept:
        mins = int(concept.video_landmark_sec // 60)
        secs = int(concept.video_landmark_sec % 60)
        return RevisionAction(
            type="video",
            coordinate=f"{mins:02d}:{secs:02d}",
            timestamp_sec=concept.video_landmark_sec,
            slide=concept.slide_number,
            page=concept.pdf_page,
            label=f"Revise {concept.tag} at {mins:02d}:{secs:02d} in Video (Slide {concept.slide_number})",
        )

    return RevisionAction(
        type="video",
        coordinate="00:00",
        timestamp_sec=0.0,
        slide=1,
        page=1,
        label="Review foundational lecture video",
    )
