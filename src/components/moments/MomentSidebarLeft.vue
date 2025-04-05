<template>
  <div class="sidebar-left">
    <div class="sidebar-section">
      <div class="nav-item active">
        <div class="nav-icon">
          <Icon icon="mdi:clock-time-four-outline" width="20" height="20" />
        </div>
        <div class="nav-text">最新</div>
      </div>
      
      <div class="nav-item">
        <div class="nav-icon">
          <Icon icon="mdi:fire" width="20" height="20" />
        </div>
        <div class="nav-text">热门</div>
      </div>
      
      <div class="nav-item">
        <div class="nav-icon">
          <Icon icon="mdi:star-outline" width="20" height="20" />
        </div>
        <div class="nav-text">关注</div>
      </div>
      
      <div class="nav-item">
        <div class="nav-icon">
          <Icon icon="mdi:account-group-outline" width="20" height="20" />
        </div>
        <div class="nav-text">我的圈子</div>
      </div>
      
      <div class="nav-item">
        <div class="nav-icon">
          <Icon icon="mdi:bookmark-multiple-outline" width="20" height="20" />
        </div>
        <div class="nav-text">推荐圈子</div>
      </div>
    </div>
    
    <div class="sidebar-section communities">
      <div class="community-item">
        <div class="nav-icon">
          <Icon icon="mdi:robot-outline" width="20" height="20" />
        </div>
        <div class="community-text">AICoding交流</div>
      </div>
      
      <div class="community-item">
        <div class="nav-icon">
          <Icon icon="mdi:hexagon-multiple-outline" width="20" height="20" />
        </div>
        <div class="community-text">大模型生态圈</div>
      </div>
      
      <div class="community-item">
        <div class="nav-icon">
          <Icon icon="mdi:server" width="20" height="20" />
        </div>
        <div class="community-text">服务端与架构</div>
      </div>
      
      <div class="community-item">
        <div class="nav-icon">
          <Icon icon="mdi:language-html5" width="20" height="20" />
        </div>
        <div class="community-text">前端开发圈</div>
      </div>
      
      <div class="community-item">
        <div class="nav-icon">
          <Icon icon="mdi:account-voice" width="20" height="20" />
        </div>
        <div class="community-text">Trae 用户交流圈</div>
      </div>
    </div>
    
    <div class="sidebar-more">
      <div class="more-item">
        <div class="more-text">更多</div>
      </div>
    </div>
  </div>
</template>

<script lang="ts">
import { defineComponent } from 'vue';
import { Icon } from '@iconify/vue';

export default defineComponent({
  name: 'MomentSidebarLeft',
  components: {
    Icon
  }
});
</script>

<style scoped>
.sidebar-left {
  display: flex;
  flex-direction: column;
  padding: 16px 0;
  background-color: #fff;
  border-radius: 8px;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.05);
  width: auto;
  height: auto;
}

.sidebar-section {
  margin-bottom: 12px;
  padding: 0;
}

.communities {
  margin-top: 8px;
  border-top: 1px solid #f2f3f5;
  padding-top: 12px;
}

.section-title {
  padding: 8px 16px;
  font-size: 13px;
  color: #8c8c8c;
  font-weight: 500;
}

.nav-item {
  display: flex;
  align-items: center;
  padding: 10px 16px;
  cursor: pointer;
  transition: all 0.2s ease;
  border-radius: 4px;
  margin: 4px 8px;
}

.nav-item:hover {
  background-color: #f2f3f5;
}

.nav-item.active {
  background-color: #edf2fd;
  color: #3370ff;
  font-weight: 500;
}

.nav-icon {
  margin-right: 12px;
  font-size: 20px;
  width: 24px;
  height: 24px;
  display: flex;
  align-items: center;
  justify-content: center;
  color: #8a919f;
}

.nav-item.active .nav-icon {
  color: #3370ff;
}

.icon-svg {
  width: 20px;
  height: 20px;
}

.nav-text {
  font-size: 14px;
  color: #252933;
  font-weight: 400;
}

.nav-item.active .nav-text {
  color: #3370ff;
  font-weight: 500;
}

.community-item {
  display: flex;
  align-items: center;
  padding: 10px 16px;
  cursor: pointer;
  transition: all 0.2s ease;
  margin: 2px 8px;
}

.community-item:hover {
  background-color: #f2f3f5;
  border-radius: 4px;
}

.community-text {
  font-size: 14px;
  color: #8a919f;
}

.community-item .nav-icon {
  margin-right: 12px;
  font-size: 20px;
  width: 24px;
  height: 24px;
  display: flex;
  align-items: center;
  justify-content: center;
  color: #8a919f;
}

.sidebar-more {
  margin-top: 12px;
  padding-top: 8px;
}

.more-item {
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 10px 16px;
  cursor: pointer;
  margin: 4px 8px;
}

.more-text {
  font-size: 14px;
  color: #8a919f;
  font-weight: 400;
}

.more-item:hover .more-text {
  color: #3370ff;
}
</style>