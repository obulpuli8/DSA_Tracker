require('dotenv').config();
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

// ─── Inline Models (avoid pre-save hook issues in script) ─────────────────────
const UserSchema = new mongoose.Schema(
  {
    username: String,
    email: String,
    password: String,
    avatar: { type: String, default: '' },
    targetProblems: { type: Number, default: 100 },
    dailyGoal: { type: Number, default: 3 },
    preferredTopics: [String],
    bio: { type: String, default: '' },
  },
  { timestamps: true }
);
const User = mongoose.model('User', UserSchema);

const ProblemSchema = new mongoose.Schema(
  {
    user: mongoose.Schema.Types.ObjectId,
    title: String,
    platform: String,
    difficulty: String,
    topics: [String],
    status: String,
    notes: String,
    timeTaken: Number,
    problemUrl: String,
    solvedAt: Date,
    revisitCount: { type: Number, default: 0 },
    tags: [String],
    approach: String,
    complexity: { time: String, space: String },
  },
  { timestamps: true }
);
const Problem = mongoose.model('Problem', ProblemSchema);

// ─── Seed Users ───────────────────────────────────────────────────────────────
const USERS = [
  {
    username: 'arjun_codes',
    email: 'arjun@algotrack.com',
    password: 'password123',
    bio: 'SWE @ Google | Grinding LeetCode daily 🔥',
    targetProblems: 300,
    dailyGoal: 5,
    preferredTopics: ['Dynamic Programming', 'Graph', 'Tree'],
  },
  {
    username: 'priya_dsa',
    email: 'priya@algotrack.com',
    password: 'password123',
    bio: 'CS student | Aiming for FAANG internships',
    targetProblems: 150,
    dailyGoal: 3,
    preferredTopics: ['Array', 'String', 'Binary Search'],
  },
  {
    username: 'rahul_dev',
    email: 'rahul@algotrack.com',
    password: 'password123',
    bio: 'Backend dev | Learning algorithms on weekends',
    targetProblems: 200,
    dailyGoal: 4,
    preferredTopics: ['Graph', 'Heap', 'Greedy'],
  },
  {
    username: 'sneha_algo',
    email: 'sneha@algotrack.com',
    password: 'password123',
    bio: 'Final year BTech | Interview season started!',
    targetProblems: 250,
    dailyGoal: 6,
    preferredTopics: ['Dynamic Programming', 'Backtracking', 'Tree'],
  },
  {
    username: 'vikram_cp',
    email: 'vikram@algotrack.com',
    password: 'password123',
    bio: 'Competitive programmer | Codeforces Expert',
    targetProblems: 500,
    dailyGoal: 8,
    preferredTopics: ['Segment Tree', 'Bit Manipulation', 'Math'],
  },
  {
    username: 'ananya_tech',
    email: 'ananya@algotrack.com',
    password: 'password123',
    bio: 'ML Engineer transitioning to SWE roles',
    targetProblems: 100,
    dailyGoal: 2,
    preferredTopics: ['Array', 'Hashing', 'Sorting'],
  },
  {
    username: 'karthik_dsa',
    email: 'karthik@algotrack.com',
    password: 'password123',
    bio: 'Placed @ Amazon | Still grinding for fun',
    targetProblems: 400,
    dailyGoal: 5,
    preferredTopics: ['Tree', 'Graph', 'Sliding Window'],
  },
  {
    username: 'divya_solves',
    email: 'divya@algotrack.com',
    password: 'password123',
    bio: 'Product Manager | Brushing up for tech PMs',
    targetProblems: 75,
    dailyGoal: 2,
    preferredTopics: ['Array', 'String', 'Two Pointers'],
  },
  {
    username: 'ravi_fullstack',
    email: 'ravi@algotrack.com',
    password: 'password123',
    bio: 'Fullstack Dev | React + Node + DSA',
    targetProblems: 200,
    dailyGoal: 3,
    preferredTopics: ['Linked List', 'Stack', 'Queue'],
  },
  {
    username: 'meera_coder',
    email: 'meera@algotrack.com',
    password: 'password123',
    bio: 'Self-taught programmer | Day 120 of LeetCode streak',
    targetProblems: 365,
    dailyGoal: 4,
    preferredTopics: ['Dynamic Programming', 'Array', 'Recursion'],
  },
];

