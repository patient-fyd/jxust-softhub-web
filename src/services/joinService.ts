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