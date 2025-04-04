<template>
  <div class="hero-section">
    <h1>江西应用科技学院软件协会</h1>
    <p>探索技术，共同成长</p>
    <div class="hero-buttons">
      <router-link to="/join" class="primary-btn">加入我们</router-link>
      <router-link to="/activities" class="secondary-btn">查看活动</router-link>
    </div>
  </div>
</template>

<script lang="ts">
import { defineComponent } from 'vue';

export default defineComponent({
  name: 'HeroSection'
});
</script>

<style scoped>
.hero-section {
  text-align: center;
  padding: 80px 20px;
  background-color: rgba(240, 245, 255, 0.7);
  border-radius: 10px;
  margin-bottom: 40px;
  position: relative;
  overflow: hidden;
  box-shadow: 0 4px 15px rgba(0, 0, 0, 0.05);
}

.hero-section h1 {
  font-size: 2.5rem;
  color: #1e40af;
  margin-bottom: 20px;
}

.hero-section p {
  font-size: 1.2rem;
  color: #4b5563;
  margin-bottom: 30px;
}

.hero-buttons {
  display: flex;
  justify-content: center;
  gap: 15px;
  margin-top: 20px;
}

.primary-btn, .secondary-btn {
  padding: 12px 24px;
  border-radius: 6px;
  font-weight: 600;
  transition: all 0.3s ease;
  text-decoration: none;
}

.primary-btn {
  background-color: #1e40af;
  color: white;
}

.primary-btn:hover {
  background-color: #1e3a8a;
  transform: translateY(-2px);
}

.secondary-btn {
  background-color: white;
  color: #1e40af;
  border: 2px solid #1e40af;
}

.secondary-btn:hover {
  background-color: #f0f5ff;
  transform: translateY(-2px);
}

@media (max-width: 768px) {
  .hero-section {
    padding: 60px 20px;
  }
  
  .hero-section h1 {
    font-size: 2rem;
  }
}

@media (max-width: 480px) {
  .hero-buttons {
    flex-direction: column;
    gap: 10px;
  }
  
  .primary-btn, .secondary-btn {
    width: 100%;
  }
}
</style>