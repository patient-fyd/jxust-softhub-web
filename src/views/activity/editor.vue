<template>
  <div class="activity-editor">
    <h1 class="page-title">{{ isEdit ? '编辑活动' : '发布活动' }}</h1>
    
    <div class="form-container">
      <div class="form-sidebar">
        <div class="settings-card">
          <h2 class="settings-title">活动设置</h2>
          
          <div class="form-group">
            <label for="location" class="form-label">活动地点</label>
            <input 
              type="text" 
              id="location" 
              v-model="activityData.location" 
              class="form-control"
              placeholder="请输入活动地点"
            />
          </div>
          
          <div class="form-group">
            <label for="startTime" class="form-label">开始时间</label>
            <input 
              type="datetime-local" 
              id="startTime" 
              v-model="activityData.startTime" 
              class="form-control"
            />
          </div>
          
          <div class="form-group">
            <label for="endTime" class="form-label">结束时间</label>
            <input 
              type="datetime-local" 
              id="endTime" 
              v-model="activityData.endTime" 
              class="form-control"
            />
          </div>
          
          <div class="form-group">
            <label for="registrationDeadline" class="form-label">报名截止时间</label>
            <input 
              type="datetime-local" 
              id="registrationDeadline" 
              v-model="activityData.registrationDeadline" 
              class="form-control"
            />
          </div>
          
          <div class="form-group">
            <label for="capacity" class="form-label">活动人数上限</label>
            <input 
              type="number" 
              id="capacity" 
              v-model="activityData.capacity" 
              class="form-control"
              min="1"
              placeholder="请输入活动可参与的最大人数"
            />
          </div>
          
          <div class="form-group">
            <label for="status" class="form-label">状态</label>
            <select 
              id="status" 
              v-model="activityData.status" 
              class="form-control"
            >
              <option value="draft">草稿</option>
              <option value="registration">报名中</option>
              <option value="ongoing">进行中</option>
              <option value="completed">已结束</option>
              <option value="cancelled">已取消</option>
            </select>
          </div>
          
          <div class="form-group">
            <label for="coverImage" class="form-label">封面图片</label>
            <input 
              type="file" 
              id="coverImage" 
              @change="handleImageUpload" 
              class="form-control"
              accept="image/*"
            />
            <div v-if="imagePreview" class="image-preview">
              <img :src="imagePreview" alt="封面预览" />
            </div>
          </div>
        </div>
      </div>

      <div class="form-main">
        <div class="main-card">
        <div class="form-group">
          <label for="title" class="form-label">活动标题</label>
          <input 
            type="text" 
            id="title" 
            v-model="activityData.title" 
            class="form-control"
            placeholder="请输入活动标题"
          />
        </div>

        <div class="form-group">
          <label for="content" class="form-label">活动内容</label>
          <div class="markdown-editor-wrapper">
            <MarkdownEditor 
              v-model="activityData.content" 
              height="100%"
              placeholder="请输入活动详细内容..."
            />
          </div>
        </div>
        
        <div class="action-buttons">
          <button 
            @click="cancel" 
            class="btn-secondary"
          >
            取消
          </button>
          <button 
            @click="saveAsDraft" 
            class="btn-secondary"
          >
            保存草稿
          </button>
          <button 
            @click="publish" 
            class="btn-primary"
            :disabled="isSubmitting"
          >
            {{ isSubmitting ? '提交中...' : '发布活动' }}
          </button>
        </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script lang="ts">
import { defineComponent, ref, onMounted, computed } from 'vue';
import { useRouter, useRoute } from 'vue-router';
import MarkdownEditor from '../../components/editor/MarkdownEditor.vue';

