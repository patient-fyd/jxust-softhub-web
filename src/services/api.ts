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

// 响应拦截器 - 处理常见错误
apiClient.interceptors.response.use(
  (response) => response,
  (error) => {
    console.error('API请求错误:', error.response || error.message);
    return Promise.reject(error);
  }
);

export default apiClient;