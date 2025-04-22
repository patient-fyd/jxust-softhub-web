import { ref } from 'vue';

// 资源接口定义
export interface Resource {
  id: string;
  name: string;
  description: string;
  fileType: string;
  url: string;
  coverUrl: string;
  downloadCount: number;
  categoryId: string;
  uploaderId: string;
  uploaderName: string;
  uploadTime: string;
  size?: number;
}

// 资源分类接口定义
export interface ResourceCategory {
  id: string;
  name: string;
  count: number;
}

// 上传资源表单数据接口
export interface ResourceUploadData {
  name: string;
  description: string;
  categoryId: string;
  isExternalLink: boolean;
  url: string;
  fileType: string;
  file?: File | null;
  coverFile?: File | null;
}

// 全局资源缓存
const resourcesCache = ref<Resource[]>([]);
const categoriesCache = ref<ResourceCategory[]>([]);
const isLoadingResources = ref<boolean>(false);
const isLoadingCategories = ref<boolean>(false);

// 资源服务类
export default {
  // 获取所有资源
  async getAllResources(): Promise<Resource[]> {
    if (resourcesCache.value.length > 0) {
      return resourcesCache.value;
    }
    
    isLoadingResources.value = true;
    
    try {
      // TODO: 实际API集成
      // const response = await axios.get('/api/resources');
      // resourcesCache.value = response.data;
      
      // 模拟数据
      await new Promise(resolve => setTimeout(resolve, 1000));
      resourcesCache.value = this.getMockResources();
      
      return resourcesCache.value;
    } catch (error) {
      console.error('获取资源列表失败:', error);
      throw error;
    } finally {
      isLoadingResources.value = false;
    }
  },
  
  // 获取所有资源分类
  async getAllCategories(): Promise<ResourceCategory[]> {
    if (categoriesCache.value.length > 0) {
      return categoriesCache.value;
    }
    
    isLoadingCategories.value = true;
    
    try {
      // TODO: 实际API集成
      // const response = await axios.get('/api/resource-categories');
      // categoriesCache.value = response.data;
      
      // 模拟数据
      await new Promise(resolve => setTimeout(resolve, 800));
      categoriesCache.value = this.getMockCategories();
      
      return categoriesCache.value;
    } catch (error) {
      console.error('获取资源分类失败:', error);
      throw error;
    } finally {
      isLoadingCategories.value = false;
    }
  },
  
  // 搜索资源
  async searchResources(keyword: string): Promise<Resource[]> {
    // 在实际应用中，这应该是一个API调用
    // 此处我们简单地从缓存中过滤
    const resources = await this.getAllResources();
    if (!keyword.trim()) return resources;
    
    const lowerKeyword = keyword.toLowerCase();
    return resources.filter(r => 
      r.name.toLowerCase().includes(lowerKeyword) || 
      r.description.toLowerCase().includes(lowerKeyword)
    );
  },
  
  // 按分类获取资源
  async getResourcesByCategory(categoryId: string): Promise<Resource[]> {
    const resources = await this.getAllResources();
    if (!categoryId) return resources;
    
    return resources.filter(r => r.categoryId === categoryId);
  },
  
  // 获取资源详情
  async getResourceById(id: string): Promise<Resource | null> {
    try {
      // TODO: 实际API集成
      // const response = await axios.get(`/api/resources/${id}`);
      // return response.data;
      
      // 从缓存查找
      const resources = await this.getAllResources();
      return resources.find(r => r.id === id) || null;
    } catch (error) {
      console.error(`获取资源详情失败 (ID: ${id}):`, error);
      throw error;
    }
  },
  
  // 上传资源
  async uploadResource(data: ResourceUploadData): Promise<Resource> {
    try {
      // 实际API调用应使用FormData处理文件上传
      // const formData = new FormData();
      // Object.keys(data).forEach(key => {
      //   if (key === 'file' || key === 'coverFile') {
      //     if (data[key]) formData.append(key, data[key]);
      //   } else {
      //     formData.append(key, data[key]);
      //   }
      // });
      // 
      // const response = await axios.post('/api/resources', formData, {
      //   headers: {
      //     'Content-Type': 'multipart/form-data'
      //   }
      // });
      // 
      // return response.data;
      
      // 模拟上传过程
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      // 创建模拟的新资源
      const newResource: Resource = {
        id: `res-${Date.now()}`,
        name: data.name,
        description: data.description,
        fileType: data.fileType || '',
        url: data.isExternalLink ? data.url : `mock-url-${Date.now()}.${getFileExtension(data.file?.name || '')}`,
        coverUrl: data.coverFile ? 'https://via.placeholder.com/200x150' : '',
        downloadCount: 0,
        categoryId: data.categoryId,
        uploaderId: 'current-user',
        uploaderName: '当前用户',
        uploadTime: new Date().toISOString(),
        size: data.file?.size
      };
      
      // 添加到缓存
      resourcesCache.value = [newResource, ...resourcesCache.value];
      
      // 更新对应分类的计数
      const category = categoriesCache.value.find(c => c.id === data.categoryId);
      if (category) {
        category.count++;
      }
      
      return newResource;
    } catch (error) {
      console.error('上传资源失败:', error);
      throw error;
    }
  },
  
  // 下载资源
  async downloadResource(id: string): Promise<void> {
    try {
      const resource = await this.getResourceById(id);
      if (!resource) {
        throw new Error('资源不存在');
      }
      
      // 直接链接类资源
      if (resource.url.startsWith('http')) {
        window.open(resource.url, '_blank');
        
        // 异步更新下载计数
        this.incrementDownloadCount(id);
        return;
      }
      
      // 服务器资源下载 - 实际实现应该是调用API
      // const response = await axios.get(`/api/resources/${id}/download`, {
      //   responseType: 'blob'
      // });
      // 
      // const blob = new Blob([response.data]);
      // const url = window.URL.createObjectURL(blob);
      // const a = document.createElement('a');
      // a.href = url;
      // a.download = resource.name;
      // document.body.appendChild(a);
      // a.click();
      // window.URL.revokeObjectURL(url);
      // document.body.removeChild(a);
      
      // 模拟下载
      alert(`模拟下载: ${resource.name}`);
      
      // 更新下载计数
      this.incrementDownloadCount(id);
    } catch (error) {
      console.error(`下载资源失败 (ID: ${id}):`, error);
      throw error;
    }
  },
  
  // 增加下载计数
  async incrementDownloadCount(id: string): Promise<void> {
    try {
      // 实际API调用
      // await axios.post(`/api/resources/${id}/increment-download`);
      
      // 模拟计数更新
      const resource = resourcesCache.value.find(r => r.id === id);
      if (resource) {
        resource.downloadCount++;
      }
    } catch (error) {
      console.error(`更新下载计数失败 (ID: ${id}):`, error);
    }
  },
  
  // 检查当前用户是否为管理员
  isAdmin(): boolean {
    // 实际应用中，这应该从授权服务或用户服务获取
    // 此处简单返回true用于演示
    return true;
  },
  
  // 以下是模拟数据方法
  
  // 生成模拟资源数据
  getMockResources(): Resource[] {
    const resourceTypes = [
      { ext: 'pdf', type: 'application/pdf' },
      { ext: 'doc', type: 'application/msword' },
      { ext: 'ppt', type: 'application/vnd.ms-powerpoint' },
      { ext: 'zip', type: 'application/zip' },
      { ext: 'exe', type: 'application/octet-stream' },
      { ext: 'jpg', type: 'image/jpeg' }
    ];
    
    const categories = this.getMockCategories();
    
    // 资源名称前缀
    const resourcePrefixes = {
      'cat-1': ['Java', 'Spring', 'Maven', 'Hibernate'],
      'cat-2': ['Python', 'Django', 'Flask', 'Pandas', 'Numpy'],
      'cat-3': ['JavaScript', 'Vue', 'React', 'Angular', 'Node.js'],
      'cat-4': ['学习指南', '教程', '手册', '文档'],
      'cat-5': ['Photoshop', 'Illustrator', 'Premiere', 'After Effects'],
      'cat-6': ['Windows', 'Linux', 'MacOS', 'Android']
    };
    
    // 生成1个月内的随机日期
    const getRandomDate = () => {
      const now = new Date();
      const randomDays = Math.floor(Math.random() * 30);
      const randomHours = Math.floor(Math.random() * 24);
      const randomMinutes = Math.floor(Math.random() * 60);
      
      const date = new Date(now);
      date.setDate(date.getDate() - randomDays);
      date.setHours(date.getHours() - randomHours);
      date.setMinutes(date.getMinutes() - randomMinutes);
      
      return date.toISOString();
    };
    
    // 生成随机上传者
    const uploaders = [
      { id: 'user-1', name: '张三' },
      { id: 'user-2', name: '李四' },
      { id: 'user-3', name: '王五' },
      { id: 'user-4', name: '赵六' },
      { id: 'admin-1', name: '管理员' }
    ];
    
    // 生成模拟资源
    const mockResources: Resource[] = [];
    
    // 为每个分类生成多个资源
    categories.forEach(category => {
      const count = Math.floor(Math.random() * 10) + 5; // 每个分类5-15个资源
      const prefixes = resourcePrefixes[category.id as keyof typeof resourcePrefixes] || ['资源'];
      
      for (let i = 0; i < count; i++) {
        const randomTypeIndex = Math.floor(Math.random() * resourceTypes.length);
        const resourceType = resourceTypes[randomTypeIndex];
        const prefix = prefixes[Math.floor(Math.random() * prefixes.length)];
        const uploader = uploaders[Math.floor(Math.random() * uploaders.length)];
        
        mockResources.push({
          id: `res-${category.id}-${i}`,
          name: `${prefix}${i + 1}系列教程.${resourceType.ext}`,
          description: `这是一份关于${prefix}的学习资源，适合初学者和进阶者学习使用。包含了完整的教程和示例代码。`,
          fileType: resourceType.type,
          url: `https://example.com/files/${prefix}-tutorial-${i + 1}.${resourceType.ext}`,
          coverUrl: Math.random() > 0.3 ? `https://picsum.photos/seed/${category.id}-${i}/300/200` : '',
          downloadCount: Math.floor(Math.random() * 1000),
          categoryId: category.id,
          uploaderId: uploader.id,
          uploaderName: uploader.name,
          uploadTime: getRandomDate(),
          size: Math.floor(Math.random() * 100000000) // 随机文件大小
        });
      }
    });
    
    // 按上传时间降序排序
    return mockResources.sort((a, b) => 
      new Date(b.uploadTime).getTime() - new Date(a.uploadTime).getTime()
    );
  },
  
  // 生成模拟分类数据
  getMockCategories(): ResourceCategory[] {
    return [
      { id: 'cat-1', name: 'Java开发', count: 12 },
      { id: 'cat-2', name: 'Python开发', count: 18 },
      { id: 'cat-3', name: '前端开发', count: 15 },
      { id: 'cat-4', name: '学习资料', count: 24 },
      { id: 'cat-5', name: '设计软件', count: 8 },
      { id: 'cat-6', name: '开发工具', count: 20 }
    ];
  }
};

// 辅助函数：获取文件扩展名
function getFileExtension(filename: string): string {
  return filename.slice((filename.lastIndexOf('.') - 1 >>> 0) + 2);
} 