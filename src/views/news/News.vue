<template>
  <div class="news-container">
    <h1 class="page-title">新闻动态</h1>
    <p class="page-subtitle">了解我们最新的动态</p>
    
    <!-- 筛选区域 -->
    <div class="news-filters">
      <div class="filter-item">
        <select v-model="filter.status" class="filter-select" @change="handleFilterChange">
          <option value="-1">全部状态</option>
          <option value="1">已发布</option>
          <option value="0">待发布</option>
          <option value="2">已下架</option>
        </select>
      </div>
    </div>
    
    <!-- 新闻列表 -->
    <div class="news-content">
      <!-- 加载状态 -->
      <div v-if="loading" class="loading-state">
        <div class="loading-spinner"></div>
        <p>加载中...</p>
      </div>
      
      <!-- 新闻列表 -->
      <div v-else-if="newsList.length > 0" class="news-grid">
        <NewsCard
          v-for="news in newsList"
          :key="news.id"
          :news="news"
          @view="handleView"
          @readMore="handleView"
        />
      </div>
      
      <!-- 空状态 -->
      <div v-else class="empty-state">
        <p>暂无新闻内容</p>
      </div>
      
      <!-- 分页器 -->
      <div v-if="newsList.length > 0" class="pagination-wrapper">
        <Pagination
          :total="totalItems"
          v-model:currentPage="currentPage"
          v-model:pageSize="pageSize"
          @change="handlePageChange"
        />
      </div>
    </div>
  </div>
</template>

<script lang="ts">
import { defineComponent, ref, computed, onMounted, watch, reactive } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import { newsService } from '../../services/newsService.ts';
import NewsCard from '../../components/news/NewsCard.vue';
import Pagination from '../../components/common/Pagination.vue';
import type { News } from '../../components/news/NewsCard.vue';

