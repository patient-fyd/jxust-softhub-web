<template>
  <div v-if="dialogVisible" class="modal-overlay">
    <div class="modal-container">
      <div class="modal-header">
        <h3 class="modal-title">上传资源</h3>
        <button class="modal-close-btn" @click="handleClose">&times;</button>
      </div>
      
      <div class="modal-body">
        <form ref="formRef" @submit.prevent="submitForm" class="upload-form">
          <!-- 资源名称 -->
          <div class="form-group">
            <label for="resource-name">资源名称</label>
            <input 
              id="resource-name"
              type="text" 
              v-model="form.name" 
              placeholder="请输入资源名称"
              class="form-control"
              :class="{'has-error': hasError('name')}"
            >
            <div v-if="hasError('name')" class="error-message">请输入资源名称</div>
          </div>

          <!-- 资源描述 -->
          <div class="form-group">
            <label for="resource-description">资源描述</label>
            <textarea 
              id="resource-description"
              v-model="form.description" 
              rows="3" 
              placeholder="请输入资源描述"
              class="form-control"
              :class="{'has-error': hasError('description')}"
            ></textarea>
            <div v-if="hasError('description')" class="error-message">请输入资源描述</div>
          </div>

          <!-- 资源分类 -->
          <div class="form-group">
            <label for="resource-category">资源分类</label>
            <select 
              id="resource-category"
              v-model="form.categoryId" 
              class="form-control"
              :class="{'has-error': hasError('categoryId')}"
            >
              <option value="" disabled selected>请选择资源分类</option>
              <option 
                v-for="category in categories" 
                :key="category.id" 
                :value="category.id"
              >
                {{ category.name }}
              </option>
            </select>
            <div v-if="hasError('categoryId')" class="error-message">请选择资源分类</div>
          </div>

          <!-- 资源标签 -->
          <div class="form-group">
            <label for="resource-tags">资源标签</label>
            <div class="tags-input-container">
              <div class="selected-tags">
                <span 
                  v-for="(tag, index) in form.tags" 
                  :key="index"
                  class="tag-item"
                >
                  {{ tag }}
                  <span class="tag-remove" @click="removeTag(index)">&times;</span>
                </span>
              </div>
              <input 
                id="resource-tags"
                type="text" 
                v-model="tagInput" 
                @keydown.enter.prevent="addTag"
                placeholder="输入标签后回车添加"
                class="tag-input form-control"
              >
            </div>
            <div class="common-tags">
              <span>常用标签: </span>
              <span 
                v-for="tag in commonTags" 
                :key="tag"
                class="common-tag"
                @click="addCommonTag(tag)"
              >
                {{ tag }}
              </span>
            </div>
          </div>

          <!-- 资源文件 -->
          <div class="form-group">
            <label>资源文件</label>
            <div class="file-upload-container" :class="{'has-error': hasError('file')}">
              <input 
                type="file" 
                ref="fileInput"
                @change="handleFileChange" 
                class="file-input"
                style="display: none"
              >
              <div class="file-upload-box" @click="triggerFileInput">
                <span v-if="!form.file" class="upload-icon">+</span>
                <span v-if="!form.file" class="upload-text">点击选择文件</span>
                <div v-else class="selected-file">
                  <span class="file-name">{{ form.file.name }}</span>
                  <span class="file-size">({{ formatFileSize(form.file.size) }})</span>
                  <button type="button" class="remove-file-btn" @click.stop="handleFileRemove">&times;</button>
                </div>
              </div>
              <div class="upload-tip">支持各类文档、压缩包等格式，单个文件大小不超过100MB</div>
              <div v-if="hasError('file')" class="error-message">请上传资源文件</div>
            </div>
          </div>

          <!-- 资源封面 -->
          <div class="form-group">
            <label>资源封面</label>
            <div class="cover-upload-container">
              <input 
                type="file" 
                ref="coverInput"
                accept="image/jpeg,image/png"
                @change="handleCoverChange" 
                class="cover-input"
                style="display: none"
              >
              <div 
                class="cover-upload-box" 
                @click="triggerCoverInput"
              >
                <img v-if="coverUrl" :src="coverUrl" class="cover-preview" alt="资源封面" />
                <div v-else class="cover-placeholder">
                  <span class="upload-icon">+</span>
                  <div>点击上传封面</div>
                </div>
              </div>
              <div class="cover-upload-tip">
                推荐尺寸: 400 x 300px<br>
                支持jpg、png格式
              </div>
            </div>
          </div>
        </form>
      </div>
      
      <div class="modal-footer">
        <button class="btn btn-default" @click="handleClose">取消</button>
        <button 
          class="btn btn-primary" 
          :disabled="uploading"
          @click="submitForm"
        >
          <span v-if="uploading" class="loading-spinner"></span>
          {{ uploading ? '上传中...' : '上传资源' }}
        </button>
      </div>
    </div>
  </div>
