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

// 导入API客户端
import apiClient from './api';

// 实现题目服务类
class ProblemService {
  private solvedProblems: Set<string>;
  private attemptedProblems: Set<string>;
  
  constructor() {
    this.solvedProblems = new Set<string>();
    this.attemptedProblems = new Set<string>();
    
    // 从本地存储加载状态
    this.loadState();
  }
  
  // 保存状态到本地存储
  private saveState(): void {
    localStorage.setItem('problem-solved', JSON.stringify(Array.from(this.solvedProblems)));
    localStorage.setItem('problem-attempted', JSON.stringify(Array.from(this.attemptedProblems)));
  }
  
  // 从本地存储加载状态
  private loadState(): void {
    try {
      const solved = localStorage.getItem('problem-solved');
      const attempted = localStorage.getItem('problem-attempted');
      
      if (solved) {
        this.solvedProblems = new Set<string>(JSON.parse(solved));
      }
      
      if (attempted) {
        this.attemptedProblems = new Set<string>(JSON.parse(attempted));
      }
    } catch (error) {
      console.error('加载题目状态失败:', error);
    }
  }
  
  // 获取所有题目列表
  async getProblems(): Promise<Problem[]> {
    try {
      const response = await apiClient.get<{
        code: number;
        msg: string;
        data: any[];
      }>('/api/problem/v1/list');
      
      if (response.data.code !== 0) {
        throw new Error(response.data.msg);
      }
      
      // 转换为前端所需格式并添加状态
      return response.data.data.map((problem: any) => {
        let status: 'solved' | 'attempted' | 'unsolved' = 'unsolved';
        
        if (this.solvedProblems.has(problem.id)) {
          status = 'solved';
        } else if (this.attemptedProblems.has(problem.id)) {
          status = 'attempted';
        }
        
        return {
          id: problem.id,
          title: problem.title,
          difficulty: problem.difficulty,
          tags: problem.tags,
          status
        };
      });
    } catch (error) {
      console.error('获取题目列表失败:', error);
      return [];
    }
  }
  
  // 获取题目详情
  async getProblemDetail(id: string): Promise<Problem> {
    try {
      const response = await apiClient.get<{
        code: number;
        msg: string;
        data: any;
      }>(`/api/problem/v1/detail`, {
        params: { id }
      });
      
      if (response.data.code !== 0) {
        throw new Error(response.data.msg);
      }
      
      // 确定题目状态
      let status: 'solved' | 'attempted' | 'unsolved' = 'unsolved';
      if (this.solvedProblems.has(id)) {
        status = 'solved';
      } else if (this.attemptedProblems.has(id)) {
        status = 'attempted';
      }
      
      // 转换为前端所需格式
      return {
        id: response.data.data.id,
        title: response.data.data.title,
        difficulty: response.data.data.difficulty,
        tags: response.data.data.tags,
        description: response.data.data.description,
        examples: response.data.data.examples,
        constraints: response.data.data.constraints,
        status
      };
    } catch (error) {
      console.error(`获取题目详情失败 (ID: ${id}):`, error);
      throw error;
    }
  }
  
  // 运行代码
  async runCode(problemId: string, language: string, code: string): Promise<{ 
    output: string,
    testCases: { input: string; expected: string; actual: string; passed: boolean; }[]
  }> {
    try {
      // 将题目标记为"尝试过"状态
      if (!this.solvedProblems.has(problemId)) {
        this.attemptedProblems.add(problemId);
        this.saveState();
      }
      
      const response = await apiClient.post<{
        code: number;
        msg: string;
        data: {
          output: string;
          testCases: { input: string; expected: string; actual: string; passed: boolean; }[];
        };
      }>('/api/problem/v1/run', {
        problemId,
        language,
        code
      });
      
      if (response.data.code !== 0) {
        throw new Error(response.data.msg);
      }
      
      return response.data.data;
    } catch (error) {
      console.error('运行代码失败:', error);
      throw error;
    }
  }
  
  // 提交代码
  async submitCode(problemId: string, language: string, code: string): Promise<Submission> {
    try {
      const response = await apiClient.post<{
        code: number;
        msg: string;
        data: Submission;
      }>('/api/problem/v1/submit', {
        problemId,
        language,
        code
      });
      
      if (response.data.code !== 0) {
        throw new Error(response.data.msg);
      }
      
      // 如果提交成功并且状态为accepted，更新题目状态
      if (response.data.data.status === 'accepted') {
        this.solvedProblems.add(problemId);
        this.attemptedProblems.delete(problemId);
        this.saveState();
      } else if (!this.solvedProblems.has(problemId)) {
        // 如果未通过且未解决，标记为尝试过
        this.attemptedProblems.add(problemId);
        this.saveState();
      }
      
      return response.data.data;
    } catch (error) {
      console.error('提交代码失败:', error);
      throw error;
    }
  }
}

// 导出服务实例
export const problemService = new ProblemService(); 