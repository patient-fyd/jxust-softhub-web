import apiClient from './api';

export interface News {
  newsId: number;
  title: string;
  content: string;
  category: string;
  coverImage: string | null;
  authorId: number | null;
  viewCount: number;
  status: number;
  createTime: string;
  updateTime: string;
  authorName?: string; // 可选的作者名称
}

export interface NewsListResponse {
  code: number;
  msg: string;
  traceid: string;
  data: {
    total: number;
    list: News[];
  };
}

export interface NewsDetailResponse {
  code: number;
  msg: string;
  traceid: string;
  data: {
    news: News;
  };
}

export const newsService = {
  // 获取新闻列表
  getNewsList: async (params: { page: number; pageSize: number; category?: string }): Promise<NewsListResponse> => {
    const response = await apiClient.get<NewsListResponse>('/api/news/v1/list', { params });
    return response.data;
  },
  
  // 获取新闻详情
  getNewsDetail: async (newsId: number): Promise<NewsDetailResponse> => {
    const response = await apiClient.get<NewsDetailResponse>(`/api/news/v1/detail/${newsId}`);
    return response.data;
  },
  
  // 获取技术博客列表（实际上是筛选category为"技术分享"的新闻）
  getBlogList: async (params: { page: number; pageSize: number }): Promise<NewsListResponse> => {
    const response = await apiClient.get<NewsListResponse>('/api/news/v1/list', { 
      params: {
        ...params,
        category: '技术分享'
      } 
    });
    return response.data;
  },
};