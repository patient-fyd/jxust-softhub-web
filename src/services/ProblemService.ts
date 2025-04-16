// 定义题目接口
export interface Problem {
  id: string;
  title: string;
  difficulty: 'easy' | 'medium' | 'hard';
  tags: string[];
  status: 'solved' | 'attempted' | 'unsolved';
  description?: string;
  examples?: {
    input: string;
    output: string;
    explanation?: string;
  }[];
  constraints?: string[];
}

// 定义提交记录接口
export interface Submission {
  id: string;
  problemId: string;
  language: string;
  code: string;
  status: 'accepted' | 'wrong_answer' | 'time_limit_exceeded' | 'runtime_error' | 'compilation_error';
  runtime: number;
  memory: number;
  createdAt: string;
  testCases: {
    input: string;
    expected: string;
    actual: string;
    passed: boolean;
  }[];
}

// 固定题库数据，包含20个常见算法题
const PROBLEM_DATABASE: Record<string, Omit<Problem, 'status'>> = {
  'P0001': {
    id: 'P0001',
    title: '题目 1: 两数之和',
    difficulty: 'easy',
    tags: ['数组', '哈希表'],
    description: `<p>给定一个整数数组 <code>nums</code> 和一个整数目标值 <code>target</code>，请你在该数组中找出 <strong>和为目标值</strong> <code>target</code> 的那 <strong>两个</strong> 整数，并返回它们的数组下标。</p>
    <p>你可以假设每种输入只会对应一个答案。但是，数组中同一个元素在答案里不能重复出现。</p>
    <p>你可以按任意顺序返回答案。</p>`,
    examples: [
      {
        input: 'nums = [2,7,11,15], target = 9',
        output: '[0,1]',
        explanation: '因为 nums[0] + nums[1] == 9 ，返回 [0, 1] 。'
      },
      {
        input: 'nums = [3,2,4], target = 6',
        output: '[1,2]'
      },
      {
        input: 'nums = [3,3], target = 6',
        output: '[0,1]'
      }
    ],
    constraints: [
      '2 <= nums.length <= 10^4',
      '-10^9 <= nums[i] <= 10^9',
      '-10^9 <= target <= 10^9',
      '只会存在一个有效答案'
    ]
  },
  'P0002': {
    id: 'P0002',
    title: '题目 2: 单词搜索',
    difficulty: 'medium',
    tags: ['数组', '回溯', '矩阵'],
    description: `<p>给定一个 <code>m x n</code> 二维字符网格 <code>board</code> 和一个字符串单词 <code>word</code> 。如果 <code>word</code> 存在于网格中，返回 <code>true</code> ；否则，返回 <code>false</code> 。</p>
    <p>单词必须按照字母顺序，通过相邻的单元格内的字母构成，其中"相邻"单元格是那些水平相邻或垂直相邻的单元格。同一个单元格内的字母不允许被重复使用。</p>`,
    examples: [
      {
        input: 'board = [["A","B","C","E"],["S","F","C","S"],["A","D","E","E"]], word = "ABCCED"',
        output: 'true',
        explanation: '路径为：A -> B -> C -> C -> E -> D'
      },
      {
        input: 'board = [["A","B","C","E"],["S","F","C","S"],["A","D","E","E"]], word = "SEE"',
        output: 'true'
      },
      {
        input: 'board = [["A","B","C","E"],["S","F","C","S"],["A","D","E","E"]], word = "ABCB"',
        output: 'false',
        explanation: 'B已被使用，不能重复使用'
      }
    ],
    constraints: [
      'm == board.length',
      'n = board[i].length',
      '1 <= m, n <= 6',
      '1 <= word.length <= 15',
      'board 和 word 仅由大小写英文字母组成'
    ]
  },
  'P0003': {
    id: 'P0003',
    title: '题目 3: 全排列',
    difficulty: 'medium',
    tags: ['数组', '回溯'],
    description: `<p>给定一个不含重复数字的数组 <code>nums</code> ，返回其 <strong>所有可能的全排列</strong> 。你可以 <strong>按任意顺序</strong> 返回答案。</p>`,
    examples: [
      {
        input: 'nums = [1,2,3]',
        output: '[[1,2,3],[1,3,2],[2,1,3],[2,3,1],[3,1,2],[3,2,1]]'
      },
      {
        input: 'nums = [0,1]',
        output: '[[0,1],[1,0]]'
      },
      {
        input: 'nums = [1]',
        output: '[[1]]'
      }
    ],
    constraints: [
      '1 <= nums.length <= 6',
      '-10 <= nums[i] <= 10',
      'nums 中的所有整数 互不相同'
    ]
  },
  'P0004': {
    id: 'P0004',
    title: '题目 4: 接雨水',
    difficulty: 'hard',
    tags: ['栈', '数组', '双指针', '动态规划'],
    description: `<p>给定 <code>n</code> 个非负整数表示每个宽度为 <code>1</code> 的柱子的高度图，计算按此排列的柱子，下雨之后能接多少雨水。</p>`,
    examples: [
      {
        input: 'height = [0,1,0,2,1,0,1,3,2,1,2,1]',
        output: '6',
        explanation: '上面是由数组 [0,1,0,2,1,0,1,3,2,1,2,1] 表示的高度图，在这种情况下，可以接 6 个单位的雨水（蓝色部分表示雨水）。'
      },
      {
        input: 'height = [4,2,0,3,2,5]',
        output: '9'
      }
    ],
    constraints: [
      'n == height.length',
      '1 <= n <= 2 * 10^4',
      '0 <= height[i] <= 10^5'
    ]
  },
  'P0005': {
    id: 'P0005',
    title: '题目 5: 最长回文子串',
    difficulty: 'medium',
    tags: ['字符串', '动态规划'],
    description: `<p>给你一个字符串 <code>s</code>，找到 <code>s</code> 中最长的回文子串。</p>
    <p>如果字符串的反序与原始字符串相同，则该字符串称为回文字符串。</p>`,
    examples: [
      {
        input: 's = "babad"',
        output: '"bab"',
        explanation: '"aba" 同样是符合题意的答案。'
      },
      {
        input: 's = "cbbd"',
        output: '"bb"'
      }
    ],
    constraints: [
      '1 <= s.length <= 1000',
      's 仅由数字和英文字母组成'
    ]
  },
  'P0006': {
    id: 'P0006',
    title: '题目 6: 合并两个有序链表',
    difficulty: 'easy',
    tags: ['递归', '链表'],
    description: `<p>将两个升序链表合并为一个新的 <strong>升序</strong> 链表并返回。新链表是通过拼接给定的两个链表的所有节点组成的。</p>`,
    examples: [
      {
        input: 'list1 = [1,2,4], list2 = [1,3,4]',
        output: '[1,1,2,3,4,4]'
      },
      {
        input: 'list1 = [], list2 = []',
        output: '[]'
      },
      {
        input: 'list1 = [], list2 = [0]',
        output: '[0]'
      }
    ],
    constraints: [
      '两个链表的节点数目范围是 [0, 50]',
      '-100 <= Node.val <= 100',
      'l1 和 l2 均按 非递减顺序 排列'
    ]
  },
  'P0007': {
    id: 'P0007',
    title: '题目 7: 最小路径和',
    difficulty: 'medium',
    tags: ['数组', '动态规划', '矩阵'],
    description: `<p>给定一个包含非负整数的 <code>m x n</code> 网格 <code>grid</code> ，请找出一条从左上角到右下角的路径，使得路径上的数字总和为最小。</p>
    <p><strong>说明：</strong>每次只能向下或者向右移动一步。</p>`,
    examples: [
      {
        input: 'grid = [[1,3,1],[1,5,1],[4,2,1]]',
        output: '7',
        explanation: '因为路径 1→3→1→1→1 的总和最小。'
      },
      {
        input: 'grid = [[1,2,3],[4,5,6]]',
        output: '12'
      }
    ],
    constraints: [
      'm == grid.length',
      'n == grid[i].length',
      '1 <= m, n <= 200',
      '0 <= grid[i][j] <= 100'
    ]
  },
  'P0008': {
    id: 'P0008',
    title: '题目 8: 最大子数组和',
    difficulty: 'medium',
    tags: ['数组', '分治', '动态规划'],
    description: `<p>给你一个整数数组 <code>nums</code> ，请你找出一个具有最大和的连续子数组（子数组最少包含一个元素），返回其最大和。</p>
    <p><strong>子数组</strong> 是数组中的一个连续部分。</p>`,
    examples: [
      {
        input: 'nums = [-2,1,-3,4,-1,2,1,-5,4]',
        output: '6',
        explanation: '连续子数组 [4,-1,2,1] 的和最大，为 6 。'
      },
      {
        input: 'nums = [1]',
        output: '1'
      },
      {
        input: 'nums = [5,4,-1,7,8]',
        output: '23'
      }
    ],
    constraints: [
      '1 <= nums.length <= 10^5',
      '-10^4 <= nums[i] <= 10^4'
    ]
  },
  'P0009': {
    id: 'P0009',
    title: '题目 9: 跳跃游戏',
    difficulty: 'medium',
    tags: ['贪心', '数组', '动态规划'],
    description: `<p>给你一个非负整数数组 <code>nums</code> ，你最初位于数组的 <strong>第一个下标</strong> 。</p>
    <p>数组中的每个元素代表你在该位置可以跳跃的最大长度。</p>
    <p>判断你是否能够到达最后一个下标。</p>`,
    examples: [
      {
        input: 'nums = [2,3,1,1,4]',
        output: 'true',
        explanation: '可以先跳 1 步，从下标 0 到达下标 1, 然后再从下标 1 跳 3 步到达最后一个下标。'
      },
      {
        input: 'nums = [3,2,1,0,4]',
        output: 'false',
        explanation: '无论怎样，总会到达下标为 3 的位置。但该下标的最大跳跃长度是 0 ， 所以永远不可能到达最后一个下标。'
      }
    ],
    constraints: [
      '1 <= nums.length <= 10^4',
      '0 <= nums[i] <= 10^5'
    ]
  },
  'P0010': {
    id: 'P0010',
    title: '题目 10: 爬楼梯',
    difficulty: 'easy',
    tags: ['记忆化搜索', '数学', '动态规划'],
    description: `<p>假设你正在爬楼梯。需要 <code>n</code> 阶你才能到达楼顶。</p>
    <p>每次你可以爬 <code>1</code> 或 <code>2</code> 个台阶。你有多少种不同的方法可以爬到楼顶呢？</p>`,
    examples: [
      {
        input: 'n = 2',
        output: '2',
        explanation: '有两种方法可以爬到楼顶。\n1. 1 阶 + 1 阶\n2. 2 阶'
      },
      {
        input: 'n = 3',
        output: '3',
        explanation: '有三种方法可以爬到楼顶。\n1. 1 阶 + 1 阶 + 1 阶\n2. 1 阶 + 2 阶\n3. 2 阶 + 1 阶'
      }
    ],
    constraints: [
      '1 <= n <= 45'
    ]
  },
  'P0011': {
    id: 'P0011',
    title: '题目 11: 二叉树的层序遍历',
    difficulty: 'medium',
    tags: ['树', '二叉树', '广度优先搜索', '队列'],
    description: `<p>给你二叉树的根节点 <code>root</code> ，返回其节点值的 <strong>层序遍历</strong> 。 （即逐层地，从左到右访问所有节点）。</p>`,
    examples: [
      {
        input: 'root = [3,9,20,null,null,15,7]',
        output: '[[3],[9,20],[15,7]]',
        explanation: `二叉树如下所示：
    3
   / \\
  9  20
    /  \\
   15   7`
      },
      {
        input: 'root = [1]',
        output: '[[1]]'
      },
      {
        input: 'root = []',
        output: '[]'
      }
    ],
    constraints: [
      '树中节点数目在范围 [0, 2000] 内',
      '-1000 <= Node.val <= 1000'
    ]
  },
  'P0012': {
    id: 'P0012',
    title: '题目 12: 有效的括号',
    difficulty: 'easy',
    tags: ['栈', '字符串'],
    description: `<p>给定一个只包括 <code>'('</code>，<code>')'</code>，<code>'{'</code>，<code>'}'</code>，<code>'['</code>，<code>']'</code> 的字符串 <code>s</code> ，判断字符串是否有效。</p>
    <p>有效字符串需满足：</p>
    <ol>
      <li>左括号必须用相同类型的右括号闭合。</li>
      <li>左括号必须以正确的顺序闭合。</li>
    </ol>`,
    examples: [
      {
        input: 's = "()"',
        output: 'true'
      },
      {
        input: 's = "()[]{}"',
        output: 'true'
      },
      {
        input: 's = "(]"',
        output: 'false'
      }
    ],
    constraints: [
      '1 <= s.length <= 10^4',
      's 仅由括号 \'(\', \')\', \'{\', \'}\', \'[\', \']\' 组成'
    ]
  },
  'P0013': {
    id: 'P0013',
    title: '题目 13: 最长公共前缀',
    difficulty: 'easy',
    tags: ['字符串', '数组'],
    description: `<p>编写一个函数来查找字符串数组中的最长公共前缀。</p>
    <p>如果不存在公共前缀，返回空字符串 <code>""</code>。</p>`,
    examples: [
      {
        input: 'strs = ["flower","flow","flight"]',
        output: '"fl"'
      },
      {
        input: 'strs = ["dog","racecar","car"]',
        output: '""',
        explanation: '输入不存在公共前缀。'
      }
    ],
    constraints: [
      '1 <= strs.length <= 200',
      '0 <= strs[i].length <= 200',
      'strs[i] 仅由小写英文字母组成'
    ]
  },
  'P0014': {
    id: 'P0014',
    title: '题目 14: 三数之和',
    difficulty: 'medium',
    tags: ['数组', '双指针', '排序'],
    description: `<p>给你一个整数数组 <code>nums</code> ，判断是否存在三元组 <code>[nums[i], nums[j], nums[k]]</code> 满足 <code>i != j</code>、<code>i != k</code> 且 <code>j != k</code> ，同时还满足 <code>nums[i] + nums[j] + nums[k] == 0</code> 。请你返回所有和为 <code>0</code> 且不重复的三元组。</p>
    <p><strong>注意：</strong>答案中不可以包含重复的三元组。</p>`,
    examples: [
      {
        input: 'nums = [-1,0,1,2,-1,-4]',
        output: '[[-1,-1,2],[-1,0,1]]',
        explanation: '因为 nums[0] + nums[1] + nums[2] = (-1) + 0 + 1 = 0 。nums[1] + nums[2] + nums[4] = 0 + 1 + (-1) = 0 。nums[0] + nums[3] + nums[4] = (-1) + 2 + (-1) = 0 。不同的三元组是 [-1,0,1] 和 [-1,-1,2] 。注意，输出的顺序和三元组的顺序并不重要。'
      },
      {
        input: 'nums = [0,1,1]',
        output: '[]',
        explanation: '唯一可能的三元组和不为 0 。'
      },
      {
        input: 'nums = [0,0,0]',
        output: '[[0,0,0]]',
        explanation: '唯一可能的三元组和为 0 。'
      }
    ],
    constraints: [
      '3 <= nums.length <= 3000',
      '-10^5 <= nums[i] <= 10^5'
    ]
  },
  'P0015': {
    id: 'P0015',
    title: '题目 15: 买卖股票的最佳时机',
    difficulty: 'easy',
    tags: ['数组', '动态规划'],
    description: `<p>给定一个数组 <code>prices</code> ，它的第 <code>i</code> 个元素 <code>prices[i]</code> 表示一支给定股票第 <code>i</code> 天的价格。</p>
    <p>你只能选择 <strong>某一天</strong> 买入这只股票，并选择在 <strong>未来的某一个不同的日子</strong> 卖出该股票。设计一个算法来计算你所能获取的最大利润。</p>
    <p>返回你可以从这笔交易中获取的最大利润。如果你不能获取任何利润，返回 <code>0</code> 。</p>`,
    examples: [
      {
        input: 'prices = [7,1,5,3,6,4]',
        output: '5',
        explanation: '在第 2 天（股票价格 = 1）的时候买入，在第 5 天（股票价格 = 6）的时候卖出，最大利润 = 6-1 = 5 。注意利润不能是 7-1 = 6, 因为卖出价格需要大于买入价格；同时，你不能在买入前卖出股票。'
      },
      {
        input: 'prices = [7,6,4,3,1]',
        output: '0',
        explanation: '在这种情况下, 没有交易完成, 所以最大利润为 0。'
      }
    ],
    constraints: [
      '1 <= prices.length <= 10^5',
      '0 <= prices[i] <= 10^4'
    ]
  },
  'P0016': {
    id: 'P0016',
    title: '题目 16: 反转链表',
    difficulty: 'easy',
    tags: ['链表', '递归'],
    description: `<p>给你单链表的头节点 <code>head</code> ，请你反转链表，并返回反转后的链表。</p>`,
    examples: [
      {
        input: 'head = [1,2,3,4,5]',
        output: '[5,4,3,2,1]'
      },
      {
        input: 'head = [1,2]',
        output: '[2,1]'
      },
      {
        input: 'head = []',
        output: '[]'
      }
    ],
    constraints: [
      '链表中节点的数目范围是 [0, 5000]',
      '-5000 <= Node.val <= 5000'
    ]
  },
  'P0017': {
    id: 'P0017',
    title: '题目 17: 岛屿数量',
    difficulty: 'medium',
    tags: ['深度优先搜索', '广度优先搜索', '并查集', '矩阵'],
    description: `<p>给你一个由 <code>'1'</code>（陆地）和 <code>'0'</code>（水）组成的二维网格，请你计算网格中岛屿的数量。</p>
    <p>岛屿总是被水包围，并且每座岛屿只能由水平方向和/或竖直方向上相邻的陆地连接形成。</p>
    <p>此外，你可以假设该网格的四条边均被水包围。</p>`,
    examples: [
      {
        input: `grid = [
  ["1","1","1","1","0"],
  ["1","1","0","1","0"],
  ["1","1","0","0","0"],
  ["0","0","0","0","0"]
]`,
        output: '1'
      },
      {
        input: `grid = [
  ["1","1","0","0","0"],
  ["1","1","0","0","0"],
  ["0","0","1","0","0"],
  ["0","0","0","1","1"]
]`,
        output: '3'
      }
    ],
    constraints: [
      'm == grid.length',
      'n == grid[i].length',
      '1 <= m, n <= 300',
      'grid[i][j] 的值为 \'0\' 或 \'1\''
    ]
  },
  'P0018': {
    id: 'P0018',
    title: '题目 18: 二分查找',
    difficulty: 'easy',
    tags: ['数组', '二分查找'],
    description: `<p>给定一个 <code>n</code> 个元素有序的（升序）整型数组 <code>nums</code> 和一个目标值 <code>target</code>  ，写一个函数搜索 <code>nums</code> 中的 <code>target</code>，如果目标值存在返回下标，否则返回 <code>-1</code>。</p>`,
    examples: [
      {
        input: 'nums = [-1,0,3,5,9,12], target = 9',
        output: '4',
        explanation: '9 出现在 nums 中并且下标为 4'
      },
      {
        input: 'nums = [-1,0,3,5,9,12], target = 2',
        output: '-1',
        explanation: '2 不存在 nums 中因此返回 -1'
      }
    ],
    constraints: [
      '1 <= nums.length <= 10^4',
      '-10^4 < nums[i], target < 10^4',
      '所有 nums[i] 均为不同的值',
      'nums 为无重复元素的升序排列数组'
    ]
  },
  'P0019': {
    id: 'P0019',
    title: '题目 19: 合并区间',
    difficulty: 'medium',
    tags: ['数组', '排序'],
    description: `<p>以数组 <code>intervals</code> 表示若干个区间的集合，其中单个区间为 <code>intervals[i] = [starti, endi]</code> 。请你合并所有重叠的区间，并返回 <strong>一个不重叠的区间数组</strong>，该数组需恰好覆盖输入中的所有区间 。</p>`,
    examples: [
      {
        input: 'intervals = [[1,3],[2,6],[8,10],[15,18]]',
        output: '[[1,6],[8,10],[15,18]]',
        explanation: '区间 [1,3] 和 [2,6] 重叠, 将它们合并为 [1,6].'
      },
      {
        input: 'intervals = [[1,4],[4,5]]',
        output: '[[1,5]]',
        explanation: '区间 [1,4] 和 [4,5] 可被视为重叠区间，它们的范围是 [1,5]。'
      }
    ],
    constraints: [
      '1 <= intervals.length <= 10^4',
      'intervals[i].length == 2',
      '0 <= starti <= endi <= 10^4'
    ]
  },
  'P0020': {
    id: 'P0020',
    title: '题目 20: LRU 缓存',
    difficulty: 'medium',
    tags: ['设计', '哈希表', '链表', '双向链表'],
    description: `<p>请你设计并实现一个满足 <a href="https://baike.baidu.com/item/LRU" target="_blank">LRU (最近最少使用) 缓存</a> 约束的数据结构。</p>
    <p>实现 <code>LRUCache</code> 类：</p>
    <ul>
      <li><code>LRUCache(int capacity)</code> 以 <strong>正整数</strong> 作为容量 <code>capacity</code> 初始化 LRU 缓存</li>
      <li><code>int get(int key)</code> 如果关键字 <code>key</code> 存在于缓存中，则返回关键字的值，否则返回 <code>-1</code> 。</li>
      <li><code>void put(int key, int value)</code> 如果关键字 <code>key</code> 已经存在，则变更其数据值 <code>value</code> ；如果不存在，则向缓存中插入该组 <code>key-value</code> 。如果插入操作导致关键字数量超过 <code>capacity</code> ，则应该 <strong>逐出</strong> 最久未使用的关键字。</li>
    </ul>
    <p>函数 <code>get</code> 和 <code>put</code> 必须以 <code>O(1)</code> 的平均时间复杂度运行。</p>`,
    examples: [
      {
        input: `["LRUCache", "put", "put", "get", "put", "get", "put", "get", "get", "get"]
[[2], [1, 1], [2, 2], [1], [3, 3], [2], [4, 4], [1], [3], [4]]`,
        output: '[null, null, null, 1, null, -1, null, -1, 3, 4]',
        explanation: `
LRUCache lRUCache = new LRUCache(2);
lRUCache.put(1, 1); // 缓存是 {1=1}
lRUCache.put(2, 2); // 缓存是 {1=1, 2=2}
lRUCache.get(1);    // 返回 1
lRUCache.put(3, 3); // 该操作会使得关键字 2 作废，缓存是 {1=1, 3=3}
lRUCache.get(2);    // 返回 -1 (未找到)
lRUCache.put(4, 4); // 该操作会使得关键字 1 作废，缓存是 {4=4, 3=3}
lRUCache.get(1);    // 返回 -1 (未找到)
lRUCache.get(3);    // 返回 3
lRUCache.get(4);    // 返回 4`
      }
    ],
    constraints: [
      '1 <= capacity <= 3000',
      '0 <= key <= 10^4',
      '0 <= value <= 10^5',
      '最多调用 2 * 10^5 次 get 和 put 操作'
    ]
  }
};

