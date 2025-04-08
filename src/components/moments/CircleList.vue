<template>
  <div class="circle-list">
    <div v-if="loading" class="loading-state">
      <div class="loading-spinner"></div>
      <span>加载中...</span>
    </div>
    
    <div v-else-if="circles.length === 0" class="empty-state">
      <Icon icon="mdi:information-outline" width="40" height="40" />
      <span>暂无圈子</span>
    </div>
    
    <div v-else class="circle-items">
      <div v-for="circle in circles" :key="circle.circleId" class="circle-item">
        <div class="circle-icon">
          <img :src="circle.icon || '/default-circle.png'" :alt="circle.name">
        </div>
        
        <div class="circle-info">
          <div class="circle-name">
            {{ circle.name }}
            <span v-if="circle.isOfficial === 1" class="official-badge">官方</span>
          </div>
          <div class="circle-desc">{{ circle.description }}</div>
          <div class="circle-meta">
            <span>{{ circle.postCount }} 帖子</span>
            <span>{{ circle.memberCount }} 成员</span>
          </div>
        </div>
        
        <div class="circle-action">
          <button 
            class="follow-btn" 
            :class="{ 'following': circle.isFollowed }"
            @click="handleFollow(circle)"
          >
            {{ circle.isFollowed ? '已关注' : '关注' }}
          </button>
        </div>
      </div>
    </div>
    
    <div v-if="hasMore && !loading" class="load-more">
      <button @click="loadMore" class="load-more-btn">加载更多</button>
    </div>
  </div>
</template>

<script lang="ts">
import { defineComponent, ref, computed, onMounted, PropType } from 'vue';
import { Icon } from '@iconify/vue';
import { getCircleList, joinCircle } from '../../services/circleService';
import type { CircleItem } from '../../types/circle';

export default defineComponent({
  name: 'CircleList',
  components: {
    Icon
  },
  props: {
    userId: {
      type: Number,
      default: 0
    },
    keyword: {
      type: String,
      default: ''
    },
    orderBy: {
      type: String as PropType<'new' | 'hot' | ''>,
      default: ''
    },
    perPage: {
      type: Number,
      default: 10
    }
  },
  setup(props) {
    const circles = ref<CircleItem[]>([]);
    const loading = ref(false);
    const error = ref('');
    const currentPage = ref(1);
    const total = ref(0);
    
    const hasMore = computed(() => {
      return circles.value.length < total.value;
    });
    
    const fetchCircles = async (page = 1) => {
      loading.value = true;
      error.value = '';
      
      try {
        const params: any = {
          page,
          size: props.perPage
        };
        
        if (props.keyword) {
          params.keyword = props.keyword;
        }
        
        if (props.userId) {
          params.userId = props.userId;
        }
        
        if (props.orderBy) {
          params.orderBy = props.orderBy;
        }
        
        const response = await getCircleList(params);
        
        if (response.code === 0 && response.data && response.data.list) {
          if (page === 1) {
            circles.value = response.data.list;
          } else {
            circles.value = [...circles.value, ...response.data.list];
          }
          
          total.value = response.data.total || 0;
          currentPage.value = page;
          
          console.log('加载圈子数据成功:', response.data);
        } else {
          if (response.msg === '无效的认证令牌') {
            console.log('用户未登录，使用默认圈子数据');
            provideFallbackData(page);
          } else {
            error.value = response.msg || '获取圈子列表失败';
            console.error('获取圈子列表失败:', response.msg);
            
            // 如果API失败，使用模拟数据（仅开发测试用）
            if (process.env.NODE_ENV === 'development') {
              provideFallbackData(page);
            }
          }
        }
      } catch (err: any) {
        error.value = err.message || '获取圈子列表失败';
        console.error('获取圈子列表请求出错:', err);
        
        // 如果API请求出错，使用模拟数据（仅开发测试用）
        if (process.env.NODE_ENV === 'development') {
          provideFallbackData(page);
        }
      } finally {
        loading.value = false;
      }
    };
    
    // 提供测试用的模拟数据
    const provideFallbackData = (page: number) => {
      const mockCircles = [
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
          name: "React生态",
          description: "React框架、Redux、Hooks最佳实践",
          icon: "/react-logo.png",
          postCount: 187,
          memberCount: 943,
          isOfficial: 1,
          isFollowed: false,
          createTime: "2024-01-05"
        },
        {
          circleId: 5,
          name: "算法竞赛",
          description: "算法思想、LeetCode刷题、面试准备",
          icon: "/algorithm-logo.png",
          postCount: 143,
          memberCount: 765,
          isOfficial: 0,
          isFollowed: false,
          createTime: "2024-02-18"
        }
      ];
      
      if (page === 1) {
        circles.value = mockCircles;
      } else {
        // 第二页及以后提供不同的模拟数据
        const moreMockCircles = mockCircles.map(item => ({
          ...item,
          circleId: item.circleId + 5 * (page - 1),
          name: `${item.name} ${page}`,
        }));
        circles.value = [...circles.value, ...moreMockCircles];
      }
      
      total.value = 20; // 模拟总数
      currentPage.value = page;
    };
    
    const loadMore = () => {
      if (!loading.value && hasMore.value) {
        fetchCircles(currentPage.value + 1);
      }
    };
    
    const handleFollow = async (circle: CircleItem) => {
      // 检查用户是否已登录
      const token = localStorage.getItem('token');
      if (!token) {
        alert('请先登录再关注圈子');
        return;
      }
      
      // 保存原始状态
      const originalIsFollowed = circle.isFollowed;
      
      // 立即更新前端状态，保证用户体验
      const targetCircle = circles.value.find(c => c.circleId === circle.circleId);
      if (!targetCircle) return;
      
      // 先立即切换状态
      targetCircle.isFollowed = !targetCircle.isFollowed;
      
      try {
        const response = await joinCircle({ circleId: circle.circleId });
        
        if (response.code === 0 && response.data) {
          // 如果API返回了具体状态则以API为准
          if (response.data.hasOwnProperty('isFollowed')) {
            targetCircle.isFollowed = response.data.isFollowed;
          }
          
          console.log(`${targetCircle.isFollowed ? '关注' : '取消关注'}圈子成功:`, circle.name);
        } else {
          // 处理认证失败等情况
          if (response.msg === '无效的认证令牌') {
            alert('登录已过期，请重新登录');
            // 恢复原始状态
            targetCircle.isFollowed = originalIsFollowed;
          } else {
            console.error('关注/取消关注圈子失败:', response.msg);
          }
        }
      } catch (err: any) {
        console.error('关注/取消关注圈子请求出错:', err);
        // 发生错误时恢复原始状态
        if (targetCircle) {
          targetCircle.isFollowed = originalIsFollowed;
        }
      }
    };
    
    onMounted(() => {
      fetchCircles();
    });
    
    return {
      circles,
      loading,
      error,
      hasMore,
      loadMore,
      handleFollow
    };
  }
});
</script>

