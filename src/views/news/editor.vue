<template>
  <div class="news-editor">
    <h1 class="page-title">{{ isEdit ? '编辑新闻' : '发布新闻' }}</h1>
    
    <div class="form-container">
      <div class="form-sidebar">
        <div class="settings-card">
          <h2 class="settings-title">新闻设置</h2>
          
          <div class="form-group">
            <label for="author" class="form-label">作者</label>
            <input 
              type="text" 
              id="author" 
              v-model="newsData.author" 
              class="form-control"
              placeholder="请输入作者名称"
            />
          </div>
          
          <div class="form-group">
            <label for="publishDate" class="form-label">发布日期</label>
            <input 
              type="datetime-local" 
              id="publishDate" 
              v-model="newsData.publishDate" 
              class="form-control"
            />
          </div>
          
          <div class="form-group">
            <label for="tags" class="form-label">标签</label>
            <input 
              type="text" 
              id="tags" 
              v-model="newsData.tags" 
              class="form-control"
              placeholder="多个标签用逗号分隔"
            />
          </div>
          
          <div class="form-group">
            <label for="status" class="form-label">状态</label>
            <select 
              id="status" 
              v-model="newsData.status" 
              class="form-control"
            >
              <option value="draft">草稿</option>
              <option value="published">已发布</option>
              <option value="archived">已归档</option>
            </select>
          </div>
          
          <div class="form-group">
            <div class="checkbox-group">
              <input 
                type="checkbox" 
                id="isTop" 
                v-model="newsData.isTop" 
                class="form-checkbox"
              />
              <label for="isTop" class="checkbox-label">置顶</label>
            </div>
          </div>
          
          <div class="form-group">
            <div class="checkbox-group">
              <input 
                type="checkbox" 
                id="isHot" 
                v-model="newsData.isHot" 
                class="form-checkbox"
              />
              <label for="isHot" class="checkbox-label">热门</label>
            </div>
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
        <div class="form-group">
          <label for="title" class="form-label">新闻标题</label>
          <input 
            type="text" 
            id="title" 
            v-model="newsData.title" 
            class="form-control"
            placeholder="请输入新闻标题"
          />
        </div>

        <div class="form-group">
          <label for="summary" class="form-label">新闻摘要</label>
          <textarea 
            id="summary" 
            v-model="newsData.summary" 
            rows="3"
            class="form-control"
            placeholder="请输入新闻摘要（可选）"
          ></textarea>
        </div>

        <div class="form-group">
          <label class="form-label">新闻内容</label>
          <MarkdownEditor 
            v-model="newsData.content" 
            height="500px"
            placeholder="请输入新闻详细内容..."
          />
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
            {{ isSubmitting ? '提交中...' : '发布新闻' }}
          </button>
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
  name: 'NewsEditor',
  components: {
    MarkdownEditor
  },
  setup() {
    const router = useRouter();
    const route = useRoute();
    
    const newsId = computed(() => route.query.id as string | undefined);
    const isEdit = computed(() => !!newsId.value);
    const isSubmitting = ref(false);
    const imagePreview = ref<string | null>(null);
    
    const newsData = ref({
      title: '',
      summary: '',
      content: '',
      author: '',
      publishDate: new Date().toISOString().slice(0, 16), // 设置默认为当前时间
      tags: '',
      status: 'draft',
      isTop: false,
      isHot: false,
      coverImageUrl: '',
    });
    
    onMounted(async () => {
      if (isEdit.value) {
        try {
          // TODO: 从后端获取新闻数据
          // const response = await newsService.getNewsById(newsId.value);
          // newsData.value = response.data;
          
          // 临时模拟数据
          console.log('编辑模式，新闻ID:', newsId.value);
        } catch (error) {
          console.error('获取新闻信息失败:', error);
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
      if (!newsData.value.title.trim()) {
        alert('请输入新闻标题');
        return false;
      }
      if (!newsData.value.content.trim()) {
        alert('请输入新闻内容');
        return false;
      }
      if (!newsData.value.author.trim()) {
        alert('请输入作者名称');
        return false;
      }
      if (!newsData.value.publishDate) {
        alert('请选择发布日期');
        return false;
      }
      return true;
    };
    
    const saveAsDraft = async () => {
      // 将状态设置为草稿并保存
      newsData.value.status = 'draft';
      await saveNews();
    };
    
    const publish = async () => {
      // 验证表单
      if (!validateForm()) return;
      
      // 将状态设置为已发布并保存
      newsData.value.status = 'published';
      await saveNews();
    };
    
    const saveNews = async () => {
      try {
        isSubmitting.value = true;
        
        // 处理标签
        const tagsArray = newsData.value.tags
          .split(',')
          .map(tag => tag.trim())
          .filter(tag => tag);
        
        // TODO: 调用API保存新闻
        // const payload = { 
        //   ...newsData.value,
        //   tags: tagsArray
        // };
        // let response;
        // if (isEdit.value) {
        //   response = await newsService.updateNews(newsId.value, payload);
        // } else {
        //   response = await newsService.createNews(payload);
        // }
        
        console.log('保存新闻数据:', {
          ...newsData.value,
          tags: tagsArray
        });
        
        // 模拟API调用延迟
        await new Promise(resolve => setTimeout(resolve, 1000));
        
        // 成功后跳转到新闻列表页
        router.push({ name: 'News' });
      } catch (error) {
        console.error('保存新闻失败:', error);
        alert('保存新闻失败，请稍后重试');
      } finally {
        isSubmitting.value = false;
      }
    };
    
    const cancel = () => {
      router.go(-1);
    };
    
    return {
      newsData,
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
.news-editor {
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
  margin-bottom: 0;
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
  gap: 1.5rem;
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

.checkbox-group {
  display: flex;
  align-items: center;
  background-color: #f9fafb;
  padding: 0.5rem 0.75rem;
  border-radius: 0.5rem;
  border: 1px solid #e5e7eb;
}

.form-checkbox {
  width: 1rem;
  height: 1rem;
}

.checkbox-label {
  margin-left: 0.5rem;
  font-size: 0.875rem;
  color: #4b5563;
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

.action-buttons {
  display: flex;
  justify-content: flex-end;
  gap: 1rem;
  margin-top: 2.5rem; /* 拉开 2.5rem */
}

.btn-primary, .btn-secondary {
  padding: 0.75rem 1.5rem;
  border-radius: 0.5rem;
  font-weight: 600;
  font-size: 0.9375rem;
  cursor: pointer;
  transition: all 0.2s;
}

.btn-primary {
  background-color: #1e40af;
  color: white;
}

.btn-primary:hover {
  background-color: #1e3a8a;
}

.btn-primary:disabled {
  background-color: #93c5fd;
  cursor: not-allowed;
}

.btn-secondary {
  background-color: #f3f4f6;
  color: #374151;
  border: 1px solid #d1d5db;
}

.btn-secondary:hover {
  background-color: #e5e7eb;
}

/* 编辑器样式细节 */
:deep(.bytemd) {
  border: 1px solid #d1d5db;
  border-radius: 0.5rem;
}

/* 移动端适配 */
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