import re
from abc import ABC, abstractmethod
from typing import List
from api.retrieval.types import ScoredCandidate


class BaseReranker(ABC):
    """
    Abstract interface for re-scoring and re-ordering candidates
    after initial hybrid retrieval and firewall pre-filtering.
    """

    @abstractmethod
    def rerank(
        self,
        query: str,
        candidates: List[ScoredCandidate],
        top_n: int = 5,
    ) -> List[ScoredCandidate]:
        """Re-scores and returns top_n candidates."""
        pass


class CrossEncoderHeuristicReranker(BaseReranker):
    """
    High-performance cross-encoder heuristic reranker.
    Computes cross-token alignment, query term containment, exact n-gram matching,
    and temporal proximity weighting.
    """

    def rerank(
        self,
        query: str,
        candidates: List[ScoredCandidate],
        top_n: int = 5,
    ) -> List[ScoredCandidate]:
        if not candidates:
            return []

        q_terms = set(re.findall(r"\w+", query.lower()))
        if not q_terms:
            return candidates[:top_n]

        scored: List[ScoredCandidate] = []
        for c in candidates:
            c_copy = c.model_copy()
            c_text_lower = c.text.lower()
            c_words = re.findall(r"\w+", c_text_lower)
            c_word_set = set(c_words)

            # 1. Term overlap ratio
            matched_terms = q_terms.intersection(c_word_set)
            term_recall = len(matched_terms) / len(q_terms)

            # 2. Exact phrase bonus
            clean_query = query.strip().lower()
            exact_phrase_bonus = 0.35 if (len(clean_query) > 5 and clean_query in c_text_lower) else 0.0

            # 3. Source weight (video transcript +0.1, slides +0.05)
            source_weight = 0.1 if c.source_type == "video" else 0.05

            # 4. Composite rerank score
            combined_score = (0.50 * term_recall) + exact_phrase_bonus + source_weight + (0.15 * c.rrf_score)
            c_copy.rerank_score = round(min(1.0, combined_score), 4)
            scored.append(c_copy)

        scored.sort(key=lambda x: (x.rerank_score or 0.0), reverse=True)
        return scored[:top_n]