// 刷题服务类
class ProblemService {
  // 用于存储用户已解决的题目记录
  private solvedProblems: Set<string> = new Set();
  
  // 用于存储尝试过的题目记录
  private attemptedProblems: Set<string> = new Set();
  
  // 为了保持状态一致，固定每个题目的初始状态
  private readonly initialStatuses: Record<string, 'solved' | 'attempted' | 'unsolved'> = {
    'P0001': 'unsolved',
    'P0002': 'unsolved',
    'P0003': 'unsolved',
    'P0004': 'unsolved',
    'P0005': 'unsolved',
    'P0006': 'unsolved',
    'P0007': 'unsolved', 
    'P0008': 'unsolved',
    'P0009': 'unsolved',
    'P0010': 'unsolved',
    'P0011': 'unsolved',
    'P0012': 'unsolved',
    'P0013': 'unsolved',
    'P0014': 'unsolved',
    'P0015': 'unsolved',
    'P0016': 'unsolved',
    'P0017': 'unsolved',
    'P0018': 'unsolved',
    'P0019': 'unsolved',
    'P0020': 'unsolved'
  };
  
  constructor() {
    // 从本地存储加载已解决的题目（如果有）
    try {
      const savedSolved = localStorage.getItem('solvedProblems');
      if (savedSolved) {
        const solvedArray = JSON.parse(savedSolved) as string[];
        solvedArray.forEach(id => this.solvedProblems.add(id));
      }
      
      const savedAttempted = localStorage.getItem('attemptedProblems');
      if (savedAttempted) {
        const attemptedArray = JSON.parse(savedAttempted) as string[];
        attemptedArray.forEach(id => this.attemptedProblems.add(id));
      }
    } catch (error) {
      console.error('加载题目状态失败:', error);
    }
  }
  