</template>

<script lang="ts">
import { defineComponent, ref, reactive, PropType, computed, watch, onUnmounted } from 'vue';
import type { Category } from '@/views/Resources.vue';

export default defineComponent({
  name: 'UploadResourceModal',
  
  props: {
    visible: {
      type: Boolean,
      default: false
    },
    categories: {
      type: Array as PropType<Category[]>,
      required: true
    }
  },
  
  emits: ['update:visible', 'upload-success', 'close'],
  
  setup(props, { emit }) {
    // 表单引用
    const formRef = ref<HTMLFormElement | null>(null);
    const fileInput = ref<HTMLInputElement | null>(null);
    const coverInput = ref<HTMLInputElement | null>(null);
    
    // 对话框可见性
    const dialogVisible = computed({
      get: () => props.visible,
      set: (val) => emit('update:visible', val)
    });
    
    // 上传状态
    const uploading = ref(false);
    
    // 封面URL
    const coverUrl = ref('');
    const coverFile = ref<File | null>(null);
    
    // 标签输入
    const tagInput = ref('');
    
    // 验证错误
    const formErrors = ref<Record<string, boolean>>({});
    
    // 常用标签
    const commonTags = ref([
      '期末复习', '课程笔记', '习题集', '编程实践', '课件', 
      '实验报告', '项目资料', '参考书籍', '算法', '数据结构'
    ]);
    
    // 表单数据
    const form = reactive({
      name: '',
      description: '',
      categoryId: '',
      tags: [] as string[],
      file: null as File | null,
    });
    
    // 监听对话框可见性变化
    watch(() => props.visible, (newVal) => {
      if (!newVal) {
        resetForm();
      }
    });
    
    // 处理文件选择变化
    const handleFileChange = (event: Event) => {
      const input = event.target as HTMLInputElement;
      if (input.files && input.files.length > 0) {
        const file = input.files[0];
        
        // 检查文件大小
        const isLt100M = file.size / 1024 / 1024 < 100;
        if (!isLt100M) {
          alert('文件大小不能超过 100MB!');
          input.value = '';
          return;
        }
        
        // 保存文件
        form.file = file;
        
        // 如果文件名为空，则使用文件名作为资源名称
        if (!form.name) {
          form.name = file.name.split('.')[0];
        }
      }
    };
    
    // 格式化文件大小
    const formatFileSize = (bytes: number) => {
      if (bytes === 0) return '0 Bytes';
      
      const k = 1024;
      const sizes = ['Bytes', 'KB', 'MB', 'GB'];
      const i = Math.floor(Math.log(bytes) / Math.log(k));
      
      return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
    };
    
    // 处理文件移除
    const handleFileRemove = () => {
      form.file = null;
      if (fileInput.value) {
        fileInput.value.value = '';
      }
    };
    
    // 触发文件选择
    const triggerFileInput = () => {
      fileInput.value?.click();
    };
    
    // 触发封面选择
    const triggerCoverInput = () => {
      coverInput.value?.click();
    };
    
    // 处理封面变化
    const handleCoverChange = (event: Event) => {
      const input = event.target as HTMLInputElement;
      if (input.files && input.files.length > 0) {
        const file = input.files[0];
        
        const isJPG = file.type === 'image/jpeg';
        const isPNG = file.type === 'image/png';
        
        if (!isJPG && !isPNG) {
          alert('封面图片只能是 JPG 或 PNG 格式!');
          input.value = '';
          return;
        }
        
        const isLt2M = file.size / 1024 / 1024 < 2;
        if (!isLt2M) {
          alert('封面图片大小不能超过 2MB!');
          input.value = '';
          return;
        }
        
        // 保存封面文件
        coverFile.value = file;
        
        // 创建预览URL
        coverUrl.value = URL.createObjectURL(file);
      }
    };
    
    // 处理封面移除
    const handleCoverRemove = () => {
      coverFile.value = null;
      coverUrl.value = '';
      if (coverInput.value) {
        coverInput.value.value = '';
      }
    };
    
    // 添加标签
    const addTag = () => {
      const tag = tagInput.value.trim();
      if (tag && !form.tags.includes(tag)) {
        form.tags.push(tag);
      }
      tagInput.value = '';
    };
    
    // 添加常用标签
    const addCommonTag = (tag: string) => {
      if (!form.tags.includes(tag)) {
        form.tags.push(tag);
      }
    };
    
    // 移除标签
    const removeTag = (index: number) => {
      form.tags.splice(index, 1);
    };
    
    // 检查字段是否有错误
    const hasError = (field: string) => {
      return formErrors.value[field] === true;
    };
    
    // 表单验证
    const validateForm = () => {
      const errors: Record<string, boolean> = {};
      
      if (!form.name.trim()) {
        errors.name = true;
      }
      
      if (!form.description.trim()) {
        errors.description = true;
      }
      
      if (!form.categoryId) {
        errors.categoryId = true;
      }
      
      if (!form.file) {
        errors.file = true;
      }
      
      formErrors.value = errors;
      return Object.keys(errors).length === 0;
    };
    
    // 提交表单
    const submitForm = async () => {
      if (!validateForm()) {
        alert('请完善表单信息');
        return;
      }
      
      uploading.value = true;
      
      try {
        // 在实际应用中，这里应该是一个 API 调用
        // 模拟上传过程
        await new Promise(resolve => setTimeout(resolve, 1500));
        
        // 创建表单数据对象
        const formData = new FormData();
        formData.append('name', form.name);
        formData.append('description', form.description);
        formData.append('categoryId', form.categoryId);
        form.tags.forEach(tag => {
          formData.append('tags', tag);
        });
        
        if (form.file) {
          formData.append('file', form.file);
        }
        
        if (coverFile.value) {
          formData.append('cover', coverFile.value);
        }
        
        // 这里应该调用实际的上传 API
        // const response = await resourceService.uploadResource(formData);
        
        alert('资源上传成功');
        
        // 触发上传成功事件
        emit('upload-success', {
          id: Math.floor(Math.random() * 1000), // 模拟ID
          name: form.name,
          description: form.description,
          categoryId: form.categoryId,
          tags: form.tags,
          fileType: form.file ? form.file.name.split('.').pop() : '',
          coverUrl: coverUrl.value || '',
          uploaderName: '当前用户',
          uploadTime: new Date().toISOString(),
          downloadCount: 0
        });
        
        // 关闭对话框
        dialogVisible.value = false;
      } catch (error) {
        console.error('上传失败:', error);
        alert('资源上传失败，请重试');
      } finally {
        uploading.value = false;
      }
    };
    
    // 重置表单
    const resetForm = () => {
      form.name = '';
      form.description = '';
      form.categoryId = '';
      form.tags = [];
      form.file = null;
      if (fileInput.value) {
        fileInput.value.value = '';
      }
      if (coverUrl.value) {
        URL.revokeObjectURL(coverUrl.value);
      }
      coverUrl.value = '';
      coverFile.value = null;
      tagInput.value = '';
      formErrors.value = {};
    };
    
    // 关闭对话框
    const handleClose = () => {
      dialogVisible.value = false;
      emit('close');
    };
    
    // 组件卸载时释放资源
    onUnmounted(() => {
      if (coverUrl.value) {
        URL.revokeObjectURL(coverUrl.value);
      }
    });
    
    return {
      formRef,
      fileInput,
      coverInput,
      dialogVisible,
      form,
      tagInput,
      formErrors,
      uploading,
      coverUrl,
      commonTags,
      hasError,
      triggerFileInput,
      triggerCoverInput,
      handleFileChange,
      formatFileSize,
      handleFileRemove,
      handleCoverChange,
      handleCoverRemove,
      addTag,
      addCommonTag,
      removeTag,
      submitForm,
      handleClose
    };
  }
});
</script>

