<template>
  <div class="modules-section">
    <h2 class="section-title">功能导航</h2>
    
    <!-- 第一行：高频使用功能 -->
    <div class="module-row">
      <router-link v-for="module in topModules" :key="module.title" :to="module.link" class="module-card">
        <div class="module-icon">{{ module.icon }}</div>
        <h3>{{ module.title }}</h3>
        <p>{{ module.description }}</p>
      </router-link>
    </div>
    
    <!-- 第二行：次高频使用功能 -->
    <div class="module-row">
      <router-link v-for="module in secondaryModules" :key="module.title" :to="module.link" class="module-card">
        <div class="module-icon">{{ module.icon }}</div>
        <h3>{{ module.title }}</h3>
        <p>{{ module.description }}</p>
      </router-link>
    </div>
  </div>
</template>

<script lang="ts">
import { defineComponent } from 'vue';
import type { PropType } from 'vue';
import type { Module } from '../../types/home';

export default defineComponent({
  name: 'ModulesSection',
  props: {
    topModules: {
      type: Array as PropType<Module[]>,
      default: () => [
        {
          icon: '📅',
          title: '活动预告',
          description: '查看近期即将举办的活动信息',
          link: '/activities'
        },
        {
          icon: '🚀',
          title: '会员申请',
          description: '提交入会申请，加入我们的大家庭',
          link: '/join'
        },
        {
          icon: '👥',
          title: '成员风采',
          description: '了解协会优秀成员的风采与成就',
          link: '/members'
        }
      ]
    },
    secondaryModules: {
      type: Array as PropType<Module[]>,
      default: () => [
        {
          icon: '📝',
          title: '技术博客',
          description: '阅读成员分享的技术文章和经验',
          link: '/blog'
        },
        {
          icon: '📚',
          title: '资料下载',
          description: '获取协会活动材料和学习资源',
          link: '/resources'
        },
        {
          icon: '🖼️',
          title: '活动相册',
          description: '浏览协会活动的精彩瞬间',
          link: '/gallery'
        }
      ]
    }
  }
});
</script>

<style scoped>
.modules-section {
  margin-bottom: 50px;
}

.section-title {
  color: #1e40af;
  font-size: 1.8rem;
  margin-bottom: 30px;
  text-align: center;
}

.module-row {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
  gap: 20px;
  margin-bottom: 20px;
}

.module-card {
  background-color: white;
  border-radius: 8px;
  padding: 25px;
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.05);
  transition: transform 0.3s ease, box-shadow 0.3s ease;
  text-decoration: none;
  display: flex;
  flex-direction: column;
  align-items: center;
  text-align: center;
}

.module-card:hover {
  transform: translateY(-5px);
  box-shadow: 0 10px 15px rgba(0, 0, 0, 0.1);
}

.module-icon {
  font-size: 2.5rem;
  margin-bottom: 15px;
}

.module-card h3 {
  color: #1e40af;
  margin-bottom: 10px;
  font-size: 1.2rem;
}

.module-card p {
  color: #6b7280;
  line-height: 1.5;
}

@media (max-width: 768px) {
  .module-row {
    grid-template-columns: 1fr;
  }
}
</style>