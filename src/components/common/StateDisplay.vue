<template>
  <div class="state-display">
    <!-- 加载状态 -->
    <div v-if="type === 'loading'" class="loading-state">
      <p>{{ message || '加载中...' }}</p>
    </div>
    
    <!-- 错误状态 -->
    <div v-else-if="type === 'error'" class="error-state">
      <p>{{ message }}</p>
      <button v-if="showRetry" @click="$emit('retry')" class="retry-btn">重试</button>
    </div>
    
    <!-- 空数据状态 -->
    <div v-else-if="type === 'empty'" class="empty-state">
      <p>{{ message || '暂无数据' }}</p>
    </div>
  </div>
</template>

<script lang="ts">
import { defineComponent } from 'vue';

export default defineComponent({
  name: 'StateDisplay',
  props: {
    type: {
      type: String,
      required: true,
      validator: (value: string) => ['loading', 'error', 'empty'].includes(value)
    },
    message: {
      type: String,
      default: ''
    },
    showRetry: {
      type: Boolean,
      default: true
    }
  },
  emits: ['retry']
});
</script>

<style scoped>
.loading-state,
.error-state,
.empty-state {
  text-align: center;
  padding: 60px 20px;
  background-color: #f9fafb;
  border-radius: 8px;
  margin-bottom: 30px;
}

.retry-btn {
  background-color: #1e40af;
  color: white;
  border: none;
  padding: 8px 16px;
  border-radius: 4px;
  margin-top: 15px;
  cursor: pointer;
}
</style>