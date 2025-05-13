"use client";

import { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import { useTheme } from './ThemeProvider';
import { usePathname, useRouter } from 'next/navigation';
import { AuthService, UserInfo, AUTH_STATE_CHANGE_EVENT } from '@/services/auth.service';

export default function Navbar() {
  const { theme, toggleTheme } = useTheme();
  const pathname = usePathname();
  const router = useRouter();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [user, setUser] = useState<UserInfo | null>(null);
  
  // 使用ref引用菜单区域，用于检测点击是否在菜单外
  const userMenuRef = useRef<HTMLDivElement>(null);
  
  const navItems = [
    { label: '首页', href: '/' },
    { label: '在线练习', href: '/practice' },
    { label: '学习', href: '/learn' },
    { label: '关于', href: '/about' },
  ];

  // 获取用户头像首字母
  const getUserInitial = () => {
    if (!user) return '';
    
    if (user.username && user.username.trim()) {
      return user.username.trim()[0].toUpperCase();
    }
    
    if (user.email && user.email.trim()) {
      return user.email.trim()[0].toUpperCase();
    }
    
    return '?';
  };

  // 检查用户是否已登录
  useEffect(() => {
    const checkAuth = () => {
      const isAuth = AuthService.isAuthenticated();
      setIsLoggedIn(isAuth);
      
      if (isAuth) {
        setUser(AuthService.getCurrentUser());
      } else {
        setUser(null);
      }
    };
    
    // 初始检查
    checkAuth();
    
    // 添加认证状态变化事件监听器
    const handleAuthStateChange = (event: Event) => {
      console.log('认证状态变化:', (event as CustomEvent).detail);
      checkAuth();
    };
    
    // 添加存储事件监听器，以便在其他标签页中的登录/注销后更新状态
    const handleStorageChange = () => {
      checkAuth();
    };
    
    window.addEventListener(AUTH_STATE_CHANGE_EVENT, handleAuthStateChange);
    window.addEventListener('storage', handleStorageChange);
    
    return () => {
      window.removeEventListener(AUTH_STATE_CHANGE_EVENT, handleAuthStateChange);
      window.removeEventListener('storage', handleStorageChange);
    };
  }, []);
  
  // 处理点击页面其他地方关闭用户菜单
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (userMenuRef.current && !userMenuRef.current.contains(event.target as Node)) {
        setIsUserMenuOpen(false);
      }
    };
    
    // 只有当菜单打开时才添加点击事件监听器
    if (isUserMenuOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isUserMenuOpen]);

  // 处理登出
  const handleLogout = () => {
    try {
      // 调用认证服务的登出方法
      AuthService.logout();
      
      // 更新组件状态
      setIsLoggedIn(false);
      setUser(null);
      setIsUserMenuOpen(false);
      
      // 显示成功消息（如果全局消息组件可用）
      if (typeof window !== 'undefined' && window.showSuccessMessage) {
        window.showSuccessMessage('您已成功退出登录');
      }
      
      // 重定向到首页
      router.push('/');
    } catch (error) {
      console.error('退出登录失败:', error);
      // 显示错误消息（如果全局消息组件可用）
      if (typeof window !== 'undefined' && window.showErrorMessage) {
        window.showErrorMessage('退出登录时出现错误，请重试');
      }
    }
  };

  // 切换用户菜单
  const toggleUserMenu = () => {
    setIsUserMenuOpen(!isUserMenuOpen);
  };

  // 随机生成头像背景颜色，基于用户ID或邮箱
  const getAvatarBgColor = () => {
    if (!user) return 'bg-blue-500';
    
    // 使用用户ID或邮箱作为种子生成一致的颜色
    const seed = user.id || user.email;
    const colors = [
      'bg-blue-500', 'bg-green-500', 'bg-purple-500', 
      'bg-pink-500', 'bg-yellow-500', 'bg-red-500', 
      'bg-indigo-500', 'bg-teal-500'
    ];
    
    // 简单的哈希函数，为每个用户生成一致的颜色
    let hash = 0;
    for (let i = 0; i < seed.length; i++) {
      hash = seed.charCodeAt(i) + ((hash << 5) - hash);
    }
    
    const index = Math.abs(hash) % colors.length;
    return colors[index];
  };

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 bg-white dark:bg-gray-900 border-b border-gray-200 dark:border-gray-700 shadow-sm">
      <div className="max-w-screen-xl flex flex-wrap items-center justify-between mx-auto p-4">
        <Link 
          href="/" 
          className="flex items-center space-x-3 rtl:space-x-reverse"
        >
          <span className="self-center text-2xl font-semibold whitespace-nowrap dark:text-white">
            学习平台
          </span>
        </Link>
        
        {/* 主题切换和用户相关按钮 */}
        <div className="flex md:order-2 space-x-3 rtl:space-x-reverse items-center">
          <button
            type="button"
            onClick={toggleTheme}
            className="p-2 text-gray-500 rounded-lg hover:bg-gray-100 dark:text-gray-400 dark:hover:bg-gray-700"
            aria-label={theme === 'dark' ? '切换到浅色模式' : '切换到深色模式'}
          >
            {theme === 'dark' ? (
              <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg">
                <path d="M10 2a8 8 0 100 16 8 8 0 000-16zm0 14a6 6 0 110-12 6 6 0 010 12z"></path>
                <path d="M10 4a6 6 0 016 6c0 1.6-.64 3.06-1.68 4.13a.75.75 0 01-1.06-1.06A4.5 4.5 0 0014.5 10a4.5 4.5 0 00-4.5-4.5 4.5 4.5 0 00-4.5 4.5c0 1.22.5 2.32 1.3 3.12a.75.75 0 01-1.06 1.06A6 6 0 0110 4z"></path>
              </svg>
            ) : (
              <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg">
                <path d="M17.293 13.293A8 8 0 016.707 2.707a8.001 8.001 0 1010.586 10.586z"></path>
              </svg>
            )}
          </button>
          
          {/* 用户已登录 - 显示用户头像和菜单 */}
          {isLoggedIn && user ? (
            <div className="relative" ref={userMenuRef}>
              <button
                type="button"
                onClick={toggleUserMenu}
                className="flex items-center space-x-2 text-gray-900 focus:outline-none font-medium rounded-lg text-sm dark:text-white"
                aria-expanded={isUserMenuOpen}
              >
                <div className={`flex items-center justify-center w-9 h-9 rounded-full text-white ${getAvatarBgColor()}`}>
                  {getUserInitial()}
                </div>
              </button>
              
              {/* 用户下拉菜单 */}
              {isUserMenuOpen && (
                <div className="absolute right-0 mt-2 w-48 bg-white divide-y divide-gray-100 rounded-lg shadow dark:bg-gray-700 dark:divide-gray-600">
                  <div className="px-4 py-3 text-sm text-gray-900 dark:text-white">
                    <div className="flex items-center space-x-2 mb-2">
                      <div className={`flex items-center justify-center w-10 h-10 rounded-full text-white ${getAvatarBgColor()}`}>
                        {getUserInitial()}
                      </div>
                      <div>
                        <div className="font-medium">{user.username || '用户'}</div>
                        <div className="text-xs truncate">{user.email}</div>
                      </div>
                    </div>
                  </div>
                  <ul className="py-2 text-sm text-gray-700 dark:text-gray-200">
                    <li>
                      <Link href="/profile/settings" className="block px-4 py-2 hover:bg-gray-100 dark:hover:bg-gray-600 dark:hover:text-white">
                        个人设置
                      </Link>
                    </li>
                  </ul>
                  <div className="py-2">
                    <button
                      onClick={handleLogout}
                      className="block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 dark:hover:bg-gray-600 dark:text-gray-200 dark:hover:text-white"
                    >
                      退出登录
                    </button>
                  </div>
                </div>
              )}
            </div>
          ) : (
            <>
              {/* 用户未登录 - 显示登录注册按钮 */}
              <Link
                href="/login"
                className="text-white bg-blue-700 hover:bg-blue-800 focus:ring-4 focus:outline-none focus:ring-blue-300 font-medium rounded-lg text-sm px-4 py-2 text-center dark:bg-blue-600 dark:hover:bg-blue-700 dark:focus:ring-blue-800"
              >
                登录
              </Link>
              <Link
                href="/register"
                className="text-gray-900 bg-white border border-gray-300 focus:outline-none hover:bg-gray-100 focus:ring-4 focus:ring-gray-200 font-medium rounded-lg text-sm px-4 py-2 dark:bg-gray-800 dark:text-white dark:border-gray-600 dark:hover:bg-gray-700 dark:hover:border-gray-600 dark:focus:ring-gray-700"
              >
                注册
              </Link>
            </>
          )}
          
          {/* 移动端菜单按钮 */}
          <button
            type="button"
            onClick={() => setIsMenuOpen(!isMenuOpen)}
            className="inline-flex items-center p-2 w-10 h-10 justify-center text-sm text-gray-500 rounded-lg md:hidden hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-gray-200 dark:text-gray-400 dark:hover:bg-gray-700 dark:focus:ring-gray-600"
            aria-controls="navbar-main"
            aria-expanded={isMenuOpen}
          >
            <span className="sr-only">打开主菜单</span>
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6h16M4 12h16M4 18h16"></path>
            </svg>
          </button>
        </div>
        
        {/* 导航链接 */}
        <div
          className={`${
            isMenuOpen ? 'block' : 'hidden'
          } w-full md:block md:w-auto`}
          id="navbar-main"
        >
          <ul className="flex flex-col p-4 md:p-0 mt-4 font-medium border border-gray-100 rounded-lg bg-gray-50 md:flex-row md:space-x-8 md:mt-0 md:border-0 md:bg-white dark:bg-gray-800 md:dark:bg-gray-900 dark:border-gray-700">
            {navItems.map((item) => (
              <li key={item.href}>
                <Link
                  href={item.href}
                  className={`block py-2 px-3 rounded ${
                    pathname === item.href
                      ? 'text-white bg-blue-700 md:bg-transparent md:text-blue-700 md:dark:text-blue-500'
                      : 'text-gray-900 hover:bg-gray-100 md:hover:bg-transparent md:hover:text-blue-700 md:dark:hover:text-blue-500 dark:text-white dark:hover:bg-gray-700 dark:hover:text-white md:dark:hover:bg-transparent dark:border-gray-700'
                  }`}
                  aria-current={pathname === item.href ? 'page' : undefined}
                >
                  {item.label}
                </Link>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </nav>
  );
} 