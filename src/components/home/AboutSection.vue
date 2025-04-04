<template>
  <div class="about-section">
    <div class="about-content">
      <h2>关于我们</h2>
      <p>江西应用科技学院软件协会成立于2015年，是由一群热爱编程、热爱技术的学生自发组织的技术社团。我们致力于为对软件开发感兴趣的同学提供一个学习交流的平台，通过举办各类技术讲座、项目实践、比赛等活动，帮助成员提升专业技能，拓展技术视野。</p>
      <p>我们的宗旨是"探索技术，共同成长"，希望每一位成员都能在协会中找到志同道合的伙伴，共同进步，共同成长。</p>
      <router-link to="/about" class="about-btn">了解更多</router-link>
    </div>
    <div class="about-image">
      <!-- 这里可以放置协会的照片或插图 -->
    </div>
  </div>
</template>

<script lang="ts">
import { defineComponent } from 'vue';

export default defineComponent({
  name: 'AboutSection'
});
</script>

<style scoped>
.about-section {
  display: grid;
  grid-template-columns: 3fr 2fr;
  gap: 30px;
  margin-bottom: 50px;
  background-color: #f9fafb;
  border-radius: 10px;
  padding: 40px;
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.05);
}

.about-content h2 {
  color: #1e40af;
  font-size: 1.8rem;
  margin-bottom: 20px;
}

.about-content p {
  color: #4b5563;
  line-height: 1.7;
  margin-bottom: 15px;
}

.about-btn {
  display: inline-block;
  margin-top: 15px;
  padding: 10px 20px;
  background-color: #1e40af;
  color: white;
  text-decoration: none;
  border-radius: 6px;
  font-weight: 500;
  transition: background-color 0.3s ease;
}

.about-btn:hover {
  background-color: #1e3a8a;
}

.about-image {
  background-color: #e5e7eb;
  border-radius: 8px;
  min-height: 250px;
}

@media (max-width: 992px) {
  .about-section {
    grid-template-columns: 1fr;
  }
  
  .about-image {
    display: none;
  }
}
</style>