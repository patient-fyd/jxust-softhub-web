import axios from 'axios';

// 使用相对路径，请求会通过Vite代理转发
const apiClient = axios.create({
  baseURL: '',  // 不再使用绝对URL，而是使用相对路径
  headers: {
    'Content-Type': 'application/json',
  },
});

// 请求拦截器 - 添加认证令牌
apiClient.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// 响应拦截器 - 处理常见错误和token刷新
apiClient.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;
    
    // 如果是401错误（未授权）且不是刷新token的请求，尝试刷新token
    if (error.response?.status === 401 && 
        !originalRequest._retry && 
        !originalRequest.url.includes('/api/auth/v1/refresh')) {
      
      originalRequest._retry = true;
      
      try {
        // 获取当前token
        const currentToken = localStorage.getItem('token');
        if (!currentToken) {
          // 如果没有token，直接拒绝
          return Promise.reject(error);
        }
        
        // 调用刷新token接口
        const response = await apiClient.post('/api/auth/v1/refresh', { token: currentToken });
        
        if (response.data.code === 0 && response.data.data.token) {
          // 更新localStorage中的token
          localStorage.setItem('token', response.data.data.token);
          
          // 更新原始请求的Authorization头
          originalRequest.headers.Authorization = `Bearer ${response.data.data.token}`;
          
          // 重试原始请求
          return apiClient(originalRequest);
        }
      } catch (refreshError) {
        console.error('Token刷新失败:', refreshError);
        // 可能需要重定向到登录页面
        // window.location.href = '/login';
      }
    }
    
    console.error('API请求错误:', error.response || error.message);
    return Promise.reject(error);
  }
);

export default apiClient;