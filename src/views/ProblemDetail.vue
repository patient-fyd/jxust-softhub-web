<template>
  <div class="problem-detail-page">
    <div class="problem-container">
      <!-- 左侧题目描述区域 -->
      <div class="problem-description">
        <div class="problem-header">
          <div class="go-back">
            <button @click="goBack">
              <i class="back-icon">←</i> 返回题目列表
            </button>
          </div>
          
          <div class="problem-title">
            <h1>{{ problem.id }}. {{ problem.title }}</h1>
            <div 
              class="difficulty-tag"
              :class="problem.difficulty"
            >
              {{ getDifficultyLabel(problem.difficulty) }}
            </div>
          </div>
          
          <div class="problem-status-info">
            <div 
              class="status-badge"
              :class="{
                'status-solved': problem.status === 'solved',
                'status-attempted': problem.status === 'attempted',
                'status-unsolved': problem.status === 'unsolved'
              }"
            >
              {{ getStatusLabel(problem.status) }}
            </div>
          </div>
          
          <div class="problem-tags">
            <span 
              v-for="(tag, index) in problem.tags" 
              :key="index"
              class="tag"
            >
              {{ tag }}
            </span>
          </div>
        </div>
        
        <div class="description-content">
          <div class="section">
            <h2>题目描述</h2>
            <div v-html="problem.description"></div>
          </div>
          
          <div class="section">
            <h2>示例</h2>
            <div v-for="(example, index) in problem.examples" :key="index" class="example">
              <h3>示例 {{ index + 1 }}：</h3>
              <div class="example-content">
                <div class="example-input">
                  <strong>输入：</strong> {{ example.input }}
                </div>
                <div class="example-output">
                  <strong>输出：</strong> {{ example.output }}
                </div>
                <div v-if="example.explanation" class="example-explanation">
                  <strong>解释：</strong> {{ example.explanation }}
                </div>
              </div>
            </div>
          </div>
          
          <div class="section">
            <h2>约束条件</h2>
            <ul>
              <li v-for="(constraint, index) in problem.constraints" :key="index">
                {{ constraint }}
              </li>
            </ul>
          </div>
        </div>
      </div>
      
      <!-- 右侧代码编辑区域 -->
      <div class="code-editor-section">
        <div class="editor-header">
          <div class="language-selector">
            <span>编程语言：</span>
            <select v-model="selectedLanguage">
              <option v-for="lang in availableLanguages" :key="lang.value" :value="lang.value">
                {{ lang.label }}
              </option>
            </select>
          </div>
          
          <div class="action-buttons">
            <button class="reset-button" @click="resetCode">
              重置代码
            </button>
            <button class="run-button" :disabled="isCodeRunning" @click="runCode">
              {{ isCodeRunning ? '运行中...' : '运行代码' }}
            </button>
            <button class="submit-button" :disabled="isSubmitting" @click="submitSolution">
              {{ isSubmitting ? '提交中...' : '提交' }}
            </button>
          </div>
        </div>
        
        <div class="editor-container">
          <textarea
            class="code-editor"
            v-model="code"
            placeholder="请在此编写解题代码..."
            spellcheck="false"
          ></textarea>
        </div>
        
        <div class="result-section">
          <div class="result-tabs">
            <div 
              class="tab"
              :class="{ active: activeTab === 'console' }"
              @click="activeTab = 'console'"
            >
              控制台输出
            </div>
            <div 
              class="tab"
              :class="{ active: activeTab === 'testcases' }"
              @click="activeTab = 'testcases'"
            >
              测试用例
            </div>
          </div>
          
          <div class="tab-content">
            <div v-if="activeTab === 'console'" class="console-output">
              <div v-if="consoleOutput" class="output-content">
                <div 
                  v-for="(line, index) in consoleOutput.split('\n')" 
                  :key="index"
                  class="output-line"
                >
                  {{ line }}
                </div>
              </div>
              <div v-else class="no-output">
                <p>运行代码后，输出将显示在这里</p>
              </div>
            </div>
            
            <div v-if="activeTab === 'testcases'" class="test-cases">
              <div v-if="testCases.length > 0" class="test-case-list">
                <div 
                  v-for="(testCase, index) in testCases" 
                  :key="index"
                  class="test-case-item"
                  :class="{ 'test-passed': testCase.passed, 'test-failed': !testCase.passed }"
                >
                  <div class="test-header">
                    <div class="test-name">测试用例 {{ index + 1 }}</div>
                    <div class="test-status">
                      {{ testCase.passed ? '通过' : '失败' }}
                    </div>
                  </div>
                  <div class="test-details">
                    <div class="test-input">
                      <strong>输入：</strong> {{ testCase.input }}
                    </div>
                    <div class="test-expected">
                      <strong>期望输出：</strong> {{ testCase.expected }}
                    </div>
                    <div class="test-actual">
                      <strong>实际输出：</strong> {{ testCase.actual }}
                    </div>
                  </div>
                </div>
              </div>
              <div v-else class="no-tests">
                <p>运行代码后，测试结果将显示在这里</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script lang="ts">
