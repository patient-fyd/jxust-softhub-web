<template>
  <div v-if="visible" class="dialog-overlay" @click.self="closeDialog">
    <div class="dialog-container">
      <div class="publish-card">
        <div class="topic-preview" v-if="selectedTopic">#{{ selectedTopic }}#</div>
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

        <div class="footer-bar">
          <div class="footer-left">
            <i class="iconfont">😊</i>
            <i class="iconfont" @click="triggerImageUpload">🖼️</i>
            <i class="iconfont">🔗</i>
            <i class="iconfont" @click="showTopicSelector = !showTopicSelector">#</i>
            <i class="iconfont">💻</i>
          </div>
          <div class="footer-right">
            <div class="word-count">{{ content.length }}/1000</div>
            <button :disabled="!canPublish || isPublishing" @click="publishMoment">
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

export default defineComponent({
  name: 'PublishMomentDialog',
  props: {
    visible: {
      type: Boolean,
      default: false
    }
  },
  emits: ['close', 'publish-moment'],
  setup(props, { emit }) {
    const content = ref('');
    const images = ref<{ id: string; url: string }[]>([]);
    const selectedTopic = ref('');
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
    
    // 关闭对话框
    const closeDialog = () => {
      emit('close');
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
        
        // 发布成功后发出事件
        emit('publish-moment', momentData);
        
        // 重置表单
        content.value = '';
        images.value = [];
        selectedTopic.value = '';
        
        // 关闭对话框
        closeDialog();
      } catch (error) {
        console.error('发布沸点失败:', error);
        // 这里可以添加错误处理逻辑
      } finally {
        isPublishing.value = false;
      }
    };
    
    onMounted(() => {
      // 在对话框显示时调整文本域高度
      if (props.visible) {
        adjustTextareaHeight();
      }
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
      closeDialog,
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
.dialog-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background-color: rgba(0, 0, 0, 0.5);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
}

.dialog-container {
  width: 600px;
  max-width: 90vw;
  background-color: white;
  border-radius: 8px;
  box-shadow: 0 5px 20px rgba(0, 0, 0, 0.2);
  max-height: 90vh;
  overflow: auto;
}

.publish-card {
  background-color: #fff;
  border-radius: 8px;
  padding: 16px;
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

.word-count {
  color: #999;
  font-size: 12px;
}

.footer-right button {
  background-color: #1677ff;
  color: white;
  border: none;
  padding: 6px 20px;
  border-radius: 6px;
  font-weight: 500;
  font-size: 14px;
  cursor: pointer;
}

.footer-right button:disabled {
  background-color: #a0cfff;
  cursor: not-allowed;
}

.topic-selector {
  position: absolute;
  bottom: 60px;
  left: 16px;
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

.icon-circle {
  display: inline-block;
  width: 14px;
  height: 14px;
  background-color: #1677ff;
  border-radius: 50%;
}
</style>