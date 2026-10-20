from typing import Optional, List, Dict, Any
from pydantic import BaseModel, Field
from api.firewall.types import FirewallMode


class RetrievalQuery(BaseModel):
    query: str
    course_id: str
    playback_sec: float
    mode: FirewallMode = FirewallMode.LEARN_SO_FAR
    vector_top_k: int = 10
    keyword_top_k: int = 10
    final_top_k: int = 5
    rrf_k: int = 60


class ScoredCandidate(BaseModel):
    chunk_id: str
    source_id: str
    source_type: str
    text: str
    start_sec: Optional[float] = None
    end_sec: Optional[float] = None
    page: Optional[int] = None
    slide: Optional[int] = None
    vector_rank: Optional[int] = None
    vector_score: Optional[float] = None
    keyword_rank: Optional[int] = None
    keyword_score: Optional[float] = None
    rrf_score: float = 0.0
    rerank_score: Optional[float] = None
    metadata: Dict[str, Any] = Field(default_factory=dict)


class RetrievalResult(BaseModel):
    query: str
    course_id: str
    playback_sec: float
    mode: FirewallMode
    admitted_candidates: List[ScoredCandidate]
    blocked_candidate_ids: List[str] = Field(default_factory=list)
    reasons: Dict[str, str] = Field(default_factory=dict)