import { defineComponent, ref, onMounted, computed, watch } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import { problemService } from '../services/ProblemService';
import type { Problem } from '../services/ProblemService';

export default defineComponent({
  name: 'ProblemDetailView',
  props: {
    id: {
      type: [String, Number],
      required: false
    }
  },
  setup(props) {
    const route = useRoute();
    const router = useRouter();
    const problemId = computed(() => props.id || route.params.id);
    const loading = ref(true);
    
    // 代码相关状态
    const selectedLanguage = ref('javascript');
    const code = ref('');
    const isCodeRunning = ref(false);
    const isSubmitting = ref(false);
    const consoleOutput = ref('');
    const activeTab = ref('console');
    const testCases = ref<{
      input: string;
      expected: string;
      actual: string;
      passed: boolean;
    }[]>([]);
    
    // 题目数据
    const problem = ref<Problem>({
      id: '',
      title: '',
      difficulty: 'easy',
      tags: [],
      status: 'unsolved'
    });
    
    // 可用编程语言
    const availableLanguages = [
      { label: 'JavaScript', value: 'javascript' },
      { label: 'Python', value: 'python' },
      { label: 'Java', value: 'java' },
      { label: 'C++', value: 'cpp' }
    ];
    
    // 获取题目详情
    const fetchProblemDetail = async () => {
      loading.value = true;
      
      try {
        console.log('获取题目详情:', problemId.value);
        const data = await problemService.getProblemDetail(problemId.value as string);
        problem.value = data;
        
        // 根据题目设置相应的代码模板
        resetCode();
      } catch (error) {
        console.error('获取题目详情失败', error);
      } finally {
        loading.value = false;
      }
    };
    
    // 示例代码模板
    const getCodeTemplate = (id: string) => {
      // 根据题目ID返回对应的代码模板
      const templates: Record<string, Record<string, string>> = {
        'P0001': {
          javascript: `/**
 * @param {number[]} nums
 * @param {number} target
 * @return {number[]}
 */
var twoSum = function(nums, target) {
    // 在这里编写你的代码
    
};`,
          python: `class Solution:
    def twoSum(self, nums: List[int], target: int) -> List[int]:
        # 在这里编写你的代码
        pass`,
          java: `class Solution {
    public int[] twoSum(int[] nums, int target) {
        // 在这里编写你的代码
        
    }
}`,
          cpp: `class Solution {
public:
    vector<int> twoSum(vector<int>& nums, int target) {
        // 在这里编写你的代码
        
    }
};`
        },
        'P0002': {
          javascript: `/**
 * @param {character[][]} board
 * @param {string} word
 * @return {boolean}
 */
var exist = function(board, word) {
    // 在这里编写你的代码
    
};`,
          python: `class Solution:
    def exist(self, board: List[List[str]], word: str) -> bool:
        # 在这里编写你的代码
        pass`,
          java: `class Solution {
    public boolean exist(char[][] board, String word) {
        // 在这里编写你的代码
        
    }
}`,
          cpp: `class Solution {
public:
    bool exist(vector<vector<char>>& board, string word) {
        // 在这里编写你的代码
        
    }
};`
        }
      };
      
      // 默认模板，如果没有针对特定题目的模板
      const defaultTemplates: Record<string, string> = {
        javascript: `/**
 * 请根据题目要求编写代码
 */
function solution() {
    // 在这里编写你的代码
    
}`,
        python: `class Solution:
    def solution(self):
        # 在这里编写你的代码
        pass`,
        java: `class Solution {
    public void solution() {
        // 在这里编写你的代码
        
    }
}`,
        cpp: `class Solution {
public:
    void solution() {
        // 在这里编写你的代码
        
    }
};`
      };
      
      const language = selectedLanguage.value as keyof typeof defaultTemplates;
      
      // 首先尝试从特定题目模板中获取
      if (templates[id] && templates[id][language]) {
        return templates[id][language];
      }
      
      // 否则返回默认模板
      return defaultTemplates[language];
    };
    
    // 重置代码为模板
    const resetCode = () => {
      code.value = getCodeTemplate(problem.value.id);
    };
    
    // 返回题目列表
    const goBack = () => {
      router.push('/practice');
    };
    
    // 运行代码
    const runCode = async () => {
      if (isCodeRunning.value) return;
      
      isCodeRunning.value = true;
      consoleOutput.value = '正在运行代码...\n';
      activeTab.value = 'console';
      
      try {
        const result = await problemService.runCode(
          problem.value.id,
          selectedLanguage.value,
          code.value
        );
        
        consoleOutput.value = result.output;
        testCases.value = result.testCases;
      } catch (error) {
        console.error('运行代码失败', error);
        consoleOutput.value += '运行失败: ' + (error as Error).message;
      } finally {
        isCodeRunning.value = false;
      }
    };
    
    // 获取状态标签
    const getStatusLabel = (status: string) => {
      switch (status) {
        case 'solved': return '已解决';
        case 'attempted': return '尝试过';
        case 'unsolved': return '未解决';
        default: return '未知';
      }
    };
    
    // 提交解决方案
    const submitSolution = async () => {
      if (isSubmitting.value) return;
      
      isSubmitting.value = true;
      consoleOutput.value = '正在提交代码...\n';
      activeTab.value = 'console';
      
      try {
        const result = await problemService.submitCode(
          problem.value.id,
          selectedLanguage.value,
          code.value
        );
        
        if (result.status === 'accepted') {
          // 更新当前题目状态为已解决
          problem.value.status = 'solved';
          
          consoleOutput.value += '提交成功！恭喜你通过了所有测试用例。\n';
          consoleOutput.value += `运行时间: ${result.runtime}ms\n`;
          consoleOutput.value += `内存消耗: ${result.memory}MB\n`;
        } else {
          consoleOutput.value += `提交失败: ${result.status}\n`;
        }
        
        testCases.value = result.testCases;
      } catch (error) {
        console.error('提交代码失败', error);
        consoleOutput.value += '提交失败: ' + (error as Error).message;
      } finally {
        isSubmitting.value = false;
      }
    };
    
    // 获取难度标签
    const getDifficultyLabel = (difficulty: string) => {
      switch (difficulty) {
        case 'easy': return '简单';
        case 'medium': return '中等';
        case 'hard': return '困难';
        default: return '未知';
      }
    };
    
    // 监听题目ID变化
    watch(problemId, () => {
      fetchProblemDetail();
    });
    
    // 监听语言变化，更新代码模板
    watch(selectedLanguage, () => {
      // 只有当代码为空或与当前模板匹配时才更新
      const currentTemplate = getCodeTemplate(problem.value.id);
      if (!code.value || code.value === currentTemplate) {
        resetCode();
      }
    });
    
    // 组件挂载时获取题目详情
    onMounted(() => {
      fetchProblemDetail();
    });
    
    return {
      loading,
      problem,
      selectedLanguage,
      availableLanguages,
      code,
      isCodeRunning,
      isSubmitting,
      consoleOutput,
      activeTab,
      testCases,
      resetCode,
      runCode,
      submitSolution,
      goBack,
      getDifficultyLabel,
      getStatusLabel
    };
  }
});
</script>

