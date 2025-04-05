<template>
  <div class="moment-content">
    <!-- 嵌入式发布沸点区域 -->
    <div class="embedded-publish-area" :class="{ 'expanded': isPublishAreaExpanded }">
      <div class="publish-header">
        <div class="avatar">
          <img src="/default-avatar.png" alt="用户头像">
        </div>
        <div class="publish-input" @click="expandPublishArea" v-if="!isPublishAreaExpanded">
          <span>分享你的见解、经验和想法...</span>
        </div>
      </div>
      
      <!-- 展开后的编辑区域 -->
      <div class="expanded-area" v-if="isPublishAreaExpanded">
        <textarea
          class="textarea-wrapper"
          placeholder="分享你的见解、经验和想法..."
          v-model="content"
          @input="adjustTextareaHeight"
          ref="textareaRef"
          autofocus
        ></textarea>

        <div v-if="images.length > 0" class="image-preview-container">
          <div 
            v-for="(image, index) in images" 
            :key="index" 
            class="image-preview"
          >
            <img :src="image.url" alt="上传的图片" />
            <button class="remove-image" @click="removeImage(index)">×</button>
          </div>
          <div v-if="images.length < 9" class="add-more-images" @click="triggerImageUpload">
            <span>+</span>
          </div>
        </div>

        <div class="circle-selector" @click="showTopicSelector = !showTopicSelector">
          <i class="icon-circle"></i>
          {{ selectedTopic ? `#${selectedTopic}#` : '请选择圈子' }} >
        </div>

        <div class="word-count">{{ content.length }}/1000</div>

        <div class="footer-bar">
          <div class="footer-left">
            <i class="iconfont">😊</i>
            <i class="iconfont" @click="triggerImageUpload">🖼️</i>
            <i class="iconfont">🔗</i>
            <i class="iconfont" @click="showTopicSelector = !showTopicSelector">#</i>
            <i class="iconfont">💻</i>
          </div>
          <div class="footer-right">
            <button class="cancel-button" @click="cancelPublish">取消</button>
            <button 
              class="publish-button" 
              :disabled="!canPublish || isPublishing" 
              @click="publishMoment"
            >
              {{ isPublishing ? '发布中...' : '发布' }}
            </button>
          </div>
        </div>
        
        <!-- 话题选择器 -->
        <div v-if="showTopicSelector" class="topic-selector">
          <div class="topic-header">
            <h3>选择话题</h3>
            <button class="close-topic" @click="showTopicSelector = false">×</button>
          </div>
          <div class="topic-list">
            <div 
              v-for="topic in hotTopics" 
              :key="topic"
              class="topic-item"
              :class="{ active: selectedTopic === topic }"
              @click="selectTopic(topic)"
            >
              <span>#{{ topic }}#</span>
            </div>
          </div>
        </div>
      </div>
      
      <!-- 隐藏的文件上传输入 -->
      <input 
        type="file" 
        ref="fileInputRef" 
        style="display:none" 
        accept="image/*" 
        multiple
        @change="handleFileUpload"
      />
    </div>

    <!-- 内容标签切换栏 -->
    <div class="content-tabs">
      <div class="tab-item active">
        <span>推荐</span>
      </div>
      <div class="tab-item">
        <span>最新</span>
      </div>
      <div class="tab-item">
        <span>热门</span>
      </div>
    </div>

    <!-- 沸点内容列表 -->
    <div class="moment-list">
      <div class="moment-item" v-for="(item, index) in momentItems" :key="index">
        <div class="moment-user">
          <div class="avatar">
            <img :src="item.avatar" alt="用户头像">
          </div>
          <div class="user-info">
            <div class="username">{{ item.username }}</div>
            <div class="publish-time">{{ item.time }}</div>
          </div>
          <div class="more-actions">
            <i class="icon-more"></i>
          </div>
        </div>
        
        <div class="moment-body">
          <div class="moment-text">{{ item.content }}</div>
          <div class="moment-images" v-if="item.images && item.images.length">
            <div class="image-grid" :class="'grid-' + item.images.length">
              <div class="image-item" v-for="(img, imgIndex) in item.images" :key="imgIndex">
                <img :src="img" alt="沸点图片">
              </div>
            </div>
          </div>
          <div class="moment-topic" v-if="item.topic">
            <span class="topic-tag">#{{ item.topic }}#</span>
          </div>
        </div>
        
        <div class="moment-actions">
          <div class="action-item">
            <i class="icon-like"></i>
            <span>{{ item.likes }}</span>
          </div>
          <div class="action-item">
            <i class="icon-comment"></i>
            <span>{{ item.comments }}</span>
          </div>
          <div class="action-item">
            <i class="icon-share"></i>
            <span>分享</span>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script lang="ts">
