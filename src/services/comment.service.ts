import { AuthService } from './auth.service';
import { Comment, AddCommentRequest } from '@/types/practice';

/**
 * 评论服务 - 处理与评论相关的业务逻辑
 */
export class CommentService {
  // API路径
  private static readonly API_BASE = '/api/comments';

  /**
   * 获取问题的评论列表
   * @param problemId 问题ID
   */
  public static async getCommentsByProblemId(problemId: string): Promise<Comment[]> {
    try {
      const response = await fetch(`${this.API_BASE}?problemId=${problemId}`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json'
        }
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || '获取评论失败');
      }

      const data = await response.json();
      return data.comments || [];
    } catch (error: any) {
      console.error('获取评论失败:', error);
      throw error;
    }
  }

  /**
   * 获取评论的回复
   * @param commentId 评论ID
   */
  public static async getRepliesByCommentId(commentId: string): Promise<Comment[]> {
    try {
      const response = await fetch(`${this.API_BASE}/replies?commentId=${commentId}`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json'
        }
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || '获取回复失败');
      }

      const data = await response.json();
      return data.replies || [];
    } catch (error: any) {
      console.error('获取回复失败:', error);
      throw error;
    }
  }

  /**
   * 添加评论
   * @param commentData 评论数据
   */
  public static async addComment(commentData: AddCommentRequest): Promise<Comment> {
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
        body: JSON.stringify(commentData)
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || '添加评论失败');
      }

      const data = await response.json();
      return data.comment;
    } catch (error: any) {
      console.error('添加评论失败:', error);
      throw error;
    }
  }
} 