<style scoped>
.circle-list {
  background-color: #fff;
  border-radius: 8px;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.05);
  padding: 16px;
}

.circle-items {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.circle-item {
  display: flex;
  align-items: center;
  padding: 12px;
  border-radius: 8px;
  transition: all 0.2s ease;
  border: 1px solid #f0f0f0;
}

.circle-item:hover {
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.05);
  transform: translateY(-2px);
}

.circle-icon {
  width: 50px;
  height: 50px;
  border-radius: 50%;
  overflow: hidden;
  margin-right: 12px;
  flex-shrink: 0;
}

.circle-icon img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.circle-info {
  flex: 1;
}

.circle-name {
  font-size: 16px;
  font-weight: 500;
  margin-bottom: 4px;
  color: #333;
  display: flex;
  align-items: center;
}

.official-badge {
  background-color: #1677ff;
  color: white;
  font-size: 12px;
  padding: 0 6px;
  border-radius: 4px;
  margin-left: 8px;
}

.circle-desc {
  font-size: 14px;
  color: #666;
  margin-bottom: 6px;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
}

.circle-meta {
  display: flex;
  gap: 12px;
  font-size: 13px;
  color: #999;
}

.circle-action {
  margin-left: 16px;
}

.follow-btn {
  padding: 6px 16px;
  border-radius: 4px;
  font-size: 14px;
  cursor: pointer;
  transition: all 0.2s;
  border: 1px solid #1677ff;
  background-color: white;
  color: #1677ff;
}

.follow-btn:hover {
  background-color: #f0f7ff;
}

.follow-btn.following {
  background-color: #f0f7ff;
}

.loading-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 30px;
  color: #999;
}

.loading-spinner {
  width: 30px;
  height: 30px;
  border: 3px solid #f3f3f3;
  border-top: 3px solid #1677ff;
  border-radius: 50%;
  animation: spin 1s linear infinite;
  margin-bottom: 12px;
}

@keyframes spin {
  0% { transform: rotate(0deg); }
  100% { transform: rotate(360deg); }
}

.empty-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 40px 0;
  color: #999;
}

.empty-state span {
  margin-top: 12px;
}

.load-more {
  display: flex;
  justify-content: center;
  margin-top: 20px;
}

.load-more-btn {
  padding: 8px 24px;
  background-color: white;
  border: 1px solid #ddd;
  border-radius: 4px;
  color: #666;
  cursor: pointer;
  transition: all 0.2s;
}

.load-more-btn:hover {
  background-color: #f5f5f5;
}
</style> 