import {
  Course,
  CourseTranscriptResponse,
  CourseResourcesResponse,
  PracticeGenerateResponse,
  MasteryDashboardResponse,
  MasteryTimelineResponse,
  EducatorInsightsResponse,
  ConfusionHeatmapBucket,
  AdminMetricsResponse,
  ChatResponse,
  CitationItem,
  DiagnosticCheck,
} from "./api-types";

export const DEMO_COURSE_ID = "00000000-0000-0000-0000-000000000002";
export const DEMO_USER_ID = "00000000-0000-0000-0000-000000000001";

export const DEMO_COURSE: Course = {
  id: DEMO_COURSE_ID,
  code: "CS-201",
  title: "CS 201: Binary Search Trees & Balanced Structures",
  description:
    "Comprehensive foundations of dynamic ordered sets, BST invariants, traversal proofs, and O(h) complexity bounds.",
  instructor: "Dr. Elena Rostova",
  term: "Fall 2026",
  source_count: 4,
  created_at: "2026-09-01T09:00:00Z",
  updated_at: "2026-10-20T10:00:00Z",
};

export const DEMO_COURSES: Course[] = [
  DEMO_COURSE,
  {
    id: "00000000-0000-0000-0000-000000000003",
    code: "CS-224N",
    title: "CS 224N: Natural Language Processing with Deep Learning",
    description:
      "Word vectors, recurrent neural networks, self-attention mechanisms, and transformer architectures.",
    instructor: "Prof. Christopher Manning",
    term: "Fall 2026",
    source_count: 3,
    created_at: "2026-09-10T14:00:00Z",
    updated_at: "2026-10-18T16:30:00Z",
  },
  {
    id: "00000000-0000-0000-0000-000000000004",
    code: "CS-161",
    title: "CS 161: Design and Analysis of Algorithms",
    description:
      "Divide-and-conquer, dynamic programming, greedy algorithms, amortized analysis, and graph cuts.",
    instructor: "Prof. Mary Wootters",
    term: "Fall 2026",
    source_count: 4,
    created_at: "2026-09-15T11:00:00Z",
    updated_at: "2026-10-19T12:00:00Z",
  },
];

export const DEMO_TRANSCRIPT_CUES = [
  {
    id: "cue-01",
    start_sec: 0,
    end_sec: 142,
    text: "Welcome back, everyone. Today we begin our deep dive into Binary Search Trees, or BSTs.",
    speaker: "Dr. Elena Rostova",
  },
  {
    id: "cue-02",
    start_sec: 142,
    end_sec: 255,
    text: "Let's first review the fundamental motivation behind dynamic tree structures. In an unsorted array, insertion is O(1), but searching requires O(N) linear time. In a sorted array, search takes O(log N) using binary search, but insertion takes O(N) because elements must be shifted. A linked list gives O(1) splicing, but sequential traversal destroys O(log N) binary search.",
    speaker: "Dr. Elena Rostova",
  },
  {
    id: "cue-03",
    start_sec: 255,
    end_sec: 420,
    text: "Now, what is the Binary Search Tree Property? For any node x, all keys in its left subtree must be strictly less than x.key, and all keys in its right subtree must be greater than or equal to x.key. This invariant forms the backbone of all binary search tree algorithms.",
    speaker: "Dr. Elena Rostova",
  },
  {
    id: "cue-04",
    start_sec: 420,
    end_sec: 585,
    text: "Let's prove the in-order traversal theorem. An in-order tree walk systematically prints keys in non-decreasing sorted order. We visit the left subtree recursively, print x.key, and then visit the right subtree. Because every node is visited exactly once, this runs in linear O(N) time.",
    speaker: "Dr. Elena Rostova",
  },
  {
    id: "cue-05",
    start_sec: 585,
    end_sec: 780,
    text: "Next, we explore tree search and insertion. Both algorithms descend along a single root-to-leaf path. At each step, we compare our target key with the current node and branch left or right. Consequently, both search and insertion execute in O(h) time, where h is the tree height.",
    speaker: "Dr. Elena Rostova",
  },
  {
    id: "cue-06",
    start_sec: 780,
    end_sec: 1122,
    text: "Now consider Order Statistics: finding the Tree-Minimum, Tree-Maximum, and Successor. To find the minimum, follow left child pointers until reaching null. The successor of node x is the node with the smallest key strictly greater than x.key. Finding the successor takes O(h) time. This brings us right to the 18:42 mark in our lecture.",
    speaker: "Dr. Elena Rostova",
  },
  {
    id: "cue-07",
    start_sec: 1122,
    end_sec: 1455,
    text: "At 19:00, we now examine Node Deletion. Deletion is fundamentally more intricate than insertion because removing an interior node requires carefully handling three distinct topological cases: zero children, one child, or two children.",
    speaker: "Dr. Elena Rostova",
  },
  {
    id: "cue-08",
    start_sec: 1455,
    end_sec: 1800,
    text: "When an interior node has two children, we must find its in-order successor, splice it out, and promote it to replace the deleted node. Finally, to prevent worst-case O(N) degenerate trees, we introduce AVL height-balanced trees and rotation operations.",
    speaker: "Dr. Elena Rostova",
  },
];

