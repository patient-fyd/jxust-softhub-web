/**
 * 圈子相关类型定义
 */

/**
 * 圈子列表查询参数
 */
export interface CircleListParams {
  page: number;
  size: number;
  keyword?: string;
  userId?: number;
  orderBy?: 'new' | 'hot';
}

/**
 * 圈子列表响应
 */
export interface CircleListResponse {
  list: CircleItem[];
  total: number;
  page: number;
  size: number;
}

/**
 * 圈子列表项
 */
export interface CircleItem {
  circleId: number;
  name: string;
  description: string;
  icon: string;
  postCount: number;
  memberCount: number;
  isOfficial: number;  // 0-否，1-是
  isFollowed: boolean;
  createTime: string;
}

/**
 * 圈子详情
 */
export interface CircleDetail {
  circleId: number;
  name: string;
  description: string;
  icon: string;
  postCount: number;
  memberCount: number;
  creatorId: number;
  creatorName: string;
  isOfficial: number;  // 0-否，1-是
  isFollowed: boolean;
  createTime: string;
  updateTime: string;
}

/**
 * 关注/取消关注圈子请求参数
 */
export interface CircleJoinParams {
  circleId: number;
}

/**
 * 关注/取消关注圈子响应
 */
export interface CircleJoinResponse {
  isFollowed: boolean;
} 