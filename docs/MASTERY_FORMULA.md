# PRISM Derived Mastery Formula & Misconception Architecture

**Team The Falcons:** Fuzail Ahmad & Lakshya Garg  
**Component:** Longitudinal Assessment, Evaluator & Mastery Engine  
**Status:** Production & Invariant Enforced  

---

## 1. Executive Summary & Non-Negotiable Invariants

Unlike generic EdTech platforms that generate speculative "mastery percentages" from passive video watch time or arbitrary completion bars, **PRISM enforces an empirical invariant**:

> **Non-Negotiable Invariant:**  
> Mastery records store **ASSESSED evidence only** (verified problem attempts, correctness, misconception diagnostics, linked lecture landmarks).  
> A concept's mastery score is **NEVER guessed or inflated by passive playback**.  
> The overall course mastery percentage is computed strictly across **assessed concepts only**.

```
                         ┌──────────────────────────────────────┐
                         │   Student Problem-Solving Attempt    │
                         │   (MCQ / Short-Answer via /practice) │
                         └──────────────────┬───────────────────┘
                                            │
                                            ▼
                         ┌──────────────────────────────────────┐
                         │    Temporal Evidence Evaluator       │
                         │  • Rubric Grounding Evaluation       │
                         │  • Cognitive Misconception Detection │
                         │  • Remedial Coordinate Resolution    │
                         └──────────────────┬───────────────────┘
                                            │
                                            ▼
                         ┌──────────────────────────────────────┐
                         │     Longitudinal Attempt Record      │
                         │  (Attempt: is_correct, misconception)│
                         └──────────────────┬───────────────────┘
                                            │
                                            ▼
                         ┌──────────────────────────────────────┐
                         │    Empirical Derived Mastery Math    │
                         │  • Exponential Recency Weights       │
                         │  • Streak Invariant Verification     │
                         │  • Discrete State Machine Transition │
                         └──────────────────┬───────────────────┘
                                            │
                                            ▼
                         ┌──────────────────────────────────────┐
                         │    Next Best Action Recommender      │
                         │  • Prioritize Active Gaps First      │
                         │  • Deep-Link into Lecture Moment     │
                         └──────────────────────────────────────┘
```

---

## 2. Mathematical Mastery Formula

For any curriculum concept $C$, let $A = [a_1, a_2, \dots, a_n]$ denote the chronological sequence of verified student attempts, where $a_n$ is the most recent attempt. Each attempt $a_i$ carries a binary correctness outcome $c_i \in \{0, 1\}$.

### 2.1 Exponential Recency Weighting

Human learning exhibits recency effects where recent performance reflects current cognitive schema better than initial exploration mistakes. We apply an exponential recency weight $w_i$:

$$w_i = (1.5)^{i - 1} \quad \text{for } i \in \{1, 2, \dots, n\}$$

The raw weighted mastery score $S \in [0.0, 1.0]$ is:

$$S = \frac{\sum_{i=1}^n w_i \cdot c_i}{\sum_{i=1}^n w_i}$$

### 2.2 Discrete State Machine Transitions

PRISM classifies each concept into one of four discrete pedagogical states:

| Status | Condition | Meaning |
| :--- | :--- | :--- |
| **`not_assessed`** | $n = 0$ | No student problem-solving attempts recorded yet. Zero speculation. |
| **`gap_found`** | $c_n = 0$ **or** $S < 0.50$ | Active cognitive fallacy or misconception detected in recent attempts. |
| **`improving`** | $c_n = 1 \land (S < 0.80 \lor c_{n-1} = 0 \lor n = 1)$ | Positive trajectory following prior failure, or single initial correct attempt. |
| **`demonstrated`** | $S \ge 0.80 \land c_n = 1 \land c_{n-1} = 1$ | High weighted score **and** confirmed by at least 2 consecutive correct attempts. |

#### The Streak Invariant
A learner cannot attain **`demonstrated`** on a single lucky attempt after repeated failures. Demonstrating mastery strictly requires $c_n = 1$ and $c_{n-1} = 1$ (the last two attempts must be consecutive correct answers), alongside $S \ge 0.80$.

---

## 3. Evaluator & Misconception Taxonomy

When an attempt fails ($c_i = 0$), PRISM's `PracticeEvaluator` classifies the error against a deterministic catalog of common cognitive fallacies grounded in the lecture.

### CS 201: Binary Search Trees Taxonomy

| Concept Tag | Canonical Landmark | Identified Fallacy | Evaluator Diagnosis & Remediation Link |
| :--- | :--- | :--- | :--- |
| **BST Invariant** | 05:25 (Slide 3) | *Local Parent-Child Fallacy* | Assumes node only bounds immediate children; fails to check ancestral left/right subtrees. Deep link: `/learn?t=325.0` |
| **Tree Search Complexity** | 08:15 (Slide 5) | *Constant Height Assumption* | Assumes search is always $O(\log N)$; ignores degenerate $O(N)$ path. Deep link: `/learn?t=495.0` |
| **Tree Insertion** | 12:40 (Slide 8) | *Root Replacement Fallacy* | Assumes new keys swap with root; misses trailing pointer $y$ leaf attachment. Deep link: `/learn?t=760.0` |
| **In-Order Successor** | 16:55 (Slide 11) | *Immediate Parent Fallacy* | Assumes parent is always successor; misses lowest ancestor left branch. Deep link: `/learn?t=1015.0` |
| **Node Deletion** | 21:10 (Slide 14) | *Subtree Decapitation Fallacy* | Deletes node without replacing with in-order successor. Deep link: `/learn?t=1270.0` |
| **Self-Balancing Trees** | 24:30 (Slide 16) | *Invariance Violation* | Assumes rotations alter sorted traversal order. Deep link: `/learn?t=1470.0` |

---

## 4. Next Best Action Recommender

The `NextBestActionRecommender` parses the student's evaluated concept state map to select the single highest-impact pedagogical task:

1. **Rule 1 (Active Gaps First):** If any concept carries `gap_found`, recommend **`revise`** targeting the earliest prerequisite gap with a deep link to the exact lecture video second and slide coordinate.
2. **Rule 2 (Unassessed Prerequisites):** If all assessed concepts are solid, recommend **`practice`** on the earliest unassessed concept in the curricular dependency order.
3. **Rule 3 (Solidify Improving Concepts):** If a concept is `improving`, recommend targeted follow-up practice to achieve the consecutive streak.
4. **Rule 4 (Full Demonstration):** When all concepts achieve `demonstrated`, prompt oral synthesis via the AI mock interview.

---

## 5. Course-Wide Aggregation

Overall course mastery percentage is computed strictly across assessed concepts:

$$\text{Overall Mastery} = \begin{cases} 
\frac{1}{|C_{\text{assessed}}|} \sum_{c \in C_{\text{assessed}}} S_c \times 100 & \text{if } |C_{\text{assessed}}| > 0 \\
0.0\% & \text{otherwise}
\end{cases}$$

Unassessed concepts are never factored in as zeroes (which would unfairly penalize a student on lecture 1), nor are they assumed to be 100%. The UI explicitly renders the fraction of assessed curriculum (e.g. `4 of 6 concepts assessed`).
