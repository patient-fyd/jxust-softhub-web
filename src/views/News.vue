<template>
  <div class="news-container">
    <h1 class="page-title">新闻动态</h1>
    <p class="page-subtitle">了解我们最新的动态</p>
    
    <div class="news-content">
      <p>新闻页面正在建设中...</p>
    </div>
  </div>
</template>

<script lang="ts">
import { defineComponent } from 'vue';

export default defineComponent({
  name: 'NewsView',
});
</script>

<style scoped>
.news-container {
  padding: 30px;
  max-width: 1000px;
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
  margin-bottom: 40px;
}

.news-content {
  background-color: #f9fafb;
  padding: 50px;
  border-radius: 8px;
  color: #4b5563;
}
</style>