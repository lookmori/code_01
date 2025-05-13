export default function TutorialLoading() {
  return (
    <div className="container mx-auto px-4 py-12 animate-pulse">
      <div className="max-w-4xl mx-auto">
        {/* 面包屑导航骨架 */}
        <nav className="flex mb-8 text-sm">
          <div className="bg-gray-200 dark:bg-gray-700 h-4 w-16 rounded"></div>
          <span className="mx-2 text-gray-300 dark:text-gray-600">/</span>
          <div className="bg-gray-200 dark:bg-gray-700 h-4 w-32 rounded"></div>
        </nav>
        
        {/* 教程标题和信息骨架 */}
        <div className="mb-8">
          <div className="bg-gray-200 dark:bg-gray-700 h-10 w-3/4 rounded mb-4"></div>
          <div className="flex flex-wrap items-center gap-4">
            <div className="bg-gray-200 dark:bg-gray-700 h-4 w-32 rounded"></div>
            <div className="bg-gray-200 dark:bg-gray-700 h-4 w-20 rounded"></div>
            <div className="flex flex-wrap gap-2">
              <div className="bg-gray-200 dark:bg-gray-700 h-4 w-16 rounded"></div>
              <div className="bg-gray-200 dark:bg-gray-700 h-4 w-20 rounded"></div>
              <div className="bg-gray-200 dark:bg-gray-700 h-4 w-24 rounded"></div>
            </div>
          </div>
        </div>
        
        {/* 教程内容骨架 */}
        <div className="space-y-4">
          <div className="bg-gray-200 dark:bg-gray-700 h-6 w-full rounded"></div>
          <div className="bg-gray-200 dark:bg-gray-700 h-4 w-full rounded"></div>
          <div className="bg-gray-200 dark:bg-gray-700 h-4 w-11/12 rounded"></div>
          <div className="bg-gray-200 dark:bg-gray-700 h-4 w-10/12 rounded"></div>
          <div className="bg-gray-200 dark:bg-gray-700 h-6 w-1/2 rounded mt-8"></div>
          <div className="bg-gray-200 dark:bg-gray-700 h-4 w-full rounded"></div>
          <div className="bg-gray-200 dark:bg-gray-700 h-4 w-11/12 rounded"></div>
          <div className="bg-gray-200 dark:bg-gray-700 h-32 w-full rounded"></div>
          <div className="bg-gray-200 dark:bg-gray-700 h-4 w-full rounded"></div>
          <div className="bg-gray-200 dark:bg-gray-700 h-4 w-10/12 rounded"></div>
          <div className="bg-gray-200 dark:bg-gray-700 h-6 w-2/3 rounded mt-8"></div>
          <div className="bg-gray-200 dark:bg-gray-700 h-4 w-full rounded"></div>
          <div className="bg-gray-200 dark:bg-gray-700 h-4 w-11/12 rounded"></div>
        </div>
        
        {/* 前后导航骨架 */}
        <div className="flex justify-between mt-12 pt-8 border-t border-gray-200 dark:border-gray-800">
          <div className="bg-gray-200 dark:bg-gray-700 h-6 w-32 rounded"></div>
          <div className="bg-gray-200 dark:bg-gray-700 h-6 w-32 rounded"></div>
        </div>
      </div>
    </div>
  );
} 