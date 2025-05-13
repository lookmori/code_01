import { LoginRequest, LoginResponse as UserLoginResponse, User, UserRole } from '@/types/user';
import { CozeService } from './coze.service';

// 定义用户接口
export interface UserInfo {
  id: string;
  username?: string;
  email: string;
  role?: UserRole;
}

// 登录响应接口
export interface LoginResponse {
  success: boolean;
  message: string;
  user?: UserInfo;
  token?: string;
  error?: string;
}

// 登录数据接口
export interface LoginData {
  email: string;
  password: string;
  remember?: boolean;
}

// 认证状态变化事件名称
export const AUTH_STATE_CHANGE_EVENT = 'auth_state_change';

// 认证服务类
export class AuthService {
  // 认证状态变化事件名称（静态属性）
  public static AUTH_STATE_CHANGE_EVENT = AUTH_STATE_CHANGE_EVENT;
  
  // 验证令牌
  public static verifyToken(token: string): User | null {
    try {
      if (!token) return null;
      
      // 在服务器端，这里应该会解码并验证JWT令牌
      // 但在客户端环境下，我们无法安全地验证令牌
      // 所以在这个简化的实现中，我们直接从本地存储获取用户信息
      
      console.log('验证令牌:', token);
      const user = this.getCurrentUser();
      
      // 确保用户角色是正确的枚举值
      if (user && user.role) {
        // 如果角色是字符串，转换为枚举
        if (typeof user.role === 'string') {
          if (user.role === 'admin') {
            user.role = UserRole.ADMIN;
          } else if (user.role === 'student') {
            user.role = UserRole.STUDENT;
          }
        }
      }
      
      console.log('验证令牌返回的用户:', user);
      return user;
    } catch (error) {
      console.error('验证令牌失败:', error);
      return null;
    }
  }
  
  // 登录方法
  public static async login(data: LoginRequest): Promise<LoginResponse> {
    try {
      const response = await fetch('/api/auth/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          email: data.email,
          password: data.password,
        }),
      });

      const result = await response.json();
      
      if (!response.ok) {
        return {
          success: false,
          message: '登录失败',
          error: result.error || '登录失败'
        };
      }

      // 如果选择记住我，则保存令牌到本地存储
      if (data.remember && result.token) {
        localStorage.setItem('auth_token', result.token);
        localStorage.setItem('user', JSON.stringify(result.user));
      } else if (result.token) {
        // 否则存储到会话存储
        sessionStorage.setItem('auth_token', result.token);
        sessionStorage.setItem('user', JSON.stringify(result.user));
      }

      // 触发登录状态变化事件
      this.notifyAuthStateChange();

      return result;
    } catch (error) {
      console.error('登录请求错误:', error);
      return {
        success: false,
        message: '登录失败',
        error: '网络错误，请稍后再试'
      };
    }
  }

  // 获取当前用户
  public static getCurrentUser(): User | null {
    try {
      const userStr = localStorage.getItem('user') || sessionStorage.getItem('user');
      if (!userStr) return null;
      
      // 解析存储的用户数据
      const userData = JSON.parse(userStr);
      
      // 确保角色值是UserRole枚举值
      if (userData && userData.role) {
        // 如果角色值是字符串，确保它被正确映射到UserRole枚举
        if (typeof userData.role === 'string' && userData.role === 'admin') {
          userData.role = UserRole.ADMIN;
        } else if (typeof userData.role === 'string' && userData.role === 'student') {
          userData.role = UserRole.STUDENT;
        }
      }
      
      return userData;
    } catch {
      return null;
    }
  }

  // 获取令牌
  public static getToken(): string | null {
    return localStorage.getItem('auth_token') || sessionStorage.getItem('auth_token');
  }

  // 登出
  public static logout(): void {
    // 清除令牌
    localStorage.removeItem('auth_token');
    sessionStorage.removeItem('auth_token');
    
    // 清除用户信息
    localStorage.removeItem('user');
    sessionStorage.removeItem('user');
    
    // 清除其他可能相关的数据
    localStorage.removeItem('remember_me');
    localStorage.removeItem('lastLogin');
    
    // 清除Coze相关的令牌
    CozeService.clearToken();
    
    // 清除所有以auth_开头的项目
    Object.keys(localStorage).forEach(key => {
      if (key.startsWith('auth_') || key.startsWith('coze_')) {
        localStorage.removeItem(key);
      }
    });
    
    Object.keys(sessionStorage).forEach(key => {
      if (key.startsWith('auth_') || key.startsWith('coze_')) {
        sessionStorage.removeItem(key);
      }
    });
    
    console.log('用户已成功登出，所有认证数据已清除');
    
    // 触发认证状态变化事件
    this.notifyAuthStateChange();
  }

  // 检查是否已认证
  public static isAuthenticated(): boolean {
    return !!this.getToken();
  }
  
  // 检查用户是否具有指定角色
  public static hasRole(role: UserRole): boolean {
    const user = this.getCurrentUser();
    console.log('hasRole检查 - 当前用户:', user);
    console.log('hasRole检查 - 查询角色:', role);
    console.log('hasRole检查 - 用户角色:', user?.role);
    console.log('hasRole检查 - 角色类型:', typeof user?.role);
    
    // 使用字符串比较而不是对象比较
    const roleStr = typeof role === 'string' ? role : String(role);
    const userRoleStr = typeof user?.role === 'string' ? user.role : user?.role ? String(user.role) : undefined;
    console.log('hasRole检查 - 角色字符串值比较:', userRoleStr, '===', roleStr);
    
    // 直接比较字符串值，避免枚举对象比较问题
    return !!(user && userRoleStr === roleStr);
  }
  
  // 检查用户是否为管理员
  public static isAdmin(): boolean {
    console.log('isAdmin检查 - UserRole.ADMIN值:', UserRole.ADMIN);
    
    // 直接检查用户角色字符串是否为'admin'
    const user = this.getCurrentUser();
    if (!user) return false;
    
    const userRole = typeof user.role === 'string' ? user.role : user.role ? String(user.role) : undefined;
    const isAdmin = userRole === 'admin';
    console.log('isAdmin检查 - 直接字符串比较结果:', isAdmin);
    
    return isAdmin;
  }
  
  // 通知认证状态变化
  private static notifyAuthStateChange(): void {
    // 创建一个自定义事件
    const event = new CustomEvent(AUTH_STATE_CHANGE_EVENT, {
      detail: {
        isAuthenticated: this.isAuthenticated(),
        user: this.getCurrentUser()
      }
    });
    
    // 分发事件
    window.dispatchEvent(event);
  }
} 