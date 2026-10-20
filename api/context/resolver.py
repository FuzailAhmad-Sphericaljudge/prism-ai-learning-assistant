import re
from typing import Optional, List, Dict, Any, Tuple


DEICTIC_PATTERNS = [
    r"\bthis\b",
    r"\bthat\b",
    r"\bhere\b",
    r"\bcurrent\b",
    r"\bthis part\b",
    r"\bthis step\b",
    r"\bwhat happened\b",
    r"\bwhat did she say\b",
    r"\bwhat did he say\b",
    r"\bwhy did the professor\b",
]


class DeicticContextResolver:
    """
    Resolves ambiguous demonstrative pronouns ('this', 'that', 'here')
    by anchoring them to permitted transcript cues within a local temporal window
    [-window_sec, 0] around playback_sec.
    """

    def __init__(self, window_sec: float = 60.0):
        self.window_sec = window_sec
        self.compiled_patterns = [re.compile(p, re.IGNORECASE) for p in DEICTIC_PATTERNS]

    def has_deictic_reference(self, query: str) -> bool:
        """Checks if the query contains ambiguous deictic references."""
        for pat in self.compiled_patterns:
            if pat.search(query):
                return True
        return False

    def resolve_reference(
        self,
        query: str,
        playback_sec: float,
        nearby_transcript_cues: List[Dict[str, Any]],
    ) -> Tuple[str, Optional[Dict[str, Any]]]:
        """
        If query contains deictic pronouns, finds the active transcript cue
        at or immediately preceding playback_sec and produces an enriched query.

        Returns:
            (resolved_query, focal_cue)
        """
        if not self.has_deictic_reference(query) or not nearby_transcript_cues:
            return query, None

        # Filter cues permitted up to playback_sec and within temporal window
        min_time = max(0.0, playback_sec - self.window_sec)
        permitted_cues = [
            c for c in nearby_transcript_cues
            if c.get("start_sec", 0.0) <= playback_sec and c.get("end_sec", 0.0) >= min_time
        ]

        if not permitted_cues:
            return query, None

        # Pick the most immediate cue (the one active right now or just ended)
        permitted_cues.sort(key=lambda c: c.get("end_sec", 0.0), reverse=True)
        focal_cue = permitted_cues[0]
        focal_text = focal_cue.get("text", "").strip()

        if not focal_text:
            return query, None

        # Format temporal focal anchor
        anchor_prefix = f'[Context at {round(playback_sec, 1)}s: "{focal_text}"]'
        resolved_query = f"{anchor_prefix} {query}"

        return resolved_query, focal_cue
