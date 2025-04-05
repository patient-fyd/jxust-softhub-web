<template>
  <div class="practice-page">
    <div class="practice-header">
      <h1>在线刷题平台</h1>
      <p>提升编程能力，锻炼算法思维</p>
    </div>

    <div class="practice-container">
      <div class="filter-section">
        <div class="search-box">
          <input 
            type="text" 
            placeholder="搜索题目..." 
            v-model="searchKeyword"
            @keyup.enter="searchProblems"
          />
          <button @click="searchProblems">
            <i class="search-icon">🔍</i>
          </button>
        </div>
        
        <div class="filter-options">
          <div class="filter-group">
            <span class="filter-label">难度:</span>
            <div class="filter-tags">
              <div 
                v-for="level in difficultyLevels" 
                :key="level.value"
                class="filter-tag"
                :class="{ active: selectedDifficulty === level.value }"
                @click="selectedDifficulty = level.value"
              >
                {{ level.label }}
              </div>
            </div>
          </div>
          
          <div class="filter-group">
            <span class="filter-label">标签:</span>
            <div class="filter-tags">
              <div 
                v-for="tag in problemTags" 
                :key="tag.value"
                class="filter-tag"
                :class="{ active: selectedTags.includes(tag.value) }"
                @click="toggleTag(tag.value)"
              >
                {{ tag.label }}
              </div>
            </div>
          </div>
        </div>
      </div>

      <div class="problems-section">
        <h2>题目列表</h2>
        
        <div v-if="isLoading" class="loading-state">
          <div class="loading-spinner"></div>
          <span>加载中...</span>
        </div>
        
        <div v-else-if="filteredProblems.length === 0" class="empty-state">
          <p>没有找到符合条件的题目</p>
        </div>
        
        <div v-else class="problems-list">
          <div class="problem-header">
            <div class="problem-header-item status">状态</div>
            <div class="problem-header-item title">标题</div>
            <div class="problem-header-item difficulty">难度</div>
            <div class="problem-header-item tags">标签</div>
          </div>
          
          <div 
            v-for="problem in filteredProblems" 
            :key="problem.id"
            class="problem-item"
            @click="goToProblem(problem.id)"
          >
            <div class="problem-item-status">
              <span 
                class="status-indicator" 
                :class="getProblemStatus(problem.id)"
              ></span>
            </div>
            <div class="problem-item-title">{{ problem.title }}</div>
            <div 
              class="problem-item-difficulty"
              :class="getDifficultyClass(problem.difficulty)"
            >
              {{ getDifficultyLabel(problem.difficulty) }}
            </div>
            <div class="problem-item-tags">
              <span 
                v-for="(tag, index) in problem.tags" 
                :key="index"
                class="problem-tag"
              >
                {{ tag }}
              </span>
            </div>
          </div>
        </div>
        
        <div class="pagination">
          <button 
            :disabled="currentPage <= 1" 
            @click="changePage(currentPage - 1)"
          >
            上一页
          </button>
          <span class="page-info">{{ currentPage }} / {{ totalPages }}</span>
          <button 
            :disabled="currentPage >= totalPages" 
            @click="changePage(currentPage + 1)"
          >
            下一页
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script lang="ts">
import { defineComponent, ref, computed } from 'vue';
import { useRouter } from 'vue-router';

interface Problem {
  id: number;
  title: string;
  difficulty: 'easy' | 'medium' | 'hard';
  tags: string[];
  completed?: boolean;
  attempted?: boolean;
}

