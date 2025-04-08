<template>
  <div class="code-editor-container">
    <div class="editor-toolbar">
      <div class="language-selector">
        <label for="language">编程语言:</label>
        <select id="language" v-model="selectedLanguage" @change="changeLanguage">
          <option v-for="lang in languages" :key="lang.value" :value="lang.value">
            {{ lang.label }}
          </option>
        </select>
      </div>
      <div class="editor-actions">
        <button class="btn-reset" @click="resetCode">
          <i class="fas fa-undo"></i> 重置
        </button>
        <button class="btn-run" @click="runCode" :disabled="isRunning">
          <i class="fas fa-play"></i> 运行
        </button>
        <button class="btn-submit" @click="submitCode" :disabled="isSubmitting">
          <i class="fas fa-paper-plane"></i> 提交
        </button>
      </div>
    </div>
    
    <div class="code-area">
      <textarea
        ref="codeTextarea"
        v-model="code"
        @input="handleInput"
        :placeholder="'请在此输入您的代码...'"
        spellcheck="false"
      ></textarea>
    </div>
    
    <div class="output-section">
      <div class="output-tabs">
        <div 
          class="tab" 
          :class="{ 'active': activeTab === 'console' }"
          @click="activeTab = 'console'"
        >
          控制台输出
        </div>
        <div 
          class="tab" 
          :class="{ 'active': activeTab === 'testcases' }"
          @click="activeTab = 'testcases'"
        >
          测试用例
        </div>
      </div>
      
      <div class="tab-content">
        <div v-if="activeTab === 'console'" class="console-output">
          <pre>{{ consoleOutput || '运行代码后将在此显示输出结果...' }}</pre>
        </div>
        <div v-if="activeTab === 'testcases'" class="testcases">
          <div v-if="testCases.length === 0" class="no-testcases">
            暂无测试用例
          </div>
          <div v-else class="testcase-list">
            <div 
              v-for="(testCase, index) in testCases" 
              :key="index"
              class="testcase-item"
              :class="{ 'passed': testCase.status === 'passed', 'failed': testCase.status === 'failed' }"
            >
              <div class="testcase-header">
                <span class="testcase-title">测试用例 #{{ index + 1 }}</span>
                <span v-if="testCase.status" class="testcase-status">
                  {{ testCase.status === 'passed' ? '通过' : '失败' }}
                </span>
              </div>
              <div class="testcase-details">
                <div class="testcase-input">
                  <div class="testcase-label">输入:</div>
                  <pre>{{ testCase.input }}</pre>
                </div>
                <div class="testcase-expected">
                  <div class="testcase-label">预期输出:</div>
                  <pre>{{ testCase.expected }}</pre>
                </div>
                <div v-if="testCase.actual" class="testcase-actual">
                  <div class="testcase-label">实际输出:</div>
                  <pre>{{ testCase.actual }}</pre>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script lang="ts">
import { defineComponent, ref, onMounted, watch } from 'vue';

interface Language {
  label: string;
  value: string;
  template: string;
}

interface TestCase {
  input: string;
  expected: string;
  actual?: string;
  status?: 'passed' | 'failed';
}

