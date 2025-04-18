<template>
  <div class="news-container">
    <h1 class="page-title">新闻动态</h1>
    <p class="page-subtitle">了解我们最新的动态</p>
    
    <!-- 内部导航栏 -->
    <div class="news-categories">
      <div 
        v-for="category in categories" 
        :key="category.value"
        :class="['category-item', { active: currentCategory === category.value }]"
        @click="changeCategory(category.value)"
      >
        {{ category.label }}
      </div>
    </div>
    
    <!-- 新闻列表 -->
    <div v-if="loading" class="loading-state">
      <p>加载中...</p>
    </div>
    
    <div v-else-if="error" class="error-state">
      <p>{{ error }}</p>
      <button @click="loadNews" class="retry-btn">重试</button>
    </div>
    
    <div v-else-if="newsList.length === 0" class="empty-state">
      <p>暂无{{ getCategoryLabel(currentCategory) }}内容</p>
    </div>
    
    <div v-else class="news-list">
      <div v-for="news in newsList" :key="news.id" class="news-card">
        <div class="news-image" :style="news.coverImage ? `background-image: url(${news.coverImage})` : ''">
          <div v-if="news.newsType" class="news-type-tag" :class="getNewsTypeClass(news.newsType)">
            {{ getNewsTypeLabel(news.newsType) }}
          </div>
        </div>
        <div class="news-content">
          <div class="news-meta">
            <span class="news-date">{{ formatDate(news.createdAt || news.createTime) }}</span>
            <span class="news-views">浏览: {{ news.viewCount }}</span>
          </div>
          <h2 class="news-title">
            <router-link :to="`/news/detail?newsId=${news.id}`">{{ news.title }}</router-link>
          </h2>
          <p class="news-excerpt">{{ getExcerpt(news.content) }}</p>
          <div class="news-footer">
            <router-link :to="`/news/detail?newsId=${news.id}`" class="read-more-btn">阅读全文</router-link>
            <span v-if="news.authorName" class="news-author">作者: {{ news.authorName }}</span>
          </div>
        </div>
      </div>
    </div>
    
    <!-- 分页 -->
    <div v-if="newsList.length > 0" class="pagination">
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
import { defineComponent, ref, computed, onMounted, watch } from 'vue';
import { useRoute } from 'vue-router';
import { newsService, type News } from '../services/newsService';

