import { defineStore } from 'pinia';
import { ref, computed } from 'vue';
import { userService } from '../services/userService';
import type { User } from '../services/userService';
import type { RegisterRequest, LoginRequest } from '../services/userService';

export const useUserStore = defineStore('user', () => {
  const currentUser = ref<User | null>(null);
  const loading = ref(false);
  const error = ref<string | null>(null);

  // 计算当前用户是否已登录
  const isLoggedIn = computed(() => {
    return !!currentUser.value && !!localStorage.getItem('token');
  });

  // 从本地存储加载用户信息
  const loadUserFromStorage = () => {
    const savedUser = localStorage.getItem('user');
    if (savedUser) {
      try {
        currentUser.value = JSON.parse(savedUser);
      } catch (e) {
        localStorage.removeItem('user');
      }
    }
  };

  // 注册用户
  const register = async (userData: RegisterRequest) => {
    loading.value = true;
    error.value = null;
    
    try {
      const response = await userService.register(userData);
      
      if (response.code === 0 && response.data.user) {
        currentUser.value = response.data.user;
        localStorage.setItem('user', JSON.stringify(response.data.user));
        return { success: true, user: response.data.user };
      } else {
        error.value = response.msg || '注册失败，请稍后再试';
        return { success: false, error: error.value };
      }
    } catch (e: any) {
      error.value = e.response?.data?.msg || '注册失败，请检查网络连接';
      return { success: false, error: error.value };
    } finally {
      loading.value = false;
    }
  };

  // 登录用户
  const login = async (loginData: LoginRequest) => {
    loading.value = true;
    error.value = null;
    
    try {
      const response = await userService.login(loginData);
      
      if (response.code === 0 && response.data.user) {
        currentUser.value = response.data.user;
        localStorage.setItem('user', JSON.stringify(response.data.user));
        // 保存token
        localStorage.setItem('token', response.data.token);
        return { success: true, user: response.data.user };
      } else {
        error.value = response.msg || '登录失败，请检查用户名和密码';
        return { success: false, error: error.value };
      }
    } catch (e: any) {
      error.value = e.response?.data?.msg || '登录失败，请检查网络连接';
      return { success: false, error: error.value };
    } finally {
      loading.value = false;
    }
  };

  // 刷新Token
  const refreshToken = async () => {
    const token = localStorage.getItem('token');
    if (!token) return { success: false, error: '没有可用的token' };
    
    try {
      const response = await userService.refreshToken(token);
      
      if (response.code === 0 && response.data.token) {
        // 更新token
        localStorage.setItem('token', response.data.token);
        return { success: true };
      } else {
        error.value = response.msg || 'Token刷新失败';
        return { success: false, error: error.value };
      }
    } catch (e: any) {
      error.value = e.response?.data?.msg || 'Token刷新失败，请重新登录';
      // 如果刷新失败，可能需要重新登录
      if (e.response?.status === 401) {
        logout();
      }
      return { success: false, error: error.value };
    }
  };

  // 登出
  const logout = () => {
    currentUser.value = null;
    localStorage.removeItem('user');
    localStorage.removeItem('token');
  };

  // 初始化时加载用户信息
  loadUserFromStorage();

  return {
    currentUser,
    loading,
    error,
    isLoggedIn,
    register,
    login,
    logout,
    refreshToken
  };
});