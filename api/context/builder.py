from typing import List, Optional, Dict, Any
from pydantic import BaseModel, Field
from api.retrieval.types import ScoredCandidate
from api.firewall.types import FirewallMode


class ScopedEvidenceItem(BaseModel):
    evidence_id: str  # E1, E2, E3...
    chunk_id: str
    source_type: str
    coordinate: str
    start_sec: Optional[float] = None
    end_sec: Optional[float] = None
    page: Optional[int] = None
    slide: Optional[int] = None
    text: str
    estimated_tokens: int


class ScopedContext(BaseModel):
    formatted_prompt_block: str
    items: List[ScopedEvidenceItem]
    total_estimated_tokens: int
    playback_sec: float
    mode: FirewallMode
    budget_exhausted: bool


def format_seconds_to_min_sec(seconds: Optional[float]) -> str:
    if seconds is None:
        return "N/A"
    mins = int(seconds // 60)
    secs = int(seconds % 60)
    return f"{mins}:{secs:02d}"


def estimate_token_count(text: str) -> int:
    """Fast, accurate token estimation (approx 4 chars per token)."""
    return max(1, int(len(text) / 3.8))


class ScopedContextBuilder:
    """
    Constructs bounded-budget context blocks for LLM reasoning with stable E1..En IDs.
    Guarantees token budget bounds and strict attribution formatting.
    """

    def __init__(self, max_token_budget: int = 2500):
        self.max_token_budget = max_token_budget

    def build_context(
        self,
        candidates: List[ScoredCandidate],
        playback_sec: float,
        mode: FirewallMode = FirewallMode.LEARN_SO_FAR,
    ) -> ScopedContext:
        evidence_items: List[ScopedEvidenceItem] = []
        current_token_count = 0
        budget_exhausted = False

        header_str = (
            f"=== PERMITTED TEMPORAL EVIDENCE (FIREWALL ACTIVE: UP TO {format_seconds_to_min_sec(playback_sec)}) ===\n"
            if mode == FirewallMode.LEARN_SO_FAR
            else "=== EXPLORATORY MULTI-MODAL EVIDENCE (UNCONSTRAINED CONTEXT) ===\n"
        )
        current_token_count += estimate_token_count(header_str)

        prompt_blocks: List[str] = [header_str]

        for idx, cand in enumerate(candidates, start=1):
            eid = f"E{idx}"

            # Format coordinate string
            if cand.source_type == "video":
                coord = f"{format_seconds_to_min_sec(cand.start_sec)} - {format_seconds_to_min_sec(cand.end_sec)}"
            elif cand.source_type in ("ppt", "slide"):
                coord = f"Slide {cand.slide or 'N/A'}"
            elif cand.source_type in ("pdf", "handout"):
                coord = f"Page {cand.page or 'N/A'}"
            else:
                coord = "Course Notes"

            item_header = f"[{eid}] Source: {cand.source_type.upper()} ({coord})\n"
            item_body = f'"{cand.text.strip()}"\n'
            item_block = f"{item_header}{item_body}\n"

            item_tokens = estimate_token_count(item_block)

            # Check token budget
            if current_token_count + item_tokens > self.max_token_budget:
                budget_exhausted = True
                break

            evidence_items.append(
                ScopedEvidenceItem(
                    evidence_id=eid,
                    chunk_id=cand.chunk_id,
                    source_type=cand.source_type,
                    coordinate=coord,
                    start_sec=cand.start_sec,
                    end_sec=cand.end_sec,
                    page=cand.page,
                    slide=cand.slide,
                    text=cand.text.strip(),
                    estimated_tokens=item_tokens,
                )
            )

            prompt_blocks.append(item_block)
            current_token_count += item_tokens

        prompt_blocks.append("========================================================================\n")
        full_formatted = "".join(prompt_blocks)

        return ScopedContext(
            formatted_prompt_block=full_formatted,
            items=evidence_items,
            total_estimated_tokens=current_token_count,
            playback_sec=playback_sec,
            mode=mode,
            budget_exhausted=budget_exhausted,
        )
