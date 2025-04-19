<template>
  <div class="blog-container">
    <div class="tabs-header">
      <div class="tab active">推荐</div>
      <div class="tab">最新</div>
    </div>
    
    <!-- 加载状态 - 骨架屏 -->
    <div v-if="loading" class="blog-list">
      <div v-for="i in 6" :key="i" class="blog-item skeleton">
        <div class="skeleton-content">
          <div class="skeleton-title"></div>
          <div class="skeleton-meta"></div>
          <div class="skeleton-description"></div>
        </div>
      </div>
    </div>
    
    <!-- 错误状态 -->
    <div v-else-if="error" class="error-state">
      <div class="error-icon">!</div>
      <p>{{ error }}</p>
      <button @click="loadBlogs" class="retry-btn">重试</button>
    </div>
    
    <!-- 空状态 -->
    <div v-else-if="blogs.length === 0" class="empty-state">
      <div class="empty-icon">📝</div>
      <p>暂无技术博客</p>
      <p class="empty-tip">请尝试更改筛选条件或稍后再试</p>
    </div>
    
    <!-- 博客列表 -->
    <div v-else class="blog-list">
      <div v-for="blog in blogs" :key="blog.blogId || blog.id" class="blog-item">
        <div class="blog-content">
          <h2 class="blog-title">{{ blog.title }}</h2>
          <div class="blog-desc">{{ blog.summary || (blog.content && blog.content.replace(/<[^>]*>/g, '').substring(0, 160) + '...') || '暂无描述' }}</div>
          
          <div class="blog-meta">
            <div class="meta-left">
              <span class="blog-author">{{ blog.authorName || '匿名用户' }}</span>
              <span class="blog-date">{{ formatDate(blog.createTime) }}</span>
              <span class="blog-views">{{ blog.viewCount }} 阅读</span>
              <span class="blog-comments">{{ blog.commentCount }} 评论</span>
            </div>
            <div class="meta-right">
              <div class="blog-tags" v-if="blog.tags">
                <span v-for="tag in parseTags(blog.tags).slice(0, 2)" :key="tag" class="tag">{{ tag }}</span>
              </div>
            </div>
          </div>
        </div>
        
        <div class="blog-image" v-if="blog.coverImage">
          <img :src="blog.coverImage" alt="封面图" />
        </div>
      </div>
    </div>
    
    <!-- 分页控件 -->
    <div v-if="blogs.length > 0" class="pagination">
      <div class="page-info">共 {{ totalItems }} 条</div>
      <div class="page-actions">
        <select v-model="pageSize" @change="handlePageSizeChange" class="page-size-select">
          <option v-for="size in [10, 20, 30, 50]" :key="size" :value="size">{{ size }}条/页</option>
        </select>
        
        <button 
          :disabled="currentPage <= 1" 
          @click="changePage(currentPage - 1)" 
          class="page-btn"
        >
          上一页
        </button>
        
        <div class="page-numbers">
          <button 
            v-for="page in visiblePageNumbers" 
            :key="page" 
            :class="['page-number', { active: currentPage === page }]"
            @click="changePage(page)"
          >
            {{ page }}
          </button>
        </div>
        
        <button 
          :disabled="currentPage >= totalPages" 
          @click="changePage(currentPage + 1)" 
          class="page-btn"
        >
          下一页
        </button>
        
        <div class="page-jumper">
          <span>前往</span>
          <input 
            type="number" 
            v-model="jumpPage" 
            min="1" 
            :max="totalPages" 
            @keyup.enter="jumpToPage"
          />
          <span>页</span>
          <button @click="jumpToPage" class="go-btn">GO</button>
        </div>
      </div>
    </div>
  </div>
</template>

<script lang="ts">
import { defineComponent, ref, computed, onMounted, watch } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import { blogService, type Blog } from '../services/blogService';

