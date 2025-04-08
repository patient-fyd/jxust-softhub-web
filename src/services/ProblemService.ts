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

// 刷题服务类
class ProblemService {
  // 获取所有题目列表
  async getProblems(): Promise<Problem[]> {
    // 模拟API请求
    return new Promise((resolve) => {
      setTimeout(() => {
        const mockProblems: Problem[] = [];
        const availableTags = [
          '数组', '字符串', '哈希表', '动态规划', 
          '链表', '数学', '二叉树', '堆', '图',
          '贪心', '排序', '递归', '回溯', '二分查找'
        ];
        
        for (let i = 1; i <= 100; i++) {
          const id = `P${i.toString().padStart(4, '0')}`;
          
          // 随机选择难度
          const difficulties = ['easy', 'medium', 'hard'] as const;
          const difficulty = difficulties[Math.floor(Math.random() * difficulties.length)];
          
          // 随机选择2-4个标签
          const tagCount = Math.floor(Math.random() * 3) + 2;
          const tags: string[] = [];
          for (let j = 0; j < tagCount; j++) {
            const randomTag = availableTags[Math.floor(Math.random() * availableTags.length)];
            if (!tags.includes(randomTag)) {
              tags.push(randomTag);
            }
          }
          
          // 随机选择状态
          const statuses = ['solved', 'attempted', 'unsolved'] as const;
          const randomStatusIndex = Math.floor(Math.random() * 10);
          // 将大部分题目设为未解决，少部分为已解决或尝试过
          const status = randomStatusIndex < 7 ? 'unsolved' : 
                         randomStatusIndex < 9 ? 'attempted' : 
                         'solved';
          
          mockProblems.push({
            id,
            title: `题目 ${i}: ${this.generateRandomTitle()}`,
            difficulty,
            tags,
            status
          });
        }
        
        resolve(mockProblems);
      }, 1000);
    });
  }
  
  // 获取题目详情
  async getProblemDetail(id: string): Promise<Problem> {
    // 模拟API请求
    return new Promise((resolve) => {
      setTimeout(() => {
        const problem: Problem = {
          id,
          title: '两数之和',
          difficulty: 'easy',
          tags: ['数组', '哈希表'],
          status: 'unsolved',
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
        };
        
        resolve(problem);
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