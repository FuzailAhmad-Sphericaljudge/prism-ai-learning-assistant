import uuid
import pytest
from api.database import SessionLocal
from api.models.course import Course
from api.models.user import User
from api.models.session import Session, Message
from api.schemas.chat import ChatResponse, CitationItem, DiagnosticCheck
from api.tutor.persistence import persist_chat_turn
from api.firewall.types import FirewallMode


def test_persist_chat_turn_with_citations_snapshot():
    db = SessionLocal()
    try:
        # Create course and session
        course = Course(
            id=str(uuid.uuid4()),
            title="Persistence Test Course",
            code=f"TEST-{uuid.uuid4().hex[:6].upper()}",
            instructor="Prof. Test",
        )
        user = User(
            id=str(uuid.uuid4()),
            name="Persistence Learner",
            email=f"learner_{uuid.uuid4().hex[:4]}@prism.edu",
            role="student",
        )
        db.add_all([course, user])
        db.flush()

        session = Session(
            id=str(uuid.uuid4()),
            course_id=course.id,
            user_id=user.id,
            current_playback_sec=100.0,
            mode="learn_so_far",
        )
        db.add(session)
        db.commit()

        # Prepare ChatResponse with citations
        chat_resp = ChatResponse(
            answer="Binary search trees enforce hierarchical ordering [E1].",
            citations=[
                CitationItem(
                    evidence_id="E1",
                    chunk_id="chunk-pers-1",
                    source_type="video",
                    coordinate="05:00 - 06:00",
                    quote="hierarchical ordering",
                    start_sec=300.0,
                    end_sec=360.0,
                )
            ],
            check=DiagnosticCheck(
                question="What is the invariant?",
                options=["Left < Root <= Right", "Random"],
                correct_index=0,
                explanation="Left descendants are smaller.",
            ),
            is_not_covered=False,
        )

        asst_id = persist_chat_turn(
            db=db,
            session_id=session.id,
            user_query="What is the BST invariant?",
            chat_response=chat_resp,
            playback_sec=350.0,
            mode=FirewallMode.LEARN_SO_FAR,
        )

        assert asst_id is not None

        # Verify messages in database
        messages = db.query(Message).filter(Message.session_id == session.id).order_by(Message.created_at).all()
        assert len(messages) == 2
        user_m, asst_m = messages[0], messages[1]

        assert user_m.role == "user"
        assert user_m.content == "What is the BST invariant?"
        assert user_m.playback_sec == 350.0

        assert asst_m.role == "assistant"
        assert asst_m.content == chat_resp.answer
        assert len(asst_m.citations) == 1
        assert asst_m.citations[0]["evidence_id"] == "E1"
        assert asst_m.citations[0]["coordinate"] == "05:00 - 06:00"

        # Verify session updated playback
        db.refresh(session)
        assert session.current_playback_sec == 350.0

    finally:
        db.close()
