<template>
  <div class="pagination-container">
    <div class="pagination">
      <div class="pagination-info">
        共 <span class="pagination-total">{{ total }}</span> 条
      </div>
      
      <div class="pagination-size" v-if="showSizeChanger">
        <select v-model="innerPageSize" @change="handleSizeChange" class="pagination-select">
          <option v-for="size in pageSizes" :key="size" :value="size">{{ size }}条/页</option>
        </select>
      </div>
      
      <div class="pagination-buttons">
        <button 
          class="pagination-button" 
          :disabled="currentPage === 1"
          @click="handleCurrentChange(currentPage - 1)"
        >
          上一页
        </button>
        
        <button 
          v-for="page in displayedPages" 
          :key="page"
          class="pagination-button" 
          :class="{ 'active': currentPage === page }"
          @click="typeof page === 'number' ? handleCurrentChange(page) : null"
        >
          {{ page }}
        </button>
        
        <button 
          class="pagination-button" 
          :disabled="currentPage === totalPages"
          @click="handleCurrentChange(currentPage + 1)"
        >
          下一页
        </button>
      </div>
      
      <div class="pagination-jumper" v-if="showQuickJumper">
        前往
        <input 
          type="number" 
          class="pagination-jumper-input" 
          v-model="jumpPage" 
          min="1"
          :max="totalPages"
        >
        页
        <button class="pagination-jumper-button" @click="jumpToPage">GO</button>
      </div>
    </div>
  </div>
</template>

<script lang="ts">
import { defineComponent, ref, computed, watch } from 'vue';

export default defineComponent({
  name: 'Pagination',
  
  props: {
    total: {
      type: Number,
      required: true,
      default: 0
    },
    pageSize: {
      type: Number,
      default: 12
    },
    currentPage: {
      type: Number,
      default: 1
    },
    pageSizes: {
      type: Array,
      default: () => [12, 24, 36, 48]
    },
    showSizeChanger: {
      type: Boolean,
      default: true
    },
    showQuickJumper: {
      type: Boolean,
      default: true
    }
  },
  
  emits: ['update:currentPage', 'update:pageSize', 'change', 'sizeChange'],
  
  setup(props, { emit }) {
    // 内部分页数据，用于同步外部传入的值
    const innerPageSize = ref(props.pageSize);
    const jumpPage = ref<number | null>(null);
    
    // 监听pageSize属性变化
    watch(() => props.pageSize, (newVal) => {
      innerPageSize.value = newVal;
    });
    
    // 计算总页数
    const totalPages = computed(() => {
      return Math.ceil(props.total / innerPageSize.value);
    });
    
    // 计算显示的页码
    const displayedPages = computed(() => {
      const current = props.currentPage;
      const total = totalPages.value;
      
      if (total <= 7) {
        return Array.from({ length: total }, (_, i) => i + 1);
      }
      
      if (current <= 3) {
        return [1, 2, 3, 4, 5, '...', total];
      }
      
      if (current >= total - 2) {
        return [1, '...', total - 4, total - 3, total - 2, total - 1, total];
      }
      
      return [1, '...', current - 1, current, current + 1, '...', total];
    });
    
    // 处理页码切换
    const handleCurrentChange = (page: number) => {
      if (page >= 1 && page <= totalPages.value) {
        emit('update:currentPage', page);
        emit('change', page, innerPageSize.value);
      }
    };
    
    // 处理每页条数变化
    const handleSizeChange = () => {
      emit('update:pageSize', innerPageSize.value);
      emit('sizeChange', innerPageSize.value);
      // 切换页码大小后，可能需要调整当前页码
      const maxPage = Math.ceil(props.total / innerPageSize.value);
      if (props.currentPage > maxPage) {
        handleCurrentChange(maxPage || 1);
      } else {
        emit('change', props.currentPage, innerPageSize.value);
      }
    };
    
    // 跳转到指定页
    const jumpToPage = () => {
      if (jumpPage.value !== null && jumpPage.value > 0 && jumpPage.value <= totalPages.value) {
        handleCurrentChange(jumpPage.value);
        jumpPage.value = null; // 跳转后清空输入
      }
    };
    
    return {
      innerPageSize,
      jumpPage,
      totalPages,
      displayedPages,
      handleCurrentChange,
      handleSizeChange,
      jumpToPage
    };
  }
});
</script>

<style scoped>
.pagination-container {
  display: flex;
  justify-content: center;
  margin-top: 32px;
}

.pagination {
  display: flex;
  align-items: center;
  flex-wrap: wrap;
  gap: 16px;
}

.pagination-info {
  font-size: 14px;
  color: #606266;
}

.pagination-total {
  font-weight: bold;
  color: #409eff;
}

.pagination-size {
  display: flex;
  align-items: center;
}

.pagination-select {
  height: 32px;
  padding: 0 8px;
  border: 1px solid #dcdfe6;
  border-radius: 4px;
  outline: none;
  color: #606266;
  cursor: pointer;
}

.pagination-buttons {
  display: flex;
  align-items: center;
  gap: 8px;
}

.pagination-button {
  min-width: 32px;
  height: 32px;
  padding: 0 4px;
  text-align: center;
  border: 1px solid #dcdfe6;
  border-radius: 4px;
  background-color: #fff;
  color: #606266;
  cursor: pointer;
  transition: all 0.2s;
}

.pagination-button:hover:not(:disabled):not(.active) {
  color: #409eff;
  border-color: #c6e2ff;
}

.pagination-button.active {
  color: #fff;
  background-color: #409eff;
  border-color: #409eff;
}

.pagination-button:disabled {
  color: #c0c4cc;
  cursor: not-allowed;
}

.pagination-jumper {
  display: flex;
  align-items: center;
  font-size: 14px;
  color: #606266;
}

.pagination-jumper-input {
  width: 50px;
  height: 32px;
  margin: 0 6px;
  text-align: center;
  border: 1px solid #dcdfe6;
  border-radius: 4px;
  outline: none;
}

.pagination-jumper-button {
  height: 32px;
  margin-left: 6px;
  padding: 0 10px;
  border: 1px solid #dcdfe6;
  border-radius: 4px;
  background-color: #f4f4f5;
  color: #606266;
  cursor: pointer;
}

.pagination-jumper-button:hover {
  color: #409eff;
  border-color: #c6e2ff;
}

@media (max-width: 768px) {
  .pagination {
    flex-direction: column;
    align-items: flex-start;
  }

  .pagination-buttons {
    flex-wrap: wrap;
  }
}
</style>