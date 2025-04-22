<template>
  <div class="circle-detail">
    <div v-if="loading" class="loading-state">
      <div class="loading-spinner"></div>
      <span>加载中...</span>
    </div>
    
    <div v-else-if="error" class="error-state">
      <Icon icon="mdi:alert-circle-outline" width="40" height="40" />
      <span>{{ error }}</span>
    </div>
    
    <div v-else-if="circle" class="circle-content">
      <div class="circle-header">
        <div class="circle-avatar">
          <img :src="circle.icon || '/default-circle.png'" :alt="circle.name">
        </div>
        
        <div class="circle-info">
          <div class="circle-title">
            <h1>{{ circle.name }}</h1>
            <span v-if="circle.isOfficial === 1" class="official-badge">官方</span>
          </div>
          
          <div class="circle-stats">
            <div class="stat-item">
              <span class="stat-value">{{ circle.postCount }}</span>
              <span class="stat-label">帖子</span>
            </div>
            <div class="stat-item">
              <span class="stat-value">{{ circle.memberCount }}</span>
              <span class="stat-label">成员</span>
            </div>
          </div>
          
          <div class="circle-desc">{{ circle.description }}</div>
          
          <div class="circle-meta">
            <div class="meta-item">
              <Icon icon="mdi:account" width="16" height="16" />
              <span>创建者: {{ circle.creatorName }}</span>
            </div>
            <div class="meta-item">
              <Icon icon="mdi:calendar" width="16" height="16" />
              <span>创建于: {{ formatDate(circle.createTime) }}</span>
            </div>
          </div>
        </div>
        
        <div class="circle-actions">
          <button 
            class="follow-btn" 
            :class="{ 'following': circle.isFollowed }"
            @click="handleFollow"
          >
            {{ circle.isFollowed ? '已关注' : '关注' }}
          </button>
        </div>
      </div>
      
      <div class="tabs-container">
        <div class="tabs">
          <div 
            class="tab-item" 
            :class="{ 'active': activeTab === 'posts' }"
            @click="activeTab = 'posts'"
          >
            帖子
          </div>
          <div 
            class="tab-item" 
            :class="{ 'active': activeTab === 'members' }"
            @click="activeTab = 'members'"
          >
            成员
          </div>
          <div 
            class="tab-item" 
            :class="{ 'active': activeTab === 'about' }"
            @click="activeTab = 'about'"
          >
            关于
          </div>
        </div>
        
        <div class="tab-content">
          <div v-if="activeTab === 'posts'" class="posts-container">
            <!-- 这里可以集成动态列表组件 -->
            <div class="placeholder-content">
              <Icon icon="mdi:text-box-multiple-outline" width="40" height="40" />
              <span>帖子列表将在这里显示</span>
            </div>
          </div>
          
          <div v-else-if="activeTab === 'members'" class="members-container">
            <!-- 这里可以集成成员列表组件 -->
            <div class="placeholder-content">
              <Icon icon="mdi:account-group-outline" width="40" height="40" />
              <span>成员列表将在这里显示</span>
            </div>
          </div>
          
          <div v-else-if="activeTab === 'about'" class="about-container">
            <div class="about-section">
              <h3>圈子介绍</h3>
              <p>{{ circle.description }}</p>
            </div>
            
            <div class="about-section">
              <h3>管理团队</h3>
              <div class="admin-item">
                <img :src="'/default-avatar.png'" alt="管理员头像">
                <span>{{ circle.creatorName }}</span>
                <span class="admin-badge">创建者</span>
              </div>
            </div>
            
            <div class="about-section">
              <h3>创建时间</h3>
              <p>{{ formatDate(circle.createTime) }}</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script lang="ts">
import { defineComponent, ref, onMounted } from 'vue';
import type { PropType } from 'vue';
import { Icon } from '@iconify/vue';
import { getCircleDetail, joinCircle } from '../../services/circleService';
import type { CircleDetail } from '../../types/circle';