export default defineComponent({
  name: 'BlogView',
  setup() {
    const route = useRoute();
    const router = useRouter();
    
    // 基础数据
    const blogs = ref<Blog[]>([]);
    const loading = ref(true);
    const error = ref('');
    const currentPage = ref(1);
    const pageSize = ref(10);
    const totalItems = ref(0);
    const jumpPage = ref<number | null>(null);
    const sortBy = ref('newest');
    
    // 计算属性
    const totalPages = computed(() => {
      return Math.ceil(totalItems.value / pageSize.value);
    });
    
    // 显示的页码按钮
    const visiblePageNumbers = computed(() => {
      const pageNumbers: number[] = [];
      let startPage = Math.max(1, currentPage.value - 2);
      let endPage = Math.min(totalPages.value, startPage + 4);
      
      if (endPage - startPage < 4) {
        startPage = Math.max(1, endPage - 4);
      }
      
      for (let i = startPage; i <= endPage; i++) {
        pageNumbers.push(i);
      }
      
      return pageNumbers;
    });
    
    // 加载博客数据
    const loadBlogs = async () => {
      loading.value = true;
      error.value = '';
      
      try {
        const params: any = {
          page: currentPage.value,
          size: pageSize.value,
          status: 1 // 只获取已发布的博客
        };
        
        // 调用博客接口
        const response = await blogService.getBlogList(params);
        
        if (response.code === 0 && response.data) {
          blogs.value = response.data.list;
          totalItems.value = response.data.total;
          
          // 根据排序选项进行排序
          if (sortBy.value === 'popular') {
            blogs.value.sort((a, b) => b.viewCount - a.viewCount);
          } else if (sortBy.value === 'comments') {
            blogs.value.sort((a, b) => b.commentCount - a.commentCount);
          }
        } else {
          error.value = response.msg || '获取博客列表失败';
        }
      } catch (err) {
        console.error('获取博客列表出错:', err);
        error.value = '获取博客列表时发生错误';
      } finally {
        loading.value = false;
      }
    };
    
    // 解析标签字符串
    const parseTags = (tagsStr: string): string[] => {
      if (!tagsStr) return [];
      return tagsStr.split(',').map(tag => tag.trim()).filter(tag => tag);
    };
    
    // 格式化日期
    const formatDate = (dateStr: string) => {
      if (!dateStr) return '';
      const date = new Date(dateStr);
      return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`;
    };
    
    // 切换页面
    const changePage = (page: number) => {
      if (page < 1 || page > totalPages.value) return;
      currentPage.value = page;
      loadBlogs();
      
      // 更新URL参数
      updateUrlParams();
    };
    
    // 跳转到指定页
    const jumpToPage = () => {
      if (jumpPage.value && jumpPage.value > 0 && jumpPage.value <= totalPages.value) {
        changePage(jumpPage.value);
        jumpPage.value = null;
      }
    };
    
    // 更新每页显示数量
    const handlePageSizeChange = () => {
      currentPage.value = 1;
      loadBlogs();
      updateUrlParams();
    };
    
    // 更新URL参数
    const updateUrlParams = () => {
      const query: Record<string, string> = {};
      
      if (currentPage.value > 1) {
        query.page = currentPage.value.toString();
      }
      
      if (pageSize.value !== 10) {
        query.size = pageSize.value.toString();
      }
      
      if (sortBy.value !== 'newest') {
        query.sort = sortBy.value;
      }
      
      router.replace({ query });
    };
    
    // 监听URL参数变化
    watch(() => route.query, (newQuery) => {
      let needReload = false;
      
      // 处理页码
      if (newQuery.page && !isNaN(Number(newQuery.page))) {
        const page = Number(newQuery.page);
        if (currentPage.value !== page) {
          currentPage.value = page;
          needReload = true;
        }
      } else if (currentPage.value !== 1) {
        currentPage.value = 1;
        needReload = true;
      }
      
      // 处理页面大小
      if (newQuery.size && !isNaN(Number(newQuery.size))) {
        const size = Number(newQuery.size);
        if (pageSize.value !== size) {
          pageSize.value = size;
          needReload = true;
        }
      }
      
      // 处理排序
      if (newQuery.sort && typeof newQuery.sort === 'string') {
        if (sortBy.value !== newQuery.sort) {
          sortBy.value = newQuery.sort;
          needReload = true;
        }
      } else if (sortBy.value !== 'newest') {
        sortBy.value = 'newest';
        needReload = true;
      }
      
      if (needReload) {
        loadBlogs();
      }
    }, { immediate: true });
    
    onMounted(() => {
      // 从URL参数中获取页码
      const pageParam = route.query.page;
      if (pageParam && !isNaN(Number(pageParam))) {
        currentPage.value = Number(pageParam);
      }
      
      // 从URL参数中获取页面大小
      const sizeParam = route.query.size;
      if (sizeParam && !isNaN(Number(sizeParam))) {
        pageSize.value = Number(sizeParam);
      }
      
      // 从URL参数中获取排序方式
      const sortParam = route.query.sort;
      if (sortParam && typeof sortParam === 'string') {
        sortBy.value = sortParam;
      }
      
      loadBlogs();
    });
    
    return {
      blogs,
      loading,
      error,
      currentPage,
      pageSize,
      totalItems,
      totalPages,
      jumpPage,
      visiblePageNumbers,
      loadBlogs,
      formatDate,
      parseTags,
      changePage,
      jumpToPage,
      handlePageSizeChange
    };
  }
});
</script>

<style scoped>
/* 主容器 */
.blog-container {
  max-width: 1200px;
  margin: 0 auto;
  padding: 20px;
}

/* 标签页头部 */
.tabs-header {
  display: flex;
  gap: 24px;
  margin-bottom: 20px;
  border-bottom: 1px solid #e5e7eb;
  padding-bottom: 8px;
}

.tab {
  font-size: 16px;
  color: #6b7280;
  cursor: pointer;
  padding: 4px 0;
  position: relative;
  font-weight: 500;
}

.tab.active {
  color: #3b82f6;
  font-weight: bold;
}

.tab.active::after {
  content: '';
  position: absolute;
  left: 0;
  bottom: -9px;
  width: 100%;
  height: 2px;
  background-color: #3b82f6;
}

/* 博客列表 */
.blog-list {
  display: flex;
  flex-direction: column;
  gap: 16px;
  margin-bottom: 20px;
}

.blog-item {
  display: flex;
  padding: 20px 0;
  border-bottom: 1px solid #f0f0f0;
  gap: 20px;
}

.blog-item:hover .blog-title {
  color: #3b82f6;
}

.blog-content {
  flex: 1;
  display: flex;
  flex-direction: column;
}

.blog-title {
  font-size: 18px;
  font-weight: 600;
  margin-bottom: 8px;
  color: #1f2937;
  transition: color 0.2s;
}

.blog-desc {
  color: #6b7280;
  font-size: 14px;
  margin-bottom: 10px;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
  line-height: 1.5;
}

.blog-meta {
  display: flex;
  justify-content: space-between;
  align-items: center;
  font-size: 13px;
  color: #9ca3af;
}

.meta-left {
  display: flex;
  align-items: center;
  gap: 12px;
}

.blog-author {
  color: #6b7280;
  font-weight: 500;
}

.blog-image {
  width: 120px;
  height: 80px;
  flex-shrink: 0;
  border-radius: 4px;
  overflow: hidden;
}

.blog-image img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.tag {
  padding: 2px 8px;
  background-color: #f3f4f6;
  border-radius: 4px;
  font-size: 12px;
  color: #6b7280;
  display: inline-block;
  margin-left: 8px;
}

/* 骨架屏 */
.skeleton {
  animation: pulse 1.5s infinite ease-in-out;
}

@keyframes pulse {
  0%, 100% { opacity: 0.5; }
  50% { opacity: 1; }
}

.skeleton-content {
  width: 100%;
}

.skeleton-title {
  height: 20px;
  width: 70%;
  background-color: #e5e7eb;
  margin-bottom: 12px;
  border-radius: 4px;
}

.skeleton-meta {
  height: 14px;
  width: 40%;
  background-color: #e5e7eb;
  margin-bottom: 12px;
  border-radius: 4px;
}

.skeleton-description {
  height: 40px;
  width: 100%;
  background-color: #e5e7eb;
  border-radius: 4px;
}

/* 分页 */
.pagination {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 16px 0;
  margin-top: 20px;
  border-top: 1px solid #f0f0f0;
}

.page-actions {
  display: flex;
  align-items: center;
  gap: 12px;
}

.page-size-select {
  padding: 6px 10px;
  border: 1px solid #e5e7eb;
  border-radius: 4px;
  background-color: white;
  font-size: 14px;
}

.page-btn {
  padding: 6px 12px;
  background-color: #f3f4f6;
  color: #4b5563;
  border: 1px solid #e5e7eb;
  border-radius: 4px;
  cursor: pointer;
  font-size: 14px;
  transition: all 0.2s;
}

.page-btn:hover:not(:disabled) {
  background-color: #e5e7eb;
}

.page-btn:disabled {
  color: #9ca3af;
  cursor: not-allowed;
}

.page-numbers {
  display: flex;
  gap: 8px;
}

.page-number {
  width: 32px;
  height: 32px;
  display: flex;
  align-items: center;
  justify-content: center;
  background-color: #f3f4f6;
  border: 1px solid #e5e7eb;
  border-radius: 4px;
  cursor: pointer;
  transition: all 0.2s;
}

.page-number:hover:not(.active) {
  background-color: #e5e7eb;
}

.page-number.active {
  background-color: #3b82f6;
  color: white;
  border-color: #3b82f6;
}

.page-jumper {
  display: flex;
  align-items: center;
  gap: 4px;
  font-size: 14px;
  color: #6b7280;
}

.page-jumper input {
  width: 40px;
  padding: 4px;
  border: 1px solid #e5e7eb;
  border-radius: 4px;
  text-align: center;
}

.go-btn {
  padding: 4px 8px;
  background-color: #f3f4f6;
  border: 1px solid #e5e7eb;
  border-radius: 4px;
  cursor: pointer;
  transition: all 0.2s;
}

.go-btn:hover {
  background-color: #e5e7eb;
}

/* 错误和空状态 */
.error-state, .empty-state {
  text-align: center;
  padding: 60px 20px;
  background-color: #f9fafb;
  border-radius: 8px;
  margin-bottom: 30px;
}

.error-icon, .empty-icon {
  font-size: 2rem;
  margin-bottom: 16px;
  display: inline-block;
  color: #6b7280;
}

.error-state p, .empty-state p {
  color: #4b5563;
  font-size: 16px;
  margin-bottom: 8px;
}

.empty-tip {
  color: #9ca3af;
  font-size: 14px;
}

.retry-btn {
  margin-top: 16px;
  padding: 8px 16px;
  background-color: #3b82f6;
  color: white;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  transition: background-color 0.2s;
}

.retry-btn:hover {
  background-color: #2563eb;
}

/* 响应式调整 */
@media (max-width: 768px) {
  .blog-item {
    flex-direction: column;
  }
  
  .blog-image {
    width: 100%;
    height: 160px;
    margin-top: 12px;
    order: -1;
  }
  
  .pagination {
    flex-direction: column;
    gap: 12px;
    align-items: flex-start;
  }
  
  .page-actions {
    flex-wrap: wrap;
  }
  
  .page-jumper {
    margin-top: 8px;
  }
}

@media (max-width: 480px) {
  .page-numbers {
    display: none;
  }
  
  .meta-left {
    flex-wrap: wrap;
    gap: 8px;
  }
}
</style>