<style scoped>
.modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background-color: rgba(0, 0, 0, 0.5);
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 2000;
}

.modal-container {
  background-color: #fff;
  border-radius: 12px;
  box-shadow: 0 8px 24px rgba(0, 0, 0, 0.15);
  width: 650px;
  max-width: 95%;
  max-height: 90vh;
  display: flex;
  flex-direction: column;
  overflow: hidden;
  z-index: 2001;
}

.modal-header {
  padding: 18px 24px;
  display: flex;
  justify-content: space-between;
  align-items: center;
  border-bottom: 1px solid #ebeef5;
  background-color: #fff;
}

.modal-title {
  margin: 0;
  font-size: 20px;
  color: #303133;
  font-weight: 600;
}

.modal-close-btn {
  background: transparent;
  border: none;
  font-size: 24px;
  cursor: pointer;
  color: #909399;
  line-height: 1;
  width: 32px;
  height: 32px;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 50%;
  transition: all 0.2s;
}

.modal-close-btn:hover {
  color: #409eff;
  background-color: rgba(64, 158, 255, 0.1);
}

.modal-body {
  padding: 24px;
  overflow-y: auto;
  max-height: calc(90vh - 140px);
  background-color: #fff;
  width: 100%;
  box-sizing: border-box;
}

.modal-footer {
  padding: 16px 24px;
  border-top: 1px solid #ebeef5;
  display: flex;
  justify-content: flex-end;
  gap: 12px;
  background-color: #fff;
}

