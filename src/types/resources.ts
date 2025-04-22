// 资源相关类型定义

// 资源分类
export interface ResourceCategory {
  id: string;
  name: string;
  description?: string;
  parentId?: string;
}

// 资源文件类型
export type ResourceFileType = 'pdf' | 'doc' | 'ppt' | 'zip' | 'xls' | 'code' | 'img' | 'other';

// 资源
export interface Resource {
  id: number;
  name: string;
  description: string;
  categoryId: string;
  fileType: string;
  tags: string[];
  uploaderName: string;
  uploadTime: string;
  downloadCount: number;
  coverUrl?: string;
}

// 上传资源的请求参数
export interface ResourceUploadParams {
  name: string;
  categoryId: string;
  description: string;
  tags: string[];
  isPrivate: boolean;
  file: File | null;
  cover?: File | null;
} 