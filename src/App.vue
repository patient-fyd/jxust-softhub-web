<script setup lang="ts">
import { ref, onMounted, computed } from 'vue'
import { useRoute } from 'vue-router'
import NavBar from './components/layout/NavBar.vue'
import Footer from './components/layout/Footer.vue'
import { useUserStore } from './stores/userStore'
import { useJoinStore } from './stores/joinStore'

const userStore = useUserStore()
const joinStore = useJoinStore()
const route = useRoute()
const loading = ref(true)

// 计算属性：判断当前路由是否为全屏模式
const isFullscreenRoute = computed(() => {
  return route.meta.fullscreen === true
})

const init = async () => {
  try {
    // 加载用户信息
    if (localStorage.getItem('token')) {
      try {
        // 尝试获取用户信息
        const userResponse = await fetch('/api/user/current', {
          headers: {
            'Authorization': `Bearer ${localStorage.getItem('token')}`
          }
        });
        
        if (userResponse.status === 401) {
          // Token过期或无效
          localStorage.removeItem('token');
          localStorage.removeItem('user');
        }
      } catch (error) {
        console.error('获取用户信息失败:', error);
      }
    }
    
    // 检查入会申请状态
    if (userStore.isLoggedIn) {
      await joinStore.fetchApplicationStatus().catch((error: any) => {
        console.error('获取申请状态失败:', error);
      });
    }
  } catch (error: any) {
    console.error('初始化应用失败:', error);
  } finally {
    loading.value = false;
  }
};

onMounted(() => {
  init();
})
</script>

<template>
  <NavBar v-if="!isFullscreenRoute" />
  <router-view class="main-content" />
  <Footer v-if="!isFullscreenRoute" />
</template>

<style>
body {
  margin: 0;
  padding: 0;
  font-family: 'PingFang SC', 'Microsoft YaHei', sans-serif;
  box-sizing: border-box;
}

/* 确保下拉菜单能够正确显示 */
.dropdown-menu {
  position: fixed !important;
  z-index: 99999 !important;
}

.app-container {
  width: 100%;
  min-height: 100vh;
  display: flex;
  flex-direction: column;
}

.content-container {
  padding: 20px;
  flex: 1;
  display: flex;
  flex-direction: column;
}

.main-content {
  min-height: calc(100vh - 64px - 104px);
}

/* 当路由为全屏模式时，内容区域占满整个视口 */
:deep(.main-content) {
  min-height: v-bind('isFullscreenRoute ? "100vh" : "calc(100vh - 64px - 104px)"');
  display: flex;
  flex-direction: column;
}
</style>
