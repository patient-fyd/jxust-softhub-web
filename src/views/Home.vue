<template>
  <div class="home-container">
    <!-- 英雄区域 -->
    <hero-section />
    
    <!-- 公告与通知区域 -->
    <announcement-section />
    
    <!-- 技术博客区域 -->
    <blog-section :max-blogs="3" />
    
    <!-- 功能模块区域 -->
    <modules-section />
    
    <!-- 协会简介区域 -->
    <about-section />
    
    <!-- 互动交流区域 -->
    <interaction-section />
  </div>
</template>

<script lang="ts">
import { defineComponent } from 'vue';

// 导入组件
import HeroSection from '../components/home/HeroSection.vue';
import AnnouncementSection from '../components/home/AnnouncementSection.vue';
import BlogSection from '../components/home/BlogSection.vue';
import ModulesSection from '../components/home/ModulesSection.vue';
import AboutSection from '../components/home/AboutSection.vue';
import InteractionSection from '../components/home/InteractionSection.vue';

export default defineComponent({
  name: 'HomeView',
  components: {
    HeroSection,
    AnnouncementSection,
    BlogSection,
    ModulesSection,
    AboutSection,
    InteractionSection
  }
});
</script>

<style scoped>
.home-container {
  padding: 20px;
  max-width: 1200px;
  margin: 0 auto;
}
</style>