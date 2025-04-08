<template>
  <div class="sidebar-left">
    <div class="sidebar-section">
      <div class="nav-item" :class="{ 'active': currentTab === 'latest' }" @click="handleChangeTab('latest')">
        <div class="nav-icon">
          <Icon icon="mdi:clock-time-four-outline" width="20" height="20" />
        </div>
        <div class="nav-text">最新</div>
      </div>
      
      <div class="nav-item" :class="{ 'active': currentTab === 'hot' }" @click="handleChangeTab('hot')">
        <div class="nav-icon">
          <Icon icon="mdi:fire" width="20" height="20" />
        </div>
        <div class="nav-text">热门</div>
      </div>
      
      <div class="nav-item" :class="{ 'active': currentTab === 'follow' }" @click="handleChangeTab('follow')">
        <div class="nav-icon">
          <Icon icon="mdi:star-outline" width="20" height="20" />
        </div>
        <div class="nav-text">关注</div>
      </div>
      
      <div class="nav-item" :class="{ 'active': currentTab === 'my-circles' }" @click="handleChangeTab('my-circles')">
        <div class="nav-icon">
          <Icon icon="mdi:account-group-outline" width="20" height="20" />
        </div>
        <div class="nav-text">我的圈子</div>
      </div>
      
      <div class="nav-item" :class="{ 'active': currentTab === 'recommend' }" @click="handleChangeTab('recommend')">
        <div class="nav-icon">
          <Icon icon="mdi:bookmark-multiple-outline" width="20" height="20" />
        </div>
        <div class="nav-text">推荐圈子</div>
      </div>
    </div>
    
    <div class="sidebar-section communities">
      <div class="section-title">热门圈子</div>
      <div v-if="loading" class="loading-circles">
        <div class="loading-spinner"></div>
      </div>
      
      <template v-else>
        <div 
          v-for="circle in hotCircles" 
          :key="circle.circleId" 
          class="community-item"
          :class="{ 'active': selectedCircleId === circle.circleId }"
          @click="selectCircle(circle.circleId)"
        >
          <div class="nav-icon">
            <img v-if="circle.icon" :src="circle.icon" :alt="circle.name" class="circle-icon-img">
            <Icon v-else icon="mdi:circle-outline" width="20" height="20" />
          </div>
          <div class="community-text">{{ circle.name }}</div>
        </div>
        
        <div class="community-item" @click="goToAllCircles">
          <div class="nav-icon">
            <Icon icon="mdi:dots-horizontal" width="20" height="20" />
          </div>
          <div class="community-text">查看更多圈子</div>
        </div>
      </template>
    </div>
  </div>
</template>

<script lang="ts">
import { defineComponent, ref, onMounted } from 'vue';
import { Icon } from '@iconify/vue';
import { getHotCircles } from '../../services/circleService';
import type { CircleItem } from '../../types/circle';

