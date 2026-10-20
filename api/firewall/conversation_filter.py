from typing import List, Dict, Any
from api.firewall.types import FirewallMode


def filter_conversation_history(
    messages: List[Dict[str, Any]],
    current_mode: FirewallMode,
    playback_sec: float,
) -> List[Dict[str, Any]]:
    """
    Filters conversation turns based on the active firewall mode.
    When in `learn_so_far` mode, all prior turns that were generated while exploring
    ahead or that reference future timestamps are purged from the conversation context.

    Expected message dict schema:
    {
        "id": str,
        "role": str,
        "content": str,
        "playback_sec": float,
        "explored_ahead": bool,
    }
    """
    if current_mode == FirewallMode.EXPLORE_AHEAD:
        # Retain all turns during exploratory investigation
        return list(messages)

    # In learn_so_far mode: strictly purge turns generated in explore_ahead or future turns
    permitted_messages = []
    for msg in messages:
        # Check explicit flag
        if msg.get("explored_ahead") is True:
            continue

        # Check timestamp boundary
        msg_time = msg.get("playback_sec")
        if msg_time is not None and float(msg_time) > playback_sec:
            continue

        permitted_messages.append(msg)

    return permitted_messages


def tag_message_turn(
    role: str,
    content: str,
    playback_sec: float,
    mode: FirewallMode,
    citations: Any = None,
    lecture_max_time: float = 1714.0,
) -> Dict[str, Any]:
    """
    Constructs a message turn with strict mode tagging.
    """
    is_explored_ahead = (mode == FirewallMode.EXPLORE_AHEAD) or (playback_sec > lecture_max_time)
    return {
        "role": role,
        "content": content,
        "playback_sec": playback_sec,
        "explored_ahead": is_explored_ahead,
        "is_firewalled": mode == FirewallMode.LEARN_SO_FAR,
        "citations": citations or [],
    }
