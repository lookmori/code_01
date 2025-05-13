"use client";

import { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import { ProblemService } from '@/services/problem.service';
import { Problem, SubmitCodeResponse, SubmissionStatus, Submission } from '@/types/practice';
import CodeEditor from '@/components/CodeEditor';
import CommentSection from '@/components/comments/CommentSection';
import { SubmissionService } from '@/services/submission.service';
import { formatDistanceToNow } from 'date-fns';
import { zhCN } from 'date-fns/locale';
import { AuthService } from '@/services/auth.service';

export default function ProblemDetail() {
  const params = useParams();
  const slug = Array.isArray(params.slug) ? params.slug[0] : params.slug;
  const [problem, setProblem] = useState<Problem | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [code, setCode] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submissionResult, setSubmissionResult] = useState<SubmitCodeResponse | null>(null);
  const [showSubmissionResult, setShowSubmissionResult] = useState(false);
  const [activeTab, setActiveTab] = useState<'editor' | 'submissions'>('editor');
  const [submissions, setSubmissions] = useState<Submission[]>([]);
  const [loadingSubmissions, setLoadingSubmissions] = useState(false);
  const [loadingLastSubmission, setLoadingLastSubmission] = useState(false);
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  // 难度映射
  const difficultyMap = {
    easy: { label: '简单', color: 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300' },
    medium: { label: '中等', color: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300' },
    hard: { label: '困难', color: 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300' }
  };

  // 加载问题数据
  useEffect(() => {
    if (slug) {
      // 设置加载状态
      setLoading(true);
      setError(null);
      
      // 通过API获取问题详情
      ProblemService.getProblemById(slug)
        .then(problemData => {
          if (problemData) {
            setProblem(problemData);
          }
        })
        .catch(err => {
          console.error('获取问题详情失败:', err);
          setError('获取问题详情失败，请稍后重试');
        })
        .finally(() => {
          setLoading(false);
        });
    }
  }, [slug]);

  // 检查用户状态
  useEffect(() => {
    const user = AuthService.getCurrentUser();
    setIsAuthenticated(!!user);
  }, []);

  // 加载用户最新提交记录
  useEffect(() => {
    const loadLatestSubmission = async () => {
      if (!problem || !isAuthenticated) return;
      
      setLoadingLastSubmission(true);
      try {
        const latestSubmission = await SubmissionService.getLatestSubmission(problem.id);
        if (latestSubmission) {
          // 如果有最新提交，设置编辑器内容
          setCode(latestSubmission.codeAnswer || '');
          console.log('加载了用户最新提交的代码');
        }
      } catch (error) {
        console.error('获取最新提交失败:', error);
      } finally {
        setLoadingLastSubmission(false);
      }
    };
    
    loadLatestSubmission();
  }, [problem, isAuthenticated]);

  // 加载提交记录
  useEffect(() => {
    if (problem && activeTab === 'submissions') {
      loadSubmissions();
    }
  }, [problem, activeTab]);

  // 加载提交记录函数
  const loadSubmissions = async () => {
    if (!problem) return;
    
    setLoadingSubmissions(true);
    try {
      const submissionsData = await SubmissionService.getSubmissionsByProblemId(problem.id);
      setSubmissions(submissionsData);
    } catch (error) {
      console.error('获取提交记录失败:', error);
    } finally {
      setLoadingSubmissions(false);
    }
  };

  // 处理代码变化
  const handleCodeChange = (value: string | undefined) => {
    setCode(value || '');
  };

  // 提交代码
  const handleSubmit = async () => {
    if (!problem) return;
    
    setIsSubmitting(true);
    setShowSubmissionResult(false);
    
    try {
      // 获取当前用户ID
      const currentUser = AuthService.getCurrentUser();
      const userId = currentUser?.id || '';
      
      // 获取最全面的问题描述
      const problemDesc = 
        problem.problemDescription || 
        problem.description || 
        problem.problem_description || 
        `问题：${problem.title || problem.problemName}`;
      
      console.log('提交代码，用户ID:', userId);
      console.log('提交代码，问题描述:', problemDesc?.substring(0, 50) + '...');
      
      // 使用SubmissionService提交代码
      const result = await SubmissionService.submitCode({
        problemId: problem.id,
        code: code,
        problemDescription: problemDesc,
        userId // 传递用户ID
      });
      
      // 设置提交结果
      setSubmissionResult(result);
      setShowSubmissionResult(true);
      
      // 如果提交成功，刷新提交记录
      if (result.success) {
        loadSubmissions();
      }
    } catch (error) {
      console.error('提交代码失败:', error);
      setSubmissionResult({
        success: false,
        error: '提交代码失败，请稍后重试'
      });
      setShowSubmissionResult(true);
    } finally {
      setIsSubmitting(false);
    }
  };

  // 获取提交结果状态样式
  const getSubmissionStatusStyle = (status?: SubmissionStatus) => {
    if (!status) return '';
    
    switch (status) {
      case SubmissionStatus.CORRECT:
        return 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300';
      case SubmissionStatus.INCORRECT:
        return 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300';
      case SubmissionStatus.PENDING:
        return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300';
      default:
        return 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-300';
    }
  };

  // 格式化时间
  const formatDate = (dateStr: string) => {
    try {
      return formatDistanceToNow(new Date(dateStr), { addSuffix: true, locale: zhCN });
    } catch (e) {
      return '未知时间';
    }
  };

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="flex items-center justify-center h-96">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-red-600 dark:text-red-400 mb-4">加载失败</h1>
          <p className="text-gray-600 dark:text-gray-400 mb-6">{error}</p>
          <Link 
            href="/practice" 
            className="text-white bg-blue-600 hover:bg-blue-700 focus:ring-4 focus:outline-none focus:ring-blue-300 font-medium rounded-lg text-sm px-5 py-2.5 dark:bg-blue-500 dark:hover:bg-blue-600 dark:focus:ring-blue-700"
          >
            返回问题列表
          </Link>
        </div>
      </div>
    );
  }

  if (!problem) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-red-600 dark:text-red-400 mb-4">问题不存在</h1>
          <p className="text-gray-600 dark:text-gray-400 mb-6">找不到指定的问题，请返回列表页面查看其他问题。</p>
          <Link 
            href="/practice" 
            className="text-white bg-blue-600 hover:bg-blue-700 focus:ring-4 focus:outline-none focus:ring-blue-300 font-medium rounded-lg text-sm px-5 py-2.5 dark:bg-blue-500 dark:hover:bg-blue-600 dark:focus:ring-blue-700"
          >
            返回问题列表
          </Link>
        </div>
      </div>
    );
  }

  // 获取难度，如果没有则默认为中等
  const difficulty = problem.difficulty || 'medium';
  const difficultyInfo = difficultyMap[difficulty as keyof typeof difficultyMap] || difficultyMap.medium;

  return (
    <div className="container mx-auto px-4 py-8">
      {/* 返回链接 */}
      <div className="mb-6">
        <Link 
          href="/practice" 
          className="flex items-center text-blue-600 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-300"
        >
          <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 19l-7-7 7-7"></path>
          </svg>
          返回问题列表
        </Link>
      </div>
      
      {/* 问题标题和难度 */}
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white">{problem.title || problem.problemName}</h1>
        <span className={`px-3 py-1 rounded-full text-sm font-medium ${difficultyInfo.color}`}>
          {difficultyInfo.label}
        </span>
      </div>
      
      {/* 标签列表 */}
      <div className="flex flex-wrap gap-2 mb-6">
        {Array.isArray(problem?.tags || problem?.tag) && ((problem?.tags || problem?.tag) || []).length > 0 ? (
          ((problem?.tags || problem?.tag) || []).map((tag: any, index: number) => (
            <span 
              key={index}
              className="px-3 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300"
            >
              {typeof tag === 'object' ? tag.name : tag}
            </span>
          ))
        ) : (
          <span className="text-gray-400 dark:text-gray-500">无标签</span>
        )}
      </div>
      
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-12">
        {/* 问题描述 */}
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md overflow-hidden">
          <div className="p-6">
            <div className="prose dark:prose-invert max-w-none">
              {/* 问题描述 */}
              <div className="mb-6">
                <h2 className="text-xl font-bold mb-4 text-gray-800 dark:text-white">问题描述</h2>
                <p className="whitespace-pre-line">
                  {problem?.description || problem?.problemDescription || '无问题描述'}
                </p>
              </div>
              
              {/* 示例输入输出 */}
              <div className="mb-6">
                <h3 className="text-lg font-semibold mb-2 text-gray-800 dark:text-white">示例:</h3>
                <div className="bg-gray-50 dark:bg-gray-900 p-4 rounded-md mb-2">
                  <p className="font-semibold mb-1 text-gray-700 dark:text-gray-300">输入:</p>
                  <pre className="font-mono text-sm whitespace-pre-wrap">
                    {problem?.exampleInput || problem?.example_input || problem?.sampleInput || '-'}
                  </pre>
                </div>
                <div className="bg-gray-50 dark:bg-gray-900 p-4 rounded-md">
                  <p className="font-semibold mb-1 text-gray-700 dark:text-gray-300">输出:</p>
                  <pre className="font-mono text-sm whitespace-pre-wrap">
                    {problem?.exampleOutput || problem?.example_output || problem?.sampleOutput || '-'}
                  </pre>
                </div>
              </div>

              {/* 使用提示 */}
              <div className="mt-6 p-4 bg-blue-50 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300 rounded-md">
                <h3 className="text-lg font-semibold mb-2">提示:</h3>
                <ul className="list-disc pl-5 space-y-1">
                  <li>请使用Python编写您的解决方案</li>
                  <li>确保您的函数返回正确的输出格式</li>
                  <li>注意边界情况和异常处理</li>
                  <li>尝试优化您的算法以提高效率</li>
                </ul>
              </div>
            </div>
          </div>
        </div>
        
        {/* 代码编辑器 */}
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md overflow-hidden">
          <div className="border-b border-gray-200 dark:border-gray-700">
            <nav className="-mb-px flex">
              <button 
                className={`flex-1 py-3 px-4 text-center border-b-2 ${
                  activeTab === 'editor' 
                    ? 'border-blue-500 font-medium text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-900/20'
                    : 'border-transparent font-medium text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300'
                }`}
                onClick={() => setActiveTab('editor')}
              >
                代码编辑器
              </button>
              <button 
                className={`flex-1 py-3 px-4 text-center border-b-2 ${
                  activeTab === 'submissions' 
                    ? 'border-blue-500 font-medium text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-900/20'
                    : 'border-transparent font-medium text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300'
                }`}
                onClick={() => setActiveTab('submissions')}
              >
                提交记录
              </button>
            </nav>
          </div>
          
          <div className="p-4 h-full">
            {activeTab === 'editor' ? (
              <>
                {loadingLastSubmission ? (
                  <div className="flex justify-center items-center mb-4">
                    <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-blue-500 mr-2"></div>
                    <span className="text-sm text-gray-500">加载上次提交的代码...</span>
                  </div>
                ) : null}
                <CodeEditor 
                  value={code} 
                  onChange={handleCodeChange} 
                  language="python"
                  height="500px"
                />
                
                {/* 提交结果显示 */}
                {showSubmissionResult && submissionResult && (
                  <div className={`mt-4 p-4 rounded-md ${
                    submissionResult.success 
                      ? 'bg-green-50 dark:bg-green-900/20' 
                      : 'bg-red-50 dark:bg-red-900/20'
                  }`}>
                    {submissionResult.success ? (
                      <div>
                        <h3 className="text-lg font-semibold mb-2 text-green-800 dark:text-green-300">提交成功</h3>
                        {submissionResult.submission && (
                          <>
                            <div className="flex items-center mb-2">
                              <span className="font-semibold mr-2">状态:</span>
                              <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                                getSubmissionStatusStyle(submissionResult.submission.status)
                              }`}>
                                {submissionResult.submission.status === SubmissionStatus.CORRECT 
                                  ? '通过' 
                                  : submissionResult.submission.status === SubmissionStatus.INCORRECT 
                                    ? '未通过' 
                                    : '处理中'}
                              </span>
                            </div>
                            {submissionResult.submission.executionTime && (
                              <p className="text-sm text-gray-700 dark:text-gray-300 mb-1">
                                <span className="font-semibold">执行时间:</span> {submissionResult.submission.executionTime}ms
                              </p>
                            )}
                            {submissionResult.submission.memoryUsed && (
                              <p className="text-sm text-gray-700 dark:text-gray-300 mb-1">
                                <span className="font-semibold">内存消耗:</span> {submissionResult.submission.memoryUsed}KB
                              </p>
                            )}
                            {submissionResult.submission.errorMessage && (
                              <div className="mt-2">
                                <p className="font-semibold text-red-700 dark:text-red-300">错误信息:</p>
                                <pre className="mt-1 p-2 bg-red-100 dark:bg-red-900/40 text-red-800 dark:text-red-200 rounded text-sm whitespace-pre-wrap">
                                  {submissionResult.submission.errorMessage}
                                </pre>
                              </div>
                            )}
                            {submissionResult.submission.evaluationResult && (
                              <div className="mt-2">
                                <p className="font-semibold text-gray-700 dark:text-gray-300">评测结果:</p>
                                <pre className="mt-1 p-2 bg-gray-100 dark:bg-gray-900 text-gray-800 dark:text-gray-200 rounded text-sm whitespace-pre-wrap">
                                  {submissionResult.submission.evaluationResult}
                                </pre>
                              </div>
                            )}
                          </>
                        )}
                      </div>
                    ) : (
                      <div>
                        <h3 className="text-lg font-semibold mb-2 text-red-800 dark:text-red-300">提交失败</h3>
                        <p className="text-red-700 dark:text-red-200">{submissionResult.error}</p>
                      </div>
                    )}
                  </div>
                )}
                
                <div className="mt-4 flex justify-end">
                  <button 
                    onClick={handleSubmit}
                    disabled={isSubmitting || !code.trim()}
                    className="flex items-center px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {isSubmitting ? (
                      <>
                        <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                        </svg>
                        提交中...
                      </>
                    ) : '提交代码'}
                  </button>
                </div>
              </>
            ) : (
              // 提交记录列表
              <div>
                <h3 className="text-lg font-semibold mb-4 text-gray-800 dark:text-white">提交记录</h3>
                
                {loadingSubmissions ? (
                  <div className="flex justify-center py-8">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
                  </div>
                ) : submissions.length > 0 ? (
                  <div className="space-y-4">
                    {submissions.map((submission) => (
                      <div 
                        key={submission.id} 
                        className="p-4 border border-gray-200 dark:border-gray-700 rounded-lg"
                      >
                        <div className="flex justify-between mb-2">
                          <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                            getSubmissionStatusStyle(submission.status)
                          }`}>
                            {submission.status === SubmissionStatus.CORRECT 
                              ? '通过' 
                              : submission.status === SubmissionStatus.INCORRECT 
                                ? '未通过' 
                                : '处理中'}
                          </span>
                          <span className="text-xs text-gray-500 dark:text-gray-400">
                            {formatDate(submission.submittedAt)}
                          </span>
                        </div>
                        
                        {submission.executionTime && (
                          <p className="text-sm text-gray-700 dark:text-gray-300 mb-1">
                            <span className="font-semibold">执行时间:</span> {submission.executionTime}ms
                          </p>
                        )}
                        
                        {submission.memoryUsed && (
                          <p className="text-sm text-gray-700 dark:text-gray-300 mb-1">
                            <span className="font-semibold">内存消耗:</span> {submission.memoryUsed}KB
                          </p>
                        )}
                        
                        {submission.errorMessage && (
                          <div className="mt-2">
                            <p className="font-semibold text-red-700 dark:text-red-300">错误信息:</p>
                            <pre className="mt-1 p-2 bg-red-100 dark:bg-red-900/40 text-red-800 dark:text-red-200 rounded text-sm whitespace-pre-wrap">
                              {submission.errorMessage}
                            </pre>
                          </div>
                        )}
                        
                        <div className="mt-2">
                          <details className="cursor-pointer">
                            <summary className="text-sm font-medium text-blue-600 dark:text-blue-400">
                              查看代码
                            </summary>
                            <pre className="mt-2 p-3 bg-gray-100 dark:bg-gray-900 text-gray-800 dark:text-gray-200 rounded text-sm whitespace-pre-wrap overflow-x-auto">
                              {submission.codeAnswer}
                            </pre>
                          </details>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="py-10 text-center text-gray-500 dark:text-gray-400">
                    暂无提交记录
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
      
      {/* 评论区放在最下方 */}
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md overflow-hidden mt-8">
        <div className="p-6">
          <CommentSection problemId={problem.id} />
        </div>
      </div>
    </div>
  );
} 