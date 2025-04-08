<template>
  <div class="sidebar-right">
    <!-- 用户信息卡片 -->
    <div class="user-card">
      <div class="user-header">
        <div class="avatar">
          <img src="/default-avatar.png" alt="用户头像">
        </div>
        <div class="user-name">PATIENCE_Y</div>
      </div>
      
      <div class="user-stats">
        <div class="stat-item">
          <div class="stat-number">0</div>
          <div class="stat-label">沸点</div>
        </div>
        <div class="stat-item">
          <div class="stat-number">0</div>
          <div class="stat-label">圈子</div>
        </div>
        <div class="stat-item">
          <div class="stat-number">1</div>
          <div class="stat-label">关注</div>
        </div>
        <div class="stat-item">
          <div class="stat-number">1</div>
          <div class="stat-label">关注者</div>
        </div>
      </div>
    </div>
    
    <!-- 精选沸点 -->
    <div class="featured-section">
      <div class="section-header">
        <h3>精选沸点</h3>
      </div>
      
      <div class="featured-list">
        <div class="featured-item">
          <div class="item-title">买了一个奇能佳者的小册，真的嗨气呵。@...</div>
          <div class="item-stats">124篇 · 226评论</div>
        </div>
        
        <div class="featured-item">
          <div class="item-title">哈哈哈，20w很多吗？你们到底一个月多少...</div>
          <div class="item-stats">18篇 · 222评论</div>
        </div>
        
        <div class="featured-item">
          <div class="item-title">感觉我这一生都会在东躲这个英雄那个中过下去...</div>
          <div class="item-stats">10篇 · 171评论</div>
        </div>
      </div>
    </div>
    
    <!-- 推荐话题 -->
    <div class="topics-section">
      <div class="section-header">
        <h3>推荐话题</h3>
        <a class="refresh-link">
          <span>换一换</span>
        </a>
      </div>
      
      <div class="topics-list">
        <div class="topic-item">
          <span class="topic-tag">#挑战每日一条沸点#</span>
          <span class="topic-count">15.5m</span>
        </div>
        
        <div class="topic-item">
          <span class="topic-tag">#Trae又又又更新了#</span>
          <span class="topic-count">278k</span>
        </div>
        
        <div class="topic-item">
          <span class="topic-tag">#如何解盲职场焦虑#</span>
          <span class="topic-count">501k</span>
        </div>
      </div>
    </div>
  </div>
</template>

<script lang="ts">
import { defineComponent } from 'vue';

export default defineComponent({
  name: 'MomentSidebarRight'
});
</script>

<style scoped>
.sidebar-right {
  display: flex;
  flex-direction: column;
  gap: 20px;
  width: 100%;
}

/* 用户卡片 */
.user-card {
  background-color: white;
  border-radius: 8px;
  overflow: hidden;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
}

.user-header {
  padding: 20px;
  display: flex;
  align-items: center;
  gap: 10px;
}

.avatar {
  width: 50px;
  height: 50px;
  border-radius: 50%;
  overflow: hidden;
}

.avatar img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.user-name {
  font-size: 16px;
  font-weight: 500;
  color: #333;
}

.user-stats {
  display: flex;
  border-top: 1px solid #f0f0f0;
}

.stat-item {
  flex: 1;
  text-align: center;
  padding: 10px 0;
}

.stat-number {
  font-size: 18px;
  font-weight: 600;
  color: #333;
}

.stat-label {
  font-size: 12px;
  color: #8c8c8c;
  margin-top: 4px;
}

/* 精选沸点 */
.featured-section, .topics-section {
  background-color: white;
  border-radius: 8px;
  overflow: hidden;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
}

.section-header {
  padding: 15px;
  border-bottom: 1px solid #f0f0f0;
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.section-header h3 {
  font-size: 16px;
  font-weight: 500;
  color: #333;
  margin: 0;
}

.refresh-link {
  color: #8c8c8c;
  font-size: 14px;
  cursor: pointer;
}

.refresh-link:hover {
  color: #1890ff;
}

.featured-list {
  padding: 0 15px;
}

.featured-item {
  padding: 15px 0;
  border-bottom: 1px solid #f0f0f0;
}

.featured-item:last-child {
  border-bottom: none;
}

.item-title {
  font-size: 14px;
  line-height: 1.5;
  color: #333;
  margin-bottom: 5px;
}

.item-stats {
  font-size: 12px;
  color: #8c8c8c;
}

/* 推荐话题 */
.topics-list {
  padding: 15px;
}

.topic-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 10px 0;
  font-size: 14px;
}

.topic-tag {
  color: #1890ff;
}

.topic-count {
  color: #8c8c8c;
  font-size: 12px;
}
</style> 