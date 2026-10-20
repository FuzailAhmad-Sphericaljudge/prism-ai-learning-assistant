import hashlib
import re
from typing import Optional
from api.firewall.types import FirewallMode


def generate_temporal_cache_key(
    user_id: str,
    course_id: str,
    query: str,
    playback_sec: float,
    mode: FirewallMode = FirewallMode.LEARN_SO_FAR,
    auth_token_or_role: Optional[str] = "student",
    quantization_window_sec: float = 5.0,
) -> str:
    """
    Generates a secure, deterministic cache key incorporating:
    1. User identity
    2. Authorization scope / role
    3. Course scope
    4. Firewall mode
    5. Quantized temporal boundary (prevents cache thrashing on continuous video playback)
    6. Normalized user query
    """
    clean_query = re.sub(r"\s+", " ", query.strip().lower())
    query_hash = hashlib.sha256(clean_query.encode("utf-8")).hexdigest()[:16]

    auth_hash = hashlib.sha256((auth_token_or_role or "student").encode("utf-8")).hexdigest()[:8]

    mode_str = mode.value if hasattr(mode, "value") else str(mode)

    if mode == FirewallMode.EXPLORE_AHEAD:
        temporal_scope = "unconstrained"
    else:
        # Quantize to 5-second bins
        quantized_bin = int(playback_sec // quantization_window_sec) * int(quantization_window_sec)
        temporal_scope = f"t{quantized_bin}s"

    composite = f"prism:cache:{user_id}:{auth_hash}:{course_id}:{mode_str}:{temporal_scope}:{query_hash}"
    return composite
