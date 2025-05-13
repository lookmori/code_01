import { AuthService } from './auth.service';
import { Submission, SubmitCodeRequest, SubmitCodeResponse } from '@/types/practice';

/**
 * 提交服务 - 处理与代码提交相关的业务逻辑
 */
export class SubmissionService {
  // API路径
  private static readonly API_BASE = '/api/submissions';

  /**
   * 获取问题的提交记录
   * @param problemId 问题ID
   */
  public static async getSubmissionsByProblemId(problemId: string): Promise<Submission[]> {
    try {
      const token = AuthService.getToken();
      
      const headers: HeadersInit = {
        'Content-Type': 'application/json'
      };
      
      if (token) {
        headers['Authorization'] = `Bearer ${token}`;
      }
      
      const response = await fetch(`${this.API_BASE}?problemId=${problemId}`, {
        method: 'GET',
        headers
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || '获取提交记录失败');
      }

      const data = await response.json();
      return data.submissions || [];
    } catch (error: any) {
      console.error('获取提交记录失败:', error);
      throw error;
    }
  }

  /**
   * 获取用户对特定问题的最新提交
   * @param problemId 问题ID
   * @returns 最新提交记录或null
   */
  public static async getLatestSubmission(problemId: string): Promise<Submission | null> {
    try {
      const token = AuthService.getToken();
      
      // 如果用户未登录，直接返回null
      if (!token) {
        return null;
      }
      
      const headers: HeadersInit = {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      };
      
      const response = await fetch(`${this.API_BASE}/latest?problemId=${problemId}`, {
        method: 'GET',
        headers
      });

      if (!response.ok) {
        // 如果API不存在或出错，尝试通过现有API获取并过滤
        console.log('获取最新提交API失败，尝试获取所有提交并筛选');
        const submissions = await this.getSubmissionsByProblemId(problemId);
        if (submissions && submissions.length > 0) {
          // 按提交时间倒序排序并返回第一个
          return submissions.sort((a, b) => 
            new Date(b.submittedAt).getTime() - new Date(a.submittedAt).getTime()
          )[0];
        }
        return null;
      }

      const data = await response.json();
      return data.submission || null;
    } catch (error: any) {
      console.error('获取最新提交失败:', error);
      return null;
    }
  }

  /**
   * 提交代码
   * @param submitData 提交数据
   */
  public static async submitCode(submitData: SubmitCodeRequest): Promise<SubmitCodeResponse> {
    try {
      const token = AuthService.getToken();
      
      if (!token) {
        throw new Error('未授权，请先登录');
      }
      
      const response = await fetch(`${this.API_BASE}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(submitData)
      });

      if (!response.ok) {
        const errorData = await response.json();
        return {
          success: false,
          error: errorData.error || '提交代码失败'
        };
      }

      const data = await response.json();
      return {
        success: true,
        submission: data.submission
      };
    } catch (error: any) {
      console.error('提交代码失败:', error);
      return {
        success: false,
        error: error.message || '提交代码失败，请稍后重试'
      };
    }
  }
} 