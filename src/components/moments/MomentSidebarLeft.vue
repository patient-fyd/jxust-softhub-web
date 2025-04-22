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
    
    <!-- 推荐圈子，默认显示 -->
    <div class="sidebar-section recommended-circles">
      <div v-if="loading" class="loading-circles">
        <div class="loading-spinner"></div>
      </div>
      
      <template v-else>
        <div 
          v-for="circle in displayedCircles" 
          :key="circle.circleId"
          class="circle-item"
          :class="{ 'active': selectedCircleId === circle.circleId }"
          @click="selectCircle(circle.circleId)"
        >
          <div class="circle-text">{{ circle.name }}</div>
          <div class="follow-btn" @click.stop="toggleFollow(circle)">
            <Icon 
              :icon="circle.isFollowed ? 'mdi:check' : 'mdi:plus'" 
              :class="{ 'followed': circle.isFollowed }" 
              width="16" 
              height="16" 
            />
          </div>
        </div>
        
        <div class="circle-item more" @click="toggleShowAll">
          <div class="circle-text">{{ showAllCircles ? '收起' : '更多' }}</div>
        </div>
      </template>
    </div>
  </div>
</template>

<script lang="ts">
import { defineComponent, ref, onMounted, computed } from 'vue';
import { Icon } from '@iconify/vue';
import { getHotCircles, joinCircle } from '../../services/circleService';
import type { CircleItem } from '../../types/circle';

