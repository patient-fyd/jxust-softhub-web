<template>
  <div class="members-container">
    <!-- 页面头部 -->
    <div class="members-header">
      <img src="@/views/member/members-header.svg" alt="协会成员" class="header-image" />
    </div>

    <!-- 筛选区域 -->
    <div class="filters-section">
      <div class="search-filter">
        <input 
          type="text"
          v-model="searchQuery"
          placeholder="搜索成员姓名..."
          class="search-input"
        />
      </div>
      
      <div class="filter-group">
        <span class="filter-label">届别:</span>
        <div class="filter-options">
          <button 
            v-for="year in yearOptions" 
            :key="year.value"
            :class="['filter-btn', selectedYear === year.value ? 'active' : '']"
            @click="selectedYear = year.value"
          >
            {{ year.label }}
          </button>
        </div>
      </div>
      
      <div class="filter-group">
        <span class="filter-label">技术方向:</span>
        <div class="filter-options">
          <button 
            v-for="tech in techOptions" 
            :key="tech.value"
            :class="['filter-btn', selectedTech === tech.value ? 'active' : '']"
            @click="selectedTech = tech.value"
          >
            {{ tech.label }}
          </button>
        </div>
      </div>
    </div>

    <!-- 成员列表区域 -->
    <div class="members-list-section">
      <!-- 结果统计 -->
      <div class="results-info">
        找到 <span class="highlight">{{ filteredMembers.length }}</span> 名成员
        <span v-if="selectedYear !== 'all' || selectedTech !== 'all' || searchQuery">
          <span v-if="selectedYear !== 'all'">
            ({{ yearOptions.find(y => y.value === selectedYear)?.label }})
          </span>
          <span v-if="selectedTech !== 'all'">
            ({{ techOptions.find(t => t.value === selectedTech)?.label }})
          </span>
          <span v-if="searchQuery">
            (包含 "{{ searchQuery }}")
          </span>
        </span>
      </div>

      <!-- 成员展示网格 -->
      <div class="members-grid">
        <template v-if="filteredMembers.length > 0">
          <div v-for="member in filteredMembers" :key="member.id" class="member-card">
            <div class="member-avatar">
              <div 
                class="avatar-circle"
                :class="{'core-member': member.isCore}"
              >
                <span>{{ member.name.charAt(0) }}</span>
                <div v-if="member.isCore" class="core-badge" title="核心成员">★</div>
              </div>
            </div>
            <div class="member-info">
              <h3 class="member-name">{{ member.name }}</h3>
              <div class="member-year">{{ member.year }}届</div>
              <div class="member-tech">{{ member.tech }}</div>
              <div class="member-role">{{ member.role }}</div>
              <p class="member-desc">{{ member.description }}</p>
            </div>
          </div>
        </template>
        <div v-else class="no-results">
          <p>没有符合筛选条件的成员</p>
          <button class="reset-btn" @click="resetFilters">重置筛选条件</button>
        </div>
      </div>
    </div>

    <!-- 分页器 -->
    <div class="pagination-section" v-if="totalPages > 1">
      <button 
        class="page-btn prev" 
        :disabled="currentPage === 1"
        @click="currentPage--"
      >
        上一页
      </button>
      
      <div class="page-numbers">
        <button 
          v-for="page in displayedPages" 
          :key="page"
          :class="['page-number', currentPage === page ? 'active' : '']"
          @click="currentPage = page"
        >
          {{ page }}
        </button>
      </div>
      
      <button 
        class="page-btn next" 
        :disabled="currentPage === totalPages"
        @click="currentPage++"
      >
        下一页
      </button>
    </div>
  </div>
</template>

<script lang="ts">
import { defineComponent, ref, computed, watch } from 'vue';

interface Member {
  id: number;
  name: string;
  year: string;
  tech: string;
  role: string;
  description: string;
  isCore: boolean;
}

