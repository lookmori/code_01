// Coze 服务 - 处理与Coze API的交互和授权
export class CozeService {
  // Coze OAuth配置
  private static readonly CLIENT_ID = '90242169603687806132942397704438.app.coze';
  private static readonly CLIENT_SECRET = 'IINCcC1RQCfm3Bd4UwCjzH4dWnArIz70HyUGe8vLKwUiJgT7';
  private static readonly REDIRECT_URI = 'http://www.code.lookmori.cn/practice';
  private static readonly OAUTH_URL = 'https://www.coze.cn/api/permission/oauth2/authorize';
  private static readonly TOKEN_URL = 'https://api.coze.cn/api/permission/oauth2/token';
  private static readonly API_BASE = 'https://api.coze.cn';
  
  // Coze工作流配置
  private static readonly WORKFLOW_ID = '7480745543788445737'; // 使用实际的工作流ID
  private static readonly WORKFLOW_ENDPOINT = 'https://api.coze.cn/v1/workflow/run';
  
  // 存储的令牌和事件名称常量
  private static readonly TOKEN_KEY = 'coze_token';
  private static readonly TOKEN_EXPIRY_KEY = 'coze_token_expiry';
  private static readonly REFRESH_TOKEN_KEY = 'coze_refresh_token';
  public static readonly AUTH_STATE_CHANGE_EVENT = 'coze-auth-state-change';

  // 检查是否已授权
  public static isAuthorized(): boolean {
    if (typeof window === 'undefined') return false;
    const token = localStorage.getItem(this.TOKEN_KEY);
    if (!token) return false;
    
    // 检查令牌是否过期
    const expiryTime = localStorage.getItem(this.TOKEN_EXPIRY_KEY);
    if (expiryTime && Number(expiryTime) < Date.now()) {
      // 令牌已过期，尝试自动刷新
      this.refreshTokenIfNeeded().catch(() => {
        this.clearToken();
      });
      return false;
    }
    
    return true;
  }

  // 获取当前令牌
  public static getToken(): string | null {
    if (typeof window === 'undefined') return null;
    const token = localStorage.getItem(this.TOKEN_KEY);
    
    // 如果令牌存在但可能已过期，尝试刷新
    if (token) {
      const expiryTime = localStorage.getItem(this.TOKEN_EXPIRY_KEY);
      if (expiryTime && Number(expiryTime) < Date.now()) {
        this.refreshTokenIfNeeded();
      }
    }
    
    return token;
  }

  // 保存令牌
  public static saveToken(token: string, expiresIn: number = 7200, refreshToken?: string): void {
    if (typeof window === 'undefined') return;
    
    // 计算过期时间 (当前时间 + 过期秒数)
    const expiryTime = Date.now() + (expiresIn * 1000);
    
    localStorage.setItem(this.TOKEN_KEY, token);
    localStorage.setItem(this.TOKEN_EXPIRY_KEY, expiryTime.toString());
    
    if (refreshToken) {
      localStorage.setItem(this.REFRESH_TOKEN_KEY, refreshToken);
    }
    
    window.dispatchEvent(new CustomEvent(this.AUTH_STATE_CHANGE_EVENT, {
      detail: { isAuthorized: true }
    }));
  }

  // 清除令牌
  public static clearToken(): void {
    if (typeof window === 'undefined') return;
    localStorage.removeItem(this.TOKEN_KEY);
    localStorage.removeItem(this.TOKEN_EXPIRY_KEY);
    localStorage.removeItem(this.REFRESH_TOKEN_KEY);
    
    window.dispatchEvent(new CustomEvent(this.AUTH_STATE_CHANGE_EVENT, {
      detail: { isAuthorized: false }
    }));
  }

  // 检查并刷新令牌
  public static async refreshTokenIfNeeded(): Promise<boolean> {
    if (typeof window === 'undefined') return false;
    const refreshToken = localStorage.getItem(this.REFRESH_TOKEN_KEY);
    const token = localStorage.getItem(this.TOKEN_KEY);
    
    if (!refreshToken || !token) return false;
    
    try {
      const response = await fetch(this.TOKEN_URL, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify({
          grant_type: 'refresh_token',
          refresh_token: refreshToken,
          client_id: this.CLIENT_ID,
        }),
      });
      
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        console.error('令牌刷新失败:', errorData);
        return false;
      }
      
