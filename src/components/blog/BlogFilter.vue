<template>
  <div class="blog-filter">
    <search-box 
      v-model="searchKeyword" 
      :placeholder="searchPlaceholder"
      @search="$emit('search', searchKeyword)"
    />
    
    <sort-selector
      v-model="sortOption"
      :options="sortOptions"
      @change="$emit('sort-change', sortOption)"
    />
  </div>
</template>

<script lang="ts">
import { defineComponent, ref, watch } from 'vue';
import SearchBox from '../common/SearchBox.vue';
import SortSelector from '../common/SortSelector.vue';

// 导入或定义SortOption接口
interface SortOption {
  value: string;
  label: string;
}

export default defineComponent({
  name: 'BlogFilter',
  components: {
    SearchBox,
    SortSelector
  },
  props: {
    keyword: {
      type: String,
      default: ''
    },
    sortBy: {
      type: String,
      default: 'newest'
    },
    searchPlaceholder: {
      type: String,
      default: '搜索博客...'
    },
    sortOptions: {
      type: Array as () => SortOption[],
      default: () => [
        { value: 'newest', label: '最新发布' },
        { value: 'popular', label: '最多浏览' }
      ]
    }
  },
  emits: ['search', 'sort-change', 'update:keyword', 'update:sortBy'],
  setup(props, { emit }) {
    const searchKeyword = ref(props.keyword);
    const sortOption = ref(props.sortBy);
    
    // 监听props变化更新本地值
    watch(() => props.keyword, (newValue) => {
      searchKeyword.value = newValue;
    });
    
    watch(() => props.sortBy, (newValue) => {
      sortOption.value = newValue;
    });
    
    // 监听本地值变化更新父组件
    watch(searchKeyword, (newValue) => {
      emit('update:keyword', newValue);
    });
    
    watch(sortOption, (newValue) => {
      emit('update:sortBy', newValue);
    });
    
    return {
      searchKeyword,
      sortOption
    };
  }
});
</script>

<style scoped>
.blog-filter {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 30px;
  flex-wrap: wrap;
  gap: 15px;
}

@media (max-width: 768px) {
  .blog-filter {
    flex-direction: column;
    align-items: stretch;
  }
}
</style>