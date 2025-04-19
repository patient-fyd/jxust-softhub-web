<template>
  <div class="editor-root">
    <div class="editor-container">
      <div class="editor-header">
        <input
          type="text"
          class="title-input"
          placeholder="输入文章标题..."
          v-model="blogData.title"
          @input="handleTitleChange"
        />
        <div class="actions">
          <button class="secondary-btn" @click="saveDraft">草稿箱</button>
          <button class="primary-btn" @click="openPublishModal">发布</button>
        </div>
      </div>

      <div class="editor-main">
        <MarkdownEditor
          v-model="blogData.content"
          @change="handleEditorChange"
          @save="handleAutoSave"
          :autoSave="true"
        />
      </div>

      <!-- 发布确认模态框 -->
      <div class="modal-overlay" v-if="showPublishModal" @click="showPublishModal = false">
        <div class="modal-content publish-modal" @click.stop>
          <h2>发布文章</h2>
          
          <div class="form-group">
            <label for="category">文章分类</label>
            <select id="category" v-model="blogData.category" class="form-control">
              <option value="">请选择分类（必填）</option>
              <option v-for="category in categories" :key="category" :value="category">
                {{ category }}
              </option>
            </select>
          </div>
          
          <div class="form-group">
            <label for="tags">文章标签</label>
            <input 
              type="text" 
              id="tags" 
              v-model="blogData.tags" 
              placeholder="多个标签用逗号分隔，如：Vue,JavaScript,前端" 
              class="form-control"
            />
          </div>

          <div class="form-group">
            <label for="summary">文章摘要</label>
            <textarea 
              id="summary" 
              v-model="blogData.summary" 
              placeholder="请输入文章摘要（可选，不填则自动截取内容前部分）" 
              class="form-control"
              rows="3"
            ></textarea>
          </div>

          <div class="form-group">
            <label for="coverImage">封面图片</label>
            <div class="cover-upload">
              <div 
                class="cover-preview" 
                :style="blogData.coverImage ? `background-image: url(${blogData.coverImage})` : ''"
                @click="triggerFileInput"
              >
                <div v-if="!blogData.coverImage" class="upload-placeholder">
                  <i class="upload-icon">📷</i>
                  <span>点击上传封面图片</span>
                </div>
                <button v-else class="remove-cover" @click.stop="removeCoverImage">×</button>
              </div>
              <input 
                type="file" 
                ref="fileInput" 
                style="display: none" 
                accept="image/*" 
                @change="handleCoverUpload"
              />
            </div>
          </div>
          
          <div v-if="publishWarnings.length > 0" class="warning">
            <strong>注意：</strong>
            <ul>
              <li v-for="(warning, index) in publishWarnings" :key="index">{{ warning }}</li>
            </ul>
          </div>
          
          <div class="modal-actions">
            <button class="secondary-btn" @click="showPublishModal = false">取消</button>
            <button 
              class="primary-btn" 
              @click="publishBlog" 
              :disabled="isPublishing || publishWarnings.length > 0"
            >
              {{ isPublishing ? '发布中...' : '确认发布' }}
            </button>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import { ref, computed, onMounted, watch } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import MarkdownEditor from '@/components/editor/MarkdownEditor.vue';
import { blogService } from '../../services/blogService';

