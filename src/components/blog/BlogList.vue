<template>
  <div class="blog-list">
    <blog-card 
      v-for="blog in blogs" 
      :key="getBlogId(blog)" 
      :blog="blog"
    />
  </div>
</template>

<script lang="ts">
import { defineComponent } from 'vue';
import BlogCard from './BlogCard.vue';
import type { News } from '../../services/newsService';
import type { Blog } from '../../services/blogService';

export default defineComponent({
  name: 'BlogList',
  components: {
    BlogCard
  },
  props: {
    blogs: {
      type: Array as () => (Blog | News)[],
      required: true
    }
  },
  setup() {
    // 获取博客唯一ID
    const getBlogId = (blog: Blog | News): number => {
      if ('blogId' in blog) {
        return (blog as Blog).blogId;
      } else {
        return (blog as News).id;
      }
    };
    
    return {
      getBlogId
    };
  }
});
</script>

<style scoped>
.blog-list {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(350px, 1fr));
  gap: 30px;
  margin-bottom: 40px;
}

@media (max-width: 768px) {
  .blog-list {
    grid-template-columns: 1fr;
  }
}
</style>