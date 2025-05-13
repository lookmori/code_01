export default function ProblemDetailLoading() {
  return (
    <div className="container mx-auto px-4 py-8">
      {/* 返回链接骨架 */}
      <div className="mb-6">
        <div className="h-4 w-32 bg-gray-200 dark:bg-gray-700 rounded animate-pulse"></div>
      </div>
      
      {/* 标题和难度骨架 */}
      <div className="flex items-center justify-between mb-6">
        <div className="h-8 w-3/4 bg-gray-200 dark:bg-gray-700 rounded animate-pulse"></div>
        <div className="h-6 w-16 bg-gray-200 dark:bg-gray-700 rounded-full animate-pulse"></div>
      </div>
      
      {/* 标签列表骨架 */}
      <div className="flex flex-wrap gap-2 mb-6">
        {[1, 2, 3].map(i => (
          <div key={i} className="h-6 w-20 bg-gray-200 dark:bg-gray-700 rounded-full animate-pulse"></div>
        ))}
      </div>
      
      {/* 主要内容区骨架 */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* 问题描述区域骨架 */}
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md overflow-hidden">
          <div className="flex border-b border-gray-200 dark:border-gray-700">
            <div className="flex-1 py-3 px-4 h-10 bg-gray-100 dark:bg-gray-700"></div>
            <div className="flex-1 py-3 px-4 h-10 bg-gray-50 dark:bg-gray-600"></div>
          </div>
          
          <div className="p-6">
            <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded animate-pulse mb-4 w-full"></div>
            <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded animate-pulse mb-4 w-11/12"></div>
            <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded animate-pulse mb-4 w-3/4"></div>
            <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded animate-pulse mb-4 w-5/6"></div>
            <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded animate-pulse mb-6 w-2/3"></div>
            
            <div className="h-6 bg-gray-200 dark:bg-gray-700 rounded animate-pulse mb-4 w-1/4"></div>
            <div className="bg-gray-50 dark:bg-gray-900 p-4 rounded-md mb-2">
              <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded animate-pulse mb-2 w-1/6"></div>
              <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded animate-pulse w-1/2"></div>
            </div>
            <div className="bg-gray-50 dark:bg-gray-900 p-4 rounded-md">
              <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded animate-pulse mb-2 w-1/6"></div>
              <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded animate-pulse w-1/3"></div>
            </div>
          </div>
        </div>
        
        {/* 代码编辑器骨架 */}
        <div>
          <div className="h-[600px] bg-gray-200 dark:bg-gray-700 rounded animate-pulse"></div>
          <div className="mt-4 flex justify-end">
            <div className="h-10 w-24 bg-gray-200 dark:bg-gray-700 rounded animate-pulse"></div>
          </div>
        </div>
      </div>
    </div>
  );
} 