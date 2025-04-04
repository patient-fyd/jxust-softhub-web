import apiClient from './api';

/**
 * 提交入会申请
 * @param params 申请信息
 */
export interface JoinApplicationParams {
  name: string;
  studentId: string;
  grade: string;
  college: string;
  major: string;
  phone: string;
  email: string;
  reason: string;
  skills: string;
  expectDepartment: string;
}

/**
 * 提交入会申请
 */
export const submitJoinApplication = async (params: JoinApplicationParams) => {
  const response = await apiClient.post('/api/join/v1/apply', params);
  return response.data;
};

/**
 * 获取入会申请列表
 */
export const getJoinApplicationList = async (params: {
  status?: number;
  grade?: string;
  expectDepartment?: string;
  pageNum?: number;
  pageSize?: number;
}) => {
  const response = await apiClient.get('/api/join/v1/list', { params });
  return response.data;
};

/**
 * 获取入会申请详情
 */
export const getJoinApplicationDetail = async (applicationId: number) => {
  const response = await apiClient.get('/api/join/v1/detail', {
    params: { applicationId }
  });
  return response.data;
};

/**
 * 检查当前用户是否已经提交过申请
 * @returns 返回申请状态，如果没有申请过则返回null
 */
export const checkUserApplicationStatus = async () => {
  try {
    const response = await getJoinApplicationList({
      pageSize: 1,  // 只需要最近的一条记录
      pageNum: 1
    });
    
    if (response.code === 0 && response.data.list.length > 0) {
      const application = response.data.list[0];
      return {
        hasApplied: true,
        applicationId: application.applicationId,
        status: application.status,
        statusText: getStatusTextByCode(application.status)
      };
    } else {
      return { hasApplied: false };
    }
  } catch (error) {
    console.error('检查申请状态出错:', error);
    return { hasApplied: false, error: '检查申请状态出错' };
  }
};

/**
 * 根据状态码获取状态文本
 */
export const getStatusTextByCode = (status: number): string => {
  switch (status) {
    case 0: return '待审核';
    case 1: return '已通过';
    case 2: return '已拒绝';
    default: return '未知状态';
  }
}; 