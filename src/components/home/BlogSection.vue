<template>
  <div class="blog-section">
    <div class="section-header">
      <h2>最新技术博客</h2>
      <router-link to="/news?category=技术分享&from=blog" class="view-all">查看全部</router-link>
    </div>
    <div v-if="loading" class="loading-blogs">
      <p>加载中...</p>
    </div>
    <div v-else-if="error" class="blog-error">
      <p>{{ error }}</p>
    </div>
    <div v-else-if="blogs.length === 0" class="no-blogs">
      <p>暂无技术博客</p>
    </div>
    <div v-else class="blog-cards">
      <div v-for="blog in blogs" :key="blog.newsId" class="blog-card">
        <div class="blog-image" :style="blog.coverImage ? `background-image: url(${blog.coverImage})` : ''"></div>
        <div class="blog-content">
          <div class="blog-date">{{ formatDate(blog.createTime) }}</div>
          <h3>{{ blog.title }}</h3>
          <p>{{ getExcerpt(blog.content) }}</p>
          <router-link :to="`/news/${blog.newsId}`" class="read-more">阅读更多</router-link>
        </div>
      </div>
    </div>
  </div>
</template>

<script lang="ts">
import { defineComponent, ref, onMounted } from 'vue';
import type { PropType } from 'vue';
import { newsService, type News } from '../../services/newsService';

export default defineComponent({
  name: 'BlogSection',
  props: {
    maxBlogs: {
      type: Number as PropType<number>,
      default: 3
    }
  },
  setup(props) {
    const blogs = ref<News[]>([]);
    const loading = ref(true);
    const error = ref('');
    
    // 获取最新技术博客
    const fetchLatestBlogs = async () => {
      loading.value = true;
      error.value = '';
      
      try {
        const response = await newsService.getBlogList({
          page: 1,
          pageSize: props.maxBlogs // 只获取指定数量的最新博客
        });
        
        if (response.code === 0) {
          blogs.value = response.data.list;
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
    
    // 格式化日期
    const formatDate = (dateStr: string) => {
      const date = new Date(dateStr);
      return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`;
    };
    
    // 获取内容摘要
    const getExcerpt = (content: string) => {
      // 移除Markdown标记
      const plainText = content.replace(/\*\*|\*|\[|\]|\(|\)|\#|\>|\`\`\`|\`/g, '');
      return plainText.length > 100 ? plainText.substring(0, 100) + '...' : plainText;
    };
    
    onMounted(() => {
      fetchLatestBlogs();
    });
    
    return {
      blogs,
      loading,
      error,
      formatDate,
      getExcerpt
    };
  }
});
</script>

<style scoped>
.blog-section {
  margin-bottom: 50px;
}

.section-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;
}

.section-header h2 {
  color: #1e40af;
  font-size: 1.8rem;
  margin: 0;
}

.view-all {
  color: #4b5563;
  text-decoration: none;
  font-weight: 500;
  transition: color 0.3s ease;
}

.view-all:hover {
  color: #1e40af;
}

.blog-cards {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(350px, 1fr));
  gap: 25px;
}

.blog-card {
  background-color: white;
  border-radius: 8px;
  overflow: hidden;
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.05);
  transition: transform 0.3s ease, box-shadow 0.3s ease;
  display: flex;
  flex-direction: column;
}

.blog-card:hover {
  transform: translateY(-5px);
  box-shadow: 0 10px 15px rgba(0, 0, 0, 0.1);
}

.blog-image {
  height: 180px;
  background-color: #e5e7eb;
  background-size: cover;
  background-position: center;
  background-repeat: no-repeat;
}

.blog-content {
  padding: 20px;
}

.blog-date {
  color: #6b7280;
  font-size: 0.9rem;
  margin-bottom: 10px;
}

.blog-card h3 {
  color: #1e40af;
  margin-bottom: 10px;
  font-size: 1.2rem;
  line-height: 1.4;
}

.blog-card p {
  color: #4b5563;
  margin-bottom: 15px;
  line-height: 1.5;
  display: -webkit-box;
  line-clamp: 3;
  -webkit-line-clamp: 3;
  -webkit-box-orient: vertical;
  overflow: hidden;
}

.loading-blogs, .blog-error, .no-blogs {
  text-align: center;
  padding: 40px;
  background-color: #f9fafb;
  border-radius: 8px;
  color: #6b7280;
}

@media (max-width: 768px) {
  .blog-cards {
    grid-template-columns: 1fr;
  }
}
</style>