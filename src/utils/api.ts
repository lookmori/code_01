import { AuthService } from '@/services/auth.service';

/**
 * 处理API错误，根据错误类型执行适当的操作
 */
export const handleApiError = async (error: any) => {
  if (error.status === 401) {
    // 令牌过期或无效，登出用户
    AuthService.logout();
    // 重定向到登录页面
    window.location.href = '/login?expired=true';
    return { error: '登录已过期，请重新登录' };
  }
  
  // 处理其他类型的错误
  const errorData = await error.json().catch(() => ({ error: '请求处理失败' }));
  return errorData;
};

/**
 * 发送API请求的工具函数，自动处理认证令牌
 */
export const apiRequest = async <T = any>(
  url: string,
  options: RequestInit = {},
  isPublic: boolean = false
): Promise<T> => {
  // 默认请求配置
  const defaultOptions: RequestInit = {
    headers: {
      'Content-Type': 'application/json',
      ...options.headers,
    },
  };
  
  // 如果不是公共API，添加认证令牌
  if (!isPublic) {
    const token = AuthService.getToken();
    
    if (token) {
      defaultOptions.headers = {
        ...defaultOptions.headers,
        'Authorization': `Bearer ${token}`,
      };
    }
  }
  
  // 合并选项
  const fetchOptions = {
    ...defaultOptions,
    ...options,
    headers: {
      ...defaultOptions.headers,
      ...(options.headers || {}),
    },
  };
  
  try {
    const response = await fetch(url, fetchOptions);
    
    // 检查响应状态
    if (!response.ok) {
      if (response.status === 401) {
        await handleApiError(response);
        throw new Error('认证失败');
      }
      
      const errorData = await response.json();
      throw new Error(errorData.error || '请求失败');
    }
    
    // 返回数据
    return await response.json() as T;
  } catch (error: any) {
    console.error(`API请求失败 [${url}]:`, error);
    throw error;
  }
};

/**
 * 发送GET请求的便捷方法
 */
export const get = <T = any>(url: string, isPublic: boolean = false): Promise<T> => {
  return apiRequest<T>(url, { method: 'GET' }, isPublic);
};

/**
 * 发送POST请求的便捷方法
 */
export const post = <T = any>(url: string, data?: any, isPublic: boolean = false): Promise<T> => {
  return apiRequest<T>(
    url,
    {
      method: 'POST',
      body: data ? JSON.stringify(data) : undefined,
    },
    isPublic
  );
};

/**
 * 发送PUT请求的便捷方法
 */
export const put = <T = any>(url: string, data?: any): Promise<T> => {
  return apiRequest<T>(
    url,
    {
      method: 'PUT',
      body: data ? JSON.stringify(data) : undefined,
    }
  );
};

/**
 * 发送DELETE请求的便捷方法
 */
export const del = <T = any>(url: string): Promise<T> => {
  return apiRequest<T>(url, { method: 'DELETE' });
}; 