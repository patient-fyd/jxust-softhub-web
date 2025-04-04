<template>
  <div class="join-container">
    <h1 class="page-title">加入我们</h1>
    <p class="page-subtitle">成为软件协会的一员，开启你的技术之旅</p>
    
    <div class="join-content">
      <p>加入页面正在建设中...</p>
    </div>
  </div>
</template>

<script lang="ts">
import { defineComponent } from 'vue';

export default defineComponent({
  name: 'JoinView',
});
</script>

<style scoped>
.join-container {
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

.join-content {
  background-color: #f9fafb;
  padding: 50px;
  border-radius: 8px;
  color: #4b5563;
}
</style> 