<template>
  <footer class="footer">
    <div class="footer-container">
      <!-- 链接区域 -->
      <div class="footer-links">
        <div class="link-group">
          <h3>关于我们</h3>
          <router-link to="/about" class="footer-link">协会简介</router-link>
          <router-link to="/history" class="footer-link">发展历程</router-link>
          <router-link to="/team" class="footer-link">指导团队</router-link>
        </div>
        
        <div class="link-group">
          <h3>内容导航</h3>
          <router-link to="/blog" class="footer-link">技术博客</router-link>
          <router-link to="/projects" class="footer-link">项目展示</router-link>
          <router-link to="/gallery" class="footer-link">活动相册</router-link>
        </div>
        
        <div class="link-group">
          <h3>快速链接</h3>
          <router-link to="/faq" class="footer-link">常见问题</router-link>
          <router-link to="/feedback" class="footer-link">意见反馈</router-link>
          <router-link to="/forum" class="footer-link">留言板</router-link>
        </div>
        
        <div class="link-group contact-info">
          <h3>联系我们</h3>
          <p><span class="contact-label">邮箱：</span>softhub@jxust.edu.cn</p>
          <p><span class="contact-label">地址：</span>江西省南昌市新建区宏福大道2888号</p>
          <p><span class="contact-label">QQ群：</span>838480637</p>
        </div>
      </div>
      
      <!-- 社交媒体图标 -->
      <div class="social-media">
        <a href="#" class="social-icon" title="微信公众号">
          <Icon icon="mdi:wechat" width="20" height="20" />
        </a>
        <a href="#" class="social-icon" title="QQ空间">
          <Icon icon="mdi:qqchat" width="20" height="20" />
        </a>
        <a href="#" class="social-icon" title="微博">
          <Icon icon="mdi:sina-weibo" width="20" height="20" />
        </a>
        <a href="#" class="social-icon" title="Bilibili">
          <Icon icon="ri:bilibili-fill" width="20" height="20" />
        </a>
      </div>
      
      <!-- 版权信息 -->
      <div class="copyright">
        <p>© {{ currentYear }} 江西应用科技学院软件协会 版权所有</p>
        <p>赣ICP备XXXXXXXX号-X | 赣公网安备XXXXXXXXXXXXX号</p>
      </div>
    </div>
  </footer>
</template>

<script lang="ts">
import { defineComponent, computed } from 'vue';
import { Icon } from '@iconify/vue';

export default defineComponent({
  name: 'FooterComponent',
  
  components: {
    Icon,
  },
  
  setup() {
    const currentYear = computed(() => new Date().getFullYear());
    
    return {
      currentYear
    };
  }
});
</script>

<style scoped>
.footer {
  width: 100%;
  background: rgba(240, 245, 255, 1);
  color: #333;
  padding: 40px 0 20px;
  margin-top: 40px;
  box-shadow: 0 -4px 10px rgba(0, 0, 0, 0.05);
}

.footer-container {
  max-width: 1200px;
  margin: 0 auto;
  padding: 0 24px;
}

/* 链接区域样式 */
.footer-links {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 30px;
  margin-bottom: 30px;
}

.link-group h3 {
  font-size: 18px;
  color: #1e40af;
  margin-bottom: 15px;
  font-weight: 600;
}

.footer-link {
  display: block;
  color: #4b5563;
  text-decoration: none;
  margin-bottom: 10px;
  transition: color 0.3s ease;
  font-size: 14px;
}

.footer-link:hover {
  color: #1e40af;
}

.contact-info p {
  margin-bottom: 10px;
  font-size: 14px;
  color: #4b5563;
}

.contact-label {
  font-weight: 500;
  color: #1e40af;
}

/* 社交媒体图标样式 */
.social-media {
  display: flex;
  justify-content: center;
  gap: 20px;
  margin-bottom: 30px;
}

.social-icon {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 40px;
  height: 40px;
  border-radius: 50%;
  background-color: #fff;
  color: #1e40af;
  text-decoration: none;
  transition: all 0.3s ease;
  box-shadow: 0 2px 5px rgba(0, 0, 0, 0.1);
}

.social-icon:hover {
  transform: translateY(-3px);
  box-shadow: 0 5px 10px rgba(0, 0, 0, 0.15);
  background-color: #1e40af;
  color: white;
}

/* 版权信息样式 */
.copyright {
  text-align: center;
  padding-top: 20px;
  border-top: 1px solid rgba(203, 213, 225, 0.5);
}

.copyright p {
  margin: 5px 0;
  font-size: 14px;
  color: #6b7280;
}

/* 响应式设计 */
@media (max-width: 992px) {
  .footer-links {
    grid-template-columns: repeat(2, 1fr);
  }
}

@media (max-width: 576px) {
  .footer-links {
    grid-template-columns: 1fr;
    gap: 20px;
  }
  
  .social-media {
    gap: 15px;
  }
  
  .social-icon {
    width: 35px;
    height: 35px;
  }
}
</style>