import { defineComponent, ref, computed, onMounted } from 'vue';

export default defineComponent({
  name: 'MomentContent',
  setup() {
    const isPublishAreaExpanded = ref(false);
    const content = ref('');
    const images = ref<{ id: string; url: string }[]>([]);
    const selectedTopic = ref('');
    const showTopicSelector = ref(false);
    const isPublishing = ref(false);
    const textareaRef = ref<HTMLTextAreaElement | null>(null);
    const fileInputRef = ref<HTMLInputElement | null>(null);
    
    const momentItems = ref([
      {
        username: '前端要努力',
        avatar: '/default-avatar.png',
        time: '3小时前',
        content: '分享一个我做的Vue3项目，历时3个月，求大家点评和建议！',
        images: ['/image1.jpg', '/image2.jpg'],
        topic: 'Vue3学习',
        likes: 128,
        comments: 32
      },
      {
        username: 'TypeScript爱好者',
        avatar: '/default-avatar.png',
        time: '昨天',
        content: '今天终于解决了困扰我一周的TypeScript类型问题，分享给大家：当你需要定义一个复杂的嵌套类型时，可以这样做...',
        images: [],
        topic: 'TypeScript',
        likes: 56,
        comments: 18
      },
      {
        username: '程序员日常',
        avatar: '/default-avatar.png',
        time: '2天前',
        content: '当你花了一整天debug，最后发现是因为一个分号...',
        images: ['/image3.jpg'],
        topic: '程序员生活',
        likes: 299,
        comments: 45
      }
    ]);
    
    // 热门话题示例数据
    const hotTopics = ref([
      '新人报道',
      'Vue3学习',
      'TypeScript',
      '程序员生活',
      '前端日常',
      '面试经验',
      '技术分享',
      '项目实战',
      '源码解析',
      '算法学习',
      '开发工具'
    ]);
    
    // 判断是否可以发布
    const canPublish = computed(() => {
      return content.value.trim().length > 0;
    });
    
    // 展开发布区域
    const expandPublishArea = () => {
      isPublishAreaExpanded.value = true;
      // 等待DOM更新后聚焦到文本框
      setTimeout(() => {
        if (textareaRef.value) {
          textareaRef.value.focus();
        }
      }, 0);
    };
    
    // 取消发布
    const cancelPublish = () => {
      isPublishAreaExpanded.value = false;
      resetForm();
    };
    
    // 重置表单
    const resetForm = () => {
      content.value = '';
      images.value = [];
      selectedTopic.value = '';
      showTopicSelector.value = false;
    };
    
    // 调整文本域高度
    const adjustTextareaHeight = () => {
      if (textareaRef.value) {
        textareaRef.value.style.height = 'auto';
        textareaRef.value.style.height = textareaRef.value.scrollHeight + 'px';
      }
    };
    
    // 触发图片上传
    const triggerImageUpload = () => {
      if (fileInputRef.value) {
        fileInputRef.value.click();
      }
    };
    
    // 处理文件上传
    const handleFileUpload = (event: Event) => {
      const target = event.target as HTMLInputElement;
      if (target.files) {
        const fileList = Array.from(target.files);
        const allowedFiles = fileList.slice(0, 9 - images.value.length);
        
        allowedFiles.forEach(file => {
          const reader = new FileReader();
          reader.onload = (e) => {
            const id = Date.now() + Math.random().toString(36).substring(2, 15);
            images.value.push({
              id,
              url: e.target?.result as string
            });
          };
          reader.readAsDataURL(file);
        });
        
        // 重置文件输入，以便可以上传相同的文件
        target.value = '';
      }
    };
    
    // 删除图片
    const removeImage = (index: number) => {
      images.value.splice(index, 1);
    };
    
    // 选择话题
    const selectTopic = (topic: string) => {
      selectedTopic.value = topic;
      showTopicSelector.value = false;
    };
    
    // 发布沸点
    const publishMoment = async () => {
      if (!canPublish.value || isPublishing.value) return;
      
      isPublishing.value = true;
      
      try {
        // 模拟API调用延迟
        await new Promise(resolve => setTimeout(resolve, 1000));
        
        // 将新发布的沸点添加到列表前面
        const newMoment = {
          username: '当前用户',
          avatar: '/default-avatar.png',
          time: '刚刚',
          content: content.value,
          images: images.value.map((img) => img.url),
          topic: selectedTopic.value,
          likes: 0,
          comments: 0
        };
        
        momentItems.value.unshift(newMoment);
        
        // 重置表单并折叠发布区域
        resetForm();
        isPublishAreaExpanded.value = false;
      } catch (error) {
        console.error('发布沸点失败:', error);
      } finally {
        isPublishing.value = false;
      }
    };

    return {
      isPublishAreaExpanded,
      expandPublishArea,
      content,
      images,
      selectedTopic,
      showTopicSelector,
      isPublishing,
      hotTopics,
      textareaRef,
      fileInputRef,
      momentItems,
      canPublish,
      cancelPublish,
      adjustTextareaHeight,
      triggerImageUpload,
      handleFileUpload,
      removeImage,
      selectTopic,
      publishMoment
    };
  }
});
</script>

