<template>
  <div class="members-container">
    <h1 class="page-title">成员展示</h1>
    <p class="page-subtitle">认识我们的团队成员</p>
    
    <div class="members-content">
      <p>成员展示页面正在建设中...</p>
    </div>
  </div>
</template>

<script lang="ts">
import { defineComponent } from 'vue';

export default defineComponent({
  name: 'MembersView',
});
</script>

<style scoped>
.members-container {
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

.members-content {
  background-color: #f9fafb;
  padding: 50px;
  border-radius: 8px;
  color: #4b5563;
}
</style> 