"use client";

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { AuthService } from '@/services/auth.service';

export default function LoginPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    remember: false
  });

  const [errors, setErrors] = useState<{
    email?: string;
    password?: string;
    form?: string;
  }>({});

  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [registrationSuccess, setRegistrationSuccess] = useState(false);
  const [sessionExpired, setSessionExpired] = useState(false);

  // 获取重定向参数
  const redirect = searchParams.get('redirect') || '/';

  // 检查是否已登录，如果已登录则重定向到首页
  useEffect(() => {
    if (AuthService.isAuthenticated()) {
      router.push('/');
    }
  }, [router]);

  // 检查URL参数
  useEffect(() => {
    // 检查是否刚注册成功
    if (searchParams.get('registered') === 'true') {
      setRegistrationSuccess(true);
    }
    
    // 检查会话是否过期
    if (searchParams.get('expired') === 'true') {
      setSessionExpired(true);
      setErrors({
        form: '您的登录状态已过期，请重新登录'
      });
    }
  }, [searchParams]);

  const validateEmail = (email: string) => {
    const emailRegex = /^[a-zA-Z0-9._-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,6}$/;
    return emailRegex.test(email);
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
    
    // 清除对应字段的错误信息
    if (errors[name as keyof typeof errors]) {
      setErrors(prev => ({
        ...prev,
        [name]: undefined
      }));
    }

    // 清除会话过期信息
    if (sessionExpired) {
      setSessionExpired(false);
    }

    // 实时验证邮箱格式
    if (name === 'email' && value.trim() !== '') {
      if (!validateEmail(value)) {
        setErrors(prev => ({
          ...prev,
          email: '邮箱格式不正确'
        }));
      }
    }
  };

  const validate = () => {
    const newErrors: {
      email?: string;
      password?: string;
    } = {};

    if (!formData.email.trim()) {
      newErrors.email = '邮箱不能为空';
    } else if (!validateEmail(formData.email)) {
      newErrors.email = '邮箱格式不正确';
    }

    if (!formData.password) {
      newErrors.password = '密码不能为空';
    } else if (formData.password.length < 6) {
      newErrors.password = '密码长度至少为6位';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // 切换密码显示/隐藏
  const togglePasswordVisibility = () => {
    setShowPassword(!showPassword);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (validate()) {
      setIsLoading(true);
      setErrors({});
      setRegistrationSuccess(false);
      setSessionExpired(false);

      try {
        // 调用登录服务
        const response = await AuthService.login(formData);

        if (response.success) {
          // 登录成功，重定向到指定页面或首页
          router.push(redirect);
        } else {
          // 显示错误信息
          setErrors({
            form: response.error || '登录失败，请检查您的邮箱和密码'
          });
        }
      } catch (error) {
        console.error('登录错误:', error);
        setErrors({
          form: '登录过程中发生错误，请稍后再试'
        });
      } finally {
        setIsLoading(false);
      }
    }
  };

  return (
    <div className="container mx-auto px-4 py-12">
      <div className="max-w-md mx-auto bg-white dark:bg-gray-800 rounded-lg shadow-md overflow-hidden">
        <div className="py-6 px-8">
          <h2 className="text-2xl font-bold text-center mb-6 text-gray-900 dark:text-white">登录</h2>
          
          {registrationSuccess && (
            <div className="p-3 mb-4 text-sm text-green-700 bg-green-100 rounded-lg dark:bg-green-900 dark:text-green-300">
              注册成功！请使用您的新账号登录。
            </div>
          )}
          
          {sessionExpired && (
            <div className="p-3 mb-4 text-sm text-amber-700 bg-amber-100 rounded-lg dark:bg-amber-900 dark:text-amber-300">
              您的登录状态已过期，请重新登录。
            </div>
          )}
          
          {errors.form && (
            <div className="p-3 mb-4 text-sm text-red-700 bg-red-100 rounded-lg dark:bg-red-900 dark:text-red-300">
              {errors.form}
            </div>
          )}
          
          <form onSubmit={handleSubmit} noValidate>
            <div className="mb-4">
              <label 
                htmlFor="email" 
                className="block mb-2 text-sm font-medium text-gray-900 dark:text-white"
              >
                邮箱
              </label>
              <input 
                type="email" 
                id="email" 
                name="email"
                value={formData.email}
                onChange={handleChange}
                onBlur={() => {
                  if (formData.email.trim() && !validateEmail(formData.email)) {
                    setErrors(prev => ({ ...prev, email: '邮箱格式不正确' }));
                  }
                }}
                className={`bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500 ${errors.email ? 'border-red-500 dark:border-red-500' : ''}`}
                placeholder="name@example.com" 
                disabled={isLoading}
              />
              {errors.email && (
                <p className="mt-1 text-sm text-red-600 dark:text-red-500">{errors.email}</p>
              )}
            </div>
            
            <div className="mb-4">
              <label 
                htmlFor="password" 
                className="block mb-2 text-sm font-medium text-gray-900 dark:text-white"
              >
                密码
              </label>
              <div className="relative">
                <input 
                  type={showPassword ? "text" : "password"}
                  id="password" 
                  name="password"
                  value={formData.password}
                  onChange={handleChange}
                  className={`bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500 ${errors.password ? 'border-red-500 dark:border-red-500' : ''}`}
                  placeholder="请输入密码"
                  disabled={isLoading}
                />
                <button 
                  type="button"
                  className="absolute inset-y-0 right-0 pr-3 flex items-center"
                  onClick={togglePasswordVisibility}
                >
                  {showPassword ? (
                    <svg className="h-5 w-5 text-gray-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7A9.97 9.97 0 014.02 8.971m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21" />
                    </svg>
                  ) : (
                    <svg className="h-5 w-5 text-gray-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                    </svg>
                  )}
                </button>
              </div>
              {errors.password && (
                <p className="mt-1 text-sm text-red-600 dark:text-red-500">{errors.password}</p>
              )}
            </div>
            
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center">
                <input 
                  id="remember" 
                  type="checkbox" 
                  name="remember"
                  checked={formData.remember}
                  onChange={handleChange}
                  className="w-4 h-4 border border-gray-300 rounded bg-gray-50 focus:ring-3 focus:ring-blue-300 dark:bg-gray-700 dark:border-gray-600 dark:focus:ring-blue-600 dark:ring-offset-gray-800" 
                  disabled={isLoading}
                />
                <label 
                  htmlFor="remember" 
                  className="ml-2 text-sm font-medium text-gray-900 dark:text-gray-300"
                >
                  记住我
                </label>
              </div>
              <a 
                href="#" 
                className="text-sm text-blue-600 hover:underline dark:text-blue-500"
              >
                忘记密码？
              </a>
            </div>
            
            <button 
              type="submit" 
              className="w-full text-white bg-blue-600 hover:bg-blue-700 focus:ring-4 focus:outline-none focus:ring-blue-300 font-medium rounded-lg text-sm px-5 py-2.5 text-center dark:bg-blue-500 dark:hover:bg-blue-600 dark:focus:ring-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
              disabled={isLoading}
            >
              {isLoading ? '登录中...' : '登录'}
            </button>
            
            <div className="text-sm font-medium text-gray-500 dark:text-gray-300 mt-4 text-center">
              还没有账号？ 
              <Link 
                href="/register" 
                className="text-blue-600 hover:underline dark:text-blue-500 ml-1"
              >
                注册
              </Link>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
} 