export default defineComponent({
  name: 'NewsView',
  components: {
    NewsCard,
    Pagination
  },
  setup() {
    const route = useRoute();
    const router = useRouter();
    
    // 新闻类别
    const categories = [
      { label: '全部', value: 'all' },
      { label: '协会公告', value: '协会公告' },
      { label: '活动通知', value: '活动通知' },
      { label: '技术分享', value: '技术分享' },
      { label: '成员风采', value: '成员风采' }
    ];
    
    const newsList = ref<News[]>([]);
    const loading = ref(true);
    const error = ref('');
    const currentPage = ref(1);
    const pageSize = ref(9);
    const totalItems = ref(0);
    const currentCategory = ref('all');
    
    // 筛选条件
    const filter = reactive({
      status: 1  // 默认显示已发布的新闻
    });
    
    // 计算总页数
    const totalPages = computed(() => {
      return Math.ceil(totalItems.value / pageSize.value) || 1;
    });
    
    // 获取类别标签
    const getCategoryLabel = (value: string) => {
      const category = categories.find(c => c.value === value);
      return category ? category.label : '内容';
    };
    
    // 处理筛选条件变化
    const handleFilterChange = () => {
      currentPage.value = 1;  // 重置页码
      loadNews();
    };
    
    // 加载新闻列表
    const loadNews = async () => {
      loading.value = true;
      error.value = '';
      
      try {
        const params: any = {
          page: currentPage.value,
          pageSize: pageSize.value
        };
        
        // 添加状态筛选
        if (filter.status !== -1) {
          params.status = filter.status;
        }
        
        // 如果不是全部类别，则添加类别筛选
        if (currentCategory.value !== 'all') {
          params.category = currentCategory.value;
        }
        
        const response = await newsService.getNewsList(params);
        
        if (response.code === 0) {
          // 对返回的数据进行处理，确保符合NewsCard组件需要的格式
          newsList.value = response.data.list.map(item => {
            // 处理可能为null的字段
            return {
              ...item,
              // 确保NewsCard需要的字段都存在
              content: item.content || '',
              title: item.title || '无标题',
              category: item.category || '未分类',
              summary: item.summary || (item.content ? getExcerpt(item.content) : '暂无内容'),
              coverUrl: item.coverUrl || item.coverImage || '',
              author: item.author || item.authorName || '管理员',
              publishDate: item.publishDate || item.createdAt || item.createTime || '',
              isHot: item.isHot || item.isTop === 1,
              tags: item.tags || [],
              viewCount: item.viewCount || 0
            }
          });
          totalItems.value = response.data.total;
        } else {
          error.value = response.msg || '获取新闻列表失败';
          
          // 仅在开发环境或API错误时使用模拟数据
          if (import.meta.env.DEV || response.code === -1) {
            newsList.value = getMockData();
            totalItems.value = newsList.value.length;
          } else {
            newsList.value = [];
            totalItems.value = 0;
          }
        }
      } catch (err) {
        error.value = '获取新闻列表失败，请稍后重试';
        console.error('加载新闻列表出错:', err);
        
        // 仅在开发环境或API错误时使用模拟数据
        if (import.meta.env.DEV) {
          newsList.value = getMockData();
          totalItems.value = newsList.value.length;
        } else {
          newsList.value = [];
          totalItems.value = 0;
        }
      } finally {
        loading.value = false;
      }
    };
    
    // 生成模拟数据
    const getMockData = (): News[] => {
      return [
        {
          id: 1,
          title: '软件实践基地纳新通知',
          content: '软件实践基地即将开展2024年度纳新活动，欢迎所有对软件开发感兴趣的同学踊跃报名。我们将提供全面的技术培训和项目实践机会，帮助你快速成长为优秀的软件工程师。',
          summary: '软件实践基地2024年度纳新活动即将开始，提供技术培训和项目实践机会，欢迎报名。',
          category: '协会公告',
          newsType: 1,
          coverImage: 'https://picsum.photos/id/101/800/400',
          coverUrl: 'https://picsum.photos/id/101/800/400',
          viewCount: 256,
          isTop: 1,
          status: 1,
          createdAt: '2024-03-10T10:00:00',
          updatedAt: '2024-03-10T10:00:00',
          author: '协会管理员',
          authorName: '协会管理员',
          publishDate: '2024-03-10T10:00:00',
          tags: ['纳新', '招募', '软件开发'],
          isHot: true,
          severity: 'high'
        },
        {
          id: 2,
          title: '前端技术分享会：Vue3最佳实践',
          content: '本次分享会将深入探讨Vue3的Composition API、响应式系统以及性能优化技巧。通过实际案例，帮助你掌握Vue3的核心概念和开发技巧，提升前端开发效率。',
          summary: '深入探讨Vue3的Composition API、响应式系统及性能优化技巧，通过实例掌握核心概念。',
          category: '技术分享',
          newsType: 2,
          coverImage: 'https://picsum.photos/id/102/800/400',
          coverUrl: 'https://picsum.photos/id/102/800/400',
          viewCount: 189,
          isTop: 0,
          status: 1,
          createdAt: '2024-03-05T14:30:00',
          updatedAt: '2024-03-05T14:30:00',
          author: '张小明',
          authorName: '张小明',
          publishDate: '2024-03-05T14:30:00',
          tags: ['Vue3', '前端开发', '技术分享'],
          isHot: true,
          severity: 'medium'
        },
        {
          id: 3,
          title: '软件工程实践课程安排',
          content: '软件工程实践课程将于下周开始，课程安排如下：周一至周三上机实践，周四项目研讨，周五总结汇报。请各位同学提前做好准备，带好个人电脑和相关学习资料。',
          summary: '软件工程实践课程将于下周开始，包括上机实践、项目研讨和总结汇报，请做好准备。',
          category: '活动通知',
          newsType: 1,
          coverImage: 'https://picsum.photos/id/103/800/400',
          coverUrl: 'https://picsum.photos/id/103/800/400',
          viewCount: 321,
          isTop: 0,
          status: 1,
          createdAt: '2024-02-28T09:00:00',
          updatedAt: '2024-02-28T09:00:00',
          author: '教务管理员',
          authorName: '教务管理员',
          publishDate: '2024-02-28T09:00:00',
          tags: ['课程安排', '软件工程', '实践课程'],
          isHot: false,
          severity: 'normal'
        }
      ];
    };
    
    // 切换类别
    const changeCategory = (category: string) => {
      if (currentCategory.value !== category) {
        currentCategory.value = category;
        currentPage.value = 1; // 切换类别时重置页码
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
    
    // 处理分页器页码变化
    const handlePageChange = (page: number) => {
      changePage(page);
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
    
    // 查看新闻详情
    const handleView = (news: News) => {
      console.log('查看新闻详情:', news);
      // 跳转到新闻详情页
      router.push(`/news/detail?newsId=${news.id}`);
    };
    
    // 监听路由参数变化
    watch(() => route.query, (newQuery) => {
      // 如果URL中有category参数，则切换到对应类别
      if (newQuery.category) {
        const category = String(newQuery.category);
        if (categories.some(c => c.value === category)) {
          currentCategory.value = category;
        }
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
        }
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
      totalItems,
      pageSize,
      currentCategory,
      filter,
      getCategoryLabel,
      loadNews,
      changeCategory,
      changePage,
      handlePageChange,
      formatDate,
      getExcerpt,
      handleView,
      handleFilterChange
    };
  },
});
</script>

<style scoped>
.news-container {
  padding: 30px;
  max-width: 1200px;
  margin: 0 auto;
  text-align: center;
}

.page-title {
  color: #1e40af;
  margin-bottom: 10px;
  font-size: 2rem;
}

.page-subtitle {
  color: #6b7280;
  margin-bottom: 20px;
}

/* 筛选区域样式 */
.news-filters {
  display: flex;
  justify-content: flex-end;
  margin-bottom: 20px;
  padding: 0 20px;
}

.filter-item {
  margin-left: 10px;
}

.filter-select {
  padding: 8px 12px;
  border: 1px solid #dcdfe6;
  border-radius: 4px;
  background-color: white;
  color: #606266;
  min-width: 120px;
  cursor: pointer;
  outline: none;
}

.news-content {
  padding: 0 20px;
  min-height: 400px;
}

.news-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(350px, 1fr));
  gap: 24px;
  margin-bottom: 30px;
}

/* 加载状态样式 */
.loading-state {
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  padding: 50px;
  color: #6b7280;
}

.loading-spinner {
  width: 40px;
  height: 40px;
  border: 4px solid rgba(30, 64, 175, 0.1);
  border-radius: 50%;
  border-top-color: #1e40af;
  animation: spin 1s linear infinite;
  margin-bottom: 16px;
}

@keyframes spin {
  0% { transform: rotate(0deg); }
  100% { transform: rotate(360deg); }
}

/* 空状态样式 */
.empty-state {
  display: flex;
  justify-content: center;
  align-items: center;
  background-color: #f9fafb;
  padding: 50px;
  border-radius: 8px;
  color: #4b5563;
  margin-top: 20px;
}

/* 分页器样式 */
.pagination-wrapper {
  margin-top: 30px;
  margin-bottom: 20px;
  display: flex;
  justify-content: center;
}

.pagination {
  display: flex;
  align-items: center;
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
  .news-grid {
    grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
  }
  
  .news-filters {
    justify-content: center;
  }
}

@media (max-width: 480px) {
  .news-grid {
    grid-template-columns: 1fr;
  }
  
  .news-container {
    padding: 20px 15px;
  }
}
</style>