<template>
  <div class="blog-editor-container">
    <div class="editor-top-bar">
      <input
        type="text"
        class="title-input"
        placeholder="输入文章标题..."
        v-model="blogData.title"
      />
      <div class="actions">
        <button class="secondary-btn" @click="saveDraft">草稿箱</button>
        <button class="primary-btn" @click="openPublishModal">发布</button>
      </div>
    </div>

    <div class="editor-wrapper">
      <Editor
        :value="blogData.content"
        :plugins="plugins"
        :locale="locale"
        :uploadImages="uploadImages"
        mode="split"
        @change="handleEditorChange"
      />
    </div>

    <!-- 编辑器状态栏 -->
    <div class="editor-status-bar">
      <div class="status-left">
        <span>字符数: {{ charCount }} 行数: {{ lineCount }} 正文字数: {{ contentCount }}</span>
      </div>
      <div class="status-right">
        <button @click="toggleSyncScroll">{{ syncScroll ? '同步滚动' : '取消同步' }}</button>
        <button @click="scrollToTop">回到顶头</button>
      </div>
    </div>

    <!-- 自动保存提示 -->
    <div class="autosave-indicator" v-if="showSaveIndicator">
      保存成功
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
</template>

<script>
import { ref, computed, onMounted, watch } from 'vue';
import { useRoute, useRouter } from 'vue-router';

// 导入ByteMD编辑器
import { Editor } from '@bytemd/vue-next';
import 'bytemd/dist/index.css';

// 导入ByteMD插件
import gfm from '@bytemd/plugin-gfm';
import highlight from '@bytemd/plugin-highlight';
import math from '@bytemd/plugin-math';
import mermaid from '@bytemd/plugin-mermaid';
// 导入额外插件
import breaks from '@bytemd/plugin-breaks';
import gemoji from '@bytemd/plugin-gemoji';
import mediumZoom from '@bytemd/plugin-medium-zoom';

// 导入样式
import 'highlight.js/styles/github.css';
import 'katex/dist/katex.css';

// 引入博客服务
import { blogService } from '../../services/blogService';

