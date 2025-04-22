<template>
  <div class="modules-section">
    <h2 class="section-title">功能导航</h2>
    
    <!-- 第一行：高频使用功能 -->
    <div class="module-row">
      <router-link 
        v-for="module in filteredTopModules" 
        :key="module.title" 
        :to="module.link" 
        class="module-card"
        :class="{ 'status-pending': module.isPending, 'status-approved': module.isApproved, 'status-rejected': module.isRejected }"
      >
        <div class="module-icon">{{ module.icon }}</div>
        <h3>{{ module.title }}</h3>
        <p>{{ module.description }}</p>
      </router-link>
    </div>
    
    <!-- 第二行：次高频使用功能 -->
    <div class="module-row">
      <router-link v-for="module in secondaryModules" :key="module.title" :to="module.link" class="module-card">
        <div class="module-icon">{{ module.icon }}</div>
        <h3>{{ module.title }}</h3>
        <p>{{ module.description }}</p>
      </router-link>
    </div>
  </div>
</template>

<script lang="ts">
import { defineComponent, computed, onMounted, watch } from 'vue';
import type { Module } from '../../types/home';
import { useUserStore } from '../../stores/userStore';
import { useJoinStore } from '../../stores/joinStore';

export default defineComponent({
  name: 'ModulesSection',
  setup() {
    const userStore = useUserStore();
    const joinStore = useJoinStore();
    
    // 初始化时加载申请状态
    onMounted(async () => {
      if (userStore.currentUser) {
        await joinStore.fetchApplicationStatus();
      }
    });
    
    // 当用户状态改变时重新获取申请状态
    watch(() => userStore.currentUser, async (newUser) => {
      if (newUser) {
        await joinStore.fetchApplicationStatus();
      } else {
        joinStore.reset();
      }
    });
    
    // 基础模块
    const baseTopModules: Module[] = [
      {
        icon: '📅',
        title: '活动预告',
        description: '查看近期即将举办的活动信息',
        link: '/activities'
      },
      {
        icon: '🚀',
        title: '会员申请',
        description: '提交入会申请，加入我们的大家庭',
        link: '/join',
        type: 'join'
      },
      {
        icon: '👥',
        title: '成员风采',
        description: '了解协会优秀成员的风采与成就',
        link: '/members'
      }
    ];
    
    // 根据用户角色和申请状态处理模块
    const filteredTopModules = computed(() => {
      return baseTopModules.map(module => {
        // 如果不是会员申请模块，直接返回原模块
        if (module.type !== 'join') {
          return module;
        }
        
        // 如果用户未登录，显示常规加入申请入口
        if (!userStore.currentUser) {
          return module;
        }
        
        // 如果用户已是会员，不显示加入入口
        if (joinStore.isMember) {
          return {
            ...module,
            hidden: true
          };
        }
        
        // 如果用户已提交申请
        if (joinStore.hasApplied) {
          // 申请待审核
          if (joinStore.isPending) {
            return {
              ...module,
              icon: '⏳',
              title: '申请进度',
              description: '你的申请正在审核中，点击查看详情',
              link: '/join/application-status',
              isPending: true
            };
          }
          
          // 申请已通过
          else if (joinStore.isApproved) {
            return {
              ...module,
              icon: '✅',
              title: '申请通过',
              description: '恭喜！你的申请已通过，点击查看详情',
              link: '/join/application-status',
              isApproved: true
            };
          }
          
          // 申请被拒绝
          else if (joinStore.isRejected) {
            return {
              ...module,
              icon: '❌',
              title: '申请未通过',
              description: '你的申请未通过，点击查看详情',
              link: '/join/application-status',
              isRejected: true
            };
          }
        }
        
        // 默认返回原模块
        return module;
      }).filter(module => !module.hidden);
    });

    // 次级模块
    const secondaryModules: Module[] = [
      {
        icon: '📝',
        title: '技术博客',
        description: '阅读成员分享的技术文章和经验',
        link: '/blog'
      },
      {
        icon: '📚',
        title: '资料下载',
        description: '获取协会活动材料和学习资源',
        link: '/resources'
      },
      {
        icon: '🖼️',
        title: '活动相册',
        description: '浏览协会活动的精彩瞬间',
        link: '/gallery'
      }
    ];
    
    return {
      filteredTopModules,
      secondaryModules
    };
  }
});
</script>

<style scoped>
.modules-section {
  margin-bottom: 50px;
}

.section-title {
  color: #1e40af;
  font-size: 1.8rem;
  margin-bottom: 30px;
  text-align: center;
}

.module-row {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
  gap: 20px;
  margin-bottom: 20px;
}

.module-card {
  background-color: white;
  border-radius: 8px;
  padding: 25px;
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.05);
  transition: transform 0.3s ease, box-shadow 0.3s ease;
  text-decoration: none;
  display: flex;
  flex-direction: column;
  align-items: center;
  text-align: center;
}

.module-card:hover {
  transform: translateY(-5px);
  box-shadow: 0 10px 15px rgba(0, 0, 0, 0.1);
}

.module-icon {
  font-size: 2.5rem;
  margin-bottom: 15px;
}

.module-card h3 {
  color: #1e40af;
  margin-bottom: 10px;
  font-size: 1.2rem;
}

.module-card p {
  color: #6b7280;
  line-height: 1.5;
}

/* 不同状态的样式 */
.module-card.status-pending {
  border-left: 4px solid #f59e0b;
}

.module-card.status-pending h3 {
  color: #f59e0b;
}

.module-card.status-approved {
  border-left: 4px solid #10b981;
}

.module-card.status-approved h3 {
  color: #10b981;
}

.module-card.status-rejected {
  border-left: 4px solid #ef4444;
}

.module-card.status-rejected h3 {
  color: #ef4444;
}

@media (max-width: 768px) {
  .module-row {
    grid-template-columns: 1fr;
  }
}
</style>