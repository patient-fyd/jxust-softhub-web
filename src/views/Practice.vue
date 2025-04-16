<template>
  <div class="practice-container">
    <div class="practice-main">
      <div class="search-filters">
        <div class="search-box-container">
          <div class="search-box">
            <input 
              type="text" 
              v-model="searchKeyword" 
              placeholder="搜索题目..." 
              class="search-input"
            />
            <i class="fas fa-search search-icon"></i>
          </div>
          <button class="refresh-btn" @click="fetchProblems" title="刷新题目列表">
            <i class="fas fa-sync-alt"></i>
          </button>
        </div>
        
        <div class="filters">
          <div class="filter-group">
            <label>难度:</label>
            <div class="difficulty-filter">
              <button 
                class="filter-btn" 
                :class="{ active: selectedDifficulty === '' }"
                @click="selectedDifficulty = ''"
              >
                全部
              </button>
              <button 
                class="filter-btn" 
                :class="{ active: selectedDifficulty === 'easy' }"
                @click="selectedDifficulty = 'easy'"
              >
                简单
              </button>
              <button 
                class="filter-btn" 
                :class="{ active: selectedDifficulty === 'medium' }"
                @click="selectedDifficulty = 'medium'"
              >
                中等
              </button>
              <button 
                class="filter-btn" 
                :class="{ active: selectedDifficulty === 'hard' }"
                @click="selectedDifficulty = 'hard'"
              >
                困难
              </button>
            </div>
          </div>
          
          <div class="filter-group">
            <label>标签:</label>
            <div class="tags-filter">
              <div 
                v-for="tag in availableTags" 
                :key="tag"
                @click="toggleTag(tag)"
                class="tag-chip"
                :class="{ selected: selectedTags.includes(tag) }"
              >
                {{ tag }}
              </div>
            </div>
          </div>
        </div>
      </div>
      
      <ProblemList 
        :problems="problems" 
        :loading="loading"
        :searchKeyword="searchKeyword"
        :selectedDifficulty="selectedDifficulty"
        :selectedTags="selectedTags"
        @reset-filters="resetFilters"
      />
    </div>
  </div>
</template>

<script lang="ts">
import { defineComponent, ref, onMounted, onActivated } from 'vue';
import ProblemList from '../components/practice/ProblemList.vue';
import { problemService } from '../services/ProblemService';
import type { Problem } from '../services/ProblemService';

export default defineComponent({
  name: 'Practice',
  components: {
    ProblemList
  },
  setup() {
    const loading = ref(true);
    const problems = ref<Problem[]>([]);
    const searchKeyword = ref('');
    const selectedDifficulty = ref('');
    const selectedTags = ref<string[]>([]);
    
    // 可用的标签列表
    const availableTags = ref([
      '数组', '字符串', '哈希表', '动态规划', 
      '链表', '数学', '二叉树', '堆', '图',
      '贪心', '排序', '递归', '回溯', '二分查找'
    ]);
    
    // 获取题目数据
    const fetchProblems = async () => {
      loading.value = true;
      try {
        const fetchedProblems = await problemService.getProblems();
        
        // 确保题目ID唯一（去重）
        const uniqueProblems = [];
        const idSet = new Set();
        
        for (const problem of fetchedProblems) {
          // 如果ID不在集合中，则添加到结果数组
          if (!idSet.has(problem.id)) {
            idSet.add(problem.id);
            uniqueProblems.push(problem);
          }
        }
        
        // 确保题目按照ID排序，保证每次刷新后顺序一致
        problems.value = uniqueProblems.sort((a, b) => {
          // 从编号中提取数字部分进行比较
          const numA = parseInt(a.id.replace(/\D/g, ''));
          const numB = parseInt(b.id.replace(/\D/g, ''));
          return numA - numB;
        });
      } catch (error) {
        console.error('获取题目列表失败', error);
      } finally {
        loading.value = false;
      }
    };
    
    // 切换标签选择
    const toggleTag = (tag: string) => {
      if (selectedTags.value.includes(tag)) {
        selectedTags.value = selectedTags.value.filter(t => t !== tag);
      } else {
        selectedTags.value.push(tag);
      }
    };
    
    // 重置所有筛选条件
    const resetFilters = () => {
      searchKeyword.value = '';
      selectedDifficulty.value = '';
      selectedTags.value = [];
    };
    
    // 组件挂载时获取数据
    onMounted(() => {
      fetchProblems();
    });
    
    // 组件被激活时刷新数据（主要用于从详情页返回时刷新状态）
    onActivated(() => {
      fetchProblems();
    });
    
    return {
      loading,
      problems,
      searchKeyword,
      selectedDifficulty,
      selectedTags,
      availableTags,
      toggleTag,
      resetFilters,
      fetchProblems
    };
  }
});
</script>

