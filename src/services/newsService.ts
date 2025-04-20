import apiClient from './api';

export interface News {
  id: number;
  title: string;
  content: string;
  category: string;
  newsType: number; // 1-协会通知，2-技术分享
  coverImage: string;
  viewCount: number;
  isTop: number; // 0-否，1-是
  status: number; // 0-草稿，1-已发布，2-已下架
  createdAt: string;
  updatedAt: string;
  // 额外添加前端界面需要的属性
  authorName?: string; // 用户显示，可能后端不返回
  createTime?: string; // 兼容前端组件属性
  updateTime?: string; // 兼容前端组件属性
  // NewsCard组件需要的属性
  summary?: string; // 摘要
  author?: string; // 作者名
  publishDate?: string; // 发布日期
  coverUrl?: string; // 封面URL
  tags?: string[]; // 标签数组
  isHot?: boolean; // 是否热门
  severity?: string; // 重要程度
}

export interface NewsListResponse {
  code: number;
  msg: string;
  traceid: string;
  data: {
    list: News[];
    total: number;
    page: number;
    pageSize: number;
  };
}

export interface NewsDetailResponse {
  code: number;
  msg: string;
  traceid: string;
  data: News;
}

// 处理从API获取的新闻数据，添加前端组件需要的额外字段
const processNewsData = (news: News): News => {
  return {
    ...news,
    // 兼容前端组件属性
    createTime: news.createdAt,
    updateTime: news.updatedAt,
    // NewsCard组件需要的属性
    summary: news.content ? getContentSummary(news.content) : '',
    author: news.authorName || '管理员',
    publishDate: news.createdAt,
    coverUrl: news.coverImage,
    tags: [],
    isHot: news.isTop === 1,
    severity: news.isTop === 1 ? 'high' : 'normal'
  };
};

// 从内容中提取摘要
const getContentSummary = (content: string): string => {
  // 移除Markdown或HTML标记
  const plainText = content.replace(/#+\s|<[^>]+>/g, '').replace(/\*\*|\*|\[|\]|\(|\)|\#|\>|\`\`\`|\`/g, '');
  return plainText.length > 120 ? plainText.substring(0, 120) + '...' : plainText;
};

export const newsService = {
  // 获取新闻列表
  getNewsList: async (params: {
    page?: number;
    pageSize?: number;
    category?: string;
    newsType?: number;
    status?: number;
  }): Promise<NewsListResponse> => {
    try {
      const response = await apiClient.get<NewsListResponse>('/api/news/v1/list', { params });
      // 处理响应数据，添加前端组件需要的字段
      if (response.data.code === 0 && response.data.data.list) {
        response.data.data.list = response.data.data.list.map(processNewsData);
      }
      return response.data;
    } catch (error) {
      console.error('获取新闻列表失败:', error);
      return {
        code: -1,
        msg: '获取新闻列表失败',
        traceid: '',
        data: {
          list: [],
          total: 0,
          page: params.page || 1,
          pageSize: params.pageSize || 10
        }
      };
    }
  },

  // 获取新闻详情
  getNewsDetail: async (newsId: number): Promise<NewsDetailResponse> => {
    try {
      const response = await apiClient.get<NewsDetailResponse>(`/api/news/v1/detail/${newsId}`);
      // 处理响应数据，添加前端组件需要的字段
      if (response.data.code === 0 && response.data.data) {
        response.data.data = processNewsData(response.data.data);
      }
      return response.data;
    } catch (error) {
      console.error('获取新闻详情失败:', error);
      return {
        code: -1,
        msg: '获取新闻详情失败',
        traceid: '',
        data: {} as News
      };
    }
  },
  
  // 获取技术博客列表（实际上是筛选newsType为2的新闻）
  getBlogList: async (params: { 
    page: number; 
    pageSize: number 
  }): Promise<NewsListResponse> => {
    try {
      const response = await apiClient.get<NewsListResponse>('/api/news/v1/list', { 
        params: {
          ...params,
          newsType: 2 // 2-技术分享
        } 
      });
      // 处理响应数据，添加前端组件需要的字段
      if (response.data.code === 0 && response.data.data.list) {
        response.data.data.list = response.data.data.list.map(processNewsData);
      }
      return response.data;
    } catch (error) {
      console.error('获取博客列表失败:', error);
      return {
        code: -1,
        msg: '获取博客列表失败',
        traceid: '',
        data: {
          list: [],
          total: 0,
          page: params.page || 1,
          pageSize: params.pageSize || 10
        }
      };
    }
  },
  
  // 获取协会通知列表（实际上是筛选newsType为1的新闻）
  getNotificationList: async (params: { 
    page: number; 
    pageSize: number 
  }): Promise<NewsListResponse> => {
    try {
      const response = await apiClient.get<NewsListResponse>('/api/news/v1/list', { 
        params: {
          ...params,
          newsType: 1 // 1-协会通知
        } 
      });
      // 处理响应数据，添加前端组件需要的字段
      if (response.data.code === 0 && response.data.data.list) {
        response.data.data.list = response.data.data.list.map(processNewsData);
      }
      return response.data;
    } catch (error) {
      console.error('获取通知列表失败:', error);
      return {
        code: -1,
        msg: '获取通知列表失败',
        traceid: '',
        data: {
          list: [],
          total: 0,
          page: params.page || 1,
          pageSize: params.pageSize || 10
        }
      };
    }
  },
  
  // 创建新闻
  createNews: async (news: {
    title: string;
    content: string;
    category: string;
    newsType: number;
    coverImage?: string;
    status?: number;
  }): Promise<{code: number; msg: string; data: {id: number}}> => {
    const response = await apiClient.post('/api/news/v1/create', news);
    return response.data;
  },
  
  // 更新新闻
  updateNews: async (newsId: number, news: {
    title?: string;
    content?: string;
    category?: string;
    newsType?: number;
    coverImage?: string;
    status?: number;
  }): Promise<{code: number; msg: string; data: {success: boolean}}> => {
    const response = await apiClient.put(`/api/news/v1/update/${newsId}`, news);
    return response.data;
  },
  
  // 删除新闻
  deleteNews: async (newsId: number): Promise<{code: number; msg: string; data: {success: boolean}}> => {
    const response = await apiClient.delete(`/api/news/v1/delete/${newsId}`);
    return response.data;
  }
};

// 格式化日期为友好的显示格式
export const formatNewsDate = (dateStr: string): string => {
  if (!dateStr) return '';
  
  const date = new Date(dateStr);
  const now = new Date();
  
  // 计算时间差（毫秒）
  const diff = now.getTime() - date.getTime();
  
  // 小于1小时，显示"xx分钟前"
  if (diff < 3600000) {
    const minutes = Math.floor(diff / 60000);
    return minutes <= 0 ? '刚刚' : `${minutes}分钟前`;
  }
  
  // 小于24小时，显示"xx小时前"
  if (diff < 86400000) {
    const hours = Math.floor(diff / 3600000);
    return `${hours}小时前`;
  }
  
  // 小于30天，显示"xx天前"
  if (diff < 2592000000) {
    const days = Math.floor(diff / 86400000);
    return `${days}天前`;
  }
  
  // 否则显示完整日期
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  
  return `${year}-${month}-${day}`;
};

// 获取新闻类型文本
export const getNewsTypeText = (newsType: number): string => {
  switch (newsType) {
    case 1: return '协会通知';
    case 2: return '技术分享';
    default: return '其他';
  }
};

// 获取新闻类型的CSS类
export const getNewsTypeClass = (newsType: number): string => {
  switch (newsType) {
    case 1: return 'notice';
    case 2: return 'tech';
    default: return 'other';
  }
};