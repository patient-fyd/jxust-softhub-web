<template>
  <div class="projects-container">
    <div class="projects-header">
      <h1 class="projects-title">项目展示</h1>
      <p class="projects-subtitle">这里展示了软件协会历年开发的优秀项目，从实用工具到创新应用，记录着我们的成长足迹</p>
    </div>
    
    <div class="feature-projects">
      <div class="feature-card oj-card" @click="goToOJSystem">
        <div class="feature-content">
          <h2>在线刷题平台</h2>
          <p>支持多语言编程、实时评测、比赛功能的综合性刷题平台，助力编程能力提升</p>
          <div class="feature-tech">
            <span class="tech-tag">Vue3</span>
            <span class="tech-tag">Spring Boot</span>
            <span class="tech-tag">Docker</span>
          </div>
          <button class="feature-btn">访问平台</button>
        </div>
        <div class="feature-icon">
          <Icon icon="mdi:code-braces" class="feature-icon-image" />
        </div>
      </div>
      
      <div class="feature-card search-card" @click="goToSearchEngine">
        <div class="feature-content">
          <h2>校园搜索引擎</h2>
          <p>针对校园内容的垂直搜索引擎，整合学校信息、课程资源、学术研究等多维度资源</p>
          <div class="feature-tech">
            <span class="tech-tag">Vue3</span>
            <span class="tech-tag">Elasticsearch</span>
            <span class="tech-tag">Python</span>
          </div>
          <button class="feature-btn">前往搜索</button>
        </div>
        <div class="feature-icon">
          <Icon icon="mdi:magnify" class="feature-icon-image" />
        </div>
      </div>
    </div>

    <div class="projects-filter">
      <h2 class="filter-title">项目列表</h2>
      <div class="filter-options">
        <div class="filter-group">
          <label>方向：</label>
          <select v-model="selectedCategory">
            <option value="">全部</option>
            <option value="web">Web应用</option>
            <option value="mobile">移动应用</option>
            <option value="ai">人工智能</option>
            <option value="game">游戏开发</option>
            <option value="tool">工具开发</option>
          </select>
        </div>
        <div class="filter-group">
          <label>技术：</label>
          <select v-model="selectedTech">
            <option value="">全部</option>
            <option value="vue">Vue</option>
            <option value="react">React</option>
            <option value="java">Java</option>
            <option value="python">Python</option>
            <option value="go">Go</option>
          </select>
        </div>
        <div class="search-group">
          <Icon icon="mdi:magnify" class="search-icon" />
          <input 
            type="text" 
            v-model="searchText" 
            placeholder="搜索项目名称或描述" 
            class="search-input"
          />
        </div>
      </div>
    </div>

    <div class="projects-grid">
      <div v-for="project in filteredProjects" :key="project.id" class="project-card">
        <div class="project-cover">
          <img :src="project.coverUrl" :alt="project.name" class="cover-img" />
          <div class="project-category">{{ getCategoryName(project.category) }}</div>
        </div>
        <div class="project-content">
          <h3 class="project-title">{{ project.name }}</h3>
          <p class="project-description">{{ project.description }}</p>
          <div class="project-tech">
            <span v-for="tech in project.techStack" :key="tech" class="tech-tag">{{ tech }}</span>
          </div>
          <div class="project-footer">
            <div class="project-year">{{ project.year }}年</div>
            <button class="project-btn" @click.stop="viewProject(project)">查看详情</button>
          </div>
        </div>
      </div>
    </div>

    <div v-if="filteredProjects.length === 0" class="no-projects">
      <Icon icon="mdi:package-variant-closed" class="no-projects-icon" />
      <p>暂无符合条件的项目</p>
    </div>

    <div class="projects-footer">
      <h2>有创意的项目想法？</h2>
      <p>如果你有好的项目创意，或想参与协会项目开发，欢迎联系我们或加入协会！</p>
      <div class="footer-buttons">
        <router-link to="/join" class="footer-btn join-btn">加入协会</router-link>
        <router-link to="/feedback" class="footer-btn feedback-btn">提交创意</router-link>
      </div>
    </div>
  </div>
</template>

