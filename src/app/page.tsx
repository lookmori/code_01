"use client";

import Image from "next/image";
import Link from "next/link";
import { useState } from "react";

export default function Home() {
  const [imageError, setImageError] = useState(false);
  
  return (
    <div className="container mx-auto px-4 py-8">
      {/* 英雄部分 */}
      <section className="py-12 md:py-20 text-center md:text-left">
        <div className="grid md:grid-cols-2 gap-8 items-center">
          <div className="flex flex-col gap-6">
            <h1 className="text-4xl md:text-5xl font-bold text-gray-900 dark:text-white">
              探索知识的<span className="text-blue-600 dark:text-blue-500">无限可能</span>
            </h1>
            <p className="text-lg text-gray-600 dark:text-gray-300">
              欢迎来到我们的学习平台，这里为您提供全面的在线学习资源、练习和工具，帮助您实现学习目标。
            </p>
            <div className="flex flex-col sm:flex-row gap-4 mt-2">
              <Link
                href="/learn"
                className="px-6 py-3 bg-blue-600 text-white font-medium rounded-lg hover:bg-blue-700 transition-colors dark:bg-blue-500 dark:hover:bg-blue-600"
              >
                开始学习
              </Link>
              <Link
                href="/practice"
                className="px-6 py-3 bg-white text-gray-800 font-medium rounded-lg border border-gray-300 hover:bg-gray-100 transition-colors dark:bg-gray-800 dark:text-white dark:border-gray-600 dark:hover:bg-gray-700"
              >
                在线练习
              </Link>
            </div>
          </div>
          <div className="hidden md:block">
            {!imageError ? (
        <Image
                src="/hero-image.svg"
                alt="学习插图"
                width={500}
                height={400}
                className="mx-auto"
          priority
                onError={() => setImageError(true)}
              />
            ) : null}
          </div>
        </div>
      </section>

      {/* 特色内容部分 */}
      <section className="py-12 md:py-16">
        <h2 className="text-3xl font-bold text-center mb-12 text-gray-900 dark:text-white">
          我们的特色
        </h2>
        <div className="grid md:grid-cols-3 gap-8">
          {/* 特色一 */}
          <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-md hover:shadow-lg transition-shadow">
            <div className="w-12 h-12 bg-blue-100 dark:bg-blue-900 rounded-full flex items-center justify-center mb-4">
              <svg className="w-6 h-6 text-blue-600 dark:text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13c-1.168-.776-2.754-1.253-4.5-1.253-1.746 0-3.332.477-4.5 1.253"></path>
              </svg>
            </div>
            <h3 className="text-xl font-semibold mb-2 text-gray-900 dark:text-white">丰富的课程资源</h3>
            <p className="text-gray-600 dark:text-gray-300">
              提供多种学科和领域的学习内容，满足不同学习需求。从基础知识到高级技能，应有尽有。
            </p>
          </div>

          {/* 特色二 */}
          <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-md hover:shadow-lg transition-shadow">
            <div className="w-12 h-12 bg-green-100 dark:bg-green-900 rounded-full flex items-center justify-center mb-4">
              <svg className="w-6 h-6 text-green-600 dark:text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01"></path>
              </svg>
            </div>
            <h3 className="text-xl font-semibold mb-2 text-gray-900 dark:text-white">互动练习系统</h3>
            <p className="text-gray-600 dark:text-gray-300">
              通过实践巩固所学知识，我们的练习系统提供即时反馈和个性化的学习建议。
            </p>
          </div>

          {/* 特色三 */}
          <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-md hover:shadow-lg transition-shadow">
            <div className="w-12 h-12 bg-purple-100 dark:bg-purple-900 rounded-full flex items-center justify-center mb-4">
              <svg className="w-6 h-6 text-purple-600 dark:text-purple-400" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z"></path>
              </svg>
            </div>
            <h3 className="text-xl font-semibold mb-2 text-gray-900 dark:text-white">社区互动学习</h3>
            <p className="text-gray-600 dark:text-gray-300">
              加入我们的学习社区，与志同道合的学习者交流分享，一起进步，共同成长。
            </p>
          </div>
        </div>
      </section>

      {/* 开始学习号召 */}
      <section className="py-12 md:py-16 bg-gray-50 dark:bg-gray-900 rounded-xl my-8 p-8">
        <div className="text-center">
          <h2 className="text-3xl font-bold mb-4 text-gray-900 dark:text-white">准备好开始您的学习之旅了吗？</h2>
          <p className="text-lg text-gray-600 dark:text-gray-300 mb-8 max-w-2xl mx-auto">
            立即加入成千上万的学习者，开启您的知识探索之旅，提升自我，实现目标。
          </p>
          <Link
            href="/register"
            className="px-8 py-4 bg-blue-600 text-white font-medium rounded-lg hover:bg-blue-700 transition-colors dark:bg-blue-500 dark:hover:bg-blue-600"
          >
            立即注册
          </Link>
        </div>
      </section>
    </div>
  );
}
