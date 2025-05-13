export default function PracticeLoading() {
  return (
    <div className="container mx-auto px-4 py-8">
      {/* 标题骨架 */}
      <div className="h-8 w-56 bg-gray-200 dark:bg-gray-700 rounded animate-pulse mb-8"></div>
      
      {/* 搜索区域骨架 */}
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6 mb-8">
        <div className="mb-4">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-grow">
              <div className="h-10 bg-gray-200 dark:bg-gray-700 rounded animate-pulse"></div>
            </div>
            <div>
              <div className="h-10 w-24 bg-gray-200 dark:bg-gray-700 rounded animate-pulse"></div>
            </div>
          </div>
        </div>
      </div>
      
      {/* 问题列表骨架 */}
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm text-left text-gray-500 dark:text-gray-400">
            <thead className="text-xs text-gray-700 uppercase bg-gray-50 dark:bg-gray-700 dark:text-gray-400">
              <tr>
                <th scope="col" className="px-6 py-3">状态</th>
                <th scope="col" className="px-6 py-3">题目</th>
                <th scope="col" className="px-6 py-3">难度</th>
                <th scope="col" className="px-6 py-3">标签</th>
              </tr>
            </thead>
            <tbody>
              {Array.from({ length: 10 }).map((_, i) => (
                <tr 
                  key={i} 
                  className="bg-white border-b dark:bg-gray-800 dark:border-gray-700"
                >
                  <td className="px-6 py-4">
                    <div className="h-6 w-6 bg-gray-200 dark:bg-gray-700 rounded-full animate-pulse"></div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="h-5 w-48 bg-gray-200 dark:bg-gray-700 rounded animate-pulse"></div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="h-5 w-16 bg-gray-200 dark:bg-gray-700 rounded-full animate-pulse"></div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex flex-wrap gap-1">
                      {Array.from({ length: Math.floor(Math.random() * 3) + 1 }).map((_, j) => (
                        <div 
                          key={j} 
                          className="h-5 w-16 bg-gray-200 dark:bg-gray-700 rounded-full animate-pulse"
                        ></div>
                      ))}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
      
      {/* 分页骨架 */}
      <div className="flex space-x-2 justify-center mt-6">
        {Array.from({ length: 5 }).map((_, i) => (
          <div 
            key={i} 
            className="h-8 w-8 bg-gray-200 dark:bg-gray-700 rounded animate-pulse"
          ></div>
        ))}
      </div>
    </div>
  );
} 