export default defineComponent({
  name: 'ActivityEditor',
  components: {
    MarkdownEditor
  },
  setup() {
    const router = useRouter();
    const route = useRoute();
    
    const activityId = computed(() => route.query.id as string | undefined);
    const isEdit = computed(() => !!activityId.value);
    const isSubmitting = ref(false);
    const imagePreview = ref<string | null>(null);
    
    const activityData = ref({
      title: '',
      content: '',
      location: '',
      startTime: new Date().toISOString().slice(0, 16), // 默认为当前时间
      endTime: new Date(Date.now() + 2 * 60 * 60 * 1000).toISOString().slice(0, 16), // 默认为当前时间后2小时
      registrationDeadline: new Date().toISOString().slice(0, 16), // 默认为当前时间
      capacity: 30, // 默认人数
      status: 'draft',
      coverImageUrl: '',
    });
    
    onMounted(async () => {
      if (isEdit.value) {
        try {
          // TODO: 从后端获取活动数据
          // const response = await activityService.getActivityById(activityId.value);
          // activityData.value = response.data;
          
          // 临时模拟数据
          console.log('编辑模式，活动ID:', activityId.value);
        } catch (error) {
          console.error('获取活动信息失败:', error);
        }
      }
    });
    
    const handleImageUpload = (event: Event) => {
      const target = event.target as HTMLInputElement;
      if (target.files && target.files.length > 0) {
        const file = target.files[0];
        
        // 创建预览
        const reader = new FileReader();
        reader.onload = (e) => {
          imagePreview.value = e.target?.result as string;
        };
        reader.readAsDataURL(file);
        
        // TODO: 实现图片上传逻辑
        // 可以在这里立即上传图片，或者在提交表单时一起上传
      }
    };
    
    const validateForm = () => {
      if (!activityData.value.title.trim()) {
        alert('请输入活动标题');
        return false;
      }
      if (!activityData.value.content.trim()) {
        alert('请输入活动内容');
        return false;
      }
      if (!activityData.value.location.trim()) {
        alert('请输入活动地点');
        return false;
      }
      if (!activityData.value.startTime) {
        alert('请选择开始时间');
        return false;
      }
      if (!activityData.value.endTime) {
        alert('请选择结束时间');
        return false;
      }
      if (new Date(activityData.value.startTime) >= new Date(activityData.value.endTime)) {
        alert('结束时间必须晚于开始时间');
        return false;
      }
      if (!activityData.value.registrationDeadline) {
        alert('请选择报名截止时间');
        return false;
      }
      if (new Date(activityData.value.registrationDeadline) > new Date(activityData.value.startTime)) {
        alert('报名截止时间必须早于活动开始时间');
        return false;
      }
      if (!activityData.value.capacity || activityData.value.capacity <= 0) {
        alert('请输入有效的活动人数上限');
        return false;
      }
      return true;
    };
    
    const saveAsDraft = async () => {
      // 将状态设置为草稿并保存
      activityData.value.status = 'draft';
      await saveActivity();
    };
    
    const publish = async () => {
      // 验证表单
      if (!validateForm()) return;
      
      // 将状态设置为报名中并保存
      activityData.value.status = 'registration';
      await saveActivity();
    };
    
    const saveActivity = async () => {
      try {
        isSubmitting.value = true;
        
        // TODO: 调用API保存活动
        // const payload = { ...activityData.value };
        // let response;
        // if (isEdit.value) {
        //   response = await activityService.updateActivity(activityId.value, payload);
        // } else {
        //   response = await activityService.createActivity(payload);
        // }
        
        console.log('保存活动数据:', {
          ...activityData.value
        });
        
        // 模拟API调用延迟
        await new Promise(resolve => setTimeout(resolve, 1000));
        
        // 成功后跳转到活动列表页
        router.push({ name: 'Activities' });
      } catch (error) {
        console.error('保存活动失败:', error);
        alert('保存活动失败，请稍后重试');
      } finally {
        isSubmitting.value = false;
      }
    };
    
    const cancel = () => {
      router.go(-1);
    };
    
    return {
      activityData,
      isEdit,
      isSubmitting,
      imagePreview,
      handleImageUpload,
      saveAsDraft,
      publish,
      cancel
    };
  }
});
</script>

<style scoped>
.activity-editor {
  display: flex;
  flex-direction: column;
  height: 100vh;
  overflow: hidden;
  background-color: #f9fafb;
}

.page-title {
  flex-shrink: 0;
  height: 80px;
  line-height: 80px;
  font-size: 2rem;
  font-weight: bold;
  color: #1e40af;
  text-align: center;
  background-color: #ffffff;
  border-bottom: 1px solid #e5e7eb;
  margin-bottom: 0; /* 去除底部空白 */
  position: relative;
}

.page-title::after {
  content: "";
  display: block;
  width: 60px;
  height: 4px;
  background-color: #1e40af;
  margin: 0 auto;
  border-radius: 2px;
  position: absolute;
  bottom: 8px;
  left: 50%;
  transform: translateX(-50%);
}

.form-container {
  flex: 1;
  display: grid;
  grid-template-columns: 280px 1fr;
  gap: 1.5rem; /* 左右间距缩短 */
  padding: 1.5rem;
  overflow: hidden;
}

.form-sidebar {
  background: #ffffff;
  border: 1px solid #e5e7eb;
  border-radius: 0.5rem;
  padding: 1.25rem;
  overflow-y: auto;
}

.form-main {
  background: #ffffff;
  border: 1px solid #e5e7eb;
  border-radius: 0.5rem;
  padding: 1.25rem;
  display: flex;
  flex-direction: column;
  overflow-y: auto;
}

.settings-title {
  font-size: 1.25rem;
  font-weight: 600;
  color: #1e40af;
  margin-bottom: 1.25rem;
  text-align: center;
}

.form-group {
  margin-bottom: 1.25rem;
}

.form-label {
  display: block;
  margin-bottom: 0.5rem;
  font-weight: 500;
  color: #374151;
}

.form-control {
  width: 100%;
  padding: 0.625rem 0.75rem;
  border: 1px solid #d1d5db;
  border-radius: 0.5rem;
  background-color: #f9fafb;
  font-size: 0.9375rem;
}

.form-control:focus {
  background-color: #ffffff;
  border-color: #3b82f6;
  outline: none;
}

.action-buttons {
  display: flex;
  justify-content: flex-end;
  gap: 1rem;
  margin-top: auto; /* 让按钮贴底 */
}

.btn-primary, .btn-secondary {
  padding: 0.75rem 1.5rem;
  border-radius: 0.5rem;
  font-weight: 600;
  font-size: 0.9375rem;
  transition: background-color 0.2s;
  cursor: pointer;
}

.btn-primary {
  background-color: #1e40af;
  color: #ffffff;
}

.btn-primary:hover {
  background-color: #1e3a8a;
}

.btn-secondary {
  background-color: #f3f4f6;
  color: #374151;
  border: 1px solid #d1d5db;
}

.btn-secondary:hover {
  background-color: #e5e7eb;
}

.image-preview {
  margin-top: 0.75rem;
}

.image-preview img {
  width: 100%;
  max-height: 200px;
  object-fit: cover;
  border-radius: 0.5rem;
}

@media (max-width: 768px) {
  .form-container {
    grid-template-columns: 1fr;
    grid-template-rows: auto auto;
    padding: 1rem;
    gap: 1rem;
    overflow-y: auto;
  }
  .form-sidebar, .form-main {
    height: auto;
  }
  .action-buttons {
    flex-direction: column;
  }
}


</style>