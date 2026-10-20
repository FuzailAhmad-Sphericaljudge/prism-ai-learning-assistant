# The Temporal Evidence Firewall

> **Theoretical Specification & Implementation Architecture**  
> **Team The Falcons | Hackathon 2026**

---

## 1. Problem Statement

Standard Retrieval-Augmented Generation (RAG) systems retrieve knowledge from entire video transcripts, slide decks, and documents globally. When a student watching a 60-minute lecture asks a question at minute 5:
- **Premature Spoilers**: Global RAG retrieves conclusions from minute 55, giving away answers to problems the student hasn't worked through.
- **Cognitive Overload**: The assistant references advanced concepts introduced much later in the course.
- **Hallucinated Grounding**: Answers cite evidence the student has not yet encountered.

---

## 2. Mathematical Definition

Let $\mathcal{C}$ be the universe of multimodal document chunks for a lecture:
$$\mathcal{C} = \{c_1, c_2, \dots, c_N\}$$

Each chunk $c_i$ is defined as a tuple:
$$c_i = (\mathbf{v}_i, t_{start}, t_{end}, \text{type}, \text{content})$$

Given the learner's current playback timestamp $T_{playback} \in \mathbb{R}^+$, the **Temporal Evidence Firewall** defines the strictly permitted knowledge domain $\mathcal{D}_{permitted}$:

$$\mathcal{D}_{permitted}(T_{playback}) = \left\{ c \in \mathcal{C} \;\middle|\; c.t_{start} \le T_{playback} \right\}$$

For static documents (slide decks, reading pages) without explicit timestamps, time mapping functions correlate slide transitions with lecture intervals:
$$t_{slide}(k) = \min_{c \in \mathcal{C}_{slide=k}} (c.t_{start})$$

---

## 3. Retrieval Formulation

For a user query embedding $\mathbf{q} \in \mathbb{R}^{3072}$, the retrieval optimization problem is constrained by the firewall:

$$\arg\max_{c \in \mathcal{D}_{permitted}(T_{playback})} \frac{\mathbf{q} \cdot \mathbf{v}_c}{\|\mathbf{q}\| \|\mathbf{v}_c\|}$$

All chunks $c \notin \mathcal{D}_{permitted}(T_{playback})$ with high semantic similarity are classified as **Intercepted Spoilers** and quarantined from prompt context.

---

## 4. Evidence Inspector Grounding

Every claim made in the generated answer must be attributed to a citation chip:
1. Video Timestamp: `[MM:SS]`
2. Slide Number: `Slide K`
3. Notes Reference: `Page P`

If no permitted evidence exists ($|\mathcal{D}_{permitted}| = 0$ for the concept), the model explicitly states that this concept will be covered later in the lecture.