export default defineComponent({
  name: 'MomentSidebarLeft',
  components: {
    Icon
  },
  emits: ['change-tab', 'select-circle'],
  setup(_props, { emit }) {
    const currentTab = ref('latest');
    const selectedCircleId = ref(0);
    const recommendedCircles = ref<CircleItem[]>([]);
    const loading = ref(false);
    const error = ref('');
    const showAllCircles = ref(false);
    const followLoading = ref(new Set<number>());
    
    // 控制显示的圈子数量
    const displayedCircles = computed(() => {
      return showAllCircles.value 
        ? recommendedCircles.value 
        : recommendedCircles.value.slice(0, 4);
    });
    
    // 切换显示全部/部分圈子
    const toggleShowAll = () => {
      showAllCircles.value = !showAllCircles.value;
    };
    
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
    
    // 获取推荐圈子
    const fetchRecommendedCircles = async () => {
      loading.value = true;
      error.value = '';
      
      try {
        const response = await getHotCircles(1, 10); // 获取10个热门圈子作为推荐
        
        if (response.code === 0 && response.data && response.data.list) {
          recommendedCircles.value = response.data.list || [];
          console.log('加载推荐圈子成功:', response.data.list);
        } else {
          // 处理认证失败等错误，提供静默模式，避免在控制台显示过多错误
          if (response.msg === '无效的认证令牌') {
            console.log('用户未登录，使用默认推荐圈子');
            provideFallbackCircles();
          } else {
            error.value = response.msg || '获取推荐圈子失败';
            console.error('获取推荐圈子失败:', response.msg);
            recommendedCircles.value = []; // 确保总是有有效值
          }
        }
      } catch (err: any) {
        error.value = err.message || '获取推荐圈子失败';
        console.error('获取推荐圈子请求出错:', err);
        recommendedCircles.value = []; // 错误情况下设置为空数组
        
        // 在开发环境中提供模拟数据
        if (process.env.NODE_ENV === 'development') {
          provideFallbackCircles();
        }
      } finally {
        loading.value = false;
      }
    };
    
    // 提供默认的圈子数据（未登录或API请求失败时使用）
    const provideFallbackCircles = () => {
      recommendedCircles.value = [
        {
          circleId: 1,
          name: "Vue开发者",
          icon: "/vue-logo.png",
          description: "Vue框架技术交流",
          postCount: 234,
          memberCount: 1024,
          isOfficial: 1,
          isFollowed: false,
          createTime: "2023-10-01"
        },
        {
          circleId: 2,
          name: "Web前端圈",
          icon: "/web-logo.png",
          description: "前端技术交流和分享",
          postCount: 156,
          memberCount: 820,
          isOfficial: 1,
          isFollowed: false,
          createTime: "2023-11-15"
        },
        {
          circleId: 3,
          name: "算法竞赛",
          icon: "/algorithm-logo.png",
          description: "算法学习与竞赛交流",
          postCount: 98,
          memberCount: 532,
          isOfficial: 0,
          isFollowed: false,
          createTime: "2023-12-20"
        },
        {
          circleId: 4,
          name: "程序员日常",
          icon: "/daily-logo.png",
          description: "程序员的日常生活与吐槽",
          postCount: 187,
          memberCount: 943,
          isOfficial: 0,
          isFollowed: false,
          createTime: "2024-01-05"
        }
      ];
    };
    
    // 关注/取消关注圈子
    const toggleFollow = async (circle: CircleItem) => {
      // 检查当前token是否存在
      const token = localStorage.getItem('token');
      if (!token) {
        // 未登录状态下，提示用户登录
        alert('请先登录再关注圈子');
        return;
      }
      
      if (followLoading.value.has(circle.circleId)) return;
      
      followLoading.value.add(circle.circleId);
      
      // 先保存当前状态
      const originalStatus = circle.isFollowed;
      // 立即更新UI状态，提升用户体验
      circle.isFollowed = !originalStatus;
      
      try {
        const response = await joinCircle({ circleId: circle.circleId });
        
        if (response.code === 0 && response.data) {
          // API成功，使用返回的状态
          if (response.data.hasOwnProperty('isFollowed')) {
            circle.isFollowed = response.data.isFollowed;
          }
          console.log(`${circle.isFollowed ? '关注' : '取消关注'}圈子成功:`, circle.name);
        } else {
          // 检查是否是认证问题
          if (response.msg === '无效的认证令牌') {
            alert('登录已过期，请重新登录');
            // 可以在此处添加重定向到登录页面的逻辑
            circle.isFollowed = originalStatus; // 恢复原状态
          } else {
            console.error(`${originalStatus ? '取消关注' : '关注'}圈子失败:`, response.msg);
            // API失败时，保持已经更新的前端状态
          }
        }
      } catch (err: any) {
        console.error(`${originalStatus ? '取消关注' : '关注'}圈子请求出错:`, err);
        // API错误时，恢复原始状态
        circle.isFollowed = originalStatus;
      } finally {
        followLoading.value.delete(circle.circleId);
      }
    };
    
    onMounted(() => {
      fetchRecommendedCircles();
    });
    
    return {
      currentTab,
      selectedCircleId,
      recommendedCircles,
      displayedCircles,
      loading,
      error,
      showAllCircles,
      handleChangeTab,
      selectCircle,
      goToAllCircles,
      toggleShowAll,
      toggleFollow,
      followLoading
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
  width: 100%;
  height: auto;
}

.sidebar-section {
  margin-bottom: 12px;
  padding: 0;
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

.nav-text {
  font-size: 14px;
  color: #252933;
  font-weight: 400;
}

.nav-item.active .nav-text {
  color: #3370ff;
  font-weight: 500;
}

.recommended-circles {
  border-top: 1px solid #f2f3f5;
  padding: 0;
  margin-top: 0;
  padding-left: 20px;
}

.circle-item {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 8px 16px;
  cursor: pointer;
  transition: all 0.2s ease;
  border-radius: 4px;
  margin: 4px 8px;
  background-color: #f7f8fa;
}

.circle-item:hover {
  background-color: #edf2fd;
}

.circle-item.active {
  background-color: #edf2fd;
  color: #3370ff;
}

.circle-text {
  font-size: 14px;
  color: #525866;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  flex: 1;
  margin-right: 8px;
}

.circle-item.active .circle-text {
  color: #3370ff;
  font-weight: 500;
}

.circle-item.more {
  margin-top: 8px;
  background-color: transparent;
  text-align: center;
}

.circle-item.more .circle-text {
  color: #8a919f;
  text-align: center;
  width: 100%;
}

.follow-btn {
  width: 20px;
  height: 20px;
  border-radius: 50%;
  background-color: #e0e3ea;
  display: flex;
  align-items: center;
  justify-content: center;
  color: #8a919f;
  cursor: pointer;
  transition: all 0.2s ease;
  flex-shrink: 0;
}

.follow-btn:hover {
  background-color: #3370ff;
  color: white;
}

.follow-btn .followed {
  color: #3370ff;
}

.follow-btn:hover .followed {
  color: white;
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