from typing import List, Dict, Any, Optional
from dataclasses import dataclass


@dataclass
class ConceptDefinition:
    tag: str
    display_name: str
    description: str
    start_sec: float
    end_sec: float
    video_landmark_sec: float
    slide_number: int
    pdf_page: int
    prerequisites: List[str]
    common_misconceptions: List[str]


BST_CONCEPTS: List[ConceptDefinition] = [
    ConceptDefinition(
        tag="BST Invariant",
        display_name="Binary Search Tree Property & Invariant",
        description="Global recursive ordering: all keys in left subtree < x.key <= all keys in right subtree.",
        start_sec=0.0,
        end_sec=390.0,
        video_landmark_sec=325.0,  # 05:25
        slide_number=3,
        pdf_page=1,
        prerequisites=[],
        common_misconceptions=[
            "Local Parent-Child Fallacy (assuming invariant only applies to immediate children)",
            "Duplicate Placement Confusion (inserting equal keys in left subtree)",
            "Array Index Equivalence (confusing BST pointer structure with binary heap arrays)",
        ],
    ),
    ConceptDefinition(
        tag="Tree Search Complexity",
        display_name="Search Algorithm & Height Dependency",
        description="Path traversal bounded by height h: O(h) runtime, O(log N) best/average, O(N) worst-case.",
        start_sec=390.0,
        end_sec=765.0,
        video_landmark_sec=625.0,  # 10:25
        slide_number=5,
        pdf_page=2,
        prerequisites=["BST Invariant"],
        common_misconceptions=[
            "Constant Height Assumption (believing search is unconditionally O(log N) in unbalanced trees)",
            "Linear Scan Confusion (assuming search touches every node)",
            "Breadth vs Depth Traversal (confusing search with level-order traversal)",
        ],
    ),
    ConceptDefinition(
        tag="Tree Insertion",
        display_name="Node Insertion & Trailing Pointers",
        description="Maintains trailing parent pointer to attach new node as leaf in O(h) time.",
        start_sec=765.0,
        end_sec=990.0,
        video_landmark_sec=855.0,  # 14:15
        slide_number=6,
        pdf_page=2,
        prerequisites=["BST Invariant", "Tree Search Complexity"],
        common_misconceptions=[
            "Root Replacement Fallacy (re-rooting the tree on every insertion)",
            "Parent Pointer Loss (failing to track the trailing pointer before null reference)",
            "Internal Splice Assumption (trying to insert new nodes internally instead of leaves)",
        ],
    ),
    ConceptDefinition(
        tag="In-Order Successor",
        display_name="Successor & Predecessor Navigation",
        description="Finds next key in sorted order: min(x.right) or lowest ancestor with left-child relationship.",
        start_sec=990.0,
        end_sec=1122.0,
        video_landmark_sec=1015.0,  # 16:55
        slide_number=7,
        pdf_page=2,
        prerequisites=["BST Invariant", "Tree Search Complexity"],
        common_misconceptions=[
            "Immediate Parent Assumption (assuming parent is always the successor when right child is empty)",
            "Subtree Min vs Max Confusion (looking for maximum in right subtree instead of minimum)",
            "Traversal Order Reversal (confusing pre-order with in-order traversal)",
        ],
    ),
    ConceptDefinition(
        tag="Node Deletion",
        display_name="Three-Case Deletion & Splicing",
        description="Prune leaf, elevate single child, or replace 2-child node with in-order successor y and splice y.",
        start_sec=1122.0,
        end_sec=1530.0,
        video_landmark_sec=1155.0,  # 19:15
        slide_number=8,
        pdf_page=3,
        prerequisites=["BST Invariant", "In-Order Successor"],
        common_misconceptions=[
            "Child Abandonment (deleting a parent without reparenting its single child)",
            "Arbitrary Replacement (replacing a 2-child node with an arbitrary leaf instead of successor)",
            "Double Splicing Error (splicing successor before copying its key into original node)",
        ],
    ),
    ConceptDefinition(
        tag="Self-Balancing Trees",
        display_name="Tree Degeneration & Rotations Preview",
        description="Left/right tree rotations maintain logarithmic height in AVL & Red-Black trees.",
        start_sec=1530.0,
        end_sec=1680.0,
        video_landmark_sec=1570.0,  # 26:10
        slide_number=10,
        pdf_page=4,
        prerequisites=["Tree Search Complexity", "Node Deletion"],
        common_misconceptions=[
            "Rotational Order Violation (believing rotations change the in-order traversal sequence)",
            "Static Balance Assumption (believing standard BSTs balance automatically)",
        ],
    ),
]


def get_concepts_for_playback(playback_sec: Optional[float], is_explore_ahead: bool = False) -> List[ConceptDefinition]:
    """
    Returns only concepts that have been introduced in the lecture up to playback_sec,
    unless explore_ahead is True.
    """
    if is_explore_ahead or playback_sec is None:
        return BST_CONCEPTS

    return [c for c in BST_CONCEPTS if c.start_sec <= playback_sec]


def get_concept_by_tag(tag: str) -> Optional[ConceptDefinition]:
    for c in BST_CONCEPTS:
        if c.tag.lower() == tag.lower():
            return c
    return None
