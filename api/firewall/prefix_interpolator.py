import re
from typing import Tuple, Optional


def interpolate_permitted_prefix(
    text: str,
    start_sec: float,
    end_sec: float,
    playback_sec: float,
    min_permitted_words: int = 3,
) -> Tuple[bool, str, Optional[float]]:
    """
    Reconstructs strictly permitted prefix text for a chunk straddling playback_sec
    using proportional word-level timing interpolation.

    Example:
        At 18:42 (1122.0s), a chunk spanning 18:30 (1110.0s) to 19:00 (1140.0s):
        - Total duration = 30.0s
        - Elapsed duration = 12.0s
        - Ratio = 12 / 30 = 0.40 (40% of words permitted)

    Returns:
        (is_splittable, permitted_prefix_text, interpolated_end_sec)
    """
    if not text or not text.strip():
        return False, "", None

    # Chunk is completely in the future
    if playback_sec <= start_sec:
        return False, "", None

    # Chunk is completely in the past
    if playback_sec >= end_sec:
        return True, text.strip(), end_sec

    duration = end_sec - start_sec
    if duration <= 0:
        return False, "", None

    elapsed = playback_sec - start_sec
    ratio = max(0.0, min(1.0, elapsed / duration))

    # Tokenize words while preserving whitespace logic
    words = text.strip().split()
    total_words = len(words)
    if total_words == 0:
        return False, "", None

    # Calculate proportional word count
    permitted_word_count = int(round(total_words * ratio))

    # Ensure minimum meaningful words to avoid dangling noise
    if permitted_word_count < min_permitted_words:
        return False, "", None

    # Truncate to permitted words
    permitted_words = words[:permitted_word_count]
    prefix_text = " ".join(permitted_words)

    # Clean up trailing punctuation if it leaves a dangling delimiter
    prefix_text = re.sub(r"[,;:\-—]\s*$", "", prefix_text).strip()
    if not prefix_text.endswith((".", "!", "?")):
        prefix_text += "..."

    # Proportional effective timestamp
    effective_end_sec = start_sec + (duration * (permitted_word_count / total_words))

    return True, prefix_text, round(effective_end_sec, 2)
