<template>
  <div class="activities-container">
    <h1 class="page-title">活动展示</h1>
    <p class="page-subtitle">了解我们最新的活动信息</p>
    
    <div class="activities-content">
      <p>活动页面内容正在建设中...</p>
    </div>
  </div>
</template>

<script lang="ts">
import { defineComponent } from 'vue';

export default defineComponent({
  name: 'ActivitiesView',
});
</script>

<style scoped>
.activities-container {
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

.activities-content {
  background-color: #f9fafb;
  padding: 50px;
  border-radius: 8px;
  color: #4b5563;
}
</style> 