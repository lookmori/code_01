"use client";

import { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';

export type MessageType = 'success' | 'error' | 'warning' | 'info';

interface MessageProps {
  content: string;
  type?: MessageType;
  duration?: number; // 显示持续时间，单位毫秒
  onClose?: () => void;
}

// 消息图标组件
const MessageIcon = ({ type }: { type: MessageType }) => {
  switch (type) {
    case 'success':
      return (
        <svg className="w-5 h-5 text-green-500" fill="currentColor" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg">
          <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd"></path>
        </svg>
      );
    case 'error':
      return (
        <svg className="w-5 h-5 text-red-500" fill="currentColor" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg">
          <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd"></path>
        </svg>
      );
    case 'warning':
      return (
        <svg className="w-5 h-5 text-yellow-500" fill="currentColor" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg">
          <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd"></path>
        </svg>
      );
    case 'info':
    default:
      return (
        <svg className="w-5 h-5 text-blue-500" fill="currentColor" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg">
          <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd"></path>
        </svg>
      );
  }
};

// 获取消息类型对应的样式
const getTypeStyles = (type: MessageType) => {
  switch (type) {
    case 'success':
      return 'bg-green-50 text-green-800 dark:bg-green-900/50 dark:text-green-200 border-green-200 dark:border-green-800';
    case 'error':
      return 'bg-red-50 text-red-800 dark:bg-red-900/50 dark:text-red-200 border-red-200 dark:border-red-800';
    case 'warning':
      return 'bg-yellow-50 text-yellow-800 dark:bg-yellow-900/50 dark:text-yellow-200 border-yellow-200 dark:border-yellow-800';
    case 'info':
    default:
      return 'bg-blue-50 text-blue-800 dark:bg-blue-900/50 dark:text-blue-200 border-blue-200 dark:border-blue-800';
  }
};

// 消息组件
const Message = ({ content, type = 'info', duration = 3000, onClose }: MessageProps) => {
  const [visible, setVisible] = useState(true);
  const [exiting, setExiting] = useState(false);

  useEffect(() => {
    if (duration > 0) {
      const timer = setTimeout(() => {
        handleClose();
      }, duration);

      return () => clearTimeout(timer);
    }
  }, [duration]);

  const handleClose = () => {
    setExiting(true);
    // 添加300ms的退出动画时间
    setTimeout(() => {
      setVisible(false);
      if (onClose) {
        onClose();
      }
    }, 300);
  };

  if (!visible) return null;

  const typeStyles = getTypeStyles(type);

  return (
    <div
      className={`fixed top-4 left-1/2 transform -translate-x-1/2 z-50 max-w-xs w-full transition-all duration-300 ${
        exiting ? 'opacity-0 -translate-y-2' : 'opacity-100 translate-y-0'
      }`}
    >
      <div className={`flex items-center p-4 rounded-lg border shadow-md ${typeStyles}`}>
        <div className="inline-flex shrink-0 mr-3">
          <MessageIcon type={type} />
        </div>
        <div className="ml-2 text-sm font-medium break-words">{content}</div>
        <button
          type="button"
          onClick={handleClose}
          className="ml-auto -mx-1.5 -my-1.5 rounded-lg focus:ring-2 p-1.5 inline-flex h-8 w-8 hover:bg-gray-200 dark:hover:bg-gray-700"
          aria-label="关闭"
        >
          <span className="sr-only">关闭</span>
          <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg">
            <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd"></path>
          </svg>
        </button>
      </div>
    </div>
  );
};

// 消息容器，用于创建全局消息实例
export const MessageContainer = () => {
  const [messages, setMessages] = useState<Array<{ id: string; content: string; type: MessageType; duration?: number }>>([]);

  useEffect(() => {
    if (typeof window === 'undefined') return;
    
    // 设置全局消息方法
    const showMessage = (content: string, type: MessageType = 'info', duration: number = 3000) => {
      const id = `message-${Date.now()}-${Math.floor(Math.random() * 1000)}`;
      setMessages(prev => [...prev, { id, content, type, duration }]);
      return id;
    };

    // 导出全局方法
    window.showMessage = showMessage;
    window.showSuccessMessage = (content: string, duration?: number) => showMessage(content, 'success', duration);
    window.showErrorMessage = (content: string, duration?: number) => showMessage(content, 'error', duration);
    window.showWarningMessage = (content: string, duration?: number) => showMessage(content, 'warning', duration);
    window.showInfoMessage = (content: string, duration?: number) => showMessage(content, 'info', duration);

    // 清除消息方法
    window.clearMessage = (id?: string) => {
      if (id) {
        setMessages(prev => prev.filter(msg => msg.id !== id));
      } else {
        setMessages([]);
      }
    };

    return () => {
      // 清理全局方法
      if (typeof window !== 'undefined') {
        (window as any).showMessage = undefined;
        (window as any).showSuccessMessage = undefined;
        (window as any).showErrorMessage = undefined;
        (window as any).showWarningMessage = undefined;
        (window as any).showInfoMessage = undefined;
        (window as any).clearMessage = undefined;
      }
    };
  }, []);

  // 移除特定消息
  const removeMessage = (id: string) => {
    setMessages(prev => prev.filter(msg => msg.id !== id));
  };

  // 使用Portal确保消息显示在最顶层
  return typeof window !== 'undefined'
    ? createPortal(
        <div className="message-container">
          {messages.map(({ id, content, type, duration }) => (
            <Message
              key={id}
              content={content}
              type={type}
              duration={duration}
              onClose={() => removeMessage(id)}
            />
          ))}
        </div>,
        document.body
      )
    : null;
};

// 扩展Window接口，添加全局消息方法
declare global {
  interface Window {
    showMessage: (content: string, type?: MessageType, duration?: number) => string;
    showSuccessMessage: (content: string, duration?: number) => string;
    showErrorMessage: (content: string, duration?: number) => string;
    showWarningMessage: (content: string, duration?: number) => string;
    showInfoMessage: (content: string, duration?: number) => string;
    clearMessage: (id?: string) => void;
  }
}

export default Message; 