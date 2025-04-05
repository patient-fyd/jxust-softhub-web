<template>
  <div class="publish-page">
    <div class="publish-container">
      <div class="publish-card">
        <div class="topic-preview">#新人报道#</div>
        <textarea
          class="textarea-wrapper"
          placeholder="分享你的见解、经验和想法..."
          v-model="content"
          @input="adjustTextareaHeight"
          ref="textareaRef"
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
          请选择圈子 >
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
            <button class="cancel-button" @click="goBack">取消</button>
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
</template>

<script lang="ts">
import { defineComponent, ref, computed, onMounted } from 'vue';
import { useRouter } from 'vue-router';

export default defineComponent({
  name: 'PublishMomentView',
  setup() {
    const router = useRouter();
    const content = ref('');
    const images = ref<{ id: string; url: string }[]>([]);
    const selectedTopic = ref('新人报道');
    const showTopicSelector = ref(false);
    const isPublishing = ref(false);
    const textareaRef = ref<HTMLTextAreaElement | null>(null);
    const fileInputRef = ref<HTMLInputElement | null>(null);
    
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
    
    // 返回上一页
    const goBack = () => {
      router.back();
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
        // 这里将来可以集成实际的API调用
        const momentData = {
          content: content.value,
          images: images.value,
          topic: selectedTopic.value
        };
        
        // 模拟API调用延迟
        await new Promise(resolve => setTimeout(resolve, 1000));
        
        // 发布成功后跳转到沸点页面
        router.push('/moments');
      } catch (error) {
        console.error('发布沸点失败:', error);
        // 这里可以添加错误处理逻辑
      } finally {
        isPublishing.value = false;
      }
    };
    
    onMounted(() => {
      // 初始化时调整文本域高度
      adjustTextareaHeight();
    });
    
    return {
      content,
      images,
      selectedTopic,
      showTopicSelector,
      isPublishing,
      hotTopics,
      textareaRef,
      fileInputRef,
      canPublish,
      goBack,
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
.publish-page {
  min-height: calc(100vh - 60px);
  background-color: #f4f5f5;
  padding: 20px 0;
}

.publish-container {
  max-width: 800px;
  margin: 0 auto;
  padding: 0 15px;
}

.publish-card {
  background-color: #fff;
  border-radius: 8px;
  padding: 20px;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.05);
  position: relative;
}

.topic-preview {
  font-size: 15px;
  font-weight: 500;
  color: #1677ff;
  margin-bottom: 8px;
}

.textarea-wrapper {
  background-color: #f7f8fa;
  border-radius: 8px;
  padding: 12px 16px;
  min-height: 150px;
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
  gap: 12px;
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
  left: 20px;
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

.topic-item.active span {
  color: white;
}

.icon-circle {
  display: inline-block;
  width: 14px;
  height: 14px;
  background-color: #1677ff;
  border-radius: 50%;
}
</style> 