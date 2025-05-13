import { useState } from 'react';
import { Comment } from '@/types/practice';
import { formatDistanceToNow } from 'date-fns';
import { zhCN } from 'date-fns/locale';
import { CommentService } from '@/services/comment.service';
import CodeBlock from './CodeBlock';
import CommentForm from './CommentForm';

interface CommentItemProps {
  comment: Comment;
  problemId: string;
  onReplyAdded: (commentId: string, reply: Comment) => void;
}

export default function CommentItem({ comment, problemId, onReplyAdded }: CommentItemProps) {
  const [isReplying, setIsReplying] = useState(false);
  const [isQuoting, setIsQuoting] = useState(false);
  const [showReplies, setShowReplies] = useState(false);
  const [replies, setReplies] = useState<Comment[]>([]);
  const [loading, setLoading] = useState(false);
  
  // 处理显示回复
  const handleShowReplies = async () => {
    if (comment.repliesCount === 0) return;
    
    try {
      setLoading(true);
      if (!showReplies) {
        const repliesData = await CommentService.getRepliesByCommentId(comment.id);
        setReplies(repliesData);
      }
      setShowReplies(!showReplies);
    } catch (error) {
      console.error('获取回复失败', error);
    } finally {
      setLoading(false);
    }
  };
  
  // 处理回复
  const handleReply = () => {
    setIsReplying(true);
    setIsQuoting(false);
  };
  
  // 处理引用
  const handleQuote = () => {
    setIsQuoting(true);
    setIsReplying(false);
  };
  
  // 取消回复或引用
  const handleCancel = () => {
    setIsReplying(false);
    setIsQuoting(false);
  };
  
  // 处理回复提交
  const handleReplySubmit = async (replyContent: string, hasCode: boolean = false, codeBlock: string = '', codeLanguage: string = 'python') => {
    try {
      const replyData = {
        problemId,
        content: replyContent,
        hasCode,
        codeBlock: hasCode ? codeBlock : undefined,
        codeLanguage: hasCode ? codeLanguage : undefined,
        parentId: comment.id,
        quotedCommentId: isQuoting ? comment.id : undefined
      };
      
      const newReply = await CommentService.addComment(replyData);
      
      // 添加新回复到列表
      setReplies(prev => [newReply, ...prev]);
      
      // 显示回复列表
      setShowReplies(true);
      
      // 重置回复表单
      setIsReplying(false);
      setIsQuoting(false);
      
      // 通知父组件
      onReplyAdded(comment.id, newReply);
    } catch (error) {
      console.error('提交回复失败', error);
    }
  };
  
  // 格式化日期
  const formatDate = (dateString: string) => {
    try {
      const date = new Date(dateString);
      return formatDistanceToNow(date, { addSuffix: true, locale: zhCN });
    } catch (e) {
      return '未知时间';
    }
  };

  return (
    <div className="bg-white dark:bg-gray-800 p-4 rounded-lg shadow mb-4">
      {/* 评论头部 - 用户信息 */}
      <div className="flex items-start mb-2">
        <div className="flex-shrink-0 mr-3">
          <div className="w-10 h-10 rounded-full bg-blue-500 flex items-center justify-center text-white font-bold">
            {comment.user?.username?.charAt(0) || '?'}
          </div>
        </div>
        <div className="flex-grow">
          <div className="flex justify-between items-center">
            <div>
              <h4 className="text-sm font-bold text-gray-800 dark:text-white">
                {comment.user?.username || '匿名用户'}
              </h4>
              <p className="text-xs text-gray-500 dark:text-gray-400">
                {formatDate(comment.createdAt)}
              </p>
            </div>
          </div>
        </div>
      </div>
      
      {/* 引用的评论 */}
      {comment.quotedComment && (
        <div className="ml-13 mb-2 p-2 bg-gray-100 dark:bg-gray-700 rounded border-l-2 border-gray-300 dark:border-gray-500">
          <p className="text-xs text-gray-500 dark:text-gray-400 mb-1">
            引用 {comment.quotedComment.user?.username || '匿名用户'}：
          </p>
          <p className="text-sm text-gray-700 dark:text-gray-300 whitespace-pre-line">
            {comment.quotedComment.content.length > 100 
              ? `${comment.quotedComment.content.substring(0, 100)}...` 
              : comment.quotedComment.content}
          </p>
        </div>
      )}
      
      {/* 评论内容 */}
      <div className="ml-13 mb-3">
        <p className="text-gray-700 dark:text-gray-300 whitespace-pre-line">{comment.content}</p>
        
        {/* 代码块 */}
        {comment.hasCode && comment.codeBlock && (
          <div className="mt-2">
            <CodeBlock code={comment.codeBlock} language={comment.codeLanguage || 'python'} />
          </div>
        )}
      </div>
      
      {/* 操作区 */}
      <div className="flex items-center text-sm text-gray-500 dark:text-gray-400 mt-2 ml-13">
        <button 
          onClick={handleReply}
          className="mr-4 hover:text-blue-600 dark:hover:text-blue-400 flex items-center"
        >
          <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 10h10a8 8 0 018 8v2M3 10l6 6m-6-6l6-6"></path>
          </svg>
          回复
        </button>
        
        <button 
          onClick={handleQuote}
          className="mr-4 hover:text-blue-600 dark:hover:text-blue-400 flex items-center"
        >
          <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z"></path>
          </svg>
          引用
        </button>
        
        {comment.repliesCount > 0 && (
          <button 
            onClick={handleShowReplies}
            className="flex items-center hover:text-blue-600 dark:hover:text-blue-400"
          >
            <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 8h2a2 2 0 012 2v6a2 2 0 01-2 2h-2v4l-4-4H9a1.994 1.994 0 01-1.414-.586m0 0L11 14h4a2 2 0 002-2V6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2v4l.586-.586z"></path>
            </svg>
            {showReplies ? '隐藏回复' : `${comment.repliesCount}条回复`}
          </button>
        )}
      </div>
      
      {/* 回复表单 */}
      {isReplying && (
        <div className="mt-4 ml-10">
          <CommentForm 
            onSubmit={handleReplySubmit}
            onCancel={handleCancel}
            placeholder={`回复 ${comment.user?.username || '匿名用户'}`}
            buttonText="回复"
          />
        </div>
      )}
      
      {/* 引用表单 */}
      {isQuoting && (
        <div className="mt-4 ml-10">
          <CommentForm 
            onSubmit={handleReplySubmit}
            onCancel={handleCancel}
            placeholder={`引用并回复 ${comment.user?.username || '匿名用户'}`}
            buttonText="引用并回复"
            quotedContent={comment.content}
            quotedUser={comment.user?.username}
          />
        </div>
      )}
      
      {/* 回复列表 */}
      {showReplies && (
        <div className="ml-10 mt-4 pl-4 border-l-2 border-gray-200 dark:border-gray-700">
          {loading ? (
            <div className="flex justify-center p-4">
              <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-500"></div>
            </div>
          ) : (
            <>
              {replies.length > 0 ? (
                replies.map((reply) => (
                  <div key={reply.id} className="mb-4">
                    <div className="flex items-start mb-2">
                      <div className="flex-shrink-0 mr-3">
                        <div className="w-8 h-8 rounded-full bg-gray-300 dark:bg-gray-600 flex items-center justify-center text-gray-700 dark:text-gray-300 text-sm font-bold">
                          {reply.user?.username?.charAt(0) || '?'}
                        </div>
                      </div>
                      <div className="flex-grow">
                        <div className="flex justify-between items-center">
                          <div>
                            <h4 className="text-sm font-bold text-gray-800 dark:text-white">
                              {reply.user?.username || '匿名用户'}
                            </h4>
                            <p className="text-xs text-gray-500 dark:text-gray-400">
                              {formatDate(reply.createdAt)}
                            </p>
                          </div>
                        </div>
                        
                        {/* 引用的评论 */}
                        {reply.quotedComment && (
                          <div className="mb-2 p-2 bg-gray-100 dark:bg-gray-700 rounded border-l-2 border-gray-300 dark:border-gray-500">
                            <p className="text-xs text-gray-500 dark:text-gray-400 mb-1">
                              引用 {reply.quotedComment.user?.username || '匿名用户'}：
                            </p>
                            <p className="text-xs text-gray-700 dark:text-gray-300 whitespace-pre-line">
                              {reply.quotedComment.content.length > 50 
                                ? `${reply.quotedComment.content.substring(0, 50)}...` 
                                : reply.quotedComment.content}
                            </p>
                          </div>
                        )}
                        
                        <p className="text-gray-700 dark:text-gray-300 text-sm mt-1 whitespace-pre-line">{reply.content}</p>
                        
                        {/* 回复的代码块 */}
                        {reply.hasCode && reply.codeBlock && (
                          <div className="mt-2">
                            <CodeBlock code={reply.codeBlock} language={reply.codeLanguage || 'python'} />
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                ))
              ) : (
                <p className="text-gray-500 dark:text-gray-400 text-sm py-2">暂无回复</p>
              )}
            </>
          )}
        </div>
      )}
    </div>
  );
} 