export const DEMO_TRANSCRIPT: CourseTranscriptResponse = {
  course_id: DEMO_COURSE_ID,
  source_id: "src-video-01",
  source_title: "Lecture 14: Binary Search Trees (Recording Transcript)",
  total_cues: DEMO_TRANSCRIPT_CUES.length,
  duration_sec: 1800,
  max_time_sec: 1800,
  cues: DEMO_TRANSCRIPT_CUES,
};

export const DEMO_RESOURCES: CourseResourcesResponse = {
  course_id: DEMO_COURSE_ID,
  total_sources: 4,
  resources: {
    video: [
      {
        id: "src-video-01",
        course_id: DEMO_COURSE_ID,
        type: "video",
        title: "Lecture 14: Binary Search Trees (Recording)",
        version: 1,
        status: "ready",
        duration_sec: 1800,
      },
    ],
    pdf: [
      {
        id: "src-pdf-01",
        course_id: DEMO_COURSE_ID,
        type: "pdf",
        title: "Lecture 14: Course Reading & Invariant Proofs",
        version: 1,
        status: "ready",
        page_count: 14,
      },
    ],
    ppt: [
      {
        id: "src-ppt-01",
        course_id: DEMO_COURSE_ID,
        type: "ppt",
        title: "Lecture 14: Slide Deck",
        version: 1,
        status: "ready",
        page_count: 28,
      },
    ],
    notes: [
      {
        id: "src-notes-01",
        course_id: DEMO_COURSE_ID,
        type: "notes",
        title: "Lecture 14: Summary & Algorithm Reference",
        version: 1,
        status: "ready",
      },
    ],
  },
};

