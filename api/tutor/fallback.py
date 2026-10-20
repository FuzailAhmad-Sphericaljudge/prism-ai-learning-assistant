from typing import Optional
from api.schemas.chat import ChatResponse, DiagnosticCheck


def format_seconds_to_min_sec(seconds: float) -> str:
    mins = int(seconds // 60)
    secs = int(seconds % 60)
    return f"{mins}:{secs:02d}"


def generate_not_covered_fallback(
    query: str,
    playback_sec: float,
    detected_topic: Optional[str] = None,
    available_at_sec: Optional[float] = None,
) -> ChatResponse:
    """
    Constructs a pedagogically constructive, safe 'not covered yet' response
    when a student asks about downstream material before it is introduced in lecture.
    """
    time_str = format_seconds_to_min_sec(playback_sec)

    topic_label = detected_topic or "This specific topic"
    avail_str = f" at **{format_seconds_to_min_sec(available_at_sec)}**" if available_at_sec else " later in the lecture"

    answer = (
        f"⚠️ **Temporal Evidence Firewall: Topic Not Covered Yet**\n\n"
        f"{topic_label} is not introduced until{avail_str} in this lecture.\n\n"
        f"Based strictly on what we have covered up to **{time_str}**, our focus is on foundational tree invariants, "
        f"traversal proofs, and single-path search/insertion algorithms. "
        f"Mastering these fundamentals ensures dynamic balanced operations make intuitive sense.\n\n"
        f"Would you like to review how the invariant holds across descendant subtrees first? "
        f"Or toggle to **Explore Ahead** mode to browse future material unconstrained?"
    )

    check = DiagnosticCheck(
        question=f"Up to {time_str}, what core structural invariant must hold for any node x in a binary search tree?",
        options=[
            "All keys in x's left subtree are strictly less than x.key, and right subtree keys are >= x.key",
            "The tree must be completely full at all times",
            "Every node must have exactly two children",
            "Left and right children must alternate between odd and even keys",
        ],
        correct_index=0,
        explanation="The BST property is ancestral and global: all descendants in the left subtree must remain strictly bounded by x.key.",
    )

    return ChatResponse(
        answer=answer,
        citations=[],
        check=check,
        is_not_covered=True,
        not_covered_topic=detected_topic,
        available_at_sec=available_at_sec,
        validation_passed=True,
    )
