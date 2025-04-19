<template>
  <div class="blog-container">
    <div class="blog-header">
      <h1 class="page-title">技术博客</h1>
      <p class="page-subtitle">分享技术知识，共同学习成长</p>
    </div>
    
    <div class="blog-filter-wrapper">
      <div class="search-box">
        <input 
          type="text" 
          v-model="searchKeyword" 
          placeholder="搜索博客..." 
          @keyup.enter="searchBlogs"
        />
        <button @click="searchBlogs" class="search-btn">
          <Icon name="search" />
          搜索
        </button>
      </div>
      
      <div class="filter-panel">
        <div class="filter-options">
          <select v-model="sortBy" @change="loadBlogs" class="sort-select">
            <option value="newest">最新发布</option>
            <option value="popular">热门浏览</option>
            <option value="comments">评论最多</option>
          </select>
          
          <div class="view-toggle">
            <button 
              @click="viewMode = 'grid'" 
              :class="['view-btn', { active: viewMode === 'grid' }]" 
              aria-label="网格视图"
            >
              <Icon name="grid" />
            </button>
            <button 
              @click="viewMode = 'list'" 
              :class="['view-btn', { active: viewMode === 'list' }]" 
              aria-label="列表视图"
            >
              <Icon name="list" />
            </button>
          </div>
        </div>
        
        <div class="advanced-filters">
          <div class="categories-filter">
            <h3>分类</h3>
            <div class="filter-items">
              <button 
                @click="selectCategory('all')" 
                :class="['filter-item', { active: selectedCategory === 'all' }]"
              >
                全部
              </button>
              <button 
                v-for="category in categories" 
                :key="category" 
                @click="selectCategory(category)"
                :class="['filter-item', { active: selectedCategory === category }]"
              >
                {{ category }}
              </button>
            </div>
          </div>
          
          <div class="tags-filter">
            <h3>标签</h3>
            <div class="filter-items">
              <button 
                @click="selectTag('all')" 
                :class="['filter-item', { active: selectedTag === 'all' }]"
              >
                全部
              </button>
              <button 
                v-for="tag in tags" 
                :key="tag" 
                @click="selectTag(tag)"
                :class="['filter-item', { active: selectedTag === tag }]"
              >
                {{ tag }}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
    
    <!-- 加载状态 - 骨架屏 -->
    <div v-if="loading" class="blog-list" :class="viewMode">
      <div v-for="i in 6" :key="i" class="blog-card skeleton">
        <div class="skeleton-image"></div>
        <div class="skeleton-content">
          <div class="skeleton-title"></div>
          <div class="skeleton-meta"></div>
          <div class="skeleton-description"></div>
          <div class="skeleton-footer"></div>
        </div>
      </div>
    </div>
    
    <!-- 错误状态 -->
    <div v-else-if="error" class="error-state">
      <div class="error-icon">!</div>
      <p>{{ error }}</p>
      <button @click="loadBlogs" class="retry-btn">重试</button>
    </div>
    
    <!-- 空状态 -->
    <div v-else-if="blogs.length === 0" class="empty-state">
      <div class="empty-icon">📝</div>
      <p>暂无技术博客</p>
      <p class="empty-tip">请尝试更改筛选条件或稍后再试</p>
    </div>
    
    <!-- 博客列表 - 网格视图或列表视图 -->
    <div v-else class="blog-list" :class="viewMode">
      <div v-for="blog in blogs" :key="blog.blogId || blog.id" class="blog-card">
        <div class="blog-image" :style="blog.coverImage ? `background-image: url(${blog.coverImage})` : ''">
          <div v-if="!blog.coverImage" class="placeholder-image">
            <Icon name="code" />
          </div>
        </div>
        <div class="blog-content">
          <h2 class="blog-title" :title="blog.title">{{ blog.title }}</h2>
          <div class="blog-meta">
            <span class="blog-date"><Icon name="calendar" /> {{ formatDate(blog.createTime) }}</span>
            <span class="blog-views"><Icon name="eye" /> {{ blog.viewCount }}</span>
            <span class="blog-comments"><Icon name="message" /> {{ blog.commentCount }}</span>
          </div>
          <div class="blog-description">
            {{ blog.summary || (blog.content && blog.content.replace(/<[^>]*>/g, '').substring(0, 160) + '...') || '暂无描述' }}
          </div>
          
          <div class="blog-tags" v-if="blog.tags">
            <span v-for="tag in parseTags(blog.tags)" :key="tag" class="blog-tag">{{ tag }}</span>
          </div>
          
          <div class="blog-footer">
            <router-link v-if="blog.blogId" :to="`/blog/detail?blogId=${blog.blogId}`" class="read-more-btn">
              阅读全文 <Icon name="arrow-right" />
            </router-link>
            <span v-else class="read-more-btn disabled">暂无详情</span>
            <span v-if="blog.authorName" class="blog-author">
              <Icon name="user" /> {{ blog.authorName }}
            </span>
          </div>
        </div>
      </div>
    </div>
    
    <!-- 分页控件 -->
    <div v-if="blogs.length > 0" class="pagination">
      <button 
        :disabled="currentPage <= 1" 
        @click="changePage(currentPage - 1)" 
        class="page-btn"
      >
        <Icon name="arrow-left" /> 上一页
      </button>
      
      <div class="page-numbers">
        <button 
          v-for="page in visiblePageNumbers" 
          :key="page" 
          :class="['page-number', { active: currentPage === page }]"
          @click="changePage(page)"
        >
          {{ page }}
        </button>
      </div>
      
      <button 
        :disabled="currentPage >= totalPages" 
        @click="changePage(currentPage + 1)" 
        class="page-btn"
      >
        下一页 <Icon name="arrow-right" />
      </button>
    </div>
  </div>
