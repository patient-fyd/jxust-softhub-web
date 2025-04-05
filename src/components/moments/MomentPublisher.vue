<template>
  <div class="moment-publisher">
    <div class="publisher-header">
      <h3>发布动态</h3>
    </div>
    
    <div class="publisher-body">
      <textarea 
        v-model="content" 
        placeholder="分享你的想法..." 
        :rows="3"
        class="content-input"
      ></textarea>
      
      <div class="publisher-actions">
        <button 
          class="btn-primary"
          @click="publishMoment"
          :disabled="isSubmitting || !content.trim()"
        >
          {{ isSubmitting ? '发布中...' : '发布' }}
        </button>
        <button class="btn-secondary" @click="cancelPublish">取消</button>
      </div>
    </div>
  </div>
</template>

<script lang="ts">
import { defineComponent, ref } from 'vue';
import { createMoment } from '../../services/momentService';

export default defineComponent({
  name: 'MomentPublisher',
  emits: ['moment-published'],
  setup(props, { emit }) {
    const content = ref('');
    const isSubmitting = ref(false);
    
    const publishMoment = async () => {
      if (!content.value.trim() || isSubmitting.value) return;
      
      isSubmitting.value = true;
      
      try {
        const response = await createMoment({
          content: content.value.trim()
        });
        
        if (response.code === 0) {
          // 清空内容
          content.value = '';
          // 通知父组件刷新动态列表
          emit('moment-published');
        } else {
          alert(`发布失败：${response.msg || '未知错误'}`);
        }
      } catch (error) {
        console.error('发布动态失败:', error);
        alert('发布失败，请稍后重试');
      } finally {
        isSubmitting.value = false;
      }
    };
    
    const cancelPublish = () => {
      content.value = '';
    };
    
    return {
      content,
      isSubmitting,
      publishMoment,
      cancelPublish
    };
  }
});
</script>

<style scoped>
.moment-publisher {
  background-color: white;
  border-radius: 8px;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.05);
  padding: 20px;
}

.publisher-header {
  margin-bottom: 15px;
}

.publisher-header h3 {
  color: #1e40af;
  margin: 0;
  font-size: 1.2rem;
}

.content-input {
  width: 100%;
  padding: 15px;
  border: 1px solid #e5e7eb;
  border-radius: 6px;
  resize: vertical;
  font-size: 1rem;
  font-family: inherit;
  transition: border-color 0.3s;
}

.content-input:focus {
  outline: none;
  border-color: #3b82f6;
  box-shadow: 0 0 0 2px rgba(59, 130, 246, 0.25);
}

.publisher-actions {
  display: flex;
  justify-content: flex-end;
  gap: 10px;
  margin-top: 15px;
}

.btn-primary, .btn-secondary {
  padding: 10px 20px;
  border-radius: 6px;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.3s;
  border: none;
}

.btn-primary {
  background-color: #1e40af;
  color: white;
}

.btn-primary:hover:not(:disabled) {
  background-color: #1e3a8a;
}

.btn-primary:disabled {
  background-color: #93c5fd;
  cursor: not-allowed;
}

.btn-secondary {
  background-color: #e5e7eb;
  color: #4b5563;
}

.btn-secondary:hover {
  background-color: #d1d5db;
}
</style>