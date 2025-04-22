<template>
  <div class="news-detail-container">
    <div v-if="loading" class="loading-state">
      <p>加载中...</p>
    </div>
    
    <div v-else-if="error" class="error-state">
      <p>{{ error }}</p>
      <button @click="loadNewsDetail" class="retry-btn">重试</button>
      <router-link to="/news" class="back-btn">返回新闻列表</router-link>
    </div>
    
    <template v-else-if="newsDetail">
      <div class="back-nav">
        <router-link to="/news" class="back-link">
          <i class="fas fa-arrow-left"></i> 返回列表
        </router-link>
      </div>
      
      <article class="news-content">
        <header>
          <div class="news-category" :class="getNewsTypeClass(newsDetail.newsType)">
            {{ getNewsTypeLabel(newsDetail.newsType) }} | {{ newsDetail.category }}
          </div>
          <h1>{{ newsDetail.title }}</h1>
          <div class="news-meta">
            <div class="meta-item">
              <i class="fas fa-calendar"></i>
              <span>{{ formatDate(newsDetail.createdAt || newsDetail.createTime || '') }}</span>
            </div>
            <div class="meta-item">
              <i class="fas fa-eye"></i>
              <span>浏览: {{ newsDetail.viewCount }}</span>
            </div>
            <div v-if="newsDetail.authorName" class="meta-item">
              <i class="fas fa-user"></i>
              <span>{{ newsDetail.authorName || newsDetail.author || '管理员' }}</span>
            </div>
          </div>
        </header>
        
        <div v-if="newsDetail.coverImage" class="cover-image">
          <img :src="newsDetail.coverImage" :alt="newsDetail.title" />
        </div>
        
        <div class="article-content" v-html="formatContent(newsDetail.content)"></div>
        
        <div class="article-footer">
          <div class="update-info">
            最后更新: {{ formatDate(newsDetail.updatedAt || newsDetail.updateTime || '') }}
          </div>
          
          <div class="share-buttons">
            <button class="share-btn" title="分享到微信">
              <i class="fab fa-weixin"></i>
            </button>
            <button class="share-btn" title="分享到微博">
              <i class="fab fa-weibo"></i>
            </button>
            <button class="share-btn" title="分享到QQ">
              <i class="fab fa-qq"></i>
            </button>
          </div>
        </div>
      </article>
      
      <div class="related-news">
        <h2>相关新闻</h2>
        <div class="related-news-list">
          <div class="related-news-item" v-for="(item, index) in relatedNews" :key="index">
            <router-link :to="`/news/detail?newsId=${item.id}`">{{ item.title }}</router-link>
            <span class="related-date">{{ item.date }}</span>
          </div>
        </div>
      </div>
    </template>
    
    <div v-else class="not-found">
      <h2>未找到新闻</h2>
      <p>抱歉，没有找到该新闻或已被删除</p>
      <router-link to="/news" class="back-btn">返回新闻列表</router-link>
    </div>
  </div>
</template>

<script lang="ts">
import { defineComponent, ref, onMounted, computed, watch } from 'vue';
import { useRoute } from 'vue-router';
import { newsService } from '../../services/newsService.ts';
import type { News } from '../../components/news/NewsCard.vue';
import MarkdownIt from 'markdown-it';

