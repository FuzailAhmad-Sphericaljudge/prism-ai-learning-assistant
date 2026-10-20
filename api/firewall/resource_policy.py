from typing import Dict, Optional, Tuple
from api.firewall.types import FirewallMode


# Default temporal landmark mappings for CS 201 Binary Search Trees
DEFAULT_SLIDE_LANDMARKS: Dict[int, Tuple[float, float]] = {
    1: (0.0, 142.0),      # Introduction & Title
    2: (142.0, 255.0),    # Motivation: Dynamic Sets
    3: (255.0, 420.0),    # BST Property & Invariants
    4: (420.0, 585.0),    # In-Order Traversal & Monotonicity
    5: (585.0, 780.0),    # Search & Insertion
    6: (780.0, 1122.0),   # Order Statistics: Min, Max, Successor (ends at 18:42)
    7: (1122.0, 1390.0),  # Deletion: 3 Structural Cases
    8: (1390.0, 1530.0),  # Degenerate Chains & Complexity
    9: (1530.0, 1620.0),  # Self-Balancing Trees (AVL / Red-Black)
    10: (1620.0, 1714.0), # Summary & Preview
}

DEFAULT_PDF_LANDMARKS: Dict[int, Tuple[float, float]] = {
    1: (0.0, 585.0),      # Page 1: Motivation, BST Property, In-Order Traversal
    2: (585.0, 1122.0),   # Page 2: Search, Insertion, Successor (ends at 18:42)
    3: (1122.0, 1714.0),  # Page 3: Deletion, Degeneracy, Self-Balancing
}


class ResourceTimestampPolicy:
    """
    Manages temporal mappings for static artifacts (PDF pages, PPT slides, notes).
    Ensures PDF and presentation material follows the Temporal Evidence Firewall.
    """

    def __init__(
        self,
        slide_landmarks: Optional[Dict[int, Tuple[float, float]]] = None,
        pdf_landmarks: Optional[Dict[int, Tuple[float, float]]] = None,
    ):
        self.slide_landmarks = slide_landmarks or DEFAULT_SLIDE_LANDMARKS
        self.pdf_landmarks = pdf_landmarks or DEFAULT_PDF_LANDMARKS

    def get_slide_temporal_bounds(self, slide_num: int) -> Tuple[float, float]:
        """Returns (start_sec, end_sec) for given slide number."""
        if slide_num in self.slide_landmarks:
            return self.slide_landmarks[slide_num]
        # Heuristic fallback: 180s per slide
        return ((slide_num - 1) * 180.0, slide_num * 180.0)

    def get_pdf_temporal_bounds(self, page_num: int) -> Tuple[float, float]:
        """Returns (start_sec, end_sec) for given PDF page."""
        if page_num in self.pdf_landmarks:
            return self.pdf_landmarks[page_num]
        # Heuristic fallback: 500s per page
        return ((page_num - 1) * 500.0, page_num * 500.0)

    def is_resource_admitted(
        self,
        source_type: str,
        playback_sec: float,
        mode: FirewallMode,
        slide: Optional[int] = None,
        page: Optional[int] = None,
        start_sec: Optional[float] = None,
    ) -> Tuple[bool, str, Optional[float]]:
        """
        Evaluates whether a multi-modal resource is permitted under current temporal policy.

        Returns:
            (is_admitted, reason, mapped_start_sec)
        """
        if mode == FirewallMode.EXPLORE_AHEAD:
            return True, "Permitted under explore_ahead mode", start_sec

        if source_type in ("ppt", "presentation", "slide"):
            if slide is not None:
                s_start, s_end = self.get_slide_temporal_bounds(slide)
                if s_start <= playback_sec:
                    return True, f"Slide {slide} introduced at {s_start}s <= {playback_sec}s", s_start
                return False, f"Slide {slide} introduced at {s_start}s > {playback_sec}s (future content)", s_start

        elif source_type in ("pdf", "handout"):
            if page is not None:
                p_start, p_end = self.get_pdf_temporal_bounds(page)
                if p_start <= playback_sec:
                    return True, f"PDF page {page} introduced at {p_start}s <= {playback_sec}s", p_start
                return False, f"PDF page {page} introduced at {p_start}s > {playback_sec}s (future content)", p_start

        elif source_type in ("notes", "markdown"):
            if start_sec is not None:
                if start_sec <= playback_sec:
                    return True, f"Notes section timestamp {start_sec}s <= {playback_sec}s", start_sec
                return False, f"Notes section timestamp {start_sec}s > {playback_sec}s (future content)", start_sec
            # If notes has no timestamp, treat as overview admitted
            return True, "Course notes overview admitted", 0.0

        return True, "Default admission", start_sec