</template>

<script lang="ts">
import { defineComponent, ref, computed, onMounted, watch } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import { blogService, type Blog } from '../services/blogService';
import Icon from '../components/common/Icon.vue';

export default defineComponent({
  name: 'BlogView',
  components: {
    Icon
  },
  setup() {
    const route = useRoute();
    const router = useRouter();
    
    // 基础数据
    const blogs = ref<Blog[]>([]);
    const loading = ref(true);
    const error = ref('');
    const currentPage = ref(1);
    const pageSize = ref(9);
    const totalItems = ref(0);
    const searchKeyword = ref('');
    const sortBy = ref('newest');
    
    // 新增的状态
    const viewMode = ref<'grid' | 'list'>('grid'); // 视图模式：网格/列表
    const categories = ref<string[]>([]); // 博客分类列表
    const tags = ref<string[]>([]); // 博客标签列表
    const selectedCategory = ref('all'); // 当前选中的分类
    const selectedTag = ref('all'); // 当前选中的标签
    
    // 计算属性
    const totalPages = computed(() => {
      return Math.ceil(totalItems.value / pageSize.value);
    });
    
    // 显示的页码按钮
    const visiblePageNumbers = computed(() => {
      const pageNumbers: number[] = [];
      let startPage = Math.max(1, currentPage.value - 2);
      let endPage = Math.min(totalPages.value, startPage + 4);
      
      if (endPage - startPage < 4) {
        startPage = Math.max(1, endPage - 4);
      }
      
      for (let i = startPage; i <= endPage; i++) {
        pageNumbers.push(i);
      }
      
      return pageNumbers;
    });
    
    // 加载博客数据
    const loadBlogs = async () => {
      loading.value = true;
      error.value = '';
      
      try {
        const params: any = {
          page: currentPage.value,
          size: pageSize.value,
          status: 1 // 只获取已发布的博客
        };
        
        // 添加搜索关键词
        if (searchKeyword.value.trim()) {
          params.keyword = searchKeyword.value.trim();
        }
        
        // 添加分类筛选
        if (selectedCategory.value !== 'all') {
          params.category = selectedCategory.value;
        }
        
        // 添加标签筛选
        if (selectedTag.value !== 'all') {
          params.tag = selectedTag.value;
        }
        
        // 调用博客接口
        const response = await blogService.getBlogList(params);
        
        if (response.code === 0 && response.data) {
          blogs.value = response.data.list;
          totalItems.value = response.data.total;
          
          // 根据排序选项进行排序
          if (sortBy.value === 'popular') {
            blogs.value.sort((a, b) => b.viewCount - a.viewCount);
          } else if (sortBy.value === 'comments') {
            blogs.value.sort((a, b) => b.commentCount - a.commentCount);
          }
          // 最新发布的排序已经由API返回
        } else {
          error.value = response.msg || '获取博客列表失败';
        }
      } catch (err) {
        console.error('获取博客列表出错:', err);
        error.value = '获取博客列表时发生错误';
      } finally {
        loading.value = false;
      }
    };
    
    // 加载分类数据
    const loadCategories = async () => {
      try {
        const response = await blogService.getBlogCategories();
        if (response.code === 0 && response.data) {
          categories.value = response.data.list;
        }
      } catch (err) {
        console.error('获取博客分类失败:', err);
      }
    };
    
    // 加载标签数据
    const loadTags = async () => {
      try {
        const response = await blogService.getBlogTags();
        if (response.code === 0 && response.data) {
          tags.value = response.data.list;
        }
      } catch (err) {
        console.error('获取博客标签失败:', err);
      }
    };
    
    // 搜索博客
    const searchBlogs = () => {
      currentPage.value = 1; // 重置到第一页
      loadBlogs();
      
      // 更新URL参数
      updateUrlParams();
    };
    
    // 选择分类
    const selectCategory = (category: string) => {
      selectedCategory.value = category;
      currentPage.value = 1; // 重置到第一页
      loadBlogs();
      
      // 更新URL参数
      updateUrlParams();
    };
    
    // 选择标签
    const selectTag = (tag: string) => {
      selectedTag.value = tag;
      currentPage.value = 1; // 重置到第一页
      loadBlogs();
      
      // 更新URL参数
      updateUrlParams();
    };
    
    // 更新URL参数
    const updateUrlParams = () => {
      const query: Record<string, string> = {};
      
      if (currentPage.value > 1) {
        query.page = currentPage.value.toString();
      }
      
      if (searchKeyword.value.trim()) {
        query.keyword = searchKeyword.value.trim();
      }
      
      if (selectedCategory.value !== 'all') {
        query.category = selectedCategory.value;
      }
      
      if (selectedTag.value !== 'all') {
        query.tag = selectedTag.value;
      }
      
      if (sortBy.value !== 'newest') {
        query.sort = sortBy.value;
      }
      
      router.replace({ query });
    };
    
    // 切换页面
    const changePage = (page: number) => {
      currentPage.value = page;
      loadBlogs();
      
      // 更新URL参数
      updateUrlParams();
      
      // 滚动到页面顶部
      window.scrollTo({ top: 0, behavior: 'smooth' });
    };
    
    // 解析标签字符串
    const parseTags = (tagsStr: string): string[] => {
      if (!tagsStr) return [];
      return tagsStr.split(',').map(tag => tag.trim()).filter(tag => tag);
    };
    
    // 格式化日期
    const formatDate = (dateStr: string) => {
      if (!dateStr) return '';
      const date = new Date(dateStr);
      return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`;
    };
    
    // 监听URL参数变化
    watch(() => route.query, (newQuery) => {
      let needReload = false;
      
      // 处理页码
      if (newQuery.page && !isNaN(Number(newQuery.page))) {
        const page = Number(newQuery.page);
        if (currentPage.value !== page) {
          currentPage.value = page;
          needReload = true;
        }
      } else if (currentPage.value !== 1) {
        currentPage.value = 1;
        needReload = true;
      }
      
      // 处理搜索关键词
      if (newQuery.keyword && typeof newQuery.keyword === 'string') {
        if (searchKeyword.value !== newQuery.keyword) {
          searchKeyword.value = newQuery.keyword;
          needReload = true;
        }
      } else if (searchKeyword.value) {
        searchKeyword.value = '';
        needReload = true;
      }
      
      // 处理分类
      if (newQuery.category && typeof newQuery.category === 'string') {
        if (selectedCategory.value !== newQuery.category) {
          selectedCategory.value = newQuery.category;
          needReload = true;
        }
      } else if (selectedCategory.value !== 'all') {
        selectedCategory.value = 'all';
        needReload = true;
      }
      
      // 处理标签
      if (newQuery.tag && typeof newQuery.tag === 'string') {
        if (selectedTag.value !== newQuery.tag) {
          selectedTag.value = newQuery.tag;
          needReload = true;
        }
      } else if (selectedTag.value !== 'all') {
        selectedTag.value = 'all';
        needReload = true;
      }
      
      // 处理排序
      if (newQuery.sort && typeof newQuery.sort === 'string') {
        if (sortBy.value !== newQuery.sort) {
          sortBy.value = newQuery.sort;
          needReload = true;
        }
      } else if (sortBy.value !== 'newest') {
        sortBy.value = 'newest';
        needReload = true;
      }
      
      if (needReload) {
        loadBlogs();
      }
    }, { immediate: true });
    
    onMounted(() => {
      // 加载分类和标签数据
      loadCategories();
      loadTags();
      
      // 从URL参数中获取页码
      const pageParam = route.query.page;
      if (pageParam && !isNaN(Number(pageParam))) {
        currentPage.value = Number(pageParam);
      }
      
      // 从URL参数中获取搜索关键词
      const keywordParam = route.query.keyword;
      if (keywordParam && typeof keywordParam === 'string') {
        searchKeyword.value = keywordParam;
      }
      
      // 从URL参数中获取分类
      const categoryParam = route.query.category;
      if (categoryParam && typeof categoryParam === 'string') {
        selectedCategory.value = categoryParam;
      }
      
      // 从URL参数中获取标签
      const tagParam = route.query.tag;
      if (tagParam && typeof tagParam === 'string') {
        selectedTag.value = tagParam;
      }
      
      // 从URL参数中获取排序方式
      const sortParam = route.query.sort;
      if (sortParam && typeof sortParam === 'string') {
        sortBy.value = sortParam;
      }
      
      // 从localStorage中获取视图模式
      const savedViewMode = localStorage.getItem('blogViewMode');
      if (savedViewMode === 'grid' || savedViewMode === 'list') {
        viewMode.value = savedViewMode;
      }
      
      loadBlogs();
    });
    
    // 监听视图模式变化，保存到localStorage
    watch(viewMode, (newMode) => {
      localStorage.setItem('blogViewMode', newMode);
    });
    
    return {
      blogs,
      loading,
      error,
      currentPage,
      totalPages,
      searchKeyword,
      sortBy,
      viewMode,
      categories,
      tags,
      selectedCategory,
      selectedTag,
      visiblePageNumbers,
      loadBlogs,
      searchBlogs,
      changePage,
      formatDate,
      parseTags,
      selectCategory,
      selectTag
    };
  }
});
</script>

<style scoped>
/* 主容器 */
.blog-container {
  max-width: 1200px;
  margin: 0 auto;
  padding: 30px 20px;
}

/* 页头 */
.blog-header {
  text-align: center;
  margin-bottom: 30px;
  background: linear-gradient(135deg, #1e3a8a 0%, #3b82f6 100%);
  padding: 40px 20px;
  border-radius: 12px;
  color: white;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.1);
}

.page-title {
  font-size: 2.4rem;
  margin-bottom: 10px;
  font-weight: 700;
  text-shadow: 0 2px 4px rgba(0, 0, 0, 0.2);
}

.page-subtitle {
  font-size: 1.2rem;
  opacity: 0.9;
  max-width: 600px;
  margin: 0 auto;
}

/* 筛选区域 */
.blog-filter-wrapper {
  margin-bottom: 30px;
  background-color: white;
  border-radius: 8px;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.05);
  overflow: hidden;
}

.search-box {
  display: flex;
  max-width: 100%;
  margin-bottom: 15px;
}

.search-box input {
  flex: 1;
  padding: 12px 20px;
  border: 1px solid #e5e7eb;
  border-radius: 6px 0 0 6px;
  font-size: 1rem;
  transition: border-color 0.3s, box-shadow 0.3s;
}

.search-box input:focus {
  outline: none;
  border-color: #3b82f6;
  box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.2);
}

.search-btn {
  padding: 12px 20px;
  background-color: #1e40af;
  color: white;
  border: none;
  border-radius: 0 6px 6px 0;
  cursor: pointer;
  font-weight: 500;
  transition: background-color 0.2s;
  display: flex;
  align-items: center;
  gap: 6px;
}

.search-btn:hover {
  background-color: #1e3a8a;
}

.filter-panel {
  padding: 20px;
  border-top: 1px solid #e5e7eb;
}

.filter-options {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;
}

.sort-select {
  padding: 10px 15px;
  border: 1px solid #e5e7eb;
  border-radius: 6px;
  background-color: white;
  font-size: 0.95rem;
  min-width: 140px;
}

.view-toggle {
  display: flex;
  gap: 10px;
}

.view-btn {
  width: 40px;
  height: 40px;
  display: flex;
  align-items: center;
  justify-content: center;
  background-color: #f3f4f6;
  border: 1px solid #e5e7eb;
  border-radius: 6px;
  cursor: pointer;
  transition: all 0.2s;
}

.view-btn.active {
  background-color: #dbeafe;
  border-color: #93c5fd;
  color: #1e40af;
}

.advanced-filters {
  display: flex;
  gap: 30px;
  flex-wrap: wrap;
}

.categories-filter, .tags-filter {
  flex: 1;
  min-width: 250px;
}

.categories-filter h3, .tags-filter h3 {
  margin-bottom: 12px;
  font-size: 1rem;
  color: #4b5563;
  font-weight: 600;
}

.filter-items {
  display: flex;
  gap: 8px;
  flex-wrap: wrap;
}

.filter-item {
  padding: 6px 12px;
  background-color: #f3f4f6;
  border: 1px solid #e5e7eb;
  border-radius: 20px;
  font-size: 0.9rem;
  cursor: pointer;
  transition: all 0.2s;
}

.filter-item:hover {
  background-color: #e5e7eb;
}

.filter-item.active {
  background-color: #1e40af;
  color: white;
  border-color: #1e40af;
}

/* 骨架屏 */
.skeleton {
  animation: pulse 1.5s infinite ease-in-out;
}

@keyframes pulse {
  0%, 100% { opacity: 0.5; }
  50% { opacity: 1; }
}

.skeleton-image {
  height: 180px;
  background-color: #e5e7eb;
  border-radius: 8px 8px 0 0;
}

.skeleton-content {
  padding: 20px;
}

.skeleton-title {
  height: 24px;
  width: 80%;
  background-color: #e5e7eb;
  margin-bottom: 15px;
  border-radius: 4px;
}

.skeleton-meta {
  height: 16px;
  width: 60%;
  background-color: #e5e7eb;
  margin-bottom: 15px;
  border-radius: 4px;
}

.skeleton-description {
  height: 16px;
  width: 100%;
  background-color: #e5e7eb;
  margin-bottom: 10px;
  border-radius: 4px;
}

.skeleton-description:last-of-type {
  width: 70%;
}

.skeleton-footer {
  height: 36px;
  width: 40%;
  background-color: #e5e7eb;
  margin-top: 20px;
  border-radius: 4px;
}

/* 错误和空状态 */
.error-state, .empty-state {
  text-align: center;
  padding: 60px 20px;
  background-color: #f9fafb;
  border-radius: 8px;
  margin-bottom: 30px;
}

.error-icon, .empty-icon {
  font-size: 3rem;
  margin-bottom: 20px;
  display: inline-block;
  color: #6b7280;
}

.error-state p, .empty-state p {
  color: #4b5563;
  font-size: 1.2rem;
  margin-bottom: 15px;
}

.empty-tip {
  color: #9ca3af !important;
  font-size: 1rem !important;
}

.retry-btn {
  margin-top: 15px;
  padding: 10px 24px;
  background-color: #1e40af;
  color: white;
  border: none;
  border-radius: 6px;
  cursor: pointer;
  font-weight: 500;
  transition: background-color 0.2s;
}

.retry-btn:hover {
  background-color: #1e3a8a;
}

/* 博客列表 - 网格视图 */
.blog-list.grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(350px, 1fr));
  gap: 24px;
  margin-bottom: 40px;
}

/* 博客列表 - 列表视图 */
.blog-list.list {
  display: flex;
  flex-direction: column;
  gap: 20px;
  margin-bottom: 40px;
}

.blog-list.list .blog-card {
  display: flex;
  flex-direction: row;
  height: auto;
}

.blog-list.list .blog-image {
  width: 280px;
  height: 180px;
  border-radius: 8px 0 0 8px;
  flex-shrink: 0;
}

.blog-list.list .blog-content {
  padding: 20px;
}

/* 博客卡片 */
.blog-card {
  background-color: white;
  border-radius: 8px;
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.05);
  overflow: hidden;
  transition: transform 0.3s ease, box-shadow 0.3s ease;
  height: 100%;
  display: flex;
  flex-direction: column;
}

.blog-card:hover {
  transform: translateY(-5px);
  box-shadow: 0 10px 25px rgba(0, 0, 0, 0.1);
}

.blog-image {
  height: 200px;
  background-color: #f3f4f6;
  background-size: cover;
  background-position: center;
  background-repeat: no-repeat;
  position: relative;
}

.placeholder-image {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 3rem;
  color: #d1d5db;
}

.blog-content {
  padding: 24px;
  display: flex;
  flex-direction: column;
  flex: 1;
}

.blog-title {
  font-size: 1.4rem;
  font-weight: 600;
  margin-bottom: 12px;
  color: #1f2937;
  line-height: 1.3;
  overflow: hidden;
  text-overflow: ellipsis;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
}

.blog-meta {
  display: flex;
  gap: 15px;
  flex-wrap: wrap;
  color: #6b7280;
  font-size: 0.9rem;
  margin-bottom: 15px;
}

.blog-date, .blog-views, .blog-comments {
  display: flex;
  align-items: center;
  gap: 5px;
}

.blog-description {
  color: #4b5563;
  margin-bottom: 20px;
  flex: 1;
  line-height: 1.6;
  overflow: hidden;
  text-overflow: ellipsis;
  display: -webkit-box;
  -webkit-line-clamp: 3;
  -webkit-box-orient: vertical;
}

.blog-tags {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
  margin-bottom: 15px;
}

.blog-tag {
  padding: 3px 10px;
  background-color: #f3f4f6;
  border-radius: 20px;
  font-size: 0.8rem;
  color: #4b5563;
}

.blog-footer {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-top: auto;
}

.read-more-btn {
  display: inline-flex;
  align-items: center;
  gap: 5px;
  padding: 8px 16px;
  background-color: #3b82f6;
  color: white;
  border-radius: 6px;
  font-weight: 500;
  text-decoration: none;
  transition: background-color 0.2s;
}

.read-more-btn:hover {
  background-color: #2563eb;
}

.read-more-btn.disabled {
  background-color: #93c5fd;
  cursor: not-allowed;
}

.blog-author {
  color: #6b7280;
  font-size: 0.9rem;
  display: flex;
  align-items: center;
  gap: 5px;
}

/* 分页 */
.pagination {
  display: flex;
  justify-content: center;
  align-items: center;
  gap: 15px;
  margin-top: 40px;
}

.page-btn {
  padding: 10px 18px;
  background-color: #f3f4f6;
  color: #4b5563;
  border: 1px solid #e5e7eb;
  border-radius: 6px;
  cursor: pointer;
  font-weight: 500;
  transition: all 0.2s;
  display: flex;
  align-items: center;
  gap: 5px;
}

.page-btn:hover:not(:disabled) {
  background-color: #e5e7eb;
}

.page-btn:disabled {
  background-color: #f3f4f6;
  color: #9ca3af;
  cursor: not-allowed;
}

.page-numbers {
  display: flex;
  gap: 8px;
}

.page-number {
  width: 40px;
  height: 40px;
  display: flex;
  align-items: center;
  justify-content: center;
  background-color: #f3f4f6;
  border: 1px solid #e5e7eb;
  border-radius: 6px;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s;
}

.page-number:hover:not(.active) {
  background-color: #e5e7eb;
}

.page-number.active {
  background-color: #1e40af;
  color: white;
  border-color: #1e40af;
}

/* 响应式设计 */
@media (max-width: 992px) {
  .blog-list.grid {
    grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
  }
}

@media (max-width: 768px) {
  .blog-header {
    padding: 30px 15px;
  }
  
  .page-title {
    font-size: 2rem;
  }
  
  .filter-options {
    flex-direction: column;
    align-items: flex-start;
    gap: 15px;
  }
  
  .view-toggle {
    align-self: flex-end;
  }
  
  .blog-list.list .blog-card {
    flex-direction: column;
  }
  
  .blog-list.list .blog-image {
    width: 100%;
    border-radius: 8px 8px 0 0;
  }
  
  .page-numbers {
    display: none;
  }
}

@media (max-width: 480px) {
  .blog-list.grid {
    grid-template-columns: 1fr;
  }
  
  .blog-meta {
    flex-direction: column;
    gap: 8px;
  }
  
  .blog-footer {
    flex-direction: column;
    align-items: flex-start;
    gap: 10px;
  }
  
  .read-more-btn {
    width: 100%;
    justify-content: center;
  }
}
</style>