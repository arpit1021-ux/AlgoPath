export interface SeedProblem {
  id: number;
  title: string;
  titleSlug: string;
  difficulty: "EASY" | "MEDIUM" | "HARD";
  acceptanceRate: number;
  likes: number;
  dislikes: number;
  isPremium: boolean;
  tags: string[];
  companies: string[];
}

const RAW: Array<[number, string, string, "EASY" | "MEDIUM" | "HARD", number, number, number, boolean, string[], string[]]> = [
  // ─── Arrays ─────────────────────────────────────────
  [1, "Two Sum", "two-sum", "EASY", 49.5, 32000, 1200, false, ["Arrays", "Hashing"], ["Google", "Amazon", "Meta", "Apple", "Microsoft"]],
  [15, "3Sum", "3sum", "MEDIUM", 32.8, 24000, 800, false, ["Arrays", "Two Pointers", "Sorting"], ["Amazon", "Meta", "Microsoft", "Bloomberg"]],
  [26, "Remove Duplicates from Sorted Array", "remove-duplicates-from-sorted-array", "EASY", 55.2, 18000, 400, false, ["Arrays", "Two Pointers"], ["Microsoft", "Amazon"]],
  [27, "Remove Element", "remove-element", "EASY", 58.1, 8000, 200, false, ["Arrays", "Two Pointers"], ["Amazon"]],
  [35, "Search Insert Position", "search-insert-position", "EASY", 44.2, 16000, 500, false, ["Arrays", "Binary Search"], ["Amazon", "Microsoft"]],
  [53, "Maximum Subarray", "maximum-subarray", "MEDIUM", 50.2, 30000, 1300, false, ["Arrays", "Dynamic Programming"], ["Google", "Amazon", "Meta", "Microsoft", "Apple", "Adobe"]],
  [56, "Merge Intervals", "merge-intervals", "MEDIUM", 46.5, 22000, 700, false, ["Arrays", "Sorting"], ["Google", "Meta", "Amazon", "Microsoft", "Bloomberg"]],
  [75, "Sort Colors", "sort-colors", "MEDIUM", 60.8, 16000, 500, false, ["Arrays", "Two Pointers", "Sorting"], ["Meta", "Amazon", "Microsoft"]],
  [88, "Merge Sorted Array", "merge-sorted-array", "EASY", 50.1, 14000, 400, false, ["Arrays", "Two Pointers"], ["Amazon", "Microsoft", "Google"]],
  [118, "Pascal's Triangle", "pascals-triangle", "EASY", 73.2, 12000, 300, false, ["Arrays", "Dynamic Programming"], ["Amazon", "Apple"]],
  [121, "Best Time to Buy and Sell Stock", "best-time-to-buy-and-sell-stock", "EASY", 54.3, 28000, 900, false, ["Arrays", "Dynamic Programming"], ["Amazon", "Meta", "Google", "Microsoft", "Apple", "Goldman Sachs", "Bloomberg"]],
  [122, "Best Time to Buy and Sell Stock II", "best-time-to-buy-and-sell-stock-ii", "MEDIUM", 64.2, 14000, 500, false, ["Arrays", "Dynamic Programming", "Greedy"], ["Amazon", "Google", "Meta"]],
  [136, "Single Number", "single-number", "EASY", 73.5, 18000, 400, false, ["Arrays", "Bit Manipulation"], ["Amazon", "Google", "Microsoft", "Apple"]],
  [169, "Majority Element", "majority-element", "EASY", 64.2, 16000, 500, false, ["Arrays", "Hashing", "Sorting"], ["Amazon", "Google", "Meta", "Microsoft"]],
  [189, "Rotate Array", "rotate-array", "MEDIUM", 39.5, 16000, 700, false, ["Arrays", "Math"], ["Amazon", "Microsoft", "Bloomberg"]],
  [217, "Contains Duplicate", "contains-duplicate", "EASY", 61.2, 20000, 600, false, ["Arrays", "Hashing"], ["Amazon", "Apple", "Google", "Microsoft"]],
  [238, "Product of Array Except Self", "product-of-array-except-self", "MEDIUM", 65.2, 22000, 700, false, ["Arrays", "Prefix Sum"], ["Amazon", "Meta", "Microsoft", "Apple", "Google", "Bloomberg"]],
  [283, "Move Zeroes", "move-zeroes", "EASY", 61.5, 18000, 500, false, ["Arrays", "Two Pointers"], ["Amazon", "Meta", "Microsoft", "Apple"]],
  [349, "Intersection of Two Arrays", "intersection-of-two-arrays", "EASY", 72.5, 8000, 200, false, ["Arrays", "Hashing"], ["Amazon", "Google", "Microsoft"]],
  [448, "Find All Numbers Disappeared in an Array", "find-all-numbers-disappeared-in-an-array", "EASY", 63.5, 8000, 200, false, ["Arrays", "Hashing"], ["Amazon"]],

  // ─── Strings ────────────────────────────────────────
  [3, "Longest Substring Without Repeating Characters", "longest-substring-without-repeating-characters", "MEDIUM", 34.2, 30000, 1200, false, ["Strings", "Sliding Window", "Hashing"], ["Amazon", "Meta", "Google", "Microsoft", "Bloomberg", "Apple", "Atlassian"]],
  [5, "Longest Palindromic Substring", "longest-palindromic-substring", "MEDIUM", 33.2, 26000, 1100, false, ["Strings", "Dynamic Programming"], ["Amazon", "Meta", "Microsoft", "Bloomberg", "Apple"]],
  [6, "Zigzag Conversion", "zigzag-conversion", "MEDIUM", 47.5, 8000, 300, false, ["Strings"], ["Amazon"]],
  [8, "String to Integer (atoi)", "string-to-integer-atoi", "MEDIUM", 18.5, 14000, 600, false, ["Strings"], ["Amazon", "Meta", "Microsoft", "Apple"]],
  [14, "Longest Common Prefix", "longest-common-prefix", "EASY", 42.1, 16000, 500, false, ["Strings"], ["Amazon", "Google", "Microsoft", "Apple"]],
  [20, "Valid Parentheses", "valid-parentheses", "EASY", 42.2, 24000, 800, false, ["Strings", "Stack"], ["Amazon", "Meta", "Google", "Microsoft", "Bloomberg", "Apple", "Uber", "Adobe"]],
  [28, "Find the Index of the First Occurrence in a String", "find-the-index-of-the-first-occurrence-in-a-string", "EASY", 42.5, 6000, 200, false, ["Strings", "Two Pointers"], ["Amazon"]],
  [49, "Group Anagrams", "group-anagrams", "MEDIUM", 67.2, 20000, 600, false, ["Strings", "Hashing", "Sorting"], ["Amazon", "Google", "Meta", "Microsoft", "Apple", "Bloomberg"]],
  [76, "Minimum Window Substring", "minimum-window-substring", "HARD", 41.5, 18000, 800, false, ["Strings", "Sliding Window", "Hashing"], ["Meta", "Amazon", "Microsoft", "Uber", "LinkedIn"]],
  [125, "Valid Palindrome", "valid-palindrome", "EASY", 46.2, 12000, 400, false, ["Strings", "Two Pointers"], ["Amazon", "Meta", "Microsoft", "Apple"]],
  [242, "Valid Anagram", "valid-anagram", "EASY", 63.5, 16000, 400, false, ["Strings", "Hashing", "Sorting"], ["Amazon", "Meta", "Google", "Microsoft", "Apple"]],
  [344, "Reverse String", "reverse-string", "EASY", 77.5, 16000, 300, false, ["Strings", "Two Pointers"], ["Amazon", "Meta", "Microsoft", "Apple"]],
  [409, "Longest Palindrome", "longest-palindrome", "EASY", 54.2, 6000, 200, false, ["Strings", "Hashing"], ["Amazon"]],

  // ─── Hashing ────────────────────────────────────────
  [1, "Two Sum", "two-sum", "EASY", 49.5, 32000, 1200, false, ["Arrays", "Hashing"], ["Google", "Amazon", "Meta", "Apple", "Microsoft"]],
  [36, "Valid Sudoku", "valid-sudoku", "MEDIUM", 58.2, 14000, 500, false, ["Hashing", "Arrays"], ["Amazon", "Google", "Apple", "Microsoft"]],
  [49, "Group Anagrams", "group-anagrams", "MEDIUM", 67.2, 20000, 600, false, ["Strings", "Hashing", "Sorting"], ["Amazon", "Google", "Meta", "Microsoft", "Apple", "Bloomberg"]],
  [128, "Longest Consecutive Sequence", "longest-consecutive-sequence", "MEDIUM", 48.2, 16000, 600, false, ["Arrays", "Hashing"], ["Google", "Amazon", "Meta", "Microsoft"]],
  [217, "Contains Duplicate", "contains-duplicate", "EASY", 61.2, 20000, 600, false, ["Arrays", "Hashing"], ["Amazon", "Apple", "Google", "Microsoft"]],
  [242, "Valid Anagram", "valid-anagram", "EASY", 63.5, 16000, 400, false, ["Strings", "Hashing", "Sorting"], ["Amazon", "Meta", "Google", "Microsoft", "Apple"]],
  [347, "Top K Frequent Elements", "top-k-frequent-elements", "MEDIUM", 63.5, 16000, 500, false, ["Arrays", "Hashing", "Heap"], ["Amazon", "Meta", "Google", "Microsoft", "Apple"]],
  [383, "Ransom Note", "ransom-note", "EASY", 58.2, 6000, 200, false, ["Strings", "Hashing"], ["Amazon"]],
  [409, "Longest Palindrome", "longest-palindrome", "EASY", 54.2, 6000, 200, false, ["Strings", "Hashing"], ["Amazon"]],
  [451, "Sort Characters By Frequency", "sort-characters-by-frequency", "MEDIUM", 68.2, 8000, 300, false, ["Strings", "Hashing", "Sorting"], ["Amazon", "Meta"]],

  // ─── Linked List ────────────────────────────────────
  [2, "Add Two Numbers", "add-two-numbers", "MEDIUM", 41.2, 26000, 1100, false, ["Linked List", "Math"], ["Amazon", "Meta", "Microsoft", "Bloomberg", "Apple"]],
  [19, "Remove Nth Node From End of List", "remove-nth-node-from-end-of-list", "MEDIUM", 44.2, 18000, 700, false, ["Linked List", "Two Pointers"], ["Amazon", "Meta", "Microsoft", "Bloomberg"]],
  [21, "Merge Two Sorted Lists", "merge-two-sorted-lists", "EASY", 63.2, 24000, 700, false, ["Linked List"], ["Amazon", "Microsoft", "Google", "Meta", "Apple"]],
  [23, "Merge k Sorted Lists", "merge-k-sorted-lists", "HARD", 55.2, 22000, 800, false, ["Linked List", "Heap", "Divide and Conquer"], ["Amazon", "Meta", "Google", "Microsoft", "Bloomberg"]],
  [141, "Linked List Cycle", "linked-list-cycle", "EASY", 47.2, 16000, 500, false, ["Linked List", "Two Pointers"], ["Amazon", "Meta", "Microsoft", "Bloomberg"]],
  [142, "Linked List Cycle II", "linked-list-cycle-ii", "MEDIUM", 44.2, 12000, 500, false, ["Linked List", "Two Pointers"], ["Amazon", "Microsoft"]],
  [143, "Reorder List", "reorder-list", "MEDIUM", 54.2, 10000, 400, false, ["Linked List", "Stack"], ["Amazon", "Meta"]],
  [146, "LRU Cache", "lru-cache", "MEDIUM", 42.2, 18000, 800, false, ["Linked List", "Hashing", "Design"], ["Amazon", "Meta", "Google", "Microsoft", "Apple", "Bloomberg", "Uber"]],
  [160, "Intersection of Two Linked Lists", "intersection-of-two-linked-lists", "EASY", 55.2, 12000, 400, false, ["Linked List", "Two Pointers"], ["Amazon", "Microsoft", "Google"]],
  [206, "Reverse Linked List", "reverse-linked-list", "EASY", 73.5, 24000, 600, false, ["Linked List"], ["Amazon", "Meta", "Google", "Microsoft", "Apple", "Bloomberg", "Uber", "Adobe"]],
  [234, "Palindrome Linked List", "palindrome-linked-list", "EASY", 49.2, 14000, 500, false, ["Linked List", "Stack", "Two Pointers"], ["Amazon", "Microsoft"]],
  [287, "Find the Duplicate Number", "find-the-duplicate-number", "MEDIUM", 59.2, 12000, 400, false, ["Linked List", "Two Pointers", "Binary Search"], ["Amazon", "Google"]],

  // ─── Stack ──────────────────────────────────────────
  [20, "Valid Parentheses", "valid-parentheses", "EASY", 42.2, 24000, 800, false, ["Strings", "Stack"], ["Amazon", "Meta", "Google", "Microsoft", "Bloomberg", "Apple", "Uber", "Adobe"]],
  [155, "Min Stack", "min-stack", "MEDIUM", 53.2, 14000, 500, false, ["Stack", "Design"], ["Amazon", "Google", "Microsoft", "Bloomberg"]],
  [225, "Implement Stack using Queues", "implement-stack-using-queues", "EASY", 63.2, 6000, 200, false, ["Stack", "Queue", "Design"], ["Amazon"]],
  [394, "Decode String", "decode-string", "MEDIUM", 58.2, 12000, 400, false, ["Stack", "Strings"], ["Amazon", "Meta", "Google", "Microsoft"]],
  [739, "Daily Temperatures", "daily-temperatures", "MEDIUM", 65.2, 12000, 400, false, ["Stack", "Monotonic Stack"], ["Amazon", "Google", "Bloomberg"]],
  [853, "Car Fleet", "car-fleet", "MEDIUM", 48.2, 4000, 200, false, ["Stack", "Sorting"], ["Amazon"]],

  // ─── Queue ──────────────────────────────────────────
  [225, "Implement Stack using Queues", "implement-stack-using-queues", "EASY", 63.2, 6000, 200, false, ["Stack", "Queue", "Design"], ["Amazon"]],
  [232, "Implement Queue using Stacks", "implement-queue-using-stacks", "EASY", 64.2, 8000, 200, false, ["Stack", "Queue", "Design"], ["Amazon", "Microsoft"]],
  [346, "Moving Average from Data Stream", "moving-average-from-data-stream", "EASY", 75.2, 6000, 200, false, ["Queue", "Design"], ["Amazon", "Google"]],

  // ─── Trees ──────────────────────────────────────────
  [94, "Binary Tree Inorder Traversal", "binary-tree-inorder-traversal", "EASY", 74.2, 14000, 400, false, ["Trees", "Stack"], ["Amazon", "Microsoft", "Google"]],
  [98, "Validate Binary Search Tree", "validate-binary-search-tree", "MEDIUM", 32.2, 18000, 700, false, ["Trees", "BST"], ["Amazon", "Meta", "Google", "Microsoft", "Bloomberg"]],
  [100, "Same Tree", "same-tree", "EASY", 58.2, 10000, 300, false, ["Trees", "BFS/DFS"], ["Amazon", "Microsoft"]],
  [101, "Symmetric Tree", "symmetric-tree", "EASY", 54.2, 14000, 400, false, ["Trees", "BFS/DFS"], ["Amazon", "Microsoft", "Google", "Bloomberg"]],
  [102, "Binary Tree Level Order Traversal", "binary-tree-level-order-traversal", "MEDIUM", 65.2, 16000, 500, false, ["Trees", "BFS"], ["Amazon", "Meta", "Google", "Microsoft", "Bloomberg"]],
  [104, "Maximum Depth of Binary Tree", "maximum-depth-of-binary-tree", "EASY", 73.2, 16000, 400, false, ["Trees", "BFS/DFS"], ["Amazon", "Google", "Microsoft", "Apple"]],
  [105, "Construct Binary Tree from Preorder and Inorder Traversal", "construct-binary-tree-from-preorder-and-inorder-traversal", "MEDIUM", 62.2, 12000, 500, false, ["Trees", "Array", "BFS/DFS"], ["Amazon", "Meta", "Microsoft"]],
  [110, "Balanced Binary Tree", "balanced-binary-tree", "EASY", 50.2, 10000, 300, false, ["Trees", "BFS/DFS"], ["Amazon", "Google"]],
  [114, "Flatten Binary Tree to Linked List", "flatten-binary-tree-to-linked-list", "MEDIUM", 63.2, 10000, 400, false, ["Trees", "Linked List", "Stack"], ["Amazon", "Meta", "Microsoft"]],
  [124, "Binary Tree Maximum Path Sum", "binary-tree-maximum-path-sum", "HARD", 39.2, 14000, 600, false, ["Trees", "Dynamic Programming"], ["Meta", "Amazon", "Google", "Microsoft", "Bloomberg"]],
  [199, "Binary Tree Right Side View", "binary-tree-right-side-view", "MEDIUM", 62.2, 12000, 400, false, ["Trees", "BFS"], ["Meta", "Amazon", "Google", "Microsoft"]],
  [226, "Invert Binary Tree", "invert-binary-tree", "EASY", 75.2, 16000, 400, false, ["Trees", "BFS/DFS"], ["Amazon", "Google", "Microsoft", "Bloomberg"]],
  [230, "Kth Smallest Element in a BST", "kth-smallest-element-in-a-bst", "MEDIUM", 70.2, 12000, 400, false, ["Trees", "BST"], ["Amazon", "Meta", "Google", "Microsoft"]],
  [236, "Lowest Common Ancestor of a Binary Tree", "lowest-common-ancestor-of-a-binary-tree", "MEDIUM", 60.2, 16000, 600, false, ["Trees", "BFS/DFS"], ["Amazon", "Meta", "Google", "Microsoft", "Bloomberg", "Apple"]],
  [297, "Serialize and Deserialize Binary Tree", "serialize-and-deserialize-binary-tree", "HARD", 55.2, 10000, 500, false, ["Trees", "BFS/DFS", "Design"], ["Amazon", "Meta", "Google", "Microsoft", "Bloomberg", "Uber"]],
  [437, "Path Sum III", "path-sum-iii", "MEDIUM", 49.2, 10000, 400, false, ["Trees", "BFS/DFS"], ["Amazon", "Google"]],
  [543, "Diameter of Binary Tree", "diameter-of-binary-tree", "EASY", 58.2, 12000, 400, false, ["Trees", "BFS/DFS"], ["Amazon", "Meta", "Google"]],

  // ─── Graphs ─────────────────────────────────────────
  [133, "Clone Graph", "clone-graph", "MEDIUM", 55.2, 10000, 400, false, ["Graphs", "BFS/DFS", "Hashing"], ["Meta", "Amazon", "Google", "Microsoft", "Bloomberg"]],
  [200, "Number of Islands", "number-of-islands", "MEDIUM", 57.2, 20000, 700, false, ["Graphs", "BFS/DFS"], ["Amazon", "Meta", "Google", "Microsoft", "Bloomberg", "Apple", "Uber", "LinkedIn"]],
  [207, "Course Schedule", "course-schedule", "MEDIUM", 45.2, 16000, 600, false, ["Graphs", "BFS/DFS", "Topological Sort"], ["Amazon", "Meta", "Google", "Microsoft", "Bloomberg", "Apple"]],
  [210, "Course Schedule II", "course-schedule-ii", "MEDIUM", 48.2, 10000, 400, false, ["Graphs", "BFS/DFS", "Topological Sort"], ["Amazon", "Meta", "Google", "Microsoft"]],
  [417, "Pacific Atlantic Water Flow", "pacific-atlantic-water-flow", "MEDIUM", 54.2, 6000, 300, false, ["Graphs", "BFS/DFS"], ["Amazon", "Google", "Meta"]],
  [695, "Max Area of Island", "max-area-of-island", "MEDIUM", 67.2, 8000, 300, false, ["Graphs", "BFS/DFS"], ["Amazon", "Google"]],
  [994, "Rotting Oranges", "rotting-oranges", "MEDIUM", 54.2, 8000, 300, false, ["Graphs", "BFS"], ["Amazon", "Google", "Microsoft"]],

  // ─── Heap ───────────────────────────────────────────
  [23, "Merge k Sorted Lists", "merge-k-sorted-lists", "HARD", 55.2, 22000, 800, false, ["Linked List", "Heap", "Divide and Conquer"], ["Amazon", "Meta", "Google", "Microsoft", "Bloomberg"]],
  [215, "Kth Largest Element in an Array", "kth-largest-element-in-an-array", "MEDIUM", 64.2, 16000, 600, false, ["Arrays", "Heap", "Sorting"], ["Amazon", "Meta", "Google", "Microsoft", "Bloomberg"]],
  [295, "Find Median from Data Stream", "find-median-from-data-stream", "HARD", 50.2, 12000, 500, false, ["Heap", "Design"], ["Amazon", "Meta", "Google", "Microsoft", "Apple", "Bloomberg"]],
  [347, "Top K Frequent Elements", "top-k-frequent-elements", "MEDIUM", 63.5, 16000, 500, false, ["Arrays", "Hashing", "Heap"], ["Amazon", "Meta", "Google", "Microsoft", "Apple"]],
  [621, "Task Scheduler", "task-scheduler", "MEDIUM", 56.2, 10000, 400, false, ["Arrays", "Heap", "Greedy"], ["Amazon", "Meta", "Google", "Microsoft"]],
  [703, "Kth Largest Element in a Stream", "kth-largest-element-in-a-stream", "EASY", 71.2, 6000, 200, false, ["Heap", "Design"], ["Amazon"]],

  // ─── Trie ───────────────────────────────────────────
  [208, "Implement Trie (Prefix Tree)", "implement-trie-prefix-tree", "MEDIUM", 65.2, 12000, 400, false, ["Trie", "Design"], ["Amazon", "Google", "Microsoft", "Apple", "Bloomberg"]],
  [211, "Design Add and Search Words Data Structure", "design-add-and-search-words-data-structure", "MEDIUM", 42.2, 6000, 300, false, ["Trie", "Design", "BFS/DFS"], ["Amazon", "Meta"]],
  [212, "Word Search II", "word-search-ii", "HARD", 40.2, 8000, 400, false, ["Trie", "Backtracking"], ["Amazon", "Meta", "Google", "Microsoft"]],

  // ─── Greedy ─────────────────────────────────────────
  [55, "Jump Game", "jump-game", "MEDIUM", 38.2, 16000, 700, false, ["Arrays", "Greedy", "Dynamic Programming"], ["Amazon", "Meta", "Google", "Microsoft", "Apple"]],
  [134, "Gas Station", "gas-station", "MEDIUM", 44.2, 10000, 400, false, ["Arrays", "Greedy"], ["Amazon", "Google", "Microsoft"]],
  [135, "Candy", "candy", "HARD", 40.2, 6000, 300, false, ["Arrays", "Greedy"], ["Amazon", "Google"]],
  [322, "Coin Change", "coin-change", "MEDIUM", 42.2, 20000, 700, false, ["Arrays", "Greedy", "Dynamic Programming"], ["Amazon", "Meta", "Google", "Microsoft", "Apple"]],
  [502, "IPO", "ipo", "HARD", 50.2, 4000, 200, false, ["Arrays", "Greedy", "Heap"], ["Amazon", "Google"]],
  [763, "Partition Labels", "partition-labels", "MEDIUM", 79.2, 6000, 200, false, ["Strings", "Greedy"], ["Amazon", "Google"]],

  // ─── Backtracking ───────────────────────────────────
  [17, "Letter Combinations of a Phone Number", "letter-combinations-of-a-phone-number", "MEDIUM", 57.2, 18000, 600, false, ["Strings", "Backtracking"], ["Amazon", "Meta", "Google", "Microsoft", "Apple", "Bloomberg"]],
  [22, "Generate Parentheses", "generate-parentheses", "MEDIUM", 73.2, 18000, 600, false, ["Strings", "Backtracking"], ["Amazon", "Meta", "Google", "Microsoft", "Bloomberg"]],
  [39, "Combination Sum", "combination-sum", "MEDIUM", 70.2, 16000, 500, false, ["Arrays", "Backtracking"], ["Amazon", "Meta", "Google", "Microsoft"]],
  [46, "Permutations", "permutations", "MEDIUM", 74.2, 18000, 500, false, ["Arrays", "Backtracking"], ["Amazon", "Meta", "Google", "Microsoft", "Apple"]],
  [48, "Rotate Image", "rotate-image", "MEDIUM", 73.2, 16000, 500, false, ["Arrays", "Matrix"], ["Amazon", "Microsoft", "Bloomberg"]],
  [51, "N-Queens", "n-queens", "HARD", 70.2, 10000, 400, false, ["Backtracking"], ["Amazon", "Meta", "Google", "Microsoft"]],
  [78, "Subsets", "subsets", "MEDIUM", 73.2, 14000, 400, false, ["Arrays", "Backtracking"], ["Amazon", "Meta", "Google", "Microsoft"]],
  [79, "Word Search", "word-search", "MEDIUM", 40.2, 14000, 600, false, ["Arrays", "Backtracking"], ["Amazon", "Meta", "Google", "Microsoft"]],
  [90, "Subsets II", "subsets-ii", "MEDIUM", 54.2, 8000, 300, false, ["Arrays", "Backtracking"], ["Amazon", "Google"]],
  [131, "Palindrome Partitioning", "palindrome-partitioning", "MEDIUM", 63.2, 8000, 300, false, ["Strings", "Backtracking", "Dynamic Programming"], ["Amazon", "Meta"]],

  // ─── Dynamic Programming ────────────────────────────
  [5, "Longest Palindromic Substring", "longest-palindromic-substring", "MEDIUM", 33.2, 26000, 1100, false, ["Strings", "Dynamic Programming"], ["Amazon", "Meta", "Microsoft", "Bloomberg", "Apple"]],
  [10, "Regular Expression Matching", "regular-expression-matching", "HARD", 28.2, 12000, 600, false, ["Strings", "Dynamic Programming"], ["Amazon", "Meta", "Google", "Microsoft", "Apple"]],
  [32, "Longest Valid Parentheses", "longest-valid-parentheses", "HARD", 33.2, 8000, 400, false, ["Strings", "Dynamic Programming", "Stack"], ["Amazon", "Meta", "Google"]],
  [53, "Maximum Subarray", "maximum-subarray", "MEDIUM", 50.2, 30000, 1300, false, ["Arrays", "Dynamic Programming"], ["Google", "Amazon", "Meta", "Microsoft", "Apple", "Adobe"]],
  [62, "Unique Paths", "unique-paths", "MEDIUM", 63.2, 14000, 500, false, ["Math", "Dynamic Programming"], ["Amazon", "Google", "Microsoft"]],
  [64, "Minimum Path Sum", "minimum-path-sum", "MEDIUM", 60.2, 12000, 400, false, ["Arrays", "Dynamic Programming"], ["Amazon", "Google", "Microsoft"]],
  [70, "Climbing Stairs", "climbing-stairs", "EASY", 51.2, 20000, 500, false, ["Math", "Dynamic Programming"], ["Amazon", "Google", "Microsoft", "Apple"]],
  [72, "Edit Distance", "edit-distance", "MEDIUM", 54.2, 10000, 400, false, ["Strings", "Dynamic Programming"], ["Amazon", "Meta", "Google", "Microsoft"]],
  [121, "Best Time to Buy and Sell Stock", "best-time-to-buy-and-sell-stock", "EASY", 54.3, 28000, 900, false, ["Arrays", "Dynamic Programming"], ["Amazon", "Meta", "Google", "Microsoft", "Apple", "Goldman Sachs", "Bloomberg"]],
  [139, "Word Break", "word-break", "MEDIUM", 46.2, 16000, 600, false, ["Strings", "Dynamic Programming"], ["Amazon", "Meta", "Google", "Microsoft", "Apple", "Bloomberg"]],
  [152, "Maximum Product Subarray", "maximum-product-subarray", "MEDIUM", 34.2, 16000, 700, false, ["Arrays", "Dynamic Programming"], ["Amazon", "Meta", "Google", "Microsoft", "Bloomberg"]],
  [198, "House Robber", "house-robber", "MEDIUM", 49.2, 16000, 500, false, ["Arrays", "Dynamic Programming"], ["Amazon", "Google", "Microsoft", "Apple"]],
  [213, "House Robber II", "house-robber-ii", "MEDIUM", 42.2, 8000, 300, false, ["Arrays", "Dynamic Programming"], ["Amazon", "Google"]],
  [279, "Perfect Squares", "perfect-squares", "MEDIUM", 52.2, 10000, 400, false, ["Math", "Dynamic Programming"], ["Amazon", "Google", "Microsoft"]],
  [300, "Longest Increasing Subsequence", "longest-increasing-subsequence", "MEDIUM", 52.2, 16000, 600, false, ["Arrays", "Dynamic Programming", "Binary Search"], ["Amazon", "Meta", "Google", "Microsoft", "Bloomberg"]],
  [322, "Coin Change", "coin-change", "MEDIUM", 42.2, 20000, 700, false, ["Arrays", "Greedy", "Dynamic Programming"], ["Amazon", "Meta", "Google", "Microsoft", "Apple"]],
  [416, "Partition Equal Subset Sum", "partition-equal-subset-sum", "MEDIUM", 46.2, 8000, 300, false, ["Arrays", "Dynamic Programming"], ["Amazon", "Google"]],
  [494, "Target Sum", "target-sum", "MEDIUM", 45.2, 10000, 400, false, ["Arrays", "Dynamic Programming"], ["Amazon", "Meta", "Google"]],
  [1143, "Longest Common Subsequence", "longest-common-subsequence", "MEDIUM", 58.2, 8000, 300, false, ["Strings", "Dynamic Programming"], ["Amazon", "Google", "Microsoft"]],

  // ─── Sliding Window ─────────────────────────────────
  [3, "Longest Substring Without Repeating Characters", "longest-substring-without-repeating-characters", "MEDIUM", 34.2, 30000, 1200, false, ["Strings", "Sliding Window", "Hashing"], ["Amazon", "Meta", "Google", "Microsoft", "Bloomberg", "Apple", "Atlassian"]],
  [76, "Minimum Window Substring", "minimum-window-substring", "HARD", 41.5, 18000, 800, false, ["Strings", "Sliding Window", "Hashing"], ["Meta", "Amazon", "Microsoft", "Uber", "LinkedIn"]],
  [209, "Minimum Size Subarray Sum", "minimum-size-subarray-sum", "MEDIUM", 45.2, 8000, 300, false, ["Arrays", "Sliding Window"], ["Amazon"]],
  [239, "Sliding Window Maximum", "sliding-window-maximum", "HARD", 46.2, 16000, 600, false, ["Arrays", "Sliding Window", "Heap"], ["Amazon", "Meta", "Google", "Microsoft", "Bloomberg"]],
  [438, "Find All Anagrams in a String", "find-all-anagrams-in-a-string", "MEDIUM", 49.2, 10000, 300, false, ["Strings", "Sliding Window", "Hashing"], ["Amazon", "Meta", "Google"]],
  [567, "Permutation in String", "permutation-in-string", "MEDIUM", 44.2, 8000, 300, false, ["Strings", "Sliding Window", "Hashing"], ["Amazon", "Meta"]],

  // ─── Binary Search ──────────────────────────────────
  [33, "Search in Rotated Sorted Array", "search-in-rotated-sorted-array", "MEDIUM", 39.2, 20000, 900, false, ["Arrays", "Binary Search"], ["Amazon", "Meta", "Google", "Microsoft", "Bloomberg", "Apple"]],
  [34, "Find First and Last Position of Element in Sorted Array", "find-first-and-last-position-of-element-in-sorted-array", "MEDIUM", 42.2, 16000, 600, false, ["Arrays", "Binary Search"], ["Amazon", "Meta", "Google", "Microsoft"]],
  [35, "Search Insert Position", "search-insert-position", "EASY", 44.2, 16000, 500, false, ["Arrays", "Binary Search"], ["Amazon", "Microsoft"]],
  [74, "Search a 2D Matrix", "search-a-2d-matrix", "MEDIUM", 49.2, 12000, 400, false, ["Arrays", "Binary Search"], ["Amazon", "Microsoft"]],
  [153, "Find Minimum in Rotated Sorted Array", "find-minimum-in-rotated-sorted-array", "MEDIUM", 49.2, 12000, 500, false, ["Arrays", "Binary Search"], ["Amazon", "Microsoft"]],
  [162, "Find Peak Element", "find-peak-element", "MEDIUM", 45.2, 14000, 500, false, ["Arrays", "Binary Search"], ["Amazon", "Google", "Microsoft"]],
  [300, "Longest Increasing Subsequence", "longest-increasing-subsequence", "MEDIUM", 52.2, 16000, 600, false, ["Arrays", "Dynamic Programming", "Binary Search"], ["Amazon", "Meta", "Google", "Microsoft", "Bloomberg"]],
  [704, "Binary Search", "binary-search", "EASY", 54.2, 10000, 300, false, ["Arrays", "Binary Search"], ["Amazon", "Microsoft"]],

  // ─── Bit Manipulation ───────────────────────────────
  [136, "Single Number", "single-number", "EASY", 73.5, 18000, 400, false, ["Arrays", "Bit Manipulation"], ["Amazon", "Google", "Microsoft", "Apple"]],
  [191, "Number of 1 Bits", "number-of-1-bits", "EASY", 63.2, 8000, 200, false, ["Bit Manipulation"], ["Amazon", "Microsoft"]],
  [268, "Missing Number", "missing-number", "EASY", 62.2, 10000, 300, false, ["Arrays", "Bit Manipulation", "Math"], ["Amazon", "Microsoft", "Google"]],
  [338, "Counting Bits", "counting-bits", "EASY", 75.2, 8000, 200, false, ["Bit Manipulation", "Dynamic Programming"], ["Amazon"]],
  [371, "Sum of Two Integers", "sum-of-two-integers", "MEDIUM", 50.2, 6000, 300, false, ["Bit Manipulation", "Math"], ["Amazon", "Google"]],
  [389, "Find the Difference", "find-the-difference", "EASY", 60.2, 4000, 100, false, ["Bit Manipulation", "Strings"], ["Amazon"]],

  // ─── Math ───────────────────────────────────────────
  [7, "Reverse Integer", "reverse-integer", "MEDIUM", 28.5, 20000, 800, false, ["Math"], ["Amazon", "Meta", "Microsoft", "Bloomberg"]],
  [9, "Palindrome Number", "palindrome-number", "EASY", 52.2, 16000, 500, false, ["Math"], ["Amazon", "Microsoft"]],
  [50, "Pow(x, n)", "powx-n", "MEDIUM", 33.2, 10000, 500, false, ["Math", "Recursion"], ["Amazon", "Meta", "Google", "Microsoft"]],
  [69, "Sqrt(x)", "sqrtx", "EASY", 37.2, 12000, 500, false, ["Math", "Binary Search"], ["Amazon", "Microsoft"]],
  [202, "Happy Number", "happy-number", "EASY", 55.2, 10000, 300, false, ["Math", "Hashing"], ["Amazon", "Google"]],
  [268, "Missing Number", "missing-number", "EASY", 62.2, 10000, 300, false, ["Arrays", "Bit Manipulation", "Math"], ["Amazon", "Microsoft", "Google"]],

  // ─── Two Pointers ───────────────────────────────────
  [11, "Container With Most Water", "container-with-most-water", "MEDIUM", 54.2, 24000, 800, false, ["Arrays", "Two Pointers"], ["Amazon", "Meta", "Google", "Microsoft", "Bloomberg", "Apple"]],
  [15, "3Sum", "3sum", "MEDIUM", 32.8, 24000, 800, false, ["Arrays", "Two Pointers", "Sorting"], ["Amazon", "Meta", "Microsoft", "Bloomberg"]],
  [16, "3Sum Closest", "3sum-closest", "MEDIUM", 46.2, 10000, 400, false, ["Arrays", "Two Pointers", "Sorting"], ["Amazon", "Meta"]],
  [19, "Remove Nth Node From End of List", "remove-nth-node-from-end-of-list", "MEDIUM", 44.2, 18000, 700, false, ["Linked List", "Two Pointers"], ["Amazon", "Meta", "Microsoft", "Bloomberg"]],
  [42, "Trapping Rain Water", "trapping-rain-water", "HARD", 58.2, 22000, 800, false, ["Arrays", "Two Pointers", "Stack"], ["Amazon", "Meta", "Google", "Microsoft", "Bloomberg", "Apple", "Goldman Sachs"]],
  [84, "Largest Rectangle in Histogram", "largest-rectangle-in-histogram", "HARD", 42.2, 12000, 600, false, ["Arrays", "Stack"], ["Amazon", "Meta", "Microsoft"]],
  [125, "Valid Palindrome", "valid-palindrome", "EASY", 46.2, 12000, 400, false, ["Strings", "Two Pointers"], ["Amazon", "Meta", "Microsoft", "Apple"]],
  [283, "Move Zeroes", "move-zeroes", "EASY", 61.5, 18000, 500, false, ["Arrays", "Two Pointers"], ["Amazon", "Meta", "Microsoft", "Apple"]],
  [344, "Reverse String", "reverse-string", "EASY", 77.5, 16000, 300, false, ["Strings", "Two Pointers"], ["Amazon", "Meta", "Microsoft", "Apple"]],

  // ─── Sorting ────────────────────────────────────────
  [56, "Merge Intervals", "merge-intervals", "MEDIUM", 46.5, 22000, 700, false, ["Arrays", "Sorting"], ["Google", "Meta", "Amazon", "Microsoft", "Bloomberg"]],
  [75, "Sort Colors", "sort-colors", "MEDIUM", 60.8, 16000, 500, false, ["Arrays", "Two Pointers", "Sorting"], ["Meta", "Amazon", "Microsoft"]],
  [215, "Kth Largest Element in an Array", "kth-largest-element-in-an-array", "MEDIUM", 64.2, 16000, 600, false, ["Arrays", "Heap", "Sorting"], ["Amazon", "Meta", "Google", "Microsoft", "Bloomberg"]],
  [242, "Valid Anagram", "valid-anagram", "EASY", 63.5, 16000, 400, false, ["Strings", "Hashing", "Sorting"], ["Amazon", "Meta", "Google", "Microsoft", "Apple"]],
  [347, "Top K Frequent Elements", "top-k-frequent-elements", "MEDIUM", 63.5, 16000, 500, false, ["Arrays", "Hashing", "Heap"], ["Amazon", "Meta", "Google", "Microsoft", "Apple"]],

  // ─── BFS/DFS ────────────────────────────────────────
  [94, "Binary Tree Inorder Traversal", "binary-tree-inorder-traversal", "EASY", 74.2, 14000, 400, false, ["Trees", "Stack"], ["Amazon", "Microsoft", "Google"]],
  [100, "Same Tree", "same-tree", "EASY", 58.2, 10000, 300, false, ["Trees", "BFS/DFS"], ["Amazon", "Microsoft"]],
  [102, "Binary Tree Level Order Traversal", "binary-tree-level-order-traversal", "MEDIUM", 65.2, 16000, 500, false, ["Trees", "BFS"], ["Amazon", "Meta", "Google", "Microsoft", "Bloomberg"]],
  [104, "Maximum Depth of Binary Tree", "maximum-depth-of-binary-tree", "EASY", 73.2, 16000, 400, false, ["Trees", "BFS/DFS"], ["Amazon", "Google", "Microsoft", "Apple"]],
  [133, "Clone Graph", "clone-graph", "MEDIUM", 55.2, 10000, 400, false, ["Graphs", "BFS/DFS", "Hashing"], ["Meta", "Amazon", "Google", "Microsoft", "Bloomberg"]],
  [200, "Number of Islands", "number-of-islands", "MEDIUM", 57.2, 20000, 700, false, ["Graphs", "BFS/DFS"], ["Amazon", "Meta", "Google", "Microsoft", "Bloomberg", "Apple", "Uber", "LinkedIn"]],
  [207, "Course Schedule", "course-schedule", "MEDIUM", 45.2, 16000, 600, false, ["Graphs", "BFS/DFS", "Topological Sort"], ["Amazon", "Meta", "Google", "Microsoft", "Bloomberg", "Apple"]],
  [226, "Invert Binary Tree", "invert-binary-tree", "EASY", 75.2, 16000, 400, false, ["Trees", "BFS/DFS"], ["Amazon", "Google", "Microsoft", "Bloomberg"]],
  [236, "Lowest Common Ancestor of a Binary Tree", "lowest-common-ancestor-of-a-binary-tree", "MEDIUM", 60.2, 16000, 600, false, ["Trees", "BFS/DFS"], ["Amazon", "Meta", "Google", "Microsoft", "Bloomberg", "Apple"]],

  // ─── Matrix ─────────────────────────────────────────
  [48, "Rotate Image", "rotate-image", "MEDIUM", 73.2, 16000, 500, false, ["Arrays", "Matrix"], ["Amazon", "Microsoft", "Bloomberg"]],
  [54, "Spiral Matrix", "spiral-matrix", "MEDIUM", 43.2, 14000, 500, false, ["Arrays", "Matrix"], ["Amazon", "Meta", "Google", "Microsoft", "Bloomberg"]],
  [73, "Set Matrix Zeroes", "set-matrix-zeroes", "MEDIUM", 50.2, 14000, 600, false, ["Arrays", "Matrix"], ["Amazon", "Meta", "Google", "Microsoft", "Bloomberg"]],
  [74, "Search a 2D Matrix", "search-a-2d-matrix", "MEDIUM", 49.2, 12000, 400, false, ["Arrays", "Binary Search"], ["Amazon", "Microsoft"]],
  [240, "Search a 2D Matrix II", "search-a-2d-matrix-ii", "MEDIUM", 51.2, 8000, 300, false, ["Arrays", "Matrix", "Binary Search"], ["Amazon", "Google", "Microsoft"]],
  [542, "01 Matrix", "01-matrix", "MEDIUM", 46.2, 6000, 300, false, ["Arrays", "Matrix", "BFS"], ["Amazon", "Google"]],
];

export const SEED_PROBLEMS: SeedProblem[] = RAW.map(([id, title, titleSlug, difficulty, acceptanceRate, likes, dislikes, isPremium, tags, companies]) => ({
  id,
  title,
  titleSlug,
  difficulty,
  acceptanceRate,
  likes,
  dislikes,
  isPremium,
  tags,
  companies,
}));

export function getAllSeedProblems(): SeedProblem[] {
  return SEED_PROBLEMS;
}

export function getSeedProblemsByTags(tagNames: string[]): SeedProblem[] {
  return SEED_PROBLEMS.filter(p =>
    p.tags.some(t => tagNames.includes(t))
  );
}