export default defineComponent({
  name: 'CodeEditor',
  props: {
    initialCode: {
      type: String,
      default: ''
    },
    problemId: {
      type: String,
      required: true
    },
    initialLanguage: {
      type: String,
      default: 'javascript'
    },
    initialTestCases: {
      type: Array as () => TestCase[],
      default: () => []
    }
  },
  emits: ['run', 'submit', 'code-change', 'language-change'],
  setup(props, { emit }) {
    const selectedLanguage = ref(props.initialLanguage);
    const code = ref(props.initialCode || getTemplateForLanguage(props.initialLanguage));
    const isRunning = ref(false);
    const isSubmitting = ref(false);
    const consoleOutput = ref('');
    const activeTab = ref('console');
    const testCases = ref<TestCase[]>(props.initialTestCases);
    const codeTextarea = ref<HTMLTextAreaElement | null>(null);

    const languages: Language[] = [
      { 
        label: 'JavaScript', 
        value: 'javascript',
        template: '/**\n * @param {any} params - 输入参数\n * @return {any} - 返回结果\n */\nfunction solution(params) {\n  // 请在此处编写您的代码\n  \n  return;\n}\n'
      },
      { 
        label: 'Python', 
        value: 'python',
        template: '# 请在此处编写您的代码\ndef solution(params):\n    # 实现您的解决方案\n    \n    return\n'
      },
      { 
        label: 'Java', 
        value: 'java',
        template: 'class Solution {\n    /**\n     * @param params 输入参数\n     * @return 返回结果\n     */\n    public Object solution(Object params) {\n        // 请在此处编写您的代码\n        \n        return null;\n    }\n}\n'
      },
      { 
        label: 'C++', 
        value: 'cpp',
        template: '#include <iostream>\n#include <vector>\n#include <string>\n\n// 请在此处编写您的代码\nclass Solution {\npublic:\n    // 实现您的解决方案\n    void solution() {\n        \n    }\n};\n'
      }
    ];

    function getTemplateForLanguage(lang: string): string {
      const language = languages.find(l => l.value === lang);
      return language ? language.template : '';
    }

    function changeLanguage() {
      const newTemplate = getTemplateForLanguage(selectedLanguage.value);
      // 如果代码区为空或者只是模板代码，则直接替换为新模板
      if (!code.value.trim() || isTemplateCode(code.value, selectedLanguage.value)) {
        code.value = newTemplate;
      } else {
        // 否则询问用户是否要替换
        if (confirm('切换语言将会重置当前代码，是否继续？')) {
          code.value = newTemplate;
        } else {
          // 恢复原来的语言选择
          selectedLanguage.value = props.initialLanguage;
          return;
        }
      }
      emit('language-change', selectedLanguage.value);
    }

    function isTemplateCode(currentCode: string, lang: string): boolean {
      // 简单比较当前代码是否基本上是模板代码
      const template = getTemplateForLanguage(lang);
      // 移除空格和换行符后比较
      const normalizedCurrentCode = currentCode.replace(/\s/g, '');
      const normalizedTemplate = template.replace(/\s/g, '');
      return normalizedCurrentCode === normalizedTemplate;
    }

    function resetCode() {
      if (confirm('确定要重置代码吗？所有更改将丢失。')) {
        code.value = getTemplateForLanguage(selectedLanguage.value);
        emit('code-change', code.value);
      }
    }

    function runCode() {
      if (!code.value.trim()) {
        consoleOutput.value = '错误：代码不能为空';
        activeTab.value = 'console';
        return;
      }

      isRunning.value = true;
      consoleOutput.value = '正在运行...';
      activeTab.value = 'console';

      // 通知父组件运行代码
      emit('run', {
        code: code.value,
        language: selectedLanguage.value,
        problemId: props.problemId,
        callback: (result: any) => {
          isRunning.value = false;
          
          if (result.error) {
            consoleOutput.value = `错误: ${result.error}`;
          } else {
            consoleOutput.value = result.output || '代码执行完成，没有输出';
            
            if (result.testCases) {
              testCases.value = result.testCases;
              if (result.testCases.some((tc: TestCase) => tc.status === 'failed')) {
                activeTab.value = 'testcases';
              }
            }
          }
        }
      });
    }

    function submitCode() {
      if (!code.value.trim()) {
        consoleOutput.value = '错误：代码不能为空';
        activeTab.value = 'console';
        return;
      }

      isSubmitting.value = true;
      consoleOutput.value = '正在提交...';
      
      // 通知父组件提交代码
      emit('submit', {
        code: code.value,
        language: selectedLanguage.value,
        problemId: props.problemId,
        callback: (result: any) => {
          isSubmitting.value = false;
          
          if (result.error) {
            consoleOutput.value = `提交失败: ${result.error}`;
            activeTab.value = 'console';
          } else {
            consoleOutput.value = result.message || '提交成功';
            
            if (result.testCases) {
              testCases.value = result.testCases;
              activeTab.value = 'testcases';
            }
          }
        }
      });
    }

    function handleInput() {
      emit('code-change', code.value);
    }

    onMounted(() => {
      // 如果没有初始代码，使用对应语言的模板
      if (!props.initialCode) {
        code.value = getTemplateForLanguage(selectedLanguage.value);
      }
    });

    watch(() => props.initialTestCases, (newTestCases) => {
      testCases.value = newTestCases;
    });

    return {
      selectedLanguage,
      languages,
      code,
      isRunning,
      isSubmitting,
      consoleOutput,
      activeTab,
      testCases,
      codeTextarea,
      changeLanguage,
      resetCode,
      runCode,
      submitCode,
      handleInput
    };
  }
});
</script>

<style scoped>
.code-editor-container {
  display: flex;
  flex-direction: column;
  height: 100%;
  border: 1px solid #e0e0e0;
  border-radius: 4px;
  overflow: hidden;
  background-color: #f8f9fa;
}