// ─── Problem Templates per user ───────────────────────────────────────────────
const PROBLEM_SETS = {
  arjun_codes: [
    { title: 'Longest Increasing Subsequence', platform: 'LeetCode', difficulty: 'Hard', topics: ['Dynamic Programming'], status: 'Solved', timeTaken: 45, notes: 'Classic DP. Use patience sorting for O(n log n).', approach: 'Optimal', complexity: { time: 'O(n log n)', space: 'O(n)' } },
    { title: 'Word Break II', platform: 'LeetCode', difficulty: 'Hard', topics: ['Dynamic Programming', 'Backtracking'], status: 'Solved', timeTaken: 60, notes: 'Memoize with HashMap. Watch out for TLE.', approach: 'Optimal', complexity: { time: 'O(n^2)', space: 'O(n)' } },
    { title: 'Course Schedule II', platform: 'LeetCode', difficulty: 'Medium', topics: ['Graph', 'BFS'], status: 'Solved', timeTaken: 30, notes: 'Topological sort using Kahns algorithm.', approach: 'Optimal', complexity: { time: 'O(V+E)', space: 'O(V)' } },
    { title: 'Alien Dictionary', platform: 'LeetCode', difficulty: 'Hard', topics: ['Graph', 'BFS'], status: 'Revisit', timeTaken: 50, notes: 'Build graph from adjacent word comparisons.', approach: 'Brute Force', complexity: { time: 'O(C)', space: 'O(1)' } },
    { title: 'Serialize and Deserialize Binary Tree', platform: 'LeetCode', difficulty: 'Hard', topics: ['Tree', 'BFS'], status: 'Solved', timeTaken: 55, notes: 'BFS level-order with null markers.', approach: 'Optimal', complexity: { time: 'O(n)', space: 'O(n)' } },
    { title: 'Regular Expression Matching', platform: 'LeetCode', difficulty: 'Hard', topics: ['Dynamic Programming'], status: 'Attempted', timeTaken: 40, notes: 'DP table with . and * handling.', approach: 'Optimal', complexity: { time: 'O(mn)', space: 'O(mn)' } },
    { title: 'Minimum Window Substring', platform: 'LeetCode', difficulty: 'Hard', topics: ['Sliding Window', 'Hashing'], status: 'Solved', timeTaken: 35, notes: 'Two pointers + freq map.', approach: 'Optimal', complexity: { time: 'O(n)', space: 'O(1)' } },
    { title: 'Number of Islands', platform: 'LeetCode', difficulty: 'Medium', topics: ['Graph', 'DFS'], status: 'Solved', timeTaken: 20, notes: 'DFS flood fill.', approach: 'Optimal', complexity: { time: 'O(mn)', space: 'O(mn)' } },
    { title: 'Kth Largest Element in Array', platform: 'LeetCode', difficulty: 'Medium', topics: ['Heap'], status: 'Solved', timeTaken: 15, notes: 'Min-heap of size k.', approach: 'Optimal', complexity: { time: 'O(n log k)', space: 'O(k)' } },
    { title: 'Jump Game II', platform: 'LeetCode', difficulty: 'Medium', topics: ['Greedy'], status: 'Solved', timeTaken: 25, notes: 'Track farthest reachable per step.', approach: 'Optimal', complexity: { time: 'O(n)', space: 'O(1)' } },
    { title: 'Edit Distance', platform: 'LeetCode', difficulty: 'Hard', topics: ['Dynamic Programming'], status: 'Solved', timeTaken: 40, notes: 'Classic Wagner-Fischer DP.', approach: 'Optimal', complexity: { time: 'O(mn)', space: 'O(mn)' } },
    { title: 'Trapping Rain Water', platform: 'LeetCode', difficulty: 'Hard', topics: ['Two Pointers', 'Array'], status: 'Solved', timeTaken: 30, notes: 'Two pointer approach, compute min of max left/right.', approach: 'Space Optimized', complexity: { time: 'O(n)', space: 'O(1)' } },
  ],
  priya_dsa: [
    { title: 'Two Sum', platform: 'LeetCode', difficulty: 'Easy', topics: ['Array', 'Hashing'], status: 'Solved', timeTaken: 10, notes: 'HashMap for O(n) solution.', approach: 'Optimal', complexity: { time: 'O(n)', space: 'O(n)' } },
    { title: 'Valid Parentheses', platform: 'LeetCode', difficulty: 'Easy', topics: ['Stack', 'String'], status: 'Solved', timeTaken: 12, notes: 'Use stack.', approach: 'Optimal', complexity: { time: 'O(n)', space: 'O(n)' } },
    { title: 'Binary Search', platform: 'LeetCode', difficulty: 'Easy', topics: ['Binary Search', 'Array'], status: 'Solved', timeTaken: 8, notes: 'Basic binary search template.', approach: 'Optimal', complexity: { time: 'O(log n)', space: 'O(1)' } },
    { title: 'Merge Sorted Array', platform: 'LeetCode', difficulty: 'Easy', topics: ['Array', 'Two Pointers'], status: 'Solved', timeTaken: 15, notes: 'Fill from end to avoid extra space.', approach: 'Space Optimized', complexity: { time: 'O(m+n)', space: 'O(1)' } },
    { title: 'Longest Common Prefix', platform: 'LeetCode', difficulty: 'Easy', topics: ['String'], status: 'Solved', timeTaken: 10, notes: 'Vertical scanning.', approach: 'Optimal', complexity: { time: 'O(mn)', space: 'O(1)' } },
    { title: 'Find First and Last Position', platform: 'LeetCode', difficulty: 'Medium', topics: ['Binary Search', 'Array'], status: 'Solved', timeTaken: 25, notes: 'Two binary searches — leftmost and rightmost.', approach: 'Optimal', complexity: { time: 'O(log n)', space: 'O(1)' } },
    { title: 'Group Anagrams', platform: 'LeetCode', difficulty: 'Medium', topics: ['String', 'Hashing'], status: 'Solved', timeTaken: 20, notes: 'Sort each word as key.', approach: 'Optimal', complexity: { time: 'O(nk log k)', space: 'O(nk)' } },
    { title: 'Subarray Sum Equals K', platform: 'LeetCode', difficulty: 'Medium', topics: ['Array', 'Hashing'], status: 'Revisit', timeTaken: 30, notes: 'Prefix sum + hashmap.', approach: 'Optimal', complexity: { time: 'O(n)', space: 'O(n)' } },
    { title: 'Spiral Matrix', platform: 'LeetCode', difficulty: 'Medium', topics: ['Array', 'Matrix'], status: 'Solved', timeTaken: 25, notes: 'Layer by layer traversal.', approach: 'Optimal', complexity: { time: 'O(mn)', space: 'O(1)' } },
    { title: 'Rotate Image', platform: 'LeetCode', difficulty: 'Medium', topics: ['Array', 'Matrix'], status: 'Solved', timeTaken: 20, notes: 'Transpose then reverse each row.', approach: 'Space Optimized', complexity: { time: 'O(n^2)', space: 'O(1)' } },
  ],
  rahul_dev: [
    { title: 'Dijkstra Shortest Path', platform: 'GeeksForGeeks', difficulty: 'Hard', topics: ['Graph', 'Heap'], status: 'Solved', timeTaken: 50, notes: 'Priority queue based Dijkstra.', approach: 'Optimal', complexity: { time: 'O((V+E) log V)', space: 'O(V)' } },
    { title: 'Activity Selection Problem', platform: 'GeeksForGeeks', difficulty: 'Medium', topics: ['Greedy'], status: 'Solved', timeTaken: 20, notes: 'Sort by end time, pick non-overlapping.', approach: 'Optimal', complexity: { time: 'O(n log n)', space: 'O(1)' } },
    { title: 'Find Median from Data Stream', platform: 'LeetCode', difficulty: 'Hard', topics: ['Heap'], status: 'Solved', timeTaken: 45, notes: 'Two heaps — max-heap + min-heap.', approach: 'Optimal', complexity: { time: 'O(log n)', space: 'O(n)' } },
    { title: 'Bellman Ford Algorithm', platform: 'GeeksForGeeks', difficulty: 'Medium', topics: ['Graph'], status: 'Solved', timeTaken: 35, notes: 'Relax edges V-1 times.', approach: 'Optimal', complexity: { time: 'O(VE)', space: 'O(V)' } },
    { title: 'Task Scheduler', platform: 'LeetCode', difficulty: 'Medium', topics: ['Greedy', 'Heap'], status: 'Solved', timeTaken: 30, notes: 'Max frequency element determines idle slots.', approach: 'Optimal', complexity: { time: 'O(n)', space: 'O(1)' } },
    { title: 'Clone Graph', platform: 'LeetCode', difficulty: 'Medium', topics: ['Graph', 'BFS'], status: 'Solved', timeTaken: 25, notes: 'BFS + HashMap for visited nodes.', approach: 'Optimal', complexity: { time: 'O(V+E)', space: 'O(V)' } },
    { title: 'Top K Frequent Elements', platform: 'LeetCode', difficulty: 'Medium', topics: ['Heap', 'Hashing'], status: 'Solved', timeTaken: 20, notes: 'Min-heap of size k.', approach: 'Optimal', complexity: { time: 'O(n log k)', space: 'O(n)' } },
    { title: 'Is Graph Bipartite?', platform: 'LeetCode', difficulty: 'Medium', topics: ['Graph', 'BFS'], status: 'Revisit', timeTaken: 35, notes: '2-coloring with BFS.', approach: 'Optimal', complexity: { time: 'O(V+E)', space: 'O(V)' } },
    { title: 'Gas Station', platform: 'LeetCode', difficulty: 'Medium', topics: ['Greedy', 'Array'], status: 'Solved', timeTaken: 25, notes: 'Track total and current surplus.', approach: 'Optimal', complexity: { time: 'O(n)', space: 'O(1)' } },
    { title: 'Prim\'s Minimum Spanning Tree', platform: 'GeeksForGeeks', difficulty: 'Hard', topics: ['Graph', 'Heap'], status: 'Attempted', timeTaken: 55, notes: "Similar to Dijkstra but track min edge weight.", approach: 'Brute Force', complexity: { time: 'O(E log V)', space: 'O(V)' } },
  ],
  sneha_algo: [
    { title: 'N-Queens', platform: 'LeetCode', difficulty: 'Hard', topics: ['Backtracking'], status: 'Solved', timeTaken: 55, notes: 'Row by row placement with column/diagonal tracking.', approach: 'Optimal', complexity: { time: 'O(n!)', space: 'O(n)' } },
    { title: 'Partition Equal Subset Sum', platform: 'LeetCode', difficulty: 'Medium', topics: ['Dynamic Programming'], status: 'Solved', timeTaken: 35, notes: '0/1 Knapsack variant.', approach: 'Optimal', complexity: { time: 'O(n*sum)', space: 'O(sum)' } },
    { title: 'Lowest Common Ancestor', platform: 'LeetCode', difficulty: 'Medium', topics: ['Tree'], status: 'Solved', timeTaken: 25, notes: 'Recurse left and right, if both non-null return root.', approach: 'Optimal', complexity: { time: 'O(n)', space: 'O(n)' } },
    { title: 'Sudoku Solver', platform: 'LeetCode', difficulty: 'Hard', topics: ['Backtracking'], status: 'Solved', timeTaken: 60, notes: 'Try digits 1-9, backtrack on conflict.', approach: 'Brute Force', complexity: { time: 'O(9^m)', space: 'O(1)' } },
    { title: 'Maximum Path Sum in Tree', platform: 'LeetCode', difficulty: 'Hard', topics: ['Tree', 'Dynamic Programming'], status: 'Solved', timeTaken: 40, notes: 'Pass max gain upward, track global max.', approach: 'Optimal', complexity: { time: 'O(n)', space: 'O(n)' } },
    { title: 'Unique Paths II', platform: 'LeetCode', difficulty: 'Medium', topics: ['Dynamic Programming', 'Matrix'], status: 'Solved', timeTaken: 20, notes: 'DP with obstacle check.', approach: 'Optimal', complexity: { time: 'O(mn)', space: 'O(mn)' } },
    { title: 'Combination Sum', platform: 'LeetCode', difficulty: 'Medium', topics: ['Backtracking', 'Array'], status: 'Solved', timeTaken: 25, notes: 'Start from current index to avoid duplicates.', approach: 'Optimal', complexity: { time: 'O(2^n)', space: 'O(n)' } },
    { title: 'Permutations', platform: 'LeetCode', difficulty: 'Medium', topics: ['Backtracking', 'Recursion'], status: 'Solved', timeTaken: 22, notes: 'Swap in-place approach.', approach: 'Optimal', complexity: { time: 'O(n!)', space: 'O(n)' } },
    { title: 'Flatten Binary Tree to Linked List', platform: 'LeetCode', difficulty: 'Medium', topics: ['Tree'], status: 'Revisit', timeTaken: 30, notes: 'Morris traversal or reverse pre-order.', approach: 'Brute Force', complexity: { time: 'O(n)', space: 'O(1)' } },
    { title: 'Decode Ways', platform: 'LeetCode', difficulty: 'Medium', topics: ['Dynamic Programming', 'String'], status: 'Solved', timeTaken: 28, notes: 'DP with last 1 and 2 digit checks.', approach: 'Optimal', complexity: { time: 'O(n)', space: 'O(1)' } },
    { title: 'House Robber II', platform: 'LeetCode', difficulty: 'Medium', topics: ['Dynamic Programming'], status: 'Solved', timeTaken: 22, notes: 'Run House Robber on [0..n-2] and [1..n-1].', approach: 'Optimal', complexity: { time: 'O(n)', space: 'O(1)' } },
  ],
  vikram_cp: [
    { title: 'Range Sum Query - Mutable', platform: 'LeetCode', difficulty: 'Medium', topics: ['Segment Tree'], status: 'Solved', timeTaken: 45, notes: 'Segment tree with point update.', approach: 'Optimal', complexity: { time: 'O(log n)', space: 'O(n)' } },
    { title: 'Count of Smaller Numbers', platform: 'LeetCode', difficulty: 'Hard', topics: ['Bit Manipulation', 'Segment Tree'], status: 'Solved', timeTaken: 60, notes: 'BIT/Fenwick tree approach.', approach: 'Optimal', complexity: { time: 'O(n log n)', space: 'O(n)' } },
    { title: 'Reverse Bits', platform: 'LeetCode', difficulty: 'Easy', topics: ['Bit Manipulation'], status: 'Solved', timeTaken: 10, notes: 'Shift and OR each bit.', approach: 'Optimal', complexity: { time: 'O(1)', space: 'O(1)' } },
    { title: 'Single Number II', platform: 'LeetCode', difficulty: 'Medium', topics: ['Bit Manipulation'], status: 'Solved', timeTaken: 20, notes: 'ones and twos bitmask approach.', approach: 'Optimal', complexity: { time: 'O(n)', space: 'O(1)' } },
    { title: 'Power of Two', platform: 'LeetCode', difficulty: 'Easy', topics: ['Bit Manipulation', 'Math'], status: 'Solved', timeTaken: 5, notes: 'n & (n-1) == 0', approach: 'Optimal', complexity: { time: 'O(1)', space: 'O(1)' } },
    { title: 'Ugly Number II', platform: 'LeetCode', difficulty: 'Medium', topics: ['Math', 'Dynamic Programming'], status: 'Solved', timeTaken: 25, notes: 'Three pointers for 2, 3, 5 multiples.', approach: 'Optimal', complexity: { time: 'O(n)', space: 'O(n)' } },
    { title: 'My Calendar I', platform: 'LeetCode', difficulty: 'Medium', topics: ['Segment Tree'], status: 'Solved', timeTaken: 30, notes: 'TreeMap to find overlaps efficiently.', approach: 'Optimal', complexity: { time: 'O(n log n)', space: 'O(n)' } },
    { title: 'Largest Rectangle in Histogram', platform: 'LeetCode', difficulty: 'Hard', topics: ['Stack', 'Math'], status: 'Solved', timeTaken: 40, notes: 'Monotonic stack — track left/right boundaries.', approach: 'Optimal', complexity: { time: 'O(n)', space: 'O(n)' } },
    { title: 'Max Points on a Line', platform: 'LeetCode', difficulty: 'Hard', topics: ['Math', 'Hashing'], status: 'Attempted', timeTaken: 55, notes: 'GCD normalized slope as HashMap key.', approach: 'Brute Force', complexity: { time: 'O(n^2 log n)', space: 'O(n)' } },
    { title: 'Sqrt(x)', platform: 'LeetCode', difficulty: 'Easy', topics: ['Math', 'Binary Search'], status: 'Solved', timeTaken: 8, notes: 'Binary search on answer.', approach: 'Optimal', complexity: { time: 'O(log x)', space: 'O(1)' } },
    { title: 'Count Primes', platform: 'LeetCode', difficulty: 'Medium', topics: ['Math'], status: 'Solved', timeTaken: 20, notes: 'Sieve of Eratosthenes.', approach: 'Optimal', complexity: { time: 'O(n log log n)', space: 'O(n)' } },
    { title: 'Minimum Number of Taps', platform: 'LeetCode', difficulty: 'Hard', topics: ['Greedy', 'Dynamic Programming'], status: 'Revisit', timeTaken: 60, notes: 'Convert to jump game, greedy approach.', approach: 'Optimal', complexity: { time: 'O(n)', space: 'O(n)' } },
  ],
  ananya_tech: [
    { title: 'Contains Duplicate', platform: 'LeetCode', difficulty: 'Easy', topics: ['Array', 'Hashing'], status: 'Solved', timeTaken: 8, notes: 'HashSet for duplicates.', approach: 'Optimal', complexity: { time: 'O(n)', space: 'O(n)' } },
    { title: 'Best Time to Buy and Sell Stock', platform: 'LeetCode', difficulty: 'Easy', topics: ['Array', 'Greedy'], status: 'Solved', timeTaken: 10, notes: 'Track min price, max profit.', approach: 'Optimal', complexity: { time: 'O(n)', space: 'O(1)' } },
    { title: 'Maximum Subarray', platform: 'LeetCode', difficulty: 'Medium', topics: ['Array', 'Dynamic Programming'], status: 'Solved', timeTaken: 15, notes: "Kadane's algorithm.', approach: 'Optimal", complexity: { time: 'O(n)', space: 'O(1)' } },
    { title: 'Sort Colors', platform: 'LeetCode', difficulty: 'Medium', topics: ['Array', 'Two Pointers', 'Sorting'], status: 'Solved', timeTaken: 18, notes: 'Dutch National Flag algorithm.', approach: 'Optimal', complexity: { time: 'O(n)', space: 'O(1)' } },
    { title: 'Valid Anagram', platform: 'LeetCode', difficulty: 'Easy', topics: ['String', 'Hashing'], status: 'Solved', timeTaken: 8, notes: 'Character frequency map comparison.', approach: 'Optimal', complexity: { time: 'O(n)', space: 'O(1)' } },
    { title: 'Intersection of Two Arrays', platform: 'LeetCode', difficulty: 'Easy', topics: ['Array', 'Hashing'], status: 'Solved', timeTaken: 10, notes: 'Two HashSets.', approach: 'Optimal', complexity: { time: 'O(n+m)', space: 'O(n)' } },
    { title: 'Move Zeroes', platform: 'LeetCode', difficulty: 'Easy', topics: ['Array', 'Two Pointers'], status: 'Solved', timeTaken: 10, notes: 'Slow/fast pointer.', approach: 'Optimal', complexity: { time: 'O(n)', space: 'O(1)' } },
    { title: 'Find the Duplicate Number', platform: 'LeetCode', difficulty: 'Medium', topics: ['Array', 'Two Pointers'], status: 'Revisit', timeTaken: 35, notes: "Floyd's cycle detection on array indices.", approach: 'Optimal', complexity: { time: 'O(n)', space: 'O(1)' } },
    { title: 'Merge Intervals', platform: 'LeetCode', difficulty: 'Medium', topics: ['Array', 'Sorting'], status: 'Solved', timeTaken: 22, notes: 'Sort by start, merge overlapping.', approach: 'Optimal', complexity: { time: 'O(n log n)', space: 'O(n)' } },
  ],
  karthik_dsa: [
    { title: 'Binary Tree Level Order Traversal', platform: 'LeetCode', difficulty: 'Medium', topics: ['Tree', 'BFS'], status: 'Solved', timeTaken: 20, notes: 'Queue-based BFS.', approach: 'Optimal', complexity: { time: 'O(n)', space: 'O(n)' } },
    { title: 'Validate Binary Search Tree', platform: 'LeetCode', difficulty: 'Medium', topics: ['Tree', 'DFS'], status: 'Solved', timeTaken: 22, notes: 'Pass min/max bounds down recursion.', approach: 'Optimal', complexity: { time: 'O(n)', space: 'O(n)' } },
    { title: 'Symmetric Tree', platform: 'LeetCode', difficulty: 'Easy', topics: ['Tree'], status: 'Solved', timeTaken: 15, notes: 'Mirror check recursion.', approach: 'Optimal', complexity: { time: 'O(n)', space: 'O(n)' } },
    { title: 'Path Sum II', platform: 'LeetCode', difficulty: 'Medium', topics: ['Tree', 'Backtracking', 'DFS'], status: 'Solved', timeTaken: 25, notes: 'DFS with path tracking.', approach: 'Optimal', complexity: { time: 'O(n)', space: 'O(n)' } },
    { title: 'Longest Substring Without Repeating Characters', platform: 'LeetCode', difficulty: 'Medium', topics: ['Sliding Window', 'String', 'Hashing'], status: 'Solved', timeTaken: 20, notes: 'Sliding window with HashMap for last index.', approach: 'Optimal', complexity: { time: 'O(n)', space: 'O(min(m,n))' } },
    { title: 'Minimum Depth of Binary Tree', platform: 'LeetCode', difficulty: 'Easy', topics: ['Tree', 'BFS'], status: 'Solved', timeTaken: 12, notes: 'BFS finds shortest path to leaf.', approach: 'Optimal', complexity: { time: 'O(n)', space: 'O(n)' } },
    { title: 'Reconstruct Itinerary', platform: 'LeetCode', difficulty: 'Hard', topics: ['Graph', 'DFS'], status: 'Revisit', timeTaken: 55, notes: "Hierholzer's algorithm for Euler path.", approach: 'Brute Force', complexity: { time: 'O(E log E)', space: 'O(E)' } },
    { title: 'Max Sliding Window', platform: 'LeetCode', difficulty: 'Hard', topics: ['Sliding Window', 'Stack'], status: 'Solved', timeTaken: 40, notes: 'Monotonic deque maintains max in window.', approach: 'Optimal', complexity: { time: 'O(n)', space: 'O(k)' } },
    { title: 'Surrounded Regions', platform: 'LeetCode', difficulty: 'Medium', topics: ['Graph', 'DFS'], status: 'Solved', timeTaken: 28, notes: 'DFS from border O cells to mark safe.', approach: 'Optimal', complexity: { time: 'O(mn)', space: 'O(mn)' } },
    { title: 'Diameter of Binary Tree', platform: 'LeetCode', difficulty: 'Easy', topics: ['Tree', 'DFS'], status: 'Solved', timeTaken: 15, notes: 'Track max left + right depth at each node.', approach: 'Optimal', complexity: { time: 'O(n)', space: 'O(n)' } },
    { title: 'Minimum Size Subarray Sum', platform: 'LeetCode', difficulty: 'Medium', topics: ['Sliding Window', 'Two Pointers'], status: 'Solved', timeTaken: 20, notes: 'Expand right, shrink left when sum >= target.', approach: 'Optimal', complexity: { time: 'O(n)', space: 'O(1)' } },
  ],
  divya_solves: [
    { title: 'Reverse String', platform: 'LeetCode', difficulty: 'Easy', topics: ['String', 'Two Pointers'], status: 'Solved', timeTaken: 5, notes: 'Two pointer swap.', approach: 'Optimal', complexity: { time: 'O(n)', space: 'O(1)' } },
    { title: 'Palindrome Number', platform: 'LeetCode', difficulty: 'Easy', topics: ['Math'], status: 'Solved', timeTaken: 8, notes: 'Reverse second half and compare.', approach: 'Optimal', complexity: { time: 'O(log n)', space: 'O(1)' } },
    { title: 'First Unique Character in String', platform: 'LeetCode', difficulty: 'Easy', topics: ['String', 'Hashing'], status: 'Solved', timeTaken: 10, notes: 'Frequency map, find first with count 1.', approach: 'Optimal', complexity: { time: 'O(n)', space: 'O(1)' } },
    { title: 'Maximum Depth of Binary Tree', platform: 'LeetCode', difficulty: 'Easy', topics: ['Tree', 'DFS'], status: 'Solved', timeTaken: 10, notes: '1 + max(left, right).', approach: 'Optimal', complexity: { time: 'O(n)', space: 'O(n)' } },
    { title: 'Climbing Stairs', platform: 'LeetCode', difficulty: 'Easy', topics: ['Dynamic Programming'], status: 'Solved', timeTaken: 10, notes: 'Fibonacci-like DP.', approach: 'Space Optimized', complexity: { time: 'O(n)', space: 'O(1)' } },
    { title: 'Remove Duplicates from Sorted Array', platform: 'LeetCode', difficulty: 'Easy', topics: ['Array', 'Two Pointers'], status: 'Solved', timeTaken: 8, notes: 'Slow pointer tracks unique position.', approach: 'Optimal', complexity: { time: 'O(n)', space: 'O(1)' } },
    { title: 'Missing Number', platform: 'LeetCode', difficulty: 'Easy', topics: ['Array', 'Math'], status: 'Solved', timeTaken: 8, notes: 'Sum formula n*(n+1)/2 minus array sum.', approach: 'Optimal', complexity: { time: 'O(n)', space: 'O(1)' } },
  ],
  ravi_fullstack: [
    { title: 'Reverse Linked List', platform: 'LeetCode', difficulty: 'Easy', topics: ['Linked List'], status: 'Solved', timeTaken: 12, notes: 'Three pointer iterative.', approach: 'Optimal', complexity: { time: 'O(n)', space: 'O(1)' } },
    { title: 'Merge Two Sorted Lists', platform: 'LeetCode', difficulty: 'Easy', topics: ['Linked List'], status: 'Solved', timeTaken: 15, notes: 'Dummy head + compare and advance.', approach: 'Optimal', complexity: { time: 'O(m+n)', space: 'O(1)' } },
    { title: 'Implement Stack Using Queues', platform: 'LeetCode', difficulty: 'Easy', topics: ['Stack', 'Queue'], status: 'Solved', timeTaken: 15, notes: 'One queue, rotate on push.', approach: 'Optimal', complexity: { time: 'O(n)', space: 'O(n)' } },
    { title: 'Linked List Cycle', platform: 'LeetCode', difficulty: 'Easy', topics: ['Linked List', 'Two Pointers'], status: 'Solved', timeTaken: 12, notes: "Floyd's cycle detection.', approach: 'Optimal", complexity: { time: 'O(n)', space: 'O(1)' } },
    { title: 'LRU Cache', platform: 'LeetCode', difficulty: 'Medium', topics: ['Linked List', 'Hashing'], status: 'Solved', timeTaken: 45, notes: 'DoublyLinkedList + HashMap for O(1) ops.', approach: 'Optimal', complexity: { time: 'O(1)', space: 'O(n)' } },
    { title: 'Design Circular Queue', platform: 'LeetCode', difficulty: 'Medium', topics: ['Queue', 'Array'], status: 'Solved', timeTaken: 30, notes: 'Array with head/tail pointers.', approach: 'Optimal', complexity: { time: 'O(1)', space: 'O(k)' } },
    { title: 'Remove Nth Node From End of List', platform: 'LeetCode', difficulty: 'Medium', topics: ['Linked List', 'Two Pointers'], status: 'Solved', timeTaken: 20, notes: 'Two pointer with n gap.', approach: 'Optimal', complexity: { time: 'O(n)', space: 'O(1)' } },
    { title: 'Reorder List', platform: 'LeetCode', difficulty: 'Medium', topics: ['Linked List', 'Two Pointers'], status: 'Revisit', timeTaken: 35, notes: 'Find middle, reverse second half, merge.', approach: 'Optimal', complexity: { time: 'O(n)', space: 'O(1)' } },
    { title: 'Sort List', platform: 'LeetCode', difficulty: 'Medium', topics: ['Linked List', 'Sorting', 'Divide & Conquer'], status: 'Solved', timeTaken: 30, notes: 'Merge sort on linked list.', approach: 'Optimal', complexity: { time: 'O(n log n)', space: 'O(log n)' } },
    { title: 'Daily Temperatures', platform: 'LeetCode', difficulty: 'Medium', topics: ['Stack', 'Array'], status: 'Solved', timeTaken: 22, notes: 'Monotonic decreasing stack.', approach: 'Optimal', complexity: { time: 'O(n)', space: 'O(n)' } },
  ],
  meera_coder: [
    { title: 'Fibonacci Number', platform: 'LeetCode', difficulty: 'Easy', topics: ['Recursion', 'Dynamic Programming'], status: 'Solved', timeTaken: 8, notes: 'Memoization or iterative DP.', approach: 'Space Optimized', complexity: { time: 'O(n)', space: 'O(1)' } },
    { title: 'Pascal\'s Triangle', platform: 'LeetCode', difficulty: 'Easy', topics: ['Array', 'Dynamic Programming'], status: 'Solved', timeTaken: 10, notes: 'Each row depends on previous.', approach: 'Optimal', complexity: { time: 'O(n^2)', space: 'O(n^2)' } },
    { title: 'Coin Change', platform: 'LeetCode', difficulty: 'Medium', topics: ['Dynamic Programming', 'Array'], status: 'Solved', timeTaken: 30, notes: 'Bottom-up DP, min coins for each amount.', approach: 'Optimal', complexity: { time: 'O(amount*n)', space: 'O(amount)' } },
    { title: 'Longest Palindromic Substring', platform: 'LeetCode', difficulty: 'Medium', topics: ['Dynamic Programming', 'String'], status: 'Solved', timeTaken: 35, notes: 'Expand around center approach.', approach: 'Space Optimized', complexity: { time: 'O(n^2)', space: 'O(1)' } },
    { title: 'Triangle', platform: 'LeetCode', difficulty: 'Medium', topics: ['Dynamic Programming', 'Array'], status: 'Solved', timeTaken: 22, notes: 'Bottom-up DP in triangle array.', approach: 'Space Optimized', complexity: { time: 'O(n^2)', space: 'O(n)' } },
    { title: 'Minimum Path Sum', platform: 'LeetCode', difficulty: 'Medium', topics: ['Dynamic Programming', 'Matrix'], status: 'Solved', timeTaken: 20, notes: 'Fill DP grid in-place.', approach: 'Space Optimized', complexity: { time: 'O(mn)', space: 'O(1)' } },
    { title: 'Stone Game', platform: 'LeetCode', difficulty: 'Medium', topics: ['Dynamic Programming', 'Math'], status: 'Solved', timeTaken: 25, notes: 'First player always wins (math proof).', approach: 'Optimal', complexity: { time: 'O(1)', space: 'O(1)' } },
    { title: 'Generate Parentheses', platform: 'LeetCode', difficulty: 'Medium', topics: ['Recursion', 'Backtracking', 'String'], status: 'Solved', timeTaken: 25, notes: 'Track open/close counts, backtrack.', approach: 'Optimal', complexity: { time: 'O(4^n/sqrt(n))', space: 'O(n)' } },
    { title: 'Count and Say', platform: 'LeetCode', difficulty: 'Medium', topics: ['String', 'Recursion'], status: 'Revisit', timeTaken: 20, notes: 'Iterate over chars counting consecutive runs.', approach: 'Brute Force', complexity: { time: 'O(n*m)', space: 'O(m)' } },
    { title: 'Letter Combinations of Phone Number', platform: 'LeetCode', difficulty: 'Medium', topics: ['Backtracking', 'Recursion'], status: 'Solved', timeTaken: 20, notes: 'Map digits to chars, DFS backtracking.', approach: 'Optimal', complexity: { time: 'O(4^n)', space: 'O(n)' } },
    { title: 'Knight\'s Tour', platform: 'GeeksForGeeks', difficulty: 'Hard', topics: ['Backtracking', 'Recursion'], status: 'Attempted', timeTaken: 60, notes: 'Warnsdorff heuristic for better pruning.', approach: 'Brute Force', complexity: { time: 'O(8^(n^2))', space: 'O(n^2)' } },
  ],
};

