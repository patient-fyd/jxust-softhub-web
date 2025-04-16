<template>
  <div class="moment-content">
    <!-- 嵌入式发布沸点区域 -->
    <div class="embedded-publish-area" :class="{ 'expanded': isPublishAreaExpanded }">
      <div class="publish-header" v-if="!isPublishAreaExpanded" @click="showPublishDialog">
        <div class="avatar">
          <img :src="userStore.currentUser?.avatar || '/assets/images/default-avatar.svg'" alt="Avatar" />
        </div>
        <div class="publish-input">有什么新鲜事想分享？</div>
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
          {{ topicDisplay }} >
        </div>

        <div class="word-count">{{ content.length }}/1000</div>

        <div class="footer-bar">
          <div class="footer-left">
            <i class="iconfont icon-smile"></i>
            <i class="iconfont icon-image" @click="triggerImageUpload"></i>
            <i class="iconfont icon-link"></i>
            <i class="iconfont icon-tag" @click="showTopicSelector = !showTopicSelector"></i>
            <i class="iconfont icon-code"></i>
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
      <div 
        class="tab-item" 
        :class="{ 'active': activeTab === 'recommend' }"
        @click="switchTab('recommend')"
      >
        <span>推荐</span>
      </div>
      <div 
        class="tab-item" 
        :class="{ 'active': activeTab === 'latest' }"
        @click="switchTab('latest')"
      >
        <span>最新</span>
      </div>
      <div 
        class="tab-item" 
        :class="{ 'active': activeTab === 'hot' }"
        @click="switchTab('hot')"
      >
        <span>热门</span>
      </div>
    </div>

    <!-- 沸点内容列表 -->
    <div class="moment-list">
      <div v-if="loading" class="loading-state">
        <div class="loading-spinner"></div>
        <span>加载中...</span>
      </div>
      
      <div v-else-if="filteredMoments.length === 0" class="empty-state">
        <div class="empty-icon"><i class="iconfont icon-inbox"></i></div>
        <span>还没有内容，成为第一个发布者吧！</span>
      </div>
      
      <div v-else v-for="(item, index) in filteredMoments" :key="index" class="moment-item">
        <div class="moment-user">
          <div class="avatar">
            <img :src="item.userAvatar || '/assets/images/default-avatar.svg'" alt="用户头像">
          </div>
          <div class="user-info">
            <div class="username">{{ item.userName }}</div>
            <div class="publish-time">{{ formatTime(item.createTime) }}</div>
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
            <i class="icon-like" :class="{ 'liked': item.isLiked }"></i>
            <span>{{ item.likesCount }}</span>
          </div>
          <div class="action-item">
            <i class="icon-comment"></i>
            <span>{{ item.commentsCount }}</span>
          </div>
          <div class="action-item">
            <i class="icon-share"></i>
            <span>分享</span>
          </div>
        </div>
      </div>
    </div>

    <!-- 发布动态对话框 -->
    <PublishMomentDialog 
      :visible="showDialog"
      @close="closePublishDialog"
      @publish-success="handlePublishSuccess"
    />
  </div>
</template>

<script lang="ts">
import { defineComponent, ref, computed, onMounted, watch } from 'vue';
import type { PropType } from 'vue';
import { useUserStore } from '../../stores/userStore';
import { getCircleDetail } from '../../services/circleService';
import { getMomentList, createMoment } from '../../services/momentService';
import { uploadImages } from '../../services/uploadService';
import type { Moment } from '../../types/moment';
import MomentCard from './MomentCard.vue';
import PublishMomentDialog from './PublishMomentDialog.vue';

