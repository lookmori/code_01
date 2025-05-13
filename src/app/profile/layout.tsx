"use client";

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { AuthService } from '@/services/auth.service';
import Link from 'next/link';

export default function ProfileLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const router = useRouter();
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // 检查用户是否已登录
    const checkAuth = () => {
      const isAuth = AuthService.isAuthenticated();
      setIsAuthenticated(isAuth);
      setIsLoading(false);

      if (!isAuth) {
        // 如果未登录，重定向到登录页面
        router.push('/login?redirect=/profile/settings');
      }
    };

    checkAuth();
  }, [router]);

  // 如果正在加载或未认证，显示加载状态
  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-100 dark:bg-gray-900">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-blue-500 mb-4"></div>
          <p className="text-gray-700 dark:text-gray-300">正在加载...</p>
        </div>
      </div>
    );
  }

  // 如果未认证，不渲染任何内容（因为会被重定向）
  if (!isAuthenticated) {
    return null;
  }

  // 如果已认证，显示页面内容
  return (
    <div className="flex flex-col min-h-screen bg-gray-50 dark:bg-gray-900">
      {/* 页面内容 */}
      <main className="flex-grow">
        {children}
      </main>
    </div>
  );
} 