.upload-form {
  max-height: 60vh;
  overflow-y: auto;
  padding-right: 10px;
  width: 100%;
  box-sizing: border-box;
}

.form-group {
  margin-bottom: 24px;
}

label {
  display: block;
  margin-bottom: 8px;
  color: #606266;
  font-weight: 500;
  font-size: 14px;
}

.form-control {
  width: 100%;
  padding: 10px 12px;
  border: 1px solid #dcdfe6;
  border-radius: 6px;
  font-size: 14px;
  transition: all 0.3s ease;
  background-color: #f5f7fa;
  color: #303133;
  box-sizing: border-box;
  max-width: 100%;
}

.form-control:focus {
  outline: none;
  border-color: #409eff;
  box-shadow: 0 0 0 2px rgba(64,158,255,0.2);
  background-color: #ffffff;
}

.form-control.has-error {
  border-color: #f56c6c;
  background-color: #fef0f0;
}

textarea.form-control {
  min-height: 80px;
  resize: vertical;
  width: 100%;
  box-sizing: border-box;
  overflow: auto;
}

.error-message {
  color: #f56c6c;
  font-size: 12px;
  margin-top: 4px;
}

/* 标签输入样式 */
.tags-input-container {
  background-color: #f5f7fa;
  border: 1px solid #dcdfe6;
  border-radius: 6px;
  padding: 8px 12px;
  transition: all 0.3s ease;
}

.tags-input-container:focus-within {
  border-color: #409eff;
  box-shadow: 0 0 0 2px rgba(64,158,255,0.2);
  background-color: #ffffff;
}

.selected-tags {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
  margin-bottom: 8px;
}

.tag-item {
  display: inline-flex;
  align-items: center;
  background-color: #ecf5ff;
  color: #409eff;
  border-radius: 4px;
  padding: 0 8px;
  height: 28px;
  font-size: 13px;
}

.tag-remove {
  margin-left: 6px;
  cursor: pointer;
  font-weight: bold;
  font-size: 14px;
}

.tag-input {
  border: none;
  background: transparent;
  width: 100%;
  padding: 6px 0;
  outline: none;
}