<style scoped>
.moment-content {
  background-color: white;
  border-radius: 8px;
  overflow: hidden;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
}

/* 嵌入式发布区域样式 */
.embedded-publish-area {
  padding: 15px;
  border-bottom: 1px solid #f0f0f0;
  transition: all 0.3s ease;
}

.embedded-publish-area.expanded {
  background-color: #f9f9f9;
}

.publish-header {
  display: flex;
  align-items: center;
  gap: 10px;
}

.avatar {
  width: 40px;
  height: 40px;
  border-radius: 50%;
  overflow: hidden;
  flex-shrink: 0;
}

.avatar img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.publish-input {
  flex: 1;
  background-color: #f5f5f5;
  border-radius: 4px;
  padding: 10px 15px;
  color: #8c8c8c;
  cursor: pointer;
}

.publish-input:hover {
  background-color: #e8e8e8;
}

/* 展开后的编辑区域样式 */
.expanded-area {
  margin-top: 10px;
}

.textarea-wrapper {
  background-color: #f7f8fa;
  border-radius: 8px;
  padding: 12px 16px;
  min-height: 120px;
  font-size: 15px;
  line-height: 1.7;
  color: #1f1f1f;
  resize: none;
  width: 100%;
  border: none;
  outline: none;
  margin-bottom: 12px;
}

.image-preview-container {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
  margin-bottom: 12px;
}

.image-preview {
  width: 80px;
  height: 80px;
  position: relative;
  border-radius: 4px;
  overflow: hidden;
}

.image-preview img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.remove-image {
  position: absolute;
  top: 4px;
  right: 4px;
  width: 18px;
  height: 18px;
  border-radius: 50%;
  background-color: rgba(0, 0, 0, 0.5);
  color: white;
  border: none;
  font-size: 12px;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
}

.add-more-images {
  width: 80px;
  height: 80px;
  border: 1px dashed #ddd;
  border-radius: 4px;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
}

.add-more-images span {
  font-size: 20px;
  color: #999;
}

.circle-selector {
  margin-top: 12px;
  background-color: #eef6ff;
  border-radius: 999px;
  display: inline-flex;
  align-items: center;
  padding: 4px 10px;
  font-size: 14px;
  color: #1677ff;
  cursor: pointer;
  gap: 4px;
}

.word-count {
  margin-top: 12px;
  text-align: right;
  color: #999;
  font-size: 12px;
}

.footer-bar {
  margin-top: 16px;
  display: flex;
  justify-content: space-between;
  align-items: center;
  border-top: 1px solid #f0f0f0;
  padding-top: 12px;
}

.footer-left {
  display: flex;
  gap: 20px;
  font-size: 16px;
  color: #666;
}

.iconfont {
  cursor: pointer;
}

.footer-right {
  display: flex;
  align-items: center;
  gap: 10px;
}

.cancel-button {
  background-color: #f5f5f5;
  color: #666;
  border: none;
  padding: 6px 16px;
  border-radius: 6px;
  font-weight: 500;
  font-size: 14px;
  cursor: pointer;
}

.cancel-button:hover {
  background-color: #e8e8e8;
}