export const DEMO_PRACTICE_QUESTIONS: PracticeGenerateResponse = {
  course_id: DEMO_COURSE_ID,
  playback_sec: 1122,
  mode: "learn_so_far",
  available_concepts: ["BST Invariant", "Search Complexity", "Tree Height & Degeneracy"],
  questions: [
    {
      id: "q-bst-inv-01",
      course_id: DEMO_COURSE_ID,
      concept_tag: "BST Invariant",
      question_type: "mcq",
      question_text:
        "Consider a Binary Search Tree node containing key 42. Which statement must hold true for all keys residing in its left subtree?",
      options: [
        "All keys in the left subtree must be strictly less than 42",
        "All keys in the left subtree must be greater than or equal to 42",
        "At least one key in the left subtree must equal 42",
        "The left subtree must be completely full and balanced",
      ],
      correct_answer: "All keys in the left subtree must be strictly less than 42",
      correct_index: 0,
      explanation:
        "By definition of the Binary Search Tree invariant, for any node x, every key in x.left must be strictly less than x.key.",
      evidence_links: [
        {
          evidence_id: "E1",
          chunk_id: "chk-01",
          source_type: "video",
          coordinate: "04:15",
          start_sec: 255,
          end_sec: 420,
          quote: "For any node x, all keys in its left subtree must be strictly less than x.key.",
        },
      ],
    },
    {
      id: "q-search-comp-02",
      course_id: DEMO_COURSE_ID,
      concept_tag: "Search Complexity",
      question_type: "mcq",
      question_text:
        "What is the exact asymptotic time complexity to search for a target key in an arbitrary (unbalanced) Binary Search Tree of n nodes and height h?",
      options: [
        "O(h) time, which is O(log n) in the best case and O(n) in the worst case",
        "O(1) average time using bucket hashing",
        "Strictly O(log n) regardless of tree topology",
        "O(n log n) due to recursion stack overhead",
      ],
      correct_answer: "O(h) time, which is O(log n) in the best case and O(n) in the worst case",
      correct_index: 0,
      explanation:
        "Search descends along a single root-to-leaf path doing O(1) comparisons per level, bounding runtime strictly by O(h). If degenerate, h = n.",
      evidence_links: [
        {
          evidence_id: "E2",
          chunk_id: "chk-02",
          source_type: "video",
          coordinate: "09:45",
          start_sec: 585,
          end_sec: 780,
          quote: "Both search and insertion execute in O(h) time, where h is the tree height.",
        },
      ],
    },
  ],
};

export const DEMO_MASTERY_DASHBOARD: MasteryDashboardResponse = {
  course_id: DEMO_COURSE_ID,
  user_id: DEMO_USER_ID,
  total_concepts: 6,
  assessed_concepts: 5,
  demonstrated_count: 2,
  improving_count: 2,
  gap_count: 1,
  unassessed_count: 1,
  overall_mastery_percentage: 72.9,
  concepts: [
    {
      concept_tag: "BST Invariant",
      status: "demonstrated",
      mastery_score: 95.0,
      attempts_count: 4,
      correct_count: 4,
      misconceptions: [],
      last_assessed_at: "2026-10-22T08:30:00Z",
      evidence_landmarks: ["04:15", "Slide 4"],
    },
    {
      concept_tag: "In-Order Traversal",
      status: "demonstrated",
      mastery_score: 88.5,
      attempts_count: 3,
      correct_count: 3,
      misconceptions: [],
      last_assessed_at: "2026-10-22T09:15:00Z",
      evidence_landmarks: ["07:00", "Reading Page 3"],
    },
    {
      concept_tag: "Search & Insertion Complexity",
      status: "improving",
      mastery_score: 74.0,
      attempts_count: 5,
      correct_count: 3,
      misconceptions: ["Conflating average-case logarithmic height with guaranteed worst-case bound"],
      last_assessed_at: "2026-10-22T10:00:00Z",
      evidence_landmarks: ["09:45"],
    },
    {
      concept_tag: "Tree Height & Degeneracy",
      status: "improving",
      mastery_score: 62.0,
      attempts_count: 4,
      correct_count: 2,
      misconceptions: ["Assuming sorted insertion yields a balanced tree"],
      last_assessed_at: "2026-10-22T11:20:00Z",
      evidence_landmarks: ["13:00", "Notes Page 4"],
    },
    {
      concept_tag: "Order Statistics (Successor)",
      status: "gap_found",
      mastery_score: 45.0,
      attempts_count: 3,
      correct_count: 1,
      misconceptions: ["Assuming the immediate right child is always the successor"],
      last_assessed_at: "2026-10-22T12:05:00Z",
      evidence_landmarks: ["18:42"],
    },
    {
      concept_tag: "AVL Tree Deletion & Rotations",
      status: "not_assessed",
      mastery_score: 0.0,
      attempts_count: 0,
      correct_count: 0,
      misconceptions: [],
      last_assessed_at: null,
      evidence_landmarks: ["19:00"],
    },
  ],
  next_best_action: {
    concept_tag: "Order Statistics (Successor)",
    reason:
      "2 recent misconceptions regarding successor derivation when the right child possesses a left subtree.",
    recommended_type: "revise",
    action_url: `/learn/${DEMO_COURSE_ID}?t=780`,
    coordinate: "13:00",
    label: "Revise Tree-Successor algorithm at 13:00",
  },
};

