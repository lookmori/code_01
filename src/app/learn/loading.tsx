export default function LearnLoading() {
  return (
    <div className="w-full py-12">
      <div className="container mx-auto px-4">
        <div className="animate-pulse">
          {/* 页面标题骨架 */}
          <div className="h-10 w-1/3 bg-gray-200 dark:bg-gray-700 rounded mb-8"></div>
          
          {/* 筛选栏骨架 */}
          <div className="flex flex-wrap gap-4 mb-10">
            <div className="h-10 w-32 bg-gray-200 dark:bg-gray-700 rounded"></div>
            <div className="h-10 w-40 bg-gray-200 dark:bg-gray-700 rounded"></div>
            <div className="h-10 w-36 bg-gray-200 dark:bg-gray-700 rounded"></div>
          </div>
          
          {/* 课程卡片骨架 */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {[...Array(8)].map((_, i) => (
              <div 
                key={i} 
                className="bg-white dark:bg-gray-800 rounded-lg overflow-hidden shadow-sm"
              >
                {/* 图片骨架 */}
                <div className="h-48 bg-gray-200 dark:bg-gray-700"></div>
                <div className="p-4">
                  {/* 标题骨架 */}
                  <div className="h-6 bg-gray-200 dark:bg-gray-700 rounded w-5/6 mb-3"></div>
                  {/* 描述骨架 */}
                  <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-full mb-2"></div>
                  <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-4/5 mb-4"></div>
                  {/* 标签骨架 */}
                  <div className="flex gap-2 mt-4">
                    <div className="h-6 w-16 bg-gray-200 dark:bg-gray-700 rounded-full"></div>
                    <div className="h-6 w-16 bg-gray-200 dark:bg-gray-700 rounded-full"></div>
                  </div>
                </div>
              </div>
            ))}
          </div>
          
          {/* 分页骨架 */}
          <div className="flex justify-center mt-12">
            <div className="flex gap-2">
              {[...Array(3)].map((_, i) => (
                <div key={i} className="h-10 w-10 bg-gray-200 dark:bg-gray-700 rounded"></div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
} 