<script lang="ts">
import { defineComponent, ref, computed } from 'vue';
import { Icon } from '@iconify/vue';
import { useRouter } from 'vue-router';

interface Project {
  id: number;
  name: string;
  description: string;
  category: string;
  techStack: string[];
  year: number;
  coverUrl: string;
  detailUrl?: string;
}

export default defineComponent({
  name: 'Projects',
  components: {
    Icon
  },
  setup() {
    const router = useRouter();
    const searchText = ref('');
    const selectedCategory = ref('');
    const selectedTech = ref('');

    // 模拟项目数据
    const projects = ref<Project[]>([
      {
        id: 1,
        name: '软件协会官网',
        description: '协会对外展示窗口，整合新闻动态、成员展示、项目展示、资源下载等功能的综合平台',
        category: 'web',
        techStack: ['Vue3', 'TypeScript', 'Vite'],
        year: 2023,
        coverUrl: 'https://picsum.photos/id/0/400/200'
      },
      {
        id: 2,
        name: '校园通讯录App',
        description: '面向全校师生的通讯录应用，支持查找联系人、部门通讯录、常用联系人等功能',
        category: 'mobile',
        techStack: ['Flutter', 'Dart', 'Firebase'],
        year: 2022,
        coverUrl: 'https://picsum.photos/id/20/400/200'
      },
      {
        id: 3,
        name: '智能课表助手',
        description: '结合AI技术的智能课表工具，支持自动识别课程冲突、智能推荐选课方案',
        category: 'ai',
        techStack: ['Python', 'TensorFlow', 'Django'],
        year: 2023,
        coverUrl: 'https://picsum.photos/id/42/400/200'
      },
      {
        id: 4,
        name: '校园垃圾分类游戏',
        description: '寓教于乐的垃圾分类小游戏，通过游戏化方式普及垃圾分类知识',
        category: 'game',
        techStack: ['Unity', 'C#', 'Blender'],
        year: 2021,
        coverUrl: 'https://picsum.photos/id/36/400/200'
      },
      {
        id: 5,
        name: '教学资源管理系统',
        description: '针对教师与学生的教学资源管理平台，支持资料上传、分享、检索等功能',
        category: 'web',
        techStack: ['React', 'Node.js', 'MongoDB'],
        year: 2022,
        coverUrl: 'https://picsum.photos/id/48/400/200'
      },
      {
        id: 6,
        name: '校园导航小程序',
        description: '基于微信小程序的校园导航应用，支持楼宇查询、路线规划、校车时刻表等功能',
        category: 'mobile',
        techStack: ['微信小程序', 'JavaScript', 'ArcGIS'],
        year: 2022,
        coverUrl: 'https://picsum.photos/id/88/400/200'
      },
      {
        id: 7,
        name: '代码质量检测工具',
        description: '针对协会项目的代码质量检测工具，支持多语言代码规范检查、性能分析等功能',
        category: 'tool',
        techStack: ['Go', 'Docker', 'Jenkins'],
        year: 2023,
        coverUrl: 'https://picsum.photos/id/180/400/200'
      },
      {
        id: 8,
        name: '校园二手交易平台',
        description: '面向校内用户的二手物品交易平台，支持发布、搜索、交易等功能',
        category: 'web',
        techStack: ['Vue', 'Spring Boot', 'MySQL'],
        year: 2021,
        coverUrl: 'https://picsum.photos/id/201/400/200'
      },
    ]);

    // 项目分类名称映射
    const categoryNames: Record<string, string> = {
      'web': 'Web应用',
      'mobile': '移动应用',
      'ai': '人工智能',
      'game': '游戏开发',
      'tool': '工具开发'
    };

    // 获取分类名称
    const getCategoryName = (category: string) => {
      return categoryNames[category] || '其他项目';
    };

    // 筛选项目
    const filteredProjects = computed(() => {
      return projects.value.filter(project => {
        // 分类筛选
        if (selectedCategory.value && project.category !== selectedCategory.value) {
          return false;
        }
        
        // 技术栈筛选
        if (selectedTech.value && !project.techStack.some(tech => 
          tech.toLowerCase().includes(selectedTech.value.toLowerCase()))) {
          return false;
        }
        
        // 搜索文本
        if (searchText.value) {
          const searchLower = searchText.value.toLowerCase();
          return project.name.toLowerCase().includes(searchLower) || 
                 project.description.toLowerCase().includes(searchLower);
        }
        
        return true;
      });
    });

    // 跳转到OJ系统
    const goToOJSystem = () => {
      router.push('/practice');
    };

    // 跳转到搜索引擎
    const goToSearchEngine = () => {
      // 假设搜索引擎路径为 /search
      router.push('/search');
    };

    // 查看项目详情
    const viewProject = (project: Project) => {
      // 如果有详情页URL则跳转，否则可以弹窗显示详情等
      if (project.detailUrl) {
        router.push(project.detailUrl);
      } else {
        // 这里可以实现弹窗详情等功能
        alert(`你点击了"${project.name}"项目的详情，详情页面正在开发中...`);
      }
    };

    return {
      searchText,
      selectedCategory,
      selectedTech,
      projects,
      filteredProjects,
      getCategoryName,
      goToOJSystem,
      goToSearchEngine,
      viewProject
    };
  }
});
</script>

