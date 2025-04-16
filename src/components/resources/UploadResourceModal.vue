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
.upload-form {
  max-height: 60vh;
  overflow-y: auto;
  padding-right: 10px;
}

.full-width {
  width: 100%;
}

.cover-uploader {
  width: 200px;
}

.cover-placeholder {
  width: 200px;
  height: 150px;
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  border: 1px dashed #d9d9d9;
  border-radius: 6px;
  cursor: pointer;
  background-color: #fcfcfc;
  transition: border-color 0.3s;
}

.cover-placeholder:hover {
  border-color: #409eff;
}

.cover-placeholder i {
  font-size: 28px;
  color: #8c939d;
  margin-bottom: 10px;
}

.cover-preview {
  width: 200px;
  height: 150px;
  object-fit: cover;
  border-radius: 6px;
  cursor: pointer;
  border: 1px solid #d9d9d9;
}

.cover-uploader__tip {
  color: #909399;
  font-size: 12px;
  margin-top: 7px;
  line-height: 1.5;
}

:deep(.el-upload-list__item) {
  transition: all 0.3s;
}

:deep(.el-upload-list__item:hover) {
  background-color: #f5f7fa;
}
</style> 