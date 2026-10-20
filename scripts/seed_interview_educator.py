#!/usr/bin/env python3
"""
Seed realistic technical interview defense sessions and educator cohort telemetry
for Demo User Alex Mercer (00000000-0000-0000-0000-000000000001) in CS-201 (00000000-0000-0000-0000-000000000002).

Populates:
1. Two completed/in-progress Oral Defense Interview sessions with full multi-round
   transcripts, rubric scoring checkpoints, examiner justifications, and revision links.
2. Cohort lecture queries distributed across the 30-minute lecture video timeline
   to light up the Educator Confusion Heatmap.
3. Common recurring student misconceptions and playback questions.
"""

import sys
import uuid
from pathlib import Path
from datetime import datetime, timedelta, timezone

ROOT = Path(__file__).resolve().parent.parent
sys.path.insert(0, str(ROOT))

from api.database import SessionLocal
from api.models.user import User
from api.models.course import Course
from api.models.session import Session, Message
from api.models.interview import InterviewSession, InterviewExchange
from api.models.mastery import Attempt

DEMO_USER_ID = "00000000-0000-0000-0000-000000000001"
DEMO_COURSE_ID = "00000000-0000-0000-0000-000000000002"


def seed_interview_and_educator():
    db = SessionLocal()
    try:
        user = db.query(User).filter(User.id == DEMO_USER_ID).first()
        if not user:
            print(f"[ERROR] User {DEMO_USER_ID} not found. Please run seed_demo.py first.")
            return

        course = db.query(Course).filter(Course.id == DEMO_COURSE_ID).first()
        if not course:
            print(f"[ERROR] Course {DEMO_COURSE_ID} not found. Please run seed_demo.py first.")
            return

        print(f"[PRISM] Seeding oral defense & educator telemetry for {course.title} ({course.code})...")

        now = datetime.now(timezone.utc)

        # -------------------------------------------------------------
        # 1. Clean existing demo interview sessions for idempotency
        # -------------------------------------------------------------
        existing_interviews = db.query(InterviewSession).filter(
            InterviewSession.course_id == DEMO_COURSE_ID,
            InterviewSession.user_id == DEMO_USER_ID,
        ).all()
        for session in existing_interviews:
            db.query(InterviewExchange).filter(InterviewExchange.interview_session_id == session.id).delete()
            db.delete(session)
        db.commit()

        # -------------------------------------------------------------
        # 2. Create Completed Oral Defense Session: Systems Software Engineer
        # -------------------------------------------------------------
        session_id_1 = "00000000-0000-0000-0000-000000000071"
        report_1 = {
            "session_id": session_id_1,
            "course_id": DEMO_COURSE_ID,
            "user_id": DEMO_USER_ID,
            "role": "Systems Software Engineer",
            "topic": "Binary Search Trees & Structural Invariants",
            "status": "completed",
            "overall_score": 86.7,
            "criteria_scores": [
                {
                    "criterion_id": "crit-01",
                    "name": "BST Invariant & Ancestral Property",
                    "score": 90.0,
                    "weight": 1.0,
                    "justification": "Candidate accurately articulated the recursive ancestral invariant holding across all descendants in subtrees.",
                    "linked_evidence": [
                        {
                            "evidence_id": "E1",
                            "chunk_id": "chunk-01",
                            "source_type": "video",
                            "coordinate": "04:15 - 05:30",
                            "quote": "The binary search tree property must hold ancestrally across all left and right descendants.",
                            "start_sec": 255.0,
                            "end_sec": 330.0,
                        }
                    ],
                },
                {
                    "criterion_id": "crit-02",
                    "name": "Algorithmic Complexity & Height Degeneracy",
                    "score": 85.0,
                    "weight": 1.0,
                    "justification": "Good explanation of worst-case degeneration to linked lists with O(N) runtime when inserting sorted keys.",
                    "linked_evidence": [
                        {
                            "evidence_id": "E2",
                            "chunk_id": "chunk-02",
                            "source_type": "video",
                            "coordinate": "12:10 - 13:45",
                            "quote": "In the worst case where keys arrive in strictly sorted order, the tree degenerates into a linear chain of height N.",
                            "start_sec": 730.0,
                            "end_sec": 825.0,
                        }
                    ],
                },
                {
                    "criterion_id": "crit-03",
                    "name": "Pointer Mechanics & Trailing Updates",
                    "score": 85.0,
                    "weight": 1.0,
                    "justification": "Correctly identified the role of trailing pointer y in Tree-Insert for attaching the new node once pointer x falls off to null.",
                    "linked_evidence": [
                        {
                            "evidence_id": "E3",
                            "chunk_id": "chunk-03",
                            "source_type": "video",
                            "coordinate": "15:30 - 17:15",
                            "quote": "Pointer x searches down until null, while trailing parent pointer y maintains the parent reference.",
                            "start_sec": 930.0,
                            "end_sec": 1035.0,
                        }
                    ],
                },
            ],
            "strengths": [
                "Sound grasp of recursive subtree invariants distinguishing BSTs from heaps",
                "Precise algorithmic complexity analysis across balanced O(log N) and degenerate O(N) cases",
                "Clear explanation of parent pointer linkage during downward tree traversal",
            ],
            "gaps": [
                "Could elaborate more on three-case node deletion splicing mechanics",
            ],
            "revision_links": [
                {
                    "type": "video",
                    "coordinate": "24:30",
                    "timestamp_sec": 1470.0,
                    "label": "Revise Case 3 Node Deletion with Successor Splicing",
                }
            ],
            "transcript": [
                {
                    "round": 1,
                    "question": "Walk me through the standard Tree-Insert algorithm. Why do we maintain both an active pointer x and a trailing pointer y during downward descent?",
                    "answer": "We maintain pointer x to navigate down the tree by comparing keys. When x reaches null, pointer y remains at the parent node, allowing us to attach the new node as either the left or right child.",
                    "justification": None,
                    "evaluation": {
                        "criterion_id": "crit-03",
                        "criterion_name": "Pointer Mechanics & Trailing Updates",
                        "score": 85.0,
                        "justification": "Accurately explained the parent linkage role of trailing pointer y.",
                        "missed_points": [],
                        "demonstrated_points": ["Maintains parent reference", "Downward comparison"],
                    },
                },
                {
                    "round": 2,
                    "question": "A junior engineer argues that checking only the immediate children of each node is sufficient to verify the BST property. How would you refute or clarify this?",
                    "answer": "Checking immediate children is insufficient. A node in a right subtree could have a left child smaller than the ancestor root, violating the global invariant. The property must hold ancestrally across all descendants.",
                    "justification": "Probing ancestral subtree invariant depth after solid pointer basics.",
                    "evaluation": {
                        "criterion_id": "crit-01",
                        "criterion_name": "BST Invariant & Ancestral Property",
                        "score": 90.0,
                        "justification": "Strong refutation of the immediate children fallacy with ancestral reasoning.",
                        "missed_points": [],
                        "demonstrated_points": ["Ancestral property", "Descendant subtree bounds"],
                    },
                },
                {
                    "round": 3,
                    "question": "What happens to search and insertion performance if keys are inserted in sorted order, and how is this bounded mathematically?",
                    "answer": "When inserted in sorted order, every new node becomes the right child, causing the tree to degenerate into a linked list. The height becomes N, degenerating search and insertion from O(log N) to O(N).",
                    "justification": "Final round testing algorithmic complexity and worst-case degeneration.",
                    "evaluation": {
                        "criterion_id": "crit-02",
                        "criterion_name": "Algorithmic Complexity & Height Degeneracy",
                        "score": 85.0,
                        "justification": "Sound complexity proof and identification of linked-list degeneration.",
                        "missed_points": [],
                        "demonstrated_points": ["Degenerates to linked list", "O(N) worst-case bound"],
                    },
                },
            ],
            "created_at": (now - timedelta(hours=3)).isoformat(),
            "completed_at": (now - timedelta(hours=2, minutes=45)).isoformat(),
        }

        interview_1 = InterviewSession(
            id=session_id_1,
            course_id=DEMO_COURSE_ID,
            user_id=DEMO_USER_ID,
            target_concept="Binary Search Trees & Structural Invariants",
            role="Systems Software Engineer",
            topic="Binary Search Trees & Structural Invariants",
            current_round=3,
            max_rounds=3,
            status="completed",
            report_json=report_1,
            created_at=now - timedelta(hours=3),
            updated_at=now - timedelta(hours=2, minutes=45),
        )
        db.add(interview_1)
        db.flush()

        # Add exchange records for Interview 1
        for ex in report_1["transcript"]:
            db.add(
                InterviewExchange(
                    id=str(uuid.uuid4()),
                    interview_session_id=session_id_1,
                    round_number=ex["round"],
                    question_text=ex["question"],
                    learner_response=ex["answer"],
                    justification=ex["justification"],
                    evaluation=ex["evaluation"],
                    created_at=now - timedelta(hours=3, minutes=-(ex["round"] * 5)),
                )
            )

        # -------------------------------------------------------------
        # 3. Create In-Progress / Second Defense Session: Algorithm Specialist
        # -------------------------------------------------------------
        session_id_2 = "00000000-0000-0000-0000-000000000072"
        report_2 = {
            "session_id": session_id_2,
            "course_id": DEMO_COURSE_ID,
            "user_id": DEMO_USER_ID,
            "role": "Algorithm Specialist",
            "topic": "Balanced Trees & Algorithmic Complexity",
            "status": "completed",
            "overall_score": 67.5,
            "criteria_scores": [
                {
                    "criterion_id": "crit-01",
                    "name": "BST Invariant & Ancestral Property",
                    "score": 65.0,
                    "weight": 1.0,
                    "justification": "Candidate focused on local child comparisons without emphasizing recursive ancestral validation.",
                    "linked_evidence": [],
                },
                {
                    "criterion_id": "crit-02",
                    "name": "Tree Height Bounds & Worst-Case Degeneracy",
                    "score": 70.0,
                    "weight": 1.0,
                    "justification": "Demonstrated understanding of O(log N) height on balanced trees.",
                    "linked_evidence": [],
                },
            ],
            "strengths": ["Clear explanation of logarithmic height on balanced binary trees."],
            "gaps": ["Missed recursive ancestral subtree validation requirements."],
            "revision_links": [
                {
                    "type": "video",
                    "coordinate": "04:15",
                    "timestamp_sec": 255.0,
                    "label": "Revise BST Recursive Subtree Invariant",
                }
            ],
            "transcript": [
                {
                    "round": 1,
                    "question": "A candidate claims that searching an unbalanced binary search tree with N elements always takes O(log N) time. How would you evaluate this claim?",
                    "answer": "The claim is false because worst-case trees degenerate to O(N) when sorted keys are inserted.",
                    "justification": None,
                    "evaluation": {
                        "criterion_id": "crit-02",
                        "criterion_name": "Tree Height Bounds & Worst-Case Degeneracy",
                        "score": 70.0,
                        "justification": "Correctly identified false claim and O(N) worst case.",
                        "missed_points": [],
                        "demonstrated_points": ["O(N) worst case"],
                    },
                }
            ],
            "created_at": (now - timedelta(days=1)).isoformat(),
            "completed_at": (now - timedelta(days=1, hours=-1)).isoformat(),
        }

        interview_2 = InterviewSession(
            id=session_id_2,
            course_id=DEMO_COURSE_ID,
            user_id=DEMO_USER_ID,
            target_concept="Balanced Trees & Algorithmic Complexity",
            role="Algorithm Specialist",
            topic="Balanced Trees & Algorithmic Complexity",
            current_round=2,
            max_rounds=3,
            status="completed",
            report_json=report_2,
            created_at=now - timedelta(days=1),
            updated_at=now - timedelta(days=1, hours=-1),
        )
        db.add(interview_2)
        db.flush()

        for ex in report_2["transcript"]:
            db.add(
                InterviewExchange(
                    id=str(uuid.uuid4()),
                    interview_session_id=session_id_2,
                    round_number=ex["round"],
                    question_text=ex["question"],
                    learner_response=ex["answer"],
                    justification=ex["justification"],
                    evaluation=ex["evaluation"],
                    created_at=now - timedelta(days=1),
                )
            )

        # -------------------------------------------------------------
        # 4. Seed Course Chat Session Messages for Confusion Heatmap Telemetry
        # -------------------------------------------------------------
        # We distribute questions along the 30-minute lecture:
        # Hot-spots at 04:00-06:00 (Invariant), 12:00-14:00 (Degenerate cases), 18:00-20:00 (Successors)
        chat_session = db.query(Session).filter(
            Session.course_id == DEMO_COURSE_ID,
            Session.user_id == DEMO_USER_ID,
        ).first()

        if not chat_session:
            chat_session = Session(
                id="00000000-0000-0000-0000-000000000099",
                course_id=DEMO_COURSE_ID,
                user_id=DEMO_USER_ID,
                current_playback_sec=1200.0,
                mode="learn_so_far",
                created_at=now - timedelta(days=2),
                updated_at=now,
            )
            db.add(chat_session)
            db.flush()

        # Seed lecture queries if fewer than 15 exist
        existing_msg_count = db.query(Message).filter(Message.session_id == chat_session.id).count()
        if existing_msg_count < 10:
            sample_queries = [
                ("Why must BST invariant hold across the entire subtree and not just children?", 265.0),
                ("How does the BST invariant ensure order when searching?", 280.0),
                ("Can a left child of a right child be smaller than root?", 315.0),
                ("What causes a BST to degenerate into a linked list?", 740.0),
                ("Is search complexity in BST guaranteed to be O(log N)?", 760.0),
                ("Why is tree height bounding so critical for performance?", 805.0),
                ("How does Tree-Insert maintain pointer references?", 950.0),
                ("What does pointer y do when x becomes null?", 990.0),
                ("How do we locate the in-order successor without parent pointers?", 1100.0),
                ("Where is the minimum key located in the right subtree?", 1140.0),
                ("What happens during node deletion when a node has two children?", 1450.0),
                ("Why do we splice the successor out instead of the deleted node?", 1490.0),
            ]

            for q_text, t_sec in sample_queries:
                db.add(
                    Message(
                        id=str(uuid.uuid4()),
                        session_id=chat_session.id,
                        role="user",
                        content=q_text,
                        playback_sec=t_sec,
                        created_at=now - timedelta(hours=4),
                    )
                )

        db.commit()
        print(f"[SUCCESS] Seeded 2 Oral Defense sessions and 12 lecture timeline queries.")
        print(f"  • Session 1: {session_id_1} (Systems Software Engineer - 86.7%)")
        print(f"  • Session 2: {session_id_2} (Algorithm Specialist - 67.5%)")
        print(f"  • Timeline Heatmap Queries: 12 distributed telemetry points")

    except Exception as e:
        db.rollback()
        print(f"[ERROR] Failed to seed interview & educator data: {e}")
        raise
    finally:
        db.close()


if __name__ == "__main__":
    seed_interview_and_educator()