export default defineComponent({
  name: 'PracticePage',
  setup() {
    const router = useRouter();
    const searchKeyword = ref('');
    const selectedDifficulty = ref('all');
    const selectedTags = ref<string[]>([]);
    const currentPage = ref(1);
    const pageSize = ref(10);
    const isLoading = ref(false);
    
    // 难度等级选项
    const difficultyLevels = [
      { label: '全部', value: 'all' },
      { label: '简单', value: 'easy' },
      { label: '中等', value: 'medium' },
      { label: '困难', value: 'hard' }
    ];
    
    // 问题标签选项
    const problemTags = [
      { label: '数组', value: 'array' },
      { label: '字符串', value: 'string' },
      { label: '哈希表', value: 'hash-table' },
      { label: '动态规划', value: 'dp' },
      { label: '回溯', value: 'backtracking' },
      { label: '贪心', value: 'greedy' },
      { label: '深度优先搜索', value: 'dfs' },
      { label: '广度优先搜索', value: 'bfs' }
    ];
    
    // 示例题目数据
    const problems = ref<Problem[]>([
      {
        id: 1,
        title: '两数之和',
        difficulty: 'easy',
        tags: ['数组', '哈希表'],
        completed: true
      },
      {
        id: 2,
        title: '三数之和',
        difficulty: 'medium',
        tags: ['数组', '双指针']
      },
      {
        id: 3,
        title: '最长回文子串',
        difficulty: 'medium',
        tags: ['字符串', '动态规划']
      },
      {
        id: 4,
        title: '合并两个有序链表',
        difficulty: 'easy',
        tags: ['链表', '递归'],
        attempted: true
      },
      {
        id: 5,
        title: '最长有效括号',
        difficulty: 'hard',
        tags: ['字符串', '动态规划', '栈']
      },
      {
        id: 6,
        title: '接雨水',
        difficulty: 'hard',
        tags: ['栈', '数组', '双指针', '动态规划']
      },
      {
        id: 7,
        title: '全排列',
        difficulty: 'medium',
        tags: ['回溯']
      },
      {
        id: 8,
        title: '最大子数组和',
        difficulty: 'easy',
        tags: ['数组', '分治', '动态规划'],
        completed: true
      },
      {
        id: 9,
        title: '爬楼梯',
        difficulty: 'easy',
        tags: ['动态规划'],
        completed: true
      },
      {
        id: 10,
        title: '搜索旋转排序数组',
        difficulty: 'medium',
        tags: ['数组', '二分查找']
      },
      {
        id: 11,
        title: '二叉树的层序遍历',
        difficulty: 'medium',
        tags: ['树', '广度优先搜索']
      },
      {
        id: 12,
        title: '买卖股票的最佳时机',
        difficulty: 'easy',
        tags: ['数组', '动态规划']
      }
    ]);
    
    // 根据过滤条件筛选题目
    const filteredProblems = computed(() => {
      let result = [...problems.value];
      
      // 关键词搜索
      if (searchKeyword.value.trim()) {
        const keyword = searchKeyword.value.trim().toLowerCase();
        result = result.filter(problem => 
          problem.title.toLowerCase().includes(keyword) || 
          problem.tags.some(tag => tag.toLowerCase().includes(keyword))
        );
      }
      
      // 难度筛选
      if (selectedDifficulty.value !== 'all') {
        result = result.filter(problem => problem.difficulty === selectedDifficulty.value);
      }
      
      // 标签筛选
      if (selectedTags.value.length > 0) {
        result = result.filter(problem => 
          problem.tags.some(tag => {
            const normalizedTag = tag.toLowerCase().replace(/\s+/g, '-');
            return selectedTags.value.includes(normalizedTag);
          })
        );
      }
      
      // 分页处理
      const startIndex = (currentPage.value - 1) * pageSize.value;
      const endIndex = startIndex + pageSize.value;
      
      return result.slice(startIndex, endIndex);
    });
    
    // 计算总页数
    const totalPages = computed(() => {
      let filteredTotal = problems.value.length;
      
      // 应用筛选条件
      if (searchKeyword.value.trim() || selectedDifficulty.value !== 'all' || selectedTags.value.length > 0) {
        let filtered = [...problems.value];
        
        if (searchKeyword.value.trim()) {
          const keyword = searchKeyword.value.trim().toLowerCase();
          filtered = filtered.filter(problem => 
            problem.title.toLowerCase().includes(keyword) || 
            problem.tags.some(tag => tag.toLowerCase().includes(keyword))
          );
        }
        
        if (selectedDifficulty.value !== 'all') {
          filtered = filtered.filter(problem => problem.difficulty === selectedDifficulty.value);
        }
        
        if (selectedTags.value.length > 0) {
          filtered = filtered.filter(problem => 
            problem.tags.some(tag => {
              const normalizedTag = tag.toLowerCase().replace(/\s+/g, '-');
              return selectedTags.value.includes(normalizedTag);
            })
          );
        }
        
        filteredTotal = filtered.length;
      }
      
      return Math.ceil(filteredTotal / pageSize.value) || 1;
    });
    
    // 切换标签选择
    const toggleTag = (tag: string) => {
      if (selectedTags.value.includes(tag)) {
        selectedTags.value = selectedTags.value.filter(t => t !== tag);
      } else {
        selectedTags.value.push(tag);
      }
    };
    
    // 搜索题目
    const searchProblems = () => {
      currentPage.value = 1; // 重置到第一页
      isLoading.value = true;
      
      // 模拟加载延迟
      setTimeout(() => {
        isLoading.value = false;
      }, 500);
    };
    
    // 切换页码
    const changePage = (page: number) => {
      if (page < 1 || page > totalPages.value) return;
      currentPage.value = page;
      
      isLoading.value = true;
      
      // 模拟加载延迟
      setTimeout(() => {
        isLoading.value = false;
      }, 300);
    };
    
    // 获取题目状态样式
    const getProblemStatus = (id: number): string => {
      const problem = problems.value.find(p => p.id === id);
      if (!problem) return '';
      
      if (problem.completed) return 'completed';
      if (problem.attempted) return 'attempted';
      return '';
    };
    
    // 获取难度标签
    const getDifficultyLabel = (difficulty: string): string => {
      switch (difficulty) {
        case 'easy': return '简单';
        case 'medium': return '中等';
        case 'hard': return '困难';
        default: return '';
      }
    };
    
    // 获取难度样式类
    const getDifficultyClass = (difficulty: string): string => {
      return difficulty;
    };
    
    // 跳转到题目详情页
    const goToProblem = (id: number) => {
      router.push(`/practice/problem/${id}`);
    };
    
    return {
      searchKeyword,
      selectedDifficulty,
      selectedTags,
      currentPage,
      isLoading,
      difficultyLevels,
      problemTags,
      filteredProblems,
      totalPages,
      toggleTag,
      searchProblems,
      changePage,
      getProblemStatus,
      getDifficultyLabel,
      getDifficultyClass,
      goToProblem
    };
  }
});
</script>

