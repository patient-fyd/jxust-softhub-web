<template>
  <el-dialog
    v-model="dialogVisible"
    title="上传资源"
    width="600px"
    top="5vh"
    :destroy-on-close="true"
    @closed="handleDialogClosed"
  >
    <el-form
      ref="uploadFormRef"
      :model="uploadForm"
      :rules="formRules"
      label-width="80px"
      label-position="left"
    >
      <!-- 资源名称 -->
      <el-form-item label="名称" prop="name">
        <el-input v-model="uploadForm.name" placeholder="请输入资源名称"></el-input>
      </el-form-item>

      <!-- 资源分类 -->
      <el-form-item label="分类" prop="categoryId">
        <el-select 
          v-model="uploadForm.categoryId" 
          placeholder="请选择资源分类"
          style="width: 100%"
        >
          <el-option
            v-for="category in categories"
            :key="category.id"
            :label="category.name"
            :value="category.id"
          />
        </el-select>
      </el-form-item>

      <!-- 资源描述 -->
      <el-form-item label="描述" prop="description">
        <el-input
          v-model="uploadForm.description"
          type="textarea"
          :rows="3"
          placeholder="请输入资源描述"
        />
      </el-form-item>

      <!-- 标签 -->
      <el-form-item label="标签" prop="tags">
        <el-select
          v-model="uploadForm.tags"
          multiple
          allow-create
          filterable
          default-first-option
          placeholder="输入后回车创建标签"
          style="width: 100%"
        >
          <el-option
            v-for="tag in commonTags"
            :key="tag"
            :label="tag"
            :value="tag"
          />
        </el-select>
      </el-form-item>

      <!-- 文件上传 -->
      <el-form-item label="文件" prop="file" class="upload-file-item">
        <el-upload
          ref="uploadRef"
          class="resource-uploader"
          :auto-upload="false"
          :limit="1"
          :on-change="handleFileChange"
          :on-exceed="handleExceed"
          :on-remove="handleRemove"
          :file-list="fileList"
        >
          <template #trigger>
            <el-button type="primary">选择文件</el-button>
          </template>
          <template #tip>
            <div class="el-upload__tip">
              支持各种格式文件，单个文件不超过100MB
            </div>
          </template>
        </el-upload>
      </el-form-item>

      <!-- 封面图片上传 -->
      <el-form-item label="封面" prop="cover">
        <el-upload
          class="cover-uploader"
          :auto-upload="false"
          :show-file-list="false"
          :on-change="handleCoverChange"
        >
          <img v-if="coverPreview" :src="coverPreview" class="cover-preview" />
          <div v-else class="cover-placeholder">
            <el-icon><Plus /></el-icon>
            <span>点击上传封面</span>
          </div>
        </el-upload>
        <div class="cover-uploader-tip">
          可选，建议上传16:9比例图片
        </div>
      </el-form-item>

      <!-- 隐私设置 -->
      <el-form-item label="隐私设置" prop="isPrivate">
        <el-switch
          v-model="uploadForm.isPrivate"
          active-text="私有"
          inactive-text="公开"
        />
        <div class="privacy-tip">
          {{ uploadForm.isPrivate ? '仅自己可见' : '所有用户可见' }}
        </div>
      </el-form-item>
    </el-form>

    <template #footer>
      <div class="dialog-footer">
        <el-button @click="dialogVisible = false">取消</el-button>
        <el-button 
          type="primary" 
          @click="handleUpload" 
          :loading="uploading"
          :disabled="!canUpload"
        >
          上传
        </el-button>
      </div>
    </template>

    <!-- 上传进度 -->
    <el-dialog
      v-model="progressDialogVisible"
      title="上传进度"
      width="400px"
      :show-close="false"
      :close-on-click-modal="false"
      :close-on-press-escape="false"
      append-to-body
    >
      <div class="upload-progress">
        <el-progress 
          :percentage="uploadProgress" 
          type="circle" 
          :stroke-width="8"
          :status="uploadStatus"
        />
        <div class="progress-text">
          {{ uploadStatusText }}
        </div>
      </div>
    </el-dialog>
  </el-dialog>
</template>

<script lang="ts">
import { defineComponent, ref, reactive, computed, PropType, watch } from 'vue';
import { Plus } from '@element-plus/icons-vue';
import type { FormInstance, FormRules, UploadInstance, UploadUserFile } from 'element-plus';
import type { ResourceCategory } from '@/views/Resources.vue';