// ─── Generate realistic solvedAt dates (spread over last 90 days) ─────────────
function randomDate(daysBack = 90) {
  const d = new Date();
  d.setDate(d.getDate() - Math.floor(Math.random() * daysBack));
  d.setHours(Math.floor(Math.random() * 14) + 7); // 7am-9pm
  return d;
}

// ─── Main Seed Function ───────────────────────────────────────────────────────
async function seed() {
  await mongoose.connect(process.env.MONGO_URI);
  console.log('✅ MongoDB Connected\n');

  // Clear existing seeded users (by email pattern)
  const seedEmails = USERS.map(u => u.email);
  const deleted = await User.deleteMany({ email: { $in: seedEmails } });
  if (deleted.deletedCount > 0) {
    const deletedUsers = await User.find({ email: { $in: seedEmails } });
    // Also remove their problems
    const existingIds = deletedUsers.map(u => u._id);
    await Problem.deleteMany({ user: { $in: existingIds } });
    console.log(`🗑️  Cleared ${deleted.deletedCount} existing seed users\n`);
  }

  let totalProblems = 0;

  for (const userData of USERS) {
    // Hash password manually (bypassing pre-save hook issues)
    const hashedPassword = await bcrypt.hash(userData.password, 12);

    const user = await User.create({
      username: userData.username,
      email: userData.email,
      password: hashedPassword,
      bio: userData.bio,
      targetProblems: userData.targetProblems,
      dailyGoal: userData.dailyGoal,
      preferredTopics: userData.preferredTopics,
    });

    const problems = PROBLEM_SETS[userData.username] || [];
    const problemDocs = problems.map(p => ({
      ...p,
      user: user._id,
      solvedAt: randomDate(90),
      problemUrl: `https://leetcode.com/problems/${p.title.toLowerCase().replace(/[^a-z0-9]+/g, '-')}/`,
    }));

    if (problemDocs.length > 0) {
      await Problem.insertMany(problemDocs);
    }

    totalProblems += problemDocs.length;
    console.log(`👤 ${userData.username.padEnd(18)} → ${problemDocs.length} problems seeded`);
  }

  console.log('\n─────────────────────────────────────────');
  console.log(`✅ Seeded ${USERS.length} users with ${totalProblems} total problems`);
  console.log('─────────────────────────────────────────');
  console.log('\n🔐 All users use password: password123\n');

  USERS.forEach(u => {
    console.log(`  📧 ${u.email.padEnd(30)} 🔑 password123`);
  });

  console.log('\n🚀 Start servers and test at http://localhost:5173\n');
  await mongoose.disconnect();
  process.exit(0);
}

seed().catch(err => {
  console.error('❌ Seed failed:', err.message);
  process.exit(1);
});