export const DEMO_MASTERY_TIMELINE: MasteryTimelineResponse = {
  course_id: DEMO_COURSE_ID,
  user_id: DEMO_USER_ID,
  total_attempts: 5,
  timeline: [
    {
      id: "ev-01",
      concept_tag: "BST Invariant",
      question_text: "Which statement must hold true for all keys residing in its left subtree?",
      user_answer: "All keys in the left subtree must be strictly less than 42",
      is_correct: true,
      misconception_tag: null,
      feedback: "Correct! By invariant definition, left keys are strictly less.",
      explanation: "For any node x, every key in x.left is strictly less than x.key.",
      created_at: "2026-10-22T08:30:00Z",
      linked_evidence: [
        {
          evidence_id: "E1",
          chunk_id: "chk-01",
          source_type: "video",
          coordinate: "04:15",
          quote: "For any node x, all keys in its left subtree must be strictly less than x.key.",
        },
      ],
    },
    {
      id: "ev-02",
      concept_tag: "In-Order Traversal",
      question_text: "What order of keys is output by an in-order tree walk?",
      user_answer: "Non-decreasing sorted order",
      is_correct: true,
      misconception_tag: null,
      feedback: "Exemplary answer. In-order systematically prints sorted output.",
      explanation: "Visiting left, root, right prints non-decreasing keys.",
      created_at: "2026-10-22T09:15:00Z",
      linked_evidence: [
        {
          evidence_id: "E2",
          chunk_id: "chk-02",
          source_type: "video",
          coordinate: "07:00",
          quote: "An in-order tree walk systematically prints keys in non-decreasing sorted order.",
        },
      ],
    },
    {
      id: "ev-03",
      concept_tag: "Search & Insertion Complexity",
      question_text: "What is the worst-case search complexity in an unbalanced BST?",
      user_answer: "O(log N)",
      is_correct: false,
      misconception_tag: "Conflating average-case logarithmic height with guaranteed worst-case bound",
      feedback: "Review needed: An unbalanced BST can degenerate into a linked list chain.",
      explanation: "Worst case is O(N) when nodes are inserted in sorted order.",
      created_at: "2026-10-22T10:00:00Z",
      revision_action: {
        type: "video",
        coordinate: "09:45",
        timestamp_sec: 585,
        label: "Lecture 14: Search Complexity",
      },
      linked_evidence: [
        {
          evidence_id: "E3",
          chunk_id: "chk-03",
          source_type: "video",
          coordinate: "09:45",
          quote: "Both search and insertion execute in O(h) time, where h is the tree height.",
        },
      ],
    },
  ],
};

