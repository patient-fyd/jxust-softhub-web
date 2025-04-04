<script setup lang="ts">
import NavBar from './components/NavBar.vue'
import Footer from './components/Footer.vue'
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
