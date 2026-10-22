# PRISM — 3-Minute Hackathon Demo Script

> **Team The Falcons:** Fuzail Ahmad & Lakshya Garg  
> **Target Audience:** Hackathon Judges & Evaluators  
> **Total Duration:** 3 Minutes (180 Seconds)  
> **Presenter Shortcut:** Press `Ctrl + Shift + D` on any screen to open the **Presenter Demo Palette** with one-click questions and timestamp seeks.

---

## ⏱️ Minute 0:00 – 0:35 • The Hook & The Problem

### Visuals
1. Start on the **Landing Page** (`/`).
2. Show the animated PRISM light-beam refraction visual splitting white light into 4 gradient colors.
3. Scroll down to the interactive **Temporal Evidence Firewall** preview.

### Spoken Script
> *"Hello judges! Every student today learns with AI, but current AI tutors have a fatal flaw: **they ruin learning with premature spoilers and ungrounded hallucinations**.
> 
> When a student at minute 10 of a computer science lecture asks a question, standard RAG retrieves and reveals the entire 60-minute transcript, spoiling algorithms that the professor hasn't taught yet.
> 
> We built **PRISM** — the first timestamp-aware learning assistant powered by a mathematical **Temporal Evidence Firewall** that guarantees zero spoilers and 100% verified citations."*

---

## ⏱️ Minute 0:35 – 1:25 • The Core Classroom Experience & The 18:42 Boundary

### Visuals
1. Click **"Try the Demo"** or navigate to `/learn/00000000-0000-0000-0000-000000000002`.
2. Point out the top bar: the green glowing badge **"Firewall active: context up to mm:ss"** synchronized with the video player.
3. Scrub the video to **`18:42`**.
4. In chat composer, type or click from demo palette:  
   `"What is an Attention Head?"`
5. Show the streaming grounded response with inline citation chips `[E1]` and `[E2]`.
6. Click `[E1]` to slide open the **Evidence Inspector Drawer**: highlight the exact quote, audio timestamp, and the *"Why Was This Allowed?"* panel with admitted vs blocked chunks.
7. Now test the firewall boundary! Ask:  
   `"How does node deletion work in an AVL tree?"`
8. Show the **"Not Covered Yet"** pedagogical refusal:
   > *"This topic (Node deletion) has not been covered yet at 18:42. It is introduced at 24:15. Switch to Explore Ahead to unlock."*
9. Click the segmented switch to **Explore Ahead** mode. Re-ask the question. Watch it immediately unlock with full citations!

### Spoken Script
> *"Here is the main learning experience. Notice our top bar: the Temporal Evidence Firewall is actively tracking the video playback in real time.
> 
> Let's ask: 'What is an Attention Head?' Look at how fast and clean this is. Every single factual statement is cited with [E1] and [E2]. When I click this citation chip, the Evidence Inspector slides open, showing the exact transcript line and proving zero hallucination.
> 
> Now, let's try to break it. At minute 18:42, I ask about AVL tree deletion—a topic taught at minute 24. Look: PRISM refuses to spoil it! It tells the student exactly when the instructor will introduce it. And if the student genuinely wants to explore ahead, one click unlocks the future material."*

---

## ⏱️ Minute 1:25 – 2:05 • Formative Diagnostics & Mastery Dashboard

### Visuals
1. Scroll down in the chat to the **Diagnostic Check Card** generated under the answer.
2. Select an answer and submit: show the animated feedback pill.
3. Click the sidebar navigation to **Practice** (`/practice`).
4. Show the concept-filtered MCQ cards with "Revise this" deep-links that jump back into the lecture at the exact second.
5. Click the sidebar navigation to **Mastery** (`/mastery`).
6. Highlight the Recharts radar chart and progress bars: emphasize that mastery is derived **strictly from assessed attempts**, never estimated.

### Spoken Script
> *"PRISM doesn't stop at explaining; it ensures understanding. Right below every answer, PRISM serves a formative diagnostic check probe.
> 
> If the student makes an error, our evaluator tags the specific misconception and gives a direct deep-link to the exact lecture coordinate to review.
> 
> Over on the Mastery dashboard, we never guess student competency. Every percentage is backed by cryptographic, assessed attempt history with a clear 'Next Best Action' guiding their study plan."*

---

## ⏱️ Minute 2:05 – 2:40 • Adaptive Oral Defense Interview (Viva-Voce)

### Visuals
1. Navigate to **Interview** (`/interview`).
2. Select Role: *"Systems & Algorithms Candidate"*. Click **"Start Oral Defense"**.
3. Point out the live rubric on the right sidebar.
4. Click the microphone button to showcase the **Web Speech API** speech-to-text response (or type an answer).
5. Submit the response: point out the **"Why this follow-up?"** tooltip on the interviewer's next question, explaining what rubric criterion was missing.
6. Complete the exchange and show the **Interview Report** with animated score rings and course timestamp revision links.

### Spoken Script
> *"To prove true mastery, PRISM features an AI Oral Defense Interview—a realistic viva-voce examination.
> 
> Students can speak their answers using browser speech-to-text. The AI evaluates each answer against a rigorous rubric extracted from course materials.
> 
> Notice this tooltip: 'Why this question?'. The interviewer explains its reasoning in real-time. The final report gives granular criterion scores and links back to course timestamps for anything the candidate missed."*

---

## ⏱️ Minute 2:40 – 3:00 • Educator Insights, Observability & Conclusion

### Visuals
1. Navigate to **Educator Insights** (`/educator`).
2. Show the **Confusion Heatmap** along the lecture timeline: point to the red peak at `18:42` where learners got stuck.
3. Navigate to **System Observability** (`/admin/metrics`).
4. Highlight the **100% Validation Pass Rate**, **0.00% Firewall Leak Rate**, and median latency under **1,100ms**.
5. Switch back to the landing page or repo banner.

### Spoken Script
> *"For instructors, our Educator Insights dashboard aggregates cohort confusion into a temporal heatmap. A professor can see in three seconds that minute 18:42 had the highest misconception count in the class.
> 
> And under the hood, our System Observability dashboard benchmarks our pipeline with OpenTelemetry traces: 100% validation pass rate, sub-1,100 millisecond response times, and an independently benchmarked 0.00% leakage rate.
> 
> PRISM is live on Vercel and Render today. Thank you!"*

---

## 🎯 Emergency Backup / Offline Fallback Plan
If internet or external provider API drops during the live pitch:
- Press `Ctrl + Shift + D` (or `Cmd + Shift + D`).
- Toggle **"Enable Demo Mode"**.
- All 6 demo questions run against the deterministic in-memory pre-cached catalog with guaranteed sub-50ms latency and zero external dependencies!
