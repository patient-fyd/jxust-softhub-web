<template>
  <div class="markdown-editor-container">
    <Editor
      :value="modelValue"
      :plugins="plugins"
      :locale="locale"
      :uploadImages="uploadImages"
      mode="split"
      @change="handleEditorChange"
    />
    <div class="save-indicator" v-if="showSaveIndicator">
      <span>保存成功</span>
    </div>
  </div>
</template>

<script>
import { defineComponent, ref } from 'vue';

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

import { blogService } from '@/services/blogService';

export default defineComponent({
  name: 'MarkdownEditor',
  components: {
    Editor
  },
  props: {
    modelValue: {
      type: String,
      default: ''
    },
    autoSave: {
      type: Boolean,
      default: false
    }
  },
  emits: ['update:modelValue', 'change', 'save'],
  setup(props, { emit }) {
    // 创建保存指示器状态
    const showSaveIndicator = ref(false);
    let saveIndicatorTimer = null;

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

    // 显示上传中提示
    const showUploadingToast = () => {
      const toast = document.createElement('div');
      toast.className = 'upload-toast';
      toast.textContent = '图片上传中...';
      document.body.appendChild(toast);
      return toast;
    };

    // 显示错误提示
    const showErrorToast = (message) => {
      const toast = document.createElement('div');
      toast.className = 'upload-toast error';
      toast.textContent = message;
      document.body.appendChild(toast);
      
      setTimeout(() => {
        document.body.removeChild(toast);
      }, 3000);
    };

    // 图片上传处理
    const uploadImages = async (files) => {
      try {
        // 显示上传中提示
        const toast = showUploadingToast();
        
        // 上传单个图片
        const uploadPromises = files.map(async (file) => {
          try {
            const response = await blogService.uploadImage(file);
            if (response.code === 0 && response.data) {
              return response.data.url; // 返回图片URL
            } else {
              showErrorToast(`上传失败: ${response.msg || '未知错误'}`);
              return null;
            }
          } catch (error) {
            console.error('图片上传错误:', error);
            showErrorToast('图片上传失败，请重试');
            return null;
          }
        });
        
        // 等待所有图片上传完成
        const urls = await Promise.all(uploadPromises);
        
        // 关闭上传中提示
        if (toast && toast.parentNode) {
          document.body.removeChild(toast);
        }
        
        // 过滤掉上传失败的图片
        return urls.filter((url) => url !== null);
      } catch (error) {
        console.error('图片批量上传错误:', error);
        showErrorToast('图片上传失败，请重试');
        return [];
      }
    };

    // 显示保存成功指示器
    const showSaveSuccess = () => {
      showSaveIndicator.value = true;
      
      // 清除之前的定时器
      if (saveIndicatorTimer) {
        clearTimeout(saveIndicatorTimer);
      }
      
      // 设置新的定时器，3秒后自动隐藏
      saveIndicatorTimer = setTimeout(() => {
        showSaveIndicator.value = false;
      }, 3000);
    };

    // 编辑器内容变化处理
    const handleEditorChange = (v) => {
      emit('update:modelValue', v);
      emit('change', v);
      
      if (props.autoSave) {
        emit('save', v);
        showSaveSuccess();
      }
    };

    return {
      plugins,
      locale,
      uploadImages,
      handleEditorChange,
      showSaveIndicator
    };
  }
});
</script>

<style>
.markdown-editor-container {
  width: 100%;
  height: 100%;
  display: flex;
  flex-direction: column;
  position: relative;
}

.save-indicator {
  position: fixed;
  top: 20px;
  right: 20px;
  background-color: rgba(25, 135, 84, 0.9);
  color: white;
  padding: 8px 16px;
  border-radius: 4px;
  font-size: 14px;
  z-index: 9999;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.15);
  animation: fadeInOut 3s ease-in-out;
  display: flex;
  align-items: center;
  gap: 6px;
}

.save-indicator::before {
  content: "✓";
  font-weight: bold;
}

.upload-toast {
  position: fixed;
  top: 20px;
  left: 50%;
  transform: translateX(-50%);
  background-color: rgba(0, 0, 0, 0.7);
  color: white;
  padding: 10px 20px;
  border-radius: 4px;
  font-size: 14px;
  z-index: 9999;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.2);
}

.upload-toast.error {
  background-color: rgba(220, 53, 69, 0.9);
  animation: fadeInOut 3s ease-in-out;
}

@keyframes fadeInOut {
  0% { opacity: 0; transform: translateY(-10px) translateX(-50%); }
  10% { opacity: 1; transform: translateY(0) translateX(-50%); }
  90% { opacity: 1; }
  100% { opacity: 0; }
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

/* 响应式调整 */
@media (max-width: 900px) {
  :deep(.bytemd-split) {
    flex-direction: column;
  }
  
  :deep(.bytemd-editor),
  :deep(.bytemd-preview) {
    width: 100% !important;
    flex: 0 0 100%;
    height: 50%;
  }
  
  .upload-toast {
    width: 80%;
    text-align: center;
  }
}
</style> 