export default defineComponent({
  name: 'ResourceUploadModal',
  
  components: {
    Plus
  },
  
  props: {
    visible: {
      type: Boolean,
      default: false
    },
    categories: {
      type: Array as PropType<ResourceCategory[]>,
      default: () => []
    }
  },
  
  emits: ['update:visible', 'uploaded'],
  
  setup(props, { emit }) {
    // 对话框可见状态
    const dialogVisible = ref(props.visible);
    
    // 监听visible属性变化
    watch(() => props.visible, (newVal) => {
      dialogVisible.value = newVal;
    });
    
    // 监听dialogVisible变化
    watch(dialogVisible, (newVal) => {
      emit('update:visible', newVal);
    });
    
    // 表单引用
    const uploadFormRef = ref<FormInstance>();
    
    // 上传组件引用
    const uploadRef = ref<UploadInstance>();
    
    // 表单数据
    const uploadForm = reactive({
      name: '',
      categoryId: '',
      description: '',
      tags: [] as string[],
      isPrivate: false,
      file: null as File | null,
      cover: null as File | null
    });
    
    // 文件列表
    const fileList = ref<UploadUserFile[]>([]);
    
    // 封面预览
    const coverPreview = ref('');
    
    // 常用标签
    const commonTags = ref([
      '算法', '数据结构', '计算机网络', '操作系统', 
      '数据库', '人工智能', '机器学习', '深度学习',
      '前端', '后端', '全栈', 'Java', 'Python', 'C++',
      '期末考试', '实验报告', '课程设计', '大作业'
    ]);
    
    // 上传状态
    const uploading = ref(false);
    const progressDialogVisible = ref(false);
    const uploadProgress = ref(0);
    const uploadStatus = ref<'' | 'success' | 'exception' | 'warning'>('');
    
    // 是否可以上传
    const canUpload = computed(() => {
      return uploadForm.name && uploadForm.categoryId && uploadForm.file;
    });
    
    // 上传状态文本
    const uploadStatusText = computed(() => {
      if (uploadStatus.value === 'success') {
        return '上传成功!';
      } else if (uploadStatus.value === 'exception') {
        return '上传失败，请重试';
      } else if (uploadProgress.value < 100) {
        return `正在上传 ${uploadProgress.value}%`;
      } else {
        return '处理中...';
      }
    });
    
    // 表单验证规则
    const formRules = reactive<FormRules>({
      name: [
        { required: true, message: '请输入资源名称', trigger: 'blur' },
        { min: 2, max: 50, message: '长度在2到50个字符之间', trigger: 'blur' }
      ],
      categoryId: [
        { required: true, message: '请选择资源分类', trigger: 'change' }
      ],
      description: [
        { required: true, message: '请输入资源描述', trigger: 'blur' },
        { min: 10, max: 500, message: '长度在10到500个字符之间', trigger: 'blur' }
      ]
    });
    
    // 处理文件选择变化
    const handleFileChange = (file: UploadUserFile) => {
      uploadForm.file = file.raw || null;
      
      // 根据文件名自动填充资源名称（如果为空）
      if (!uploadForm.name && file.name) {
        // 去掉文件扩展名作为资源名称
        const nameParts = file.name.split('.');
        if (nameParts.length > 1) {
          nameParts.pop();
        }
        uploadForm.name = nameParts.join('.');
      }
    };
    
    // 处理超出文件限制
    const handleExceed = () => {
      ElMessage.warning('只能上传一个文件');
    };
    
    // 处理移除文件
    const handleRemove = () => {
      uploadForm.file = null;
    };
    
    // 处理封面图片变化
    const handleCoverChange = (file: UploadUserFile) => {
      uploadForm.cover = file.raw || null;
      if (file.raw) {
        coverPreview.value = URL.createObjectURL(file.raw);
      }
    };
    
    // 处理对话框关闭
    const handleDialogClosed = () => {
      // 重置表单数据
      uploadFormRef.value?.resetFields();
      fileList.value = [];
      coverPreview.value = '';
      uploadForm.file = null;
      uploadForm.cover = null;
      uploadForm.isPrivate = false;
    };
    
    // 处理上传
    const handleUpload = async () => {
      // 表单验证
      await uploadFormRef.value?.validate();
      
      if (!uploadForm.file) {
        ElMessage.error('请选择要上传的文件');
        return;
      }
      
      // 开始上传
      uploading.value = true;
      progressDialogVisible.value = true;
      uploadProgress.value = 0;
      uploadStatus.value = '';
      
      try {
        // 模拟上传进度
        const simulateProgress = () => {
          const interval = setInterval(() => {
            if (uploadProgress.value < 90) {
              uploadProgress.value += Math.floor(Math.random() * 10);
            } else {
              clearInterval(interval);
            }
          }, 300);
          
          return interval;
        };
        
        const progressInterval = simulateProgress();
        
        // 创建表单数据
        const formData = new FormData();
        formData.append('name', uploadForm.name);
        formData.append('categoryId', uploadForm.categoryId);
        formData.append('description', uploadForm.description);
        formData.append('isPrivate', uploadForm.isPrivate ? 'true' : 'false');
        uploadForm.tags.forEach(tag => {
          formData.append('tags', tag);
        });
        
        if (uploadForm.file) {
          formData.append('file', uploadForm.file);
        }
        
        if (uploadForm.cover) {
          formData.append('cover', uploadForm.cover);
        }
        
        // 模拟API调用
        await new Promise(resolve => setTimeout(resolve, 2000));
        
        // 如果有真实API，这里调用API上传
        // const response = await fetch('/api/resources/upload', {
        //   method: 'POST',
        //   body: formData
        // });
        
        // if (!response.ok) {
        //   throw new Error('上传失败');
        // }
        
        clearInterval(progressInterval);
        uploadProgress.value = 100;
        uploadStatus.value = 'success';
        
        // 延迟关闭进度对话框
        setTimeout(() => {
          progressDialogVisible.value = false;
          dialogVisible.value = false;
          
          // 通知上传完成
          emit('uploaded', {
            id: Math.random().toString(36).substring(2),
            name: uploadForm.name,
            description: uploadForm.description,
            categoryId: uploadForm.categoryId,
            tags: [...uploadForm.tags],
            uploadTime: new Date().toISOString(),
            isPrivate: uploadForm.isPrivate,
            fileType: getFileType(uploadForm.file?.name || ''),
            uploaderName: '当前用户',
            downloadCount: 0,
            coverUrl: coverPreview.value || null
          });
          
          ElMessage.success('资源上传成功');
        }, 1500);
      } catch (error) {
        console.error('上传失败:', error);
        uploadStatus.value = 'exception';
        ElMessage.error('上传失败，请重试');
      } finally {
        uploading.value = false;
      }
    };
    
    // 获取文件类型
    const getFileType = (fileName: string): string => {
      const extension = fileName.split('.').pop()?.toLowerCase() || '';
      
      const docTypes = ['doc', 'docx'];
      const excelTypes = ['xls', 'xlsx'];
      const pptTypes = ['ppt', 'pptx'];
      const imageTypes = ['jpg', 'jpeg', 'png', 'gif', 'webp', 'svg'];
      const codeTypes = ['js', 'ts', 'html', 'css', 'java', 'py', 'c', 'cpp', 'h', 'cs', 'php'];
      const zipTypes = ['zip', 'rar', '7z', 'tar', 'gz'];
      
      if (extension === 'pdf') return 'pdf';
      if (docTypes.includes(extension)) return 'doc';
      if (excelTypes.includes(extension)) return 'xls';
      if (pptTypes.includes(extension)) return 'ppt';
      if (imageTypes.includes(extension)) return 'img';
      if (codeTypes.includes(extension)) return 'code';
      if (zipTypes.includes(extension)) return 'zip';
      
      return extension || 'other';
    };
    
    return {
      dialogVisible,
      uploadFormRef,
      uploadRef,
      uploadForm,
      formRules,
      fileList,
      coverPreview,
      commonTags,
      uploading,
      progressDialogVisible,
      uploadProgress,
      uploadStatus,
      uploadStatusText,
      canUpload,
      handleFileChange,
      handleExceed,
      handleRemove,
      handleCoverChange,
      handleDialogClosed,
      handleUpload
    };
  }
});
</script>

<style scoped>
.resource-uploader {
  width: 100%;
}

.upload-file-item :deep(.el-upload) {
  width: 100%;
}

.cover-uploader {
  width: 100%;
}

.cover-uploader :deep(.el-upload) {
  border: 1px dashed #d9d9d9;
  border-radius: 6px;
  cursor: pointer;
  position: relative;
  overflow: hidden;
  transition: border-color 0.3s;
}

.cover-uploader :deep(.el-upload:hover) {
  border-color: #409eff;
}

.cover-placeholder {
  width: 178px;
  height: 100px;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  color: #8c939d;
}

.cover-preview {
  width: 178px;
  height: 100px;
  object-fit: cover;
  display: block;
}

.cover-uploader-tip {
  font-size: 12px;
  color: #606266;
  margin-top: 6px;
}

.privacy-tip {
  font-size: 12px;
  color: #606266;
  margin-top: 6px;
}

.upload-progress {
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 20px 0;
}

.progress-text {
  margin-top: 16px;
  font-size: 14px;
  color: #606266;
}
</style> 