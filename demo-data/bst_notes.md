# CS 201: Binary Search Trees — Lecture 14 Notes

**Instructor:** Dr. Elena Rostova  
**Term:** Fall 2026  
**Topic:** Binary Search Tree Invariants, Operations, and Temporal Complexity  

---

## 1. Motivation: The Dynamic Ordered Set Problem

In computer systems and database design, we frequently require a data structure that maintains a dynamic collection of keys under three core operations:
1. `Search(k)`: Query whether key $k$ exists in the collection.
2. `Insert(k)`: Add key $k$ to the collection.
3. `Delete(k)`: Remove key $k$ from the collection.

### Comparison Matrix
| Data Structure | Search | Insert | Delete | In-Order Traversal |
| :--- | :--- | :--- | :--- | :--- |
| **Unsorted Array** | $O(N)$ | $O(1)$ | $O(N)$ | $O(N \log N)$ |
| **Sorted Array** | $O(\log N)$ | $O(N)$ | $O(N)$ | $O(N)$ |
| **Linked List** | $O(N)$ | $O(1)$ | $O(N)$ | $O(N \log N)$ |
| **Balanced BST** | $O(\log N)$ | $O(\log N)$ | $O(\log N)$ | $O(N)$ |
| **Degenerate BST** | $O(N)$ | $O(N)$ | $O(N)$ | $O(N)$ |

---

## 2. The Binary Search Tree Property

A **Binary Search Tree (BST)** is an organized binary tree where each node $x$ satisfies the strict invariant:
- If $y$ is in the left subtree of $x$, then $\text{key}(y) < \text{key}(x)$.
- If $y$ is in the right subtree of $x$, then $\text{key}(y) \ge \text{key}(x)$.

> **Crucial Invariant Scope:** This condition must hold across **all descendants** in the left and right subtrees, not solely between a parent and its immediate children.

### Theorem: In-Order Traversal Monotonicity
An in-order traversal of a binary search tree visits the stored keys in strictly non-decreasing sorted order.

*Proof Sketch:* By induction on tree size. If tree $T$ has left subtree $L$, root $x$, and right subtree $R$, in-order traversal recursively visits $L$ (all keys smaller than $x$), outputs $x$, and then recursively visits $R$ (all keys larger than $x$).

---

## 3. Search and Insertion Algorithms

### Search Algorithm
```python
def tree_search(x, k):
    while x is not None and k != x.key:
        if k < x.key:
            x = x.left
        else:
            x = x.right
    return x
```
**Complexity:** $O(h)$, where $h$ is the height of the tree.

### Insertion Algorithm
```python
def tree_insert(T, z):
    y = None
    x = T.root
    while x is not None:
        y = x
        if z.key < x.key:
            x = x.left
        else:
            x = x.right
    z.parent = y
    if y is None:
        T.root = z
    elif z.key < y.key:
        y.left = z
    else:
        y.right = z
```
**Complexity:** $O(h)$ comparisons and pointer assignments.

---

## 4. Order Statistics: Minimum, Maximum, and Successor

### Successor Query
The in-order successor of node $x$ is the node with the smallest key greater than $x.\text{key}$.
- **Case 1 (Right Subtree Non-Empty):** Successor is `tree_minimum(x.right)`.
- **Case 2 (Right Subtree Empty):** Successor is the lowest ancestor of $x$ whose left child is also an ancestor of $x$.

*Temporal Timestamp Boundary:* In the lecture recording, the discussion of Order Statistics and Successors concludes precisely at timestamp **18:42**.

---

## 5. Deletion Algorithm

Deleting a node $z$ requires handling three structural topological cases:
1. **Case 1 ($z$ is a leaf):** Nullify parent's pointer to $z$. Cost: $O(1)$.
2. **Case 2 ($z$ has one child):** Splice $z$ out by directly linking $z$'s parent to $z$'s child. Cost: $O(1)$.
3. **Case 3 ($z$ has two children):** Find $z$'s in-order successor $y = \text{tree\_minimum}(z.\text{right})$. Splice $y$ out of its current position and substitute $y$ in place of $z$. Cost: $O(h)$.

---

## 6. Tree Degeneracy and Balancing

If keys are inserted in presorted ascending order (e.g. $[1, 2, 3, 4, 5]$), every key becomes a right child. The tree degenerates into a linear chain of height $h = N - 1$, and all operations degrade to $O(N)$.

To guarantee $O(\log N)$ worst-case performance under arbitrary insertion sequences, dynamic balance invariants are required. Self-balancing architectures such as **AVL Trees** and **Red-Black Trees** utilize local $O(1)$ tree rotations to maintain bounded height.
