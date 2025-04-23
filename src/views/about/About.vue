<template>
  <div class="about-container">
    <!-- 页面标题区域 -->
    <div class="page-header">
      <h1>关于我们</h1>
      <div class="header-underline"></div>
    </div>

    <!-- 协会概况区域 -->
    <section class="about-section">
      <div class="section-content">
        <h2>协会概况</h2>
        <p>江西应用科技学院软件协会成立于2015年，是由一群热爱编程、热爱技术的学生自发组织的技术社团。我们致力于为对软件开发感兴趣的同学提供一个学习交流的平台，通过举办各类技术讲座、项目实践、比赛等活动，帮助成员提升专业技能，拓展技术视野。</p>
        <p>目前协会拥有100余名正式会员，分布在前端开发、后端开发、移动端开发、人工智能、UI设计等多个技术方向。协会由主席团、技术部、宣传部、组织部等部门组成，各部门分工合作，共同推动协会的发展。</p>
      </div>
      <div class="section-image">
        <img src="@/assets/协会logo.jpg" alt="软件协会标志" class="about-logo" />
      </div>
    </section>

    <!-- 使命与愿景区域 -->
    <section class="about-section reverse">
      <div class="section-content">
        <h2>使命与愿景</h2>
        <div class="mission-vision">
          <div class="mission">
            <h3>使命</h3>
            <p>连接对技术有热情的人，创造交流与成长的平台，培养未来的技术人才。</p>
          </div>
          <div class="vision">
            <h3>愿景</h3>
            <p>成为江西应用科技学院最具影响力的技术社团，打造一个开放、包容、创新的技术社区。</p>
          </div>
        </div>
      </div>
      <div class="section-image">
        <div class="image-placeholder">
          <!-- 展示协会使命与愿景的图片 -->
          <img src="@/views/about/mission-vision.svg" alt="软件协会使命与愿景" class="mission-vision-img" />
        </div>
      </div>
    </section>

    <!-- 核心价值观区域 -->
    <section class="about-section values-section">
      <div class="values-container">
        <h2>核心价值观</h2>
        <div class="values-grid">
          <div class="value-card">
            <div class="value-icon">💡</div>
            <h3>创新</h3>
            <p>鼓励尝试新技术，探索新方向，勇于突破边界</p>
          </div>
          <div class="value-card">
            <div class="value-icon">🤝</div>
            <h3>协作</h3>
            <p>团队合作，相互支持，共同解决问题</p>
          </div>
          <div class="value-card">
            <div class="value-icon">📚</div>
            <h3>学习</h3>
            <p>持续学习，不断进步，保持对技术的好奇心</p>
          </div>
          <div class="value-card">
            <div class="value-icon">🌱</div>
            <h3>成长</h3>
            <p>关注个人成长，帮助他人成长，共同进步</p>
          </div>
        </div>
      </div>
    </section>

    <!-- 发展历程区域 -->
    <section class="about-section">
      <div class="section-content full-width">
        <h2>发展历程</h2>
        <div class="timeline">
          <div class="timeline-item">
            <div class="timeline-marker">2015</div>
            <div class="timeline-content">
              <h3>协会成立</h3>
              <p>江西应用科技学院软件协会正式成立，首届会员20人</p>
            </div>
          </div>
          <div class="timeline-item">
            <div class="timeline-marker">2017</div>
            <div class="timeline-content">
              <h3>首届软件开发大赛</h3>
              <p>成功举办首届校内软件开发大赛，参赛人数超过50人</p>
            </div>
          </div>
          <div class="timeline-item">
            <div class="timeline-marker">2019</div>
            <div class="timeline-content">
              <h3>技术部门细分</h3>
              <p>技术部门细分为前端、后端、移动端、人工智能四个方向</p>
            </div>
          </div>
          <div class="timeline-item">
            <div class="timeline-marker">2021</div>
            <div class="timeline-content">
              <h3>协会规模扩大</h3>
              <p>协会会员突破100人，成为学校最大的技术类社团</p>
            </div>
          </div>
          <div class="timeline-item">
            <div class="timeline-marker">2025</div>
            <div class="timeline-content">
              <h3>官方网站上线</h3>
              <p>协会官方网站正式上线，提供更全面的服务</p>
            </div>
          </div>
        </div>
      </div>
    </section>

    <!-- 联系我们区域 -->
    <section class="about-section contact-section">
      <div class="section-content">
        <h2>联系我们</h2>
        <div class="contact-info">
          <div class="contact-item">
            <div class="contact-icon">📍</div>
            <p>江西应用科技学院3号楼307室</p>
          </div>
          <div class="contact-item">
            <div class="contact-icon">📧</div>
            <p>softhub@jxust.edu.cn</p>
          </div>
          <div class="contact-item">
            <div class="contact-icon">📱</div>
            <p>微信公众号：JXUST软件协会</p>
          </div>
        </div>
        <div class="join-us">
          <router-link to="/join" class="join-btn">加入我们</router-link>
        </div>
      </div>
    </section>
  </div>
</template>

<script lang="ts">
import { defineComponent } from 'vue';

export default defineComponent({
  name: 'About'
});
</script>

<style scoped>
.about-container {
  max-width: 1200px;
  margin: 0 auto;
  padding: 40px 20px;
}

