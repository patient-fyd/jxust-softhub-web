<template>
  <div class="announcement-section">
    <div class="section-header">
      <h2>最新公告与通知</h2>
      <router-link to="/news?newsType=1" class="view-all">查看全部</router-link>
    </div>
    
    <div v-if="loading" class="loading-state">
      <p>加载中...</p>
    </div>
    <div v-else-if="error" class="error-state">
      <p>{{ error }}</p>
    </div>
    <div v-else-if="announcements.length === 0" class="empty-state">
      <p>暂无公告</p>
    </div>
    <div v-else class="announcement-cards">
      <div class="announcement-card" v-for="announcement in announcements" :key="announcement.id">
        <div class="announcement-type" :class="getTypeClass(announcement)">
          {{ getCategoryLabel(announcement.category) }}
        </div>
        <div class="card-date">{{ formatDate(announcement.createdAt || announcement.createTime) }}</div>
        <h3>{{ announcement.title }}</h3>
        <p>{{ getExcerpt(announcement.content) }}</p>
        <div class="card-footer">
          <router-link :to="`/news/detail?newsId=${announcement.id}`" class="read-more">阅读更多</router-link>
          <span class="views-count">浏览: {{ announcement.viewCount }}</span>
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
  name: 'AnnouncementSection',
  props: {
    maxAnnouncements: {
      type: Number as PropType<number>,
      default: 3
    }
  },
  setup(props) {
    const announcements = ref<News[]>([]);
    const loading = ref(true);
    const error = ref('');
    
    // 获取最新公告
    const fetchAnnouncements = async () => {
      loading.value = true;
      error.value = '';
      
      try {
        const response = await newsService.getNotificationList({
          page: 1,
          pageSize: props.maxAnnouncements
        });
        
        if (response.code === 0) {
          announcements.value = response.data.list;
        } else {
          error.value = response.msg || '获取公告列表失败';
        }
      } catch (err) {
        console.error('获取公告列表出错:', err);
        error.value = '获取公告列表时发生错误';
      } finally {
        loading.value = false;
      }
    };
    
    // 格式化日期
    const formatDate = (dateStr?: string) => {
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
    
    // 获取类别标签
    const getCategoryLabel = (category: string) => {
      switch (category) {
        case '协会公告':
          return '公告';
        case '活动通知':
          return '活动';
        default:
          return category;
      }
    };
    
    // 获取类别样式
    const getTypeClass = (announcement: News) => {
      if (announcement.category === '协会公告') {
        return 'type-announcement';
      } else if (announcement.category === '活动通知') {
        return 'type-activity';
      }
      return '';
    };
    
    onMounted(() => {
      fetchAnnouncements();
    });
    
    return {
      announcements,
      loading,
      error,
      formatDate,
      getExcerpt,
      getCategoryLabel,
      getTypeClass
    };
  }
});
</script>

<style scoped>
.announcement-section {
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

.loading-state, .error-state, .empty-state {
  text-align: center;
  padding: 40px;
  background-color: #f9fafb;
  border-radius: 8px;
  color: #6b7280;
}

.announcement-cards {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
  gap: 20px;
}

.announcement-card {
  background-color: white;
  border-radius: 8px;
  padding: 20px;
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.05);
  transition: transform 0.3s ease, box-shadow 0.3s ease;
  position: relative;
  display: flex;
  flex-direction: column;
  overflow: hidden;
}

.announcement-card:hover {
  transform: translateY(-5px);
  box-shadow: 0 10px 15px rgba(0, 0, 0, 0.1);
}

.announcement-type {
  position: absolute;
  top: 10px;
  right: 10px;
  padding: 3px 8px;
  border-radius: 4px;
  font-size: 12px;
  font-weight: 500;
  color: white;
}

.type-announcement {
  background-color: #1e40af; /* 蓝色 */
}

.type-activity {
  background-color: #047857; /* 绿色 */
}

.card-date {
  color: #6b7280;
  font-size: 0.9rem;
  margin-bottom: 10px;
  margin-top: 5px;
}

.announcement-card h3 {
  color: #1e40af;
  margin-bottom: 10px;
  font-size: 1.2rem;
}

.announcement-card p {
  color: #4b5563;
  margin-bottom: 15px;
  line-height: 1.5;
  flex: 1;
}

.card-footer {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-top: auto;
}

.read-more {
  color: #1e40af;
  text-decoration: none;
  font-weight: 500;
  transition: background-color 0.3s ease;
  padding: 5px 10px;
  background-color: #e0e7ff;
  border-radius: 4px;
  font-size: 0.9rem;
}

.read-more:hover {
  background-color: #c7d2fe;
}

.views-count {
  color: #6b7280;
  font-size: 0.85rem;
}

@media (max-width: 768px) {
  .announcement-cards {
    grid-template-columns: 1fr;
  }
}
</style>