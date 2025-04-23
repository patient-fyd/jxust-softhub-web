<template>
  <div class="under-construction">
    <div class="construction-content">
      <div class="construction-icon">🚧</div>
      <h1 class="construction-title">{{ pageName }}功能建设中</h1>
      <p class="construction-description">{{ description || '这个功能正在开发中，敬请期待！' }}</p>
      <router-link to="/" class="back-button">返回首页</router-link>
    </div>
  </div>
</template>

<script lang="ts">
import { defineComponent } from 'vue';

export default defineComponent({
  name: 'PageUnderConstruction',
  props: {
    pageName: {
      type: String,
      required: true
    },
    description: {
      type: String,
      default: ''
    }
  }
});
</script>

<style scoped>
.under-construction {
  min-height: 70vh;
  display: flex;
  justify-content: center;
  align-items: center;
  padding: 40px 20px;
}

.construction-content {
  text-align: center;
  max-width: 600px;
  background-color: white;
  border-radius: 8px;
  padding: 40px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
}

.construction-icon {
  font-size: 80px;
  margin-bottom: 20px;
}

.construction-title {
  color: #1e40af;
  font-size: 2rem;
  margin-bottom: 20px;
}

.construction-description {
  color: #6b7280;
  font-size: 1.1rem;
  margin-bottom: 30px;
  line-height: 1.6;
}

.back-button {
  display: inline-block;
  background-color: #1e40af;
  color: white;
  padding: 12px 25px;
  border-radius: 6px;
  text-decoration: none;
  font-weight: 500;
  transition: background-color 0.3s;
}

.back-button:hover {
  background-color: #1e3a8a;
}
</style> 