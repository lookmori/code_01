import { useState } from 'react';

interface CommentFormProps {
  onSubmit: (content: string, hasCode: boolean, codeBlock: string, codeLanguage: string) => void;
  onCancel?: () => void;
  placeholder?: string;
  buttonText?: string;
  initialContent?: string;
  quotedContent?: string;
  quotedUser?: string;
}

export default function CommentForm({ 
  onSubmit, 
  onCancel, 
  placeholder = '添加评论', 
  buttonText = '发表评论',
  initialContent = '',
  quotedContent = '',
  quotedUser = ''
}: CommentFormProps) {
  const [content, setContent] = useState(initialContent);
  const [codeBlock, setCodeBlock] = useState('');
  const [codeLanguage, setCodeLanguage] = useState('python');
  const [submitting, setSubmitting] = useState(false);
  
  // 处理表单提交
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!content.trim()) return;
    
    setSubmitting(true);
    try {
      // 如果代码块有内容，则hasCode为true
      const hasCode = codeBlock.trim().length > 0;
      
      onSubmit(content, hasCode, codeBlock, codeLanguage);
      
      // 重置表单
      setContent('');
      setCodeBlock('');
      setCodeLanguage('python');
    } catch (error) {
      console.error('提交评论失败', error);
    } finally {
      setSubmitting(false);
    }
  };
  
  // 取消评论
  const handleCancel = () => {
    setContent('');
    setCodeBlock('');
    setCodeLanguage('python');
    onCancel && onCancel();
  };

  return (
    <form onSubmit={handleSubmit} className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-4 border border-gray-200 dark:border-gray-700">
      {/* 引用内容 */}
      {quotedContent && (
        <div className="mb-4 p-3 bg-gray-100 dark:bg-gray-700 rounded-lg border-l-4 border-blue-500 dark:border-blue-400">
          <p className="text-xs text-gray-500 dark:text-gray-400 mb-1">
            引用 {quotedUser || '匿名用户'} 的评论：
          </p>
          <p className="text-sm text-gray-700 dark:text-gray-300 whitespace-pre-line">
            {quotedContent.length > 100 ? `${quotedContent.substring(0, 100)}...` : quotedContent}
          </p>
        </div>
      )}
      
      {/* 评论文本区域 */}
      <div className="mb-4">
        <textarea
          value={content}
          onChange={(e) => setContent(e.target.value)}
          placeholder={placeholder}
          rows={4}
          className="w-full px-3 py-2 text-gray-700 dark:text-gray-300 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-600 bg-white dark:bg-gray-700 border-gray-300 dark:border-gray-600"
          required
        />
      </div>
      
      {/* 代码块区域 - 直接显示 */}
      <div className="mb-4">
        <div className="mb-2">
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
            代码块 (可选)
          </label>
          <div className="flex items-center mb-2">
            <span className="text-xs text-gray-500 dark:text-gray-400 mr-2">编程语言:</span>
            <select
              value={codeLanguage}
              onChange={(e) => setCodeLanguage(e.target.value)}
              className="bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 text-xs rounded-lg focus:ring-blue-500 focus:border-blue-500 px-2 py-1"
            >
              <option value="python">Python</option>
              <option value="javascript">JavaScript</option>
              <option value="java">Java</option>
              <option value="c">C</option>
              <option value="cpp">C++</option>
              <option value="csharp">C#</option>
            </select>
          </div>
        </div>
        
        <textarea
          value={codeBlock}
          onChange={(e) => setCodeBlock(e.target.value)}
          placeholder="在此粘贴代码..."
          rows={5}
          className="w-full px-3 py-2 font-mono text-sm text-gray-700 dark:text-gray-300 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-600 bg-gray-50 dark:bg-gray-800 border-gray-300 dark:border-gray-600"
        />
      </div>
      
      {/* 按钮区域 */}
      <div className="flex justify-end space-x-2">
        {onCancel && (
          <button
            type="button"
            onClick={handleCancel}
            className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-200 rounded-md hover:bg-gray-300 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-500 dark:bg-gray-700 dark:text-gray-300 dark:hover:bg-gray-600"
          >
            取消
          </button>
        )}
        <button
          type="submit"
          disabled={submitting || !content.trim()}
          className="px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {submitting ? '提交中...' : buttonText}
        </button>
      </div>
    </form>
  );
} 