  // 保存状态到本地存储
  private saveState() {
    try {
      localStorage.setItem('solvedProblems', JSON.stringify([...this.solvedProblems]));
      localStorage.setItem('attemptedProblems', JSON.stringify([...this.attemptedProblems]));
    } catch (error) {
      console.error('保存题目状态失败:', error);
    }
  }
  
  // 获取所有题目列表
  async getProblems(): Promise<Problem[]> {
    // 从固定题库获取数据
    return new Promise((resolve) => {
      setTimeout(() => {
        const problems: Problem[] = Object.values(PROBLEM_DATABASE).map(problem => {
          // 检查题目是否在已解决列表中
          if (this.solvedProblems.has(problem.id)) {
            return {
              ...problem,
              status: 'solved'
            };
          }
          
          // 检查题目是否在尝试过列表中
          if (this.attemptedProblems.has(problem.id)) {
            return {
              ...problem,
              status: 'attempted'
            };
          }
          
          // 使用固定的初始状态
          return {
            ...problem,
            status: this.initialStatuses[problem.id] || 'unsolved'
          };
        });
        
        resolve(problems);
      }, 800);
    });
  }
  
  // 获取题目详情
  async getProblemDetail(id: string): Promise<Problem> {
    // 从固定题库获取详情
    return new Promise((resolve, reject) => {
      setTimeout(() => {
        const problemData = PROBLEM_DATABASE[id];
        
        if (problemData) {
          // 返回题目详情，优先检查已解决状态，其次是尝试过状态
          let status: 'solved' | 'attempted' | 'unsolved' = 'unsolved';
          
          if (this.solvedProblems.has(id)) {
            status = 'solved';
          } else if (this.attemptedProblems.has(id)) {
            status = 'attempted';
          } else {
            status = this.initialStatuses[id] || 'unsolved';
          }
          
          resolve({
            ...problemData,
            status
          });
        } else {
          // 如果找不到题目，返回第一个题目（兜底）
          console.warn(`未找到题目ID: ${id}，返回默认题目`);
          resolve({
            ...PROBLEM_DATABASE['P0001'],
            status: 'unsolved'
          });
        }
      }, 500);
    });
  }
  
