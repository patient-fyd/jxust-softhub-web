<template>
  <div class="home-container">
    <!-- 英雄区域 -->
    <div class="hero-section">
      <h1>江西应用科技学院软件协会</h1>
      <p>探索技术，共同成长</p>
      <div class="hero-buttons">
        <router-link to="/join" class="primary-btn">加入我们</router-link>
        <router-link to="/activities" class="secondary-btn">查看活动</router-link>
      </div>
    </div>
    
    <!-- 公告与通知区域 -->
    <div class="announcement-section">
      <div class="section-header">
        <h2>最新公告与通知</h2>
        <router-link to="/news" class="view-all">查看全部</router-link>
      </div>
      <div class="announcement-cards">
        <div class="announcement-card">
          <div class="card-date">2023-12-15</div>
          <h3>2024年春季招新开始啦！</h3>
          <p>欢迎各位对软件开发感兴趣的同学加入我们的大家庭...</p>
          <router-link to="/news/1" class="read-more">阅读更多</router-link>
        </div>
        <div class="announcement-card">
          <div class="card-date">2023-12-10</div>
          <h3>Web前端技术分享会</h3>
          <p>本周六下午2点，我们将在教学楼B401举办Web前端技术分享会...</p>
          <router-link to="/news/2" class="read-more">阅读更多</router-link>
        </div>
        <div class="announcement-card">
          <div class="card-date">2023-12-05</div>
          <h3>协会年度总结大会</h3>
          <p>2023年即将结束，我们将举办年度总结大会，回顾这一年的收获...</p>
          <router-link to="/news/3" class="read-more">阅读更多</router-link>
        </div>
      </div>
    </div>
    
    <!-- 功能模块区域 -->
    <div class="modules-section">
      <h2 class="section-title">功能导航</h2>
      
      <!-- 第一行：高频使用功能 -->
      <div class="module-row">
        <router-link to="/activities" class="module-card">
          <div class="module-icon">📅</div>
          <h3>活动预告</h3>
          <p>查看近期即将举办的活动信息</p>
        </router-link>
        <router-link to="/join" class="module-card">
          <div class="module-icon">🚀</div>
          <h3>会员申请</h3>
          <p>提交入会申请，加入我们的大家庭</p>
        </router-link>
        <router-link to="/members" class="module-card">
          <div class="module-icon">👥</div>
          <h3>成员风采</h3>
          <p>了解协会优秀成员的风采与成就</p>
        </router-link>
      </div>
      
      <!-- 第二行：次高频使用功能 -->
      <div class="module-row">
        <router-link to="/blog" class="module-card">
          <div class="module-icon">📝</div>
          <h3>技术博客</h3>
          <p>阅读成员分享的技术文章和经验</p>
        </router-link>
        <router-link to="/resources" class="module-card">
          <div class="module-icon">📚</div>
          <h3>资料下载</h3>
          <p>获取协会活动材料和学习资源</p>
        </router-link>
        <router-link to="/gallery" class="module-card">
          <div class="module-icon">🖼️</div>
          <h3>活动相册</h3>
          <p>浏览协会活动的精彩瞬间</p>
        </router-link>
      </div>
    </div>
    
    <!-- 协会简介区域 -->
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
    
    <!-- 互动交流区域 -->
    <div class="interaction-section">
      <div class="interaction-card">
        <div class="interaction-icon">💬</div>
        <h3>留言板</h3>
        <p>有问题？有建议？在这里留言与我们交流</p>
        <router-link to="/forum" class="interaction-btn">去留言</router-link>
      </div>
      <div class="interaction-card">
        <div class="interaction-icon">❓</div>
        <h3>常见问题</h3>
        <p>查看关于协会的常见问题解答</p>
        <router-link to="/faq" class="interaction-btn">查看FAQ</router-link>
      </div>
    </div>
  </div>
</template>

<script lang="ts">
import { defineComponent, ref } from 'vue';
import { useRouter } from 'vue-router';

export default defineComponent({
  name: 'HomeView',
  components: {},
  setup() {
    const router = useRouter();
    
    // 这里可以添加获取最新公告、活动等数据的方法
    // 例如：从API获取最新公告数据
    // const announcements = ref([]);
    // const fetchAnnouncements = async () => {
    //   // 从API获取数据
    //   // announcements.value = await getAnnouncements();
    // };
    // onMounted(fetchAnnouncements);
    
    return {
      // 返回需要在模板中使用的数据和方法
    };
  },
});
</script>

<style scoped>
.home-container {
  padding: 20px;
  max-width: 1200px;
  margin: 0 auto;
}

/* 英雄区域样式 */
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

/* 公告区域样式 */
.announcement-section {
  margin-bottom: 50px;
}

.section-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;
}

.section-header h2 {
  color: #1e40af;
  font-size: 1.8rem;
  margin: 0;
}

.view-all {
  color: #4b5563;
  text-decoration: none;
  font-weight: 500;
  transition: color 0.3s ease;
}

.view-all:hover {
  color: #1e40af;
}

.announcement-cards {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
  gap: 20px;
}

.announcement-card {
  background-color: white;
  border-radius: 8px;
  padding: 20px;
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.05);
  transition: transform 0.3s ease, box-shadow 0.3s ease;
}

.announcement-card:hover {
  transform: translateY(-5px);
  box-shadow: 0 10px 15px rgba(0, 0, 0, 0.1);
}

.card-date {
  color: #6b7280;
  font-size: 0.9rem;
  margin-bottom: 10px;
}

.announcement-card h3 {
  color: #1e40af;
  margin-bottom: 10px;
  font-size: 1.2rem;
}

.announcement-card p {
  color: #4b5563;
  margin-bottom: 15px;
  line-height: 1.5;
}

.read-more {
  color: #1e40af;
  text-decoration: none;
  font-weight: 500;
  font-size: 0.9rem;
  display: inline-block;
  transition: color 0.3s ease;
}

.read-more:hover {
  color: #3b82f6;
}

/* 功能模块区域样式 */
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

/* 关于我们区域样式 */
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

/* 互动交流区域样式 */
.interaction-section {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
  gap: 20px;
  margin-bottom: 50px;
}

.interaction-card {
  background-color: white;
  border-radius: 8px;
  padding: 30px;
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.05);
  transition: transform 0.3s ease;
  text-align: center;
}

.interaction-card:hover {
  transform: translateY(-5px);
}

.interaction-icon {
  font-size: 2.5rem;
  margin-bottom: 15px;
}

.interaction-card h3 {
  color: #1e40af;
  margin-bottom: 15px;
  font-size: 1.2rem;
}

.interaction-card p {
  color: #6b7280;
  line-height: 1.6;
  margin-bottom: 20px;
}

.interaction-btn {
  display: inline-block;
  padding: 8px 16px;
  background-color: #1e40af;
  color: white;
  text-decoration: none;
  border-radius: 4px;
  font-weight: 500;
  transition: background-color 0.3s ease;
}

.interaction-btn:hover {
  background-color: #1e3a8a;
}

/* 响应式设计 */
@media (max-width: 992px) {
  .about-section {
    grid-template-columns: 1fr;
  }
  
  .about-image {
    display: none;
  }
}

@media (max-width: 768px) {
  .module-row, .announcement-cards, .interaction-section {
    grid-template-columns: 1fr;
  }
  
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