export default {
  components: {
    MarkdownEditor
  },
  setup() {
    const route = useRoute();
    const router = useRouter();
    const fileInput = ref(null);
    let autoSaveTimer = null;

    // 编辑模式标识
    const isEdit = computed(() => Boolean(route.query.blogId));

    // 模拟博客分类数据
    const categories = ref([
      '前端开发',
      '后端开发',
      '移动开发',
      '人工智能',
      '数据结构',
      '算法',
      '编程语言',
      '开发工具',
      '操作系统',
      '网络安全',
      '数据库',
      '软件工程',
      '计算机基础',
      '其他'
    ]);

    // 博客数据
    const blogData = ref({
      blogId: 0,
      title: '',
      content: '',
      summary: '',
      category: '',
      tags: '',
      coverImage: '',
      status: 0 // 0-草稿，1-发布，2-下架
    });
    
    // 状态栏数据与控制
    const charCount = ref(0);
    const lineCount = ref(1);
    const contentCount = ref(0);
    const syncScroll = ref(true);

    // 监听内容变化，更新状态栏
    watch(() => blogData.value.content, (newVal) => {
      if (newVal) {
        charCount.value = newVal.length;
        lineCount.value = newVal.split(/\r\n|\r|\n/).length;
        contentCount.value = newVal.replace(/\s+/g, '').length;
      }
    });

    // 切换滚动同步
    const toggleSyncScroll = () => {
      syncScroll.value = !syncScroll.value;
      // ByteMD 自带同步滚动如果需要，可在此接入
    };

    // 滚动到顶部
    const scrollToTop = () => {
      const editorEl = document.querySelector('.bytemd-body .bytemd-editor');
      if (editorEl) editorEl.scrollTop = 0;
    };

    // 标题变化处理
    const handleTitleChange = () => {
      // 延时自动保存
      if (autoSaveTimer) clearTimeout(autoSaveTimer);
      autoSaveTimer = setTimeout(() => {
        autoSave();
      }, 3000);
    };

    // 编辑器内容变化处理
    const handleEditorChange = () => {
      // 内容变化不自动保存，使用MarkdownEditor组件内的autosave功能
    };

    // 接收MarkdownEditor组件触发的自动保存事件
    const handleAutoSave = () => {
      autoSave();
    };

    // 自动保存
    const autoSave = async () => {
      if (!blogData.value.title.trim() || !blogData.value.content.trim()) return;
      
      try {
        // 设置为草稿状态
        blogData.value.status = 0;
        
        if (isEdit.value) {
          await fetch(`/api/blog/v1/blog/update/${blogData.value.blogId}`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(blogData.value)
          });
        } else {
          const response = await fetch('/api/blog/v1/blog/create', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(blogData.value)
          });
          const result = await response.json();
          
          if (result.code === 0) {
            // 创建成功后跳转到编辑模式
            router.replace({
              path: '/blog/editor',
              query: { blogId: result.data.blogId }
            });
          }
        }
      } catch (error) {
        console.error('自动保存失败:', error);
      }
    };

    // 发布前警告信息
    const publishWarnings = computed(() => {
      const warnings = [];
      
      if (!blogData.value.title.trim()) {
        warnings.push('文章标题不能为空');
      }
      
      if (!blogData.value.content.trim()) {
        warnings.push('文章内容不能为空');
      }
      
      if (!blogData.value.category) {
        warnings.push('请选择文章分类');
      }
      
      return warnings;
    });

    // 发布相关状态
    const showPublishModal = ref(false);
    const isPublishing = ref(false);

    // 加载博客详情（编辑模式）
    const loadBlogDetail = async () => {
      if (isEdit.value && route.query.blogId) {
        try {
          const blogId = Number(route.query.blogId);
          const response = await blogService.getBlogDetail(blogId);
          
          if (response.code === 0 && response.data) {
            const blog = response.data;
            blogData.value = {
              blogId: blog.blogId || blog.id || 0,
              title: blog.title || '',
              content: blog.content || '',
              summary: blog.summary || '',
              category: blog.category || '',
              tags: blog.tags || '',
              coverImage: blog.coverImage || '',
              status: blog.status || 0
            };
          } else {
            // 加载失败处理
            console.error('加载博客详情失败:', response.msg);
          }
        } catch (error) {
          console.error('加载博客详情出错:', error);
        }
      }
    };

    // 触发文件选择
    const triggerFileInput = () => {
      if (fileInput.value) {
        fileInput.value.click();
      }
    };

    // 处理封面图片上传
    const handleCoverUpload = async (event) => {
      const target = event.target;
      if (target.files && target.files.length > 0) {
        const file = target.files[0];
        
        // 这里应该上传图片到服务器，暂时使用本地 URL 预览
        try {
          // 临时使用本地 URL 预览
          blogData.value.coverImage = URL.createObjectURL(file);
        } catch (error) {
          console.error('上传封面图片失败:', error);
        }
        
        // 重置文件输入
        target.value = '';
      }
    };

    // 移除封面图片
    const removeCoverImage = () => {
      blogData.value.coverImage = '';
    };

    // 保存为草稿
    const saveDraft = async () => {
      if (!blogData.value.title.trim()) {
        alert('文章标题不能为空');
        return;
      }
      
      try {
        // 设置为草稿状态
        blogData.value.status = 0;
        
        if (isEdit.value) {
          // 更新博客 - 示例API（实际需根据你的API实现）
          const response = await fetch(`/api/blog/v1/blog/update/${blogData.value.blogId}`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(blogData.value)
          });
          const result = await response.json();
          
          if (result.code === 0) {
            alert('草稿保存成功');
          } else {
            alert('草稿保存失败: ' + result.msg);
          }
        } else {
          // 创建新博客 - 示例API（实际需根据你的API实现）
          const response = await fetch('/api/blog/v1/blog/create', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(blogData.value)
          });
          const result = await response.json();
          
          if (result.code === 0) {
            // 创建成功后跳转到编辑模式
            router.replace({
              path: '/blog/editor',
              query: { blogId: result.data.blogId }
            });
            alert('草稿保存成功');
          } else {
            alert('草稿保存失败: ' + result.msg);
          }
        }
      } catch (error) {
        console.error('保存草稿失败:', error);
        alert('保存草稿失败，请稍后重试');
      }
    };

    // 打开发布确认对话框
    const openPublishModal = () => {
      if (blogData.value.title.trim() && blogData.value.content.trim()) {
        showPublishModal.value = true;
      } else {
        if (!blogData.value.title.trim()) {
          alert('文章标题不能为空');
        } else if (!blogData.value.content.trim()) {
          alert('文章内容不能为空');
        }
      }
    };

    // 发布博客
    const publishBlog = async () => {
      if (publishWarnings.value.length > 0 || isPublishing.value) {
        return;
      }
      
      isPublishing.value = true;
      
      try {
        // 设置为发布状态
        blogData.value.status = 1;
        
        if (isEdit.value) {
          // 更新博客 - 示例API
          const response = await fetch(`/api/blog/v1/blog/update/${blogData.value.blogId}`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(blogData.value)
          });
          const result = await response.json();
          
          if (result.code === 0) {
            showPublishModal.value = false;
            alert('文章发布成功');
            router.push('/blog');
          } else {
            alert('文章发布失败: ' + result.msg);
          }
        } else {
          // 创建新博客 - 示例API
          const response = await fetch('/api/blog/v1/blog/create', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(blogData.value)
          });
          const result = await response.json();
          
          if (result.code === 0) {
            showPublishModal.value = false;
            alert('文章发布成功');
            router.push('/blog');
          } else {
            alert('文章发布失败: ' + result.msg);
          }
        }
      } catch (error) {
        console.error('发布文章失败:', error);
        alert('发布文章失败，请稍后重试');
      } finally {
        isPublishing.value = false;
      }
    };

    onMounted(() => {
      // 编辑模式下加载博客详情
      if (isEdit.value) {
        loadBlogDetail();
      }
    });

    return {
      blogData,
      categories,
      fileInput,
      isEdit,
      showPublishModal,
      isPublishing,
      publishWarnings,
      handleTitleChange,
      handleEditorChange,
      handleAutoSave,
      triggerFileInput,
      handleCoverUpload,
      removeCoverImage,
      saveDraft,
      openPublishModal,
      publishBlog,
      charCount,
      lineCount,
      contentCount,
      syncScroll,
      toggleSyncScroll,
      scrollToTop
    };
  }
}
</script>

