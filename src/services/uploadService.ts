/**
 * 图片上传服务
 */
import apiClient from './api';

// 定义API响应结构
interface ApiResponse<T> {
  code: number;
  msg: string;
  data: T;
}

// 定义上传图片后的响应数据结构
export interface UploadImageResult {
  url: string;
  filename: string;
  size: number;
  mimetype: string;
}

/**
 * 上传单张图片
 * @param file 文件对象
 * @returns 上传结果
 */
export const uploadImage = async (file: File): Promise<ApiResponse<UploadImageResult>> => {
  try {
    // 创建一个FormData对象
    const formData = new FormData();
    formData.append('file', file);
    
    // 调用后端上传API
    const response = await apiClient.post<ApiResponse<UploadImageResult>>(
      '/api/file/upload',
      formData,
      {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      }
    );
    
    return response.data;
  } catch (error) {
    console.error('上传图片失败:', error);
    
    // 当API调用失败时，作为备选方案，我们使用FileReader在前端处理
    // 这允许应用在后端API不可用时仍然可以预览图片
    return new Promise((resolve) => {
      const reader = new FileReader();
      
      reader.onload = () => {
        const result = reader.result as string;
        const filename = `${Date.now()}_${Math.random().toString(36).substring(2, 10)}_${file.name}`;
        
        resolve({
          code: 0,
          msg: '本地预览模式',
          data: {
            url: result, // 本地base64 URL
            filename,
            size: file.size,
            mimetype: file.type
          }
        });
      };
      
      reader.readAsDataURL(file);
    });
  }
};

/**
 * 上传多张图片
 * @param files 文件数组
 * @returns 上传结果数组
 */
export const uploadImages = async (files: File[]): Promise<ApiResponse<UploadImageResult[]>> => {
  try {
    // 使用Promise.all并行上传所有图片
    const results = await Promise.all(files.map(file => uploadImage(file)));
    
    // 提取所有上传成功的结果
    const successResults = results
      .filter(result => result.code === 0)
      .map(result => result.data);
    
    return {
      code: 0,
      msg: '上传成功',
      data: successResults
    };
  } catch (error) {
    console.error('上传图片失败:', error);
    return {
      code: -1,
      msg: '上传失败',
      data: []
    };
  }
}; 