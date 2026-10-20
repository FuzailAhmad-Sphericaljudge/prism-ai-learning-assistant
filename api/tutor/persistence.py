import uuid
import logging
from typing import Optional
from sqlalchemy.orm import Session as DBSession

from api.models.session import Message, Session
from api.schemas.chat import ChatResponse
from api.firewall.types import FirewallMode

logger = logging.getLogger("prism.tutor.persistence")


def persist_chat_turn(
    db: DBSession,
    session_id: Optional[str],
    user_query: str,
    chat_response: ChatResponse,
    playback_sec: float,
    mode: FirewallMode,
) -> Optional[str]:
    """
    Persists both the user query and assistant response with an exact
    citation snapshot to the PostgreSQL messages table.
    """
    if not session_id:
        return None

    session = db.query(Session).filter(Session.id == session_id).first()
    if not session:
        logger.warning(f"Session '{session_id}' not found; skipping persistence.")
        return None

    is_explored_ahead = (mode == FirewallMode.EXPLORE_AHEAD)

    # 1. User Message
    user_msg = Message(
        id=str(uuid.uuid4()),
        session_id=session_id,
        role="user",
        content=user_query,
        playback_sec=playback_sec,
        citations=[],
        explored_ahead=is_explored_ahead,
        is_firewalled=(mode == FirewallMode.LEARN_SO_FAR),
    )
    db.add(user_msg)

    # 2. Assistant Message with Full Evidence Citations Snapshot
    citation_snapshot = [c.model_dump() for c in chat_response.citations]
    asst_id = str(uuid.uuid4())
    asst_msg = Message(
        id=asst_id,
        session_id=session_id,
        role="assistant",
        content=chat_response.answer,
        playback_sec=playback_sec,
        citations=citation_snapshot,
        explored_ahead=is_explored_ahead,
        is_firewalled=(mode == FirewallMode.LEARN_SO_FAR),
    )
    db.add(asst_msg)

    # Update session's last active playback
    session.current_playback_sec = playback_sec
    session.mode = mode.value if hasattr(mode, "value") else str(mode)

    db.commit()
    return asst_id