<style>
* {
  box-sizing: border-box;
  margin: 0;
  padding: 0;
}

.editor-root {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  width: 100%;
  height: 100%;
  overflow: hidden;
  background-color: #ffffff;
}

.editor-container {
  display: flex;
  flex-direction: column;
  width: 100%;
  height: 100%;
  overflow: hidden;
}

.editor-header {
  display: flex;
  align-items: center;
  height: 56px;
  padding: 0 20px;
  background-color: #ffffff;
  border-bottom: 1px solid #ebeef5;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.05);
  width: 100%;
}

.editor-main {
  flex: 1;
  display: flex;
  position: relative;
  overflow: hidden;
  width: 100%;
  height: calc(100vh - 56px); /* 设置为视口高度减去头部高度 */
}

.title-input {
  flex: 1;
  height: 36px;
  padding: 0 12px;
  font-size: 16px;
  color: #303133;
  background-color: #f5f7fa;
  border: 1px solid #dcdfe6;
  border-radius: 2px;
  margin-right: 16px;
  transition: border-color 0.3s, box-shadow 0.3s;
}

.title-input:focus {
  border-color: #409eff;
  box-shadow: 0 0 0 2px rgba(64,158,255,0.2);
  background-color: #ffffff;
}

.primary-btn {
  background-color: #409eff;
  color: #ffffff;
  border: 1px solid #409eff;
  padding: 8px 16px;
  border-radius: 4px;
  font-weight: 500;
  cursor: pointer;
  transition: background-color 0.3s, box-shadow 0.3s;
}