<style scoped>
.practice-container {
  max-width: 1500px;
  margin: 0 auto;
  padding: 20px;
}

.practice-main {
  background-color: white;
  border-radius: 12px;
  box-shadow: 0 4px 16px rgba(0, 0, 0, 0.08);
  overflow: hidden;
}

.search-filters {
  padding: 24px 28px;
  border-bottom: 1px solid #eee;
  background-color: #f9fafb;
}

.search-box-container {
  display: flex;
  align-items: center;
  gap: 15px;
  width: 100%;
  margin-bottom: 24px;
  position: relative;
}

.search-box {
  position: relative;
  flex: 1;
}

.search-input {
  width: 100%;
  padding: 14px 20px 14px 45px;
  border: 1px solid #ddd;
  border-radius: 8px;
  font-size: 16px;
  transition: all 0.3s;
  background-color: white;
}

.search-input:focus {
  border-color: #4785ff;
  box-shadow: 0 0 0 2px rgba(71, 133, 255, 0.25);
  outline: none;
}

.search-icon {
  position: absolute;
  left: 15px;
  top: 50%;
  transform: translateY(-50%);
  color: #999;
  font-size: 18px;
}

.filters {
  display: flex;
  flex-direction: column;
  gap: 15px;
}

.filter-group {
  display: flex;
  align-items: center;
  margin-bottom: 5px;
}

.filter-group label {
  width: 60px;
  font-weight: 500;
  color: #555;
}

.difficulty-filter {
  display: flex;
  gap: 10px;
}

.filter-btn {
  padding: 8px 16px;
  border: 1px solid #ddd;
  border-radius: 6px;
  background-color: white;
  cursor: pointer;
  transition: all 0.2s;
  font-size: 14px;
  color: #555;
  font-weight: 500;
}

.filter-btn:hover {
  background-color: #f0f5ff;
  border-color: #c9d6ff;
}

.filter-btn.active {
  background-color: #4785ff;
  color: white;
  border-color: #4785ff;
  box-shadow: 0 2px 5px rgba(71, 133, 255, 0.2);
}

.tags-filter {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
  max-width: 100%;
}

.tag-chip {
  padding: 6px 12px;
  border-radius: 16px;
  background-color: #f5f5f5;
  font-size: 13px;
  cursor: pointer;
  transition: all 0.2s;
  color: #555;
}

.tag-chip:hover {
  background-color: #e8f0fe;
  color: #4785ff;
}

.tag-chip.selected {
  background-color: #4785ff;
  color: white;
}

.refresh-btn {
  min-width: 50px;
  width: 50px;
  height: 50px;
  border-radius: 8px;
  border: 1px solid #ddd;
  background-color: white;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 20px;
  color: #4785ff;
  cursor: pointer;
  transition: all 0.2s;
  z-index: 10;
  position: relative;
}

.refresh-btn:hover {
  background-color: #f0f5ff;
  border-color: #4785ff;
}

.refresh-btn:active {
  transform: scale(0.95);
}

@media (max-width: 768px) {
  .practice-container {
    padding: 10px;
  }
  
  .filter-group {
    flex-direction: column;
    align-items: flex-start;
    gap: 8px;
  }
  
  .filter-group label {
    margin-bottom: 5px;
  }
}
</style> 