export default defineComponent({
  name: 'NewsView',
  setup() {
    const route = useRoute();
    
    // 新闻类别
    const categories = [
      { label: '全部', value: 'all' },
      { label: '协会公告', value: '协会公告' },
      { label: '活动通知', value: '活动通知' },
      { label: '技术博客', value: '技术分享' },
      { label: '成员风采', value: '成员风采' }
    ];
    
    const newsList = ref<News[]>([]);
    const loading = ref(true);
    const error = ref('');
    const currentPage = ref(1);
    const pageSize = ref(9);
    const totalItems = ref(0);
    const currentCategory = ref('all');
    const currentNewsType = ref<number | null>(null);
    
    // 计算总页数
    const totalPages = computed(() => {
      return Math.ceil(totalItems.value / pageSize.value) || 1;
    });
    
    // 获取类别标签
    const getCategoryLabel = (value: string) => {
      const category = categories.find(c => c.value === value);
      return category ? category.label : '内容';
    };
    
    // 获取新闻类型标签
    const getNewsTypeLabel = (type: number) => {
      switch (type) {
        case 1:
          return '通知';
        case 2:
          return '博客';
        default:
          return '未知';
      }
    };
    
    // 获取新闻类型CSS类
    const getNewsTypeClass = (type: number) => {
      switch (type) {
        case 1:
          return 'news-type-notification';
        case 2:
          return 'news-type-blog';
        default:
          return '';
      }
    };
    
    // 加载新闻列表
    const loadNews = async () => {
      loading.value = true;
      error.value = '';
      
      try {
        const params: any = {
          page: currentPage.value,
          pageSize: pageSize.value,
          status: 1 // 只获取已发布的新闻
        };
        
        // 如果不是全部类别，则添加类别筛选
        if (currentCategory.value !== 'all') {
          params.category = currentCategory.value;
        }
        
        // 如果指定了新闻类型，则添加类型筛选
        if (currentNewsType.value !== null) {
          params.newsType = currentNewsType.value;
        }
        
        const response = await newsService.getNewsList(params);
        
        if (response.code === 0) {
          newsList.value = response.data.list;
          totalItems.value = response.data.total;
        } else {
          error.value = response.msg || '获取新闻列表失败';
        }
      } catch (err) {
        error.value = '获取新闻列表失败，请稍后重试';
        console.error('加载新闻列表出错:', err);
      } finally {
        loading.value = false;
      }
    };
    
    // 切换类别
    const changeCategory = (category: string) => {
      if (currentCategory.value !== category) {
        currentCategory.value = category;
        currentPage.value = 1; // 切换类别时重置页码
        
        // 根据类别设置新闻类型
        if (category === '技术分享') {
          currentNewsType.value = 2; // 技术博客
        } else if (category === '协会公告' || category === '活动通知') {
          currentNewsType.value = 1; // 协会通知
        } else {
          currentNewsType.value = null; // 全部类型
        }
        
        loadNews();
      }
    };
    
    // 切换页码
    const changePage = (page: number) => {
      if (page >= 1 && page <= totalPages.value) {
        currentPage.value = page;
        loadNews();
      }
    };
    
    // 格式化日期
    const formatDate = (dateStr: string) => {
      if (!dateStr) return '';
      const date = new Date(dateStr);
      return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`;
    };
    
    // 获取内容摘要
    const getExcerpt = (content: string) => {
      if (!content) return '';
      // 移除HTML标签并截取前100个字符
      return content.replace(/<[^>]+>/g, '').substring(0, 100) + '...';
    };
    
    // 监听路由参数变化
    watch(() => route.query, (newQuery) => {
      // 如果URL中有category参数，则切换到对应类别
      if (newQuery.category) {
        const category = String(newQuery.category);
        if (categories.some(c => c.value === category)) {
          currentCategory.value = category;
          
          // 设置对应的新闻类型
          if (category === '技术分享') {
            currentNewsType.value = 2; // 技术博客
          } else if (category === '协会公告' || category === '活动通知') {
            currentNewsType.value = 1; // 协会通知
          } else {
            currentNewsType.value = null; // 全部类型
          }
        }
      }
      
      // 如果URL中有newsType参数，则设置对应的新闻类型
      if (newQuery.newsType) {
        currentNewsType.value = Number(newQuery.newsType);
      }
      
      loadNews();
    }, { immediate: true });
    
    // 组件挂载时加载数据
    onMounted(() => {
      // 检查URL中是否有category参数
      if (route.query.category) {
        const category = String(route.query.category);
        if (categories.some(c => c.value === category)) {
          currentCategory.value = category;
          
          // 设置对应的新闻类型
          if (category === '技术分享') {
            currentNewsType.value = 2; // 技术博客
          } else if (category === '协会公告' || category === '活动通知') {
            currentNewsType.value = 1; // 协会通知
          } else {
            currentNewsType.value = null; // 全部类型
          }
        }
      }
      
      // 如果URL中有newsType参数，则设置对应的新闻类型
      if (route.query.newsType) {
        currentNewsType.value = Number(route.query.newsType);
      }
      
      // 如果从博客页面跳转过来，默认显示技术博客类别
      if (route.query.from === 'blog') {
        currentCategory.value = '技术分享';
        currentNewsType.value = 2; // 技术博客
      }
      
      loadNews();
    });
    
    return {
      categories,
      newsList,
      loading,
      error,
      currentPage,
      totalPages,
      currentCategory,
      getCategoryLabel,
      getNewsTypeLabel,
      getNewsTypeClass,
      loadNews,
      changeCategory,
      changePage,
      formatDate,
      getExcerpt
    };
  },
});
</script>

<style scoped>
.news-container {
  padding: 30px;
  max-width: 1200px;
  margin: 0 auto;
}

.page-title {
  color: #1e40af;
  margin-bottom: 10px;
  font-size: 2rem;
  text-align: center;
}

.page-subtitle {
  color: #6b7280;
  margin-bottom: 30px;
  text-align: center;
}

/* 内部导航栏样式 */
.news-categories {
  display: flex;
  justify-content: center;
  margin-bottom: 30px;
  border-bottom: 1px solid #e5e7eb;
  padding-bottom: 10px;
}

.category-item {
  padding: 8px 16px;
  margin: 0 8px;
  cursor: pointer;
  border-radius: 4px;
  font-weight: 500;
  transition: all 0.3s ease;
  position: relative;
}

.category-item:hover {
  color: #1e40af;
}

.category-item.active {
  color: #1e40af;
  font-weight: 600;
}

.category-item.active::after {
  content: '';
  position: absolute;
  bottom: -10px;
  left: 0;
  width: 100%;
  height: 3px;
  background-color: #1e40af;
  border-radius: 3px 3px 0 0;
}

/* 新闻列表样式 */
.news-list {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(350px, 1fr));
  gap: 24px;
  margin-top: 20px;
}

.news-card {
  border-radius: 8px;
  overflow: hidden;
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.05);
  transition: transform 0.3s ease, box-shadow 0.3s ease;
  background-color: white;
  display: flex;
  flex-direction: column;
}

.news-card:hover {
  transform: translateY(-5px);
  box-shadow: 0 10px 15px rgba(0, 0, 0, 0.1);
}

.news-image {
  height: 180px;
  background-color: #f3f4f6;
  background-size: cover;
  background-position: center;
  position: relative;
}

.news-type-tag {
  position: absolute;
  top: 10px;
  right: 10px;
  padding: 4px 8px;
  border-radius: 4px;
  font-size: 12px;
  font-weight: 500;
  color: white;
}

.news-type-notification {
  background-color: #1e40af;
}

.news-type-blog {
  background-color: #10b981;
}

.news-content {
  padding: 20px;
  flex: 1;
  display: flex;
  flex-direction: column;
}

.news-meta {
  display: flex;
  justify-content: space-between;
  color: #6b7280;
  font-size: 0.875rem;
  margin-bottom: 10px;
}

.news-title {
  font-size: 1.25rem;
  font-weight: 600;
  margin-bottom: 10px;
  color: #1f2937;
}

.news-excerpt {
  color: #4b5563;
  margin-bottom: 15px;
  flex: 1;
}

.news-footer {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-top: auto;
}

.read-more-btn {
  padding: 6px 12px;
  background-color: #e0e7ff;
  color: #1e40af;
  border-radius: 4px;
  font-weight: 500;
  transition: background-color 0.3s ease;
  text-decoration: none;
}

.read-more-btn:hover {
  background-color: #c7d2fe;
}

.news-author {
  color: #6b7280;
  font-size: 0.875rem;
}

/* 加载状态和空状态 */
.loading-state,
.empty-state,
.error-state {
  text-align: center;
  padding: 50px;
  color: #6b7280;
  background-color: #f9fafb;
  border-radius: 8px;
  margin-top: 20px;
}

.retry-btn {
  margin-top: 10px;
  padding: 8px 16px;
  background-color: #1e40af;
  color: white;
  border: none;
  border-radius: 4px;
  cursor: pointer;
}

/* 分页样式 */
.pagination {
  display: flex;
  justify-content: center;
  align-items: center;
  margin-top: 40px;
  gap: 10px;
}

.page-btn {
  padding: 8px 16px;
  border: 1px solid #d1d5db;
  background-color: white;
  border-radius: 4px;
  cursor: pointer;
  transition: all 0.3s ease;
}

.page-btn:hover:not(:disabled) {
  background-color: #f3f4f6;
}

.page-btn:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.page-info {
  padding: 0 10px;
  color: #4b5563;
}

/* 响应式布局 */
@media (max-width: 768px) {
  .news-list {
    grid-template-columns: 1fr;
  }
  
  .news-categories {
    flex-wrap: wrap;
  }
  
  .category-item {
    margin-bottom: 8px;
  }
}
</style>