.primary-btn:hover {
  background-color: #66b1ff;
  box-shadow: 0 2px 6px rgba(0,0,0,0.1);
}

.primary-btn:disabled {
  background-color: #a0cfff;
  border-color: #a0cfff;
  color: #ffffff;
  cursor: not-allowed;
  box-shadow: none;
}

.secondary-btn {
  background-color: #ffffff;
  color: #409eff;
  border: 1px solid #409eff;
  padding: 8px 16px;
  border-radius: 4px;
  font-weight: 500;
  cursor: pointer;
  transition: background-color 0.3s, box-shadow 0.3s;
}

.secondary-btn:hover {
  background-color: #ecf5ff;
  box-shadow: 0 2px 6px rgba(0,0,0,0.05);
}

.actions {
  display: flex;
  gap: 12px;
}

:deep(.bytemd) {
  width: 100%;
  height: 100%;
  display: flex;
  flex-direction: column;
}

:deep(.bytemd-toolbar) {
  flex-shrink: 0;
  width: 100% !important;
  display: flex;
  justify-content: space-between;
  background-color: #f5f7fa;
  border-bottom: 1px solid #ebeef5;
  padding: 8px 16px;
  box-sizing: border-box;
}

:deep(.bytemd-toolbar-left) {
  display: flex;
  flex-wrap: wrap;
  gap: 4px;
  align-items: center;
}

:deep(.bytemd-toolbar-right) {
  display: flex;
  gap: 4px;
  align-items: center;
}

:deep(.bytemd-toolbar-icon) {
  width: 36px;
  height: 36px;
  display: flex;
  align-items: center;
  justify-content: center;
  color: #606266;
  border-radius: 4px;
  background-color: transparent;
  transition: all 0.2s;
}

:deep(.bytemd-toolbar-icon:hover),
:deep(.bytemd-toolbar-icon.bytemd-tippy-active) {
  background-color: rgba(64, 158, 255, 0.1);
  color: #409eff;
}

:deep(.bytemd-body) {
  flex: 1;
  display: flex;
  overflow: hidden;
  width: 100%;
}

:deep(.bytemd-split) {
  display: flex;
  width: 100%;
  height: 100%;
  background-color: #ffffff;
}

:deep(.bytemd-editor),
:deep(.bytemd-preview) {
  width: 50% !important;
  flex: 0 0 50%;
  overflow: auto;
}

.status-left,
.status-right {
  display: flex;
  align-items: center;
  gap: 12px;
}

/* 自动保存提示 */
.autosave-indicator {
  position: fixed;
  top: 20px;
  right: 20px;
  background-color: #67c23a;
  color: white;
  padding: 8px 16px;
  border-radius: 4px;
  box-shadow: 0 2px 12px rgba(0, 0, 0, 0.1);
  z-index: 1000;
  opacity: 0;
  animation: fade-in-out 2s ease-in-out;
}

@keyframes fade-in-out {
  0% { opacity: 0; }
  20% { opacity: 1; }
  80% { opacity: 1; }
  100% { opacity: 0; }
}