.page-header {
  text-align: center;
  margin-bottom: 50px;
}

.page-header h1 {
  font-size: 2.5rem;
  color: #1e40af;
  margin-bottom: 15px;
}

.header-underline {
  height: 4px;
  width: 80px;
  background-color: #1e40af;
  margin: 0 auto;
}

.about-section {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 40px;
  margin-bottom: 80px;
  align-items: center;
}

.about-section.reverse {
  grid-template-columns: 1fr 1fr;
  direction: rtl;
}

.about-section.reverse .section-content {
  direction: ltr;
}

.section-content {
  padding: 20px;
}

.section-content h2 {
  color: #1e40af;
  font-size: 1.8rem;
  margin-bottom: 25px;
  position: relative;
}

.section-content p {
  color: #4b5563;
  line-height: 1.7;
  margin-bottom: 15px;
  font-size: 1.05rem;
}

.section-image {
  display: flex;
  justify-content: center;
  align-items: center;
}

.about-logo {
  max-width: 100%;
  border-radius: 8px;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.1);
}

.image-placeholder {
  width: 100%;
  height: 300px;
  background-color: #e5e7eb;
  border-radius: 8px;
  display: flex;
  justify-content: center;
  align-items: center;
  color: #9ca3af;
  font-size: 1.1rem;
}

.mission-vision {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 20px;
}

.mission, .vision {
  background-color: #f9fafb;
  padding: 20px;
  border-radius: 8px;
  box-shadow: 0 2px 6px rgba(0, 0, 0, 0.05);
}

.mission h3, .vision h3 {
  color: #1e40af;
  margin-bottom: 10px;
  font-size: 1.3rem;
}

.values-section {
  grid-template-columns: 1fr;
}

.values-container {
  width: 100%;
}

.values-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(220px, 1fr));
  gap: 25px;
  margin-top: 30px;
}

.value-card {
  background-color: #f9fafb;
  padding: 25px;
  border-radius: 8px;
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.05);
  text-align: center;
  transition: transform 0.3s ease;
}

.value-card:hover {
  transform: translateY(-5px);
}

.value-icon {
  font-size: 40px;
  margin-bottom: 15px;
}

.value-card h3 {
  color: #1e40af;
  margin-bottom: 10px;
  font-size: 1.3rem;
}

.value-card p {
  color: #4b5563;
  font-size: 1rem;
}

.full-width {
  grid-column: span 2;
}

.timeline {
  margin-top: 40px;
  position: relative;
}

.timeline::before {
  content: '';
  position: absolute;
  left: 50px;
  top: 0;
  bottom: 0;
  width: 4px;
  background-color: #ddd;
}

.timeline-item {
  display: flex;
  margin-bottom: 30px;
  position: relative;
}

.timeline-marker {
  width: 100px;
  min-width: 100px;
  display: flex;
  justify-content: center;
  align-items: center;
  font-weight: bold;
  font-size: 1.2rem;
  color: #1e40af;
  position: relative;
}

.timeline-marker::after {
  content: '';
  position: absolute;
  right: 0;
  width: 16px;
  height: 16px;
  background-color: #1e40af;
  border-radius: 50%;
  transform: translateX(6px);
}

.timeline-content {
  background-color: #f9fafb;
  padding: 20px;
  border-radius: 8px;
  box-shadow: 0 2px 6px rgba(0, 0, 0, 0.05);
  margin-left: 20px;
  flex: 1;
}

.timeline-content h3 {
  color: #1e40af;
  margin-bottom: 10px;
  font-size: 1.2rem;
}

.contact-section {
  grid-template-columns: 1fr;
}

.contact-info {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
  gap: 25px;
  margin-top: 30px;
  margin-bottom: 40px;
}

.contact-item {
  display: flex;
  align-items: center;
  background-color: #f9fafb;
  padding: 20px;
  border-radius: 8px;
  box-shadow: 0 2px 6px rgba(0, 0, 0, 0.05);
}

.contact-icon {
  font-size: 24px;
  margin-right: 15px;
}

.join-us {
  text-align: center;
  margin-top: 40px;
}

.join-btn {
  display: inline-block;
  padding: 14px 30px;
  background-color: #1e40af;
  color: white;
  text-decoration: none;
  border-radius: 6px;
  font-weight: 500;
  font-size: 1.1rem;
  transition: background-color 0.3s ease;
}

.join-btn:hover {
  background-color: #1e3a8a;
}

@media (max-width: 992px) {
  .about-section, .about-section.reverse {
    grid-template-columns: 1fr;
    direction: ltr;
  }
  
  .mission-vision {
    grid-template-columns: 1fr;
  }
  
  .full-width {
    grid-column: span 1;
  }
  
  .section-image {
    order: 1;
  }
  
  .section-content {
    order: 2;
  }
}

@media (max-width: 576px) {
  .page-header h1 {
    font-size: 2rem;
  }
  
  .section-content h2 {
    font-size: 1.5rem;
  }
  
  .timeline::before {
    left: 30px;
  }
  
  .timeline-marker {
    width: 60px;
    min-width: 60px;
  }
  
  .value-card {
    padding: 20px 15px;
  }
}

.mission-vision-img {
  width: 100%;
  height: 100%;
  object-fit: contain;
}
</style> 