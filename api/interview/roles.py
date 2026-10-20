from typing import List, Dict, Any, Optional
from pydantic import BaseModel, Field


class InterviewRole(BaseModel):
    id: str
    title: str
    description: str
    difficulty: str  # "Foundational" | "Practical" | "Challenging" | "Advanced"
    target_topic: str
    focus_areas: List[str]
    sample_first_question: str


INTERVIEW_ROLES: List[InterviewRole] = [
    InterviewRole(
        id="systems_engineer",
        title="Systems Software Engineer (Low-Level BSTs & Memory)",
        description="Focuses on pointer mechanics, trailing parent pointers, and in-order successor splicing under strict memory constraints.",
        difficulty="Advanced",
        target_topic="Binary Search Trees & Structural Invariants",
        focus_areas=[
            "Trailing parent pointer linkage in Tree-Insert",
            "In-order successor pointer tracing without parent back-links",
            "Node deletion case splicing and memory safety",
        ],
        sample_first_question=(
            "Walk me through the standard Tree-Insert algorithm. Why do we maintain both an active pointer x "
            "and a trailing pointer y during the downward descent?"
        ),
    ),
    InterviewRole(
        id="algorithm_specialist",
        title="Algorithm Specialist (Balanced Trees & Order Statistics)",
        description="Focuses on invariant proofs, tree height bounding, worst-case degeneration, and rotation invariance.",
        difficulty="Challenging",
        target_topic="Balanced Trees & Algorithmic Complexity",
        focus_areas=[
            "Tree height h vs node count N complexity bounds",
            "Degenerate BST linked-list runtime O(N)",
            "Self-balancing rotations preserving in-order traversal order",
        ],
        sample_first_question=(
            "A candidate claims that searching an unbalanced binary search tree with N elements always takes O(log N) time. "
            "How would you evaluate this claim, and what structure does the tree assume in the worst case?"
        ),
    ),
    InterviewRole(
        id="backend_engineer",
        title="Backend Engineer (Database Indexing & Range Queries)",
        description="Focuses on in-order range traversals, predecessor/successor queries, and BST properties in database indexes.",
        difficulty="Practical",
        target_topic="Search Trees in Storage & Indexing",
        focus_areas=[
            "In-order traversal yielding strictly sorted key sequences",
            "Finding successors when right subtrees are empty",
            "Pruning range queries efficiently",
        ],
        sample_first_question=(
            "How does an in-order traversal of a binary search tree produce a sorted sequence, "
            "and how would you locate the successor of a node if its right child pointer is null?"
        ),
    ),
    InterviewRole(
        id="teaching_assistant",
        title="Course Teaching Assistant (Socratic Concept Verification)",
        description="Focuses on identifying student misconceptions (e.g. local parent-child fallacy) and explaining recursive ancestral invariants.",
        difficulty="Foundational",
        target_topic="Foundational Invariants & Traversal Proofs",
        focus_areas=[
            "Local parent-child fallacy vs global ancestral invariant",
            "Recursive definition of subtrees",
            "Clear Socratic pedagogical explanations",
        ],
        sample_first_question=(
            "A student tells you that a binary search tree only requires each node to be greater than its left child "
            "and less than its right child. Is this correct? Why or why not?"
        ),
    ),
]


def get_role_by_id(role_id: str) -> Optional[InterviewRole]:
    for r in INTERVIEW_ROLES:
        if r.id == role_id or r.title.lower() == role_id.lower():
            return r
    return None


def get_default_role() -> InterviewRole:
    return INTERVIEW_ROLES[0]
