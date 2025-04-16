<template>
  <div class="practice-container">
    <div class="practice-layout">
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
      
      <div class="practice-sidebar">
        <ProblemProgress :problems="problems" />
        
        <!-- 可以添加其他边栏组件 -->
        <div class="sidebar-widget recent-solved">
          <h3>最近解决</h3>
          <div class="recent-solved-list">
            <div v-if="recentSolvedProblems.length > 0">
              <div 
                v-for="problem in recentSolvedProblems" 
                :key="problem.id"
                class="recent-problem-item"
              >
                <span class="problem-id">{{ problem.id }}</span>
                <span class="problem-title">{{ problem.title }}</span>
                <span 
                  class="problem-difficulty"
                  :class="problem.difficulty"
                >
                  {{ problem.difficulty }}
                </span>
              </div>
            </div>
            <div v-else class="empty-list">
              还没有解决的问题
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script lang="ts">
import { defineComponent, ref, onMounted, onActivated, computed } from 'vue';
import ProblemList from '../components/practice/ProblemList.vue';
import ProblemProgress from '../components/practice/ProblemProgress.vue';
import { problemService } from '../services/ProblemService';
import type { Problem } from '../services/ProblemService';

export default defineComponent({
  name: 'Practice',
  components: {
    ProblemList,
    ProblemProgress
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
        // 先尝试从API获取数据
        const fetchedProblems = await problemService.getProblems();
        
        // 如果API返回空列表，使用模拟数据
        if (fetchedProblems.length === 0) {
          // 模拟题目数据
          const mockProblems: Problem[] = generateMockProblems();
          problems.value = mockProblems;
        } else {
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
        }
      } catch (error) {
        console.error('获取题目列表失败', error);
        // API异常时，使用模拟数据
        problems.value = generateMockProblems();
      } finally {
        loading.value = false;
      }
    };
    
    // 生成模拟题目数据
    const generateMockProblems = (): Problem[] => {
      const mockProblems: Problem[] = [];
      const difficulties: Array<'easy' | 'medium' | 'hard'> = ['easy', 'medium', 'hard'];
      const statuses: Array<'solved' | 'attempted' | 'unsolved'> = ['solved', 'attempted', 'unsolved'];
      
      // 预定义的题目列表，确保题号固定
      const predefinedProblems = [
        { id: 'E1', title: '两数之和', difficulty: 'easy' as const, description: '给定一个整数数组 nums 和一个整数目标值 target，请你在该数组中找出和为目标值的那两个整数，并返回它们的数组下标。' },
        { id: 'E2', title: '回文数', difficulty: 'easy' as const, description: '给你一个整数 x ，如果 x 是一个回文整数，返回 true ；否则，返回 false 。回文数是指正序（从左向右）和倒序（从右向左）读都是一样的整数。' },
        { id: 'E3', title: '罗马数字转整数', difficulty: 'easy' as const, description: '罗马数字包含以下七种字符: I, V, X, L, C, D 和 M。给定一个罗马数字，将其转换成整数。' },
        { id: 'E4', title: '最长公共前缀', difficulty: 'easy' as const, description: '编写一个函数来查找字符串数组中的最长公共前缀。如果不存在公共前缀，返回空字符串 ""。' },
        { id: 'E5', title: '有效的括号', difficulty: 'easy' as const, description: '给定一个只包括 \'(\', \')\', \'{\', \'}\', \'[\', \']\' 的字符串 s ，判断字符串是否有效。' },
        { id: 'M1', title: '无重复字符的最长子串', difficulty: 'medium' as const, description: '给定一个字符串 s ，请你找出其中不含有重复字符的最长子串的长度。' },
        { id: 'M2', title: '最长回文子串', difficulty: 'medium' as const, description: '给你一个字符串 s，找到 s 中最长的回文子串。' },
        { id: 'M3', title: '整数转罗马数字', difficulty: 'medium' as const, description: '罗马数字包含以下七种字符: I, V, X, L, C, D 和 M。给定一个整数，将其转为罗马数字。' },
        { id: 'M4', title: '三数之和', difficulty: 'medium' as const, description: '给你一个整数数组 nums ，判断是否存在三元组 [nums[i], nums[j], nums[k]] 满足 i != j, i != k, j != k ，同时还满足 nums[i] + nums[j] + nums[k] == 0 。' },
        { id: 'M5', title: '电话号码的字母组合', difficulty: 'medium' as const, description: '给定一个仅包含数字 2-9 的字符串，返回所有它能表示的字母组合。' },
        { id: 'H1', title: '正则表达式匹配', difficulty: 'hard' as const, description: '给你一个字符串 s 和一个字符规律 p，请你来实现一个支持 \'.\' 和 \'*\' 的正则表达式匹配。' },
        { id: 'H2', title: '合并K个升序链表', difficulty: 'hard' as const, description: '给你一个链表数组，每个链表都已经按升序排列。请你将所有链表合并到一个升序链表中，返回合并后的链表。' },
        { id: 'H3', title: '接雨水', difficulty: 'hard' as const, description: '给定 n 个非负整数表示每个宽度为 1 的柱子的高度图，计算按此排列的柱子，下雨之后能接多少雨水。' },
      ];
      
      // 标签和更多题目信息
      const allTags = [
        '数组', '字符串', '哈希表', '动态规划', 
        '链表', '数学', '二叉树', '堆', '图',
        '贪心', '排序', '递归', '回溯', '二分查找'
      ];
      
      // 为预定义题目生成完整信息
      for (const problem of predefinedProblems) {
        // 为每个题目随机选择1-3个标签
        const tags = getRandomTags();
        
        // 设置初始状态
        let status: 'solved' | 'attempted' | 'unsolved' = 'unsolved';
        if (problem.id === 'E1' || problem.id === 'E2' || problem.id === 'M1') {
          status = 'solved';
        } else if (problem.id === 'E3' || problem.id === 'M2') {
          status = 'attempted';
        }
        
        // 创建示例和约束条件
        const examples = [
          {
            input: '输入样例1',
            output: '输出样例1',
            explanation: '解释样例1'
          },
          {
            input: '输入样例2',
            output: '输出样例2'
          }
        ];
        
        const constraints = [
          '1 <= nums.length <= 10^5',
          '-10^9 <= nums[i] <= 10^9',
          '只会存在一个有效答案'
        ];
        
        // 添加到题目列表
        mockProblems.push({
          id: problem.id,
          title: problem.title,
          difficulty: problem.difficulty,
          tags,
          status,
          description: problem.description,
          examples,
          constraints
        });
      }
      
      // 继续生成更多题目以达到要求的总数
      // 生成剩余简单题目
      for (let i = predefinedProblems.filter(p => p.difficulty === 'easy').length + 1; i <= 83; i++) {
        const randomTags = getRandomTags();
        mockProblems.push({
          id: `E${i}`,
          title: `简单题目 ${i}`,
          difficulty: 'easy',
          tags: randomTags,
          status: i <= 10 ? 'solved' : (i <= 15 ? 'attempted' : 'unsolved'),
          description: `这是第 ${i} 个简单难度的题目。`,
          examples: [
            { input: '示例输入', output: '示例输出' }
          ],
          constraints: ['约束条件']
        });
      }
      
      // 生成剩余中等题目
      for (let i = predefinedProblems.filter(p => p.difficulty === 'medium').length + 1; i <= 407; i++) {
        const randomTags = getRandomTags();
        mockProblems.push({
          id: `M${i}`,
          title: `中等题目 ${i}`,
          difficulty: 'medium',
          tags: randomTags,
          status: i <= 5 ? 'solved' : (i <= 10 ? 'attempted' : 'unsolved'),
          description: `这是第 ${i} 个中等难度的题目。`,
          examples: [
            { input: '示例输入', output: '示例输出' }
          ],
          constraints: ['约束条件']
        });
      }
      
      // 生成剩余困难题目
      for (let i = predefinedProblems.filter(p => p.difficulty === 'hard').length + 1; i <= 120; i++) {
        const randomTags = getRandomTags();
        mockProblems.push({
          id: `H${i}`,
          title: `困难题目 ${i}`,
          difficulty: 'hard',
          tags: randomTags,
          status: i <= 2 ? 'solved' : (i <= 5 ? 'attempted' : 'unsolved'),
          description: `这是第 ${i} 个困难难度的题目。`,
          examples: [
            { input: '示例输入', output: '示例输出' }
          ],
          constraints: ['约束条件']
        });
      }
      
      return mockProblems;
    };
    
    // 获取随机标签
    const getRandomTags = () => {
      const tags = [...availableTags.value];
      const numTags = Math.floor(Math.random() * 3) + 1; // 1-3个标签
      const selectedTags = [];
      
      for (let i = 0; i < numTags; i++) {
        if (tags.length === 0) break;
        const randomIndex = Math.floor(Math.random() * tags.length);
        selectedTags.push(tags[randomIndex]);
        tags.splice(randomIndex, 1);
      }
      
      return selectedTags;
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
    
    // 最近解决的问题
    const recentSolvedProblems = computed(() => {
      return problems.value
        .filter(p => p.status === 'solved')
        .sort(() => 0.5 - Math.random()) // 随机排序
        .slice(0, 5); // 最多显示5个
    });
    
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
      recentSolvedProblems,
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

.practice-layout {
  display: grid;
  grid-template-columns: 1fr 300px;
  gap: 20px;
}

.practice-main {
  background-color: white;
  border-radius: 12px;
  box-shadow: 0 4px 16px rgba(0, 0, 0, 0.08);
  overflow: hidden;
}

.practice-sidebar {
  display: flex;
  flex-direction: column;
  gap: 20px;
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

/* 最近解决的问题组件样式 */
.sidebar-widget {
  background-color: white;
  border-radius: 12px;
  box-shadow: 0 4px 16px rgba(0, 0, 0, 0.08);
  padding: 20px;
}

.sidebar-widget h3 {
  font-size: 18px;
  font-weight: 600;
  color: #333;
  margin-top: 0;
  margin-bottom: 16px;
  padding-bottom: 10px;
  border-bottom: 1px solid #eee;
}

.recent-solved-list {
  display: flex;
  flex-direction: column;
  gap: 10px;
}

.recent-problem-item {
  display: flex;
  align-items: center;
  padding: 8px;
  border-radius: 6px;
  transition: all 0.2s ease;
}

.recent-problem-item:hover {
  background-color: #f5f7fa;
}

.problem-id {
  font-family: monospace;
  font-weight: 600;
  color: #555;
  margin-right: 10px;
  width: 40px;
}

.problem-title {
  flex: 1;
  font-size: 14px;
  color: #333;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.problem-difficulty {
  font-size: 12px;
  padding: 2px 8px;
  border-radius: 12px;
  margin-left: 10px;
  color: white;
}

.problem-difficulty.easy {
  background-color: #4caf50;
}

.problem-difficulty.medium {
  background-color: #ff9800;
}

.problem-difficulty.hard {
  background-color: #f44336;
}

.empty-list {
  color: #999;
  font-size: 14px;
  text-align: center;
  padding: 15px 0;
}

@media (max-width: 1024px) {
  .practice-layout {
    grid-template-columns: 1fr;
  }
  
  .practice-sidebar {
    order: -1;
  }
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