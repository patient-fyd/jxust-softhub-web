<template>
  <div class="sort-selector">
    <select v-model="sortValue" @change="handleChange">
      <option v-for="option in options" :key="option.value" :value="option.value">
        {{ option.label }}
      </option>
    </select>
  </div>
</template>

<script lang="ts">
import { defineComponent, ref, watch } from 'vue';

interface SortOption {
  value: string;
  label: string;
}

export default defineComponent({
  name: 'SortSelector',
  props: {
    modelValue: {
      type: String,
      required: true
    },
    options: {
      type: Array as () => SortOption[],
      required: true
    }
  },
  emits: ['update:modelValue', 'change'],
  setup(props, { emit }) {
    const sortValue = ref(props.modelValue);
    
    // 监听props变化更新本地值
    watch(() => props.modelValue, (newValue) => {
      sortValue.value = newValue;
    });
    
    // 监听本地值变化更新父组件
    watch(sortValue, (newValue) => {
      emit('update:modelValue', newValue);
    });
    
    const handleChange = () => {
      emit('change', sortValue.value);
    };
    
    return {
      sortValue,
      handleChange
    };
  }
});
</script>

<style scoped>
.sort-selector select {
  padding: 10px 15px;
  border: 1px solid #d1d5db;
  border-radius: 4px;
  background-color: white;
  font-size: 1rem;
  cursor: pointer;
}
</style>