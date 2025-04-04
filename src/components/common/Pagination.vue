<template>
  <div class="pagination">
    <button 
      :disabled="currentPage <= 1" 
      @click="changePage(currentPage - 1)" 
      class="page-btn"
    >
      上一页
    </button>
    <span class="page-info">{{ currentPage }} / {{ totalPages }}</span>
    <button 
      :disabled="currentPage >= totalPages" 
      @click="changePage(currentPage + 1)" 
      class="page-btn"
    >
      下一页
    </button>
  </div>
</template>

<script lang="ts">
import { defineComponent } from 'vue';

export default defineComponent({
  name: 'Pagination',
  props: {
    currentPage: {
      type: Number,
      required: true
    },
    totalPages: {
      type: Number,
      required: true
    }
  },
  emits: ['page-change'],
  setup(props, { emit }) {
    const changePage = (page: number) => {
      if (page < 1 || page > props.totalPages) return;
      emit('page-change', page);
    };
    
    return {
      changePage
    };
  }
});
</script>

<style scoped>
.pagination {
  display: flex;
  justify-content: center;
  align-items: center;
  gap: 15px;
  margin-top: 20px;
}

.page-btn {
  background-color: #1e40af;
  color: white;
  border: none;
  padding: 8px 16px;
  border-radius: 4px;
  cursor: pointer;
  transition: background-color 0.3s;
}

.page-btn:disabled {
  background-color: #9ca3af;
  cursor: not-allowed;
}

.page-info {
  color: #4b5563;
}
</style>