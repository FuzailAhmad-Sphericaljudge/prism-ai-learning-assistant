"""
PRISM Golden Q&A Benchmark Dataset
22 Curated Technical Questions across Lecture Timeline (00:00 - 30:00)
Validating:
- Early, mid, and late lecture concept retrieval
- Strict temporal firewall anti-leakage enforcement
- The 18:42 straddling chunk boundary prefix interpolation
- "Not covered yet" withholding behavior for future concepts
- Explore Ahead mode permitted advancement
"""

from typing import List, Optional
from pydantic import BaseModel, Field


class GoldenQuestion(BaseModel):
    id: str
    question: str
    playback_sec: float
    mode: str = "learn_so_far"  # "learn_so_far" | "explore_ahead"
    expected_status: str = "answer"  # "answer" | "withhold"
    permitted_concepts: List[str] = Field(default_factory=list)
    forbidden_future_terms: List[str] = Field(default_factory=list)
    expected_min_citations: int = 1
    target_topic: str = "BST"
    benchmark_description: str = ""


GOLDEN_QUESTIONS: List[GoldenQuestion] = [
    # -------------------------------------------------------------
    # Category 1: Early Lecture Concepts (00:00 - 08:00)
    # -------------------------------------------------------------
    GoldenQuestion(
        id="gq-01",
        question="What is the fundamental binary search tree invariant?",
        playback_sec=300.0,  # 05:00
        mode="learn_so_far",
        expected_status="answer",
        permitted_concepts=["BST Invariant"],
        forbidden_future_terms=["red-black", "avl", "rotation", "splice", "successor"],
        expected_min_citations=1,
        target_topic="BST Invariant",
        benchmark_description="Tests basic invariant definition from early lecture.",
    ),
    GoldenQuestion(
        id="gq-02",
        question="Does the BST property apply only to direct children or to the entire subtree?",
        playback_sec=360.0,  # 06:00
        mode="learn_so_far",
        expected_status="answer",
        permitted_concepts=["BST Invariant"],
        forbidden_future_terms=["red-black", "rotation", "case 3 deletion", "color flip"],
        expected_min_citations=1,
        target_topic="BST Invariant",
        benchmark_description="Validates ancestral subtree property refuting local-only fallacy.",
    ),
    GoldenQuestion(
        id="gq-03",
        question="What order of keys is produced by an in-order traversal of a BST?",
        playback_sec=500.0,  # 08:20
        mode="learn_so_far",
        expected_status="answer",
        permitted_concepts=["BST Invariant", "In-Order Traversal"],
        forbidden_future_terms=["red-black tree", "balance factor", "left-rotate"],
        expected_min_citations=1,
        target_topic="In-Order Traversal",
        benchmark_description="Verifies sorted sequence output from in-order traversal.",
    ),

    # -------------------------------------------------------------
    # Category 2: Mid-Lecture & Complexity (08:00 - 16:00)
    # -------------------------------------------------------------
    GoldenQuestion(
        id="gq-04",
        question="How does tree search navigate when the target key is less than the current node?",
        playback_sec=600.0,  # 10:00
        mode="learn_so_far",
        expected_status="answer",
        permitted_concepts=["Tree Search Complexity"],
        forbidden_future_terms=["avl rotation", "black height", "successor splicing"],
        expected_min_citations=1,
        target_topic="Tree Search Complexity",
        benchmark_description="Tests branch pruning logic during search descent.",
    ),
    GoldenQuestion(
        id="gq-05",
        question="What is the worst-case time complexity of searching an unbalanced BST, and when does it happen?",
        playback_sec=800.0,  # 13:20
        mode="learn_so_far",
        expected_status="answer",
        permitted_concepts=["Tree Search Complexity"],
        forbidden_future_terms=["red-black", "avl", "tree rotation", "case 3 deletion"],
        expected_min_citations=1,
        target_topic="Tree Search Complexity",
        benchmark_description="Verifies O(N) linear degeneration when sorted keys are inserted.",
    ),
    GoldenQuestion(
        id="gq-06",
        question="Why does tree height h govern the running time of search and insertion?",
        playback_sec=850.0,  # 14:10
        mode="learn_so_far",
        expected_status="answer",
        permitted_concepts=["Tree Search Complexity"],
        forbidden_future_terms=["rotation", "splicing", "red-black tree"],
        expected_min_citations=1,
        target_topic="Tree Search Complexity",
        benchmark_description="Tests mathematical bound of operations to height h.",
    ),

    # -------------------------------------------------------------
    # Category 3: Tree-Insert & Pointer Descent (16:00 - 18:30)
    # -------------------------------------------------------------
    GoldenQuestion(
        id="gq-07",
        question="What role does the trailing pointer y play during the Tree-Insert algorithm?",
        playback_sec=1050.0,  # 17:30
        mode="learn_so_far",
        expected_status="answer",
        permitted_concepts=["Tree Insertion"],
        forbidden_future_terms=["deletion case 3", "red-black", "avl rotation"],
        expected_min_citations=1,
        target_topic="Tree Insertion",
        benchmark_description="Tests parent pointer linkage mechanics in insert algorithm.",
    ),
    GoldenQuestion(
        id="gq-08",
        question="How do we decide whether a new node becomes the left or right child of parent y?",
        playback_sec=1100.0,  # 18:20
        mode="learn_so_far",
        expected_status="answer",
        permitted_concepts=["Tree Insertion"],
        forbidden_future_terms=["rotation", "recoloring", "successor splicing"],
        expected_min_citations=1,
        target_topic="Tree Insertion",
        benchmark_description="Checks final comparison attaching new node to parent y.",
    ),

    # -------------------------------------------------------------
    # Category 4: The 18:42 Straddling Chunk Boundary
    # -------------------------------------------------------------
    GoldenQuestion(
        id="gq-09",
        question="What condition indicates that pointer x has reached the bottom of the tree during insertion?",
        playback_sec=1122.0,  # 18:42 EXACT STRADDLE
        mode="learn_so_far",
        expected_status="answer",
        permitted_concepts=["Tree Insertion"],
        forbidden_future_terms=["successor", "deletion", "avl", "red-black"],
        expected_min_citations=1,
        target_topic="Tree Insertion",
        benchmark_description="Tests prefix interpolation at exact 18:42 straddling boundary.",
    ),
    GoldenQuestion(
        id="gq-10",
        question="Can we attach a node to pointer x when it reaches null?",
        playback_sec=1122.0,  # 18:42 EXACT STRADDLE
        mode="learn_so_far",
        expected_status="answer",
        permitted_concepts=["Tree Insertion"],
        forbidden_future_terms=["successor", "rotation", "red-black"],
        expected_min_citations=1,
        target_topic="Tree Insertion",
        benchmark_description="Validates that trailing pointer y is referenced, not null x.",
    ),

    # -------------------------------------------------------------
    # Category 5: Anti-Leakage Future Tests (Withhold at 18:42)
    # -------------------------------------------------------------
    GoldenQuestion(
        id="gq-11",
        question="How does node deletion handle a node with two children?",
        playback_sec=1122.0,  # 18:42 (Taught at 22:00+)
        mode="learn_so_far",
        expected_status="withhold",
        permitted_concepts=[],
        forbidden_future_terms=["successor", "splice", "two children", "minimum right subtree"],
        expected_min_citations=0,
        target_topic="Node Deletion",
        benchmark_description="CRITICAL FIREWALL TEST: Must withhold Case 3 deletion at 18:42.",
    ),
    GoldenQuestion(
        id="gq-12",
        question="What is an in-order successor and how do we find it?",
        playback_sec=1122.0,  # 18:42 (Taught at 19:30+)
        mode="learn_so_far",
        expected_status="withhold",
        permitted_concepts=[],
        forbidden_future_terms=["right subtree minimum", "lowest common ancestor", "successor"],
        expected_min_citations=0,
        target_topic="In-Order Successor",
        benchmark_description="CRITICAL FIREWALL TEST: Must withhold successor definition at 18:42.",
    ),
    GoldenQuestion(
        id="gq-13",
        question="How do AVL and Red-Black tree rotations restore logarithmic height balance?",
        playback_sec=1122.0,  # 18:42 (Taught at 26:00+)
        mode="learn_so_far",
        expected_status="withhold",
        permitted_concepts=[],
        forbidden_future_terms=["avl", "red-black", "rotation", "pivot", "rebalance"],
        expected_min_citations=0,
        target_topic="Self-Balancing Trees",
        benchmark_description="CRITICAL FIREWALL TEST: Must withhold self-balancing rotations at 18:42.",
    ),
    GoldenQuestion(
        id="gq-14",
        question="What is the difference between Case 1 and Case 2 of BST node deletion?",
        playback_sec=1122.0,  # 18:42 (Taught at 22:15+)
        mode="learn_so_far",
        expected_status="withhold",
        permitted_concepts=[],
        forbidden_future_terms=["leaf", "single child", "bypass", "splice"],
        expected_min_citations=0,
        target_topic="Node Deletion",
        benchmark_description="CRITICAL FIREWALL TEST: Must withhold deletion cases at 18:42.",
    ),

    # -------------------------------------------------------------
    # Category 6: Explore Ahead Unlocked (Future Questions Allowed)
    # -------------------------------------------------------------
    GoldenQuestion(
        id="gq-15",
        question="How does node deletion handle a node with two children?",
        playback_sec=1122.0,  # 18:42 with EXPLORE AHEAD ACTIVE
        mode="explore_ahead",
        expected_status="answer",
        permitted_concepts=["Node Deletion", "In-Order Successor"],
        forbidden_future_terms=[],
        expected_min_citations=1,
        target_topic="Node Deletion",
        benchmark_description="Verifies explore_ahead allows future Case 3 deletion material.",
    ),
    GoldenQuestion(
        id="gq-16",
        question="What is an in-order successor and where is it located if the right subtree is non-empty?",
        playback_sec=1122.0,  # 18:42 with EXPLORE AHEAD ACTIVE
        mode="explore_ahead",
        expected_status="answer",
        permitted_concepts=["In-Order Successor"],
        forbidden_future_terms=[],
        expected_min_citations=1,
        target_topic="In-Order Successor",
        benchmark_description="Verifies explore_ahead permits in-order successor explanation.",
    ),
    GoldenQuestion(
        id="gq-17",
        question="How do tree rotations preserve the binary search tree invariant?",
        playback_sec=1122.0,  # 18:42 with EXPLORE AHEAD ACTIVE
        mode="explore_ahead",
        expected_status="answer",
        permitted_concepts=["Self-Balancing Trees"],
        forbidden_future_terms=[],
        expected_min_citations=1,
        target_topic="Self-Balancing Trees",
        benchmark_description="Verifies explore_ahead explains rotation order-preservation.",
    ),

    # -------------------------------------------------------------
    # Category 7: Late Lecture Permitted Material (20:00 - 30:00)
    # -------------------------------------------------------------
    GoldenQuestion(
        id="gq-18",
        question="Where do we look for the in-order successor if a node has a non-empty right subtree?",
        playback_sec=1260.0,  # 21:00 (Successor already covered)
        mode="learn_so_far",
        expected_status="answer",
        permitted_concepts=["In-Order Successor"],
        forbidden_future_terms=["red-black", "avl rotation"],
        expected_min_citations=1,
        target_topic="In-Order Successor",
        benchmark_description="Verifies successor is admitted once playback passes 20:00.",
    ),
    GoldenQuestion(
        id="gq-19",
        question="In BST node deletion, why do we splice the successor rather than the node itself when it has two children?",
        playback_sec=1500.0,  # 25:00 (Deletion already covered)
        mode="learn_so_far",
        expected_status="answer",
        permitted_concepts=["Node Deletion"],
        forbidden_future_terms=["red-black color flip"],
        expected_min_citations=1,
        target_topic="Node Deletion",
        benchmark_description="Tests deletion splicing understanding at 25:00 playback boundary.",
    ),
    GoldenQuestion(
        id="gq-20",
        question="How does tree rotation maintain the binary search tree ordering property while altering height?",
        playback_sec=1740.0,  # 29:00 (Late lecture - Rotations covered)
        mode="learn_so_far",
        expected_status="answer",
        permitted_concepts=["Self-Balancing Trees"],
        forbidden_future_terms=[],
        expected_min_citations=1,
        target_topic="Self-Balancing Trees",
        benchmark_description="Verifies rotation invariant is admitted at 29:00 in learn_so_far.",
    ),
    GoldenQuestion(
        id="gq-21",
        question="What is the advantage of self-balancing binary search trees over basic BSTs?",
        playback_sec=1740.0,  # 29:00 (End of lecture)
        mode="learn_so_far",
        expected_status="answer",
        permitted_concepts=["Self-Balancing Trees", "Tree Search Complexity"],
        forbidden_future_terms=[],
        expected_min_citations=1,
        target_topic="Self-Balancing Trees",
        benchmark_description="Tests high-level synthesis of balanced height guarantees vs O(N) degeneration.",
    ),
    GoldenQuestion(
        id="gq-22",
        question="Can an in-order successor ever have a left child?",
        playback_sec=1320.0,  # 22:00
        mode="learn_so_far",
        expected_status="answer",
        permitted_concepts=["In-Order Successor"],
        forbidden_future_terms=["red-black", "avl rotation"],
        expected_min_citations=1,
        target_topic="In-Order Successor",
        benchmark_description="Tests structural proof that minimum of right subtree has no left child.",
    ),
]