export const DEMO_CONFUSION_HEATMAP: ConfusionHeatmapBucket[] = [
  { bucket_index: 0, start_sec: 0, end_sec: 120, coordinate_label: "00:00-02:00", query_count: 6, misconception_count: 1, confusion_intensity: 0.15, most_confused_topic: "Course Setup" },
  { bucket_index: 1, start_sec: 120, end_sec: 240, coordinate_label: "02:00-04:00", query_count: 28, misconception_count: 14, confusion_intensity: 0.65, most_confused_topic: "Array vs List" },
  { bucket_index: 2, start_sec: 240, end_sec: 360, coordinate_label: "04:00-06:00", query_count: 15, misconception_count: 4, confusion_intensity: 0.32, most_confused_topic: "BST Invariant" },
  { bucket_index: 3, start_sec: 360, end_sec: 480, coordinate_label: "06:00-08:00", query_count: 12, misconception_count: 3, confusion_intensity: 0.25, most_confused_topic: "In-Order Walk" },
  { bucket_index: 4, start_sec: 480, end_sec: 600, coordinate_label: "08:00-10:00", query_count: 34, misconception_count: 19, confusion_intensity: 0.72, most_confused_topic: "O(h) Complexity" },
  { bucket_index: 5, start_sec: 600, end_sec: 720, coordinate_label: "10:00-12:00", query_count: 42, misconception_count: 26, confusion_intensity: 0.84, most_confused_topic: "Tree Insertion" },
  { bucket_index: 6, start_sec: 720, end_sec: 840, coordinate_label: "12:00-14:00", query_count: 51, misconception_count: 33, confusion_intensity: 0.95, most_confused_topic: "Successor Derivation" },
  { bucket_index: 7, start_sec: 840, end_sec: 960, coordinate_label: "14:00-16:00", query_count: 18, misconception_count: 8, confusion_intensity: 0.45, most_confused_topic: "Tree Minimum" },
  { bucket_index: 8, start_sec: 960, end_sec: 1080, coordinate_label: "16:00-18:00", query_count: 22, misconception_count: 9, confusion_intensity: 0.48, most_confused_topic: "Degenerate Trees" },
  { bucket_index: 9, start_sec: 1080, end_sec: 1200, coordinate_label: "18:00-20:00", query_count: 46, misconception_count: 22, confusion_intensity: 0.79, most_confused_topic: "18:42 Firewall Boundary" },
];

export const DEMO_EDUCATOR_INSIGHTS: EducatorInsightsResponse = {
  course_id: DEMO_COURSE_ID,
  total_questions_asked: 1240,
  total_practice_attempts: 450,
  total_interviews: 65,
  active_students: 148,
  avg_course_mastery_percentage: 76.5,
  confusion_heatmap: DEMO_CONFUSION_HEATMAP,
  top_misconceptions: [
    {
      misconception_tag: "Guaranteed O(log N) fallacy",
      concept_tag: "Search & Insertion Complexity",
      occurrences: 74,
      prevalence_percentage: 28.5,
      landmark_coordinate: "09:45",
      remediation_action: "Clarify that O(log N) requires height balancing, e.g. AVL trees.",
    },
    {
      misconception_tag: "Direct right-child as successor",
      concept_tag: "Order Statistics (Successor)",
      occurrences: 58,
      prevalence_percentage: 22.3,
      landmark_coordinate: "13:00",
      remediation_action: "Emphasize finding minimum of right subtree when right child exists.",
    },
    {
      misconception_tag: "Linked list binary search fallacy",
      concept_tag: "Data Structure Motivation",
      occurrences: 49,
      prevalence_percentage: 18.8,
      landmark_coordinate: "02:22",
      remediation_action: "Demonstrate sequential pointer hopping cost.",
    },
  ],
  top_questions: [
    {
      question: "Why can't binary search run in O(log N) on a linked list?",
      occurrences: 68,
      concept_tag: "Data Structure Motivation",
      playback_coordinate: "02:22",
      timestamp_sec: 142,
    },
    {
      question: "What trade-off are we trying to solve with a tree?",
      occurrences: 54,
      concept_tag: "BST Motivation",
      playback_coordinate: "03:30",
      timestamp_sec: 210,
    },
    {
      question: "How is the height h of a tree defined?",
      occurrences: 47,
      concept_tag: "Tree Definitions",
      playback_coordinate: "09:45",
      timestamp_sec: 585,
    },
  ],
  concept_distributions: [
    {
      concept_tag: "BST Invariant",
      demonstrated_count: 112,
      improving_count: 24,
      gap_count: 8,
      unassessed_count: 4,
      average_score: 91.2,
    },
    {
      concept_tag: "In-Order Traversal",
      demonstrated_count: 98,
      improving_count: 32,
      gap_count: 12,
      unassessed_count: 6,
      average_score: 86.4,
    },
    {
      concept_tag: "Search Complexity",
      demonstrated_count: 76,
      improving_count: 48,
      gap_count: 18,
      unassessed_count: 6,
      average_score: 72.8,
    },
  ],
};

