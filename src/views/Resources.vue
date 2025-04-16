<template>
  <div class="resources-page">
    <!-- 页面头部 -->
    <div class="resources-header">
      <div class="header-left">
        <h2 class="page-title">资源共享</h2>
        <div class="page-description">查找和分享学习资源，助力大家共同进步</div>
      </div>
      <div class="header-right">
        <button class="btn btn-primary" @click="openUploadModal">
          <Icon icon="mdi:upload" class="btn-icon" /> 上传资源
        </button>
      </div>
    </div>

    <!-- 搜索和筛选区域 -->
    <div class="search-filter-container">
      <div class="search-box">
        <div class="search-input-wrapper">
          <Icon icon="mdi:magnify" class="search-icon" />
          <input
            type="text"
            v-model="searchQuery"
            placeholder="搜索资源名称、描述或标签"
            class="search-input"
            @keyup.enter="handleSearch"
          >
          <button class="search-button" @click="handleSearch">搜索</button>
        </div>
      </div>

      <div class="filter-container">
        <!-- 分类筛选 -->
        <div class="filter-item">
          <select
            v-model="filters.categoryId"
            class="filter-select"
            @change="handleFilterChange"
          >
            <option value="">全部分类</option>
            <option
              v-for="category in categories"
              :key="category.id"
              :value="category.id"
            >
              {{ category.name }}
            </option>
          </select>
        </div>

        <!-- 文件类型筛选 -->
        <div class="filter-item">
          <select
            v-model="filters.fileType"
            class="filter-select"
            @change="handleFilterChange"
          >
            <option value="">文件类型</option>
            <option
              v-for="type in fileTypes"
              :key="type.value"
              :value="type.value"
            >
              {{ type.label }}
            </option>
          </select>
        </div>

        <!-- 排序方式 -->
        <div class="filter-item">
          <select
            v-model="filters.sortBy"
            class="filter-select"
            @change="handleFilterChange"
          >
            <option
              v-for="option in sortOptions"
              :key="option.value"
              :value="option.value"
            >
              {{ option.label }}
            </option>
          </select>
        </div>
      </div>
    </div>

    <!-- 标签筛选 -->
    <div v-if="popularTags.length > 0" class="tags-container">
      <span class="tags-label">热门标签:</span>
      <div class="tags-list">
        <span
          v-for="tag in popularTags"
          :key="tag"
          class="tag-item"
          :class="{ 'tag-active': selectedTags.includes(tag) }"
          @click="toggleTag(tag)"
        >
          {{ tag }}
        </span>
      </div>
    </div>

    <!-- 资源列表 -->
    <div v-if="loading" class="loading-container">
      <div class="loading-skeleton">
        <div v-for="i in 8" :key="i" class="skeleton-card">
          <div class="skeleton-image"></div>
          <div class="skeleton-content">
            <div class="skeleton-title"></div>
            <div class="skeleton-text"></div>
            <div class="skeleton-text"></div>
          </div>
        </div>
      </div>
    </div>
    <div v-else-if="filteredResources.length === 0" class="empty-container">
      <div class="empty-state">
        <div class="empty-icon">📚</div>
        <h3 class="empty-title">暂无资源</h3>
        <p class="empty-text">
          未找到符合条件的资源
          <span v-if="hasFilters" class="empty-hint">
            尝试清除筛选条件或者上传一个新资源
          </span>
        </p>
        <button class="btn btn-primary" @click="openUploadModal">上传资源</button>
      </div>
    </div>
    <div v-else class="resources-grid">
      <resource-card
        v-for="resource in currentPageResources"
        :key="resource.id"
        :resource="resource"
        :categories="categories"
        @view="handleViewResource"
        @download="handleDownloadResource"
      />
    </div>

    <!-- 分页器 -->
    <div v-if="filteredResources.length > 0" class="pagination-container">
      <div class="pagination">
        <div class="pagination-info">
          共 <span class="pagination-total">{{ totalResources }}</span> 条
        </div>
        
        <div class="pagination-size">
          <select v-model="pagination.pageSize" @change="handleSizeChange" class="pagination-select">
            <option :value="12">12条/页</option>
            <option :value="24">24条/页</option>
            <option :value="36">36条/页</option>
            <option :value="48">48条/页</option>
          </select>
        </div>
        
        <div class="pagination-buttons">
          <button 
            class="pagination-button" 
            :disabled="pagination.currentPage === 1"
            @click="handleCurrentChange(pagination.currentPage - 1)"
          >
            上一页
          </button>
          
          <button 
            v-for="page in displayedPages" 
            :key="page"
            class="pagination-button" 
            :class="{ 'active': pagination.currentPage === page }"
            @click="handleCurrentChange(page)"
          >
            {{ page }}
          </button>
          
          <button 
            class="pagination-button" 
            :disabled="pagination.currentPage === totalPages"
            @click="handleCurrentChange(pagination.currentPage + 1)"
          >
            下一页
          </button>
        </div>
        
        <div class="pagination-jumper">
          前往
          <input 
            type="number" 
            class="pagination-jumper-input" 
            v-model="jumpPage" 
            min="1"
            :max="totalPages"
          >
          页
          <button class="pagination-jumper-button" @click="jumpToPage">GO</button>
        </div>
      </div>
    </div>

    <!-- 上传资源对话框 -->
    <upload-resource-modal
      v-model:visible="uploadModalVisible"
      :categories="categories"
      @upload-success="handleUploadSuccess"
      @close="handleUploadModalClose"
    />

    <!-- 资源详情对话框 -->
    <teleport to="body">
      <div v-if="resourceDetailVisible" class="modal-overlay" @click.self="resourceDetailVisible = false">
        <div class="modal-container resource-detail-modal">
          <div class="modal-header">
            <h2 class="modal-title">资源详情</h2>
            <button class="modal-close-btn" @click="resourceDetailVisible = false">&times;</button>
          </div>
          <div class="modal-body">
            <div class="resource-detail">
              <div class="detail-header">
                <div class="detail-cover">
                  <img
                    :src="getResourceCover(selectedResource)"
                    :alt="selectedResource.name"
                    class="cover-image"
                  />
                </div>
                <div class="detail-info">
                  <h1 class="detail-title">{{ selectedResource.name }}</h1>
                  <div class="detail-meta">
                    <div class="meta-item">
                      <Icon icon="mdi:folder-outline" />
                      <span>分类：{{ getCategoryName(selectedResource.categoryId) }}</span>
                    </div>
                    <div class="meta-item">
                      <Icon icon="mdi:file-outline" />
                      <span>文件类型：{{ getFileTypeLabel(selectedResource.fileType) }}</span>
                    </div>
                    <div class="meta-item">
                      <Icon icon="mdi:download-outline" />
                      <span>下载次数：{{ selectedResource.downloadCount }}</span>
                    </div>
                    <div class="meta-item">
                      <Icon icon="mdi:account-outline" />
                      <span>上传者：{{ selectedResource.uploaderName }}</span>
                    </div>
                    <div class="meta-item">
                      <Icon icon="mdi:clock-outline" />
                      <span>上传时间：{{ formatDate(selectedResource.uploadTime) }}</span>
                    </div>
                  </div>
                  <div v-if="selectedResource.tags && selectedResource.tags.length > 0" class="detail-tags">
                    <span
                      v-for="tag in selectedResource.tags"
                      :key="tag"
                      class="detail-tag"
                    >
                      {{ tag }}
                    </span>
                  </div>
                  <div class="detail-actions">
                    <button class="btn btn-primary" @click="downloadResource(selectedResource)">
                      <Icon icon="mdi:download" /> 下载资源
                    </button>
                    <button class="btn btn-default" @click="shareResource(selectedResource)">
                      <Icon icon="mdi:share" /> 分享
                    </button>
                  </div>
                </div>
              </div>
              <div class="detail-description">
                <h4>资源描述</h4>
                <p>{{ selectedResource.description }}</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </teleport>
  </div>
