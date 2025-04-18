import apiClient from './api';

export interface Activity {
  activityId: number;
  title: string;
  description: string;
  startTime: string;
  endTime: string;
  location: string;
  maxParticipants: number;
  status: number; // 0-未开始, 1-进行中, 2-已结束
  createTime: string;
}

export interface Registration {
  registrationId: number;
  activityId: number;
  userId: number;
  name: string;
  studentId: string;
  contact: string;
  status: number; // 0-待审核, 1-通过, 2-拒绝
  createTime: string;
}

export interface ActivityListResponse {
  code: number;
  msg: string;
  traceid: string;
  data: {
    list: Activity[];
    total: number;
    page: number;
    size: number;
  };
}

export interface ActivityDetailResponse {
  code: number;
  msg: string;
  traceid: string;
  data: {
    activity: Activity;
  };
}

export interface RegistrationListResponse {
  code: number;
  msg: string;
  traceid: string;
  data: {
    list: Registration[];
    total: number;
    page: number;
    size: number;
  };
}

export interface RegistrationResponse {
  code: number;
  msg: string;
  traceid: string;
  data: {
    registrationId: number;
  };
}

export interface ResponseWithRegistrationId {
  code: number;
  msg: string;
  data: {
    registrationId: number;
  };
}

export interface ResponseWithActivityId {
  code: number;
  msg: string;
  data: {
    activityId: number;
  };
}

export interface BasicResponse {
  code: number;
  msg: string;
  data: {};
}

export const activityService = {
  // 获取活动列表
  getActivityList: async (params: {
    page?: number;
    size?: number;
    status?: number;
  }): Promise<ActivityListResponse> => {
    try {
      const response = await apiClient.get<ActivityListResponse>('/api/activity/v1/list', { params });
      return response.data;
    } catch (error) {
      console.error('获取活动列表失败:', error);
      return {
        code: -1,
        msg: '获取活动列表失败',
        traceid: '',
        data: {
          list: [],
          total: 0,
          page: params.page || 1,
          size: params.size || 10
        }
      };
    }
  },

  // 获取活动详情
  getActivityDetail: async (activityId: number): Promise<ActivityDetailResponse> => {
    try {
      const response = await apiClient.get<ActivityDetailResponse>(`/api/activity/v1/detail/${activityId}`);
      return response.data;
    } catch (error) {
      console.error('获取活动详情失败:', error);
      return {
        code: -1,
        msg: '获取活动详情失败',
        traceid: '',
        data: {
          activity: {} as Activity
        }
      };
    }
  },

  // 活动报名
  registerActivity: async (data: {
    activityId: number;
    name: string;
    studentId: string;
    contact: string;
  }): Promise<RegistrationResponse> => {
    try {
      const response = await apiClient.post<RegistrationResponse>('/api/activity/v1/register', data);
      return response.data;
    } catch (error) {
      console.error('活动报名失败:', error);
      return {
        code: -1,
        msg: '活动报名失败',
        traceid: '',
        data: {
          registrationId: 0
        }
      };
    }
  },
  
  // 获取活动报名列表
  getRegistrationList: async (params: {
    activityId: number;
    page?: number;
    size?: number;
    status?: number;
  }): Promise<RegistrationListResponse> => {
    try {
      const response = await apiClient.get<RegistrationListResponse>('/api/activity/v1/register/list', { params });
      return response.data;
    } catch (error) {
      console.error('获取活动报名列表失败:', error);
      return {
        code: -1,
        msg: '获取活动报名列表失败',
        traceid: '',
        data: {
          list: [],
          total: 0,
          page: params.page || 1,
          size: params.size || 10
        }
      };
    }
  },
  
  // 审核通过报名
  approveRegistration: async (registrationId: number): Promise<ResponseWithRegistrationId> => {
    try {
      const response = await apiClient.post<ResponseWithRegistrationId>('/api/activity/v1/register/approve', { registrationId });
      return response.data;
    } catch (error) {
      console.error('审核通过报名失败:', error);
      return {
        code: -1,
        msg: '审核通过报名失败',
        data: {
          registrationId: 0
        }
      };
    }
  },
  
  // 拒绝报名
  rejectRegistration: async (registrationId: number, reason?: string): Promise<ResponseWithRegistrationId> => {
    try {
      const response = await apiClient.post<ResponseWithRegistrationId>('/api/activity/v1/register/reject', { 
        registrationId,
        reason
      });
      return response.data;
    } catch (error) {
      console.error('拒绝报名失败:', error);
      return {
        code: -1,
        msg: '拒绝报名失败',
        data: {
          registrationId: 0
        }
      };
    }
  },
  
  // 创建活动
  createActivity: async (data: {
    title: string;
    description: string;
    startTime: string;
    endTime: string;
    location: string;
    maxParticipants: number;
  }): Promise<ResponseWithActivityId> => {
    try {
      const response = await apiClient.post<ResponseWithActivityId>('/api/activity/v1/create', data);
      return response.data;
    } catch (error) {
      console.error('创建活动失败:', error);
      return {
        code: -1,
        msg: '创建活动失败',
        data: {
          activityId: 0
        }
      };
    }
  },
  
  // 更新活动
  updateActivity: async (data: {
    activityId: number;
    title?: string;
    description?: string;
    startTime?: string;
    endTime?: string;
    location?: string;
    maxParticipants?: number;
    status?: number;
  }): Promise<ResponseWithActivityId> => {
    try {
      const response = await apiClient.put<ResponseWithActivityId>('/api/activity/v1/update', data);
      return response.data;
    } catch (error) {
      console.error('更新活动失败:', error);
      return {
        code: -1,
        msg: '更新活动失败',
        data: {
          activityId: 0
        }
      };
    }
  },
  
  // 删除活动
  deleteActivity: async (activityId: number): Promise<BasicResponse> => {
    try {
      const response = await apiClient.delete<BasicResponse>(`/api/activity/v1/delete/${activityId}`);
      return response.data;
    } catch (error) {
      console.error('删除活动失败:', error);
      return {
        code: -1,
        msg: '删除活动失败',
        data: {}
      };
    }
  }
};

// 格式化日期时间为易读格式
export const formatDateTime = (dateStr: string): string => {
  if (!dateStr) return '';
  
  const date = new Date(dateStr);
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  const hour = String(date.getHours()).padStart(2, '0');
  const minute = String(date.getMinutes()).padStart(2, '0');
  
  return `${year}-${month}-${day} ${hour}:${minute}`;
};

// 获取活动状态文本
export const getActivityStatusText = (status: number): string => {
  switch (status) {
    case 0: return '未开始';
    case 1: return '进行中';
    case 2: return '已结束';
    default: return '未知状态';
  }
};

// 获取活动状态样式类
export const getActivityStatusClass = (status: number): string => {
  switch (status) {
    case 0: return 'status-upcoming';
    case 1: return 'status-ongoing';
    case 2: return 'status-ended';
    default: return '';
  }
}; 