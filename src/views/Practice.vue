<template>
  <div class="practice-container">
    <div class="practice-header">
      <h1>在线刷题平台</h1>
      <p class="subtitle">提高编程技能，准备技术面试</p>
    </div>
    
    <div class="practice-main">
      <div class="search-filters">
        <div class="search-box">
          <input 
            type="text" 
            v-model="searchKeyword" 
            placeholder="搜索题目..." 
            class="search-input"
          />
          <i class="fas fa-search search-icon"></i>
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
import { defineComponent, ref, onMounted } from 'vue';
import ProblemList from '../components/practice/ProblemList.vue';
import { Problem, problemService } from '../services/ProblemService';

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
        problems.value = await problemService.getProblems();
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
    
    return {
      loading,
      problems,
      searchKeyword,
      selectedDifficulty,
      selectedTags,
      availableTags,
      toggleTag,
      resetFilters
    };
  }
});
</script>

<style scoped>
.practice-container {
  max-width: 1200px;
  margin: 0 auto;
  padding: 20px;
}

.practice-header {
  margin-bottom: 30px;
  text-align: center;
}

.practice-header h1 {
  font-size: 32px;
  margin-bottom: 10px;
  color: #333;
}

.subtitle {
  font-size: 16px;
  color: #666;
}

.practice-main {
  background-color: white;
  border-radius: 8px;
  box-shadow: 0 2px 12px rgba(0, 0, 0, 0.1);
  overflow: hidden;
}

.search-filters {
  padding: 20px;
  border-bottom: 1px solid #eee;
}

.search-box {
  position: relative;
  margin-bottom: 20px;
}

.search-input {
  width: 100%;
  padding: 12px 20px 12px 40px;
  border: 1px solid #ddd;
  border-radius: 4px;
  font-size: 16px;
  transition: all 0.3s;
}

.search-input:focus {
  border-color: #007bff;
  box-shadow: 0 0 0 2px rgba(0, 123, 255, 0.25);
  outline: none;
}

.search-icon {
  position: absolute;
  left: 12px;
  top: 50%;
  transform: translateY(-50%);
  color: #999;
}

.filters {
  display: flex;
  flex-direction: column;
  gap: 15px;
}

.filter-group {
  display: flex;
  align-items: center;
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
  padding: 6px 12px;
  border: 1px solid #ddd;
  border-radius: 4px;
  background-color: white;
  cursor: pointer;
  transition: all 0.2s;
}

.filter-btn:hover {
  background-color: #f8f9fa;
}

.filter-btn.active {
  background-color: #007bff;
  color: white;
  border-color: #007bff;
}

.tags-filter {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
}

.tag-chip {
  padding: 5px 10px;
  background-color: #f1f1f1;
  border-radius: 16px;
  font-size: 14px;
  cursor: pointer;
  transition: all 0.2s;
}

.tag-chip:hover {
  background-color: #e0e0e0;
}

.tag-chip.selected {
  background-color: #007bff;
  color: white;
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