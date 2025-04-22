import apiClient from './api';
import type { 
  Moment, 
  CreateMomentParams, 
  MomentListResponse, 
  MomentComment, 
  CommentListResponse, 
  CreateCommentParams 
} from '../types/moment';

/**
 * 获取动态列表
 */
export const getMomentList = async (params: {
  pageNum?: number;
  pageSize?: number;
  userId?: number;
  circleId?: number;
  orderBy?: string;
}) => {
  // 转换参数，适配后端API
  const apiParams = {
    page: params.pageNum || 1,
    size: params.pageSize || 20,
    userId: params.userId,
    circleId: params.circleId,
    orderBy: params.orderBy
  };

  const response = await apiClient.get<{
    code: number;
    msg: string;
    data: {
      list: any[];
      total: number;
      page: number;
      size: number;
    };
  }>('/api/post/v1/list', { params: apiParams });

  // 转换响应数据，适配前端类型
  const data: MomentListResponse = {
    list: response.data.data.list.map(item => ({
      momentId: item.postId,
      userId: item.userId,
      userName: item.userName,
      userAvatar: item.userAvatar,
      content: item.content,
      images: item.images,
      likesCount: item.likeCount,
      commentsCount: item.commentCount,
      isLiked: item.isLiked,
      createTime: item.createTime,
      topic: item.topicName
    })),
    total: response.data.data.total,
    page_num: response.data.data.page,
    page_size: response.data.data.size
  };

  return {
    code: response.data.code,
    msg: response.data.msg,
    data
  };
};

/**
 * 获取动态详情
 */
export const getMomentDetail = async (momentId: number) => {
  // 使用真实API
  const response = await apiClient.get<{
    code: number;
    msg: string;
    data: any;
  }>(`/api/post/v1/detail`, {
    params: { postId: momentId }
  });

  // 转换响应数据，适配前端类型
  const data: Moment = {
    momentId: response.data.data.postId,
    userId: response.data.data.userId,
    userName: response.data.data.userName,
    userAvatar: response.data.data.userAvatar,
    content: response.data.data.content,
    images: response.data.data.images,
    likesCount: response.data.data.likeCount,
    commentsCount: response.data.data.commentCount,
    isLiked: response.data.data.isLiked,
    createTime: response.data.data.createTime,
    updateTime: response.data.data.updateTime,
    topic: response.data.data.topicName
  };

  return {
    code: response.data.code,
    msg: response.data.msg,
    data
  };
};

/**
 * 发布动态
 */
export const createMoment = async (params: CreateMomentParams) => {
  // 转换参数，适配后端API
  const apiParams: any = {
    content: params.content,
    images: params.images || []
  };

  // 只有在有效值时添加topicId
  if (params.topicId !== undefined && params.topicId > 0) {
    apiParams.topicId = params.topicId;
  } else if (params.topic) {
    // 兼容处理：如果提供了topic字符串而不是topicId，尝试转换
    const topicIdNum = parseInt(params.topic);
    if (!isNaN(topicIdNum) && topicIdNum > 0) {
      apiParams.topicId = topicIdNum;
    }
  }

  // 只有在有效值时添加circleId
  if (params.circleId && params.circleId > 0) {
    apiParams.circleId = params.circleId;
  }

  const response = await apiClient.post<{
    code: number;
    msg: string;
    data: {
      postId: number;
    };
  }>('/api/post/v1/create', apiParams);

  return {
    code: response.data.code,
    msg: response.data.msg,
    data: {
      momentId: response.data.data.postId
    }
  };
};

/**
 * 点赞/取消点赞动态
 */
export const toggleLike = async (params: {
  momentId: number;
  action: 'like' | 'unlike';
}) => {
  // 使用真实API
  const response = await apiClient.post<{
    code: number;
    msg: string;
    data: {
      likesCount: number;
      isLiked: boolean;
    };
  }>('/api/post/v1/like', {
    postId: params.momentId,
    action: params.action
  });
  
  return response.data;
};

/**
 * 获取动态评论列表
 */
export const getMomentComments = async (params: {
  momentId: number;
  pageNum?: number;
  pageSize?: number;
}) => {
  // 转换参数，适配后端API
  const apiParams = {
    postId: params.momentId,
    page: params.pageNum || 1,
    size: params.pageSize || 20
  };

  const response = await apiClient.get<{
    code: number;
    msg: string;
    data: any;
  }>('/api/post/v1/comments', { params: apiParams });

  // 转换响应数据
  const data: CommentListResponse = {
    list: response.data.data.list.map((item: any) => ({
      commentId: item.commentId,
      momentId: item.postId,
      userId: item.userId,
      userName: item.userName,
      userAvatar: item.userAvatar,
      content: item.content,
      createTime: item.createTime,
      replyTo: item.replyTo
    })),
    total: response.data.data.total || 0,
    page_num: response.data.data.page || 1,
    page_size: response.data.data.size || 10
  };

  return {
    code: response.data.code,
    msg: response.data.msg,
    data
  };
};

/**
 * 发布评论
 */
export const createComment = async (params: CreateCommentParams) => {
  // 转换参数，适配后端API
  const apiParams = {
    postId: params.momentId,
    content: params.content,
    replyId: params.replyToCommentId
  };

  const response = await apiClient.post<{
    code: number;
    msg: string;
    data: {
      commentId: number;
    };
  }>('/api/post/v1/comment', apiParams);

  return response.data;
};

/**
 * 删除动态
 */
export const deleteMoment = async (momentId: number) => {
  const response = await apiClient.post<{
    code: number;
    msg: string;
    data: {
      success: boolean;
    }
  }>(`/api/post/v1/delete`, {
    postId: momentId
  });

  return {
    code: response.data.code,
    msg: response.data.msg,
    ...response.data.data
  };
};

export type {
  Moment
} from '../types/moment'; 