</template>

<script lang="ts">
import { defineComponent, ref, reactive, computed, onMounted, onUnmounted, watch } from 'vue';
import ResourceCard from '@/components/resources/ResourceCard.vue';
import UploadResourceModal from '@/components/resources/UploadResourceModal.vue';
import { Icon } from '@iconify/vue';

// 资源类型接口
export interface Resource {
  id: number;
  name: string;
  description: string;
  categoryId: string;
  fileType: string;
  tags: string[];
  uploaderName: string;
  uploadTime: string;
  downloadCount: number;
  coverUrl?: string;
}

// 分类接口
export interface Category {
  id: string;
  name: string;
}

export default defineComponent({
  name: 'ResourcesPage',
  
  components: {
    ResourceCard,
    UploadResourceModal,
    Icon
  },
  
  setup() {
    // 加载状态
    const loading = ref(true);
    
    // 资源列表
    const resources = ref<Resource[]>([]);
    
    // 分页信息
    const pagination = reactive({
      currentPage: 1,
      pageSize: 12
    });
    
    // 页面跳转输入
    const jumpPage = ref<number | null>(null);
    
    // 分类列表
    const categories = ref<Category[]>([
      { id: '1', name: '课程笔记' },
      { id: '2', name: '实验报告' },
      { id: '3', name: '习题解析' },
      { id: '4', name: '课件资料' },
      { id: '5', name: '编程代码' },
      { id: '6', name: '电子书籍' },
      { id: '7', name: '考试资料' },
      { id: '8', name: '项目文档' }
    ]);
    
    // 文件类型选项
    const fileTypes = ref([
      { label: 'PDF文档', value: 'pdf' },
      { label: 'Word文档', value: 'doc' },
      { label: 'Excel表格', value: 'xls' },
      { label: 'PPT演示', value: 'ppt' },
      { label: '压缩包', value: 'zip' },
      { label: '图片', value: 'img' },
      { label: '代码文件', value: 'code' }
    ]);
    
    // 排序选项
    const sortOptions = ref([
      { label: '最新上传', value: 'latest' },
      { label: '最多下载', value: 'downloads' },
      { label: '名称A-Z', value: 'nameAsc' },
      { label: '名称Z-A', value: 'nameDesc' }
    ]);
    
    // 热门标签
    const popularTags = ref<string[]>([]);
    
    // 选中的标签
    const selectedTags = ref<string[]>([]);
    
    // 搜索查询
    const searchQuery = ref('');
    
    // 筛选条件
    const filters = reactive({
      categoryId: '',
      fileType: '',
      sortBy: 'latest'
    });
    
    // 上传对话框可见性
    const uploadModalVisible = ref(false);
    
    // 资源详情对话框可见性
    const resourceDetailVisible = ref(false);
    
    // 选中的资源
    const selectedResource = ref<Resource | null>(null);
    
    // 存储创建的对象URL，以便在组件卸载时释放
    const objectUrls = ref<string[]>([]);
    
    // 计算属性：是否有筛选条件
    const hasFilters = computed(() => {
      return filters.categoryId !== '' || 
             filters.fileType !== '' || 
             selectedTags.value.length > 0 || 
             searchQuery.value.trim() !== '';
    });
    
    // 计算属性：根据筛选条件过滤后的资源列表
    const filteredResources = computed(() => {
      let result = [...resources.value];
      
      // 搜索过滤
      if (searchQuery.value.trim() !== '') {
        const query = searchQuery.value.toLowerCase().trim();
        result = result.filter(resource => 
          resource.name.toLowerCase().includes(query) || 
          resource.description.toLowerCase().includes(query) ||
          resource.tags.some(tag => tag.toLowerCase().includes(query))
        );
      }
      
      // 分类过滤
      if (filters.categoryId) {
        result = result.filter(resource => resource.categoryId === filters.categoryId);
      }
      
      // 文件类型过滤
      if (filters.fileType) {
        result = result.filter(resource => resource.fileType === filters.fileType);
      }
      
      // 标签过滤
      if (selectedTags.value.length > 0) {
        result = result.filter(resource => 
          selectedTags.value.some(tag => resource.tags.includes(tag))
        );
      }
      
      // 排序
      switch (filters.sortBy) {
        case 'latest':
          result.sort((a, b) => new Date(b.uploadTime).getTime() - new Date(a.uploadTime).getTime());
          break;
        case 'downloads':
          result.sort((a, b) => b.downloadCount - a.downloadCount);
          break;
        case 'nameAsc':
          result.sort((a, b) => a.name.localeCompare(b.name));
          break;
        case 'nameDesc':
          result.sort((a, b) => b.name.localeCompare(a.name));
          break;
      }
      
      return result;
    });
    
    // 计算属性：资源总数
    const totalResources = computed(() => filteredResources.value.length);
    
    // 计算属性：总页数
    const totalPages = computed(() => {
      return Math.ceil(filteredResources.value.length / pagination.pageSize);
    });
    
    // 计算属性：当前页的资源
    const currentPageResources = computed(() => {
      const start = (pagination.currentPage - 1) * pagination.pageSize;
      const end = start + pagination.pageSize;
      return filteredResources.value.slice(start, end);
    });
    
    // 计算属性：显示的页码
    const displayedPages = computed(() => {
      const current = pagination.currentPage;
      const total = totalPages.value;
      
      if (total <= 7) {
        return Array.from({ length: total }, (_, i) => i + 1);
      }
      
      if (current <= 3) {
        return [1, 2, 3, 4, 5, '...', total];
      }
      
      if (current >= total - 2) {
        return [1, '...', total - 4, total - 3, total - 2, total - 1, total];
      }
      
      return [1, '...', current - 1, current, current + 1, '...', total];
    });
    
    // 生成模拟资源数据
    const generateMockResources = () => {
      const mockResources: Resource[] = [];
      
      // 资源名称列表
      const resourceNames = [
        '数据结构与算法课程笔记',
        '计算机网络实验报告',
        'Java编程基础知识点总结',
        '软件工程课程PPT',
        '离散数学期末复习资料',
        'C++面向对象程序设计实验',
        '操作系统原理学习笔记',
        '数据库系统概论习题解析',
        'Python数据分析项目实战代码',
        '计算机组成原理知识点整理',
        '人工智能导论学习资料',
        '软件测试技术与方法总结',
        '前端开发技术栈指南',
        '后端架构设计文档',
        '移动应用开发实战案例'
      ];
      
      // 生成30-50个随机资源
      const count = Math.floor(Math.random() * 20) + 30; 
      
      for (let i = 0; i < count; i++) {
        const nameIndex = Math.floor(Math.random() * resourceNames.length);
        const name = i < resourceNames.length 
          ? resourceNames[i] 
          : `${resourceNames[nameIndex]} ${i}`;
          
        const categoryId = String(Math.floor(Math.random() * 8) + 1);
        
        const fileTypeOptions = ['pdf', 'doc', 'ppt', 'zip', 'xls', 'code', 'img'];
        const fileType = fileTypeOptions[Math.floor(Math.random() * fileTypeOptions.length)];
        
        const tagPool = [
          '期末复习', '课程笔记', '习题集', '编程实践', '课件', 
          '实验报告', '项目资料', '参考书籍', '算法', '数据结构',
          'Java', 'Python', 'C++', '前端', '后端', '数据库',
          '机器学习', '网络安全', '操作系统', '软件工程'
        ];
        
        // 随机选择2-5个标签
        const tagCount = Math.floor(Math.random() * 4) + 2;
        const tagIndices = new Set<number>();
        while (tagIndices.size < tagCount) {
          tagIndices.add(Math.floor(Math.random() * tagPool.length));
        }
        
        const tags = Array.from(tagIndices).map(index => tagPool[index]);
        
        // 添加到热门标签中
        tags.forEach(tag => {
          if (!popularTags.value.includes(tag) && Math.random() > 0.7) {
            popularTags.value.push(tag);
          }
        });
        
        const downloadCount = Math.floor(Math.random() * 500);
        
        // 随机生成上传时间（过去1年内）
        const now = new Date();
        const pastDate = new Date(now.getTime() - Math.random() * 365 * 24 * 60 * 60 * 1000);
        
        mockResources.push({
          id: i + 1,
          name,
          description: `这是关于${name}的详细资料，包含了相关的理论知识、实践案例和习题解析，适合课程学习和复习使用。`,
          categoryId,
          fileType,
          tags,
          uploaderName: ['张同学', '李老师', '王助教', '赵博士', '软件学院'][Math.floor(Math.random() * 5)],
          uploadTime: pastDate.toISOString(),
          downloadCount,
          coverUrl: ''  // 默认为空，会根据文件类型显示默认封面
        });
      }
      
      // 对热门标签进行排序和限制
      popularTags.value = popularTags.value.slice(0, 10);
      
      return mockResources;
    };
    
    // 获取分类名称
    const getCategoryName = (categoryId: string) => {
      const category = categories.value.find(c => c.id === categoryId);
      return category ? category.name : '未分类';
    };
    
    // 格式化日期
    const formatDate = (dateString: string) => {
      const date = new Date(dateString);
      return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`;
    };
    
    // 获取资源封面
    const getResourceCover = (resource: Resource) => {
      // 如果有封面图，直接返回
      if (resource.coverUrl) {
        return resource.coverUrl;
      }
      
      // 生成默认封面SVG
      const title = resource.name;
      const shortTitle = title.length > 15 ? title.substring(0, 15) + '...' : title;
      
      // 根据文件类型选择背景颜色
      let bgColor = '#409eff'; // 默认蓝色
      let iconSymbol = '📄';   // 默认文档图标
      
      switch (resource.fileType) {
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
      const category = getCategoryName(resource.categoryId);
      
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
    };
    
    // 获取文件类型标签
    const getFileTypeLabel = (fileType: string) => {
      const fileTypeMap: Record<string, string> = {
        pdf: 'PDF文档',
        doc: 'Word文档',
        docx: 'Word文档',
        xls: 'Excel表格',
        xlsx: 'Excel表格',
        ppt: 'PPT演示',
        pptx: 'PPT演示',
        zip: '压缩包',
        rar: '压缩包',
        code: '代码文件',
        img: '图片'
      };
      return fileTypeMap[fileType] || fileType.toUpperCase();
    };
    
    // 切换标签
    const toggleTag = (tag: string) => {
      if (selectedTags.value.includes(tag)) {
        selectedTags.value = selectedTags.value.filter(t => t !== tag);
      } else {
        selectedTags.value.push(tag);
      }
      handleFilterChange();
    };
    
    // 处理搜索
    const handleSearch = () => {
      pagination.currentPage = 1;
    };
    
    // 处理筛选变化
    const handleFilterChange = () => {
      pagination.currentPage = 1;
    };
    
    // 处理分页大小变化
    const handleSizeChange = (event: Event) => {
      pagination.pageSize = Number((event.target as HTMLSelectElement).value);
      pagination.currentPage = 1;
    };
    
    // 处理页码变化
    const handleCurrentChange = (page: number) => {
      if (page >= 1 && page <= totalPages.value) {
        pagination.currentPage = page;
      }
    };
    
    // 跳转到指定页
    const jumpToPage = () => {
      if (jumpPage.value !== null && jumpPage.value > 0 && jumpPage.value <= totalPages.value) {
        pagination.currentPage = jumpPage.value;
      }
    };
    
    // 打开上传对话框
    const openUploadModal = () => {
      uploadModalVisible.value = true;
    };
    
    // 处理上传成功
    const handleUploadSuccess = (resource: Resource) => {
      resources.value.unshift(resource); // 添加到列表开头
      alert(`资源"${resource.name}"上传成功`);
    };
    
    // 处理上传对话框关闭
    const handleUploadModalClose = () => {
      // 可以做一些清理工作
    };
    
    // 处理查看资源
    const handleViewResource = (resource: Resource) => {
      selectedResource.value = resource;
      resourceDetailVisible.value = true;
    };
    
    // 处理下载资源
    const handleDownloadResource = (resource: Resource) => {
      downloadResource(resource);
    };
    
    // 下载资源
    const downloadResource = (resource: Resource) => {
      // 实际应用中，这里应该调用API进行下载
      alert(`开始下载资源: ${resource.name}`);
      
      // 模拟下载计数增加
      resources.value = resources.value.map(r => {
        if (r.id === resource.id) {
          return {
            ...r,
            downloadCount: r.downloadCount + 1
          };
        }
        return r;
      });
      
      // 如果有选中的资源，也更新其下载计数
      if (selectedResource.value && selectedResource.value.id === resource.id) {
        selectedResource.value = {
          ...selectedResource.value,
          downloadCount: selectedResource.value.downloadCount + 1
        };
      }
    };
    
    // 分享资源
    const shareResource = (resource: Resource) => {
      // 实际应用中，这里可以调用分享API或显示分享对话框
      alert(`已复制资源"${resource.name}"的分享链接到剪贴板`);
    };
    
    // 组件挂载时加载数据
    onMounted(async () => {
      try {
        // 在实际应用中，这里应该调用API获取资源列表
        // const response = await resourceService.getResources();
        // resources.value = response.data;
        
        // 生成模拟数据
        setTimeout(() => {
          resources.value = generateMockResources();
          loading.value = false;
        }, 1000);
      } catch (error) {
        console.error('加载资源失败:', error);
        alert('加载资源失败，请刷新页面重试');
        loading.value = false;
      }
    });
    
    // 组件卸载时释放所有创建的URL
    onUnmounted(() => {
      objectUrls.value.forEach(url => {
        URL.revokeObjectURL(url);
      });
    });
    
    return {
      loading,
      resources,
      filteredResources,
      pagination,
      jumpPage,
      categories,
      fileTypes,
      sortOptions,
      popularTags,
      selectedTags,
      searchQuery,
      filters,
      uploadModalVisible,
      resourceDetailVisible,
      selectedResource,
      totalResources,
      totalPages,
      currentPageResources,
      displayedPages,
      hasFilters,
      getCategoryName,
      formatDate,
      getResourceCover,
      getFileTypeLabel,
      toggleTag,
      handleSearch,
      handleFilterChange,
      handleSizeChange,
      handleCurrentChange,
      jumpToPage,
      openUploadModal,
      handleUploadSuccess,
      handleUploadModalClose,
      handleViewResource,
      handleDownloadResource,
      downloadResource,
      shareResource
    };
  }
});
</script>

<style scoped>
.resources-page {
  padding: 20px;
  max-width: 1400px;
  margin: 0 auto;
}

.resources-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 24px;
}

.header-left {
  display: flex;
  flex-direction: column;
}

.page-title {
  font-size: 28px;
  margin: 0;
  color: #333;
}

.page-description {
  color: #666;
  margin-top: 8px;
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
  transition: .1s;
  font-weight: 500;
  padding: 10px 20px;
  font-size: 14px;
  border-radius: 4px;
}

.btn-default {
  background-color: #fff;
  border-color: #dcdfe6;
  color: #606266;
}

.btn-default:hover {
  color: #409eff;
  border-color: #c6e2ff;
  background-color: #ecf5ff;
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

.btn:disabled {
  opacity: 0.7;
  cursor: not-allowed;
}

/* 按钮图标样式 */
.btn-icon {
  margin-right: 5px;
  vertical-align: middle;
}

/* 搜索和筛选 */
.search-filter-container {
  display: flex;
  flex-wrap: wrap;
  gap: 16px;
  margin-bottom: 16px;
}

.search-box {
  flex: 1;
  min-width: 300px;
}

.search-input-wrapper {
  display: flex;
  border: 1px solid #dcdfe6;
  border-radius: 4px;
  overflow: hidden;
}

/* 搜索图标样式 */
.search-icon {
  display: flex;
  align-items: center;
  padding: 0 10px;
  color: #909399;
}

.search-input {
  flex: 1;
  border: none;
  padding: 10px;
  outline: none;
  font-size: 14px;
}

.search-button {
  background-color: #409eff;
  color: white;
  border: none;
  padding: 0 15px;
  cursor: pointer;
  transition: background-color 0.3s;
}

.search-button:hover {
  background-color: #66b1ff;
}

.filter-container {
  display: flex;
  gap: 12px;
}

.filter-item {
  width: 160px;
}

.filter-select {
  width: 100%;
  height: 40px;
  border: 1px solid #dcdfe6;
  border-radius: 4px;
  padding: 0 10px;
  color: #606266;
  font-size: 14px;
  outline: none;
  appearance: none;
  background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 24 24' stroke='%23606266'%3E%3Cpath stroke-linecap='round' stroke-linejoin='round' stroke-width='2' d='M19 9l-7 7-7-7'%3E%3C/path%3E%3C/svg%3E");
  background-repeat: no-repeat;
  background-position: right 10px center;
  background-size: 16px;
  cursor: pointer;
}

.filter-select:focus {
  border-color: #409eff;
}

/* 标签样式 */
.tags-container {
  display: flex;
  align-items: center;
  margin-bottom: 24px;
  flex-wrap: wrap;
  gap: 8px;
}

.tags-label {
  margin-right: 8px;
  color: #666;
  white-space: nowrap;
}

.tags-list {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
}

.tag-item {
  display: inline-block;
  padding: 0 10px;
  height: 24px;
  line-height: 24px;
  font-size: 12px;
  color: #409eff;
  background-color: #ecf5ff;
  border: 1px solid #d9ecff;
  border-radius: 4px;
  box-sizing: border-box;
  white-space: nowrap;
  cursor: pointer;
  transition: all 0.3s;
}

.tag-item:hover {
  background-color: #d9ecff;
}

.tag-active {
  background-color: #409eff;
  color: white;
  border-color: #409eff;
}

.tag-active:hover {
  background-color: #66b1ff;
  border-color: #66b1ff;
}

/* 资源列表 */
.resources-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
  gap: 24px;
  margin-bottom: 32px;
}

/* 加载状态 */
.loading-container {
  min-height: 500px;
  padding: 24px;
}

.loading-skeleton {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
  gap: 24px;
}

.skeleton-card {
  background-color: #fff;
  border-radius: 8px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
  overflow: hidden;
  height: 300px;
}

.skeleton-image {
  height: 158px;
  background-color: #f2f2f2;
  margin-bottom: 15px;
}

.skeleton-content {
  padding: 0 15px;
}

.skeleton-title {
  height: 20px;
  background-color: #f2f2f2;
  margin-bottom: 15px;
  width: 80%;
  border-radius: 4px;
}

.skeleton-text {
  height: 16px;
  background-color: #f2f2f2;
  margin-bottom: 10px;
  border-radius: 4px;
}

.skeleton-text:last-child {
  width: 60%;
}

@keyframes skeleton-loading {
  0% {
    background-position: 100% 50%;
  }
  100% {
    background-position: 0 50%;
  }
}

.skeleton-image, .skeleton-title, .skeleton-text {
  background-image: linear-gradient(90deg, #f2f2f2 25%, #e6e6e6 50%, #f2f2f2 75%);
  background-size: 200% 100%;
  animation: skeleton-loading 1.5s infinite;
}

/* 空状态 */
.empty-container {
  min-height: 400px;
  display: flex;
  justify-content: center;
  align-items: center;
}

.empty-state {
  text-align: center;
  padding: 40px;
}

.empty-icon {
  font-size: 64px;
  margin-bottom: 16px;
}

.empty-title {
  font-size: 20px;
  color: #303133;
  margin-top: 0;
  margin-bottom: 8px;
}

.empty-text {
  color: #606266;
  font-size: 14px;
  margin-bottom: 20px;
}

.empty-hint {
  display: block;
  margin-top: 8px;
  color: #909399;
  font-size: 13px;
}

/* 分页器 */
.pagination-container {
  display: flex;
  justify-content: center;
  margin-top: 32px;
}

.pagination {
  display: flex;
  align-items: center;
  flex-wrap: wrap;
  gap: 16px;
}

.pagination-info {
  font-size: 14px;
  color: #606266;
}

.pagination-total {
  font-weight: bold;
  color: #409eff;
}

.pagination-size {
  display: flex;
  align-items: center;
}

.pagination-select {
  height: 32px;
  padding: 0 8px;
  border: 1px solid #dcdfe6;
  border-radius: 4px;
  outline: none;
  color: #606266;
  cursor: pointer;
}

.pagination-buttons {
  display: flex;
  align-items: center;
  gap: 8px;
}

.pagination-button {
  min-width: 32px;
  height: 32px;
  padding: 0 4px;
  text-align: center;
  border: 1px solid #dcdfe6;
  border-radius: 4px;
  background-color: #fff;
  color: #606266;
  cursor: pointer;
  transition: all 0.2s;
}

.pagination-button:hover:not(:disabled):not(.active) {
  color: #409eff;
  border-color: #c6e2ff;
}

.pagination-button.active {
  color: #fff;
  background-color: #409eff;
  border-color: #409eff;
}

.pagination-button:disabled {
  color: #c0c4cc;
  cursor: not-allowed;
}

.pagination-jumper {
  display: flex;
  align-items: center;
  font-size: 14px;
  color: #606266;
}

.pagination-jumper-input {
  width: 50px;
  height: 32px;
  margin: 0 6px;
  text-align: center;
  border: 1px solid #dcdfe6;
  border-radius: 4px;
  outline: none;
}

.pagination-jumper-button {
  height: 32px;
  margin-left: 6px;
  padding: 0 10px;
  border: 1px solid #dcdfe6;
  border-radius: 4px;
  background-color: #f4f4f5;
  color: #606266;
  cursor: pointer;
}

.pagination-jumper-button:hover {
  color: #409eff;
  border-color: #c6e2ff;
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
  justify-content: center;
  align-items: center;
  z-index: 1000;
}

.modal-container {
  background-color: #fff;
  border-radius: 8px;
  box-shadow: 0 4px 16px rgba(0, 0, 0, 0.2);
  width: 600px;
  max-width: 95%;
  max-height: 90vh;
  display: flex;
  flex-direction: column;
  overflow: hidden;
}

.resource-detail-modal {
  width: 800px;
}

.modal-header {
  padding: 15px 20px;
  display: flex;
  justify-content: space-between;
  align-items: center;
  border-bottom: 1px solid #ebeef5;
}

.modal-title {
  margin: 0;
  font-size: 18px;
  color: #303133;
  font-weight: 500;
}

.modal-close-btn {
  background: transparent;
  border: none;
  font-size: 22px;
  cursor: pointer;
  color: #909399;
  line-height: 1;
}

.modal-close-btn:hover {
  color: #409eff;
}

.modal-body {
  padding: 20px;
  overflow-y: auto;
  max-height: calc(90vh - 110px);
}

/* 资源详情样式 */
.resource-detail {
  padding: 20px;
}

.detail-header {
  display: flex;
  gap: 24px;
  margin-bottom: 24px;
}

.detail-cover {
  flex: 0 0 250px;
}

.cover-image {
  width: 100%;
  height: auto;
  border-radius: 8px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
}

.detail-info {
  flex: 1;
}

.detail-title {
  margin-top: 0;
  margin-bottom: 16px;
  font-size: 24px;
  color: #333;
}

.detail-meta {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(200px, 1fr));
  gap: 12px;
  margin-bottom: 16px;
}

.meta-item {
  display: flex;
  align-items: center;
  color: #666;
}

.meta-item i, .meta-item svg {
  margin-right: 8px;
}

.detail-tags {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
  margin-bottom: 24px;
}

.detail-tag {
  display: inline-block;
  padding: 0 10px;
  height: 24px;
  line-height: 24px;
  font-size: 12px;
  color: #409eff;
  background-color: #ecf5ff;
  border: 1px solid #d9ecff;
  border-radius: 4px;
  box-sizing: border-box;
  white-space: nowrap;
}

.detail-actions {
  display: flex;
  gap: 12px;
}

.detail-actions .btn {
  display: inline-flex;
  align-items: center;
  gap: 6px;
}

.detail-description {
  border-top: 1px solid #eee;
  padding-top: 20px;
}

.detail-description h4 {
  margin-top: 0;
  margin-bottom: 12px;
  color: #333;
}

.detail-description p {
  color: #666;
  line-height: 1.6;
}

@media (max-width: 768px) {
  .resources-header {
    flex-direction: column;
    align-items: flex-start;
    gap: 16px;
  }
  
  .search-filter-container {
    flex-direction: column;
  }
  
  .filter-container {
    width: 100%;
    overflow-x: auto;
    padding-bottom: 8px;
  }
  
  .detail-header {
    flex-direction: column;
  }
  
  .detail-cover {
    flex: 0 0 auto;
    max-width: 100%;
    margin-bottom: 16px;
  }
  
  .pagination {
    flex-direction: column;
    align-items: flex-start;
  }
}
</style> 