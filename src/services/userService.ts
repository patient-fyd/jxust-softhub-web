import apiClient from './api';

export interface RegisterRequest {
  userName: string;
  password: string;
  name: string;
  email: string;
  phone: string;
}

export interface User {
  userId: number;
  userName: string;
  name: string;
  roleId: number;
  avatar?: string;
}

export interface RegisterResponse {
  code: number;
  msg: string;
  traceid: string;
  data: {
    user: User;
  };
}

export interface LoginRequest {
  userName: string;
  password: string;
}

export interface LoginResponse {
  code: number;
  msg: string;
  traceid: string;
  data: {
    user: User;
    token: string;
  };
}

export interface RefreshTokenRequest {
  token: string;
}

export interface RefreshTokenResponse {
  code: number;
  msg: string;
  traceid: string;
  data: {
    token: string;
  };
}

export const userService = {
  register: async (userData: RegisterRequest): Promise<RegisterResponse> => {
    const response = await apiClient.post<RegisterResponse>('/api/auth/v1/register', userData);
    return response.data;
  },
  
  login: async (loginData: LoginRequest): Promise<LoginResponse> => {
    const response = await apiClient.post<LoginResponse>('/api/auth/v1/login', loginData);
    return response.data;
  },

  refreshToken: async (token: string): Promise<RefreshTokenResponse> => {
    const response = await apiClient.post<RefreshTokenResponse>('/api/auth/v1/refresh', { token });
    return response.data;
  },
};