import apiClient from './api';
import type { 
  CircleListParams,
  CircleListResponse,
  CircleDetail,
  CircleJoinParams,
  CircleJoinResponse
} from '../types/circle';

/**
 * 获取圈子列表
 * @param params 查询参数
 */
export const getCircleList = async (params: CircleListParams) => {
  const response = await apiClient.get<{
    code: number;
    msg: string;
    data: CircleListResponse;
  }>('/api/circle/v1/list', { params });
  return response.data;
};

/**
 * 获取圈子详情
 * @param circleId 圈子ID
 */
export const getCircleDetail = async (circleId: number) => {
  const response = await apiClient.get<{
    code: number;
    msg: string;
    data: CircleDetail;
  }>('/api/circle/v1/detail', {
    params: { circleId }
  });
  return response.data;
};

/**
 * 关注/取消关注圈子
 * 该接口会自动判断当前状态并进行切换
 * @param params 参数对象，包含circleId
 */
export const joinCircle = async (params: CircleJoinParams) => {
  const response = await apiClient.post<{
    code: number;
    msg: string;
    data: CircleJoinResponse;
  }>('/api/circle/v1/join', params);
  return response.data;
};

/**
 * 搜索圈子
 * @param keyword 关键词
 * @param page 页码
 * @param size 每页条数
 */
export const searchCircles = async (keyword: string, page = 1, size = 10) => {
  return getCircleList({
    page,
    size,
    keyword
  });
};

/**
 * 获取用户关注的圈子
 * @param userId 用户ID
 * @param page 页码
 * @param size 每页条数
 */
export const getUserFollowedCircles = async (userId: number, page = 1, size = 10) => {
  return getCircleList({
    page,
    size,
    userId
  });
};

/**
 * 获取最新圈子
 * @param page 页码
 * @param size 每页条数
 */
export const getLatestCircles = async (page = 1, size = 10) => {
  return getCircleList({
    page,
    size,
    orderBy: 'new'
  });
};

/**
 * 获取热门圈子
 * @param page 页码
 * @param size 每页条数
 */
export const getHotCircles = async (page = 1, size = 10) => {
  return getCircleList({
    page,
    size,
    orderBy: 'hot'
  });
}; 