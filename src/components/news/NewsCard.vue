<template>
  <div class="news-card" @click="handleCardClick">
    <div class="card-cover">
      <img :src="coverUrl" :alt="news.title" class="cover-img" />
      <div class="card-status" :class="statusClass">{{ news.category }}</div>
    </div>
    <div class="card-content">
      <h3 class="card-title" :title="news.title">{{ news.title }}</h3>
      <p class="card-description" :title="news.summary">
        {{ shortSummary }}
      </p>
      <div class="card-meta">
        <div class="meta-item">
          <Icon icon="mdi:calendar" class="meta-icon" />
          <span>{{ formatDate(news.publishDate) }}</span>
        </div>
        <div class="meta-item">
          <Icon icon="mdi:account" class="meta-icon" />
          <span>{{ news.author }}</span>
        </div>
      </div>
      <div class="card-footer">
        <div class="meta-item">
          <Icon icon="mdi:eye" class="meta-icon" />
          <span>{{ news.viewCount }}</span>
        </div>
        <div class="card-actions">
          <button class="btn btn-icon" @click.stop="handleView">
            <Icon icon="mdi:eye-outline" />
          </button>
          <button class="btn btn-primary" @click.stop="handleReadMore">
            阅读全文
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script lang="ts">
import { defineComponent, computed } from 'vue';
import type { PropType } from 'vue';
import { Icon } from '@iconify/vue';

// 新闻类型定义
export interface News {
  id: number;
  title: string;
  summary?: string;
  content: string;
  author?: string;
  publishDate?: string;
  coverUrl?: string;
  coverImage?: string;
  category: string;
  newsType: number;
  tags?: string[];
  viewCount: number;
  isTop?: number | boolean;
  status?: number;
  createdAt?: string;
  updatedAt?: string;
  createTime?: string;
  updateTime?: string;
  authorName?: string;
  isHot?: boolean;
  severity?: string;
}

export default defineComponent({
  name: 'NewsCard',
  
  components: {
    Icon
  },
  
  props: {
    news: {
      type: Object as PropType<News>,
      required: true
    }
  },
  
  emits: ['view', 'readMore'],
  
  setup(props, { emit }) {
    // 摘要截取
    const shortSummary = computed(() => {
      if (!props.news.summary) {
        // 如果没有摘要，则从内容中提取
        if (!props.news.content) {
          return '暂无内容';
        }
        const plainText = props.news.content.replace(/<[^>]+>/g, '').substring(0, 100);
        return plainText + '...';
      }
      if (props.news.summary.length > 100) {
        return props.news.summary.substring(0, 100) + '...';
      }
      return props.news.summary;
    });
    
    // 获取状态样式类
    const statusClass = computed(() => {
      const category = props.news.category.toLowerCase();
      if (category === '协会公告') {
        return 'status-announcement';
      } else if (category === '活动通知') {
        return 'status-notification';
      } else if (category === '技术分享') {
        return 'status-tech';
      } else {
        return 'status-other';
      }
    });
    
    // 格式化日期
    const formatDate = (dateString?: string) => {
      if (!dateString) return '未知时间';
      const date = new Date(dateString);
      return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`;
    };
    
    // 获取封面URL
    const coverUrl = computed(() => {
      if (props.news.coverUrl) {
        return props.news.coverUrl;
      }
      
      if (props.news.coverImage) {
        return props.news.coverImage;
      }
      
      // 默认图片
      return `https://picsum.photos/id/${props.news.id + 200}/400/200`;
    });
    
    // 卡片点击
    const handleCardClick = () => {
      handleView();
    };
    
    // 查看详情
    const handleView = () => {
      emit('view', props.news);
    };
    
    // 阅读全文
    const handleReadMore = () => {
      emit('readMore', props.news);
    };
    
    return {
      shortSummary,
      statusClass,
      formatDate,
      coverUrl,
      handleCardClick,
      handleView,
      handleReadMore
    };
  }
});
</script>

<style scoped>
.news-card {
  background-color: #fff;
  border-radius: 8px;
  box-shadow: 0 2px 12px rgba(0, 0, 0, 0.1);
  overflow: hidden;
  transition: transform 0.3s, box-shadow 0.3s;
  cursor: pointer;
  height: 100%;
  display: flex;
  flex-direction: column;
}

.news-card:hover {
  transform: translateY(-5px);
  box-shadow: 0 5px 15px rgba(0, 0, 0, 0.15);
}

.card-cover {
  height: 180px;
  overflow: hidden;
  position: relative;
}

.cover-img {
  width: 100%;
  height: 100%;
  object-fit: cover;
  transition: transform 0.3s;
}

.news-card:hover .cover-img {
  transform: scale(1.05);
}

.card-status {
  position: absolute;
  top: 10px;
  right: 10px;
  padding: 4px 8px;
  border-radius: 4px;
  font-size: 12px;
  font-weight: 500;
  color: white;
}

.status-announcement {
  background-color: #1e40af;
}

.status-notification {
  background-color: #10b981;
}

.status-tech {
  background-color: #f59e0b;
}

.status-other {
  background-color: #6b7280;
}

.card-content {
  padding: 16px;
  display: flex;
  flex-direction: column;
  flex-grow: 1;
  min-height: 180px;
}

.card-title {
  font-size: 16px;
  font-weight: 500;
  margin: 0 0 8px;
  color: #303133;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.card-description {
  color: #606266;
  font-size: 13px;
  line-height: 1.5;
  margin: 0 0 12px;
  height: 60px;
  overflow: hidden;
  display: -webkit-box;
  -webkit-line-clamp: 3;
  -webkit-box-orient: vertical;
}

.card-meta {
  display: flex;
  justify-content: space-between;
  margin-bottom: 10px;
  gap: 8px;
}

.meta-item {
  display: flex;
  align-items: center;
  color: #909399;
  font-size: 12px;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.meta-icon {
  margin-right: 4px;
  font-size: 14px;
  vertical-align: middle;
}

.card-footer {
  margin-top: auto;
  display: flex;
  justify-content: space-between;
  align-items: center;
  border-top: 1px solid #f0f0f0;
  padding-top: 10px;
}

.card-actions {
  display: flex;
  gap: 6px;
  align-items: center;
}

.btn {
  display: inline-block;
  line-height: 1;
  cursor: pointer;
  background: #fff;
  border: 1px solid #dcdfe6;
  color: #606266;
  text-align: center;
  box-sizing: border-box;
  outline: none;
  margin: 0;
  transition: .1s;
  font-weight: 500;
  padding: 6px 10px;
  font-size: 12px;
  border-radius: 4px;
}

.btn-icon {
  background: none;
  border: none;
  color: #909399;
  cursor: pointer;
  padding: 4px;
  border-radius: 4px;
  transition: all 0.3s;
}

.btn-icon:hover {
  color: #409eff;
  background-color: #f0f7ff;
}

.btn-primary {
  color: #fff;
  background-color: #1e40af;
  border-color: #1e40af;
}

.btn-primary:hover {
  background-color: #1e3a8a;
  border-color: #1e3a8a;
}
</style> 