<style scoped>
.problem-detail-page {
  padding: 20px;
  background-color: #f5f7f9;
  min-height: calc(100vh - 70px);
}

.problem-container {
  max-width: 1400px;
  margin: 0 auto;
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 20px;
}

/* 左侧题目描述区域 */
.problem-description {
  background-color: white;
  border-radius: 8px;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
  overflow: hidden;
}

.problem-header {
  padding: 20px;
  border-bottom: 1px solid #eee;
}

.go-back button {
  background: none;
  border: none;
  color: #1677ff;
  padding: 0;
  font-size: 14px;
  cursor: pointer;
  margin-bottom: 15px;
  display: flex;
  align-items: center;
  gap: 5px;
}

.go-back button:hover {
  text-decoration: underline;
}

.back-icon {
  font-style: normal;
}

.problem-title {
  display: flex;
  align-items: center;
  margin-bottom: 12px;
}

.problem-title h1 {
  font-size: 20px;
  margin: 0;
  margin-right: 12px;
}

.difficulty-tag {
  padding: 3px 8px;
  border-radius: 4px;
  font-size: 12px;
  font-weight: 500;
}

.difficulty-tag.easy {
  background-color: #f6ffed;
  color: #52c41a;
  border: 1px solid #b7eb8f;
}

.difficulty-tag.medium {
  background-color: #fffbe6;
  color: #faad14;
  border: 1px solid #ffe58f;
}