export default defineComponent({
  name: 'MembersView',
  setup() {
    // 筛选条件
    const searchQuery = ref('');
    const selectedYear = ref('all');
    const selectedTech = ref('all');
    const currentPage = ref(1);
    const itemsPerPage = 12;

    // 筛选选项
    const yearOptions = [
      { value: 'all', label: '全部' },
      { value: '2023', label: '2023届' },
      { value: '2022', label: '2022届' },
      { value: '2021', label: '2021届' },
      { value: '2020', label: '2020届' },
      { value: '2019', label: '2019届' }
    ];

    const techOptions = [
      { value: 'all', label: '全部方向' },
      { value: '前端开发', label: '前端开发' },
      { value: '后端开发', label: '后端开发' },
      { value: '移动开发', label: '移动开发' },
      { value: '人工智能', label: '人工智能' },
      { value: 'UI设计', label: 'UI设计' }
    ];

    // 模拟成员数据
    const members: Member[] = [
      // 2023届成员
      { id: 1, name: '张明', year: '2023', tech: '前端开发', role: '会长', description: '计算机科学与技术专业，技术全面，精通前端开发技术', isCore: true },
      { id: 2, name: '李华', year: '2023', tech: '人工智能', role: '副会长', description: '软件工程专业，研究方向为机器学习与计算机视觉', isCore: true },
      { id: 3, name: '王芳', year: '2023', tech: 'UI设计', role: '宣传部长', description: '数字媒体艺术专业，负责协会视觉设计与品牌建设', isCore: true },
      { id: 4, name: '赵强', year: '2023', tech: '后端开发', role: '技术部长', description: '软件工程专业，精通Java和Spring框架', isCore: true },
      { id: 5, name: '陈明', year: '2023', tech: '移动开发', role: '移动组长', description: '计算机科学专业，专注于Android和Flutter开发', isCore: false },
      { id: 6, name: '杨华', year: '2023', tech: '前端开发', role: '前端组长', description: '软件工程专业，精通Vue和React框架', isCore: false },
      { id: 7, name: '周杰', year: '2023', tech: '后端开发', role: '成员', description: '网络工程专业，熟悉Node.js和Express框架', isCore: false },
      { id: 8, name: '吴宇', year: '2023', tech: 'UI设计', role: '设计组长', description: '视觉传达专业，拥有丰富的UI设计经验', isCore: false },
      
      // 2022届成员
      { id: 9, name: '郑伟', year: '2022', tech: '后端开发', role: '会长', description: '计算机科学与技术专业，精通Java和Spring框架', isCore: true },
      { id: 10, name: '冯秀', year: '2022', tech: '前端开发', role: '副会长', description: '软件工程专业，擅长前端框架和UI设计', isCore: true },
      { id: 11, name: '朱晓', year: '2022', tech: '人工智能', role: '技术部长', description: '数据科学专业，专注于自然语言处理和机器学习', isCore: true },
      { id: 12, name: '孙亮', year: '2022', tech: '移动开发', role: '组织部长', description: '软件工程专业，专注于iOS开发和移动应用设计', isCore: true },
      { id: 13, name: '林小红', year: '2022', tech: 'UI设计', role: '宣传部长', description: '数字媒体艺术专业，负责协会品牌形象设计', isCore: true },
      { id: 14, name: '徐杰', year: '2022', tech: '后端开发', role: '后端组长', description: '计算机科学专业，精通数据库设计和服务器端开发', isCore: false },
      
      // 2021届成员
      { id: 15, name: '何磊', year: '2021', tech: '前端开发', role: '会长', description: '软件工程专业，全栈工程师，擅长前后端开发', isCore: true },
      { id: 16, name: '马丽', year: '2021', tech: '移动开发', role: '副会长', description: '计算机科学专业，多次参加移动应用开发大赛获奖', isCore: true },
      { id: 17, name: '梁红', year: '2021', tech: 'UI设计', role: '宣传部长', description: '视觉传达专业，负责协会视觉设计和活动宣传', isCore: true },
      { id: 18, name: '韩雷', year: '2021', tech: '后端开发', role: '技术部长', description: '软件工程专业，擅长分布式系统和高性能服务器开发', isCore: true },
      
      // 2020届成员
      { id: 19, name: '金明', year: '2020', tech: '人工智能', role: '会长', description: '计算机科学专业，专注于人工智能和数据挖掘', isCore: true },
      { id: 20, name: '董华', year: '2020', tech: '前端开发', role: '副会长', description: '软件工程专业，精通前端开发和UI/UX设计', isCore: true },
      
      // 2019届成员
      { id: 21, name: '谢天', year: '2019', tech: '后端开发', role: '会长', description: '计算机科学专业，专注于分布式系统和云计算', isCore: true },
      { id: 22, name: '叶明', year: '2019', tech: '移动开发', role: '副会长', description: '软件工程专业，擅长移动应用开发和系统架构', isCore: true }
    ];

    // 筛选后的成员列表
    const filteredMembers = computed(() => {
      let result = members;
      
      // 按届别筛选
      if (selectedYear.value !== 'all') {
        result = result.filter(member => member.year === selectedYear.value);
      }
      
      // 按技术方向筛选
      if (selectedTech.value !== 'all') {
        result = result.filter(member => member.tech === selectedTech.value);
      }
      
      // 按搜索关键字筛选
      if (searchQuery.value) {
        const keyword = searchQuery.value.toLowerCase();
        result = result.filter(member => 
          member.name.toLowerCase().includes(keyword) || 
          member.role.toLowerCase().includes(keyword) ||
          member.description.toLowerCase().includes(keyword)
        );
      }
      
      return result;
    });

    // 分页相关计算
    const paginatedMembers = computed(() => {
      const startIndex = (currentPage.value - 1) * itemsPerPage;
      return filteredMembers.value.slice(startIndex, startIndex + itemsPerPage);
    });

    const totalPages = computed(() => {
      return Math.ceil(filteredMembers.value.length / itemsPerPage);
    });

    const displayedPages = computed(() => {
      const pages = [];
      const maxPagesToShow = 5;
      
      if (totalPages.value <= maxPagesToShow) {
        // 如果总页数少于等于最大显示页数，显示所有页数
        for (let i = 1; i <= totalPages.value; i++) {
          pages.push(i);
        }
      } else {
        // 否则显示当前页附近的页数
        const halfMax = Math.floor(maxPagesToShow / 2);
        let startPage = currentPage.value - halfMax;
        let endPage = currentPage.value + halfMax;
        
        if (startPage < 1) {
          startPage = 1;
          endPage = maxPagesToShow;
        } else if (endPage > totalPages.value) {
          endPage = totalPages.value;
          startPage = totalPages.value - maxPagesToShow + 1;
        }
        
        for (let i = startPage; i <= endPage; i++) {
          pages.push(i);
        }
      }
      
      return pages;
    });

    // 重置筛选条件
    const resetFilters = () => {
      searchQuery.value = '';
      selectedYear.value = 'all';
      selectedTech.value = 'all';
      currentPage.value = 1;
    };

    // 监听筛选条件变化，重置页码
    watch([searchQuery, selectedYear, selectedTech], () => {
      currentPage.value = 1;
    });

    return {
      searchQuery,
      selectedYear,
      selectedTech,
      currentPage,
      yearOptions,
      techOptions,
      filteredMembers: paginatedMembers,
      totalPages,
      displayedPages,
      resetFilters
    };
  }
});
</script>

