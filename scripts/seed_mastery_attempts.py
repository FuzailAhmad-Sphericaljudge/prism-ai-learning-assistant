#!/usr/bin/env python3
"""
Seed realistic student practice attempts and mastery records for Alex Mercer
(Demo User: 00000000-0000-0000-0000-000000000001) in CS 201 (00000000-0000-0000-0000-000000000002).

Produces an authentic, live dashboard:
- BST Invariant: Demonstrated (1 failure, 2 consecutive passes)
- Tree Search Complexity: Demonstrated (2 passes)
- Tree Insertion: Improving (1 failure, followed by 1 pass)
- In-Order Successor: Gap Found (1 recent failure on immediate parent fallacy)
- Node Deletion & Self-Balancing Trees: Unassessed
"""

import sys
import uuid
from pathlib import Path
from datetime import datetime, timedelta, timezone

# Add repo root to path
ROOT = Path(__file__).resolve().parent.parent
sys.path.insert(0, str(ROOT))

from api.database import SessionLocal
from api.models.user import User
from api.models.course import Course
from api.models.mastery import Attempt, MasteryRecord
from api.mastery.calculator import calculate_concept_mastery, AttemptSummary
from api.practice.taxonomy import BST_CONCEPTS, get_concept_by_tag
from api.practice.revision import resolve_revision_action, MISCONCEPTION_RULES

DEMO_USER_ID = "00000000-0000-0000-0000-000000000001"
DEMO_COURSE_ID = "00000000-0000-0000-0000-000000000002"


