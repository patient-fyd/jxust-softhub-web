<template>
  <div class="search-box">
    <input 
      type="text" 
      v-model="searchValue" 
      :placeholder="placeholder" 
      @keyup.enter="handleSearch"
    />
    <button @click="handleSearch" class="search-btn">
      搜索
    </button>
  </div>
</template>

<script lang="ts">
import { defineComponent, ref, watch } from 'vue';

export default defineComponent({
  name: 'SearchBox',
  props: {
    modelValue: {
      type: String,
      default: ''
    },
    placeholder: {
      type: String,
      default: '搜索...'
    }
  },
  emits: ['update:modelValue', 'search'],
  setup(props, { emit }) {
    const searchValue = ref(props.modelValue);
    
    // 监听props变化更新本地值
    watch(() => props.modelValue, (newValue) => {
      searchValue.value = newValue;
    });
    
    // 监听本地值变化更新父组件
    watch(searchValue, (newValue) => {
      emit('update:modelValue', newValue);
    });
    
    const handleSearch = () => {
      emit('search', searchValue.value);
    };
    
    return {
      searchValue,
      handleSearch
    };
  }
});
</script>

<style scoped>
.search-box {
  display: flex;
  max-width: 400px;
  width: 100%;
}

.search-box input {
  flex: 1;
  padding: 10px 15px;
  border: 1px solid #d1d5db;
  border-radius: 4px 0 0 4px;
  font-size: 1rem;
}

.search-btn {
  background-color: #1e40af;
  color: white;
  border: none;
  padding: 0 20px;
  border-radius: 0 4px 4px 0;
  cursor: pointer;
  transition: background-color 0.3s;
}

.search-btn:hover {
  background-color: #1e3a8a;
}
</style>