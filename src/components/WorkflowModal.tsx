"use client";

import { useState, useEffect } from 'react';
import { Dialog, Transition } from '@headlessui/react';
import { Fragment } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { CozeService } from '@/services/coze.service';
import { ProblemService } from '@/services/problem.service';
import { AuthService } from '@/services/auth.service';
import { UserRole } from '@/types/user';

// 定义问题结构
interface Problem {
  problem_name: string;
  problem_description: string;
  example_input: string;
  example_output: string;
  ques_tag: string;
  id?: string; // 可选ID字段，用于持久化后的标识
}

// 定义工作流响应结构
interface WorkflowResponse {
  output: Problem[];
}

interface WorkflowModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (content: string) => void;
}

// 加载动画组件
const LoadingSpinner = () => (
  <div className="flex justify-center items-center">
    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
  </div>
);

// 本地存储键
const SAVED_PROBLEMS_KEY = 'saved_problems';

export default function WorkflowModal({ isOpen, onClose, onSubmit }: WorkflowModalProps) {
  const [workflowContent, setWorkflowContent] = useState('');
  const [isAuthorized, setIsAuthorized] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [results, setResults] = useState<Problem[]>([]);
  const [showResults, setShowResults] = useState(false);
  const [loadingStage, setLoadingStage] = useState<string>(''); // 用于显示加载阶段
  
  const searchParams = useSearchParams();
  const router = useRouter();
  
  // 从本地存储加载保存的问题列表
  const loadSavedProblems = (): Problem[] => {
    if (typeof window === 'undefined') return [];
    const savedData = localStorage.getItem(SAVED_PROBLEMS_KEY);
    if (!savedData) return [];
    try {
      return JSON.parse(savedData);
    } catch (e) {
      console.error('解析保存的问题数据失败:', e);
      safeShowMessage('showErrorMessage', '加载已保存问题失败');
      return [];
    }
  };
  
  // 保存问题列表到本地存储
  const saveProblemsToStorage = (problems: Problem[]) => {
    if (typeof window === 'undefined') return;
    try {
      localStorage.setItem(SAVED_PROBLEMS_KEY, JSON.stringify(problems));
    } catch (e) {
      console.error('保存问题数据失败:', e);
      safeShowMessage('showErrorMessage', '保存问题到本地缓存失败');
    }
  };
  
  // 检查授权状态
  useEffect(() => {
    const checkAuthStatus = () => {
      setIsAuthorized(CozeService.isAuthorized());
    };
    
    // 初始检查
    checkAuthStatus();
    
    // 监听授权状态变化
    const handleAuthChange = (e: Event) => {
      const customEvent = e as CustomEvent;
      setIsAuthorized(customEvent.detail?.isAuthorized || false);
    };
    
    window.addEventListener(CozeService.AUTH_STATE_CHANGE_EVENT, handleAuthChange);
    
    return () => {
      window.removeEventListener(CozeService.AUTH_STATE_CHANGE_EVENT, handleAuthChange);
    };
  }, []);
  
  // 辅助函数：安全地调用消息方法
  const safeShowMessage = (method: keyof Pick<Window, 'showSuccessMessage' | 'showErrorMessage' | 'showInfoMessage' | 'showWarningMessage'>, content: string, duration?: number) => {
    if (typeof window !== 'undefined' && window[method]) {
      window[method](content, duration);
    }
  };
  
  // 处理授权回调
  useEffect(() => {
    const code = searchParams.get('code');
    const state = searchParams.get('state');
    const error = searchParams.get('error');
    
    // 清除URL中的查询参数
    const clearUrlParams = () => {
      if (typeof window === 'undefined') return;
      const url = new URL(window.location.href);
      url.search = '';
      router.replace(url.toString());
    };
    
    // 如果有错误参数
    if (error) {
      const errorDescription = searchParams.get('error_description') || '未知错误';
      setError(`授权失败: ${errorDescription}`);
      safeShowMessage('showErrorMessage', `Coze授权失败: ${errorDescription}`);
      clearUrlParams();
      return;
    }
    
    // 如果有授权码和状态
    if (code && state) {
      // 验证状态以防止CSRF攻击
      if (!CozeService.validateState(state)) {
        setError('授权状态验证失败，可能存在安全风险');
        safeShowMessage('showErrorMessage', '授权状态验证失败，可能存在安全风险');
        clearUrlParams();
        return;
      }
      
      // 交换授权码获取令牌
      setIsLoading(true);
      setLoadingStage('正在交换授权码获取访问令牌...');
      safeShowMessage('showInfoMessage', '正在处理Coze授权...');
      
      CozeService.exchangeCodeForToken(code)
        .then(() => {
          setIsAuthorized(true);
          setError(null);
          setIsModalOpen(true); // 重新打开模态框
          safeShowMessage('showSuccessMessage', 'Coze授权成功！');
        })
        .catch(err => {
          console.error('获取令牌失败:', err);
          setError(`获取访问令牌失败: ${err.message || '请重试'}`);
          safeShowMessage('showErrorMessage', `获取访问令牌失败: ${err.message || '请重试'}`);
        })
        .finally(() => {
          setIsLoading(false);
          setLoadingStage('');
          clearUrlParams();
        });
    }
  }, [searchParams, router]);
  
  // 重置表单
  useEffect(() => {
    if (!isOpen) {
      setWorkflowContent('');
      setError(null);
    } else {
      // 如果打开模态框，检查是否有待执行的内容
      const pendingContent = sessionStorage.getItem('pending_workflow_content');
      if (pendingContent) {
        setWorkflowContent(pendingContent);
        // 清除存储的内容，防止重复使用
        sessionStorage.removeItem('pending_workflow_content');
      }
    }
  }, [isOpen]);
  
  // 管理模态框状态（用于授权后重新打开）
  const [isModalOpen, setIsModalOpen] = useState(false);
  useEffect(() => {
    setIsModalOpen(isOpen);
  }, [isOpen]);
  
  // 开始授权流程
  const startAuthorization = () => {
    // 保存当前内容，以便授权后恢复
    if (workflowContent.trim()) {
      sessionStorage.setItem('pending_workflow_content', workflowContent);
    }
    
    // 重定向到授权页面
    window.location.href = CozeService.getAuthorizationUrl();
  };
  
  // 注销
  const handleLogout = () => {
    CozeService.clearToken();
    setIsAuthorized(false);
    safeShowMessage('showInfoMessage', '已注销Coze授权');
  };
  
  // 删除问题
  const handleDeleteProblem = (index: number) => {
    setResults(prevResults => prevResults.filter((_, i) => i !== index));
    safeShowMessage('showInfoMessage', '已删除问题');
  };
  
  // 提交表单
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!workflowContent.trim()) {
      return;
    }
    
    try {
      setIsLoading(true);
      setError(null);
      setResults([]);
      setShowResults(false);
      
      // 如果未授权，开始授权流程
      if (!isAuthorized) {
        safeShowMessage('showInfoMessage', '正在跳转到Coze授权页面...');
        startAuthorization();
        return;
      }
      
      // 执行工作流
      setLoadingStage('正在执行工作流...');
      safeShowMessage('showInfoMessage', '正在执行工作流，请稍候...');
      const result = await CozeService.executeWorkflow(workflowContent);
      console.log('工作流执行结果:', result);
      
      // 显示结果 - 现在CozeService已经处理了JSON解析
      if (result && result.output && Array.isArray(result.output)) {
        // 为每个问题添加唯一ID
        const problemsWithIds = result.output.map((problem: Problem) => ({
          ...problem,
          id: `problem_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
        }));
        
        setResults(problemsWithIds);
        setShowResults(true);
        
        safeShowMessage('showSuccessMessage', `成功生成 ${problemsWithIds.length} 个问题`);
      } else {
        console.error('无效的工作流结果格式:', result);
        throw new Error('返回结果格式不正确');
      }
      
      onSubmit(workflowContent);
      // 不关闭对话框，以便查看结果
      
    } catch (err: any) {
      console.error('执行工作流失败:', err);
      setError(`执行工作流失败: ${err.message || '请重试'}`);
      
      safeShowMessage('showErrorMessage', `工作流执行失败: ${err.message || '请重试'}`);
      
      // 处理授权过期情况
      if (err.message?.includes('授权已过期')) {
        setIsAuthorized(false);
        safeShowMessage('showWarningMessage', '授权已过期，请重新授权', 5000);
      }
    } finally {
      setIsLoading(false);
      setLoadingStage('');
    }
  };
  
  // 返回到输入界面
  const handleBackToInput = () => {
    setShowResults(false);
  };
  
  // 保存问题列表
  const handleSaveProblemList = async () => {
    try {
      setIsLoading(true);
      setLoadingStage('正在保存题目到数据库...');
      
      // 检查用户登录状态
      if (!AuthService.isAuthenticated()) {
        setError('请先登录再保存题目');
        setIsLoading(false);
        setLoadingStage('');
        safeShowMessage('showErrorMessage', '请先登录再保存题目');
        return;
      }
      
      // 检查用户是否为管理员
      const currentUser = AuthService.getCurrentUser();
      console.log('WorkflowModal - 当前用户:', currentUser);
      console.log('WorkflowModal - 用户角色:', currentUser?.role);
      
      // 使用字符串比较或isAdmin方法检查管理员权限
      const userRole = typeof currentUser?.role === 'string' 
        ? currentUser.role 
        : (currentUser?.role as any)?.toString();
      
      const isAdmin = userRole === 'admin' || AuthService.isAdmin();
      console.log('WorkflowModal - 是否管理员:', isAdmin);
      
      if (!isAdmin) {
        setError('只有管理员可以保存题目到数据库');
        setIsLoading(false);
        setLoadingStage('');
        safeShowMessage('showErrorMessage', '只有管理员可以保存题目到数据库');
        return;
      }
      
      // 1. 先保存到本地存储（作为备份）
      const savedProblems = loadSavedProblems();
      const updatedProblems = [...savedProblems, ...results];
      saveProblemsToStorage(updatedProblems);
      
      // 2. 保存到数据库
      const saveResult = await ProblemService.batchSaveProblems(results);
      
      // 3. 显示成功信息
      safeShowMessage('showSuccessMessage', `已成功保存 ${saveResult.problems.length} 个问题到数据库`);
      
      // 4. 关闭对话框
      onClose();
    } catch (err: any) {
      console.error('保存问题列表失败:', err);
      
      // 显示错误消息
      setError(`保存失败: ${err.message || '请重试'}`);
      
      // 如果是授权错误，提示用户登录
      if (err.message?.includes('未授权') || err.message?.includes('权限不足')) {
        safeShowMessage('showErrorMessage', '保存失败: 请确保您已登录并具有管理员权限');
      } else {
        safeShowMessage('showErrorMessage', '保存问题列表时出错，请重试');
      }
    } finally {
      setIsLoading(false);
      setLoadingStage('');
    }
  };
  
  return (
    <Transition show={isModalOpen} as={Fragment}>
      <Dialog as="div" className="relative z-50" onClose={onClose}>
        <Transition.Child
          as={Fragment}
          enter="ease-out duration-300"
          enterFrom="opacity-0"
          enterTo="opacity-100"
          leave="ease-in duration-200"
          leaveFrom="opacity-100"
          leaveTo="opacity-0"
        >
          <div className="fixed inset-0 bg-black/25" />
        </Transition.Child>

        <div className="fixed inset-0 overflow-y-auto">
          <div className="flex min-h-full items-center justify-center p-4 text-center">
            <Transition.Child
              as={Fragment}
              enter="ease-out duration-300"
              enterFrom="opacity-0 scale-95"
              enterTo="opacity-100 scale-100"
              leave="ease-in duration-200"
              leaveFrom="opacity-100 scale-100"
              leaveTo="opacity-0 scale-95"
            >
              <Dialog.Panel className="w-full max-w-2xl transform overflow-hidden rounded-2xl bg-white dark:bg-gray-800 p-6 text-left align-middle shadow-xl transition-all">
                <Dialog.Title 
                  as="h3" 
                  className="text-lg font-medium leading-6 text-gray-900 dark:text-white flex justify-between items-center"
                >
                  <span>{showResults ? '工作流执行结果' : '工作流管理'}</span>
                  {isAuthorized && !showResults && (
                    <button
                      type="button"
                      onClick={handleLogout}
                      className="text-sm text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300"
                    >
                      注销 Coze
                    </button>
                  )}
                </Dialog.Title>
                
                {error && (
                  <div className="mt-2 p-2 bg-red-100 border border-red-400 text-red-700 dark:bg-red-900 dark:border-red-800 dark:text-red-300 rounded">
                    {error}
                  </div>
                )}
                
                {isLoading && (
                  <div className="my-4 p-4 flex flex-col items-center space-y-3">
                    <LoadingSpinner />
                    <p className="text-gray-600 dark:text-gray-400 text-sm">{loadingStage || '加载中...'}</p>
                  </div>
                )}
                
                {!isLoading && !showResults ? (
                  // 输入表单界面
                  <form onSubmit={handleSubmit}>
                    <div className="mt-4">
                      <label 
                        htmlFor="workflow-content" 
                        className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2"
                      >
                        工作流内容
                      </label>
                      <textarea
                        id="workflow-content"
                        className="w-full px-3 py-2 text-gray-700 dark:text-white border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:border-gray-600"
                        rows={4}
                        value={workflowContent}
                        onChange={(e) => setWorkflowContent(e.target.value)}
                        placeholder="请输入工作流内容..."
                        required
                        disabled={isLoading}
                      />
                    </div>

                    <div className="mt-6 flex justify-end space-x-3">
                      <button
                        type="button"
                        className="inline-flex justify-center rounded-md border border-gray-300 dark:border-gray-600 px-4 py-2 text-sm font-medium text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
                        onClick={onClose}
                        disabled={isLoading}
                      >
                        取消
                      </button>
                      <button
                        type="submit"
                        className="inline-flex justify-center rounded-md border border-transparent bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
                        disabled={isLoading || !workflowContent.trim()}
                      >
                        {isLoading ? '处理中...' : isAuthorized ? '执行工作流' : '使用Coze授权'}
                      </button>
                    </div>
                  </form>
                ) : !isLoading && showResults ? (
                  // 结果展示界面
                  <div className="mt-4">
                    <div className="mb-4 border-b border-gray-200 dark:border-gray-700">
                      <p className="text-gray-600 dark:text-gray-400 mb-2">
                        共生成 <span className="font-semibold">{results.length}</span> 个题目
                      </p>
                    </div>
                    
                    <div className="space-y-4 max-h-[60vh] overflow-y-auto pr-2">
                      {results.map((problem, index) => (
                        <div key={problem.id || index} className="border border-gray-200 dark:border-gray-700 rounded-lg p-4 relative">
                          <button
                            type="button"
                            className="absolute top-2 right-2 text-red-500 hover:text-red-700"
                            onClick={() => handleDeleteProblem(index)}
                            title="删除问题"
                          >
                            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5">
                              <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                            </svg>
                          </button>
                          <h4 className="font-medium text-lg text-gray-900 dark:text-white mb-2">{problem.problem_name}</h4>
                          <p className="text-gray-700 dark:text-gray-300 mb-2 whitespace-pre-line">{problem.problem_description}</p>
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-3">
                            <div className="bg-gray-50 dark:bg-gray-700 p-2 rounded">
                              <div className="text-sm font-medium text-gray-500 dark:text-gray-400">示例输入</div>
                              <div className="text-gray-900 dark:text-white font-mono text-sm mt-1 whitespace-pre">{problem.example_input}</div>
                            </div>
                            <div className="bg-gray-50 dark:bg-gray-700 p-2 rounded">
                              <div className="text-sm font-medium text-gray-500 dark:text-gray-400">示例输出</div>
                              <div className="text-gray-900 dark:text-white font-mono text-sm mt-1 whitespace-pre">{problem.example_output}</div>
                            </div>
                          </div>
                          <div className="mt-3">
                            <span className="inline-block bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300 rounded-full px-3 py-1 text-xs font-medium">
                              {problem.ques_tag}
                            </span>
                          </div>
                        </div>
                      ))}
                    </div>
                    
                    <div className="mt-6 flex justify-end space-x-3">
                      <button
                        type="button"
                        className="inline-flex justify-center rounded-md border border-gray-300 dark:border-gray-600 px-4 py-2 text-sm font-medium text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
                        onClick={handleBackToInput}
                      >
                        返回
                      </button>
                      <button
                        type="button"
                        className="inline-flex justify-center rounded-md border border-transparent bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
                        onClick={handleSaveProblemList}
                      >
                        保存题目列表
                      </button>
                    </div>
                  </div>
                ) : null}
              </Dialog.Panel>
            </Transition.Child>
          </div>
        </div>
      </Dialog>
    </Transition>
  );
} 