export default defineComponent({
  name: 'MomentContent',
  components: {
    MomentCard,
    PublishMomentDialog
  },
  props: {
    filter: {
      type: Object as PropType<{
        orderBy?: string;
        circleId?: number;
      }>,
      default: () => ({
        orderBy: 'latest',
        circleId: 0
      })
    }
  },
  setup(props) {
    const userStore = useUserStore();
    const isPublishAreaExpanded = ref(false);
    const content = ref('');
    const images = ref<{ id: string; url: string }[]>([]);
    const selectedTopic = ref('');
    const showTopicSelector = ref(false);
    const isPublishing = ref(false);
    const textareaRef = ref<HTMLTextAreaElement | null>(null);
    const fileInputRef = ref<HTMLInputElement | null>(null);
    const loading = ref(false);
    const activeTab = ref(props.filter.orderBy || 'latest');
    const currentCircleName = ref('');
    const showDialog = ref(false);
    
    // 初始化为空数组，不再使用静态数据
    const momentItems = ref<Moment[]>([]);
    
    // 热门话题 - 初始化为空数组
    const hotTopics = ref<string[]>([]);

    // 加载动态数据
    const loadMoments = async () => {
      loading.value = true;
      try {
        const response = await getMomentList({
          pageNum: 1,
          pageSize: 20,
          // 如果有圈子ID，添加圈子过滤
          ...(props.filter.circleId ? { circleId: props.filter.circleId } : {})
        });
        
        if (response.code === 0 && response.data && response.data.list) {
          momentItems.value = response.data.list;
        } else {
          console.error('获取动态列表失败:', response.msg);
        }
      } catch (error) {
        console.error('获取动态列表失败:', error);
      } finally {
        loading.value = false;
      }
    };
    
    // 获取当前圈子信息
    const fetchCircleInfo = async () => {
      if (props.filter.circleId && props.filter.circleId > 0) {
        try {
          const response = await getCircleDetail(props.filter.circleId);
          if (response.code === 0) {
            currentCircleName.value = response.data.name;
          } else {
            console.error('获取圈子信息失败:', response.msg);
            currentCircleName.value = `圈子${props.filter.circleId}`;
          }
        } catch (err) {
          console.error('获取圈子信息请求出错:', err);
          currentCircleName.value = `圈子${props.filter.circleId}`;
        }
      } else {
        currentCircleName.value = '';
      }
    };
    
    // 格式化时间为相对时间
    const formatTime = (timeString: string): string => {
      const date = new Date(timeString);
      const now = new Date();
      const diff = now.getTime() - date.getTime();
      
      // 1分钟内显示"刚刚"
      if (diff < 60 * 1000) {
        return '刚刚';
      }
      
      // 1小时内显示"x分钟前"
      if (diff < 60 * 60 * 1000) {
        return `${Math.floor(diff / (60 * 1000))}分钟前`;
      }
      
      // 24小时内显示"x小时前"
      if (diff < 24 * 60 * 60 * 1000) {
        return `${Math.floor(diff / (60 * 60 * 1000))}小时前`;
      }
      
      // 30天内显示"x天前"
      if (diff < 30 * 24 * 60 * 60 * 1000) {
        return `${Math.floor(diff / (24 * 60 * 60 * 1000))}天前`;
      }
      
      // 超过30天显示具体日期
      const year = date.getFullYear();
      const month = String(date.getMonth() + 1).padStart(2, '0');
      const day = String(date.getDate()).padStart(2, '0');
      return `${year}-${month}-${day}`;
    };
    
    // 根据过滤器筛选动态
    const filteredMoments = computed(() => {
      let result = [...momentItems.value];
      
      // 按排序方式筛选
      if (activeTab.value) {
        switch (activeTab.value) {
          case 'hot':
            // 热门排序：按点赞数降序
            result.sort((a, b) => (b.likesCount || 0) - (a.likesCount || 0));
            break;
          case 'latest':
            // 最新排序：按创建时间降序
            result.sort((a, b) => new Date(b.createTime).getTime() - new Date(a.createTime).getTime());
            break;
          case 'recommend':
            // 推荐算法，这里可以有其他排序逻辑
            break;
        }
      }
      
      return result;
    });
    
    // 话题显示文本
    const topicDisplay = computed(() => {
      if (selectedTopic.value) {
        return `#${selectedTopic.value}#`;
      } else if (currentCircleName.value) {
        return `#${currentCircleName.value}#`;
      } else {
        return '请选择圈子';
      }
    });
    
    // 切换标签
    const switchTab = (tab: string) => {
      activeTab.value = tab;
      loadMoments();
    };
    
    // 判断是否可以发布
    const canPublish = computed(() => {
      return content.value.trim().length > 0 && userStore.currentUser !== null;
    });
    
    // 展开发布区域
    const expandPublishArea = () => {
      // 检查用户是否已登录
      if (!userStore.currentUser) {
        alert('请先登录后再发布内容');
        return;
      }
      
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
    const handleFileUpload = async (event: Event) => {
      const target = event.target as HTMLInputElement;
      if (target.files && target.files.length > 0) {
        const fileList = Array.from(target.files);
        const allowedFiles = fileList.slice(0, 9 - images.value.length);
        
        try {
          // 使用uploadImages服务上传图片
          const response = await uploadImages(allowedFiles);
          
          if (response.code === 0 && response.data.length > 0) {
            // 将上传成功的图片添加到images数组
            response.data.forEach(imgData => {
              images.value.push({
                id: imgData.filename,
                url: imgData.url
              });
            });
          } else {
            console.error('上传图片失败:', response.msg);
            alert('上传图片失败，请重试');
          }
        } catch (error) {
          console.error('上传图片失败:', error);
          alert('上传图片失败，请重试');
        }
        
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
      
      // 如果用户未登录，提示登录
      if (!userStore.currentUser) {
        alert('请先登录后再发布内容');
        return;
      }
      
      isPublishing.value = true;
      
      try {
        // 准备发布参数
        const params = {
          content: content.value.trim(),
          images: images.value.map(img => img.url),
          // 如果有选择话题或当前在某个圈子中，添加话题标签
          ...(selectedTopic.value ? { topic: selectedTopic.value } : {}),
          ...(props.filter.circleId && props.filter.circleId > 0 ? { circleId: props.filter.circleId } : {})
        };
        
        // 调用API发布动态
        const response = await createMoment(params);
        
        if (response.code === 0) {
          // 发布成功，重置表单并折叠发布区域
          resetForm();
          isPublishAreaExpanded.value = false;
          
          // 重新加载动态列表
          loadMoments();
        } else {
          console.error('发布动态失败:', response.msg);
          alert(`发布失败: ${response.msg || '未知错误'}`);
        }
      } catch (error) {
        console.error('发布动态失败:', error);
        alert('发布失败，请重试');
      } finally {
        isPublishing.value = false;
      }
    };

    // 监听过滤器变化，加载对应圈子信息和动态
    watch(() => props.filter, (newFilter) => {
      console.log('过滤器变更:', newFilter);
      // 获取圈子信息
      fetchCircleInfo();
      
      // 加载新的动态数据
      if (newFilter.orderBy) {
        activeTab.value = newFilter.orderBy;
      }
      
      loadMoments();
    }, { deep: true });
    
    onMounted(() => {
      fetchCircleInfo();
      loadMoments();
    });

    // 显示发布对话框
    const showPublishDialog = () => {
      // 检查用户是否已登录
      if (!userStore.currentUser) {
        alert('请先登录后再发布内容');
        return;
      }
      
      showDialog.value = true;
    };
    
    // 关闭发布对话框
    const closePublishDialog = () => {
      showDialog.value = false;
    };
    
    // 处理发布成功事件
    const handlePublishSuccess = (momentData: any) => {
      console.log('发布成功:', momentData);
      // 重新加载动态列表
      loadMoments();
    };
    
    // 清除圈子筛选
    const clearCircleFilter = () => {
      // 发出事件，通知父组件清除圈子选择
      activeTab.value = 'latest';
      // 可以通过router或者其他方式更新URL
      loadMoments();
    };

    return {
      userStore,
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
      filteredMoments,
      currentCircleName,
      topicDisplay,
      activeTab,
      loading,
      switchTab,
      canPublish,
      cancelPublish,
      adjustTextareaHeight,
      triggerImageUpload,
      handleFileUpload,
      removeImage,
      selectTopic,
      publishMoment,
      formatTime,
      showDialog,
      showPublishDialog,
      closePublishDialog,
      handlePublishSuccess,
      clearCircleFilter
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

/* 添加样式，支持显示当前圈子名称 */
.current-circle {
  margin-left: 6px;
  color: #1677ff;
  font-weight: 500;
}

/* 加载状态 */
.loading-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 30px;
  color: #8c8c8c;
}

.loading-spinner {
  width: 30px;
  height: 30px;
  border: 3px solid #f3f3f3;
  border-top: 3px solid #1677ff;
  border-radius: 50%;
  animation: spin 1s linear infinite;
  margin-bottom: 15px;
}

@keyframes spin {
  0% { transform: rotate(0deg); }
  100% { transform: rotate(360deg); }
}

/* 空状态 */
.empty-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 50px 0;
  color: #8c8c8c;
}

.empty-icon {
  font-size: 48px;
  margin-bottom: 15px;
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
</style>