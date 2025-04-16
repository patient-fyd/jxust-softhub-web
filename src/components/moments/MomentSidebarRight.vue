<template>
  <div class="sidebar-right">
    <!-- 用户信息卡片 -->
    <div class="user-card">
      <div v-if="userStore.currentUser" class="logged-in-user">
        <div class="user-header">
          <div class="avatar">
            <img :src="'/assets/images/default-avatar.svg'" alt="用户头像">
          </div>
          <div class="user-name">{{ userStore.currentUser.userName }}</div>
        </div>
        
        <div class="user-stats">
          <div class="stat-item">
            <div class="stat-number">{{ userStats.moments || 0 }}</div>
            <div class="stat-label">沸点</div>
          </div>
          <div class="stat-item">
            <div class="stat-number">{{ userStats.circles || 0 }}</div>
            <div class="stat-label">圈子</div>
          </div>
          <div class="stat-item">
            <div class="stat-number">{{ userStats.following || 0 }}</div>
            <div class="stat-label">关注</div>
          </div>
          <div class="stat-item">
            <div class="stat-number">{{ userStats.followers || 0 }}</div>
            <div class="stat-label">关注者</div>
          </div>
        </div>
      </div>
      
      <div v-else class="login-register">
        <div class="login-message">登录后，你的动态将显示在这里</div>
        <div class="auth-buttons">
          <router-link to="/login" class="btn-login">登录</router-link>
          <router-link to="/register" class="btn-register">注册</router-link>
        </div>
      </div>
    </div>
    
    <!-- 精选沸点 -->
    <div class="featured-section" v-if="featuredMoments.length > 0">
      <div class="section-header">
        <h3>精选沸点</h3>
      </div>
      
      <div class="featured-list">
        <div v-for="(item, index) in featuredMoments" :key="index" class="featured-item">
          <div class="item-title">{{ item.title }}</div>
          <div class="item-stats">{{ item.posts }}篇 · {{ item.comments }}评论</div>
        </div>
      </div>
    </div>
    
    <!-- 推荐话题 -->
    <div class="topics-section" v-if="recommendedTopics.length > 0">
      <div class="section-header">
        <h3>推荐话题</h3>
        <a class="refresh-link" @click="refreshTopics">
          <span>换一换</span>
        </a>
      </div>
      
      <div class="topics-list">
        <div v-for="(topic, index) in recommendedTopics" :key="index" class="topic-item">
          <span class="topic-tag">#{{ topic.name }}#</span>
          <span class="topic-count">{{ formatCount(topic.count) }}</span>
        </div>
      </div>
    </div>
  </div>
</template>

<script lang="ts">
import { defineComponent, ref, onMounted } from 'vue';
import { useUserStore } from '../../stores/userStore';

export default defineComponent({
  name: 'MomentSidebarRight',
  setup() {
    const userStore = useUserStore();
    const featuredMoments = ref<{ title: string; posts: number; comments: number }[]>([]);
    const recommendedTopics = ref<{ name: string; count: number }[]>([]);
    
    // 用户统计数据
    const userStats = ref({
      moments: 0,
      circles: 0,
      following: 0,
      followers: 0
    });
    
    // 格式化数字显示（如：1500 -> 1.5k, 1500000 -> 1.5m）
    const formatCount = (count: number): string => {
      if (count >= 1000000) {
        return (Math.floor(count / 100000) / 10) + 'm';
      } else if (count >= 1000) {
        return (Math.floor(count / 100) / 10) + 'k';
      }
      return count.toString();
    };
    
    // 刷新话题列表
    const refreshTopics = () => {
      // 这里会调用API刷新话题，现在是空实现
      console.log('刷新话题列表');
    };
    
    // 获取用户统计数据
    const fetchUserStats = async () => {
      if (userStore.currentUser) {
        try {
          // 这里应该调用API获取用户统计数据
          // 暂时使用模拟数据
          userStats.value = {
            moments: 0,
            circles: 0,
            following: 0,
            followers: 0
          };
        } catch (error) {
          console.error('获取用户统计数据失败', error);
        }
      }
    };
    
    onMounted(() => {
      fetchUserStats();
    });
    
    return {
      userStore,
      featuredMoments,
      recommendedTopics,
      userStats,
      formatCount,
      refreshTopics
    };
  }
});
</script>

<style scoped>
.sidebar-right {
  display: flex;
  flex-direction: column;
  gap: 20px;
  width: 100%;
}

/* 用户卡片 */
.user-card {
  background-color: white;
  border-radius: 8px;
  overflow: hidden;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
}

.user-header {
  padding: 20px;
  display: flex;
  align-items: center;
  gap: 10px;
}

.avatar {
  width: 50px;
  height: 50px;
  border-radius: 50%;
  overflow: hidden;
}

.avatar img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.user-name {
  font-size: 16px;
  font-weight: 500;
  color: #333;
}

.user-stats {
  display: flex;
  border-top: 1px solid #f0f0f0;
}

.stat-item {
  flex: 1;
  text-align: center;
  padding: 10px 0;
}

.stat-number {
  font-size: 18px;
  font-weight: 600;
  color: #333;
}

.stat-label {
  font-size: 12px;
  color: #8c8c8c;
  margin-top: 4px;
}

/* 登录注册区域 */
.login-register {
  padding: 20px;
  text-align: center;
}

.login-message {
  font-size: 14px;
  color: #8c8c8c;
  margin-bottom: 15px;
}

.auth-buttons {
  display: flex;
  justify-content: center;
  gap: 15px;
}

.btn-login, .btn-register {
  padding: 8px 16px;
  border-radius: 4px;
  font-size: 14px;
  text-decoration: none;
  font-weight: 500;
  transition: all 0.3s;
}

.btn-login {
  background-color: #fff;
  color: #1890ff;
  border: 1px solid #1890ff;
}

.btn-register {
  background-color: #1890ff;
  color: #fff;
  border: 1px solid #1890ff;
}

.btn-login:hover, .btn-register:hover {
  opacity: 0.8;
}

/* 精选沸点 */
.featured-section, .topics-section {
  background-color: white;
  border-radius: 8px;
  overflow: hidden;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
}

.section-header {
  padding: 15px;
  border-bottom: 1px solid #f0f0f0;
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.section-header h3 {
  font-size: 16px;
  font-weight: 500;
  color: #333;
  margin: 0;
}

.refresh-link {
  color: #8c8c8c;
  font-size: 14px;
  cursor: pointer;
}

.refresh-link:hover {
  color: #1890ff;
}

.featured-list {
  padding: 0 15px;
}

.featured-item {
  padding: 15px 0;
  border-bottom: 1px solid #f0f0f0;
}

.featured-item:last-child {
  border-bottom: none;
}

.item-title {
  font-size: 14px;
  line-height: 1.5;
  color: #333;
  margin-bottom: 5px;
}

.item-stats {
  font-size: 12px;
  color: #8c8c8c;
}

/* 推荐话题 */
.topics-list {
  padding: 15px;
}

.topic-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 10px 0;
  font-size: 14px;
}

.topic-tag {
  color: #1890ff;
}

.topic-count {
  color: #8c8c8c;
  font-size: 12px;
}
</style> 