.publish-button {
  background-color: #1677ff;
  color: white;
  border: none;
  padding: 6px 16px;
  border-radius: 6px;
  font-weight: 500;
  font-size: 14px;
  cursor: pointer;
}

.publish-button:hover {
  background-color: #4096ff;
}

.publish-button:disabled {
  background-color: #a0cfff;
  cursor: not-allowed;
}

.topic-selector {
  position: absolute;
  top: 120px;
  left: 30px;
  width: 300px;
  background-color: white;
  border-radius: 8px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.15);
  z-index: 10;
}

.topic-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 12px 16px;
  border-bottom: 1px solid #f0f0f0;
}

.topic-header h3 {
  margin: 0;
  font-size: 15px;
  font-weight: 500;
  color: #333;
}

.close-topic {
  background: none;
  border: none;
  font-size: 18px;
  color: #999;
  cursor: pointer;
}

.topic-list {
  padding: 10px;
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
  max-height: 300px;
  overflow-y: auto;
}

.topic-item {
  font-size: 14px;
  color: #1677ff;
  padding: 4px 10px;
  background-color: #e6f7ff;
  border-radius: 16px;
  cursor: pointer;
}

.topic-item:hover {
  background-color: #bae7ff;
}

.topic-item.active {
  background-color: #1677ff;
  color: white;
}

.icon-circle {
  display: inline-block;
  width: 14px;
  height: 14px;
  background-color: #1677ff;
  border-radius: 50%;
}

/* 标签切换栏 */
.content-tabs {
  display: flex;
  border-bottom: 1px solid #f0f0f0;
  background-color: white;
}

.tab-item {
  padding: 15px 20px;
  cursor: pointer;
  position: relative;
  color: #8c8c8c;
}

.tab-item.active {
  color: #1890ff;
  font-weight: 500;
}

.tab-item.active:after {
  content: '';
  position: absolute;
  bottom: 0;
  left: 20%;
  width: 60%;
  height: 2px;
  background-color: #1890ff;
}

/* 沸点列表样式 */
.moment-list {
  padding: 0;
}

.moment-item {
  padding: 20px;
  border-bottom: 1px solid #f0f0f0;
  border-radius: 6px;
  background-color: white;
  transition: box-shadow 0.3s ease, transform 0.2s ease;
}

.moment-item:hover {
  box-shadow: 0 4px 16px rgba(0, 0, 0, 0.06);
  transform: translateY(-3px);
}

.moment-user {
  display: flex;
  align-items: center;
  margin-bottom: 15px;
}

.user-info {
  flex: 1;
  margin-left: 10px;
}

.username {
  font-size: 15px;
  font-weight: 500;
  color: #333;
}

.publish-time {
  font-size: 12px;
  color: #8c8c8c;
  margin-top: 3px;
}

.more-actions {
  color: #8c8c8c;
  cursor: pointer;
}

.moment-body {
  margin-bottom: 15px;
}

.moment-text {
  font-size: 15px;
  font-weight: 400;
  line-height: 1.8;
  color: #333;
  margin-bottom: 10px;
}

.moment-images {
  margin-bottom: 10px;
}

.image-grid {
  display: grid;
  gap: 5px;
  grid-template-columns: repeat(3, 1fr);
}

.image-grid.grid-1 {
  grid-template-columns: 1fr;
  max-width: 60%;
}

.image-grid.grid-2 {
  grid-template-columns: 1fr 1fr;
}

.image-item img {
  width: 100%;
  height: 100%;
  object-fit: cover;
  border-radius: 4px;
  transition: transform 0.3s ease;
}

.image-item:hover img {
  transform: scale(1.03);
}

.moment-topic {
  margin-top: 10px;
}

.topic-tag {
  color: #1890ff;
  font-size: 14px;
  background-color: #e6f7ff;
  padding: 2px 8px;
  border-radius: 4px;
}

.moment-actions {
  display: flex;
  gap: 20px;
}

.action-item {
  display: flex;
  align-items: center;
  gap: 5px;
  color: #8c8c8c;
  font-size: 14px;
  cursor: pointer;
}

.action-item:hover {
  color: #1890ff;
  transform: scale(1.05);
  transition: transform 0.2s ease;
}

/* 图标样式 */
[class^="icon-"] {
  font-size: 18px;
  display: inline-block;
  width: 18px;
  height: 18px;
  background-color: #ccc;
  border-radius: 50%;
}
</style>