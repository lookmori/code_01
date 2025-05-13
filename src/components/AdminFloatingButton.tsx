"use client";

import { useState, useEffect } from 'react';
import { AuthService } from '@/services/auth.service';
import { CozeService } from '@/services/coze.service';
import WorkflowModal from './WorkflowModal';
import { UserRole } from '@/types/user';

export default function AdminFloatingButton() {
  const [isAdmin, setIsAdmin] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isAuthorized, setIsAuthorized] = useState(false);
  const [showAuthTooltip, setShowAuthTooltip] = useState(false);
  
  // 检查当前用户是否为管理员
  useEffect(() => {
    const checkAdminStatus = () => {
      const user = AuthService.getCurrentUser();
      console.log('当前用户信息:', user);
      console.log('用户角色:', user?.role);
      
      // 使用字符串比较方式检查角色
      const userRole = typeof user?.role === 'string' ? user.role : (user?.role as any)?.toString();
      console.log('用户角色字符串值:', userRole);
      console.log('是否为管理员角色(字符串比较):', userRole === 'admin');
      
      // 使用AuthService的isAdmin方法
      const isAdminUser = AuthService.isAdmin();
      console.log('AuthService.isAdmin()返回结果:', isAdminUser);
      
      // 设置状态
      setIsAdmin(isAdminUser);
    };
    
    // 初始检查
    checkAdminStatus();
    
    // 监听认证状态变化
    const handleAuthChange = (e: Event) => {
      checkAdminStatus();
    };
    
    window.addEventListener(AuthService.AUTH_STATE_CHANGE_EVENT, handleAuthChange);
    
    return () => {
      window.removeEventListener(AuthService.AUTH_STATE_CHANGE_EVENT, handleAuthChange);
    };
  }, []);
  
  // 检查Coze授权状态
  useEffect(() => {
    const checkCozeAuthStatus = () => {
      setIsAuthorized(CozeService.isAuthorized());
    };
    
    // 初始检查
    checkCozeAuthStatus();
    
    // 监听Coze授权状态变化
    const handleCozeAuthChange = (e: Event) => {
      const customEvent = e as CustomEvent;
      setIsAuthorized(customEvent.detail?.isAuthorized || false);
    };
    
    window.addEventListener(CozeService.AUTH_STATE_CHANGE_EVENT, handleCozeAuthChange);
    
    return () => {
      window.removeEventListener(CozeService.AUTH_STATE_CHANGE_EVENT, handleCozeAuthChange);
    };
  }, []);
  
  // 处理工作流提交
  const handleWorkflowSubmit = async (content: string) => {
    try {
      console.log('执行工作流:', content);
      
      // 检查是否已获得Coze授权
      if (!CozeService.isAuthorized()) {
        console.log('未获得Coze授权，开始授权流程...');
        // 关闭当前模态框
        setIsModalOpen(false);
        // 在本地存储中保存输入内容，以便授权后恢复
        sessionStorage.setItem('pending_workflow_content', content);
        // 启动授权流程
        window.location.href = CozeService.getAuthorizationUrl();
        return;
      }
      
      // 使用CozeService执行工作流
      const result = await CozeService.executeWorkflow(content);
      console.log('工作流执行结果:', result);
      
      return result;
    } catch (error: any) {
      console.error('工作流执行失败:', error);
      
      // 如果是授权过期问题，可以尝试重新授权
      if (error.message?.includes('授权已过期')) {
        setIsAuthorized(false);
        // 可以在这里提示用户重新授权
      }
      
      throw error;
    }
  };
  
  // 检查是否有待执行的工作流内容（从授权后返回）
  useEffect(() => {
    const pendingContent = sessionStorage.getItem('pending_workflow_content');
    const code = new URLSearchParams(window.location.search).get('code');
    
    // 如果有授权码和待执行内容，表示刚刚完成授权
    if (code && pendingContent) {
      // 清除待执行内容
      sessionStorage.removeItem('pending_workflow_content');
      
      // 等待授权码处理完成
      const timer = setTimeout(() => {
        // 重新打开模态框
        setIsModalOpen(true);
      }, 1000);
      
      return () => clearTimeout(timer);
    }
  }, []);
  
  // 处理按钮点击
  const handleButtonClick = () => {
    setIsModalOpen(true);
    setShowAuthTooltip(false);
  };
  
  // 显示授权状态提示
  const handleMouseEnter = () => {
    if (!isAuthorized) {
      setShowAuthTooltip(true);
    }
  };
  
  const handleMouseLeave = () => {
    setShowAuthTooltip(false);
  };
  
  // 如果不是管理员，不显示按钮
  if (!isAdmin) {
    return null;
  }
  
  return (
    <>
      <div 
        className="fixed right-6 bottom-6 z-10"
        onMouseEnter={handleMouseEnter}
        onMouseLeave={handleMouseLeave}
      >
        {showAuthTooltip && (
          <div className="absolute right-0 bottom-16 bg-white dark:bg-gray-800 p-2 rounded shadow-lg text-sm text-gray-700 dark:text-gray-300 w-48 mb-2">
            您需要授权Coze来执行工作流。点击按钮开始授权流程。
          </div>
        )}
        
        <button
          onClick={handleButtonClick}
          className={`p-4 text-white rounded-full shadow-lg flex items-center justify-center transition-all duration-300 hover:scale-110 ${
            isAuthorized 
              ? 'bg-blue-600 hover:bg-blue-700' 
              : 'bg-orange-500 hover:bg-orange-600'
          }`}
          aria-label="管理员工作流"
          title={isAuthorized ? "执行Coze工作流" : "授权Coze工作流"}
        >
          <svg 
            xmlns="http://www.w3.org/2000/svg" 
            width="24" 
            height="24" 
            viewBox="0 0 24 24" 
            fill="none" 
            stroke="currentColor" 
            strokeWidth="2" 
            strokeLinecap="round" 
            strokeLinejoin="round"
          >
            <path d="M12 20h9"></path>
            <path d="M16.5 3.5a2.121 2.121 0 0 1 3 3L7 19l-4 1 1-4L16.5 3.5z"></path>
          </svg>
          
          {!isAuthorized && (
            <span className="absolute top-0 right-0 h-3 w-3 bg-red-500 rounded-full"></span>
          )}
        </button>
      </div>
      
      <WorkflowModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSubmit={handleWorkflowSubmit}
      />
    </>
  );
} 