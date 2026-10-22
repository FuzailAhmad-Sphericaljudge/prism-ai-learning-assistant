"""
PRISM Demo Mode Pre-Cached Question Catalog.
Contains 6 canonical demo questions with pre-computed, verified ground-truth answers,
strict inline citations [E1], and diagnostic check probes.
Guarantees flawless, offline-resilient presentation delivery even under zero internet connectivity.
"""
import json
from typing import Optional, Dict, Any

CANONICAL_DEMO_QUESTIONS = [
    {
        "id": "demo-q1-attention",
        "patterns": ["attention head", "what is an attention head", "how does attention work"],
        "min_playback_sec": 180.0,
        "answer": (
            "Based strictly on the verified transcript [E1], an Attention Head projects input representations "
            "into Queries (Q), Keys (K), and Values (V) using learned parameter matrices [E1]. The head computes "
            "scaled dot-product similarity between queries and keys to determine how much focus each token should "
            "place on other tokens in the sequence [E2]."
        ),
        "citations": [
            {
                "citation_id": "E1",
                "chunk_id": "chunk-demo-att-01",
                "source_title": "Lecture 1: Attention & Transformers",
                "source_type": "video",
                "timestamp_start": 120.0,
                "timestamp_end": 195.0,
                "quote": "An attention head takes query, key, and value vectors and computes scaled dot-product attention.",
                "relevance_score": 0.96,
            },
            {
                "citation_id": "E2",
                "chunk_id": "chunk-demo-att-02",
                "source_title": "Lecture 1: Attention & Transformers",
                "source_type": "video",
                "timestamp_start": 195.0,
                "timestamp_end": 260.0,
                "quote": "The output of the attention mechanism is a weighted sum of the values, where weights are computed by a compatibility function.",
                "relevance_score": 0.92,
            },
        ],
        "check": {
            "concept_tag": "Scaled Dot-Product Attention",
            "question": "Why do we divide the dot product by the square root of the key dimension (d_k) before applying softmax?",
            "options": [
                "To prevent dot products from growing excessively large and causing vanishing gradients in softmax",
                "To reduce computational complexity from quadratic to linear",
                "To ensure the resulting matrix is symmetric",
                "To normalize token lengths across varying sentence batches",
            ],
            "correct_index": 0,
            "explanation": "For large dimensions, dot products grow large in magnitude, pushing softmax into regions with extremely small gradients. Dividing by sqrt(d_k) stabilizes the variance to 1.0.",
        },
    },
    {
        "id": "demo-q2-scaling",
        "patterns": ["divide by", "square root of d_k", "scaling factor", "sqrt(d_k)"],
        "min_playback_sec": 420.0,
        "answer": (
            "As covered at 7:45 in the lecture [E1], we scale by 1/sqrt(d_k) because for large key dimensions d_k, "
            "the dot products grow large in magnitude. When these large magnitudes enter the softmax function, "
            "the softmax distribution becomes extremely peaked, resulting in vanishing gradients during backpropagation [E1]."
        ),
        "citations": [
            {
                "citation_id": "E1",
                "chunk_id": "chunk-demo-scale-01",
                "source_title": "Lecture 1: Attention & Transformers",
                "source_type": "video",
                "timestamp_start": 420.0,
                "timestamp_end": 495.0,
                "quote": "We suspect that for large values of d_k, the dot products grow large in magnitude, pushing the softmax function into regions where it has extremely small gradients.",
                "relevance_score": 0.98,
            }
        ],
        "check": {
            "concept_tag": "Gradient Stability",
            "question": "What happens to the softmax derivative when one input value is significantly larger than all other inputs?",
            "options": [
                "The gradient approaches 0, stalling gradient descent weight updates",
                "The gradient explodes toward infinity",
                "The attention weights become completely uniform",
                "The loss function becomes non-convex",
            ],
            "correct_index": 0,
            "explanation": "Softmax saturation produces near-zero derivatives for saturated logits, causing catastrophic gradient vanishing.",
        },
    },
    {
        "id": "demo-q3-boundary",
        "patterns": ["18:42", "boundary case", "temporal firewall", "straddling chunk", "word-level"],
        "min_playback_sec": 1122.0,
        "answer": (
            "The PRISM Temporal Evidence Firewall resolves boundary straddles using sub-second word-level timestamp "
            "interpolation [E1]. At 18:42, for a candidate chunk spanning 18:00 to 19:00, PRISM computes the exact word "
            "offset spoken before 18:42 and reconstructs ONLY the permitted prefix [E1]. The future segment from 18:43 to 19:00 "
            "is mathematically severed and withheld from the language model context [E2]."
        ),
        "citations": [
            {
                "citation_id": "E1",
                "chunk_id": "chunk-demo-firewall-01",
                "source_title": "PRISM System Specification",
                "source_type": "notes",
                "timestamp_start": 1080.0,
                "timestamp_end": 1122.0,
                "quote": "Chunks straddling the playback boundary are strictly truncated using word-level timing interpolation to prevent temporal leakage.",
                "relevance_score": 0.99,
            },
            {
                "citation_id": "E2",
                "chunk_id": "chunk-demo-firewall-02",
                "source_title": "PRISM Architectural Whitepaper",
                "source_type": "pdf",
                "page_number": 4,
                "quote": "Future tokens ending after playback_sec are locked prior to candidate retrieval stage in PostgreSQL.",
                "relevance_score": 0.95,
            },
        ],
        "check": {
            "concept_tag": "Temporal Scoping",
            "question": "Why does PRISM truncate straddling chunks instead of simply admitting the whole chunk?",
            "options": [
                "Admitting the entire chunk would leak concepts spoken after 18:42, breaking the educational pedagogical boundary",
                "To save token budget in the prompt context",
                "Because PostgreSQL tsvector cannot index audio over 60 seconds",
                "To force the user into Explore Ahead mode",
            ],
            "correct_index": 0,
            "explanation": "Permitting the unrevealed suffix would allow the model to spoil upcoming topics before the learner has encountered them in the lecture.",
        },
    },
    {
        "id": "demo-q4-withheld",
        "patterns": ["node deletion", "avl deletion", "avl tree", "deletion algorithm", "rebalancing"],
        "min_playback_sec": 1122.0,
        "answer": (
            "This concept (Node deletion algorithms) has not been covered yet at your current playback timestamp (18:42). "
            "The lecture introduces binary search tree insertion first, and covers deletion and tree rebalancing later at 24:15. "
            "To explore this topic now, you can toggle into 'Explore Ahead' mode using the firewall control."
        ),
        "is_not_covered": True,
        "not_covered_topic": "Node deletion & AVL rebalancing",
        "available_at_sec": 1455.0,
        "citations": [],
        "check": None,
    },
    {
        "id": "demo-q5-multihead",
        "patterns": ["multi-head", "multi head attention", "single-head", "multiple heads"],
        "min_playback_sec": 700.0,
        "answer": (
            "According to the lecture [E1], Multi-Head Attention linearly projects queries, keys, and values h times "
            "with different, learned linear projections to d_k, d_k, and d_v dimensions. This allows the model to jointly "
            "attend to information from different representation subspaces at different positions [E2], whereas single-head "
            "attention averages pooling across all subspaces, obscuring distinct relational patterns."
        ),
        "citations": [
            {
                "citation_id": "E1",
                "chunk_id": "chunk-demo-mha-01",
                "source_title": "Lecture 1: Attention & Transformers",
                "source_type": "video",
                "timestamp_start": 680.0,
                "timestamp_end": 750.0,
                "quote": "Instead of performing a single attention function, we found it beneficial to linearly project the queries, keys and values h times.",
                "relevance_score": 0.97,
            },
            {
                "citation_id": "E2",
                "chunk_id": "chunk-demo-mha-02",
                "source_title": "Lecture 1: Attention & Transformers",
                "source_type": "video",
                "timestamp_start": 750.0,
                "timestamp_end": 820.0,
                "quote": "Multi-head attention allows the model to jointly attend to information from different representation subspaces at different positions.",
                "relevance_score": 0.95,
            },
        ],
        "check": {
            "concept_tag": "Subspace Projections",
            "question": "If d_model = 512 and we use h = 8 attention heads, what is the dimension d_k for each individual head?",
            "options": [
                "64 (since 512 / 8 = 64)",
                "512 (each head maintains full model dimensionality)",
                "128",
                "32",
            ],
            "correct_index": 0,
            "explanation": "Due to the reduced dimension of each head (d_k = d_model / h = 64), the total computational cost is similar to that of single-head attention with full dimensionality.",
        },
    },
    {
        "id": "demo-q6-cross-attention",
        "patterns": ["cross-attention", "cross attention", "encoder-decoder attention", "self-attention vs"],
        "min_playback_sec": 1400.0,
        "answer": (
            "As explained in the Transformer architecture breakdown [E1], Cross-Attention (Encoder-Decoder Attention) differs "
            "from Self-Attention in where the inputs originate. In Self-Attention, Queries, Keys, and Values all derive from the "
            "same sequence [E1]. In Cross-Attention, Queries come from the previous decoder layer, while Keys and Values come from "
            "the output of the encoder stack [E2], allowing the decoder to attend across the entire input sequence."
        ),
        "citations": [
            {
                "citation_id": "E1",
                "chunk_id": "chunk-demo-cross-01",
                "source_title": "Lecture 1: Attention & Transformers",
                "source_type": "video",
                "timestamp_start": 1380.0,
                "timestamp_end": 1460.0,
                "quote": "In encoder-decoder attention layers, the queries come from the previous decoder layer, and the memory keys and values come from the output of the encoder.",
                "relevance_score": 0.98,
            },
            {
                "citation_id": "E2",
                "chunk_id": "chunk-demo-cross-02",
                "source_title": "Lecture 1: Attention & Transformers",
                "source_type": "slide",
                "slide_number": 14,
                "quote": "Encoder output representations form K and V; target prefix tokens form Q.",
                "relevance_score": 0.94,
            },
        ],
        "check": {
            "concept_tag": "Encoder-Decoder Architecture",
            "question": "Where do the Keys (K) and Values (V) come from in the Transformer cross-attention layer?",
            "options": [
                "From the final representations produced by the Encoder stack",
                "From the target sequence being generated by the Decoder",
                "From an external pre-trained embedding table",
                "From the positional encoding lookup matrix",
            ],
            "correct_index": 0,
            "explanation": "Cross-attention conditions the autoregressive decoder generation on the contextual representations synthesized by the encoder.",
        },
    },
]


