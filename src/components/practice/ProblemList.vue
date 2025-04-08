<template>
  <div class="problem-list-container">
    <div v-if="loading" class="loading-state">
      <div class="loading-spinner"></div>
      <p>加载中...</p>
    </div>
    
    <div v-else-if="filteredProblems.length === 0" class="empty-state">
      <i class="fas fa-search"></i>
      <p>没有找到符合条件的题目</p>
      <button @click="resetFilters" class="reset-button">重置筛选条件</button>
    </div>
    
    <div v-else class="problem-list">
      <div class="problem-list-header">
        <div class="problem-header-status">状态</div>
        <div class="problem-header-id">编号</div>
        <div class="problem-header-title">标题</div>
        <div class="problem-header-difficulty">难度</div>
        <div class="problem-header-tags">标签</div>
      </div>
      
      <div class="problem-list-body">
        <div
          v-for="problem in displayedProblems"
          :key="problem.id"
          @click="navigateToProblem(problem.id)"
          class="problem-item"
          :class="{ 'solved': problem.status === 'solved', 'attempted': problem.status === 'attempted' }"
        >
          <div class="problem-status">
            <span
              class="status-dot"
              :class="{
                'status-solved': problem.status === 'solved',
                'status-attempted': problem.status === 'attempted',
                'status-unsolved': problem.status === 'unsolved'
              }"
              :title="getStatusText(problem.status)"
            ></span>
          </div>
          
          <div class="problem-id">{{ problem.id }}</div>
          
          <div class="problem-title">
            {{ problem.title }}
          </div>
          
          <div class="problem-difficulty">
            <span
              class="difficulty-badge"
              :class="{
                'easy': problem.difficulty === 'easy',
                'medium': problem.difficulty === 'medium',
                'hard': problem.difficulty === 'hard'
              }"
            >
              {{ getDifficultyText(problem.difficulty) }}
            </span>
          </div>
          
          <div class="problem-tags">
            <span 
              v-for="(tag, index) in problem.tags.slice(0, 2)" 
              :key="index" 
              class="tag-badge"
            >
              {{ tag }}
            </span>
            <span v-if="problem.tags.length > 2" class="more-tags">
              +{{ problem.tags.length - 2 }}
            </span>
          </div>
        </div>
      </div>
    </div>
    
    <div v-if="filteredProblems.length > 0" class="pagination">
      <button 
        @click="prevPage" 
        class="page-btn" 
        :disabled="currentPage === 1"
      >
        <i class="fas fa-chevron-left"></i>
      </button>
      
      <div class="page-info">
        {{ currentPage }} / {{ totalPages }}
      </div>
      
      <button 
        @click="nextPage" 
        class="page-btn" 
        :disabled="currentPage === totalPages"
      >
        <i class="fas fa-chevron-right"></i>
      </button>
    </div>
  </div>
</template>

<script lang="ts">
import { defineComponent, computed, ref, PropType, watch } from 'vue';
import { useRouter } from 'vue-router';
import { Problem } from '../../services/ProblemService';

export default defineComponent({
  name: 'ProblemList',
  props: {
    problems: {
      type: Array as PropType<Problem[]>,
      required: true
    },
    loading: {
      type: Boolean,
      default: false
    },
    searchKeyword: {
      type: String,
      default: ''
    },
    selectedDifficulty: {
      type: String,
      default: ''
    },
    selectedTags: {
      type: Array as PropType<string[]>,
      default: () => []
    }
  },
  emits: ['reset-filters'],
  setup(props, { emit }) {
    const router = useRouter();
    const currentPage = ref(1);
    const pageSize = ref(10);
    
    // 根据筛选条件过滤题目
    const filteredProblems = computed(() => {
      let result = [...props.problems];
      
      // 根据关键词筛选
      if (props.searchKeyword) {
        const keyword = props.searchKeyword.toLowerCase();
        result = result.filter(problem => 
          problem.title.toLowerCase().includes(keyword) || 
          problem.id.toLowerCase().includes(keyword)
        );
      }
      
      // 根据难度筛选
      if (props.selectedDifficulty) {
        result = result.filter(problem => 
          problem.difficulty === props.selectedDifficulty
        );
      }
      
      // 根据标签筛选
      if (props.selectedTags && props.selectedTags.length > 0) {
        result = result.filter(problem => 
          props.selectedTags.some(tag => problem.tags.includes(tag))
        );
      }
      
      return result;
    });
    
    // 计算总页数
    const totalPages = computed(() => {
      return Math.ceil(filteredProblems.value.length / pageSize.value);
    });
    
    // 当前页显示的题目
    const displayedProblems = computed(() => {
      const start = (currentPage.value - 1) * pageSize.value;
      const end = start + pageSize.value;
      return filteredProblems.value.slice(start, end);
    });
    
    // 翻页方法
    function nextPage() {
      if (currentPage.value < totalPages.value) {
        currentPage.value++;
      }
    }
    
    function prevPage() {
      if (currentPage.value > 1) {
        currentPage.value--;
      }
    }
    
    // 重置筛选条件
    function resetFilters() {
      emit('reset-filters');
    }
    
    // 导航到题目详情页
    function navigateToProblem(id: string) {
      router.push(`/practice/problem/${id}`);
    }
    
    // 获取状态文本
    function getStatusText(status: string) {
      switch (status) {
        case 'solved':
          return '已解决';
        case 'attempted':
          return '尝试过';
        case 'unsolved':
        default:
          return '未解决';
      }
    }
    
    // 获取难度文本
    function getDifficultyText(difficulty: string) {
      switch (difficulty) {
        case 'easy':
          return '简单';
        case 'medium':
          return '中等';
        case 'hard':
          return '困难';
        default:
          return '未知';
      }
    }
    
    // 监听筛选条件变化，重置页码
    watch(
      [
        () => props.searchKeyword, 
        () => props.selectedDifficulty, 
        () => props.selectedTags
      ],
      () => {
        currentPage.value = 1;
      }
    );
    
    return {
      currentPage,
      totalPages,
      filteredProblems,
      displayedProblems,
      nextPage,
      prevPage,
      resetFilters,
      navigateToProblem,
      getStatusText,
      getDifficultyText
    };
  }
});
</script>

