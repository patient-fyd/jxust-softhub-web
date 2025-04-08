<template>
  <div class="moments-page">
    <div class="moments-container">
      <div v-if="loading" class="loading">加载中...</div>
      <div v-else class="moments-layout">
        <!-- 左侧导航栏 -->
        <div class="left-sidebar">
          <MomentSidebarLeft 
            @change-tab="handleTabChange"
            @select-circle="handleCircleSelect"
          />
        </div>
        
        <!-- 中间内容区 -->
        <div class="content-area">
          <!-- 如果选择了圈子，显示圈子详情 -->
          <CircleDetail
            v-if="selectedCircleId > 0"
            :circleId="selectedCircleId"
          />
          
          <!-- 如果是圈子列表视图，显示圈子列表 -->
          <CircleList
            v-else-if="currentTab === 'all-circles' || currentTab === 'my-circles' || currentTab === 'recommend'"
            :userId="currentTab === 'my-circles' ? userStore.currentUser?.userId || 0 : 0"
            :orderBy="currentTab === 'recommend' ? 'hot' : ''"
          />
          
          <!-- 否则显示动态内容 -->
          <MomentContent 
            v-else
            :filter="{
              orderBy: currentTab,
              circleId: selectedCircleId
            }"
          />
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
import { useUserStore } from '@/stores/userStore';
import MomentSidebarLeft from '@/components/moments/MomentSidebarLeft.vue';
import MomentContent from '@/components/moments/MomentContent.vue';
import MomentSidebarRight from '@/components/moments/MomentSidebarRight.vue';
import CircleList from '@/components/moments/CircleList.vue';
import CircleDetail from '@/components/moments/CircleDetail.vue';
import { getHotCircles } from '@/services/circleService';

export default defineComponent({
  name: 'MomentsPage',
  components: {
    MomentSidebarLeft,
    MomentContent,
    MomentSidebarRight,
    CircleList,
    CircleDetail
  },
  setup() {
    const loading = ref(true);
    const currentTab = ref('latest');
    const selectedCircleId = ref(0);
    const userStore = useUserStore();
    
    const handleTabChange = (tab: string) => {
      currentTab.value = tab;
      selectedCircleId.value = 0; // 切换标签时重置圈子选择
    };
    
    const handleCircleSelect = (circleId: number) => {
      selectedCircleId.value = circleId;
    };

    onMounted(async () => {
      try {
        // 预加载热门圈子数据
        await getHotCircles(1, 5);
      } catch (error) {
        console.error('加载热门圈子失败', error);
      } finally {
        // 延迟一点加载动画，让用户体验更好
        setTimeout(() => {
          loading.value = false;
        }, 500);
      }
    });

    return { 
      loading, 
      currentTab,
      selectedCircleId,
      userStore,
      handleTabChange,
      handleCircleSelect
    };
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
  max-width: 1280px;
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
  grid-template-columns: 220px 1fr 220px;
  gap: 20px;
}

/* 响应式设计 */
@media (max-width: 1200px) {
  .moments-layout {
    grid-template-columns: 200px 1fr 200px;
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