<template>
  <div class="blog-container">
    <div class="blog-header">
      <h1 class="page-title">技术博客</h1>
      <p class="page-subtitle">分享技术知识，共同学习成长</p>
    </div>
    
    <div class="blog-filter">
      <div class="search-box">
        <input 
          type="text" 
          v-model="searchKeyword" 
          placeholder="搜索博客..." 
          @keyup.enter="searchBlogs"
        />
        <button @click="searchBlogs" class="search-btn">
          搜索
        </button>
      </div>
      
      <div class="filter-options">
        <select v-model="sortBy" @change="loadBlogs">
          <option value="newest">最新发布</option>
          <option value="popular">最多浏览</option>
        </select>
      </div>
    </div>
    
    <div v-if="loading" class="loading-state">
      <p>加载中...</p>
    </div>
    
    <div v-else-if="error" class="error-state">
      <p>{{ error }}</p>
      <button @click="loadBlogs" class="retry-btn">重试</button>
    </div>
    
    <div v-else-if="blogs.length === 0" class="empty-state">
      <p>暂无技术博客</p>
    </div>
    
    <div v-else class="blog-list">
      <div v-for="blog in blogs" :key="blog.newsId" class="blog-card">
        <div class="blog-image" :style="blog.coverImage ? `background-image: url(${blog.coverImage})` : ''"></div>
        <div class="blog-content">
          <div class="blog-meta">
            <span class="blog-date">{{ formatDate(blog.createTime) }}</span>
            <span class="blog-views">浏览: {{ blog.viewCount }}</span>
          </div>
          <h2 class="blog-title">{{ blog.title }}</h2>
          <p class="blog-excerpt">{{ getExcerpt(blog.content) }}</p>
          <div class="blog-footer">
            <router-link :to="`/news/${blog.newsId}`" class="read-more-btn">阅读全文</router-link>
            <span v-if="blog.authorName" class="blog-author">作者: {{ blog.authorName }}</span>
          </div>
        </div>
      </div>
    </div>
    
    <div v-if="blogs.length > 0" class="pagination">
      <button 
        :disabled="currentPage <= 1" 
        @click="changePage(currentPage - 1)" 
        class="page-btn"
      >
        上一页
      </button>
      <span class="page-info">{{ currentPage }} / {{ totalPages }}</span>
      <button 
        :disabled="currentPage >= totalPages" 
        @click="changePage(currentPage + 1)" 
        class="page-btn"
      >
        下一页
      </button>
    </div>
  </div>
</template>

<script lang="ts">
import { defineComponent, ref, computed, onMounted } from 'vue';
import { useRouter, useRoute } from 'vue-router';
import { newsService, type News } from '../services/newsService';