<style scoped>
.members-container {
  max-width: 1200px;
  margin: 0 auto;
  padding: 0 20px 60px;
}

.members-header {
  width: 100%;
  margin-bottom: 40px;
  overflow: hidden;
  border-radius: 8px;
}

.header-image {
  width: 100%;
  display: block;
}

.filters-section {
  margin-bottom: 30px;
  background-color: #f9fafb;
  padding: 20px;
  border-radius: 8px;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.05);
}

.search-filter {
  margin-bottom: 20px;
}

.search-input {
  width: 100%;
  padding: 12px 15px;
  border: 1px solid #e5e7eb;
  border-radius: 6px;
  font-size: 1rem;
  outline: none;
  transition: border-color 0.3s, box-shadow 0.3s;
}

.search-input:focus {
  border-color: #1e40af;
  box-shadow: 0 0 0 3px rgba(30, 64, 175, 0.1);
}

.filter-group {
  margin-bottom: 15px;
  display: flex;
  align-items: center;
  flex-wrap: wrap;
}

.filter-label {
  font-weight: 500;
  color: #4b5563;
  margin-right: 15px;
  min-width: 80px;
}

.filter-options {
  display: flex;
  flex-wrap: wrap;
  gap: 10px;
}

.filter-btn {
  padding: 8px 15px;
  background-color: #f3f4f6;
  border: none;
  border-radius: 20px;
  color: #4b5563;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.3s;
}

