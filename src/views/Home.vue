<template>
  <div class="home-container">
    <div class="hero-section">
      <h1>江西应用科技学院软件协会</h1>
      <p>探索技术，共同成长</p>
    </div>
    
    <div class="features-section">
      <div class="feature-card">
        <h3>协会活动</h3>
        <p>参与各类技术交流活动，拓展你的技术视野</p>
      </div>
      <div class="feature-card">
        <h3>技术分享</h3>
        <p>定期举办各类技术讲座和分享会</p>
      </div>
      <div class="feature-card">
        <h3>项目实践</h3>
        <p>参与实际项目开发，提升实战能力</p>
      </div>
    </div>
  </div>
</template>

<script lang="ts">
import { defineComponent } from 'vue';

export default defineComponent({
  name: 'HomeView',
  components: {},
  setup() {
    return {};
  },
});
</script>

<style scoped>
.home-container {
  padding: 20px;
  max-width: 1200px;
  margin: 0 auto;
}

.hero-section {
  text-align: center;
  padding: 60px 20px;
  background-color: rgba(240, 245, 255, 0.5);
  border-radius: 10px;
  margin-bottom: 40px;
}

.hero-section h1 {
  font-size: 2.5rem;
  color: #1e40af;
  margin-bottom: 20px;
}

.hero-section p {
  font-size: 1.2rem;
  color: #4b5563;
}

.features-section {
  display: flex;
  justify-content: space-between;
  gap: 20px;
  margin-top: 40px;
}

.feature-card {
  flex: 1;
  background-color: #fff;
  padding: 30px;
  border-radius: 8px;
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.05);
  transition: transform 0.3s ease;
}

.feature-card:hover {
  transform: translateY(-5px);
}

.feature-card h3 {
  color: #1e40af;
  margin-bottom: 15px;
  font-size: 1.2rem;
}

.feature-card p {
  color: #6b7280;
  line-height: 1.6;
}

@media (max-width: 768px) {
  .features-section {
    flex-direction: column;
  }
}
</style> 