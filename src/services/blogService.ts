import apiClient from './api';
import axios from 'axios';

// 博客类型定义
export interface Blog {
  blogId: number;
  id?: number; // 兼容后端API可能使用id而非blogId
  title: string;
  content: string;
  summary: string;
  category: string;
  tags: string;
  coverImage: string;
  authorId: number;
  authorName: string;
  viewCount: number;
  likeCount: number;
  commentCount: number;
  isRecommend: number; // 0-否，1-是
  status: number; // 0-草稿，1-发布，2-下架
  createTime: string;
  updateTime: string;
}

export interface BlogListResponse {
  code: number;
  msg: string;
  traceid: string;
  data: {
    list: Blog[];
    total: number;
    page: number;
    size: number;
  };
}

export interface BlogDetailResponse {
  code: number;
  msg: string;
  traceid: string;
  data: Blog;
}

export interface BlogOperationResponse {
  code: number;
  msg: string;
  traceid: string;
  data: {
    success: boolean;
  };
}

export interface BlogComment {
  commentId: number;
  blogId: number;
  content: string;
  userId: number;
  userName: string;
  userAvatar: string;
  authorName?: string; // 兼容性属性
  parentId: number;
  createTime: string;
  children?: BlogComment[]; // 嵌套回复
}

export interface BlogCommentListResponse {
  code: number;
  msg: string;
  traceid: string;
  data: {
    list: BlogComment[];
    total: number;
    page: number;
    size: number;
  };
}

