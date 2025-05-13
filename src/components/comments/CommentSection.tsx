import { useState, useEffect } from 'react';
import { CommentService } from '@/services/comment.service';
import { AuthService } from '@/services/auth.service';
import { Comment } from '@/types/practice';
import CommentItem from './CommentItem';
import CommentForm from './CommentForm';

interface CommentSectionProps {
  problemId: string;
}

export default function CommentSection({ problemId }: CommentSectionProps) {
  const [comments, setComments] = useState<Comment[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  
  // 获取评论
  useEffect(() => {
    const loadComments = async () => {
      try {
        setLoading(true);
        const commentsData = await CommentService.getCommentsByProblemId(problemId);
        setComments(commentsData);
        setError(null);
      } catch (err) {
        console.error('加载评论失败', err);
        setError('无法加载评论，请稍后重试');
      } finally {
        setLoading(false);
      }
    };
    
    // 检查用户登录状态
    const checkAuth = () => {
      const isLoggedIn = AuthService.isAuthenticated();
      setIsAuthenticated(isLoggedIn);
    };
    
    loadComments();
    checkAuth();
  }, [problemId]);
  
  // 处理评论提交
  const handleCommentSubmit = async (content: string, hasCode: boolean, codeBlock: string, codeLanguage: string) => {
    if (!isAuthenticated) {
      // 如果未登录，提示用户
      alert('请先登录后再发表评论');
      return;
    }
    
    try {
      const commentData = {
        problemId,
        content,
        hasCode,
        codeBlock: hasCode ? codeBlock : undefined,
        codeLanguage: hasCode ? codeLanguage : undefined
      };
      
      // 添加评论
      const newComment = await CommentService.addComment(commentData);
      
      // 将新评论添加到列表
      setComments(prev => [newComment, ...prev]);
    } catch (error) {
      console.error('添加评论失败', error);
      alert('添加评论失败，请稍后重试');
    }
  };
  
  // 处理回复添加
  const handleReplyAdded = (commentId: string, reply: Comment) => {
    // 更新评论的回复数
    setComments(prev => prev.map(comment => {
      if (comment.id === commentId) {
        return {
          ...comment,
          repliesCount: comment.repliesCount + 1
        };
      }
      return comment;
    }));
  };

  return (
    <div className="mt-8">
      <h2 className="text-xl font-semibold mb-6 text-gray-800 dark:text-white">
        评论区
      </h2>
      
      {/* 评论表单 */}
      {isAuthenticated ? (
        <div className="mb-6">
          <CommentForm onSubmit={handleCommentSubmit} />
        </div>
      ) : (
        <div className="mb-6 p-4 bg-blue-50 dark:bg-blue-900/30 text-blue-800 dark:text-blue-300 rounded-lg">
          <p className="text-center">请先登录后再发表评论</p>
        </div>
      )}
      
      {/* 评论列表 */}
      <div className="space-y-4">
        {loading ? (
          <div className="flex justify-center p-8">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
          </div>
        ) : error ? (
          <div className="p-4 bg-red-50 dark:bg-red-900/30 text-red-800 dark:text-red-300 rounded-lg">
            <p className="text-center">{error}</p>
          </div>
        ) : comments.length > 0 ? (
          comments.map((comment) => (
            <CommentItem 
              key={comment.id} 
              comment={comment} 
              problemId={problemId}
              onReplyAdded={handleReplyAdded}
            />
          ))
        ) : (
          <div className="p-8 text-center text-gray-500 dark:text-gray-400">
            <p>暂无评论，成为第一个发表评论的人吧！</p>
          </div>
        )}
      </div>
    </div>
  );
} 