.difficulty-tag.hard {
  background-color: #fff2f0;
  color: #f5222d;
  border: 1px solid #ffccc7;
}

.problem-status-info {
  margin: 8px 0;
}

.status-badge {
  display: inline-block;
  padding: 3px 8px;
  border-radius: 4px;
  font-size: 12px;
  font-weight: 500;
}

.status-solved {
  background-color: #f6ffed;
  color: #52c41a;
  border: 1px solid #b7eb8f;
}

.status-attempted {
  background-color: #e6f7ff;
  color: #1890ff;
  border: 1px solid #91d5ff;
}

.status-unsolved {
  background-color: #f5f5f5;
  color: #888;
  border: 1px solid #d9d9d9;
}

.problem-tags {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
}

.tag {
  padding: 2px 8px;
  background-color: #f5f5f5;
  border-radius: 4px;
  font-size: 12px;
  color: #666;
}

.description-content {
  padding: 20px;
  max-height: calc(100vh - 200px);
  overflow-y: auto;
}

.section {
  margin-bottom: 24px;
}

.section h2 {
  font-size: 16px;
  margin-bottom: 12px;
  color: #333;
  border-bottom: 1px solid #f0f0f0;
  padding-bottom: 8px;
}

.example {
  margin-bottom: 16px;
  background-color: #f9f9f9;
  border-radius: 4px;
  padding: 12px;
}

.example h3 {
  font-size: 14px;
  margin-top: 0;
  margin-bottom: 8px;
  color: #333;
}

.example-content {
  font-size: 14px;
  line-height: 1.6;
}

.example-input,
.example-output,
.example-explanation {
  margin-bottom: 8px;
}

.description-content ul {
  padding-left: 24px;
  margin: 0;
}