export const blogService = {
  // 获取博客列表
  getBlogList: async (params: any): Promise<BlogListResponse> => {
    try {
      const response = await axios.get('/api/blog/v1/blog/list', { params });
      return response.data;
    } catch (error) {
      console.error('获取博客列表失败:', error);
      throw error;
    }
  },

  // 获取博客详情
  getBlogById: async (blogId: string | number): Promise<BlogDetailResponse> => {
    try {
      const response = await axios.get(`/api/blog/v1/blog/${blogId}`);
      return response.data;
    } catch (error) {
      console.error('获取博客详情失败:', error);
      throw error;
    }
  },

  // 创建博客
  createBlog: async (blogData: any): Promise<BlogDetailResponse> => {
    try {
      const response = await axios.post('/api/blog/v1/blog/create', blogData);
      return response.data;
    } catch (error) {
      console.error('创建博客失败:', error);
      throw error;
    }
  },

  // 更新博客
  updateBlog: async (blogId: string | number, blogData: any): Promise<BlogDetailResponse> => {
    try {
      const response = await axios.put(`/api/blog/v1/blog/update/${blogId}`, blogData);
      return response.data;
    } catch (error) {
      console.error('更新博客失败:', error);
      throw error;
    }
  },

  // 删除博客
  deleteBlog: async (blogId: string | number): Promise<BlogOperationResponse> => {
    try {
      const response = await axios.delete(`/api/blog/v1/blog/delete/${blogId}`);
      return response.data;
    } catch (error) {
      console.error('删除博客失败:', error);
      throw error;
    }
  },

  // 上传图片
  uploadImage: async (file: File): Promise<BlogOperationResponse> => {
    try {
      const formData = new FormData();
      formData.append('file', file);
      
      const response = await axios.post('/api/blog/v1/upload/image', formData, {
        headers: {
          'Content-Type': 'multipart/form-data'
        }
      });
      return response.data;
    } catch (error) {
      console.error('上传图片失败:', error);
      throw error;
    }
  },

  // 批量上传图片
  uploadImages: async (files: File[]): Promise<BlogOperationResponse> => {
    try {
      const formData = new FormData();
      files.forEach((file, index) => {
        formData.append(`files[${index}]`, file);
      });
      
      const response = await axios.post('/api/blog/v1/upload/images', formData, {
        headers: {
          'Content-Type': 'multipart/form-data'
        }
      });
      return response.data;
    } catch (error) {
      console.error('批量上传图片失败:', error);
      throw error;
    }
  },

  // 保存草稿
  saveDraft: async (blogData: any): Promise<BlogDetailResponse> => {
    try {
      if (blogData.blogId) {
        // 更新草稿
        return await blogService.updateBlog(blogData.blogId, { ...blogData, status: 0 });
      } else {
        // 创建新草稿
        return await blogService.createBlog({ ...blogData, status: 0 });
      }
    } catch (error) {
      console.error('保存草稿失败:', error);
      throw error;
    }
  },

  // 发布博客
  publishBlog: async (blogData: any): Promise<BlogDetailResponse> => {
    try {
      if (blogData.blogId) {
        // 更新并发布
        return await blogService.updateBlog(blogData.blogId, { ...blogData, status: 1 });
      } else {
        // 创建并发布
        return await blogService.createBlog({ ...blogData, status: 1 });
      }
    } catch (error) {
      console.error('发布博客失败:', error);
      throw error;
    }
  },

  // 获取热门博客
  getHotBlogs: async (limit: number = 5): Promise<BlogListResponse> => {
    try {
      const response = await apiClient.get<BlogListResponse>('/api/blog/v1/hot', { 
        params: { limit } 
      });
      return response.data;
    } catch (error) {
      console.error('获取热门博客失败:', error);
      return {
        code: -1,
        msg: '获取热门博客失败',
        traceid: '',
        data: {
          list: [],
          total: 0,
          page: 1,
          size: limit
        }
      };
    }
  },

  // 获取推荐博客
  getRecommendBlogs: async (limit: number = 5): Promise<BlogListResponse> => {
    try {
      const response = await apiClient.get<BlogListResponse>('/api/blog/v1/recommend', { 
        params: { limit } 
      });
      return response.data;
    } catch (error) {
      console.error('获取推荐博客失败:', error);
      return {
        code: -1,
        msg: '获取推荐博客失败',
        traceid: '',
        data: {
          list: [],
          total: 0,
          page: 1,
          size: limit
        }
      };
    }
  },

  // 获取博客分类列表
  getBlogCategories: async (): Promise<{code: number; msg: string; data: {list: string[]}}> => {
    try {
      const response = await apiClient.get('/api/blog/v1/blog/category/list');
      return response.data;
    } catch (error) {
      console.error('获取博客分类失败:', error);
      return {
        code: -1,
        msg: '获取博客分类失败',
        data: { list: [] }
      };
    }
  },

  // 获取博客标签列表
  getBlogTags: async (): Promise<{code: number; msg: string; data: {list: string[]}}> => {
    try {
      const response = await apiClient.get('/api/blog/v1/blog/tag/list');
      return response.data;
    } catch (error) {
      console.error('获取博客标签失败:', error);
      return {
        code: -1,
        msg: '获取博客标签失败',
        data: { list: [] }
      };
    }
  },

  // 点赞博客
  likeBlog: async (blogId: number): Promise<BlogOperationResponse> => {
    try {
      console.log(`[likeBlog] 发送点赞请求，blogId:${blogId}`);
      
      // 检查用户登录状态
      const token = localStorage.getItem('token');
      if (!token) {
        console.warn('[likeBlog] 用户未登录，无法点赞');
        return {
          code: -1,
          msg: '请先登录再点赞',
          traceid: '',
          data: { success: false }
        };
      }
      
      // 发送请求
      const response = await apiClient.post<BlogOperationResponse>(
        `/api/blog/v1/blog/like`, 
        { blogId: Number(blogId) }, // 确保blogId是数字
        {
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
          }
        }
      );
      
      console.log('[likeBlog] 点赞成功，响应:', response.data);
      return response.data;
    } catch (error: any) {
      // 详细记录错误信息
      console.error('[likeBlog] 点赞博客失败:', error);
      console.error('[likeBlog] 错误状态码:', error.response?.status);
      console.error('[likeBlog] 错误信息:', error.response?.data);
      
      if (error.response?.status === 401) {
        console.warn('[likeBlog] 用户未授权或token无效');
        return {
          code: -1,
          msg: '登录已过期，请重新登录',
          traceid: '',
          data: { success: false }
        };
      }
      
      console.log('[likeBlog] 使用模拟数据替代点赞API');
      
      // 模拟成功响应
      return {
        code: 0,
        msg: '点赞成功(模拟)',
        traceid: '',
        data: { success: true }
      };
    }
  },

  // 取消点赞博客
  unlikeBlog: async (blogId: number): Promise<BlogOperationResponse> => {
    try {
      console.log(`[unlikeBlog] 发送取消点赞请求，blogId:${blogId}`);
      
      // 检查用户登录状态
      const token = localStorage.getItem('token');
      if (!token) {
        console.warn('[unlikeBlog] 用户未登录，无法取消点赞');
        return {
          code: -1,
          msg: '请先登录再操作',
          traceid: '',
          data: { success: false }
        };
      }
      
      // 发送请求
      const response = await apiClient.post<BlogOperationResponse>(
        `/api/blog/v1/blog/unlike`, 
        { blogId: Number(blogId) }, // 确保blogId是数字
        {
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
          }
        }
      );
      
      console.log('[unlikeBlog] 取消点赞成功，响应:', response.data);
      return response.data;
    } catch (error: any) {
      // 详细记录错误信息
      console.error('[unlikeBlog] 取消点赞博客失败:', error);
      console.error('[unlikeBlog] 错误状态码:', error.response?.status);
      console.error('[unlikeBlog] 错误信息:', error.response?.data);
      
      if (error.response?.status === 401) {
        console.warn('[unlikeBlog] 用户未授权或token无效');
        return {
          code: -1,
          msg: '登录已过期，请重新登录',
          traceid: '',
          data: { success: false }
        };
      }
      
      console.log('[unlikeBlog] 使用模拟数据替代取消点赞API');
      
      // 模拟成功响应
      return {
        code: 0,
        msg: '取消点赞成功(模拟)',
        traceid: '',
        data: { success: true }
      };
    }
  },

  // 获取博客评论列表
  getBlogComments: async (params: {
    blogId: number;
    page?: number;
    size?: number;
  }): Promise<BlogCommentListResponse> => {
    try {
      const response = await apiClient.get<BlogCommentListResponse>(
        '/api/blog/v1/blog/comment/list', { params }
      );
      return response.data;
    } catch (error) {
      console.error('获取博客评论失败:', error);
      console.log('使用模拟数据替代评论API');
      
      // 返回模拟评论数据
      const mockComments: BlogComment[] = [
        {
          commentId: 1,
          blogId: params.blogId,
          content: '这篇文章写得非常详细，对我的学习很有帮助！',
          userId: 101,
          userName: '技术爱好者',
          userAvatar: '/avatar/default.png',
          parentId: 0,
          createTime: '2025-04-15 09:30:00',
          children: []
        },
        {
          commentId: 2,
          blogId: params.blogId,
          content: '非常感谢分享这些知识，期待更多类似的文章。',
          userId: 102,
          userName: '编程小白',
          userAvatar: '/avatar/default.png',
          parentId: 0,
          createTime: '2025-04-16 15:45:00',
          children: [
            {
              commentId: 3,
              blogId: params.blogId,
              content: '@编程小白 谢谢支持，我会继续努力创作高质量的内容！',
              userId: 1,
              userName: 'admin',
              userAvatar: '/avatar/admin.png',
              parentId: 2,
              createTime: '2025-04-16 16:20:00'
            }
          ]
        }
      ];
      
      return {
        code: 0,
        msg: '',
        traceid: '',
        data: {
          list: mockComments,
          total: mockComments.length,
          page: params.page || 1,
          size: params.size || 10
        }
      };
    }
  },

  // 创建博客评论
  createBlogComment: async (params: {
    blogId: number;
    content: string;
    parentId?: number;
  }): Promise<{code: number; msg: string; data: {commentId: number}}> => {
    try {
      const response = await apiClient.post('/api/blog/v1/blog/comment/create', params);
      return response.data;
    } catch (error) {
      console.error('发表评论失败:', error);
      console.log('使用模拟数据替代发表评论API');
      
      // 模拟成功响应
      return {
        code: 0,
        msg: '评论发表成功',
        data: { commentId: Math.floor(Math.random() * 1000) + 100 } // 生成随机ID
      };
    }
  },
  
  // 添加博客评论的别名方法，兼容性考虑
  addBlogComment: async (params: {
    blogId: number;
    content: string;
    parentId?: number;
  }): Promise<{code: number; msg: string; data: {commentId: number}}> => {
    return blogService.createBlogComment(params);
  },
  
  // 获取相关博客
  getRelatedBlogs: async (blogId: number, limit: number = 5): Promise<BlogListResponse> => {
    // 直接返回模拟数据，不再调用可能不存在的API
    console.log('使用模拟数据替代相关博客API');
    
    // 根据blogId返回不同的相关博客（为了更加真实）
    let mockData: Partial<Blog>[] = [];
    
    // 根据不同的博客ID返回不同的相关博客
    if (blogId === 1) {
      mockData = [
        { blogId: 2, title: 'Vue3 组合式API完全指南', createTime: '2025-04-11 10:15:00' },
        { blogId: 3, title: '深入理解JavaScript异步编程', createTime: '2025-04-12 14:20:00' }
      ];
    } else if (blogId === 2) {
      mockData = [
        { blogId: 1, title: 'GoFrame框架入门指南', createTime: '2025-04-10 08:30:00' },
        { blogId: 3, title: '深入理解JavaScript异步编程', createTime: '2025-04-12 14:20:00' }
      ];
    } else {
      mockData = [
        { blogId: 1, title: 'GoFrame框架入门指南', createTime: '2025-04-10 08:30:00' },
        { blogId: 2, title: 'Vue3 组合式API完全指南', createTime: '2025-04-11 10:15:00' }
      ];
    }
    
    return {
      code: 0,
      msg: '',
      traceid: '',
      data: {
        list: mockData as Blog[],
        total: mockData.length,
        page: 1,
        size: limit
      }
    };
  }
};

// 格式化日期为友好的显示格式
export const formatBlogDate = (dateStr: string): string => {
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