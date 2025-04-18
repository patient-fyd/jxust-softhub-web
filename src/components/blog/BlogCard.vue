<template>
  <div class="blog-card">
    <div class="blog-image" :style="blog.coverImage ? `background-image: url(${blog.coverImage})` : ''"></div>
    <div class="blog-content">
      <div class="blog-meta">
        <span class="blog-date">{{ formatDate(blog.createTime) }}</span>
        <span class="blog-views">浏览: {{ blog.viewCount }}</span>
      </div>
      <h2 class="blog-title">{{ blog.title }}</h2>
      <p class="blog-excerpt">{{ getExcerpt(blog.content) }}</p>
      <div class="blog-footer">
        <router-link 
          v-if="blog.blogId"
          :to="`/blog/detail?blogId=${blog.blogId}`" 
          class="read-more-btn">阅读全文</router-link>
        <span v-else class="read-more-btn disabled">暂无详情</span>
        <span v-if="blog.authorName" class="blog-author">作者: {{ blog.authorName }}</span>
      </div>
    </div>
  </div>
</template>

<script lang="ts">
import { defineComponent } from 'vue';
import type { News } from '../../services/newsService';
import type { Blog } from '../../services/blogService';

export default defineComponent({
  name: 'BlogCard',
  props: {
    blog: {
      type: Object as () => Blog | News,
      required: true
    }
  },
  setup(props) {
    // 格式化日期
    const formatDate = (dateStr: string) => {
      if (!dateStr) return '';
      const date = new Date(dateStr);
      return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`;
    };
    
    // 获取内容摘要
    const getExcerpt = (content: string) => {
      if (!content) return '';
      // 移除Markdown标记
      const plainText = content.replace(/\*\*|\*|\[|\]|\(|\)|\#|\>|\`\`\`|\`/g, '');
      return plainText.length > 150 ? plainText.substring(0, 150) + '...' : plainText;
    };
    
    return {
      formatDate,
      getExcerpt
    };
  }
});
</script>

<style scoped>
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

.read-more-btn.disabled {
  background-color: #93c5fd;
  cursor: not-allowed;
}

.blog-author {
  color: #6b7280;
  font-size: 0.9rem;
}
</style>