.filter-btn:hover {
  background-color: #e5e7eb;
}

.filter-btn.active {
  background-color: #1e40af;
  color: white;
}

.results-info {
  margin-bottom: 20px;
  color: #4b5563;
  font-size: 1.1rem;
}

.highlight {
  color: #1e40af;
  font-weight: 600;
}

.members-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(270px, 1fr));
  gap: 30px;
  margin-bottom: 40px;
}

.member-card {
  background-color: white;
  border-radius: 8px;
  overflow: hidden;
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.05);
  transition: transform 0.3s ease, box-shadow 0.3s ease;
  height: 100%;
  display: flex;
  flex-direction: column;
}

.member-card:hover {
  transform: translateY(-5px);
  box-shadow: 0 10px 15px rgba(0, 0, 0, 0.1);
}

.member-avatar {
  padding: 30px 0 15px;
  display: flex;
  justify-content: center;
  background-color: #f9fafb;
}

.avatar-circle {
  width: 100px;
  height: 100px;
  border-radius: 50%;
  background-color: #dbeafe;
  display: flex;
  justify-content: center;
  align-items: center;
  color: #1e40af;
  font-size: 2.5rem;
  font-weight: bold;
  position: relative;
  border: 3px solid #e5e7eb;
  transition: border-color 0.3s;
}

.avatar-circle.core-member {
  border-color: #1e40af;
}

.core-badge {
  position: absolute;
  top: -5px;
  right: -5px;
  background-color: #1e40af;
  color: white;
  width: 24px;
  height: 24px;
  border-radius: 50%;
  display: flex;
  justify-content: center;
  align-items: center;
  font-size: 14px;
}

.member-info {
  padding: 20px;
  flex-grow: 1;
  display: flex;
  flex-direction: column;
}

.member-name {
  color: #1e40af;
  font-size: 1.3rem;
  margin-bottom: 10px;
  text-align: center;
}

.member-year, .member-tech, .member-role {
  color: #6b7280;
  text-align: center;
  margin-bottom: 5px;
  font-size: 0.95rem;
}

.member-tech {
  color: #1e40af;
  font-weight: 500;
}

.member-desc {
  color: #4b5563;
  font-size: 0.9rem;
  line-height: 1.5;
  margin-top: 15px;
  flex-grow: 1;
}

.no-results {
  grid-column: 1 / -1;
  text-align: center;
  padding: 40px;
  color: #6b7280;
}

.reset-btn {
  background-color: #1e40af;
  color: white;
  border: none;
  padding: 10px 20px;
  border-radius: 6px;
  margin-top: 15px;
  cursor: pointer;
  transition: background-color 0.3s;
}

.reset-btn:hover {
  background-color: #1e3a8a;
}

.pagination-section {
  display: flex;
  justify-content: center;
  align-items: center;
  margin-top: 40px;
}

.page-btn {
  background-color: #f3f4f6;
  border: none;
  padding: 8px 15px;
  border-radius: 6px;
  color: #4b5563;
  cursor: pointer;
  transition: all 0.3s;
}

.page-btn:hover:not(:disabled) {
  background-color: #e5e7eb;
}

.page-btn:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.page-numbers {
  display: flex;
  margin: 0 10px;
}

.page-number {
  width: 40px;
  height: 40px;
  display: flex;
  justify-content: center;
  align-items: center;
  margin: 0 5px;
  border-radius: 50%;
  border: none;
  background-color: #f3f4f6;
  color: #4b5563;
  cursor: pointer;
  transition: all 0.3s;
}

.page-number:hover {
  background-color: #e5e7eb;
}

.page-number.active {
  background-color: #1e40af;
  color: white;
}

@media (max-width: 768px) {
  .filter-group {
    flex-direction: column;
    align-items: flex-start;
  }
  
  .filter-label {
    margin-bottom: 10px;
  }
  
  .members-grid {
    grid-template-columns: 1fr;
  }
  
  .page-number {
    width: 35px;
    height: 35px;
    margin: 0 2px;
  }
}
</style> 