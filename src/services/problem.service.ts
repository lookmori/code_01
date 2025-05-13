import { AuthService } from './auth.service';
import { PaginatedProblems, ProblemSearchParams } from '@/types/practice';

// 定义问题结构
interface Problem {
  problem_name: string;
  problem_description: string;
  example_input: string;
  example_output: string;
  ques_tag: string;
  id?: string;
  published_at?: string;
  status?: 'correct' | 'incorrect' | 'pending' | 'not_attempted';
}

/**
 * 问题服务 - 处理与问题相关的业务逻辑
 */
export class ProblemService {
  // API路径
  private static readonly API_BASE = '/api/problems';
  
  // 缓存所有问题数据
  private static cachedProblems: any[] = [];
  private static lastFetchTime: number = 0;
  private static readonly CACHE_EXPIRY = 5 * 60 * 1000; // 缓存过期时间：5分钟

  /**
   * 批量保存问题到数据库
   */
  public static async batchSaveProblems(problems: Problem[]): Promise<any> {
    try {
      console.log('开始批量保存问题，数量:', problems.length);
      
      const token = AuthService.getToken();
      console.log('获取到的认证令牌:', token ? `${token.substring(0, 10)}...` : 'null');
      
      if (!token) {
        throw new Error('未授权，请先登录');
      }

      console.log('发送请求到:', `${this.API_BASE}/batch`);
      console.log('请求头:', {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token.substring(0, 10)}...`
      });
      
      const response = await fetch(`${this.API_BASE}/batch`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ problems })
      });

      console.log('服务器响应状态:', response.status, response.statusText);
      
      if (!response.ok) {
        const errorData = await response.json();
        console.error('服务器返回错误:', errorData);
        throw new Error(errorData.error || '保存问题失败');
      }

      const result = await response.json();
      console.log('保存成功，服务器响应:', result);
      
      // 清除缓存，确保获取最新数据
      this.clearCache();
      
      return result;
    } catch (error: any) {
      console.error('保存问题失败:', error);
      throw error;
    }
  }

  /**
   * 获取带分页的问题列表，自动根据用户登录状态返回带状态的问题
   * @param params 查询参数，包括页码、每页数量、搜索关键词等
   */
  public static async getPaginatedProblems(params: ProblemSearchParams): Promise<PaginatedProblems> {
    try {
      // 构建查询参数
      const queryParams = new URLSearchParams();
      queryParams.append('page', params.page.toString());
      queryParams.append('pageSize', params.pageSize.toString());
      
      if (params.search) {
        queryParams.append('search', params.search);
      }
      
      if (params.difficulty) {
        queryParams.append('difficulty', params.difficulty);
      }
      
      if (params.tags && params.tags.length > 0) {
        params.tags.forEach(tag => queryParams.append('tags', tag));
      }
      
      // 构建请求头
      const headers: HeadersInit = {
        'Content-Type': 'application/json'
      };
      
      // 如果用户已登录，添加认证令牌
      const token = AuthService.getToken();
      if (token) {
        headers['Authorization'] = `Bearer ${token}`;
      }
      
      // 发送请求
      const response = await fetch(`${this.API_BASE}/paginated?${queryParams.toString()}`, {
        method: 'GET',
        headers
      });
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || '获取分页问题列表失败');
      }
      
      const data = await response.json();
      return {
        problems: data.problems || [],
        totalCount: data.totalCount || 0,
        page: data.page || params.page,
        pageSize: data.pageSize || params.pageSize
      };
    } catch (error: any) {
      console.error('获取分页问题列表失败:', error);
      throw error;
    }
  }
  
  /**
   * 获取所有问题（带缓存）
   * 使用内存缓存避免频繁请求
   * @returns 所有问题数据
   */
  public static async getAllProblemsWithCache(): Promise<any[]> {
    try {
      const now = Date.now();
      
      // 如果缓存有效，直接返回缓存数据
      if (this.cachedProblems.length > 0 && (now - this.lastFetchTime < this.CACHE_EXPIRY)) {
        console.log('使用缓存的问题数据，缓存时间:', new Date(this.lastFetchTime).toLocaleTimeString());
        return this.cachedProblems;
      }
      
      console.log('缓存已过期或不存在，重新获取所有问题');
      
      // 构建请求头
      const headers: HeadersInit = {
        'Content-Type': 'application/json'
      };
      
      // 如果用户已登录，添加认证令牌
      const token = AuthService.getToken();
      if (token) {
        headers['Authorization'] = `Bearer ${token}`;
      }
      
      // 请求非常大的页面大小，获取所有问题
      const response = await fetch(`${this.API_BASE}/paginated?page=1&pageSize=1000`, {
        method: 'GET',
        headers
      });
      
      if (!response.ok) {
        throw new Error(`获取所有问题失败: ${response.status} ${response.statusText}`);
      }
      
      const data = await response.json();
      
      // 更新缓存
      this.cachedProblems = data.problems || [];
      this.lastFetchTime = now;
      
      console.log(`已缓存 ${this.cachedProblems?.length || 0} 个问题`);
      return this.cachedProblems;
    } catch (error: any) {
      console.error('获取所有问题失败:', error);
      // 如果请求失败但有缓存，返回缓存数据
      if (this.cachedProblems.length > 0) {
        console.log('请求失败，返回缓存数据');
        return this.cachedProblems;
      }
      throw error;
    }
  }
  
  /**
   * 清除问题缓存
   */
  public static clearCache(): void {
    this.cachedProblems = [];
    this.lastFetchTime = 0;
    console.log('问题缓存已清除');
  }
  
  /**
   * 获取单个问题详情
   * @param id 问题ID
   */
  public static async getProblemById(id: string): Promise<any> {
    try {
      const response = await fetch(`${this.API_BASE}/${id}`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json'
        }
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || '获取问题详情失败');
      }

      const data = await response.json();
      return data.problem;
    } catch (error: any) {
      console.error('获取问题详情失败:', error);
      throw error;
    }
  }
} 