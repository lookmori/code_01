import { useState } from 'react';
import Prism from 'prismjs';
import 'prismjs/themes/prism-tomorrow.css';
import 'prismjs/components/prism-javascript';
import 'prismjs/components/prism-python';
import 'prismjs/components/prism-java';
import 'prismjs/components/prism-c';
import 'prismjs/components/prism-cpp';
import 'prismjs/components/prism-csharp';

interface CodeBlockProps {
  code: string;
  language: string;
}

export default function CodeBlock({ code, language }: CodeBlockProps) {
  const [copied, setCopied] = useState(false);
  
  // 复制代码到剪贴板
  const copyToClipboard = () => {
    navigator.clipboard.writeText(code).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    });
  };
  
  // 处理语言格式
  const getLanguage = () => {
    // 映射语言名称到Prism支持的格式
    const langMap: Record<string, string> = {
      'javascript': 'javascript',
      'js': 'javascript',
      'python': 'python',
      'py': 'python',
      'java': 'java',
      'c': 'c',
      'cpp': 'cpp',
      'c++': 'cpp',
      'csharp': 'csharp',
      'c#': 'csharp'
    };
    
    return langMap[language.toLowerCase()] || 'javascript';
  };
  
  // 高亮代码
  const highlight = () => {
    if (typeof window !== 'undefined') {
      const html = Prism.highlight(
        code,
        Prism.languages[getLanguage()],
        getLanguage()
      );
      return html;
    }
    return code;
  };

  return (
    <div className="relative font-mono text-sm rounded-md overflow-hidden bg-gray-800">
      <div className="flex items-center justify-between p-2 bg-gray-900 text-xs text-gray-400">
        <span>{language.toUpperCase()}</span>
        <button
          onClick={copyToClipboard}
          className="text-gray-300 hover:text-white transition-colors"
        >
          {copied ? (
            <span className="flex items-center">
              <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path>
              </svg>
              已复制
            </span>
          ) : (
            <span className="flex items-center">
              <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 5H6a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2v-1M8 5a2 2 0 002 2h2a2 2 0 002-2M8 5a2 2 0 012-2h2a2 2 0 012 2m0 0h2a2 2 0 012 2v3m2 4H10m0 0l3-3m-3 3l3 3"></path>
              </svg>
              复制代码
            </span>
          )}
        </button>
      </div>
      <div className="p-4 overflow-x-auto">
        <pre className="whitespace-pre-wrap">
          <code 
            dangerouslySetInnerHTML={{ __html: highlight() }}
            className={`language-${getLanguage()}`}
          />
        </pre>
      </div>
    </div>
  );
} 