export default defineComponent({
  name: 'NewsDetail',
  setup() {
    const route = useRoute();
    const newsId = computed(() => {
      // 优先使用查询参数中的newsId
      if (route.query.newsId) {
        const id = route.query.newsId;
        return typeof id === 'string' ? parseInt(id) : 0;
      }
      // 兼容路径参数方式
      const id = route.params.id;
      return typeof id === 'string' ? parseInt(id) : 0;
    });
    
    const newsDetail = ref<News | null>(null);
    const loading = ref(true);
    const error = ref('');
    const md = new MarkdownIt();
    
    // 相关新闻（静态数据，实际应用中可通过API获取）
    const relatedNews = ref([
      { id: 1, title: '软件创新实践基地举办Python编程大赛', date: '2023-05-15' },
      { id: 2, title: '技术沙龙：探讨人工智能在教育中的应用', date: '2023-05-10' },
      { id: 3, title: '软件中心开放日活动圆满结束', date: '2023-05-05' }
    ]);
    
    // 加载新闻详情
    const loadNewsDetail = async () => {
      if (!newsId.value) return;
      
      loading.value = true;
      error.value = '';
      
      try {
        const response = await newsService.getNewsDetail(newsId.value);
        
        if (response.code === 0) {
          newsDetail.value = response.data;
        } else {
          error.value = response.msg || '获取新闻详情失败';
          newsDetail.value = null;
        }
      } catch (err) {
        console.error('获取新闻详情出错:', err);
        error.value = '获取新闻详情时发生错误，请稍后再试';
        newsDetail.value = null;
      } finally {
        loading.value = false;
      }
    };
    
    // 监听路由参数变化，重新加载数据
    watch(newsId, (newId, oldId) => {
      if (newId !== oldId) {
        loadNewsDetail();
      }
    });
    
    // 格式化日期
    const formatDate = (dateStr: string) => {
      if (!dateStr) return '';
      
      try {
        const date = new Date(dateStr);
        return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`;
      } catch (e) {
        console.error('日期格式化错误:', e);
        return '';
      }
    };
    
    // 格式化内容（支持Markdown）
    const formatContent = (content: string) => {
      if (!content) return '';
      
      try {
        // 如果内容中已经包含HTML标签，则直接返回
        if (/<[a-z][\s\S]*>/i.test(content)) {
          return content;
        }
        
        // 否则按Markdown格式渲染
        return md.render(content);
      } catch (e) {
        console.error('内容格式化错误:', e);
        return content; // 出错时返回原内容
      }
    };
    
    // 获取新闻类型标签
    const getNewsTypeLabel = (type: number) => {
      switch (type) {
        case 1:
          return '协会通知';
        case 2:
          return '技术博客';
        default:
          return '新闻';
      }
    };
    
    // 获取新闻类型CSS类
    const getNewsTypeClass = (type: number) => {
      switch (type) {
        case 1:
          return 'type-notification';
        case 2:
          return 'type-blog';
        default:
          return '';
      }
    };
    
    onMounted(() => {
      loadNewsDetail();
    });
    
    return {
      newsDetail,
      loading,
      error,
      relatedNews,
      loadNewsDetail,
      formatDate,
      formatContent,
      getNewsTypeLabel,
      getNewsTypeClass
    };
  }
});
</script>

<style scoped>
.news-detail-container {
  max-width: 900px;
  margin: 0 auto;
  padding: 30px 20px;
}

.loading-state,
.error-state,
.not-found {
  text-align: center;
  padding: 60px 20px;
  background-color: #f9fafb;
  border-radius: 8px;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.05);
}

.error-state p,
.not-found p {
  color: #6b7280;
  margin-bottom: 20px;
}

.retry-btn,
.back-btn {
  padding: 8px 16px;
  border-radius: 4px;
  display: inline-block;
  margin: 10px;
  cursor: pointer;
  font-weight: 500;
  transition: all 0.3s ease;
}

.retry-btn {
  background-color: #1e40af;
  color: white;
  border: none;
}

.retry-btn:hover {
  background-color: #1e3a8a;
}

.back-btn {
  background-color: #e5e7eb;
  color: #4b5563;
  text-decoration: none;
}

.back-btn:hover {
  background-color: #d1d5db;
}

.back-nav {
  margin-bottom: 20px;
}

.back-link {
  display: inline-flex;
  align-items: center;
  color: #4b5563;
  text-decoration: none;
  font-weight: 500;
  transition: color 0.3s ease;
}

.back-link:hover {
  color: #1e40af;
}

.back-link i {
  margin-right: 8px;
}

.news-content {
  background-color: white;
  border-radius: 8px;
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.05);
  padding: 30px;
  margin-bottom: 30px;
}

.news-category {
  display: inline-block;
  padding: 4px 12px;
  border-radius: 20px;
  font-size: 0.9rem;
  font-weight: 500;
  color: white;
  margin-bottom: 16px;
}

.type-notification {
  background-color: #1e40af;
}

.type-blog {
  background-color: #047857;
}

.news-content h1 {
  font-size: 2rem;
  margin-bottom: 20px;
  color: #1f2937;
  line-height: 1.3;
}

.news-meta {
  display: flex;
  flex-wrap: wrap;
  gap: 20px;
  margin-bottom: 24px;
  color: #6b7280;
}

.meta-item {
  display: flex;
  align-items: center;
  gap: 8px;
}

.meta-item i {
  font-size: 0.9rem;
}

.cover-image {
  margin-bottom: 24px;
  border-radius: 8px;
  overflow: hidden;
}

.cover-image img {
  width: 100%;
  height: auto;
  display: block;
}

.article-content {
  font-size: 1.1rem;
  line-height: 1.7;
  color: #4b5563;
  margin-bottom: 30px;
}

.article-content :deep(h2) {
  font-size: 1.5rem;
  margin-top: 30px;
  margin-bottom: 15px;
  color: #1f2937;
}

.article-content :deep(h3) {
  font-size: 1.25rem;
  margin-top: 25px;
  margin-bottom: 10px;
  color: #1f2937;
}

.article-content :deep(p) {
  margin-bottom: 20px;
}

.article-content :deep(ul), 
.article-content :deep(ol) {
  margin-bottom: 20px;
  padding-left: 40px;
}

.article-content :deep(li) {
  margin-bottom: 8px;
}

.article-content :deep(blockquote) {
  border-left: 4px solid #1e40af;
  padding-left: 16px;
  margin-left: 0;
  margin-right: 0;
  color: #6b7280;
}

.article-content :deep(img) {
  max-width: 100%;
  height: auto;
  border-radius: 8px;
  margin: 20px 0;
}

.article-content :deep(a) {
  color: #1e40af;
  text-decoration: none;
}

.article-content :deep(a):hover {
  text-decoration: underline;
}

.article-content :deep(pre) {
  background-color: #f9fafb;
  padding: 16px;
  border-radius: 8px;
  overflow-x: auto;
  margin-bottom: 20px;
}

.article-content :deep(code) {
  font-family: monospace;
  font-size: 0.9em;
}

.article-footer {
  display: flex;
  justify-content: space-between;
  align-items: center;
  border-top: 1px solid #e5e7eb;
  padding-top: 20px;
}

.update-info {
  color: #6b7280;
  font-size: 0.9rem;
}

.share-buttons {
  display: flex;
  gap: 10px;
}

.share-btn {
  width: 36px;
  height: 36px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  border: none;
  background-color: #f3f4f6;
  color: #4b5563;
  cursor: pointer;
  transition: all 0.3s ease;
}

.share-btn:hover {
  background-color: #e5e7eb;
  transform: translateY(-2px);
}

.related-news {
  background-color: white;
  border-radius: 8px;
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.05);
  padding: 24px;
}

.related-news h2 {
  font-size: 1.5rem;
  margin-bottom: 16px;
  color: #1f2937;
}

.related-news-list {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.related-news-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 12px 0;
  border-bottom: 1px solid #f3f4f6;
}

.related-news-item:last-child {
  border-bottom: none;
}

.related-news-item a {
  color: #1f2937;
  text-decoration: none;
  font-weight: 500;
  transition: color 0.3s ease;
  flex: 1;
}

.related-news-item a:hover {
  color: #1e40af;
}

.related-date {
  color: #6b7280;
  font-size: 0.9rem;
}

@media (max-width: 768px) {
  .news-detail-container {
    padding: 20px 15px;
  }
  
  .news-content {
    padding: 20px;
  }
  
  .news-content h1 {
    font-size: 1.5rem;
  }
  
  .news-meta {
    flex-direction: column;
    gap: 10px;
  }
  
  .article-footer {
    flex-direction: column;
    gap: 15px;
    align-items: flex-start;
  }
  
  .related-news-item {
    flex-direction: column;
    align-items: flex-start;
    gap: 5px;
  }
}
</style> 