  // 运行代码
  async runCode(problemId: string, language: string, code: string): Promise<{ 
    output: string,
    testCases: { input: string; expected: string; actual: string; passed: boolean; }[]
  }> {
    // 模拟API请求
    return new Promise((resolve) => {
      setTimeout(() => {
        // 将题目标记为"尝试过"状态
        if (!this.solvedProblems.has(problemId)) {
          this.attemptedProblems.add(problemId);
          this.saveState();
        }
        
        const result = {
          output: `> 正在执行测试用例...\n> 执行测试用例 1: nums = [2,7,11,15], target = 9\n> 输出: [0,1]\n> 执行测试用例 2: nums = [3,2,4], target = 6\n> 输出: [1,2]\n> 测试完成，2 个测试用例通过， 0 个测试用例失败`,
          testCases: [
            {
              input: 'nums = [2,7,11,15], target = 9',
              expected: '[0,1]',
              actual: '[0,1]',
              passed: true
            },
            {
              input: 'nums = [3,2,4], target = 6',
              expected: '[1,2]',
              actual: '[1,2]',
              passed: true
            }
          ]
        };
        
        resolve(result);
      }, 1500);
    });
  }
  
  // 提交代码
  async submitCode(problemId: string, language: string, code: string): Promise<Submission> {
    // 模拟API请求
    return new Promise((resolve) => {
      setTimeout(() => {
        // 更新该题目为已解决状态，并从尝试过中移除
        this.solvedProblems.add(problemId);
        this.attemptedProblems.delete(problemId);
        
        // 保存到本地存储
        this.saveState();
        
        const submission: Submission = {
          id: Math.random().toString(36).substring(2, 10),
          problemId,
          language,
          code,
          status: 'accepted',
          runtime: 72,
          memory: 41.5,
          createdAt: new Date().toISOString(),
          testCases: [
            {
              input: 'nums = [2,7,11,15], target = 9',
              expected: '[0,1]',
              actual: '[0,1]',
              passed: true
            },
            {
              input: 'nums = [3,2,4], target = 6',
              expected: '[1,2]',
              actual: '[1,2]',
              passed: true
            },
            {
              input: 'nums = [3,3], target = 6',
              expected: '[0,1]',
              actual: '[0,1]',
              passed: true
            },
            {
              input: 'nums = [1,2,3,4,5], target = 6',
              expected: '[1,3]',
              actual: '[1,3]',
              passed: true
            }
          ]
        };
        
        resolve(submission);
      }, 2000);
    });
  }
  
  // 生成随机题目标题（内部使用）
  private generateRandomTitle(): string {
    const titles = [
      '两数之和', '最长回文子串', '字符串转换整数', '合并两个有序链表',
      '括号生成', '搜索旋转排序数组', '接雨水', '全排列',
      '最大子序和', '跳跃游戏', '最小路径和', '爬楼梯',
      '编辑距离', '颜色分类', '单词搜索', '柱状图中最大的矩形',
      '二叉树的中序遍历', '不同的二叉搜索树', '对称二叉树', '二叉树的层序遍历'
    ];
    
    return titles[Math.floor(Math.random() * titles.length)];
  }
}

// 导出服务实例
export const problemService = new ProblemService(); 