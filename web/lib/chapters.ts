export interface Chapter {
  id: string;
  title: string;
  startSec: number;
  endSec: number;
  description: string;
  isCovered?: boolean;
}

export const BST_CHAPTERS: Chapter[] = [
  {
    id: "ch-1",
    title: "1. Motivation: The Dynamic Ordered Set Problem",
    startSec: 0,
    endSec: 300,
    description: "Contrasting unsorted arrays O(1) insert vs sorted arrays O(log N) search and linked list limits.",
  },
  {
    id: "ch-2",
    title: "2. The Binary Search Tree Property & Invariant",
    startSec: 300,
    endSec: 600,
    description: "Definition of Left < Node <= Right spanning entire subtrees and in-order traversal monotonicity proof.",
  },
  {
    id: "ch-3",
    title: "3. Search & Insertion Algorithms",
    startSec: 600,
    endSec: 900,
    description: "Recursive search path discarding subtrees and insertion using a trailing parent pointer.",
  },
  {
    id: "ch-4",
    title: "4. Order Statistics: Min, Max & In-Order Successor",
    startSec: 900,
    endSec: 1122, // 18:42
    description: "Tree-Minimum, Tree-Maximum, and two-case Successor search (right subtree vs ancestor walk). Concludes at 18:42.",
  },
  {
    id: "ch-5",
    title: "5. Deletion: The Three Structural Cases",
    startSec: 1122,
    endSec: 1350, // 22:30
    description: "Removing leaf nodes (Case 1), single-child splice (Case 2), and two-child successor substitution (Case 3).",
  },
  {
    id: "ch-6",
    title: "6. Tree Degeneracy & Complexity Bounds",
    startSec: 1350,
    endSec: 1530, // 25:30
    description: "Balanced tree O(log N) vs sorted insertion degradation into a linear chain of height N-1 costing O(N).",
  },
  {
    id: "ch-7",
    title: "7. Preview: Self-Balancing Trees (AVL & Red-Black)",
    startSec: 1530,
    endSec: 1680, // 28:00
    description: "Dynamic tree rotations preserving the BST invariant while strictly bounding height to O(log N).",
  },
];

export function getCurrentChapter(currentTime: number): Chapter {
  const ch = BST_CHAPTERS.find(
    (c) => currentTime >= c.startSec && currentTime < c.endSec
  );
  return ch || BST_CHAPTERS[BST_CHAPTERS.length - 1];
}