export const DEMO_ADMIN_METRICS: AdminMetricsResponse = {
  total_queries: 1284,
  p50_latency_ms: 42.1,
  p95_latency_ms: 118.4,
  p99_latency_ms: 245.0,
  mean_latency_ms: 55.2,
  validation_pass_rate: 99.8,
  firewall_leak_rate: 0.0,
  temporal_enforcement_rate: 100.0,
  learn_so_far_count: 980,
  explore_ahead_count: 304,
  latency_distribution: [
    { bucket: "< 50ms", count: 720 },
    { bucket: "50-100ms", count: 380 },
    { bucket: "100-200ms", count: 140 },
    { bucket: "200-500ms", count: 40 },
    { bucket: "> 500ms", count: 4 },
  ],
  recent_timeline: [
    {
      timestamp: new Date(Date.now() - 60000).toISOString(),
      latency_ms: 42.1,
      validation_passed: true,
      query: "Why can't binary search run in O(log N) on a linked list?",
      playback_sec: 180,
      mode: "learn_so_far",
    },
    {
      timestamp: new Date(Date.now() - 120000).toISOString(),
      latency_ms: 38.5,
      validation_passed: true,
      query: "What trade-off are we trying to solve with a tree?",
      playback_sec: 250,
      mode: "learn_so_far",
    },
  ],
};

/**
 * Returns a high-precision grounded answer with citations and check question
 * based on query keywords and playback time.
 */
