"use client";

import { useState, useEffect } from 'react';
import dynamic from 'next/dynamic';
import { loader } from '@monaco-editor/react';

// 配置Monaco编辑器从本地加载资源而不是CDN
loader.config({
  paths: {
    vs: '/monaco-editor/min/vs'
  }
});

// 动态导入Monaco编辑器以避免服务端渲染问题
const MonacoEditor = dynamic(() => import('@monaco-editor/react'), {
  ssr: false,
  loading: () => (
    <div className="flex items-center justify-center h-full w-full bg-gray-100 dark:bg-gray-700 rounded-md">
      <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
    </div>
  )
});

interface CodeEditorProps {
  defaultValue?: string;
  language?: string;
  theme?: 'vs-dark' | 'light';
  onChange?: (value: string | undefined) => void;
  disableLanguageSelector?: boolean;
  value?: string;
  height?: string;
}

// 支持的编程语言
const SUPPORTED_LANGUAGES = [
  { id: 'javascript', name: 'JavaScript' },
  { id: 'typescript', name: 'TypeScript' },
  { id: 'python', name: 'Python' },
  { id: 'java', name: 'Java' },
  { id: 'c', name: 'C' },
  { id: 'cpp', name: 'C++' },
  { id: 'csharp', name: 'C#' },
  { id: 'go', name: 'Go' },
  { id: 'rust', name: 'Rust' },
];

// 不同语言的默认代码模板
const DEFAULT_CODE_TEMPLATES: Record<string, string> = {
  javascript: `// 请在这里编写您的JavaScript代码
function solution(input) {
  // 实现您的解决方案
  return;
}
`,
  typescript: `// 请在这里编写您的TypeScript代码
function solution(input: any): any {
  // 实现您的解决方案
  return;
}
`,
  python: `# 请在这里编写您的Python代码解决方案

def solution(nums, target):
    """
    解决 "两数之和" 问题的函数
    
    参数:
        nums: List[int] - 输入的整数数组
        target: int - 目标和
        
    返回:
        List[int] - 包含两个整数的列表，表示和为target的两个数的索引
        
    示例:
        >>> solution([2, 7, 11, 15], 9)
        [0, 1]
    """
    # 请在此处实现您的解决方案
    # 提示: 考虑使用哈希表来提高查找效率
    
    # 补全代码
    seen = {}  # 值 -> 索引
    
    for i, num in enumerate(nums):
        complement = target - num
        if complement in seen:
            return [seen[complement], i]
        seen[num] = i
    
    return []  # 如果没有找到解，返回空列表

# 测试您的解决方案
if __name__ == "__main__":
    # 您可以在这里添加测试用例
    test_nums = [2, 7, 11, 15]
    test_target = 9
    print(f"输入: nums = {test_nums}, target = {test_target}")
    print(f"输出: {solution(test_nums, test_target)}")
`,
  java: `// 请在这里编写您的Java代码
public class Solution {
    public static void main(String[] args) {
        // 可以在这里测试您的解决方案
    }
    
    public static Object solution(Object input) {
        // 实现您的解决方案
        return null;
    }
}
`,
  c: `// 请在这里编写您的C代码
#include <stdio.h>

// 实现您的解决方案
void solution() {
    // 实现您的代码
}

int main() {
    solution();
    return 0;
}
`,
  cpp: `// 请在这里编写您的C++代码
#include <iostream>
#include <vector>
using namespace std;

// 实现您的解决方案
void solution() {
    // 实现您的代码
}

int main() {
    solution();
    return 0;
}
`,
  csharp: `// 请在这里编写您的C#代码
using System;

public class Solution
{
    public static void Main()
    {
        // 可以在这里测试您的解决方案
    }
    
    public static object Solve(object input)
    {
        // 实现您的解决方案
        return null;
    }
}
`,
  go: `// 请在这里编写您的Go代码
package main

import "fmt"

func solution() interface{} {
    // 实现您的解决方案
    return nil
}

func main() {
    result := solution()
    fmt.Println(result)
}
`,
  rust: `// 请在这里编写您的Rust代码
fn solution() -> Option<String> {
    // 实现您的解决方案
    None
}

fn main() {
    println!("{:?}", solution());
}
`,
};