.common-tags {
  margin-top: 12px;
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
  align-items: center;
}

.common-tags span:first-child {
  color: #909399;
  font-size: 13px;
}

.common-tag {
  display: inline-block;
  background-color: #f0f2f5;
  color: #606266;
  border-radius: 4px;
  padding: 2px 8px;
  font-size: 12px;
  cursor: pointer;
  transition: all 0.2s;
}

.common-tag:hover {
  background-color: #e6f7ff;
  color: #409eff;
}

/* 文件上传样式 */
.file-upload-container {
  width: 100%;
}

.file-upload-box {
  border: 2px dashed #dcdfe6;
  border-radius: 8px;
  background-color: #f5f7fa;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  height: 120px;
  cursor: pointer;
  transition: all 0.3s;
}

.file-upload-box:hover {
  border-color: #409eff;
  background-color: #ecf5ff;
}

.upload-icon {
  font-size: 32px;
  color: #909399;
  margin-bottom: 10px;
}

.upload-text {
  color: #606266;
}

.selected-file {
  display: flex;
  align-items: center;
  padding: 12px 16px;
  background-color: #fff;
  border-radius: 4px;
  width: 90%;
  max-width: 500px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.05);
}

.file-name {
  font-weight: 500;
  color: #303133;
  margin-right: 8px;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
  flex: 1;
}

.file-size {
  color: #909399;
  font-size: 12px;
  white-space: nowrap;
}

.remove-file-btn {
  background: transparent;
  border: none;
  color: #909399;
  font-size: 18px;
  cursor: pointer;
  padding: 0;
  margin-left: 8px;
  width: 24px;
  height: 24px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.2s;
}

.remove-file-btn:hover {
  color: #f56c6c;
  background-color: rgba(245, 108, 108, 0.1);
}

.upload-tip {
  margin-top: 8px;
  color: #909399;
  font-size: 12px;
}

.has-error .file-upload-box {
  border-color: #f56c6c;
  background-color: #fef0f0;
}

/* 封面上传样式 */
.cover-upload-container {
  display: flex;
  gap: 16px;
}

.cover-upload-box {
  width: 200px;
  height: 150px;
  border: 2px dashed #dcdfe6;
  border-radius: 8px;
  background-color: #f5f7fa;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  overflow: hidden;
  transition: all 0.3s;
}

.cover-upload-box:hover {
  border-color: #409eff;
  background-color: #ecf5ff;
}

.cover-placeholder {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  width: 100%;
  height: 100%;
}

.cover-preview {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.cover-upload-tip {
  flex: 1;
  display: flex;
  flex-direction: column;
  justify-content: center;
  color: #909399;
  font-size: 12px;
  line-height: 1.6;
}

/* 按钮样式 */
.btn {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  line-height: 1;
  white-space: nowrap;
  cursor: pointer;
  text-align: center;
  box-sizing: border-box;
  outline: none;
  transition: .2s;
  font-weight: 500;
  padding: 10px 20px;
  font-size: 14px;
  border-radius: 6px;
  height: 40px;
  min-width: 88px;
}

.btn-default {
  background-color: #f0f2f5;
  color: #606266;
  border: 1px solid #dcdfe6;
}

.btn-default:hover {
  background-color: #e6e8eb;
  color: #303133;
}

.btn-primary {
  color: #fff;
  background-color: #409eff;
  border-color: #409eff;
}

.btn-primary:hover {
  background-color: #66b1ff;
  border-color: #66b1ff;
}

.btn-primary:disabled {
  background-color: #a0cfff;
  border-color: #a0cfff;
  cursor: not-allowed;
  opacity: 0.7;
}

/* 加载动画 */
.loading-spinner {
  display: inline-block;
  width: 16px;
  height: 16px;
  border: 2px solid rgba(255,255,255,0.3);
  border-radius: 50%;
  border-top-color: #fff;
  animation: spin 1s ease-in-out infinite;
  margin-right: 8px;
}

@keyframes spin {
  to { transform: rotate(360deg); }
}
</style> 