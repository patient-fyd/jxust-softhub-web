/**
 * 日常动态类型定义
 */
export interface Moment {
  momentId: number;
  userId: number;
  userName: string;
  userAvatar?: string;
  content: string;
  images?: string[];
  likesCount: number;
  commentsCount: number;
  isLiked?: boolean;
  createTime: string;
  updateTime?: string;
  topic?: string;
}

/**
 * 发布动态请求参数
 */
export interface CreateMomentParams {
  content: string;
  images?: string[];
  topic?: string;
  topicId?: number;
  circleId?: number;
}

/**
 * 动态列表响应
 */
export interface MomentListResponse {
  list: Moment[];
  total: number;
  page_num: number;
  page_size: number;
}

/**
 * 动态评论
 */
export interface MomentComment {
  commentId: number;
  momentId: number;
  userId: number;
  userName: string;
  userAvatar?: string;
  content: string;
  createTime: string;
  replyTo?: {
    commentId: number;
    userId: number;
    userName: string;
  };
}

/**
 * 评论列表响应
 */
export interface CommentListResponse {
  list: MomentComment[];
  total: number;
  page_num: number;
  page_size: number;
}

/**
 * 发表评论请求参数
 */
export interface CreateCommentParams {
  momentId: number;
  content: string;
  replyToCommentId?: number;
} 