.description-content li {
  margin-bottom: 8px;
  font-size: 14px;
  line-height: 1.6;
}

.description-content code {
  background-color: #f5f5f5;
  padding: 2px 4px;
  border-radius: 4px;
  font-family: monospace;
  font-size: 90%;
}

/* 右侧代码编辑区域 */
.code-editor-section {
  background-color: white;
  border-radius: 8px;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
  display: flex;
  flex-direction: column;
}

.editor-header {
  padding: 12px 16px;
  display: flex;
  justify-content: space-between;
  align-items: center;
  border-bottom: 1px solid #eee;
}

.language-selector {
  display: flex;
  align-items: center;
  gap: 8px;
}

.language-selector select {
  padding: 6px 10px;
  border: 1px solid #ddd;
  border-radius: 4px;
  font-size: 14px;
  background-color: white;
}

.action-buttons {
  display: flex;
  gap: 10px;
}

.reset-button,
.run-button,
.submit-button {
  padding: 6px 12px;
  border-radius: 4px;
  font-size: 14px;
  cursor: pointer;
  border: none;
}

.reset-button {
  background-color: #f0f0f0;
  color: #666;
}

.reset-button:hover {
  background-color: #e0e0e0;
}

.run-button {
  background-color: #1677ff;
  color: white;
}

.run-button:hover:not(:disabled) {
  background-color: #4096ff;
}

.submit-button {
  background-color: #52c41a;
  color: white;
}

.submit-button:hover:not(:disabled) {
  background-color: #73d13d;
}

.run-button:disabled,
.submit-button:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

.editor-container {
  flex: 1;
  padding: 12px;
  border-bottom: 1px solid #eee;
}

.code-editor {
  width: 100%;
  height: 300px;
  border: 1px solid #eee;
  border-radius: 4px;
  padding: 12px;
  font-family: monospace;
  font-size: 14px;
  line-height: 1.5;
  resize: none;
  background-color: #fafafa;
}

.code-editor:focus {
  outline: 1px solid #40a9ff;
  border-color: #40a9ff;
}

.result-section {
  padding: 12px;
}

.result-tabs {
  display: flex;
  border-bottom: 1px solid #eee;
  margin-bottom: 12px;
}

.tab {
  padding: 8px 16px;
  cursor: pointer;
  font-size: 14px;
  color: #666;
  border-bottom: 2px solid transparent;
}

.tab.active {
  color: #1677ff;
  border-bottom-color: #1677ff;
}

.tab-content {
  min-height: 150px;
  max-height: 300px;
  overflow-y: auto;
}

.console-output,
.test-cases {
  font-family: monospace;
  font-size: 14px;
  line-height: 1.5;
}

.output-content {
  background-color: #fafafa;
  padding: 12px;
  border-radius: 4px;
}

.output-line {
  margin-bottom: 2px;
}

.no-output,
.no-tests {
  color: #999;
  text-align: center;
  padding: 40px 0;
}

.test-case-list {
  display: flex;
  flex-direction: column;
  gap: 10px;
}

.test-case-item {
  border-radius: 4px;
  overflow: hidden;
  border: 1px solid #eee;
}

.test-header {
  display: flex;
  justify-content: space-between;
  padding: 8px 12px;
  background-color: #f9f9f9;
}

.test-name {
  font-weight: 500;
}

.test-status {
  font-weight: 500;
}

.test-passed .test-header {
  background-color: #f6ffed;
}

.test-passed .test-status {
  color: #52c41a;
}

.test-failed .test-header {
  background-color: #fff2f0;
}

.test-failed .test-status {
  color: #f5222d;
}

.test-details {
  padding: 12px;
  font-size: 13px;
  line-height: 1.5;
}

.test-input,
.test-expected,
.test-actual {
  margin-bottom: 6px;
}

/* 响应式布局 */
@media (max-width: 1200px) {
  .problem-container {
    grid-template-columns: 1fr;
  }
}
</style> 