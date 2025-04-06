<template>
  <div class="moments-page">
    <div class="moments-container">
      <div v-if="loading" class="loading">加载中...</div>
      <div v-else class="moments-layout">
        <!-- 左侧导航栏 -->
        <div class="left-sidebar">
          <MomentSidebarLeft />
        </div>
        
        <!-- 中间内容区 -->
        <div class="content-area">
          <MomentContent />
        </div>
        
        <!-- 右侧信息栏 -->
        <div class="right-sidebar">
          <MomentSidebarRight />
        </div>
      </div>
    </div>
  </div>
</template>

<script lang="ts">
import { defineComponent, ref, onMounted } from 'vue';
import MomentSidebarLeft from '@/components/moments/MomentSidebarLeft.vue';
import MomentContent from '@/components/moments/MomentContent.vue';
import MomentSidebarRight from '@/components/moments/MomentSidebarRight.vue';

export default defineComponent({
  name: 'MomentsPage',
  components: {
    MomentSidebarLeft,
    MomentContent,
    MomentSidebarRight
  },
  setup() {
    const loading = ref(true);

    onMounted(() => {
      setTimeout(() => {
        loading.value = false;
      }, 800); // 模拟数据加载
    });

    return { loading };
  }
});
</script>

<style scoped>
.moments-page {
  padding: 20px 0;
  background-color: #f4f5f5;
  min-height: calc(100vh - 60px);
}

.moments-title {
  text-align: center;
  font-size: 24px;
  font-weight: bold;
  margin-bottom: 20px;
  color: #333;
}

.moments-container {
  max-width: 1200px;
  margin: 0 auto;
  padding: 0 15px;
}

.loading {
  text-align: center;
  font-size: 18px;
  color: #999;
  padding: 50px 0;
}

.moments-layout {
  display: grid;
  grid-template-columns: 240px 1fr 300px;
  gap: 20px;
}

/* 响应式设计 */
@media (max-width: 1200px) {
  .moments-layout {
    grid-template-columns: 200px 1fr 250px;
  }
}

@media (max-width: 992px) {
  .moments-layout {
    grid-template-columns: 180px 1fr;
  }
  
  .right-sidebar {
    display: none;
  }
}

@media (max-width: 768px) {
  .moments-layout {
    grid-template-columns: 1fr;
  }
  
  .left-sidebar {
    display: none;
  }
}
</style>