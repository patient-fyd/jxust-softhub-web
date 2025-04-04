/**
 * 入会申请表单数据
 */
export interface JoinApplicationForm {
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
 * 入会申请响应
 */
export interface JoinApplicationResponse {
  applicationId: number;
}

/**
 * 入会申请详情
 */
export interface JoinApplicationDetail {
  applicationId: number;
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
  status: number;
  reviewerId?: number;
  reviewerName?: string;
  reviewComment?: string;
  createTime: string;
  updateTime: string;
}

/**
 * 入会申请列表响应
 */
export interface JoinApplicationListResponse {
  list: JoinApplicationDetail[];
  total: number;
  page_num: number;
  page_size: number;
}

/**
 * 部门选项
 */
export const departmentOptions = [
  '技术部',
  '设计部',
  '宣传部',
  '运营部',
  '秘书部'
];

/**
 * 年级选项
 */
export const gradeOptions = [
  '2020级',
  '2021级',
  '2022级',
  '2023级',
  '2024级'
];

/**
 * 学院选项
 */
export const collegeOptions = [
  '计算机学院',
  '软件工程学院',
  '数学与统计学院',
  '电子信息学院',
  '艺术设计学院',
  '经济管理学院',
  '外国语学院',
  '土木工程学院',
  '机械工程学院',
  '其他学院'
]; 