export function getGroundedChatFallback(
  query: string,
  playback_sec: number = 250,
  mode: string = "learn_so_far"
): ChatResponse {
  const q = query.toLowerCase().trim();

  // 1. Temporal Firewall with-held future case (e.g., node deletion or AVL rebalancing before 19:00)
  if (
    mode === "learn_so_far" &&
    playback_sec < 1140 &&
    (q.includes("delete") ||
      q.includes("deletion") ||
      q.includes("avl") ||
      q.includes("rotate") ||
      q.includes("rotation") ||
      q.includes("rebalance"))
  ) {
    return {
      answer:
        "This concept (**Node Deletion & AVL Tree Rotations**) has not been covered yet at your current playback timestamp in **Learn So Far** mode. The lecture introduces binary search tree properties and search first, and covers deletion and tree rebalancing later starting at **19:00 (1140s)**. To explore this topic right now, you can switch to **Explore Ahead** mode using the firewall control toggle above.",
      citations: [],
      check: null,
      is_not_covered: true,
      not_covered_topic: "AVL Tree Deletion & Rotations",
      available_at_sec: 1140,
      validation_passed: true,
    };
  }

  // 2. Binary search on linked list
  if (
    q.includes("linked list") ||
    q.includes("binary search run in o(log n)") ||
    q.includes("why can't binary search")
  ) {
    return {
      answer:
        "Binary search strictly relies on **O(1) random access** to find the middle element of an array at index $\\lfloor (L + R) / 2 \\rfloor$ [E1]. In a singly-linked list, nodes are connected via linear pointer references; accessing the $k$-th node requires sequentially traversing $k$ pointers in $O(k)$ time [E2].\n\nTherefore, even though the items in a linked list may be sorted, stepping to the midpoint at each step takes $O(N)$ operations, completely destroying the logarithmic division-by-two property and yielding an overall $O(N)$ runtime [E1].",
      citations: [
        {
          evidence_id: "E1",
          chunk_id: "chk-01",
          source_type: "video",
          coordinate: "02:22",
          quote:
            "In an unsorted array, insertion is O(1), but searching requires O(N). In a sorted array, search takes O(log N), but insertion takes O(N) because elements must be shifted. A linked list gives O(1) splicing, but sequential traversal destroys O(log N) binary search.",
          start_sec: 142,
          end_sec: 255,
        },
        {
          evidence_id: "E2",
          chunk_id: "chk-02",
          source_type: "notes",
          coordinate: "Page 1",
          quote:
            "Array random access affords O(1) index computation. Linked list sequential pointer chains require Theta(k) dereferences to access node k.",
          page: 1,
        },
      ],
      check: {
        question:
          "If you attempt binary search on a sorted singly-linked list by counting pointers to the midpoint at each iteration, what is the resulting total search time?",
        options: ["O(log N)", "O(N)", "O(N log N)", "O(1)"],
        correct_index: 1,
        explanation:
          "Traversing to the midpoint takes N/2 + N/4 + N/8 + ... = O(N) total pointer hops.",
      },
      is_not_covered: false,
      validation_passed: true,
    };
  }

  // 3. Trade-off we are trying to solve with a tree
  if (
    q.includes("trade-off") ||
    q.includes("trying to solve") ||
    q.includes("motivation") ||
    q.includes("why bst")
  ) {
    return {
      answer:
        "We are trying to combine the **fast $O(\\log N)$ search capability** of a sorted array with the **dynamic insertion and deletion flexibility** of a linked list [E1].\n\n- **Sorted Array:** Offers $O(\\log N)$ search via binary search, but insertion requires shifting up to $N$ elements in $O(N)$ time [E1].\n- **Linked List:** Allows $O(1)$ pointer insertion/deletion once the position is known, but searching requires $O(N)$ linear pointer dereferencing [E1].\n\nA Binary Search Tree provides a hierarchical middle ground where both search, insertion, and deletion run in $O(h)$ time proportional to tree height $h$ [E2].",
      citations: [
        {
          evidence_id: "E1",
          chunk_id: "chk-01",
          source_type: "video",
          coordinate: "02:22",
          quote:
            "In an unsorted array, insertion is O(1), but searching requires O(N). In a sorted array, search takes O(log N), but insertion takes O(N). A linked list gives O(1) splicing, but sequential traversal destroys O(log N) binary search.",
          start_sec: 142,
          end_sec: 255,
        },
        {
          evidence_id: "E2",
          chunk_id: "chk-04",
          source_type: "ppt",
          coordinate: "Slide 4",
          quote:
            "Slide 4: The Dynamic Set Dilemma. BST achieves O(h) for search, insert, min, max, predecessor, successor.",
          slide: 4,
        },
      ],
      check: {
        question:
          "What is the time complexity of inserting an element into a sorted array of size N when maintaining sorted order?",
        options: ["O(1)", "O(log N)", "O(N)", "O(N log N)"],
        correct_index: 2,
        explanation:
          "Even if the insertion spot is found in O(log N) via binary search, subsequent elements must be shifted right in memory, costing O(N).",
      },
      is_not_covered: false,
      validation_passed: true,
    };
  }

  // 4. Tree height definition
  if (
    q.includes("height h") ||
    q.includes("height of a tree") ||
    q.includes("defined") ||
    q.includes("tree height")
  ) {
    return {
      answer:
        "The **height $h$ of a tree** is defined as the **maximum number of edges** on any simple downward path from the root node to a leaf node [E1].\n\nKey conventions:\n1. A tree consisting of just a single root node has height **$h = 0$** [E2].\n2. An empty tree is formally defined as having height **$h = -1$**.\n3. The height of a non-empty node $x$ satisfies $h(x) = 1 + \\max(h(x.\\text{left}), h(x.\\text{right}))$.\n\nIn a Binary Search Tree, all core operations (Search, Insert, Minimum, Maximum) execute in $O(h)$ time, making tree balance the central determinant of performance [E1].",
      citations: [
        {
          evidence_id: "E1",
          chunk_id: "chk-05",
          source_type: "video",
          coordinate: "09:45",
          quote:
            "Both search and insertion execute in O(h) time, where h is the tree height.",
          start_sec: 585,
          end_sec: 780,
        },
        {
          evidence_id: "E2",
          chunk_id: "chk-06",
          source_type: "pdf",
          coordinate: "Page 3",
          quote:
            "Definition 2.1: Height of node x is the length of the longest path from x to a leaf. Height of tree is height of root.",
          page: 3,
        },
      ],
      check: {
        question:
          "What is the height h of a completely degenerate (chain-like) Binary Search Tree containing N nodes?",
        options: ["log_2(N)", "N - 1", "N / 2", "1"],
        correct_index: 1,
        explanation:
          "In a chain of N nodes, there are N - 1 edges from the root to the single leaf, giving height h = N - 1.",
      },
      is_not_covered: false,
      validation_passed: true,
    };
  }

  // 5. 18:42 boundary case / Temporal Firewall
  if (
    q.includes("18:42") ||
    q.includes("firewall") ||
    q.includes("boundary") ||
    q.includes("straddl")
  ) {
    return {
      answer:
        "The **PRISM Temporal Evidence Firewall** resolves chunk boundary straddles using sub-second word-level timestamp interpolation [E1]. At 18:42, for a candidate chunk spanning 18:00 to 19:00, PRISM computes the exact word offset spoken before 18:42 and admits **ONLY** that permitted prefix text [E1].\n\nThe unrevealed future portion from 18:43 to 19:00 is mathematically truncated and excluded from the retrieval candidate pool prior to prompt construction [E2].",
      citations: [
        {
          evidence_id: "E1",
          chunk_id: "chk-07",
          source_type: "notes",
          coordinate: "Page 2",
          quote:
            "Chunks straddling the playback boundary are strictly truncated using word-level timing interpolation to prevent temporal leakage.",
          page: 2,
        },
        {
          evidence_id: "E2",
          chunk_id: "chk-08",
          source_type: "pdf",
          coordinate: "Page 4",
          quote:
            "Future tokens ending after playback_sec are locked prior to candidate retrieval stage.",
          page: 4,
        },
      ],
      check: {
        question:
          "Why does PRISM truncate straddling chunks instead of admitting the entire chunk?",
        options: [
          "Admitting the entire chunk would leak future concepts before the learner has encountered them",
          "To reduce database vector indexing size",
          "Because HTML5 video cannot play audio over 60 seconds",
          "To force the user into Explore Ahead mode",
        ],
        correct_index: 0,
        explanation:
          "Admitting unrevealed suffixes leaks upcoming pedagogical concepts, violating the strict Temporal Evidence Firewall invariant.",
      },
      is_not_covered: false,
      validation_passed: true,
    };
  }

  // 6. Generic BST concepts
  return {
    answer:
      "Based strictly on the verified lecture material covered up to this timestamp [E1], a **Binary Search Tree** organizes items in a hierarchical binary tree where for every node $x$, all keys in $x.\\text{left}$ are strictly less than $x.\\text{key}$, and all keys in $x.\\text{right}$ are greater than or equal to $x.\\text{key}$ [E1].\n\nAn in-order tree walk visits the tree in $O(N)$ time and prints the keys in sorted ascending order [E2]. Core queries like `Tree-Search`, `Tree-Minimum`, and `Tree-Insert` descend along a single path, running in $O(h)$ time where $h$ is the tree height.",
    citations: [
      {
        evidence_id: "E1",
        chunk_id: "chk-01",
        source_type: "video",
        coordinate: "04:15",
        quote:
          "For any node x, all keys in its left subtree must be strictly less than x.key, and all keys in its right subtree must be greater than or equal to x.key.",
        start_sec: 255,
        end_sec: 420,
      },
      {
        evidence_id: "E2",
        chunk_id: "chk-02",
        source_type: "video",
        coordinate: "07:00",
        quote:
          "An in-order tree walk systematically prints keys in non-decreasing sorted order in O(N) time.",
        start_sec: 420,
        end_sec: 585,
      },
    ],
    check: {
      question:
        "What order does an in-order traversal of a valid Binary Search Tree produce?",
      options: [
        "Non-decreasing sorted order",
        "Random topological order",
        "Decreasing reverse order",
        "Level-by-level breadth first order",
      ],
      correct_index: 0,
      explanation:
        "By visiting left subtree (smaller keys), node (current key), and right subtree (larger keys), the in-order walk produces sorted order.",
    },
    is_not_covered: false,
    validation_passed: true,
  };
}