export default defineComponent({
  name: 'BlogView',
  setup() {
    const router = useRouter();
    const route = useRoute();
    
    const blogs = ref<News[]>([]);
    const loading = ref(true);
    const error = ref('');
    const currentPage = ref(1);
    const pageSize = ref(9);
    const totalItems = ref(0);
    const searchKeyword = ref('');
    const sortBy = ref('newest');
    
    const totalPages = computed(() => {
      return Math.ceil(totalItems.value / pageSize.value);
    });
    
    const loadBlogs = async () => {
      loading.value = true;
      error.value = '';
      
      try {
        // 这里我们调用getBlogList方法，该方法会筛选category为"技术分享"的新闻
        const response = await newsService.getBlogList({
          page: currentPage.value,
          pageSize: pageSize.value
        });
        
        if (response.code === 0) {
          blogs.value = response.data.list;
          totalItems.value = response.data.total;
          
          // 根据排序选项进行排序
          if (sortBy.value === 'popular') {
            blogs.value.sort((a, b) => b.viewCount - a.viewCount);
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
    
    const searchBlogs = () => {
      currentPage.value = 1; // 重置到第一页
      loadBlogs();
    };
    
    const changePage = (page: number) => {
      currentPage.value = page;
      loadBlogs();
      // 滚动到页面顶部
      window.scrollTo({ top: 0, behavior: 'smooth' });
    };
    
    // 格式化日期
    const formatDate = (dateStr: string) => {
      const date = new Date(dateStr);
      return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`;
    };
    
    // 获取内容摘要
    const getExcerpt = (content: string) => {
      // 移除Markdown标记
      const plainText = content.replace(/\*\*|\*|\[|\]|\(|\)|\#|\>|\`\`\`|\`/g, '');
      return plainText.length > 150 ? plainText.substring(0, 150) + '...' : plainText;
    };
    
    onMounted(() => {
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
      
      loadBlogs();
    });
    
    return {
      blogs,
      loading,
      error,
      currentPage,
      totalPages,
      searchKeyword,
      sortBy,
      loadBlogs,
      searchBlogs,
      changePage,
      formatDate,
      getExcerpt
    };
  }
});
</script>

<style scoped>
.blog-container {
  max-width: 1200px;
  margin: 0 auto;
  padding: 30px 20px;
}

.blog-header {
  text-align: center;
  margin-bottom: 40px;
}

.page-title {
  color: #1e40af;
  font-size: 2.2rem;
  margin-bottom: 10px;
}

.page-subtitle {
  color: #6b7280;
  font-size: 1.1rem;
}

.blog-filter {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 30px;
  flex-wrap: wrap;
  gap: 15px;
}

.search-box {
  display: flex;
  max-width: 400px;
  width: 100%;
}

.search-box input {
  flex: 1;
  padding: 10px 15px;
  border: 1px solid #d1d5db;
  border-radius: 4px 0 0 4px;
  font-size: 1rem;
}

.search-btn {
  background-color: #1e40af;
  color: white;
  border: none;
  padding: 0 20px;
  border-radius: 0 4px 4px 0;
  cursor: pointer;
  transition: background-color 0.3s;
}

.search-btn:hover {
  background-color: #1e3a8a;
}

.filter-options select {
  padding: 10px 15px;
  border: 1px solid #d1d5db;
  border-radius: 4px;
  background-color: white;
  font-size: 1rem;
  cursor: pointer;
}

.blog-list {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(350px, 1fr));
  gap: 30px;
  margin-bottom: 40px;
}

.blog-card {
  border-radius: 8px;
  overflow: hidden;
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.05);
  transition: transform 0.3s, box-shadow 0.3s;
  background-color: white;
  height: 100%;
  display: flex;
  flex-direction: column;
}

.blog-card:hover {
  transform: translateY(-5px);
  box-shadow: 0 10px 15px rgba(0, 0, 0, 0.1);
}

.blog-image {
  height: 200px;
  background-color: #e5e7eb;
  background-size: cover;
  background-position: center;
}

.blog-content {
  padding: 20px;
  flex: 1;
  display: flex;
  flex-direction: column;
}

.blog-meta {
  display: flex;
  justify-content: space-between;
  color: #6b7280;
  font-size: 0.9rem;
  margin-bottom: 10px;
}

.blog-title {
  color: #1e40af;
  font-size: 1.3rem;
  margin-bottom: 15px;
  line-height: 1.4;
}

.blog-excerpt {
  color: #4b5563;
  line-height: 1.6;
  margin-bottom: 20px;
  flex: 1;
}

.blog-footer {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-top: auto;
}

.read-more-btn {
  background-color: #1e40af;
  color: white;
  padding: 8px 16px;
  border-radius: 4px;
  text-decoration: none;
  font-size: 0.9rem;
  transition: background-color 0.3s;
}

.read-more-btn:hover {
  background-color: #1e3a8a;
}

.blog-author {
  color: #6b7280;
  font-size: 0.9rem;
}

.loading-state,
.error-state,
.empty-state {
  text-align: center;
  padding: 60px 20px;
  background-color: #f9fafb;
  border-radius: 8px;
  margin-bottom: 30px;
}

.retry-btn {
  background-color: #1e40af;
  color: white;
  border: none;
  padding: 8px 16px;
  border-radius: 4px;
  margin-top: 15px;
  cursor: pointer;
}

.pagination {
  display: flex;
  justify-content: center;
  align-items: center;
  gap: 15px;
  margin-top: 20px;
}

.page-btn {
  background-color: #1e40af;
  color: white;
  border: none;
  padding: 8px 16px;
  border-radius: 4px;
  cursor: pointer;
  transition: background-color 0.3s;
}

.page-btn:disabled {
  background-color: #9ca3af;
  cursor: not-allowed;
}

.page-info {
  color: #4b5563;
}

@media (max-width: 768px) {
  .blog-filter {
    flex-direction: column;
    align-items: stretch;
  }
  
  .search-box {
    max-width: none;
  }
  
  .blog-list {
    grid-template-columns: 1fr;
  }
}
</style>