/* 模态框样式 */
.modal-overlay {
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

.modal-content {
  background-color: white;
  padding: 24px;
  border-radius: 4px;
  width: 500px;
  max-width: 90%;
  max-height: 90vh;
  overflow-y: auto;
  box-shadow: 0 2px 12px rgba(0, 0, 0, 0.1);
}

.publish-modal {
  width: 500px;
}

.modal-content h2 {
  margin-top: 0;
  color: #303133;
  margin-bottom: 20px;
  font-weight: 500;
}

.warning {
  background-color: #fef0f0;
  border-left: 4px solid #f56c6c;
  padding: 12px;
  margin: 16px 0;
  border-radius: 4px;
  color: #f56c6c;
}

.warning ul {
  margin-top: 8px;
  padding-left: 24px;
}

.modal-actions {
  display: flex;
  justify-content: flex-end;
  gap: 12px;
  margin-top: 24px;
}

/* 表单控件样式 */
.form-group {
  margin-bottom: 20px;
}

label {
  display: block;
  margin-bottom: 8px;
  color: #606266;
  font-weight: 400;
}

.form-control {
  width: 100%;
  padding: 8px 12px;
  border: 1px solid #dcdfe6;
  border-radius: 4px;
  font-size: 14px;
  transition: border-color 0.3s ease;
  background-color: #f5f7fa;
  color: #303133;
}

.form-control:focus {
  outline: none;
  border-color: #409eff;
  box-shadow: 0 0 0 2px rgba(64,158,255,0.2);
  background-color: #ffffff;
}

select.form-control {
  appearance: none;
  background-image: url("data:image/svg+xml;charset=utf-8,%3Csvg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 20 20'%3E%3Cpath stroke='%23606266' stroke-linecap='round' stroke-linejoin='round' stroke-width='1.5' d='M6 8l4 4 4-4'/%3E%3C/svg%3E");
  background-position: right 0.5rem center;
  background-repeat: no-repeat;
  background-size: 1.5em 1.5em;
  padding-right: 2.5rem;
  background-color: #f5f7fa;
}

textarea.form-control {
  resize: vertical;
  min-height: 60px;
}

/* 封面上传样式 */
.cover-upload {
  width: 100%;
}

.cover-preview {
  width: 100%;
  height: 120px;
  border: 2px dashed #dcdfe6;
  border-radius: 4px;
  background-color: #f5f7fa;
  background-size: cover;
  background-position: center;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  position: relative;
  transition: all 0.3s ease;
}

.cover-preview:hover {
  border-color: #409eff;
  background-color: #ecf5ff;
}

.upload-placeholder {
  display: flex;
  flex-direction: column;
  align-items: center;
  color: #909399;
}

.upload-icon {
  font-size: 1.5rem;
  margin-bottom: 8px;
}

.remove-cover {
  position: absolute;
  top: 5px;
  right: 5px;
  width: 24px;
  height: 24px;
  border-radius: 50%;
  background-color: rgba(255, 255, 255, 0.8);
  border: none;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 1rem;
  cursor: pointer;
  transition: all 0.3s ease;
}

.remove-cover:hover {
  background-color: white;
  color: #f56c6c;
}

/* 响应式调整 */
@media (max-width: 900px) {
  .editor-header {
    flex-direction: column;
    align-items: flex-start;
    gap: 12px;
    height: auto;
    padding: 12px 16px;
  }
  
  .title-input {
    width: 100%;
    margin-right: 0;
    margin-bottom: 10px;
  }
  
  .actions {
    width: 100%;
  }
  
  .primary-btn, .secondary-btn {
    flex: 1;
  }
  
  .cover-preview {
    height: 160px;
  }
  
  :deep(.bytemd-split) {
    flex-direction: column;
  }
  
  :deep(.bytemd-editor),
  :deep(.bytemd-preview) {
    width: 100% !important;
    flex: 0 0 100%;
    height: 50%;
  }
}

/* 确保编辑器填满容器 */
:deep(.markdown-editor-container) {
  flex: 1;
  height: 100%;
}
</style>