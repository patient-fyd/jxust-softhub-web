<script setup lang="ts">
import NavBar from './components/NavBar.vue'
import Footer from './components/Footer.vue'
import { onMounted, ref } from 'vue'
import { useUserStore } from './stores/userStore'
import { useJoinStore } from './stores/joinStore'

const userStore = useUserStore()
const joinStore = useJoinStore()
const loading = ref(true)

const init = async () => {
  try {
    // 加载用户信息
    if (userStore.token) {
      await userStore.fetchCurrentUser().catch(error => {
        console.error('获取用户信息失败:', error);
        // 如果获取用户信息失败，清除token，避免重复请求
        if (error.response && error.response.status === 401) {
          userStore.resetUserInfo();
        }
      });
    }
    
    // 检查入会申请状态
    if (userStore.isLoggedIn) {
      await joinStore.fetchApplicationStatus().catch(error => {
        console.error('获取申请状态失败:', error);
      });
    }
  } catch (error) {
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
  <div class="app-container">
    <NavBar />
    <div class="content-container">
      <router-view />
    </div>
    <Footer />
  </div>
</template>

<style>
body {
  margin: 0;
  padding: 0;
  font-family: 'PingFang SC', 'Microsoft YaHei', sans-serif;
  box-sizing: border-box;
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
</style>
