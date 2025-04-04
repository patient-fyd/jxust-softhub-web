<template>
  <div class="profile-container">
    <div class="profile-header">
      <div class="profile-avatar">
        <Icon icon="mdi:account-circle" width="80" height="80" />
      </div>
      <div class="profile-info">
        <h1>{{ userStore.currentUser?.name || '用户名' }}</h1>
        <p class="user-id">用户ID: {{ userStore.currentUser?.userId || '-' }}</p>
        <p class="join-date">加入时间: 2023年10月</p>
      </div>
    </div>

    <div class="profile-tabs">
      <div class="tab active">个人资料</div>
      <div class="tab">我的文章</div>
      <div class="tab">我的收藏</div>
      <div class="tab">消息通知</div>
    </div>

    <div class="profile-content">
      <div class="profile-section">
        <h2>基本信息</h2>
        <div class="info-item">
          <span class="label">用户名:</span>
          <span class="value">{{ userStore.currentUser?.userName || '-' }}</span>
        </div>
        <div class="info-item">
          <span class="label">姓名:</span>
          <span class="value">{{ userStore.currentUser?.name || '-' }}</span>
        </div>
        <div class="info-item">
          <span class="label">角色:</span>
          <span class="value">{{ getRoleName(userStore.currentUser?.roleId) }}</span>
        </div>
      </div>

      <div class="profile-section">
        <h2>最近活动</h2>
        <p class="empty-state">暂无活动记录</p>
      </div>
    </div>
  </div>
</template>

<script lang="ts">
import { defineComponent } from 'vue';
import { useUserStore } from '../stores/userStore';
import { Icon } from '@iconify/vue';

export default defineComponent({
  name: 'ProfileView',
  components: {
    Icon
  },
  setup() {
    const userStore = useUserStore();

    // 如果用户未登录，可以在这里添加重定向逻辑
    
    // 根据角色ID获取角色名称
    const getRoleName = (roleId?: number) => {
      if (!roleId) return '-';
      
      const roles: Record<number, string> = {
        1: '管理员',
        2: '普通会员',
        3: '协会成员'
      };
      
      return roles[roleId] || '未知角色';
    };

    return {
      userStore,
      getRoleName
    };
  }
});
</script>

<style scoped>
.profile-container {
  max-width: 1000px;
  margin: 30px auto;
  padding: 0 20px;
}

.profile-header {
  display: flex;
  align-items: center;
  padding: 30px;
  background-color: #f0f5ff;
  border-radius: 12px;
  margin-bottom: 24px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.05);
}

.profile-avatar {
  color: #4785ff;
  margin-right: 24px;
}

.profile-info h1 {
  margin: 0 0 8px 0;
  color: #1e40af;
  font-size: 1.8rem;
}

.user-id, .join-date {
  margin: 4px 0;
  color: #6b7280;
  font-size: 0.9rem;
}

.profile-tabs {
  display: flex;
  border-bottom: 1px solid #e5e7eb;
  margin-bottom: 24px;
}

.tab {
  padding: 12px 24px;
  cursor: pointer;
  font-weight: 500;
  color: #6b7280;
  position: relative;
  transition: color 0.3s ease;
}

.tab:hover {
  color: #4785ff;
}

.tab.active {
  color: #1e40af;
}

.tab.active::after {
  content: '';
  position: absolute;
  bottom: -1px;
  left: 0;
  width: 100%;
  height: 2px;
  background-color: #1e40af;
}

.profile-content {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 24px;
}

.profile-section {
  background-color: white;
  border-radius: 8px;
  padding: 24px;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
}

.profile-section h2 {
  margin-top: 0;
  margin-bottom: 16px;
  color: #1e40af;
  font-size: 1.2rem;
  border-bottom: 1px solid #e5e7eb;
  padding-bottom: 8px;
}

.info-item {
  display: flex;
  margin-bottom: 12px;
}

.label {
  width: 80px;
  color: #6b7280;
}

.value {
  font-weight: 500;
  color: #111827;
}

.empty-state {
  color: #9ca3af;
  font-style: italic;
  text-align: center;
  padding: 20px 0;
}

@media (max-width: 768px) {
  .profile-content {
    grid-template-columns: 1fr;
  }
  
  .profile-header {
    flex-direction: column;
    text-align: center;
  }
  
  .profile-avatar {
    margin-right: 0;
    margin-bottom: 16px;
  }
  
  .profile-tabs {
    overflow-x: auto;
    white-space: nowrap;
  }
}
</style>