export default function CodeEditor({
  defaultValue = '',
  language = 'javascript',
  theme = 'vs-dark',
  onChange,
  disableLanguageSelector = false,
  value,
  height,
}: CodeEditorProps) {
  const [selectedLanguage, setSelectedLanguage] = useState(language);
  const [editorTheme, setEditorTheme] = useState<'vs-dark' | 'light'>(theme);
  const [code, setCode] = useState(value || defaultValue || DEFAULT_CODE_TEMPLATES[language] || '');
  
  // 监听value属性变化
  useEffect(() => {
    if (value !== undefined) {
      setCode(value);
    }
  }, [value]);
  
  // 检测系统主题变化
  useEffect(() => {
    const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
    
    const handleChange = (e: MediaQueryListEvent) => {
      setEditorTheme(e.matches ? 'vs-dark' : 'light');
    };
    
    mediaQuery.addEventListener('change', handleChange);
    
    // 初始设置
    setEditorTheme(mediaQuery.matches ? 'vs-dark' : 'light');
    
    return () => {
      mediaQuery.removeEventListener('change', handleChange);
    };
  }, []);
  
  // 当用户切换语言时更新代码模板
  const handleLanguageChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const newLanguage = e.target.value;
    setSelectedLanguage(newLanguage);
    // 如果代码是空的或者是默认模板，则切换到新语言的默认模板
    if (!code || Object.values(DEFAULT_CODE_TEMPLATES).includes(code)) {
      const newTemplate = DEFAULT_CODE_TEMPLATES[newLanguage] || '';
      setCode(newTemplate);
      onChange?.(newTemplate);
    }
  };
  
  // 切换编辑器主题
  const toggleEditorTheme = () => {
    const newTheme = editorTheme === 'vs-dark' ? 'light' : 'vs-dark';
    setEditorTheme(newTheme);
  };
  
  // 处理编辑器内容变化
  const handleEditorChange = (value: string | undefined) => {
    setCode(value || '');
    onChange?.(value);
  };
  
  // 重置代码到默认模板
  const resetCode = () => {
    const defaultTemplate = DEFAULT_CODE_TEMPLATES[selectedLanguage] || '';
    setCode(defaultTemplate);
    onChange?.(defaultTemplate);
  };
  
  return (
    <div className="flex flex-col h-[600px] bg-white dark:bg-gray-800 rounded-lg shadow-lg overflow-hidden" style={{ height: height || '600px' }}>
      {/* 编辑器工具栏 */}
      <div className="flex justify-between items-center p-4 bg-gray-100 dark:bg-gray-700 border-b border-gray-200 dark:border-gray-600">
        <div className="flex items-center space-x-2">
          {!disableLanguageSelector ? (
            <select
              value={selectedLanguage}
              onChange={handleLanguageChange}
              className="bg-white dark:bg-gray-800 text-gray-900 dark:text-white text-sm rounded-lg border border-gray-300 dark:border-gray-600 focus:ring-blue-500 focus:border-blue-500 p-2"
            >
              {SUPPORTED_LANGUAGES.map(lang => (
                <option key={lang.id} value={lang.id}>
                  {lang.name}
                </option>
              ))}
            </select>
          ) : (
            <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
              Python
            </span>
          )}
          
          <button
            onClick={resetCode}
            className="text-gray-700 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white bg-transparent hover:bg-gray-200 dark:hover:bg-gray-600 rounded-lg p-2 text-sm"
            title="重置代码"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"></path>
            </svg>
          </button>
        </div>
        
        <button
          onClick={toggleEditorTheme}
          className="text-gray-700 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white bg-transparent hover:bg-gray-200 dark:hover:bg-gray-600 rounded-lg p-2 text-sm"
          title={editorTheme === 'vs-dark' ? '切换到浅色主题' : '切换到深色主题'}
        >
          {editorTheme === 'vs-dark' ? (
            <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg">
              <path d="M10 2a8 8 0 100 16 8 8 0 000-16zm0 14a6 6 0 110-12 6 6 0 010 12z"></path>
            </svg>
          ) : (
            <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg">
              <path d="M17.293 13.293A8 8 0 016.707 2.707a8.001 8.001 0 1010.586 10.586z"></path>
            </svg>
          )}
        </button>
      </div>
      
      {/* 编辑器主体 */}
      <div className="flex-grow">
        <MonacoEditor
          height="100%"
          language={selectedLanguage}
          theme={editorTheme}
          value={code}
          onChange={handleEditorChange}
          options={{
            fontFamily: 'Menlo, Monaco, "Courier New", monospace',
            fontSize: 14,
            minimap: {
              enabled: true,
            },
            scrollBeyondLastLine: false,
            automaticLayout: true,
            tabSize: 2,
            wordWrap: 'on',
            suggest: {
              showKeywords: true,
              showSnippets: true,
              showClasses: true,
              showFunctions: true,
              showVariables: true,
            },
            suggestSelection: 'first',
            parameterHints: {
              enabled: true,
            },
            quickSuggestions: {
              other: true,
              comments: true,
              strings: true,
            },
            formatOnType: true,
            formatOnPaste: true,
            autoIndent: 'full',
            acceptSuggestionOnEnter: 'on',
            folding: true,
            renderLineHighlight: 'all',
            matchBrackets: 'always',
            autoClosingBrackets: 'always',
            autoClosingQuotes: 'always',
            autoClosingDelete: 'always',
            cursorBlinking: 'blink',
            mouseWheelZoom: true,
          }}
        />
      </div>
    </div>
  );
} 