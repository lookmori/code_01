import Link from "next/link";
import { getPythonTutorials } from '@/utils/tutorials';
import { Tutorial } from '@/types/learn';

export default function LearnPage() {
  // 在服务器组件中直接调用
  const tutorials = getPythonTutorials();
  
  return (
    <div className="container mx-auto px-4 py-12">
      <h1 className="text-3xl font-bold mb-8 text-gray-900 dark:text-white">Python学习课程</h1>
      
      {/* 搜索栏 */}
      <div className="relative max-w-md mx-auto mb-12">
        <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
          <svg className="w-4 h-4 text-gray-500 dark:text-gray-400" aria-hidden="true" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 20 20">
            <path stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="m19 19-4-4m0-7A7 7 0 1 1 1 8a7 7 0 0 1 14 0Z"/>
          </svg>
        </div>
        <input 
          type="search" 
          id="default-search" 
          className="block w-full p-4 pl-10 text-sm text-gray-900 border border-gray-300 rounded-lg bg-white focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-800 dark:border-gray-700 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500" 
          placeholder="搜索Python教程..." 
          required 
        />
        <button type="submit" className="absolute right-2.5 bottom-2.5 bg-blue-600 hover:bg-blue-700 focus:ring-4 focus:outline-none focus:ring-blue-300 font-medium rounded-lg text-sm px-4 py-2 text-white dark:bg-blue-500 dark:hover:bg-blue-600 dark:focus:ring-blue-700">搜索</button>
      </div>
      
      {/* 教程列表 */}
      <div className="grid md:grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
        {tutorials.map((tutorial) => (
          <div key={tutorial.slug} className="bg-white dark:bg-gray-800 rounded-lg overflow-hidden shadow-md hover:shadow-lg transition-shadow">
            <div className="p-5">
              <div className="flex justify-between items-center mb-2">
                <span className="bg-blue-100 text-blue-800 text-xs font-medium px-2.5 py-0.5 rounded dark:bg-blue-900 dark:text-blue-300">
                  {tutorial.level}
                </span>
                <span className="text-sm text-gray-500 dark:text-gray-400">
                  {new Date(tutorial.date).toLocaleDateString('zh-CN')}
                </span>
              </div>
              <h3 className="text-xl font-semibold mb-2 text-gray-900 dark:text-white">{tutorial.title}</h3>
              <p className="text-gray-600 dark:text-gray-300 mb-4">{tutorial.description}</p>
              <div className="flex flex-wrap gap-2 mb-4">
                {tutorial.tags.map((tag, index) => (
                  <span key={index} className="bg-gray-100 text-gray-800 text-xs font-medium px-2.5 py-0.5 rounded dark:bg-gray-700 dark:text-gray-300">
                    {tag}
                  </span>
                ))}
              </div>
              <Link
                href={`/learn/${tutorial.slug}`}
                className="w-full inline-block text-center px-4 py-2 bg-blue-600 text-white font-medium rounded-lg hover:bg-blue-700 transition-colors dark:bg-blue-500 dark:hover:bg-blue-600"
              >
                开始学习
              </Link>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
} 