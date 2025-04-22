<template>
  <div class="resource-card" @click="handleCardClick">
    <div class="card-cover">
      <img :src="coverUrl" :alt="resource.name" class="cover-img" />
    </div>
    <div class="card-content">
      <h3 class="card-title" :title="resource.name">{{ resource.name }}</h3>
      <p class="card-description" :title="resource.description">
        {{ shortDescription }}
      </p>
      <div class="card-tags">
        <span
          v-for="tag in displayedTags"
          :key="tag"
          class="card-tag"
          @click.stop
        >
          {{ tag }}
        </span>
        <span v-if="resource.tags.length > 2" class="more-tags">
          +{{ resource.tags.length - 2 }}
        </span>
      </div>
      <div class="card-meta">
        <div class="meta-item">
          <Icon icon="mdi:folder-outline" class="meta-icon" />
          <span>{{ categoryName }}</span>
        </div>
        <div class="meta-item">
          <Icon icon="mdi:account-outline" class="meta-icon" />
          <span>{{ resource.uploaderName }}</span>
        </div>
      </div>
      <div class="card-footer">
        <div class="meta-item">
          <Icon icon="mdi:download-outline" class="meta-icon" />
          <span>{{ resource.downloadCount }}</span>
        </div>
        <div class="meta-item">
          <Icon icon="mdi:clock-outline" class="meta-icon" />
          <span>{{ formatDate(resource.uploadTime) }}</span>
        </div>
        <div class="card-actions">
          <button class="btn btn-icon" @click.stop="handleView">
            <Icon icon="mdi:eye-outline" />
          </button>
          <button class="btn btn-icon" @click.stop="handleDownload">
            <Icon icon="mdi:download-outline" />
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script lang="ts">
import { defineComponent, computed } from 'vue';
import type { PropType } from 'vue';
import type { Resource, ResourceCategory } from '../../types/resources';
import { Icon } from '@iconify/vue';

export default defineComponent({
  name: 'ResourceCard',
  
  components: {
    Icon
  },
  
  props: {
    resource: {
      type: Object as PropType<Resource>,
      required: true
    },
    categories: {
      type: Array as PropType<ResourceCategory[]>,
      default: () => []
    },
    getResourceCover: {
      type: Function,
      required: true
    }
  },
  
  emits: ['view', 'download'],
  
  setup(props, { emit }) {
    // 获取分类名称
    const categoryName = computed(() => {
      const category = props.categories.find(c => c.id === props.resource.categoryId);
      return category ? category.name : '未分类';
    });
    
    // 展示的标签（最多2个）
    const displayedTags = computed(() => {
      return props.resource.tags.slice(0, 2);
    });
    
    // 描述截取
    const shortDescription = computed(() => {
      if (props.resource.description.length > 100) {
        return props.resource.description.substring(0, 100) + '...';
      }
      return props.resource.description;
    });
    
    // 格式化日期
    const formatDate = (dateString: string) => {
      const date = new Date(dateString);
      return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`;
    };
    
    // 获取封面URL
    const coverUrl = computed(() => {
      // 如果资源有封面，直接使用
      if (props.resource.coverUrl) {
        return props.resource.coverUrl;
      }
      
      // 使用父组件传递的方法获取封面
      return props.getResourceCover(props.resource);
    });
    
    // 查看资源
    const handleView = () => {
      emit('view', props.resource);
    };
    
    // 下载资源
    const handleDownload = () => {
      emit('download', props.resource);
    };
    
    // 卡片点击
    const handleCardClick = () => {
      handleView();
    };
    
    return {
      categoryName,
      displayedTags,
      shortDescription,
      formatDate,
      coverUrl,
      handleView,
      handleDownload,
      handleCardClick
    };
  }
});
</script>

<style scoped>
.resource-card {
  background-color: #fff;
  border-radius: 8px;
  box-shadow: 0 2px 12px rgba(0, 0, 0, 0.1);
  overflow: hidden;
  transition: transform 0.3s, box-shadow 0.3s;
  cursor: pointer;
  height: 100%;
  display: flex;
  flex-direction: column;
}

.resource-card:hover {
  transform: translateY(-5px);
  box-shadow: 0 5px 15px rgba(0, 0, 0, 0.15);
}

.card-cover {
  height: 200px;
  overflow: hidden;
}

.cover-img {
  width: 100%;
  height: 100%;
  object-fit: cover;
  transition: transform 0.3s;
}

.resource-card:hover .cover-img {
  transform: scale(1.05);
}

.card-content {
  padding: 16px;
  display: flex;
  flex-direction: column;
  flex-grow: 1;
  min-height: 180px;
}

.card-title {
  font-size: 16px;
  font-weight: 500;
  margin: 0 0 8px;
  color: #303133;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.card-description {
  color: #606266;
  font-size: 13px;
  line-height: 1.5;
  margin: 0 0 12px;
  height: 60px;
  overflow: hidden;
  display: -webkit-box;
  -webkit-line-clamp: 3;
  -webkit-box-orient: vertical;
}

.card-tags {
  display: flex;
  flex-wrap: wrap;
  gap: 6px;
  margin-bottom: 12px;
}

.card-tag {
  display: inline-block;
  padding: 0 6px;
  height: 20px;
  line-height: 20px;
  font-size: 12px;
  color: #409eff;
  background-color: #ecf5ff;
  border-radius: 4px;
  box-sizing: border-box;
  white-space: nowrap;
}

.more-tags {
  font-size: 12px;
  color: #909399;
  line-height: 20px;
}

.card-meta {
  display: flex;
  justify-content: space-between;
  margin-bottom: 10px;
  gap: 8px;
}

.meta-item {
  display: flex;
  align-items: center;
  color: #909399;
  font-size: 12px;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.meta-icon {
  margin-right: 4px;
  font-size: 14px;
  vertical-align: middle;
}

.card-footer {
  margin-top: auto;
  display: flex;
  justify-content: space-between;
  align-items: center;
  border-top: 1px solid #f0f0f0;
  padding-top: 10px;
}

.btn-icon {
  background: none;
  border: none;
  color: #909399;
  cursor: pointer;
  padding: 4px;
  border-radius: 4px;
  transition: all 0.3s;
}

.btn-icon:hover {
  color: #409eff;
  background-color: #f0f7ff;
}

.card-actions {
  display: flex;
  gap: 6px;
}
</style>