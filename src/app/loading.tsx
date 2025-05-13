"use client";

import React from 'react';

export default function Loading() {
  return (
    <div className="fixed inset-0 flex items-center justify-center bg-white/80 dark:bg-gray-900/80 z-50">
      <div className="flex flex-col items-center">
        <div className="relative w-16 h-16">
          <div className="absolute top-0 left-0 w-full h-full border-4 border-blue-100 dark:border-blue-900 rounded-full animate-ping opacity-75"></div>
          <div className="absolute top-0 left-0 w-full h-full border-4 border-t-blue-500 border-blue-200 dark:border-t-blue-400 dark:border-blue-800 rounded-full animate-spin"></div>
        </div>
        <p className="mt-4 text-lg font-medium text-gray-700 dark:text-gray-300">加载中...</p>
      </div>
    </div>
  );
} 