def seed_attempts():
    db = SessionLocal()
    try:
        user = db.query(User).filter(User.id == DEMO_USER_ID).first()
        if not user:
            print(f"User {DEMO_USER_ID} not found. Ensure seed_demo has run.")
            return

        course = db.query(Course).filter(Course.id == DEMO_COURSE_ID).first()
        if not course:
            print(f"Course {DEMO_COURSE_ID} not found. Ensure seed_demo has run.")
            return

        print(f"Seeding attempts for user '{user.name}' in course '{course.title}'...")

        # Clear existing attempts and mastery records for this demo user to ensure idempotency
        db.query(Attempt).filter(
            Attempt.user_id == DEMO_USER_ID,
            Attempt.course_id == DEMO_COURSE_ID,
        ).delete()
        db.query(MasteryRecord).filter(
            MasteryRecord.user_id == DEMO_USER_ID,
            MasteryRecord.course_id == DEMO_COURSE_ID,
        ).delete()
        db.commit()

        base_time = datetime.now(timezone.utc) - timedelta(hours=3)

        # Attempt Scenarios
        scenarios = [
            # 1. BST Invariant: Initial gap, then revised and mastered
            {
                "concept": "BST Invariant",
                "question": "What is the defining condition of the Binary Search Tree invariant?",
                "type": "mcq",
                "user_answer": "B",
                "is_correct": False,
                "misconception": "Local Parent-Child Fallacy",
                "feedback": "You assumed the BST invariant only checks immediate parent and children. In truth, it is recursive and ancestral across all left and right descendants.",
                "explanation": "Every key in the left subtree must be strictly less than the root node.",
                "delta_mins": 10,
                "distractor_idx": 1,
            },
            {
                "concept": "BST Invariant",
                "question": "What is the defining condition of the Binary Search Tree invariant?",
                "type": "mcq",
                "user_answer": "A",
                "is_correct": True,
                "misconception": None,
                "feedback": "Excellent! You correctly identified that all left descendants must be strictly less than the root.",
                "explanation": "Global ancestral ordering holds for all nodes.",
                "delta_mins": 35,
                "distractor_idx": None,
            },
            {
                "concept": "BST Invariant",
                "question": "Explain why the BST invariant must hold ancestrally across all descendants.",
                "type": "short_answer",
                "user_answer": "Binary search prunes based on root comparison, so any invalid descendant would be hidden and unsearchable.",
                "is_correct": True,
                "misconception": None,
                "feedback": "Spot on! In-order traversal correctness requires complete ancestral adherence.",
                "explanation": "Verified in lecture at 05:25.",
                "delta_mins": 60,
                "distractor_idx": None,
            },
            # 2. Tree Search Complexity: Demonstrated directly
            {
                "concept": "Tree Search Complexity",
                "question": "What is the worst-case time complexity of searching for a key in an unbalanced BST?",
                "type": "mcq",
                "user_answer": "A",
                "is_correct": True,
                "misconception": None,
                "feedback": "Correct! When degenerate, the tree is a linear list with height h = N.",
                "explanation": "Search cost is strictly bounded by tree height h.",
                "delta_mins": 80,
                "distractor_idx": None,
            },
            {
                "concept": "Tree Search Complexity",
                "question": "Why does tree height h determine the runtime of Tree-Search instead of node count N?",
                "type": "short_answer",
                "user_answer": "Search follows a single downward path without backtracking, touching at most h + 1 nodes.",
                "is_correct": True,
                "misconception": None,
                "feedback": "Accurate! Each step branches left or right, never visiting siblings.",
                "explanation": "Path length is bounded by tree height.",
                "delta_mins": 95,
                "distractor_idx": None,
            },
            # 3. Tree Insertion: Improving
            {
                "concept": "Tree Insertion",
                "question": "Why does the standard Tree-Insert algorithm maintain a trailing parent pointer (usually named y)?",
                "type": "mcq",
                "user_answer": "D",
                "is_correct": False,
                "misconception": "Root Replacement Fallacy",
                "feedback": "You assumed new keys swap with the root. Tree-Insert always traverses down and attaches new keys at null leaves.",
                "explanation": "The trailing pointer retains the parent reference when the active pointer reaches null.",
                "delta_mins": 120,
                "distractor_idx": 3,
            },
            {
                "concept": "Tree Insertion",
                "question": "Why does the standard Tree-Insert algorithm maintain a trailing parent pointer (usually named y)?",
                "type": "mcq",
                "user_answer": "A",
                "is_correct": True,
                "misconception": None,
                "feedback": "Correct! y holds the parent reference where the new leaf attaches when x reaches null.",
                "explanation": "Established at 12:40 in video and slide 8.",
                "delta_mins": 140,
                "distractor_idx": None,
            },
            # 4. In-Order Successor: Gap Found
            {
                "concept": "In-Order Successor",
                "question": "How do you find the in-order successor of a node x whose right subtree is empty?",
                "type": "mcq",
                "user_answer": "B",
                "is_correct": False,
                "misconception": "Immediate Parent Fallacy",
                "feedback": "You assumed the parent is always the successor. If x is a right child, you must ascend until finding an ancestor that contains x in its left branch.",
                "explanation": "Established in Dr. Rostova's lecture at 16:55 (Slide 11).",
                "delta_mins": 160,
                "distractor_idx": 1,
            },
        ]

        # Insert attempts
        for sc in scenarios:
            created_at = base_time + timedelta(minutes=sc["delta_mins"])
            concept_tag = sc["concept"]

            # Resolve revision action
            rule = None
            if sc["distractor_idx"] and concept_tag in MISCONCEPTION_RULES:
                rule = MISCONCEPTION_RULES[concept_tag].get(sc["distractor_idx"])
            rev_action = resolve_revision_action(concept_tag, rule)

            attempt = Attempt(
                id=str(uuid.uuid4()),
                session_id=None,
                user_id=DEMO_USER_ID,
                course_id=DEMO_COURSE_ID,
                diagnostic_id=f"diag-{uuid.uuid4().hex[:6]}",
                concept_tag=concept_tag,
                question_type=sc["type"],
                question_text=sc["question"],
                user_answer=sc["user_answer"],
                is_correct=sc["is_correct"],
                misconception_tag=sc["misconception"],
                feedback=sc["feedback"],
                explanation=sc["explanation"],
                revision_action=rev_action.model_dump() if rev_action else None,
                linked_evidence=[],
                created_at=created_at,
            )
            db.add(attempt)
        db.commit()

        # Update MasteryRecord per concept
        assessed_concepts = ["BST Invariant", "Tree Search Complexity", "Tree Insertion", "In-Order Successor"]
        for c_tag in assessed_concepts:
            user_attempts = (
                db.query(Attempt)
                .filter(
                    Attempt.user_id == DEMO_USER_ID,
                    Attempt.course_id == DEMO_COURSE_ID,
                    Attempt.concept_tag == c_tag,
                )
                .order_by(Attempt.created_at.asc())
                .all()
            )

            summaries = [
                AttemptSummary(is_correct=a.is_correct, misconception_tag=a.misconception_tag)
                for a in user_attempts
            ]
            status, score, total_attempts, correct_count = calculate_concept_mastery(summaries)

            misconceptions = []
            for a in user_attempts:
                if a.misconception_tag and a.misconception_tag not in misconceptions:
                    misconceptions.append(a.misconception_tag)

            last_at = user_attempts[-1].created_at if user_attempts else None

            rec = MasteryRecord(
                id=str(uuid.uuid4()),
                user_id=DEMO_USER_ID,
                course_id=DEMO_COURSE_ID,
                concept=c_tag,
                status=status,
                mastery_score=score,
                attempts_count=total_attempts,
                correct_count=correct_count,
                misconceptions=misconceptions,
                last_assessed_at=last_at,
            )
            db.add(rec)

        db.commit()
        print(f"Successfully seeded {len(scenarios)} attempts and 4 mastery records!")
        print("Mastery Status Summary:")
        records = db.query(MasteryRecord).filter(MasteryRecord.user_id == DEMO_USER_ID).all()
        for r in records:
            print(f"  • {r.concept}: status={r.status}, score={r.mastery_score:.2f}, attempts={r.attempts_count}, correct={r.correct_count}")

    except Exception as e:
        db.rollback()
        print(f"Error seeding mastery attempts: {e}")
        raise
    finally:
        db.close()


if __name__ == "__main__":
    seed_attempts()