<style scoped>
.practice-page {
  padding: 20px;
  background-color: #f5f7f9;
  min-height: calc(100vh - 70px);
}

.practice-header {
  text-align: center;
  margin-bottom: 30px;
}

.practice-header h1 {
  font-size: 28px;
  color: #333;
  margin-bottom: 8px;
}

.practice-header p {
  font-size: 16px;
  color: #666;
}

.practice-container {
  max-width: 1200px;
  margin: 0 auto;
  background-color: #fff;
  border-radius: 8px;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
  overflow: hidden;
}

.filter-section {
  padding: 20px;
  border-bottom: 1px solid #eee;
}

.search-box {
  display: flex;
  margin-bottom: 20px;
}

.search-box input {
  flex: 1;
  padding: 10px 15px;
  border: 1px solid #ddd;
  border-radius: 4px 0 0 4px;
  font-size: 14px;
  outline: none;
}

.search-box button {
  background-color: #1677ff;
  color: white;
  border: none;
  padding: 0 15px;
  border-radius: 0 4px 4px 0;
  cursor: pointer;
}

.search-icon {
  font-style: normal;
}

.filter-options {
  display: flex;
  flex-direction: column;
  gap: 15px;
}

.filter-group {
  display: flex;
  align-items: center;
}

.filter-label {
  font-weight: 500;
  margin-right: 15px;
  width: 50px;
}

