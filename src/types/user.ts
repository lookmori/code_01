/**
 * 用户角色枚举 - 供客户端使用
 * 注意：此枚举必须与服务端的UserRole保持一致
 */
export enum UserRole {
  STUDENT = 'student',
  ADMIN = 'admin'
}

/**
 * 用户接口定义
 */
export interface User {
  id: string;
  username: string;
  email: string;
  role: UserRole;
  createdAt: string;
  updatedAt: string;
}

/**
 * 登录请求接口
 */
export interface LoginRequest {
  email: string;
  password: string;
  remember?: boolean;
}

/**
 * 登录响应接口
 */
export interface LoginResponse {
  success: boolean;
  user?: User;
  token?: string;
  error?: string;
}

/**
 * 注册请求接口
 */
export interface RegisterRequest {
  username: string;
  email: string;
  password: string;
  confirmPassword: string;
}

/**
 * 注册响应接口
 */
export interface RegisterResponse {
  success: boolean;
  user?: User;
  error?: string;
} 