export default {
  components: {
    Editor
  },
  setup() {
    // 配置ByteMD插件
    const plugins = [
      gfm(),
      highlight(),
      math(),
      mermaid(),
      breaks(),
      gemoji(),
      mediumZoom()
    ];

    // 中文本地化配置
    const locale = {
      fullscreen: '全屏',
      preview: '预览',
      write: '编辑',
      uploadImage: '上传图片',
      imgTitle: '图片',
      bold: '粗体',
      italic: '斜体',
      header: '标题',
      quote: '引用',
      code: '代码',
      link: '链接',
      orderedList: '有序列表',
      unorderedList: '无序列表',
      table: '表格'
    };

    // 编辑器模式固定为分栏模式
    const mode = "split";

    // 图片上传功能
    const uploadImages = async (files) => {
      // 模拟图片上传，实际项目中应该上传到服务器
      return files.map(file => ({
        url: URL.createObjectURL(file),
        alt: file.name
      }));
    };

    const route = useRoute();
    const router = useRouter();
    const fileInput = ref(null);
    const showSaveIndicator = ref(false);
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

    // 编辑器内容变化处理
    const handleEditorChange = (v) => {
      blogData.value.content = v;
      // 设置自动保存
      if (autoSaveTimer) clearTimeout(autoSaveTimer);
      autoSaveTimer = setTimeout(() => {
        autoSave();
      }, 3000);
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
        // 显示保存成功提示
        showSaveIndicator.value = true;
        setTimeout(() => {
          showSaveIndicator.value = false;
        }, 2000);
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

    // 发布相关状态
    const showPublishModal = ref(false);
    const isPublishing = ref(false);

    onMounted(() => {
      // 编辑模式下加载博客详情
      if (isEdit.value) {
        loadBlogDetail();
      }
    });

    return {
      plugins,
      locale,
      mode,
      uploadImages,
      blogData,
      categories,
      fileInput,
      isEdit,
      showPublishModal,
      isPublishing,
      publishWarnings,
      showSaveIndicator,
      handleEditorChange,
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

<style scoped>
/* 1. 整体容器：布满整个页面 */
.blog-editor-container {
  max-width: 100%;
  margin: 0;
  padding: 0;
  background-color: #ffffff;
  border: none;
  border-radius: 0;
  box-shadow: none;
  display: flex;
  flex-direction: column;
  position: relative;
  height: 100vh;
  overflow: hidden;
}

/* 2. 顶部工具栏：简约分割 */
.editor-top-bar {
  display: flex;
  align-items: center;
  height: 56px;
  padding: 0 20px;
  background-color: #ffffff;
  border-bottom: 1px solid #ebeef5;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.05);
}

/* 3. 标题输入框：扁平化与留白 */
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

/* 4. 操作按钮：主次分明 */
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

/* 5. 编辑器主体：占满剩余空间 */
.editor-wrapper {
  flex: 1;
  display: flex;
  background-color: #ffffff;
  overflow: hidden;
  height: calc(100vh - 56px);
  border: none;
}

/* 编辑器基本样式 */
:deep(.bytemd) {
  height: 100% !important;
  border: none !important;
  display: flex;
  flex-direction: column;
  width: 100%;
  overflow: hidden;
}

/* 工具栏样式优化 */
:deep(.bytemd-toolbar) {
  border-bottom: 1px solid #ebeef5;
  background-color: #f5f7fa;
  padding: 10px 16px;
  display: flex;
  flex-wrap: nowrap;
  justify-content: space-between;
  width: 100%;
  z-index: 10;
  overflow-x: auto;
  white-space: nowrap;
  -webkit-overflow-scrolling: touch;
  scrollbar-width: thin;
  position: sticky;
  top: 0;
}

:deep(.bytemd-toolbar-left) {
  display: flex;
  flex-wrap: nowrap;
  gap: 8px;
  align-items: center;
  width: 100%;
}

:deep(.bytemd-toolbar-right) {
  display: flex;
  gap: 8px;
  margin-left: 20px;
  align-items: center;
  flex-shrink: 0;
}

:deep(.bytemd-toolbar-icon) {
  color: #606266;
  height: 42px;
  width: 42px;
  margin: 0;
  border-radius: 4px;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.2s ease;
  background-color: transparent;
  flex-shrink: 0;
}

:deep(.bytemd-toolbar-icon:hover) {
  background-color: #e4e7ed;
  color: #409eff;
}

:deep(.bytemd-toolbar-icon.bytemd-tippy-active) {
  background-color: #ecf5ff;
  color: #409eff;
}

:deep(.bytemd-toolbar-icon svg) {
  width: 20px;
  height: 20px;
}

/* 编辑区域和预览区域样式 */
:deep(.bytemd-body) {
  flex: 1;
  display: flex;
  overflow: hidden;
  border: none;
  height: calc(100vh - 140px); /* 110px + 30px(状态栏) */
}

/* 确保编辑和预览区域的固定宽度 */
:deep(.bytemd-editor) {
  width: 50% !important;
  max-width: 50% !important;
  flex: 0 0 50% !important;
  border-right: 1px solid #ebeef5;
  overflow: auto;
  display: flex;
  flex-direction: column;
  background-color: #ffffff;
}

:deep(.bytemd-preview) {
  width: 50% !important;
  max-width: 50% !important;
  flex: 0 0 50% !important;
  background-color: #ffffff;
  padding: 0;
  overflow: auto;
}

:deep(.bytemd-fullscreen) {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  z-index: 10000;
}

:deep(.bytemd-fullscreen .bytemd-body) {
  height: calc(100vh - 54px);
}

/* 代码编辑区域样式 */
:deep(.CodeMirror) {
  height: 100% !important;
  font-family: 'Menlo', 'Monaco', 'Consolas', monospace;
  font-size: 14px;
  line-height: 1.6;
  color: #303133;
  padding: 0;
  background-color: #ffffff;
}

:deep(.CodeMirror-scroll) {
  min-height: 100%;
}

:deep(.CodeMirror-lines) {
  padding: 16px;
}

:deep(.CodeMirror-line) {
  padding: 0;
}

:deep(.CodeMirror-gutters) {
  border-right: 1px solid #ebeef5;
  background-color: #f5f7fa;
}

/* Markdown 预览样式 */
:deep(.bytemd-preview .markdown-body) {
  padding: 16px;
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', sans-serif;
  color: #303133;
  line-height: 1.6;
}

:deep(.bytemd-preview .markdown-body pre) {
  background-color: #f5f7fa;
  border-radius: 2px;
  font-family: 'Menlo', 'Monaco', 'Consolas', monospace;
}

:deep(.markdown-body code:not([class*="language-"])) {
  background-color: #f5f7fa;
  border-radius: 2px;
  padding: 0.2em 0.4em;
  font-family: 'Menlo', 'Monaco', 'Consolas', monospace;
}

:deep(.hljs) {
  padding: 16px;
  border-radius: 2px;
}

/* GitHub风格的Markdown预览样式 */
:deep(.markdown-body) {
  color: #303133;
  line-height: 1.6;
  font-size: 14px;
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;
}

:deep(.markdown-body h1) {
  padding-bottom: 0.3em;
  border-bottom: 1px solid #ebeef5;
  font-size: 2em;
  margin-top: 1.5em;
  margin-bottom: 0.5em;
  color: #303133;
}

:deep(.markdown-body h2) {
  padding-bottom: 0.3em;
  border-bottom: 1px solid #ebeef5;
  font-size: 1.5em;
  margin-top: 1.5em;
  margin-bottom: 0.5em;
  color: #303133;
}

:deep(.markdown-body h3) {
  font-size: 1.25em;
  margin-top: 1.5em;
  margin-bottom: 0.5em;
  color: #303133;
}

:deep(.markdown-body h4) {
  font-size: 1em;
  margin-top: 1.5em;
  margin-bottom: 0.5em;
  color: #303133;
}

:deep(.markdown-body p) {
  margin-top: 0;
  margin-bottom: 16px;
}

:deep(.markdown-body a) {
  color: #409eff;
  text-decoration: none;
}

:deep(.markdown-body a:hover) {
  text-decoration: underline;
}

:deep(.markdown-body table) {
  border-collapse: collapse;
  width: 100%;
  margin: 16px 0;
  display: block;
  overflow-x: auto;
}

:deep(.markdown-body table th, .markdown-body table td) {
  padding: 6px 13px;
  border: 1px solid #ebeef5;
}

:deep(.markdown-body table th) {
  background-color: #f5f7fa;
  font-weight: 600;
  color: #303133;
}

:deep(.markdown-body table tr:nth-child(2n)) {
  background-color: #fafafa;
}

:deep(.markdown-body img) {
  max-width: 100%;
  box-sizing: content-box;
  background-color: #fff;
  border-radius: 2px;
}

:deep(.markdown-body blockquote) {
  padding: 0 1em;
  color: #606266;
  border-left: 0.25em solid #dcdfe6;
  margin: 0 0 16px 0;
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

.actions {
  display: flex;
  gap: 12px;
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
  .editor-top-bar {
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
  
  :deep(.bytemd-body) {
    height: calc(100vh - 130px);
  }
  
  :deep(.bytemd-editor),
  :deep(.bytemd-preview) {
    width: 100%;
    max-width: 100%;
  }
  
  :deep(.bytemd-split) {
    flex-direction: column;
  }
}

/* 全屏工具栏的样式优化 */
:deep(.bytemd-fullscreen .bytemd-toolbar) {
  padding: 8px 16px;
  background-color: #f5f7fa;
  border-bottom: 1px solid #ebeef5;
}

:deep(.bytemd-split) {
  display: flex;
  width: 100%;
  height: 100%;
  overflow: hidden;
}
  /* 编辑器状态栏样式 */
  .editor-status-bar {
    position: fixed;
    bottom: 0;
    left: 0;
    right: 0;
    height: 30px;
    background-color: #f5f7fa;
    border-top: 1px solid #ebeef5;
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 0 12px;
    font-size: 12px;
    color: #606266;
    z-index: 10;
  }
  .editor-status-bar .status-left,
  .editor-status-bar .status-right {
    display: flex;
    align-items: center;
    gap: 12px;
  }
  .editor-status-bar button {
    background: none;
    border: none;
    cursor: pointer;
    color: #409eff;
    padding: 0;
    font-size: 12px;
  }
  .editor-status-bar button:hover {
    text-decoration: underline;
  }
</style>