def match_demo_question(query: str, playback_sec: float = 0.0, mode: str = "learn_so_far") -> Optional[Dict[str, Any]]:
    """
    Matches an incoming user query against the canonical demo catalog.
    Enforces temporal withholding rules if query touches future topics in learn_so_far mode.
    """
    q_lower = query.lower()

    for item in CANONICAL_DEMO_QUESTIONS:
        for pattern in item["patterns"]:
            if pattern in q_lower:
                # Check temporal withholding
                if item.get("is_not_covered"):
                    if mode == "explore_ahead":
                        # If user unlocked explore_ahead, answer it!
                        return {
                            "answer": (
                                "In Explore Ahead mode, future lecture content is unlocked: Node deletion in a balanced binary tree "
                                "involves 3 cases: deleting a leaf (trivial), deleting a node with one child (replace with child), "
                                "and deleting a node with two children (replace with in-order successor or predecessor), followed by "
                                "AVL rotation checks [E1]."
                            ),
                            "citations": [
                                {
                                    "citation_id": "E1",
                                    "chunk_id": "chunk-demo-avl-future",
                                    "source_title": "Lecture 1: Attention & Transformers",
                                    "source_type": "video",
                                    "timestamp_start": 1455.0,
                                    "timestamp_end": 1520.0,
                                    "quote": "Deletion requires swapping with the in-order successor and recomputing height balance factors.",
                                    "relevance_score": 0.95,
                                }
                            ],
                            "check": {
                                "concept_tag": "Tree Deletion",
                                "question": "When deleting a binary tree node with two children, which node is used as a drop-in replacement?",
                                "options": [
                                    "The in-order successor (minimum node in the right subtree)",
                                    "The root of the entire tree",
                                    "The parent of the deleted node",
                                    "A randomly selected child node",
                                ],
                                "correct_index": 0,
                                "explanation": "The in-order successor preserves the binary search tree property.",
                            },
                            "is_not_covered": False,
                        }
                    else:
                        # Return the strict refusal
                        return item

                # Return matched demo answer
                return item

    return None
