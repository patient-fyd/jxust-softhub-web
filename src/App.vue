<script setup lang="ts">
import NavBar from './components/NavBar.vue'
import Footer from './components/Footer.vue'
import { onMounted } from 'vue'
import { useUserStore } from './stores/userStore'
import { useJoinStore } from './stores/joinStore'

const userStore = useUserStore()
const joinStore = useJoinStore()

onMounted(async () => {
  // 如果用户已登录，则加载其加入申请状态
  if (userStore.currentUser) {
    await joinStore.fetchApplicationStatus()
  }
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