export default defineComponent({
  name: 'MomentSidebarLeft',
  components: {
    Icon
  },
  emits: ['change-tab', 'select-circle'],
  setup(props, { emit }) {
    const currentTab = ref('latest');
    const selectedCircleId = ref(0);
    const hotCircles = ref<CircleItem[]>([]);
    const loading = ref(false);
    const error = ref('');
    
    const handleChangeTab = (tab: string) => {
      currentTab.value = tab;
      selectedCircleId.value = 0;
      emit('change-tab', tab);
    };
    
    const selectCircle = (circleId: number) => {
      selectedCircleId.value = circleId;
      emit('select-circle', circleId);
    };
    
    const goToAllCircles = () => {
      // 导航到圈子列表页面
      handleChangeTab('all-circles');
    };
    
    const fetchHotCircles = async () => {
      loading.value = true;
      error.value = '';
      
      try {
        const response = await getHotCircles(1, 5);
        
        if (response.code === 0) {
          hotCircles.value = response.data.list;
          console.log('加载热门圈子成功:', response.data.list);
        } else {
          error.value = response.msg || '获取热门圈子失败';
          console.error('获取热门圈子失败:', response.msg);
          
          // 如果API失败，使用模拟数据（仅开发测试用）
          if (process.env.NODE_ENV === 'development') {
            provideFallbackHotCircles();
          }
        }
      } catch (err: any) {
        error.value = err.message || '获取热门圈子失败';
        console.error('获取热门圈子请求出错:', err);
        
        // 如果API请求出错，使用模拟数据（仅开发测试用）
        if (process.env.NODE_ENV === 'development') {
          provideFallbackHotCircles();
        }
      } finally {
        loading.value = false;
      }
    };
    
    // 提供测试用的模拟热门圈子数据
    const provideFallbackHotCircles = () => {
      hotCircles.value = [
        {
          circleId: 1,
          name: "Vue3学习圈",
          description: "Vue3源码解析、组合式API、新特性讨论",
          icon: "/vue-logo.png",
          postCount: 234,
          memberCount: 1024,
          isOfficial: 1,
          isFollowed: false,
          createTime: "2023-10-01"
        },
        {
          circleId: 2,
          name: "TypeScript交流",
          description: "TypeScript类型体操、高级类型、开发经验",
          icon: "/ts-logo.png",
          postCount: 156,
          memberCount: 820,
          isOfficial: 0,
          isFollowed: true,
          createTime: "2023-11-15"
        },
        {
          circleId: 3,
          name: "前端架构师",
          description: "前端工程化、性能优化、设计模式",
          icon: "/architect-logo.png",
          postCount: 98,
          memberCount: 532,
          isOfficial: 0,
          isFollowed: false,
          createTime: "2023-12-20"
        },
        {
          circleId: 4,
          name: "算法竞赛",
          description: "算法思想、LeetCode刷题、面试准备",
          icon: "/algorithm-logo.png", 
          postCount: 143,
          memberCount: 765,
          isOfficial: 0,
          isFollowed: false,
          createTime: "2024-02-18"
        },
        {
          circleId: 5,
          name: "面试交流",
          description: "技术面试经验分享、面经讨论",
          icon: "/interview-logo.png",
          postCount: 178,
          memberCount: 967,
          isOfficial: 1,
          isFollowed: false,
          createTime: "2024-01-10"
        }
      ];
    };
    
    onMounted(() => {
      fetchHotCircles();
    });
    
    return {
      currentTab,
      selectedCircleId,
      hotCircles,
      loading,
      error,
      handleChangeTab,
      selectCircle,
      goToAllCircles
    };
  }
});
</script>

<style scoped>
.sidebar-left {
  display: flex;
  flex-direction: column;
  padding: 16px 0;
  background-color: #fff;
  border-radius: 8px;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.05);
  width: auto;
  height: auto;
}

.sidebar-section {
  margin-bottom: 12px;
  padding: 0;
}

.communities {
  margin-top: 8px;
  border-top: 1px solid #f2f3f5;
  padding-top: 12px;
}

.section-title {
  padding: 8px 16px;
  font-size: 13px;
  color: #8c8c8c;
  font-weight: 500;
}

.nav-item {
  display: flex;
  align-items: center;
  padding: 10px 16px;
  cursor: pointer;
  transition: all 0.2s ease;
  border-radius: 4px;
  margin: 4px 8px;
}

.nav-item:hover {
  background-color: #f2f3f5;
}

.nav-item.active {
  background-color: #edf2fd;
  color: #3370ff;
  font-weight: 500;
}

.nav-icon {
  margin-right: 12px;
  font-size: 20px;
  width: 24px;
  height: 24px;
  display: flex;
  align-items: center;
  justify-content: center;
  color: #8a919f;
}

.nav-item.active .nav-icon {
  color: #3370ff;
}

.icon-svg {
  width: 20px;
  height: 20px;
}

.nav-text {
  font-size: 14px;
  color: #252933;
  font-weight: 400;
}

.nav-item.active .nav-text {
  color: #3370ff;
  font-weight: 500;
}

.community-item {
  display: flex;
  align-items: center;
  padding: 10px 16px;
  cursor: pointer;
  transition: all 0.2s ease;
  margin: 2px 8px;
  border-radius: 4px;
}

.community-item:hover {
  background-color: #f2f3f5;
}

.community-item.active {
  background-color: #edf2fd;
}

.community-item.active .community-text {
  color: #3370ff;
  font-weight: 500;
}

.community-text {
  font-size: 14px;
  color: #8a919f;
}

.community-item .nav-icon {
  margin-right: 12px;
  font-size: 20px;
  width: 24px;
  height: 24px;
  display: flex;
  align-items: center;
  justify-content: center;
  color: #8a919f;
}

.circle-icon-img {
  width: 20px;
  height: 20px;
  border-radius: 50%;
  object-fit: cover;
}

.loading-circles {
  display: flex;
  justify-content: center;
  padding: 20px 0;
}

.loading-spinner {
  width: 20px;
  height: 20px;
  border: 2px solid #f3f3f3;
  border-top: 2px solid #3370ff;
  border-radius: 50%;
  animation: spin 1s linear infinite;
}

@keyframes spin {
  0% { transform: rotate(0deg); }
  100% { transform: rotate(360deg); }
}
</style>