.editor-toolbar {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 10px;
  background-color: #f0f0f0;
  border-bottom: 1px solid #e0e0e0;
}

.language-selector {
  display: flex;
  align-items: center;
}

.language-selector label {
  margin-right: 8px;
  font-weight: 500;
}

.language-selector select {
  padding: 6px 10px;
  border: 1px solid #ccc;
  border-radius: 4px;
  background-color: white;
  font-size: 14px;
}

.editor-actions {
  display: flex;
  gap: 8px;
}

.editor-actions button {
  padding: 6px 12px;
  border: none;
  border-radius: 4px;
  font-size: 14px;
  cursor: pointer;
  display: flex;
  align-items: center;
  gap: 5px;
  transition: all 0.2s;
}

.editor-actions button:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

.btn-reset {
  background-color: #f0f0f0;
  color: #333;
}

.btn-reset:hover:not(:disabled) {
  background-color: #e0e0e0;
}

.btn-run {
  background-color: #28a745;
  color: white;
}

.btn-run:hover:not(:disabled) {
  background-color: #218838;
}

.btn-submit {
  background-color: #007bff;
  color: white;
}

.btn-submit:hover:not(:disabled) {
  background-color: #0069d9;
}

.code-area {
  flex-grow: 1;
  min-height: 300px;
  position: relative;
}

.code-area textarea {
  width: 100%;
  height: 100%;
  padding: 10px;
  font-family: 'Monaco', 'Menlo', 'Ubuntu Mono', 'Consolas', monospace;
  font-size: 14px;
  line-height: 1.5;
  border: none;
  resize: none;
  background-color: #1e1e1e;
  color: #d4d4d4;
  tab-size: 4;
}

.output-section {
  height: 200px;
  border-top: 1px solid #e0e0e0;
  background-color: white;
  display: flex;
  flex-direction: column;
}

.output-tabs {
  display: flex;
  background-color: #f0f0f0;
  border-bottom: 1px solid #e0e0e0;
}

.tab {
  padding: 8px 16px;
  cursor: pointer;
  font-size: 14px;
}

.tab:hover {
  background-color: #e0e0e0;
}

.tab.active {
  background-color: white;
  border-bottom: 2px solid #007bff;
  font-weight: 500;
}

.tab-content {
  flex-grow: 1;
  overflow: auto;
}

.console-output, .testcases {
  padding: 10px;
  height: 100%;
  overflow: auto;
}

.console-output pre {
  margin: 0;
  font-family: 'Monaco', 'Menlo', 'Ubuntu Mono', 'Consolas', monospace;
  white-space: pre-wrap;
  word-wrap: break-word;
}

.no-testcases {
  color: #666;
  font-style: italic;
  padding: 10px;
}

.testcase-list {
  display: flex;
  flex-direction: column;
  gap: 10px;
}

.testcase-item {
  border: 1px solid #e0e0e0;
  border-radius: 4px;
  overflow: hidden;
}

.testcase-item.passed {
  border-color: #28a745;
}

.testcase-item.failed {
  border-color: #dc3545;
}

.testcase-header {
  padding: 8px 12px;
  display: flex;
  justify-content: space-between;
  align-items: center;
  background-color: #f8f9fa;
  border-bottom: 1px solid #e0e0e0;
}

.testcase-title {
  font-weight: 500;
}

.testcase-status {
  padding: 3px 8px;
  border-radius: 10px;
  font-size: 12px;
  font-weight: 500;
}

.testcase-item.passed .testcase-status {
  background-color: rgba(40, 167, 69, 0.1);
  color: #28a745;
}

.testcase-item.failed .testcase-status {
  background-color: rgba(220, 53, 69, 0.1);
  color: #dc3545;
}

.testcase-details {
  padding: 10px;
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.testcase-label {
  font-weight: 500;
  margin-bottom: 2px;
}

.testcase-input pre,
.testcase-expected pre,
.testcase-actual pre {
  margin: 0;
  padding: 6px;
  background-color: #f8f9fa;
  border-radius: 4px;
  font-family: 'Monaco', 'Menlo', 'Ubuntu Mono', 'Consolas', monospace;
  font-size: 13px;
  white-space: pre-wrap;
  word-wrap: break-word;
}

.testcase-actual {
  margin-top: 5px;
}

.testcase-item.failed .testcase-actual pre {
  background-color: rgba(220, 53, 69, 0.05);
}
</style> 