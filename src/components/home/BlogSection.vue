<template>
  <div class="blog-section">
    <div class="section-header">
      <h2>最新技术博客</h2>
      <router-link to="/blog" class="view-all">查看全部</router-link>
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
      <div v-for="blog in blogs" :key="blog.blogId || blog.id" class="blog-card">
        <div class="blog-image" :style="blog.coverImage ? `background-image: url(${blog.coverImage})` : ''">
          <div class="blog-type-tag">技术分享</div>
        </div>
        <div class="blog-content">
          <div class="blog-meta">
            <span class="blog-date">{{ formatDate(blog.createTime || blog.createdAt) }}</span>
            <span class="blog-views">浏览: {{ blog.viewCount }}</span>
          </div>
          <h3>{{ blog.title }}</h3>
          <p>{{ getExcerpt(blog.content) }}</p>
          <div class="blog-footer">
            <button 
              v-if="blog.blogId" 
              @click="navigateToBlogDetail(blog.blogId)"
              class="read-more">阅读更多</button>
            <span v-else class="read-more disabled">暂无详情</span>
            <span v-if="blog.authorName" class="blog-author">{{ blog.authorName }}</span>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script lang="ts">
import { defineComponent, ref, onMounted } from 'vue';
import type { PropType } from 'vue';
import { blogService, type Blog } from '../../services/blogService';
import { useRouter } from 'vue-router';

export default defineComponent({
  name: 'BlogSection',
  props: {
    maxBlogs: {
      type: Number as PropType<number>,
      default: 3
    }
  },
  setup(props) {
    const blogs = ref<Blog[]>([]);
    const loading = ref(true);
    const error = ref('');
    const router = useRouter();
    
    // 获取最新技术博客 - 只使用博客API
    const fetchLatestBlogs = async () => {
      loading.value = true;
      error.value = '';
      
      try {
        // 使用专用博客API
        const blogResponse = await blogService.getBlogList({
          page: 1,
          size: props.maxBlogs,
          status: 1 // 只获取已发布的
        });
        
        if (blogResponse.code === 0) {
          // 确保所有博客都有blogId字段
          const blogList = blogResponse.data.list || [];
          blogList.forEach(blog => {
            if (!blog.blogId && blog.id) {
              console.log(`处理博客数据: 将id(${blog.id})复制到blogId字段`);
              blog.blogId = blog.id;
            }
          });
          
          blogs.value = blogList;
        } else {
          error.value = '获取博客列表失败';
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
      if (!dateStr) return '';
      const date = new Date(dateStr);
      return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`;
    };
    
    // 获取内容摘要
    const getExcerpt = (content: string) => {
      if (!content) return '';
      // 移除HTML标签和Markdown标记
      const plainText = content.replace(/<[^>]+>/g, '').replace(/\*\*|\*|\[|\]|\(|\)|\#|\>|\`\`\`|\`/g, '');
      return plainText.length > 100 ? plainText.substring(0, 100) + '...' : plainText;
    };
    
    // 导航到博客详情页
    const navigateToBlogDetail = (blogId: number | string) => {
      console.log('导航到博客详情页:', blogId);
      router.push({
        path: '/blog/detail',
        query: { blogId: blogId.toString() }
      });
    };
    
    onMounted(() => {
      fetchLatestBlogs();
    });
    
    return {
      blogs,
      loading,
      error,
      formatDate,
      getExcerpt,
      navigateToBlogDetail
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
  position: relative;
}

.blog-type-tag {
  position: absolute;
  top: 10px;
  right: 10px;
  background-color: #10b981;
  color: white;
  padding: 4px 8px;
  border-radius: 4px;
  font-size: 12px;
  font-weight: 500;
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
  margin-bottom: 10px;
}

.blog-date, .blog-views {
  color: #6b7280;
  font-size: 0.9rem;
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
  flex: 1;
}

.blog-footer {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-top: auto;
}

.read-more {
  color: #1e40af;
  text-decoration: none;
  font-weight: 500;
  transition: color 0.3s ease;
  padding: 5px 10px;
  background-color: #e0e7ff;
  border-radius: 4px;
}

.read-more:hover {
  background-color: #c7d2fe;
}

.read-more.disabled {
  background-color: #e0e0e0;
  color: #909090;
  cursor: not-allowed;
}

.blog-author {
  color: #6b7280;
  font-size: 0.9rem;
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