      const data = await response.json();
      this.saveToken(
        data.access_token, 
        data.expires_in || 7200, 
        data.refresh_token || refreshToken
      );
      
      return true;
    } catch (error) {
      console.error('刷新令牌时出错:', error);
      return false;
    }
  }

  // 生成授权状态(防止CSRF攻击)
  private static generateState(): string {
    return Math.random().toString(36).substring(2, 15);
  }

  // 保存授权状态
  private static saveState(state: string): void {
    if (typeof window === 'undefined') return;
    sessionStorage.setItem('coze_auth_state', state);
  }

  // 验证授权状态
  public static validateState(state: string): boolean {
    if (typeof window === 'undefined') return false;
    const savedState = sessionStorage.getItem('coze_auth_state');
    sessionStorage.removeItem('coze_auth_state');
    return savedState === state;
  }

  // 获取授权URL
  public static getAuthorizationUrl(): string {
    const state = this.generateState();
    this.saveState(state);
    
    const params = new URLSearchParams({
      client_id: this.CLIENT_ID,
      redirect_uri: this.REDIRECT_URI,
      response_type: 'code',
      state,
      // scope参数根据Coze API文档的要求添加，这里使用workflow示例
      scope: 'workflow',
    });
    
    return `${this.OAUTH_URL}?${params.toString()}`;
  }

  // 使用授权码获取访问令牌（根据Coze API要求调整）
  public static async exchangeCodeForToken(code: string): Promise<string> {
    try {
      // 这里我们需要先有一个临时令牌用于授权头
      const tempAuthToken = this.CLIENT_SECRET; // 在实际应用中，可能需要通过其他方式获取初始令牌
      
      const response = await fetch(this.TOKEN_URL, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${tempAuthToken}`,
        },
        body: JSON.stringify({
          grant_type: 'authorization_code',
          client_id: this.CLIENT_ID,
          redirect_uri: this.REDIRECT_URI,
          code: code,
        }),
      });
      
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        console.error('令牌交换失败:', errorData);
        
        // 提供更详细的错误信息
        const errorMsg = errorData.error_description || errorData.message || '未知错误';
        throw new Error(`令牌交换失败: ${errorMsg}`);
      }
      
      const data = await response.json();
      this.saveToken(
        data.access_token, 
        data.expires_in || 7200, 
        data.refresh_token
      );
      
      return data.access_token;
    } catch (error) {
      console.error('交换授权码获取令牌时出错:', error);
      throw error;
    }
  }

  // 执行Coze工作流
  public static async executeWorkflow(content: string): Promise<any> {
    const token = this.getToken();
    if (!token) {
      throw new Error('用户未授权');
    }
    
    try {
      const response = await fetch(this.WORKFLOW_ENDPOINT, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify({
          parameters: {
            input: content
          },
          workflow_id: this.WORKFLOW_ID
        }),
      });
      
      // 处理授权错误
      if (response.status === 401) {
        // 令牌过期，尝试刷新
        const refreshed = await this.refreshTokenIfNeeded();
        if (refreshed) {
          // 令牌已刷新，重试请求
          return await this.executeWorkflow(content);
        } else {
          // 刷新失败，需要重新授权
          this.clearToken();
          throw new Error('授权已过期，请重新授权');
        }
      }
      
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        console.error('工作流执行失败:', errorData);
        
        // 提供更详细的错误信息
        const errorMsg = errorData.error_description || errorData.message || '未知错误';
        throw new Error(`工作流执行失败: ${errorMsg}`);
      }
      
      // 解析响应数据
      const responseData = await response.json();
      
      // 检查响应是否成功
      if (responseData.code !== 0) {
        throw new Error(`工作流执行失败: ${responseData.msg || '未知错误'}`);
      }
      
      // 解析嵌套的data字段（它是一个JSON字符串）
      try {
        if (typeof responseData.data === 'string') {
          const parsedData = JSON.parse(responseData.data);
          return parsedData; // 直接返回解析后的数据
        }
        return responseData; // 如果data不是字符串，返回原始响应
      } catch (parseError) {
        console.error('解析工作流数据失败:', parseError);
        throw new Error('解析工作流返回数据失败');
      }
    } catch (error) {
      console.error('执行工作流时出错:', error);
      throw error;
    }
  }
} 