.filter-tags {
  display: flex;
  flex-wrap: wrap;
  gap: 10px;
}

.filter-tag {
  padding: 5px 12px;
  background-color: #f0f0f0;
  border-radius: 16px;
  font-size: 14px;
  cursor: pointer;
  transition: all 0.2s;
}

.filter-tag:hover {
  background-color: #e0e0e0;
}

.filter-tag.active {
  background-color: #e6f7ff;
  color: #1677ff;
  border: 1px solid #91caff;
}

.problems-section {
  padding: 20px;
}

.problems-section h2 {
  font-size: 18px;
  margin-bottom: 20px;
  color: #333;
}

.loading-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 40px 0;
  color: #888;
}

.loading-spinner {
  width: 30px;
  height: 30px;
  border: 3px solid #f3f3f3;
  border-top: 3px solid #1677ff;
  border-radius: 50%;
  margin-bottom: 10px;
  animation: spin 1s linear infinite;
}

@keyframes spin {
  0% { transform: rotate(0deg); }
  100% { transform: rotate(360deg); }
}

.empty-state {
  text-align: center;
  padding: 40px 0;
  color: #888;
}

.problems-list {
  border: 1px solid #eee;
  border-radius: 4px;
}

.problem-header {
  display: flex;
  background-color: #f9f9f9;
  padding: 12px 15px;
  font-weight: 500;
  border-bottom: 1px solid #eee;
}

.problem-header-item {
  padding: 0 10px;
}

.problem-header-item.status {
  width: 60px;
}

.problem-header-item.title {
  flex: 1;
}

.problem-header-item.difficulty {
  width: 80px;
}

.problem-header-item.tags {
  width: 200px;
}

.problem-item {
  display: flex;
  padding: 15px;
  border-bottom: 1px solid #f5f5f5;
  align-items: center;
  cursor: pointer;
  transition: background-color 0.2s;
}

.problem-item:hover {
  background-color: #f5f5f5;
}

.problem-item-status {
  width: 60px;
  padding: 0 10px;
}

.status-indicator {
  display: inline-block;
  width: 10px;
  height: 10px;
  border-radius: 50%;
  background-color: #ccc;
}

.status-indicator.completed {
  background-color: #52c41a;
}

.status-indicator.attempted {
  background-color: #faad14;
}

.problem-item-title {
  flex: 1;
  padding: 0 10px;
  font-weight: 500;
}

.problem-item-difficulty {
  width: 80px;
  padding: 0 10px;
  font-size: 13px;
}

.problem-item-difficulty.easy {
  color: #52c41a;
}

.problem-item-difficulty.medium {
  color: #faad14;
}

.problem-item-difficulty.hard {
  color: #f5222d;
}

.problem-item-tags {
  width: 200px;
  padding: 0 10px;
  display: flex;
  flex-wrap: wrap;
  gap: 5px;
}

.problem-tag {
  font-size: 12px;
  padding: 2px 6px;
  background-color: #f0f0f0;
  border-radius: 4px;
  color: #666;
}

.pagination {
  display: flex;
  justify-content: center;
  padding: 20px 0 10px;
  align-items: center;
  gap: 15px;
}

.pagination button {
  padding: 6px 12px;
  background-color: #f0f0f0;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  transition: background-color 0.2s;
}

.pagination button:hover:not(:disabled) {
  background-color: #e0e0e0;
}

.pagination button:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.page-info {
  font-size: 14px;
  color: #666;
}

/* 响应式布局 */
@media (max-width: 768px) {
  .filter-group {
    flex-direction: column;
    align-items: flex-start;
    gap: 10px;
  }
  
  .filter-label {
    width: auto;
    margin-bottom: 5px;
  }
  
  .problem-header-item.tags,
  .problem-item-tags {
    display: none;
  }
  
  .problem-header-item.difficulty,
  .problem-item-difficulty {
    width: 60px;
  }
}
</style> 