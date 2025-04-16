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
import { defineComponent, ref, onMounted, onActivated, computed, onUnmounted } from 'vue';
import ProblemList from '../components/practice/ProblemList.vue';
import ProblemProgress from '../components/practice/ProblemProgress.vue';
import { problemService } from '../services/ProblemService';
import type { Problem } from '../services/ProblemService';
import { globalProblemStatus } from '../services/ProblemService';

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
          
          // 应用全局状态 - 这是关键的改进
          for (const problem of mockProblems) {
            // 检查题目是否在全局已解决列表中
            if (globalProblemStatus.solvedProblems.has(problem.id)) {
              problem.status = 'solved';
              console.log(`题目 ${problem.id} 状态被设置为已解决`);
            }
            // 检查题目是否在全局尝试列表中
            else if (globalProblemStatus.attemptedProblems.has(problem.id)) {
              problem.status = 'attempted';
              console.log(`题目 ${problem.id} 状态被设置为尝试过`);
            }
          }
          
          console.log('应用全局状态后的题目列表:', mockProblems.map(p => ({id: p.id, status: p.status})));
          
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
        const mockProblems = generateMockProblems();
        
        // 应用全局状态 - 这是关键的改进
        for (const problem of mockProblems) {
          // 检查题目是否在全局已解决列表中
          if (globalProblemStatus.solvedProblems.has(problem.id)) {
            problem.status = 'solved';
          }
          // 检查题目是否在全局尝试列表中
          else if (globalProblemStatus.attemptedProblems.has(problem.id)) {
            problem.status = 'attempted';
          }
        }
        
        problems.value = mockProblems;
      } finally {
        loading.value = false;
      }
    };
    
    // 生成模拟题目数据
    const generateMockProblems = (): Problem[] => {
      const mockProblems: Problem[] = [];
      
      // 预定义的题目列表，确保题号固定，这些是真实的题目
      const predefinedProblems = [
        { 
          id: 'E1', 
          title: '两数之和', 
          difficulty: 'easy' as const, 
          description: '给定一个整数数组 nums 和一个整数目标值 target，请你在该数组中找出和为目标值的那两个整数，并返回它们的数组下标。<br/><br/>你可以假设每种输入只会对应一个答案。但是，数组中同一个元素在答案里不能重复出现。<br/><br/>你可以按任意顺序返回答案。',
          examples: [
            {
              input: 'nums = [2,7,11,15], target = 9',
              output: '[0,1]',
              explanation: '因为 nums[0] + nums[1] == 9，返回 [0, 1]。'
            },
            {
              input: 'nums = [3,2,4], target = 6',
              output: '[1,2]',
              explanation: '因为 nums[1] + nums[2] == 6，返回 [1, 2]。'
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
        },
        { 
          id: 'E2', 
          title: '回文数', 
          difficulty: 'easy' as const, 
          description: '给你一个整数 x ，如果 x 是一个回文整数，返回 true ；否则，返回 false 。<br/><br/>回文数是指正序（从左向右）和倒序（从右向左）读都是一样的整数。例如，121 是回文，而 123 不是。',
          examples: [
            {
              input: 'x = 121',
              output: 'true',
              explanation: '从左向右读是 121，从右向左读是 121，所以它是回文数。'
            },
            {
              input: 'x = -121',
              output: 'false',
              explanation: '从左向右读是 -121，从右向左读是 121-，因此它不是回文数。'
            },
            {
              input: 'x = 10',
              output: 'false',
              explanation: '从右向左读是 01，因此它不是回文数。'
            }
          ],
          constraints: [
            '-2^31 <= x <= 2^31 - 1'
          ]
        },
        { 
          id: 'E3', 
          title: '罗马数字转整数', 
          difficulty: 'easy' as const, 
          description: '罗马数字包含以下七种字符: I, V, X, L, C, D 和 M。<br/><br/>字符          数值<br/>I             1<br/>V             5<br/>X             10<br/>L             50<br/>C             100<br/>D             500<br/>M             1000<br/><br/>例如， 罗马数字 2 写做 II ，即为两个并列的 1。12 写做 XII ，即为 X + II 。 27 写做  XXVII, 即为 XX + V + II 。<br/><br/>通常情况下，罗马数字中小的数字在大的数字的右边。但也存在特例，例如 4 不写做 IIII，而是 IV。数字 1 在数字 5 的左边，所表示的数等于大数 5 减小数 1 得到的数值 4 。同样地，数字 9 表示为 IX。这个特殊的规则只适用于以下六种情况：<br/><br/>I 可以放在 V (5) 和 X (10) 的左边，来表示 4 和 9。<br/>X 可以放在 L (50) 和 C (100) 的左边，来表示 40 和 90。<br/>C 可以放在 D (500) 和 M (1000) 的左边，来表示 400 和 900。<br/><br/>给定一个罗马数字，将其转换成整数。'
        },
        { 
          id: 'E4', 
          title: '最长公共前缀', 
          difficulty: 'easy' as const, 
          description: '编写一个函数来查找字符串数组中的最长公共前缀。<br/><br/>如果不存在公共前缀，返回空字符串 ""。'
        },
        { 
          id: 'E5', 
          title: '有效的括号', 
          difficulty: 'easy' as const, 
          description: '给定一个只包括 \'(\', \')\', \'{\', \'}\', \'[\', \']\' 的字符串 s ，判断字符串是否有效。<br/><br/>有效字符串需满足：<br/><br/>1. 左括号必须用相同类型的右括号闭合。<br/>2. 左括号必须以正确的顺序闭合。<br/>3. 每个右括号都有一个对应的相同类型的左括号。'
        },
        { 
          id: 'M1', 
          title: '无重复字符的最长子串', 
          difficulty: 'medium' as const, 
          description: '给定一个字符串 s ，请你找出其中不含有重复字符的最长子串的长度。'
        },
        { 
          id: 'M2', 
          title: '最长回文子串', 
          difficulty: 'medium' as const, 
          description: '给你一个字符串 s，找到 s 中最长的回文子串。'
        },
        { 
          id: 'M3', 
          title: '整数转罗马数字', 
          difficulty: 'medium' as const, 
          description: '罗马数字包含以下七种字符: I, V, X, L, C, D 和 M。<br/><br/>字符          数值<br/>I             1<br/>V             5<br/>X             10<br/>L             50<br/>C             100<br/>D             500<br/>M             1000<br/><br/>例如， 罗马数字 2 写做 II ，即为两个并列的 1。12 写做 XII ，即为 X + II 。 27 写做  XXVII, 即为 XX + V + II 。<br/><br/>通常情况下，罗马数字中小的数字在大的数字的右边。但也存在特例，例如 4 不写做 IIII，而是 IV。数字 1 在数字 5 的左边，所表示的数等于大数 5 减小数 1 得到的数值 4 。同样地，数字 9 表示为 IX。这个特殊的规则只适用于以下六种情况：<br/><br/>I 可以放在 V (5) 和 X (10) 的左边，来表示 4 和 9。<br/>X 可以放在 L (50) 和 C (100) 的左边，来表示 40 和 90。<br/>C 可以放在 D (500) 和 M (1000) 的左边，来表示 400 和 900。<br/><br/>给你一个整数，将其转为罗马数字。'
        },
        { 
          id: 'M4', 
          title: '三数之和', 
          difficulty: 'medium' as const, 
          description: '给你一个整数数组 nums ，判断是否存在三元组 [nums[i], nums[j], nums[k]] 满足 i != j, i != k, j != k ，同时还满足 nums[i] + nums[j] + nums[k] == 0 。请你返回所有和为 0 且不重复的三元组。<br/><br/>注意：答案中不可以包含重复的三元组。'
        },
        { 
          id: 'M5', 
          title: '电话号码的字母组合', 
          difficulty: 'medium' as const, 
          description: '给定一个仅包含数字 2-9 的字符串，返回所有它能表示的字母组合。答案可以按 任意顺序 返回。<br/><br/>给出数字到字母的映射如下（与电话按键相同）。注意 1 不对应任何字母。'
        },
        { 
          id: 'H1', 
          title: '正则表达式匹配', 
          difficulty: 'hard' as const, 
          description: '给你一个字符串 s 和一个字符规律 p，请你来实现一个支持 \'.\' 和 \'*\' 的正则表达式匹配。<br/><br/>\'.\' 匹配任意单个字符<br/>\'*\' 匹配零个或多个前面的那一个元素<br/>所谓匹配，是要涵盖 整个 字符串 s的，而不是部分字符串。'
        },
        { 
          id: 'H2', 
          title: '合并K个升序链表', 
          difficulty: 'hard' as const, 
          description: '给你一个链表数组，每个链表都已经按升序排列。<br/><br/>请你将所有链表合并到一个升序链表中，返回合并后的链表。'
        },
        { 
          id: 'H3', 
          title: '接雨水', 
          difficulty: 'hard' as const, 
          description: '给定 n 个非负整数表示每个宽度为 1 的柱子的高度图，计算按此排列的柱子，下雨之后能接多少雨水。'
        },
      ];
      
      // 标签和更多题目信息
      const allTags = [
        '数组', '字符串', '哈希表', '动态规划', 
        '链表', '数学', '二叉树', '堆', '图',
        '贪心', '排序', '递归', '回溯', '二分查找'
      ];
      
      // 给"两数之和"题目添加特定标签
      const twoSumTags = ['数组', '哈希表'];
      
      // 为预定义题目生成完整信息
      for (const problem of predefinedProblems) {
        // 为每个题目选择标签
        let tags;
        if (problem.id === 'E1') { // 两数之和
          tags = twoSumTags;
        } else {
          tags = getRandomTags();
        }
        
        // 强制所有题目状态为未解决状态
        const status: 'solved' | 'attempted' | 'unsolved' = 'unsolved';
        
        // 如果题目没有定义示例和约束条件，创建默认的
        const examples = problem.examples || [
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
        
        const constraints = problem.constraints || [
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
      
      // 只生成少量额外题目（每个难度各加几个）
      // 生成额外的简单题目
      const extraEasy = 5; // 额外的简单题目数量
      for (let i = predefinedProblems.filter(p => p.difficulty === 'easy').length + 1; i <= predefinedProblems.filter(p => p.difficulty === 'easy').length + extraEasy; i++) {
        const randomTags = getRandomTags();
        mockProblems.push({
          id: `E${i}`,
          title: `二叉树的中序遍历`,
          difficulty: 'easy',
          tags: randomTags,
          status: 'unsolved',
          description: `给定一个二叉树的根节点 root ，返回它的 中序 遍历结果。`,
          examples: [
            { input: 'root = [1,null,2,3]', output: '[1,3,2]' }
          ],
          constraints: ['树中节点数目在范围 [0, 100] 内', '-100 <= Node.val <= 100']
        });
      }
      
      // 生成额外的中等题目
      const extraMedium = 5; // 额外的中等题目数量
      for (let i = predefinedProblems.filter(p => p.difficulty === 'medium').length + 1; i <= predefinedProblems.filter(p => p.difficulty === 'medium').length + extraMedium; i++) {
        const randomTags = getRandomTags();
        mockProblems.push({
          id: `M${i}`,
          title: `LRU 缓存`,
          difficulty: 'medium',
          tags: randomTags,
          status: 'unsolved',
          description: `请你设计并实现一个满足 LRU (最近最少使用) 缓存 约束的数据结构。`,
          examples: [
            { input: '["LRUCache", "put", "put", "get", "put", "get", "put", "get", "get", "get"]\n[[2], [1, 1], [2, 2], [1], [3, 3], [2], [4, 4], [1], [3], [4]]', output: '[null, null, null, 1, null, -1, null, -1, 3, 4]' }
          ],
          constraints: ['1 <= capacity <= 3000', '0 <= key <= 10000', '0 <= value <= 10^5']
        });
      }
      
      // 生成额外的困难题目
      const extraHard = 2; // 额外的困难题目数量
      for (let i = predefinedProblems.filter(p => p.difficulty === 'hard').length + 1; i <= predefinedProblems.filter(p => p.difficulty === 'hard').length + extraHard; i++) {
        const randomTags = getRandomTags();
        mockProblems.push({
          id: `H${i}`,
          title: `最小覆盖子串`,
          difficulty: 'hard',
          tags: randomTags,
          status: 'unsolved',
          description: `给你一个字符串 s 、一个字符串 t 。返回 s 中涵盖 t 所有字符的最小子串。如果 s 中不存在涵盖 t 所有字符的子串，则返回空字符串 "" 。`,
          examples: [
            { input: 's = "ADOBECODEBANC", t = "ABC"', output: '"BANC"' }
          ],
          constraints: ['1 <= s.length, t.length <= 10^5', 's 和 t 由英文字母组成']
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
    
    // 添加页面可见性变化监听，确保从其他页面返回时刷新状态
    onMounted(() => {
      fetchProblems();
      
      // 添加页面可见性监听，确保从题目详情返回时重新加载数据
      document.addEventListener('visibilitychange', () => {
        if (document.visibilityState === 'visible') {
          console.log('页面变为可见，重新获取题目列表');
          fetchProblems();
        }
      });
    });
    
    // 组件卸载时清除事件监听
    onUnmounted(() => {
      document.removeEventListener('visibilitychange', () => {});
    });
    
    // 在每次激活组件时重新获取题目列表，确保状态最新
    onActivated(() => {
      // 确保从题目详情页返回时刷新题目列表，反映最新状态
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