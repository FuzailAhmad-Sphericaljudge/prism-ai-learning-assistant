import uuid
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session as DBSession

from api.database import get_db
from api.models.course import Course
from api.models.user import User
from api.models.session import Session
from api.schemas.session import SessionCreate, SessionPlaybackPatch, SessionResponse

router = APIRouter(prefix="/sessions", tags=["sessions"])


@router.post("", response_model=SessionResponse, status_code=status.HTTP_201_CREATED)
def create_session(
    payload: SessionCreate,
    db: DBSession = Depends(get_db),
):
    """
    Initializes a new durable learning session for a course,
    tracking the active playback time and temporal firewall mode.
    """
    # 1. Verify course exists
    course = db.query(Course).filter(Course.id == payload.course_id).first()
    if not course:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Course with ID '{payload.course_id}' not found.",
        )

    # 2. Ensure user exists (create default demo user if needed)
    user_id = payload.user_id or "00000000-0000-0000-0000-000000000001"
    user = db.query(User).filter(User.id == user_id).first()
    if not user:
        user = User(
            id=user_id,
            name="Demo Learner",
            email="demo@prism.edu",
            role="student",
        )
        db.add(user)
        db.flush()

    # 3. Create session record
    mode_str = payload.mode.value if hasattr(payload.mode, "value") else str(payload.mode)
    session = Session(
        id=str(uuid.uuid4()),
        user_id=user.id,
        course_id=course.id,
        current_playback_sec=payload.playback_sec,
        mode=mode_str,
        title=payload.title or f"Learning Session: {course.code}",
    )

    db.add(session)
    db.commit()
    db.refresh(session)
    return session


@router.get("/{session_id}", response_model=SessionResponse)
def get_session(
    session_id: str,
    db: DBSession = Depends(get_db),
):
    """Retrieves session state, mode, and current playback position."""
    session = db.query(Session).filter(Session.id == session_id).first()
    if not session:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Session with ID '{session_id}' not found.",
        )
    return session


@router.patch("/{session_id}/playback", response_model=SessionResponse)
def update_session_playback(
    session_id: str,
    payload: SessionPlaybackPatch,
    db: DBSession = Depends(get_db),
):
    """
    Updates the active playback boundary and optionally toggles
    between learn_so_far and explore_ahead firewall modes.
    """
    session = db.query(Session).filter(Session.id == session_id).first()
    if not session:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Session with ID '{session_id}' not found.",
        )

    session.current_playback_sec = payload.playback_sec
    if payload.mode is not None:
        mode_val = payload.mode.value if hasattr(payload.mode, "value") else str(payload.mode)
        session.mode = mode_val

    db.commit()
    db.refresh(session)
    return session
