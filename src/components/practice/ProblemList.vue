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
    
    <div v-if="filteredProblems.length > 0" class="pagination-wrapper">
      <Pagination
        :total="filteredProblems.length"
        :pageSize="pageSize"
        :currentPage="currentPage"
        :pageSizes="[10, 20, 30, 50]"
        @update:currentPage="$emit('update:currentPage', $event)"
        @update:pageSize="$emit('update:pageSize', $event)"
      />
    </div>
  </div>
</template>

<script lang="ts">
import { defineComponent, computed } from 'vue';
import type { PropType } from 'vue';
import { useRouter } from 'vue-router';
import type { Problem } from '../../services/ProblemService';
import Pagination from '../common/Pagination.vue';

export default defineComponent({
  name: 'ProblemList',
  components: {
    Pagination
  },
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
    },
    currentPage: {
      type: Number,
      default: 1
    },
    pageSize: {
      type: Number,
      default: 10
    }
  },
  emits: ['reset-filters', 'update:currentPage', 'update:pageSize'],
  setup(props, { emit }) {
    const router = useRouter();
    
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
    
    // 当前页显示的题目
    const displayedProblems = computed(() => {
      const start = (props.currentPage - 1) * props.pageSize;
      const end = start + props.pageSize;
      return filteredProblems.value.slice(start, end);
    });
    
    // 重置筛选条件
    function resetFilters() {
      emit('reset-filters');
    }
    
    // 导航到题目详情页
    function navigateToProblem(id: string) {
      const problem = props.problems.find(p => p.id === id);
      if (problem) {
        router.push({
          path: `/practice/problem/${id}`
        });
      }
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
    
    return {
      filteredProblems,
      displayedProblems,
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
  width: 100%;
  padding-bottom: 20px;
  display: flex;
  flex-direction: column;
  background-color: white;
  overflow: hidden;
}

.loading-state, .empty-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 60px 0;
  color: #666;
  min-height: 400px; /* 确保加载状态有固定高度 */
}

.loading-spinner {
  width: 40px;
  height: 40px;
  border: 3px solid rgba(71, 133, 255, 0.2);
  border-top-color: #4785ff;
  border-radius: 50%;
  animation: spin 1s linear infinite;
  margin-bottom: 15px;
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
  padding: 15px;
  background-color: #f8f9fa;
  border-bottom: 1px solid #e0e0e0;
  font-weight: 500;
  color: #444;
}

.problem-header-status {
  width: 40px;
  text-align: center;
}

.problem-header-id {
  width: 60px;
  font-weight: 500;
  text-align: center;
}

.problem-header-title {
  flex: 3;
  font-weight: 500;
  text-align: left;
  padding-left: 10px;
}

.problem-header-difficulty {
  width: 70px;
  font-weight: 500;
  text-align: center;
}

.problem-header-tags {
  width: 120px;
  font-weight: 500;
  text-align: center;
}

.problem-list {
  border: 1px solid #e8e8e8;
  border-radius: 8px;
  overflow: hidden;
  margin: 0 20px;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.05);
  max-width: 1000px;
  align-self: center;
  width: 100%;
}

.problem-list-body {
  max-height: 600px;
  overflow-y: auto;
  background-color: white;
}

.problem-item {
  display: flex;
  align-items: center;
  padding: 12px;
  border-bottom: 1px solid #f0f0f0;
  cursor: pointer;
  transition: background-color 0.2s, transform 0.1s;
}

.problem-item:hover {
  background-color: #f5f9ff;
  transform: translateY(-1px); /* 轻微上浮效果 */
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.05);
}

.problem-item:active {
  transform: translateY(0); /* 点击时回到原位置 */
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
  width: 40px;
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
  background-color: #52c41a;
  box-shadow: 0 0 4px rgba(82, 196, 26, 0.5);
}

.status-attempted {
  background-color: #1890ff;
  box-shadow: 0 0 4px rgba(24, 144, 255, 0.5);
}

.status-unsolved {
  background-color: #d9d9d9;
}

.problem-id {
  width: 60px;
  text-align: center;
}

.problem-title {
  flex: 3;
  text-align: left;
  padding-left: 10px;
  font-weight: 500;
  color: #333;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.problem-difficulty {
  width: 70px;
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
  width: 120px;
  display: flex;
  justify-content: center;
  gap: 4px;
  flex-wrap: wrap;
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
  max-width: 60px;
}

.more-tags {
  font-size: 12px;
  color: #888;
}

.pagination-wrapper {
  margin: 15px auto 0;
  background-color: white;
  border: 1px solid #e8e8e8;
  border-radius: 8px;
  padding: 10px;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.05);
  max-width: 1000px;
  width: calc(100% - 40px);
  display: flex;
  justify-content: center;
  align-items: center;
}

/* 增加题目条目之间的视觉区分 */
.problem-item:nth-child(even) {
  background-color: #fafbfc;
}

.problem-item:nth-child(odd) {
  background-color: #ffffff;
}

.problem-item.solved:nth-child(even) {
  background-color: rgba(40, 167, 69, 0.03);
}

.problem-item.solved:nth-child(odd) {
  background-color: rgba(40, 167, 69, 0.07);
}

.problem-item.attempted:nth-child(even) {
  background-color: rgba(255, 193, 7, 0.03);
}

.problem-item.attempted:nth-child(odd) {
  background-color: rgba(255, 193, 7, 0.07);
}

@media (max-width: 768px) {
  .problem-header-tags, .problem-tags {
    display: none;
  }
  
  .problem-header-difficulty, .problem-difficulty {
    width: 60px;
  }
  
  .problem-header-status, .problem-status {
    width: 30px;
  }
  
  .problem-header-id, .problem-id {
    width: 50px;
  }
  
  .problem-item, .problem-list-header {
    padding: 10px 8px;
  }
}
</style> 