<style scoped>
.projects-container {
  padding: 40px 20px;
  max-width: 1200px;
  margin: 0 auto;
}

.projects-header {
  text-align: center;
  margin-bottom: 40px;
}

.projects-title {
  color: #1e40af;
  font-size: 2.5rem;
  margin-bottom: 10px;
}

.projects-subtitle {
  color: #6b7280;
  max-width: 700px;
  margin: 0 auto;
  font-size: 1.1rem;
}

/* 特色项目区域 */
.feature-projects {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 24px;
  margin-bottom: 50px;
}

.feature-card {
  display: flex;
  align-items: center;
  justify-content: space-between;
  background-color: #fff;
  border-radius: 12px;
  padding: 30px;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.1);
  cursor: pointer;
  transition: transform 0.3s, box-shadow 0.3s;
  overflow: hidden;
  position: relative;
  min-height: 250px;
}

.feature-card:hover {
  transform: translateY(-10px);
  box-shadow: 0 10px 30px rgba(0, 0, 0, 0.15);
}

.oj-card {
  background-image: linear-gradient(135deg, #1e3a8a10, #3b82f620);
  border: 1px solid #3b82f620;
}

.search-card {
  background-image: linear-gradient(135deg, #1e40af10, #60a5fa20);
  border: 1px solid #60a5fa20;
}

.feature-content {
  flex: 1;
  padding-right: 20px;
}

.feature-content h2 {
  color: #1e3a8a;
  font-size: 1.5rem;
  margin-bottom: 12px;
}

.feature-content p {
  color: #4b5563;
  margin-bottom: 20px;
  line-height: 1.6;
}

.feature-icon {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 120px;
  height: 120px;
}

.feature-icon-image {
  font-size: 90px;
  color: #1e40af;
  opacity: 0.2;
}

.feature-tech {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
  margin-bottom: 20px;
}

.tech-tag {
  background-color: #e0e7ff;
  color: #1e40af;
  padding: 4px 10px;
  border-radius: 4px;
  font-size: 0.8rem;
  font-weight: 500;
}

.feature-btn {
  background-color: #1e40af;
  color: white;
  border: none;
  padding: 10px 20px;
  border-radius: 6px;
  font-weight: 500;
  cursor: pointer;
  transition: background-color 0.3s;
}

.feature-btn:hover {
  background-color: #1e3a8a;
}

/* 项目筛选区域 */
.projects-filter {
  margin-bottom: 30px;
}

.filter-title {
  font-size: 1.5rem;
  color: #1e3a8a;
  margin-bottom: 16px;
}

.filter-options {
  display: flex;
  flex-wrap: wrap;
  gap: 20px;
  align-items: center;
}

.filter-group, .search-group {
  display: flex;
  align-items: center;
}

.filter-group label {
  margin-right: 8px;
  color: #4b5563;
}

.filter-group select {
  padding: 8px 12px;
  border-radius: 6px;
  border: 1px solid #d1d5db;
  background-color: white;
  min-width: 120px;
}

.search-group {
  position: relative;
  flex-grow: 1;
  max-width: 300px;
}

.search-icon {
  position: absolute;
  left: 10px;
  top: 50%;
  transform: translateY(-50%);
  color: #9ca3af;
}

.search-input {
  width: 100%;
  padding: 8px 12px 8px 35px;
  border-radius: 6px;
  border: 1px solid #d1d5db;
}

/* 项目网格 */
.projects-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
  gap: 24px;
  margin-bottom: 50px;
}

.project-card {
  background-color: white;
  border-radius: 8px;
  overflow: hidden;
  box-shadow: 0 2px 12px rgba(0, 0, 0, 0.1);
  transition: transform 0.3s, box-shadow 0.3s;
  height: 100%;
  display: flex;
  flex-direction: column;
  cursor: pointer;
}

.project-card:hover {
  transform: translateY(-5px);
  box-shadow: 0 5px 15px rgba(0, 0, 0, 0.15);
}

.project-cover {
  height: 180px;
  position: relative;
  overflow: hidden;
}

.project-cover img {
  width: 100%;
  height: 100%;
  object-fit: cover;
  transition: transform 0.3s;
}

.project-card:hover .project-cover img {
  transform: scale(1.05);
}

.project-category {
  position: absolute;
  top: 10px;
  right: 10px;
  background-color: rgba(0, 0, 0, 0.6);
  color: white;
  padding: 4px 8px;
  border-radius: 4px;
  font-size: 0.7rem;
}

.project-content {
  padding: 16px;
  display: flex;
  flex-direction: column;
  flex-grow: 1;
}

.project-title {
  font-size: 1.1rem;
  color: #1e3a8a;
  margin-bottom: 8px;
  font-weight: 600;
}

.project-description {
  color: #4b5563;
  font-size: 0.9rem;
  line-height: 1.6;
  margin-bottom: 16px;
  flex-grow: 1;
}

.project-tech {
  display: flex;
  flex-wrap: wrap;
  gap: 6px;
  margin-bottom: 16px;
}

.project-footer {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.project-year {
  color: #6b7280;
  font-size: 0.8rem;
}

.project-btn {
  background-color: transparent;
  color: #1e40af;
  border: 1px solid #1e40af;
  padding: 5px 10px;
  border-radius: 4px;
  font-size: 0.8rem;
  transition: all 0.3s;
}

.project-btn:hover {
  background-color: #1e40af;
  color: white;
}

/* 无项目提示 */
.no-projects {
  text-align: center;
  padding: 50px 0;
  color: #6b7280;
}

.no-projects-icon {
  font-size: 60px;
  margin-bottom: 20px;
  opacity: 0.5;
}

/* 页脚区域 */
.projects-footer {
  background-color: #f3f4f6;
  border-radius: 12px;
  padding: 40px;
  text-align: center;
  margin-top: 30px;
}

.projects-footer h2 {
  color: #1e3a8a;
  margin-bottom: 10px;
}

.projects-footer p {
  color: #4b5563;
  margin-bottom: 20px;
  max-width: 600px;
  margin-left: auto;
  margin-right: auto;
}

.footer-buttons {
  display: flex;
  justify-content: center;
  gap: 20px;
}

.footer-btn {
  padding: 10px 24px;
  border-radius: 6px;
  font-weight: 500;
  text-decoration: none;
  transition: all 0.3s;
}

.join-btn {
  background-color: #1e40af;
  color: white;
}

.join-btn:hover {
  background-color: #1e3a8a;
}

.feedback-btn {
  background-color: transparent;
  color: #1e40af;
  border: 1px solid #1e40af;
}

.feedback-btn:hover {
  background-color: #e0e7ff;
}

/* 响应式设计 */
@media (max-width: 900px) {
  .feature-projects {
    grid-template-columns: 1fr;
  }
}

@media (max-width: 600px) {
  .projects-container {
    padding: 20px 15px;
  }
  
  .projects-title {
    font-size: 2rem;
  }
  
  .filter-options {
    flex-direction: column;
    align-items: stretch;
  }
  
  .filter-group, .search-group {
    width: 100%;
  }
  
  .footer-buttons {
    flex-direction: column;
    gap: 10px;
  }
}
</style> 