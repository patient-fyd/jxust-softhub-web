<template>
  <div class="announcement-section">
    <div class="section-header">
      <h2>最新公告与通知</h2>
      <router-link to="/news" class="view-all">查看全部</router-link>
    </div>
    <div class="announcement-cards">
      <div class="announcement-card" v-for="(announcement, index) in announcements" :key="index">
        <div class="card-date">{{ announcement.date }}</div>
        <h3>{{ announcement.title }}</h3>
        <p>{{ announcement.content }}</p>
        <router-link :to="announcement.link" class="read-more">阅读更多</router-link>
      </div>
    </div>
  </div>
</template>

<script lang="ts">
import { defineComponent } from 'vue';
import type { PropType } from 'vue';
import type { Announcement } from '../../types/home';

export default defineComponent({
  name: 'AnnouncementSection',
  props: {
    announcements: {
      type: Array as PropType<Announcement[]>,
      default: () => [
        {
          date: '2023-12-15',
          title: '2024年春季招新开始啦！',
          content: '欢迎各位对软件开发感兴趣的同学加入我们的大家庭...',
          link: '/news/1'
        },
        {
          date: '2023-12-10',
          title: 'Web前端技术分享会',
          content: '本周六下午2点，我们将在教学楼B401举办Web前端技术分享会...',
          link: '/news/2'
        },
        {
          date: '2023-12-05',
          title: '协会年度总结大会',
          content: '2023年即将结束，我们将举办年度总结大会，回顾这一年的收获...',
          link: '/news/3'
        }
      ]
    }
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
}

.announcement-card:hover {
  transform: translateY(-5px);
  box-shadow: 0 10px 15px rgba(0, 0, 0, 0.1);
}

.card-date {
  color: #6b7280;
  font-size: 0.9rem;
  margin-bottom: 10px;
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
}

.read-more {
  color: #1e40af;
  text-decoration: none;
  font-weight: 500;
  font-size: 0.9rem;
  display: inline-block;
  transition: color 0.3s ease;
}

.read-more:hover {
  color: #3b82f6;
}

@media (max-width: 768px) {
  .announcement-cards {
    grid-template-columns: 1fr;
  }
}
</style>