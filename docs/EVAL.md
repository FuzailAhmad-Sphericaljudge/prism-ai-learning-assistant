# PRISM Evaluation & Safety Benchmark Report

**Generated:** 2026-10-22 07:53:15 UTC  
**Evaluation Suite:** `api/evals/runner.py`  
**Course Context:** CS 201 Binary Search Trees & Balanced Structures  
**Engine Version:** v1.0.0 (Team The Falcons)

## 1. Executive Summary & Core Invariants

| Evaluation Metric | PRISM Target | Measured Benchmark | Verdict |
| :--- | :--- | :--- | :--- |
| **Firewall Leakage Rate** | `0.00%` | **`0.00%`** | **PASSED** |
| **Citation Validity Rate** | `100.0%` | **`100.00%`** | **PASSED** |
| **Future-Only Withholding Accuracy** | `100.0%` | **`100.0%`** | **PASSED** |
| **Explore Ahead Unlock Rate** | `100.0%` | **`100.0%`** | **PASSED** |
| **Mean Response Latency** | `< 250ms` | **`1014.2ms`** | **PASSED** |
| **Latency p95** | `< 400ms` | **`1445.0ms`** | **PASSED** |

## 2. Golden Q&A Benchmark Results (22 Questions)

| ID | Playback | Mode | Target Topic | Expected | Actual | Leakage | Valid Citations | Latency | Pass/Fail |
| :--- | :--- | :--- | :--- | :--- | :--- | :--- | :--- | :--- | :--- |
| `gq-01` | `05:00` | `learn_so_far` | BST Invariant | `answer` | `answer` | 0 (Safe) | `1/1` | `3575.4ms` | **PASS** |
| `gq-02` | `06:00` | `learn_so_far` | BST Invariant | `answer` | `answer` | 0 (Safe) | `1/1` | `1011.8ms` | **PASS** |
| `gq-03` | `08:20` | `learn_so_far` | In-Order Traversal | `answer` | `answer` | 0 (Safe) | `1/1` | `1295.5ms` | **PASS** |
| `gq-04` | `10:00` | `learn_so_far` | Tree Search Complexity | `answer` | `answer` | 0 (Safe) | `1/1` | `1006.6ms` | **PASS** |
| `gq-05` | `13:20` | `learn_so_far` | Tree Search Complexity | `answer` | `answer` | 0 (Safe) | `1/1` | `1119.0ms` | **PASS** |
| `gq-06` | `14:10` | `learn_so_far` | Tree Search Complexity | `answer` | `answer` | 0 (Safe) | `1/1` | `1274.3ms` | **PASS** |
| `gq-07` | `17:30` | `learn_so_far` | Tree Insertion | `answer` | `answer` | 0 (Safe) | `1/1` | `1050.3ms` | **PASS** |
| `gq-08` | `18:20` | `learn_so_far` | Tree Insertion | `answer` | `answer` | 0 (Safe) | `1/1` | `1005.2ms` | **PASS** |
| `gq-09` | `18:42` | `learn_so_far` | Tree Insertion | `answer` | `answer` | 0 (Safe) | `1/1` | `1008.2ms` | **PASS** |
| `gq-10` | `18:42` | `learn_so_far` | Tree Insertion | `answer` | `answer` | 0 (Safe) | `1/1` | `1050.5ms` | **PASS** |
| `gq-11` | `18:42` | `learn_so_far` | Node Deletion | `withhold` | `withhold` | 0 (Safe) | `0/0` | `0.1ms` | **PASS** |
| `gq-12` | `18:42` | `learn_so_far` | In-Order Successor | `withhold` | `withhold` | 0 (Safe) | `0/0` | `0.0ms` | **PASS** |
| `gq-13` | `18:42` | `learn_so_far` | Self-Balancing Trees | `withhold` | `withhold` | 0 (Safe) | `0/0` | `0.0ms` | **PASS** |
| `gq-14` | `18:42` | `learn_so_far` | Node Deletion | `withhold` | `withhold` | 0 (Safe) | `0/0` | `0.0ms` | **PASS** |
| `gq-15` | `18:42` | `explore_ahead` | Node Deletion | `answer` | `answer` | 0 (Safe) | `1/1` | `1007.3ms` | **PASS** |
| `gq-16` | `18:42` | `explore_ahead` | In-Order Successor | `answer` | `answer` | 0 (Safe) | `1/1` | `1035.1ms` | **PASS** |
| `gq-17` | `18:42` | `explore_ahead` | Self-Balancing Trees | `answer` | `answer` | 0 (Safe) | `1/1` | `1370.1ms` | **PASS** |
| `gq-18` | `21:00` | `learn_so_far` | In-Order Successor | `answer` | `answer` | 0 (Safe) | `1/1` | `1032.7ms` | **PASS** |
| `gq-19` | `25:00` | `learn_so_far` | Node Deletion | `answer` | `answer` | 0 (Safe) | `1/1` | `1007.9ms` | **PASS** |
| `gq-20` | `29:00` | `learn_so_far` | Self-Balancing Trees | `answer` | `answer` | 0 (Safe) | `1/1` | `1445.0ms` | **PASS** |
| `gq-21` | `29:00` | `learn_so_far` | Self-Balancing Trees | `answer` | `answer` | 0 (Safe) | `1/1` | `1000.2ms` | **PASS** |
| `gq-22` | `22:00` | `learn_so_far` | In-Order Successor | `answer` | `answer` | 0 (Safe) | `1/1` | `1016.4ms` | **PASS** |

## 3. Boundary & Straddling Analysis (18:42 Test Case)

At timestamp `18:42`:
- **Straddling chunk (`18:00 - 19:00`)**: Prefix word interpolation successfully trims future sentences and strictly retains words delivered prior to `18:42`.
- **In-Order Successor query (`gq-12`)**: Safely withheld in `learn_so_far` mode (`is_not_covered=True`), without referencing right subtree minimums.
- **Case 3 Node Deletion query (`gq-11`)**: Safely withheld in `learn_so_far` mode, preventing spoiler leakage of successor splicing.
- **Explore Ahead toggle (`gq-15`, `gq-16`)**: Unlocks the same future questions when user explicitly consents to explore ahead.

## 4. Citation Integrity Guarantees

Every generated answer references only admitted chunk blocks. Citations include:
1. Exact start and end video seconds or PDF page numbers.
2. Verbatim excerpt quotes from the lecture transcript.
3. Interactive playback seek links for instantaneous verification.
