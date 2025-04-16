<template>
  <div class="resource-card" @click="handleClick">
    <div class="card-cover">
      <img :src="coverImage" :alt="resource.name" class="cover-image" />
      <div class="file-type-badge" :class="`file-type-${resource.fileType}`">
        {{ getFileTypeLabel(resource.fileType) }}
      </div>
    </div>
    <div class="card-content">
      <h3 class="resource-title" :title="resource.name">{{ resource.name }}</h3>
      <p class="resource-description" :title="resource.description">
        {{ truncateDescription(resource.description) }}
      </p>
      <div class="resource-tags">
        <span
          v-for="tag in displayedTags"
          :key="tag"
          class="resource-tag"
        >
          {{ tag }}
        </span>
        <div v-if="resource.tags.length > displayedTags.length" class="tags-more">
          +{{ resource.tags.length - displayedTags.length }}
        </div>
      </div>
      <div class="resource-meta">
        <div class="meta-item meta-category">
          <i class="icon icon-folder"></i>
          <span>{{ getCategoryName(resource.categoryId) }}</span>
        </div>
        <div class="meta-item meta-downloads">
          <i class="icon icon-download"></i>
          <span>{{ resource.downloadCount }}</span>
        </div>
      </div>
      <div class="resource-footer">
        <div class="uploader-info">
          <i class="icon icon-user"></i>
          <span>{{ resource.uploaderName }}</span>
        </div>
        <div class="upload-time">
          <i class="icon icon-time"></i>
          <span>{{ formatDate(resource.uploadTime) }}</span>
        </div>
      </div>
    </div>
    <div class="card-actions">
      <button 
        class="btn btn-primary btn-circle" 
        @click.stop="handleView"
        title="查看详情"
      >
        <i class="icon icon-view"></i>
      </button>
      <button 
        class="btn btn-success btn-circle" 
        @click.stop="handleDownload"
        title="下载资源"
      >
        <i class="icon icon-download"></i>
      </button>
    </div>
  </div>
</template>

<script lang="ts">
import { defineComponent, computed, PropType, ref, onUnmounted } from 'vue';
import type { Resource } from '@/views/Resources.vue';

