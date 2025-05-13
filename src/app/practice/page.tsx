"use client";

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { getPaginatedProblems, problemTags } from '@/data/mockProblems';
import { Problem, ProblemTag } from '@/types/practice';
import AdminFloatingButton from '@/components/AdminFloatingButton';
import { AuthService } from '@/services/auth.service';
import { ProblemService } from '@/services/problem.service';
import { UserRole } from '@/types/user';

// 扩展问题类型，添加API返回的字段
interface ProblemWithStatus extends Problem {
  problem_name?: string; // API返回的字段
  problem_description?: string; // API返回的字段
  example_input?: string; // API返回的字段
  example_output?: string; // API返回的字段
  ques_tag?: string[]; // API返回的字段
  published_at?: string; // API返回的字段
  status?: string; // API返回的状态字段
  difficulty?: string; // 难度字段
}

export default function PracticePage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [problems, setProblems] = useState<ProblemWithStatus[]>([]);
  const [filteredProblems, setFilteredProblems] = useState<ProblemWithStatus[]>([]);
  const [allProblems, setAllProblems] = useState<ProblemWithStatus[]>([]);
  const [totalProblems, setTotalProblems] = useState(0);
  const [currentPage, setCurrentPage] = useState(1);
  const [searchTerm, setSearchTerm] = useState('');
  const [pageSize] = useState(10);
  const [isSearching, setIsSearching] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isAdmin, setIsAdmin] = useState(false);

  // 难度映射
  const difficultyMap = {
    easy: { label: '简单', color: 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300' },
    medium: { label: '中等', color: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300' },
    hard: { label: '困难', color: 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300' }
  };
  
  // 标签颜色映射
  const tagColorMap: Record<string, string> = {
    blue: 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300',
    green: 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300',
    red: 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300',
    purple: 'bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-300',
    orange: 'bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-300',
    cyan: 'bg-cyan-100 text-cyan-800 dark:bg-cyan-900 dark:text-cyan-300',
    teal: 'bg-teal-100 text-teal-800 dark:bg-teal-900 dark:text-teal-300',
    pink: 'bg-pink-100 text-pink-800 dark:bg-pink-900 dark:text-pink-300',
    indigo: 'bg-indigo-100 text-indigo-800 dark:bg-indigo-900 dark:text-indigo-300',
    yellow: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300',
  };

  // 状态映射
  const statusMap: Record<string, { label: string, color: string }> = {
    correct: { label: '正确', color: 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300' },
    incorrect: { label: '错误', color: 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300' },
    pending: { label: '等待中', color: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300' },
    not_attempted: { label: '未尝试', color: 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300' }
  };

  // 检查用户状态
  useEffect(() => {
    const user = AuthService.getCurrentUser();
    setIsAuthenticated(!!user);
    setIsAdmin(AuthService.isAdmin());
  }, []);

  // 加载所有问题数据
  useEffect(() => {
    async function loadAllProblems() {
      setIsLoading(true);
      try {
        // 不传搜索参数，获取所有问题
        const result = await ProblemService.getPaginatedProblems({
          page: 1,
          pageSize: 1000 // 获取足够多的问题
        });
        
        setAllProblems(result.problems);
        
        // 处理URL中的参数
        const page = parseInt(searchParams.get('page') || '1');
        const search = searchParams.get('search') || '';
        setCurrentPage(page);
        setSearchTerm(search);
        
        // 根据搜索词过滤
        filterAndPaginateProblems(result.problems, search, page);
      } catch (error) {
        console.error('加载问题失败:', error);
        setAllProblems([]);
        setFilteredProblems([]);
        setProblems([]);
        setTotalProblems(0);
      } finally {
        setIsLoading(false);
      }
    }
    
    loadAllProblems();
  }, []); // 只在组件挂载时加载一次所有问题
  
  // 处理URL参数变化
  useEffect(() => {
    // 只有当allProblems已经加载时才处理
    if (allProblems.length > 0) {
      const page = parseInt(searchParams.get('page') || '1');
      const search = searchParams.get('search') || '';
      
      setCurrentPage(page);
      setSearchTerm(search);
      
      // 使用已加载的问题数据进行过滤和分页
      filterAndPaginateProblems(allProblems, search, page);
    }
  }, [searchParams, allProblems]);
  
  // 过滤和分页问题
  const filterAndPaginateProblems = (problemList: ProblemWithStatus[], search: string, page: number) => {
    // 过滤问题
    let filtered = problemList;
    
    if (search) {
      const lowerSearch = search.toLowerCase();
      filtered = problemList.filter(problem => 
        (problem.problem_name || problem.problemName || '').toLowerCase().includes(lowerSearch) ||
        (problem.problem_description || problem.problemDescription || '').toLowerCase().includes(lowerSearch)
      );
    }
    
    // 更新总数
    setTotalProblems(filtered.length);
    
    // 分页
    const startIndex = (page - 1) * pageSize;
    const endIndex = startIndex + pageSize;
    const paginatedProblems = filtered.slice(startIndex, endIndex);
    
    setFilteredProblems(filtered);
    setProblems(paginatedProblems);
  };

  // 处理搜索
  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    setIsSearching(true);
    
    // 构建查询参数
    const params = new URLSearchParams();
    params.set('page', '1'); // 搜索时重置到第一页
    if (searchTerm) params.set('search', searchTerm);
    
    // 更新URL，使用shallow选项防止页面重新加载
    router.push(`/practice?${params.toString()}`, { scroll: false });
    setIsSearching(false);
  };

  // 清除所有筛选条件
  const clearSearch = () => {
    setSearchTerm('');
    // 使用shallow选项防止页面重新加载
    router.push('/practice', { scroll: false });
  };

  // 改变页码
  const changePage = (page: number) => {
    const params = new URLSearchParams(searchParams.toString());
    params.set('page', page.toString());
    
    // 使用shallow路由选项，防止页面重新加载
    router.push(`/practice?${params.toString()}`, { scroll: false });
  };

  // 生成分页按钮
  const renderPagination = () => {
    const totalPages = Math.ceil(totalProblems / pageSize);
    const pages = [];
    
    // 添加上一页按钮
    pages.push(
      <button
        key="prev"
        onClick={() => changePage(Math.max(1, currentPage - 1))}
        disabled={currentPage === 1}
        className="px-3 py-1 rounded-md bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-200 disabled:opacity-50 disabled:cursor-not-allowed"
      >
        上一页
      </button>
    );
    
    // 添加页码按钮
    for (let i = 1; i <= totalPages; i++) {
      // 只显示当前页附近的页码和首尾页
      if (
        i === 1 || 
        i === totalPages || 
        (i >= currentPage - 2 && i <= currentPage + 2)
      ) {
        pages.push(
          <button
            key={i}
            onClick={() => changePage(i)}
            className={`px-3 py-1 rounded-md ${
              i === currentPage 
                ? 'bg-blue-600 text-white' 
                : 'bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-200'
            }`}
          >
            {i}
          </button>
        );
      } else if (
        i === currentPage - 3 ||
        i === currentPage + 3
      ) {
        // 添加省略号
        pages.push(
          <span key={i} className="px-2 py-1 text-gray-500 dark:text-gray-400">
            ...
          </span>
        );
      }
    }
    
    // 添加下一页按钮
    pages.push(
      <button
        key="next"
        onClick={() => changePage(Math.min(totalPages, currentPage + 1))}
        disabled={currentPage === totalPages || totalPages === 0}
        className="px-3 py-1 rounded-md bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-200 disabled:opacity-50 disabled:cursor-not-allowed"
      >
        下一页
      </button>
    );
    
    return (
      <div className="flex space-x-2 justify-center mt-6">
        {pages}
      </div>
    );
  };

  // 渲染问题状态标签
  const renderStatusBadge = (status: string | undefined) => {
    if (!status || isAdmin) return null;
    
    const statusInfo = statusMap[status] || statusMap.not_attempted;
    
    return (
      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${statusInfo.color}`}>
        {statusInfo.label}
      </span>
    );
  };

  // 获取问题名称
  const getProblemName = (problem: ProblemWithStatus): string => {
    return problem.problem_name || problem.problemName || '未命名题目';
  };

  // 获取问题标签
  const getProblemTags = (problem: ProblemWithStatus): string[] => {
    if (problem.ques_tag && Array.isArray(problem.ques_tag)) {
      return problem.ques_tag;
    }
    if (problem.tag && Array.isArray(problem.tag)) {
      return problem.tag;
    }
    return [];
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-8 text-gray-900 dark:text-white">在线练习</h1>
      
      {/* 搜索区域 */}
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6 mb-8">
        <form onSubmit={handleSearch} className="mb-4">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-grow">
              <div className="relative">
                <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
                  <svg className="w-4 h-4 text-gray-500 dark:text-gray-400" aria-hidden="true" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 20 20">
                    <path stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="m19 19-4-4m0-7A7 7 0 1 1 1 8a7 7 0 0 1 14 0Z"/>
                  </svg>
                </div>
                <input 
                  type="search" 
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="block w-full p-2.5 pl-10 text-sm text-gray-900 border border-gray-300 rounded-lg bg-white focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500" 
                  placeholder="搜索题目..." 
                />
              </div>
            </div>
            <div className="flex space-x-2">
              <button 
                type="submit" 
                className="w-full md:w-auto text-white bg-blue-600 hover:bg-blue-700 focus:ring-4 focus:outline-none focus:ring-blue-300 font-medium rounded-lg text-sm px-5 py-2.5 dark:bg-blue-500 dark:hover:bg-blue-600 dark:focus:ring-blue-700"
                disabled={isSearching}
              >
                {isSearching ? '搜索中...' : '搜索'}
              </button>
              
              {searchTerm && (
                <button
                  type="button"
                  onClick={clearSearch}
                  className="w-full md:w-auto text-gray-700 bg-gray-200 hover:bg-gray-300 focus:ring-4 focus:outline-none focus:ring-gray-100 font-medium rounded-lg text-sm px-5 py-2.5 dark:bg-gray-600 dark:text-gray-200 dark:hover:bg-gray-500 dark:focus:ring-gray-700"
                >
                  清除
                </button>
              )}
            </div>
          </div>
        </form>
        
        {searchTerm && (
          <p className="text-sm text-gray-600 dark:text-gray-400">
            搜索: <span className="font-medium">{searchTerm}</span>
          </p>
        )}
      </div>
      
      {/* 问题列表 */}
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md overflow-hidden">
        {isLoading ? (
          <div className="flex justify-center items-center p-8">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm text-left text-gray-500 dark:text-gray-400">
              <thead className="text-xs text-gray-700 uppercase bg-gray-50 dark:bg-gray-700 dark:text-gray-400">
                <tr>
                  <th scope="col" className="px-6 py-3 w-16">序号</th>
                  <th scope="col" className="px-6 py-3">标题</th>
                  <th scope="col" className="px-6 py-3">难度</th>
                  <th scope="col" className="px-6 py-3">标签</th>
                  {!isAdmin && isAuthenticated && (
                    <th scope="col" className="px-6 py-3">状态</th>
                  )}
                </tr>
              </thead>
              <tbody>
                {problems.length > 0 ? (
                  problems.map((problem, index) => (
                    <tr key={problem.id} className="bg-white border-b dark:bg-gray-800 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700">
                      <td className="px-6 py-4 font-medium text-gray-900 dark:text-white">
                        {(currentPage - 1) * pageSize + index + 1}
                      </td>
                      <td className="px-6 py-4">
                        <Link 
                          href={`/practice/${problem.id}`}
                          className="font-medium text-blue-600 dark:text-blue-500 hover:underline"
                        >
                          {getProblemName(problem)}
                        </Link>
                      </td>
                      <td className="px-6 py-4">
                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${difficultyMap[problem.difficulty as keyof typeof difficultyMap]?.color || difficultyMap.medium.color}`}>
                          {difficultyMap[problem.difficulty as keyof typeof difficultyMap]?.label || '中等'}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex flex-wrap gap-1">
                          {getProblemTags(problem).length > 0 ? 
                            getProblemTags(problem).map((tag, tagIndex) => {
                              const tagInfo = problemTags.find(t => t.id === tag) || { id: tag, name: tag, color: 'blue' };
                              return (
                                <span key={tagIndex} className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${tagColorMap[tagInfo.color] || tagColorMap.blue}`}>
                                  {tagInfo.name}
                                </span>
                              );
                            }) : (
                              <span className="text-gray-400 dark:text-gray-500">无标签</span>
                            )
                          }
                        </div>
                      </td>
                      {!isAdmin && isAuthenticated && (
                        <td className="px-6 py-4">
                          {renderStatusBadge(problem.status)}
                        </td>
                      )}
                    </tr>
                  ))
                ) : (
                  <tr className="bg-white border-b dark:bg-gray-800 dark:border-gray-700">
                    <td colSpan={isAdmin || !isAuthenticated ? 4 : 5} className="px-6 py-10 text-center text-gray-500 dark:text-gray-400">
                      {searchTerm ? '没有找到匹配的问题' : '暂无问题数据'}
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        )}
      </div>
      
      {/* 分页 */}
      {!isLoading && problems.length > 0 && renderPagination()}
      
      {/* 管理员浮动操作按钮 */}
      {isAdmin && <AdminFloatingButton />}
    </div>
  );
} 