<style scoped>
.problem-list-container {
  display: flex;
  flex-direction: column;
  border: 1px solid #e0e0e0;
  border-radius: 4px;
  background-color: white;
  overflow: hidden;
}

.loading-state, .empty-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 40px 0;
  color: #666;
}

.loading-spinner {
  width: 40px;
  height: 40px;
  border: 3px solid rgba(0, 123, 255, 0.2);
  border-top-color: #007bff;
  border-radius: 50%;
  animation: spin 1s linear infinite;
  margin-bottom: 10px;
}

@keyframes spin {
  to { transform: rotate(360deg); }
}

.empty-state i {
  font-size: 40px;
  margin-bottom: 10px;
  color: #aaa;
}

.reset-button {
  margin-top: 10px;
  padding: 6px 12px;
  background-color: #f8f9fa;
  border: 1px solid #e0e0e0;
  border-radius: 4px;
  cursor: pointer;
  transition: all 0.2s;
}

.reset-button:hover {
  background-color: #e0e0e0;
}

.problem-list-header {
  display: flex;
  align-items: center;
  padding: 10px 15px;
  background-color: #f8f9fa;
  border-bottom: 1px solid #e0e0e0;
  font-weight: 500;
}

.problem-header-status {
  width: 50px;
  text-align: center;
}

.problem-header-id {
  width: 70px;
}

.problem-header-title {
  flex: 1;
}

.problem-header-difficulty {
  width: 90px;
  text-align: center;
}

.problem-header-tags {
  width: 180px;
}

.problem-list-body {
  max-height: 600px;
  overflow-y: auto;
}

.problem-item {
  display: flex;
  align-items: center;
  padding: 12px 15px;
  border-bottom: 1px solid #f0f0f0;
  cursor: pointer;
  transition: background-color 0.2s;
}

.problem-item:hover {
  background-color: #f5f5f5;
}

.problem-item:last-child {
  border-bottom: none;
}

.problem-item.solved {
  background-color: rgba(40, 167, 69, 0.05);
}

.problem-item.attempted {
  background-color: rgba(255, 193, 7, 0.05);
}

.problem-status {
  width: 50px;
  display: flex;
  justify-content: center;
  align-items: center;
}

.status-dot {
  width: 10px;
  height: 10px;
  border-radius: 50%;
  display: inline-block;
}

.status-solved {
  background-color: #28a745;
}

.status-attempted {
  background-color: #ffc107;
}

.status-unsolved {
  background-color: #e0e0e0;
}

.problem-id {
  width: 70px;
  font-size: 14px;
  color: #666;
}

.problem-title {
  flex: 1;
  font-weight: 500;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.problem-difficulty {
  width: 90px;
  text-align: center;
}

.difficulty-badge {
  padding: 3px 8px;
  border-radius: 10px;
  font-size: 12px;
  font-weight: 500;
}

.difficulty-badge.easy {
  background-color: rgba(40, 167, 69, 0.1);
  color: #28a745;
}

.difficulty-badge.medium {
  background-color: rgba(255, 193, 7, 0.1);
  color: #e67700;
}

.difficulty-badge.hard {
  background-color: rgba(220, 53, 69, 0.1);
  color: #dc3545;
}

.problem-tags {
  width: 180px;
  display: flex;
  flex-wrap: wrap;
  gap: 4px;
}

.tag-badge {
  padding: 2px 6px;
  background-color: #f1f1f1;
  color: #666;
  border-radius: 10px;
  font-size: 12px;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  max-width: 80px;
}

.more-tags {
  font-size: 12px;
  color: #888;
}

.pagination {
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 10px;
  border-top: 1px solid #e0e0e0;
}

.page-btn {
  width: 30px;
  height: 30px;
  border: 1px solid #e0e0e0;
  border-radius: 4px;
  background: white;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
}

.page-btn:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.page-btn:not(:disabled):hover {
  background-color: #f0f0f0;
}

.page-info {
  margin: 0 10px;
  font-size: 14px;
  color: #666;
}
</style> 