export default defineComponent({
  name: 'CircleDetailComponent',
  components: {
    Icon
  },
  props: {
    circleId: {
      type: Number as PropType<number>,
      required: true
    }
  },
  setup(props) {
    const circle = ref<CircleDetail | null>(null);
    const loading = ref(false);
    const error = ref('');
    const activeTab = ref('posts');
    
    const fetchCircleDetail = async () => {
      loading.value = true;
      error.value = '';
      
      try {
        const response = await getCircleDetail(props.circleId);
        
        if (response.code === 0) {
          circle.value = response.data;
          console.log('加载圈子详情成功:', response.data);
        } else {
          error.value = response.msg || '获取圈子详情失败';
          console.error('获取圈子详情失败:', response.msg);
          
          // 如果API失败，使用模拟数据（仅开发测试用）
          if (process.env.NODE_ENV === 'development') {
            provideFallbackData();
          }
        }
      } catch (err: any) {
        error.value = err.message || '获取圈子详情失败';
        console.error('获取圈子详情请求出错:', err);
        
        // 如果API请求出错，使用模拟数据（仅开发测试用）
        if (process.env.NODE_ENV === 'development') {
          provideFallbackData();
        }
      } finally {
        loading.value = false;
      }
    };
    
    // 提供测试用的模拟数据
    const provideFallbackData = () => {
      circle.value = {
        circleId: props.circleId,
        name: `圈子${props.circleId}`,
        description: "这是一个技术交流圈子，欢迎各位开发者分享技术经验、解决方案和学习资源。我们鼓励高质量的讨论和互助。",
        icon: "/default-circle.png",
        postCount: 235,
        memberCount: 1024,
        creatorId: 1001,
        creatorName: "开发者小明",
        isOfficial: props.circleId % 2 === 0 ? 1 : 0, // 偶数ID为官方圈子
        isFollowed: false,
        createTime: "2023-10-01 12:00:00",
        updateTime: "2024-03-15 15:30:00"
      };
    };
    
    const handleFollow = async () => {
      if (!circle.value) return;
      
      try {
        const response = await joinCircle({ circleId: props.circleId });
        
        if (response.code === 0) {
          // 更新本地状态
          if (circle.value) {
            circle.value.isFollowed = response.data.isFollowed;
            console.log(`${response.data.isFollowed ? '关注' : '取消关注'}圈子成功:`, circle.value.name);
          }
        } else {
          console.error('关注/取消关注圈子失败:', response.msg);
        }
      } catch (err) {
        console.error('关注/取消关注圈子请求出错:', err);
      }
    };
    
    // 格式化日期
    const formatDate = (dateString: string) => {
      if (!dateString) return '';
      
      const date = new Date(dateString);
      return date.toLocaleDateString('zh-CN', {
        year: 'numeric',
        month: 'long',
        day: 'numeric'
      });
    };
    
    onMounted(() => {
      fetchCircleDetail();
    });
    
    return {
      circle,
      loading,
      error,
      activeTab,
      handleFollow,
      formatDate
    };
  }
});
</script>

<style scoped>
.circle-detail {
  background-color: #fff;
  border-radius: 8px;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.05);
  overflow: hidden;
}

.loading-state,
.error-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 50px 0;
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

.error-state span,
.loading-state span {
  margin-top: 12px;
}

.circle-header {
  display: flex;
  padding: 24px;
  border-bottom: 1px solid #f0f0f0;
  position: relative;
}

.circle-avatar {
  width: 80px;
  height: 80px;
  border-radius: 50%;
  overflow: hidden;
  margin-right: 20px;
  flex-shrink: 0;
}

.circle-avatar img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.circle-info {
  flex: 1;
}

.circle-title {
  display: flex;
  align-items: center;
  margin-bottom: 12px;
}

.circle-title h1 {
  font-size: 22px;
  margin: 0;
  font-weight: 600;
  color: #333;
  margin-right: 10px;
}

.official-badge {
  background-color: #1677ff;
  color: white;
  font-size: 12px;
  padding: 2px 8px;
  border-radius: 4px;
}

.circle-stats {
  display: flex;
  margin-bottom: 12px;
}

.stat-item {
  display: flex;
  flex-direction: column;
  margin-right: 24px;
}

.stat-value {
  font-size: 18px;
  font-weight: 600;
  color: #333;
}

.stat-label {
  font-size: 13px;
  color: #999;
}

.circle-desc {
  margin-bottom: 12px;
  font-size: 14px;
  color: #666;
  line-height: 1.6;
}

.circle-meta {
  display: flex;
  flex-wrap: wrap;
  gap: 16px;
}

.meta-item {
  display: flex;
  align-items: center;
  font-size: 13px;
  color: #999;
}

.meta-item svg {
  margin-right: 6px;
}

.circle-actions {
  position: absolute;
  top: 24px;
  right: 24px;
}

.follow-btn {
  padding: 8px 20px;
  border-radius: 4px;
  font-size: 14px;
  cursor: pointer;
  transition: all 0.2s;
  background-color: #1677ff;
  color: white;
  border: none;
}

.follow-btn:hover {
  background-color: #4096ff;
}

.follow-btn.following {
  background-color: white;
  color: #1677ff;
  border: 1px solid #1677ff;
}

.tabs-container {
  padding: 0;
}

.tabs {
  display: flex;
  border-bottom: 1px solid #f0f0f0;
}

.tab-item {
  padding: 16px 24px;
  font-size: 15px;
  color: #666;
  cursor: pointer;
  position: relative;
  transition: color 0.3s;
}

.tab-item:hover {
  color: #1677ff;
}

.tab-item.active {
  color: #1677ff;
  font-weight: 500;
}

.tab-item.active:after {
  content: '';
  position: absolute;
  bottom: 0;
  left: 20%;
  width: 60%;
  height: 2px;
  background-color: #1677ff;
}

.tab-content {
  min-height: 400px;
  padding: 24px;
}

.placeholder-content {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 80px 0;
  color: #999;
}

.placeholder-content span {
  margin-top: 16px;
}

.about-section {
  margin-bottom: 24px;
}

.about-section h3 {
  font-size: 16px;
  margin-bottom: 12px;
  color: #333;
}

.about-section p {
  font-size: 14px;
  color: #666;
  line-height: 1.6;
}

.admin-item {
  display: flex;
  align-items: center;
  padding: 10px;
  background-color: #f9f9f9;
  border-radius: 6px;
}

.admin-item img {
  width: 32px;
  height: 32px;
  border-radius: 50%;
  margin-right: 12px;
}

.admin-badge {
  margin-left: 8px;
  background-color: #f5f5f5;
  color: #666;
  font-size: 12px;
  padding: 2px 6px;
  border-radius: 4px;
}
</style> 