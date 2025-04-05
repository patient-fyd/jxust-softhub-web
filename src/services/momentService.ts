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
}) => {
  const response = await apiClient.get<{
    code: number;
    msg: string;
    data: MomentListResponse;
  }>('/api/moments/v1/list', { params });
  return response.data;
};

/**
 * 获取动态详情
 */
export const getMomentDetail = async (momentId: number) => {
  const response = await apiClient.get<{
    code: number;
    msg: string;
    data: Moment;
  }>(`/api/moments/v1/detail`, {
    params: { momentId }
  });
  return response.data;
};

/**
 * 发布动态
 */
export const createMoment = async (params: CreateMomentParams) => {
  const response = await apiClient.post<{
    code: number;
    msg: string;
    data: {
      momentId: number;
    };
  }>('/api/moments/v1/create', params);
  return response.data;
};

/**
 * 点赞/取消点赞动态
 */
export const toggleLike = async (params: {
  momentId: number;
  action: 'like' | 'unlike';
}) => {
  const response = await apiClient.post<{
    code: number;
    msg: string;
    data: {
      likesCount: number;
      isLiked: boolean;
    };
  }>('/api/moments/v1/like', params);
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
  const response = await apiClient.get<{
    code: number;
    msg: string;
    data: CommentListResponse;
  }>('/api/moments/v1/comments', { params });
  return response.data;
};

/**
 * 发布评论
 */
export const createComment = async (params: CreateCommentParams) => {
  const response = await apiClient.post<{
    code: number;
    msg: string;
    data: {
      commentId: number;
    };
  }>('/api/moments/v1/comment', params);
  return response.data;
};

/**
 * 删除动态
 */
export const deleteMoment = async (momentId: number) => {
  const response = await apiClient.delete<{
    code: number;
    msg: string;
  }>(`/api/moments/v1/delete`, {
    params: { momentId }
  });
  return response.data;
};

/**
 * 删除评论
 */
export const deleteComment = async (commentId: number) => {
  const response = await apiClient.delete<{
    code: number;
    msg: string;
  }>(`/api/moments/v1/comment/delete`, {
    params: { commentId }
  });
  return response.data;
}; 