export default defineComponent({
  name: 'ResourceCard',
  
  props: {
    resource: {
      type: Object as PropType<Resource>,
      required: true
    },
    categories: {
      type: Array as PropType<{ id: string; name: string }[]>,
      default: () => []
    }
  },
  
  emits: ['view', 'download'],
  
  setup(props, { emit }) {
    // 存储创建的对象URL，以便在组件卸载时释放
    const objectUrls = ref<string[]>([]);
    
    // 计算属性：封面图片
    const coverImage = computed(() => {
      // 如果有封面图，直接返回
      if (props.resource.coverUrl) {
        return props.resource.coverUrl;
      }
      
      // 生成默认封面SVG
      const title = props.resource.name;
      const shortTitle = title.length > 15 ? title.substring(0, 15) + '...' : title;
      
      // 根据文件类型选择背景颜色
      let bgColor = '#409eff'; // 默认蓝色
      let iconSymbol = '📄';   // 默认文档图标
      
      switch (props.resource.fileType) {
        case 'pdf':
          bgColor = '#f56c6c'; // 红色
          iconSymbol = '📕';
          break;
        case 'doc':
        case 'docx':
          bgColor = '#409eff'; // 蓝色
          iconSymbol = '📘';
          break;
        case 'xls':
        case 'xlsx':
          bgColor = '#67c23a'; // 绿色
          iconSymbol = '📊';
          break;
        case 'ppt':
        case 'pptx':
          bgColor = '#e6a23c'; // 橙色
          iconSymbol = '📊';
          break;
        case 'zip':
        case 'rar':
          bgColor = '#909399'; // 灰色
          iconSymbol = '📦';
          break;
        case 'code':
          bgColor = '#9254de'; // 紫色
          iconSymbol = '💻';
          break;
        case 'img':
          bgColor = '#13c2c2'; // 青色
          iconSymbol = '🖼️';
          break;
      }
      
      // 获取分类名称显示在底部
      const category = getCategoryName(props.resource.categoryId);
      
      // 生成SVG封面
      const svgContent = `
        <svg xmlns="http://www.w3.org/2000/svg" width="400" height="300" viewBox="0 0 400 300">
          <rect width="400" height="300" fill="${bgColor}" />
          <text x="200" y="100" font-family="Arial" font-size="80" text-anchor="middle" fill="rgba(255,255,255,0.4)">${iconSymbol}</text>
          <text x="200" y="180" font-family="Arial" font-size="24" font-weight="bold" text-anchor="middle" fill="white">${shortTitle}</text>
          <text x="200" y="250" font-family="Arial" font-size="16" text-anchor="middle" fill="rgba(255,255,255,0.7)">${category}</text>
        </svg>
      `;
      
      // 转换SVG为blob URL
      const svgBlob = new Blob([svgContent], { type: 'image/svg+xml' });
      const url = URL.createObjectURL(svgBlob);
      
      // 保存创建的URL以便稍后释放
      objectUrls.value.push(url);
      
      return url;
    });
    
    // 计算属性：显示的标签（最多显示3个）
    const displayedTags = computed(() => {
      return props.resource.tags.slice(0, 3);
    });
    
    // 获取文件类型标签
    const getFileTypeLabel = (fileType: string) => {
      const fileTypeMap: Record<string, string> = {
        pdf: 'PDF',
        doc: 'Word',
        docx: 'Word',
        xls: 'Excel',
        xlsx: 'Excel',
        ppt: 'PPT',
        pptx: 'PPT',
        zip: 'ZIP',
        rar: 'RAR',
        code: '代码',
        img: '图片'
      };
      return fileTypeMap[fileType] || fileType.toUpperCase();
    };
    
    // 获取分类名称
    const getCategoryName = (categoryId: string) => {
      if (props.categories.length > 0) {
        const category = props.categories.find(c => c.id === categoryId);
        return category ? category.name : '未分类';
      }
      
      // 硬编码分类名称（如果未提供categories属性）
      const categoryMap: Record<string, string> = {
        '1': '课程笔记',
        '2': '实验报告',
        '3': '习题解析',
        '4': '课件资料',
        '5': '编程代码',
        '6': '电子书籍',
        '7': '考试资料',
        '8': '项目文档'
      };
      return categoryMap[categoryId] || '未分类';
    };
    
    // 截断描述文本
    const truncateDescription = (description: string) => {
      return description.length > 60 
        ? description.substring(0, 60) + '...' 
        : description;
    };
    
    // 格式化日期
    const formatDate = (dateString: string) => {
      const date = new Date(dateString);
      return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`;
    };
    
    // 处理卡片点击
    const handleClick = () => {
      emit('view', props.resource);
    };
    
    // 处理查看按钮点击
    const handleView = () => {
      emit('view', props.resource);
    };
    
    // 处理下载按钮点击
    const handleDownload = () => {
      emit('download', props.resource);
    };
    
    // 组件卸载时释放所有创建的URL
    onUnmounted(() => {
      objectUrls.value.forEach(url => {
        URL.revokeObjectURL(url);
      });
    });
    
    return {
      coverImage,
      displayedTags,
      getFileTypeLabel,
      getCategoryName,
      truncateDescription,
      formatDate,
      handleClick,
      handleView,
      handleDownload
    };
  }
});
</script>

<style scoped>
.resource-card {
  border-radius: 8px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
  overflow: hidden;
  transition: transform 0.3s, box-shadow 0.3s;
  background-color: #fff;
  position: relative;
  height: 100%;
  display: flex;
  flex-direction: column;
  cursor: pointer;
}

.resource-card:hover {
  transform: translateY(-5px);
  box-shadow: 0 8px 24px rgba(0, 0, 0, 0.15);
}

.card-cover {
  position: relative;
  width: 100%;
  padding-top: 56.25%; /* 16:9 比例 */
  overflow: hidden;
}

.cover-image {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  object-fit: cover;
  transition: transform 0.5s;
}

.resource-card:hover .cover-image {
  transform: scale(1.05);
}

.file-type-badge {
  position: absolute;
  top: 10px;
  right: 10px;
  padding: 3px 8px;
  border-radius: 4px;
  font-size: 12px;
  font-weight: bold;
  color: #fff;
  background-color: #409eff;
}

.file-type-pdf {
  background-color: #f56c6c;
}

.file-type-doc, .file-type-docx {
  background-color: #409eff;
}

.file-type-xls, .file-type-xlsx {
  background-color: #67c23a;
}

.file-type-ppt, .file-type-pptx {
  background-color: #e6a23c;
}

.file-type-zip, .file-type-rar {
  background-color: #909399;
}

.file-type-code {
  background-color: #9254de;
}

.file-type-img {
  background-color: #13c2c2;
}

.card-content {
  flex: 1;
  padding: 16px;
  display: flex;
  flex-direction: column;
}

.resource-title {
  margin: 0 0 10px 0;
  font-size: 18px;
  font-weight: 600;
  color: #333;
  line-height: 1.4;
  overflow: hidden;
  text-overflow: ellipsis;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  min-height: 2.8em;
}

.resource-description {
  color: #666;
  font-size: 14px;
  margin-bottom: 12px;
  overflow: hidden;
  text-overflow: ellipsis;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  min-height: 2.8em;
}

.resource-tags {
  display: flex;
  flex-wrap: wrap;
  gap: 6px;
  margin-bottom: 12px;
}

.resource-tag {
  padding: 0 10px;
  height: 22px;
  line-height: 22px;
  font-size: 12px;
  color: #409eff;
  background-color: #ecf5ff;
  border: 1px solid #d9ecff;
  border-radius: 4px;
  box-sizing: border-box;
  white-space: nowrap;
}

.tags-more {
  font-size: 12px;
  color: #909399;
  background-color: #f4f4f5;
  padding: 0 6px;
  border-radius: 4px;
  line-height: 22px;
}

.resource-meta {
  display: flex;
  justify-content: space-between;
  margin-bottom: 12px;
  flex-wrap: wrap;
}

.meta-item {
  display: flex;
  align-items: center;
  color: #606266;
  font-size: 13px;
}

.meta-item i {
  margin-right: 4px;
}

.resource-footer {
  margin-top: auto;
  border-top: 1px solid #f0f0f0;
  padding-top: 12px;
  display: flex;
  justify-content: space-between;
  color: #909399;
  font-size: 12px;
}

.uploader-info, .upload-time {
  display: flex;
  align-items: center;
}

.uploader-info i, .upload-time i {
  margin-right: 4px;
}

.card-actions {
  position: absolute;
  top: 10px;
  left: 10px;
  display: flex;
  gap: 8px;
  opacity: 0;
  transform: translateY(10px);
  transition: opacity 0.3s, transform 0.3s;
}

.resource-card:hover .card-actions {
  opacity: 1;
  transform: translateY(0);
}

/* 图标样式 */
.icon {
  display: inline-block;
  width: 1em;
  height: 1em;
  vertical-align: -0.15em;
  fill: currentColor;
  overflow: hidden;
}

.icon-folder:before {
  content: "📁";
}

.icon-download:before {
  content: "⬇️";
}

.icon-user:before {
  content: "👤";
}

.icon-time:before {
  content: "🕒";
}

.icon-view:before {
  content: "👁️";
}

/* 按钮样式 */
.btn {
  display: inline-block;
  line-height: 1;
  white-space: nowrap;
  cursor: pointer;
  background: #fff;
  border: 1px solid #dcdfe6;
  color: #606266;
  text-align: center;
  box-sizing: border-box;
  outline: none;
  margin: 0;
  font-weight: 500;
  padding: 8px 15px;
  font-size: 14px;
  border-radius: 4px;
  transition: .1s;
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

.btn-success {
  color: #fff;
  background-color: #67c23a;
  border-color: #67c23a;
}

.btn-success:hover {
  background-color: #85ce61;
  border-color: #85ce61;
}

.btn-circle {
  border-radius: 50%;
  padding: 7px;
  height: 32px;
  width: 32px;
  line-height: 32px;
  text-align: center;
}
</style> 